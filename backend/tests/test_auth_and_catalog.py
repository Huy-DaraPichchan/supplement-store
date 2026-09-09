import pytest
from fastapi import HTTPException

from app.dependencies.auth import get_current_admin
from app.models import Admin, Product
from app.routers.admin import admin_products, create_category, create_product, login
from app.routers.public import list_products
from app.schemas.admin import AdminLogin
from app.schemas.category import CategoryCreate
from app.schemas.product import ProductCreate
from app.services.auth import hash_password


def test_admin_dependency_requires_token(db):
    with pytest.raises(HTTPException) as exc:
        get_current_admin(credentials=None, db=db)
    assert exc.value.status_code == 401


def test_admin_can_create_and_publish_product(db, admin):
    category = create_category(
        CategoryCreate(name="Vitamins", slug="vitamins", is_active=True), admin, db
    )
    product = create_product(
        ProductCreate(
            category_id=category.id,
            name="Vitamin C",
            slug="vitamin-c",
            sku="VIT-C",
            description="Daily vitamin C",
            price_usd_cents=1250,
            stock=10,
            is_active=True,
        ),
        admin,
        db,
    )
    assert product.sku == "VIT-C"

    catalog = list_products(category=None, limit=50, offset=0, db=db)
    assert catalog[0].sku == "VIT-C"


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
