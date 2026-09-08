from decimal import Decimal
from urllib.parse import parse_qs, urlparse

import pytest
from fastapi import HTTPException
from sqlalchemy import func, select

from app.models import BusinessSettings, Order, OrderItem, Product
from app.routers.public import share_order
from app.schemas.order import OrderCreate
from app.schemas.settings import BusinessSettingsUpdate
from app.services.orders import (
    checkout_links,
    create_order,
    get_business_settings,
    order_response,
    update_order_status,
)


def configured_store(db):
    settings = BusinessSettings(
        id=1,
        company_name="Test Store",
        telegram_username="test_seller",
        telegram_enabled=True,
        messenger_url="https://m.me/test.seller",
        messenger_enabled=True,
        usd_to_khr_rate=Decimal("4100"),
    )
    product = Product(
        name="Vitamin C",
        slug="vitamin-c",
        sku="VIT-C",
        description="Test product",
        price_usd_cents=1250,
        stock=10,
        is_active=True,
        image_path="products/example.jpg",
    )
    db.add_all([settings, product])
    db.commit()
    db.refresh(product)
    return product


def order_payload(product, quantity=2, currency="KHR", channels=None):
    return OrderCreate.model_validate(
        {
            "items": [{"product_id": str(product.id), "quantity": quantity}],
            "display_currency": currency,
            "channels": channels or ["telegram", "messenger"],
        }
    )


def test_checkout_snapshots_totals_and_prefers_telegram(db):
    product = configured_store(db)
    order, business = create_order(db, order_payload(product))
    preferred, preferred_url, fallback_url, _, message = checkout_links(order, business)

    assert order.total_usd_cents == 2500
    assert order.total_khr == 102500
    assert preferred.value == "telegram"
    assert fallback_url == "https://m.me/test.seller"
    assert "Vitamin%20C" in preferred_url
    assert order.order_number in message
    assert "Total: ៛102,500 ($25.00)" in message


def test_multi_item_checkout_creates_one_order_and_complete_telegram_draft(db):
    first = configured_store(db)
    second = Product(
        name="Magnesium Gummies",
        slug="magnesium-gummies",
        sku="MAG-GUM",
        description="Second test product",
        price_usd_cents=875,
        stock=8,
        is_active=True,
        image_path="products/magnesium.jpg",
    )
    db.add(second)
    db.commit()
    db.refresh(second)

    payload = OrderCreate.model_validate(
        {
            "items": [
                {"product_id": str(first.id), "quantity": 2},
                {"product_id": str(second.id), "quantity": 3},
            ],
            "display_currency": "USD",
            "channels": ["telegram"],
        }
    )
    order, business = create_order(db, payload)
    _, telegram_url, _, order_url, message = checkout_links(order, business)
    parsed = urlparse(telegram_url)

    assert db.scalar(select(func.count()).select_from(Order)) == 1
    assert db.scalar(select(func.count()).select_from(OrderItem)) == 2
    assert order.total_usd_cents == 5125
    assert [item.unit_price_usd_cents for item in order.items] == [1250, 875]
    assert parsed.netloc == "t.me"
    assert parsed.path == "/test_seller"
    assert parse_qs(parsed.query)["text"] == [message]
    assert "Vitamin C × 2 — $25.00" in message
    assert "Magnesium Gummies × 3 — $26.25" in message
    assert "Total: $51.25 (៛210,125)" in message
    assert message.endswith(f"Order details:\n{order_url}")
    assert order_url == f"http://testserver/orders/{order.public_token}"


def test_exchange_rate_defaults_to_4000_and_cannot_be_null(db):
    settings = get_business_settings(db)
    db.commit()

    assert settings.usd_to_khr_rate == Decimal("4000")
    with pytest.raises(ValueError):
        BusinessSettingsUpdate.model_validate({"usd_to_khr_rate": None})


def test_confirm_deducts_and_cancel_restores_stock(db):
    product = configured_store(db)
    order, _ = create_order(
        db, order_payload(product, quantity=3, currency="USD", channels=["telegram"])
    )

    confirmed = update_order_status(db, order.id, "confirmed")
    assert confirmed.status == "confirmed"
    db.refresh(product)
    assert product.stock == 7

    cancelled = update_order_status(db, order.id, "cancelled")
    assert cancelled.status == "cancelled"
    db.refresh(product)
    assert product.stock == 10


def test_legacy_share_redirects_to_frontend_order_page(db):
    product = configured_store(db)
    order, _ = create_order(
        db, order_payload(product, quantity=1, currency="USD", channels=["telegram"])
    )
    response = share_order(order.public_token, db)

    assert response.status_code == 307
    assert response.headers["location"] == f"http://testserver/orders/{order.public_token}"


def test_order_response_includes_public_item_image_url(db):
    product = configured_store(db)
    order, _ = create_order(
        db, order_payload(product, quantity=1, currency="USD", channels=["telegram"])
    )

    response = order_response(order)

    assert response.items[0].image_url
    assert response.items[0].image_url.endswith("/products/example.jpg")


def test_checkout_rejects_insufficient_stock(db):
    product = configured_store(db)
    with pytest.raises(HTTPException) as exc:
        create_order(db, order_payload(product, quantity=11, channels=["telegram"]))
    assert exc.value.status_code == 409
    assert db.scalar(select(func.count()).select_from(Order)) == 0
