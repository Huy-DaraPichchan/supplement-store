import pytest
from fastapi import HTTPException

from app.dependencies.auth import get_current_admin
from app.models import Admin
from app.routers.admin import create_category, create_product, login
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
