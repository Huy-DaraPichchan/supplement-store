import uuid
from decimal import Decimal, ROUND_HALF_UP
from typing import Annotated, Literal

from fastapi import APIRouter, Depends, Query
from fastapi.responses import RedirectResponse
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import BusinessSettings, Category, Product
from app.schemas.category import CategoryResponse
from app.schemas.order import CheckoutResponse, OrderCreate, OrderResponse
from app.schemas.product import ProductResponse
from app.schemas.settings import BusinessSettingsResponse
from app.services.orders import (
    checkout_links,
    create_order,
    get_business_settings,
    get_order_by_token,
    order_response,
    public_order_url,
)
from app.services.storage import public_url

router = APIRouter()


def product_response(product: Product, rate: Decimal) -> ProductResponse:
    price_khr = int(
        (Decimal(product.price_usd_cents) * rate / 100).quantize(Decimal("1"), ROUND_HALF_UP)
    )
    return ProductResponse(
        id=product.id,
        category_id=product.category_id,
        name=product.name,
        slug=product.slug,
        sku=product.sku,
        description=product.description,
        price_usd_cents=product.price_usd_cents,
        price_khr=price_khr,
        stock=product.stock,
        image_path=product.image_path,
        image_url=public_url(product.image_path),
        is_active=product.is_active,
        created_at=product.created_at,
        updated_at=product.updated_at,
    )


@router.get("/health")
def health(db: Session = Depends(get_db)) -> dict[str, str]:
    db.execute(select(1))
    return {"status": "ok"}


@router.get("/settings", response_model=BusinessSettingsResponse)
def public_settings(db: Session = Depends(get_db)) -> BusinessSettings:
    settings = get_business_settings(db)
    db.commit()
    return settings


@router.get("/categories", response_model=list[CategoryResponse])
def list_categories(db: Session = Depends(get_db)):
    return db.scalars(
        select(Category).where(Category.is_active.is_(True)).order_by(Category.name)
    ).all()


@router.get("/products", response_model=list[ProductResponse])
def list_products(
    category: str | None = None,
    q: Annotated[str | None, Query(max_length=180)] = None,
    sort: Literal["newest", "price_asc", "price_desc"] = "newest",
    in_stock: bool | None = None,
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
):
    statement = select(Product).where(Product.is_active.is_(True))
    if category:
        statement = statement.join(Category).where(Category.slug == category)
    if q and (term := q.strip()):
        pattern = f"%{term}%"
        statement = statement.where(
            or_(
                Product.name.ilike(pattern),
                Product.description.ilike(pattern),
                Product.sku.ilike(pattern),
            )
        )
    if in_stock is True:
        statement = statement.where(Product.stock > 0)

    if sort == "price_asc":
        statement = statement.order_by(
            Product.price_usd_cents.asc(), Product.created_at.desc(), Product.id.asc()
        )
    elif sort == "price_desc":
        statement = statement.order_by(
            Product.price_usd_cents.desc(), Product.created_at.desc(), Product.id.asc()
        )
    else:
        statement = statement.order_by(Product.created_at.desc(), Product.id.asc())

    products = db.scalars(statement.offset(offset).limit(limit)).all()
    settings = get_business_settings(db)
    return [product_response(product, settings.usd_to_khr_rate) for product in products]


@router.get("/products/{slug}", response_model=ProductResponse)
def get_product(slug: str, db: Session = Depends(get_db)):
    product = db.scalar(
        select(Product).where(Product.slug == slug, Product.is_active.is_(True))
    )
    if product is None:
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail="product not found")
    settings = get_business_settings(db)
    return product_response(product, settings.usd_to_khr_rate)


@router.post("/orders", response_model=CheckoutResponse, status_code=201)
def checkout(payload: OrderCreate, db: Session = Depends(get_db)):
    order, business = create_order(db, payload)
    preferred, preferred_url, fallback_url, order_url, message = checkout_links(order, business)
    return CheckoutResponse(
        **order_response(order).model_dump(),
        public_url=order_url,
        prepared_message=message,
        preferred_channel=preferred,
        preferred_url=preferred_url,
        fallback_url=fallback_url,
    )


@router.get("/orders/{token}", response_model=OrderResponse)
def public_order(token: uuid.UUID, db: Session = Depends(get_db)):
    return order_response(get_order_by_token(db, token))


@router.get("/orders/{token}/share", response_class=RedirectResponse)
def share_order(token: uuid.UUID, db: Session = Depends(get_db)):
    order = get_order_by_token(db, token)
    return RedirectResponse(public_order_url(order), status_code=307)
