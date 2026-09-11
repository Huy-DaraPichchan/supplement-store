import pytest
from fastapi import HTTPException
from pydantic import ValidationError

from app.dependencies.auth import get_current_admin
from app.models import Admin, Product, ProductSkuSequence
from app.routers.admin import (
    admin_products,
    create_category,
    create_product,
    login,
    update_category,
    update_product,
)
from app.routers.public import list_products
from app.schemas.admin import AdminLogin
from app.schemas.category import CategoryCreate, CategoryUpdate
from app.schemas.product import ProductCreate, ProductUpdate
from app.services.auth import hash_password


def test_admin_dependency_requires_token(db):
    with pytest.raises(HTTPException) as exc:
        get_current_admin(credentials=None, db=db)
    assert exc.value.status_code == 401


def test_admin_can_create_and_publish_product(db, admin):
    category = create_category(
        CategoryCreate(name="Vitamins", slug="vitamins", sku_prefix="vit", is_active=True),
        admin,
        db,
    )
    product = create_product(
        ProductCreate(
            category_id=category.id,
            name="Vitamin C",
            slug="vitamin-c",
            description="Daily vitamin C",
            price_usd_cents=1250,
            stock=10,
            is_active=True,
        ),
        admin,
        db,
    )
    assert category.sku_prefix == "VIT"
    assert product.sku == "VIT-00001"

    catalog = list_products(category=None, limit=50, offset=0, db=db)
    assert catalog[0].sku == "VIT-00001"


def test_product_skus_use_one_global_sequence_and_grow_past_five_digits(db, admin):
    vitamins = create_category(
        CategoryCreate(name="Vitamins", slug="vitamins", sku_prefix="VIT"), admin, db
    )
    personal_care = create_category(
        CategoryCreate(name="Personal Care", slug="personal-care", sku_prefix="PER"),
        admin,
        db,
    )

    def add_product(name: str, slug: str, category_id=None):
        return create_product(
            ProductCreate(
                category_id=category_id,
                name=name,
                slug=slug,
                price_usd_cents=1000,
                stock=1,
            ),
            admin,
            db,
        )

    assert add_product("Vitamin C", "vitamin-c", vitamins.id).sku == "VIT-00001"
    assert add_product("Hand Cream", "hand-cream", personal_care.id).sku == "PER-00002"
    assert add_product("Gift Bag", "gift-bag").sku == "GEN-00003"

    sequence = db.get(ProductSkuSequence, 1)
    sequence.next_value = 99999
    db.commit()
    assert add_product("Vitamin D", "vitamin-d", vitamins.id).sku == "VIT-99999"
    assert add_product("Vitamin E", "vitamin-e", vitamins.id).sku == "VIT-100000"


def test_sku_is_output_only_and_stays_fixed_when_category_changes(db, admin):
    vitamins = create_category(
        CategoryCreate(name="Vitamins", slug="vitamins", sku_prefix="VIT"), admin, db
    )
    nutrition = create_category(
        CategoryCreate(name="Nutrition", slug="nutrition", sku_prefix="NUT"), admin, db
    )
    product = create_product(
        ProductCreate(
            category_id=vitamins.id,
            name="Protein Mix",
            slug="protein-mix",
            price_usd_cents=1500,
            stock=5,
        ),
        admin,
        db,
    )

    updated = update_product(
        product.id, ProductUpdate(category_id=nutrition.id), admin, db
    )
    assert updated.category_id == nutrition.id
    assert updated.sku == "VIT-00001"

    with pytest.raises(ValidationError):
        ProductCreate(
            name="Manual SKU",
            slug="manual-sku",
            sku="MANUAL-1",
            price_usd_cents=1000,
            stock=1,
        )
    with pytest.raises(ValidationError):
        ProductUpdate(sku="MANUAL-2")


def test_category_prefix_is_reserved_unique_and_locked_after_assignment(db, admin):
    category = create_category(
        CategoryCreate(name="Vitamins", slug="vitamins", sku_prefix="vit"), admin, db
    )
    assert category.sku_prefix == "VIT"

    with pytest.raises(HTTPException) as reserved:
        create_category(
            CategoryCreate(name="General", slug="general", sku_prefix="GEN"), admin, db
        )
    assert reserved.value.status_code == 422

    with pytest.raises(HTTPException) as duplicate:
        create_category(
            CategoryCreate(name="More Vitamins", slug="more-vitamins", sku_prefix="VIT"),
            admin,
            db,
        )
    assert duplicate.value.status_code == 409

    with pytest.raises(HTTPException) as changed:
        update_category(category.id, CategoryUpdate(sku_prefix="NEW"), admin, db)
    assert changed.value.status_code == 409


def test_catalog_search_availability_and_sorting(db):
    db.add_all(
        [
            Product(
                name="Vitamin C",
                slug="vitamin-c",
                sku="VIT-C",
                description="Citrus daily support",
                price_usd_cents=1250,
                stock=10,
                is_active=True,
            ),
            Product(
                name="Mineral Blend",
                slug="mineral-blend",
                sku="MIN-LOW",
                description="Everyday mineral formula",
                price_usd_cents=900,
                stock=0,
                is_active=True,
            ),
            Product(
                name="Premium Minerals",
                slug="premium-minerals",
                sku="MIN-HIGH",
                description="Concentrated mineral formula",
                price_usd_cents=2400,
                stock=5,
                is_active=True,
            ),
        ]
    )
    db.commit()

    matches = list_products(
        q="MINERAL",
        sort="price_desc",
        in_stock=True,
        limit=50,
        offset=0,
        db=db,
    )

    assert [product.sku for product in matches] == ["MIN-HIGH"]

    ascending = list_products(
        sort="price_asc",
        limit=50,
        offset=0,
        db=db,
    )
    assert [product.price_usd_cents for product in ascending] == [900, 1250, 2400]

    first_page = list_products(sort="price_asc", limit=2, offset=0, db=db)
    second_page = list_products(sort="price_asc", limit=2, offset=2, db=db)
    assert [product.id for product in first_page + second_page] == [
        product.id for product in ascending
    ]


def test_admin_product_search_supports_offset_pagination(db, admin):
    for number in range(6):
        db.add(
            Product(
                name=f"Admin Product {number}",
                slug=f"admin-product-{number}",
                sku=f"ADMIN-{number}",
                description="Admin pagination fixture",
                price_usd_cents=1000 + number,
                stock=number,
                is_active=True,
            )
        )
    db.commit()

    first_page = admin_products(search="ADMIN", limit=2, offset=0, _=admin, db=db)
    middle_page = admin_products(search="ADMIN", limit=2, offset=2, _=admin, db=db)
    final_page = admin_products(search="ADMIN", limit=2, offset=4, _=admin, db=db)
    empty_page = admin_products(search="ADMIN", limit=2, offset=6, _=admin, db=db)

    page_ids = [product.id for product in first_page + middle_page + final_page]
    assert len(page_ids) == 6
    assert len(set(page_ids)) == 6
    assert empty_page == []


def test_login_returns_token(db):
    db.add(Admin(email="owner@example.com", password_hash=hash_password("right-password")))
    db.commit()
    response = login(AdminLogin(email="owner@example.com", password="right-password"), db)
    assert response.token_type == "bearer"
    assert response.access_token


def test_login_rejects_wrong_password(db):
    db.add(Admin(email="owner@example.com", password_hash=hash_password("right-password")))
    db.commit()
    with pytest.raises(HTTPException) as exc:
        login(AdminLogin(email="owner@example.com", password="wrong-password"), db)
    assert exc.value.status_code == 401
