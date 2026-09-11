import uuid

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy import or_, select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from app.database import get_db
from app.dependencies.auth import get_current_admin
from app.models import Admin, BusinessSettings, Category, Order, Product, ProductSkuSequence
from app.schemas.admin import AdminLogin, TokenResponse
from app.schemas.category import CategoryCreate, CategoryResponse, CategoryUpdate
from app.schemas.order import OrderResponse, OrderStatusUpdate
from app.schemas.product import ImageUploadResponse, ProductCreate, ProductResponse, ProductUpdate
from app.schemas.settings import BusinessSettingsResponse, BusinessSettingsUpdate
from app.services.auth import create_access_token, verify_password
from app.services.orders import (
    get_business_settings,
    get_order_by_id,
    order_response,
    update_order_status,
)
from app.services.storage import public_url, remove_image, upload_product_image

router = APIRouter(prefix="/admin", tags=["admin"])


def integrity_conflict(db: Session, exc: IntegrityError) -> None:
    db.rollback()
    raise HTTPException(
        status_code=409,
        detail="a record with that name, slug, SKU prefix, SKU, or email already exists",
    ) from exc


def product_response(product: Product) -> ProductResponse:
    return ProductResponse.model_validate(product).model_copy(
        update={"image_url": public_url(product.image_path)}
    )


def allocate_product_sku(db: Session, prefix: str) -> str:
    next_value = db.scalar(
        update(ProductSkuSequence)
        .where(ProductSkuSequence.id == 1)
        .values(next_value=ProductSkuSequence.next_value + 1)
        .returning(ProductSkuSequence.next_value)
    )
    if next_value is None:
        raise HTTPException(status_code=500, detail="product SKU sequence is not initialized")
    return f"{prefix}-{next_value - 1:05d}"


@router.post("/login", response_model=TokenResponse)
def login(payload: AdminLogin, db: Session = Depends(get_db)) -> TokenResponse:
    admin = db.scalar(select(Admin).where(Admin.email == payload.email.lower()))
    if not admin or not admin.is_active or not verify_password(payload.password, admin.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="invalid email or password",
        )
    return TokenResponse(access_token=create_access_token(str(admin.id)))


