from decimal import Decimal

import pytest
from fastapi import HTTPException

from app.models import BusinessSettings, Product
from app.schemas.order import OrderCreate
from app.services.orders import (
    checkout_links,
    create_order,
    order_share_html,
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


def test_share_page_contains_open_graph_metadata(db):
    product = configured_store(db)
    order, business = create_order(db, order_payload(product, quantity=1, channels=["telegram"]))
    page = order_share_html(order, business, f"http://testserver/orders/{order.public_token}/share")

    assert 'property="og:title"' in page
    assert 'property="og:image"' in page
    assert order.order_number in page


def test_checkout_rejects_insufficient_stock(db):
    product = configured_store(db)
    with pytest.raises(HTTPException) as exc:
        create_order(db, order_payload(product, quantity=11, channels=["telegram"]))
    assert exc.value.status_code == 409