@router.get("/categories", response_model=list[CategoryResponse])
def admin_categories(_: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    return db.scalars(select(Category).order_by(Category.name)).all()


@router.post("/categories", response_model=CategoryResponse, status_code=201)
def create_category(
    payload: CategoryCreate,
    _: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    if payload.sku_prefix == "GEN":
        raise HTTPException(status_code=422, detail="GEN is reserved for uncategorized products")
    category = Category(**payload.model_dump())
    db.add(category)
    try:
        db.commit()
    except IntegrityError as exc:
        integrity_conflict(db, exc)
    db.refresh(category)
    return category


@router.patch("/categories/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: uuid.UUID,
    payload: CategoryUpdate,
    _: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    category = db.get(Category, category_id)
    if category is None:
        raise HTTPException(status_code=404, detail="category not found")
    values = payload.model_dump(exclude_unset=True)
    if "sku_prefix" in values:
        prefix = values["sku_prefix"]
        if prefix is None:
            raise HTTPException(status_code=422, detail="a category SKU prefix cannot be cleared")
        if prefix == "GEN":
            raise HTTPException(status_code=422, detail="GEN is reserved for uncategorized products")
        if category.sku_prefix is not None and prefix != category.sku_prefix:
            raise HTTPException(status_code=409, detail="a category SKU prefix cannot be changed")
    for key, value in values.items():
        setattr(category, key, value)
    try:
        db.commit()
    except IntegrityError as exc:
        integrity_conflict(db, exc)
    db.refresh(category)
    return category


@router.delete("/categories/{category_id}", status_code=204)
def delete_category(
    category_id: uuid.UUID,
    _: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    category = db.get(Category, category_id)
    if category is None:
        raise HTTPException(status_code=404, detail="category not found")
    db.delete(category)
    db.commit()


@router.get("/products", response_model=list[ProductResponse])
def admin_products(
    search: str | None = None,
    limit: int = Query(default=100, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    _: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    statement = (
        select(Product)
        .order_by(Product.created_at.desc(), Product.id)
        .offset(offset)
        .limit(limit)
    )
    if search:
        statement = statement.where(
            or_(Product.name.ilike(f"%{search}%"), Product.sku.ilike(f"%{search}%"))
        )
    return [product_response(product) for product in db.scalars(statement).all()]


@router.post("/products", response_model=ProductResponse, status_code=201)
def create_product(
    payload: ProductCreate,
    _: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    category = db.get(Category, payload.category_id) if payload.category_id else None
    if payload.category_id and category is None:
        raise HTTPException(status_code=422, detail="category not found")
    if category is not None and category.sku_prefix is None:
        raise HTTPException(status_code=422, detail="category needs an SKU prefix")
    sku = allocate_product_sku(db, category.sku_prefix if category else "GEN")
    product = Product(**payload.model_dump(), sku=sku)
    db.add(product)
    try:
        db.commit()
    except IntegrityError as exc:
        integrity_conflict(db, exc)
    db.refresh(product)
    return product_response(product)


@router.get("/products/{product_id}", response_model=ProductResponse)
def get_admin_product(
    product_id: uuid.UUID,
    _: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    product = db.get(Product, product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="product not found")
    return product_response(product)


@router.patch("/products/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: uuid.UUID,
    payload: ProductUpdate,
    _: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    product = db.get(Product, product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="product not found")
    values = payload.model_dump(exclude_unset=True)
    if values.get("category_id") and db.get(Category, values["category_id"]) is None:
        raise HTTPException(status_code=422, detail="category not found")
    for key, value in values.items():
        setattr(product, key, value)
    try:
        db.commit()
    except IntegrityError as exc:
        integrity_conflict(db, exc)
    db.refresh(product)
    return product_response(product)


@router.delete("/products/{product_id}", status_code=204)
def delete_product(
    product_id: uuid.UUID,
    _: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    product = db.get(Product, product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="product not found")
    image_path = product.image_path
    db.delete(product)
    db.commit()
    try:
        remove_image(image_path)
    except Exception:
        pass


@router.post("/products/{product_id}/image", response_model=ImageUploadResponse)
async def upload_image(
    product_id: uuid.UUID,
    file: UploadFile = File(...),
    _: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    product = db.get(Product, product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="product not found")
    old_path = product.image_path
    image_path, image_url = await upload_product_image(file)
    product.image_path = image_path
    try:
        db.commit()
    except Exception:
        db.rollback()
        try:
            remove_image(image_path)
        finally:
            raise
    if old_path:
        try:
            remove_image(old_path)
        except Exception:
            pass
    return ImageUploadResponse(image_path=image_path, public_url=image_url)


@router.get("/settings", response_model=BusinessSettingsResponse)
def admin_settings(_: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    settings = get_business_settings(db)
    db.commit()
    return settings


@router.patch("/settings", response_model=BusinessSettingsResponse)
def update_settings(
    payload: BusinessSettingsUpdate,
    _: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    settings = get_business_settings(db)
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(settings, key, value)
    if settings.telegram_enabled and not settings.telegram_username:
        raise HTTPException(status_code=422, detail="telegram_username is required when enabled")
    if settings.messenger_enabled and not settings.messenger_url:
        raise HTTPException(status_code=422, detail="messenger_url is required when enabled")
    db.commit()
    db.refresh(settings)
    return settings


@router.get("/orders", response_model=list[OrderResponse])
def list_orders(
    order_status: str | None = Query(default=None, alias="status"),
    limit: int = Query(default=100, ge=1, le=200),
    _: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    statement = (
        select(Order)
        .options(selectinload(Order.items))
        .order_by(Order.created_at.desc())
        .limit(limit)
    )
    if order_status:
        statement = statement.where(Order.status == order_status)
    return [order_response(order) for order in db.scalars(statement).all()]


@router.get("/orders/{order_id}", response_model=OrderResponse)
def admin_order(
    order_id: uuid.UUID,
    _: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    return order_response(get_order_by_id(db, order_id))


@router.patch("/orders/{order_id}/status", response_model=OrderResponse)
def change_order_status(
    order_id: uuid.UUID,
    payload: OrderStatusUpdate,
    _: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    return order_response(update_order_status(db, order_id, payload.status.value))
