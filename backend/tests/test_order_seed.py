from collections import Counter
from datetime import datetime, timedelta, timezone
from decimal import Decimal

import pytest
from sqlalchemy import func, select
from sqlalchemy.orm import selectinload

from app.cli import seed_orders
from app.models import BusinessSettings, Order, OrderItem, Product
from app.services.orders import khr_amount


def add_seed_prerequisites(db) -> dict[str, int]:
    db.add(BusinessSettings(id=1, usd_to_khr_rate=Decimal("4100")))
    stocks = {}
    for number in range(1, 9):
        product = Product(
            name=f"Seed Product {number}",
            slug=f"seed-product-{number}",
            sku=f"SEED-{number:03d}",
            description="Order seed test product.",
            price_usd_cents=500 + number * 125,
            stock=number * 3,
            is_active=True,
            image_path=f"products/seed-{number}.jpg",
        )
        db.add(product)
        stocks[product.sku] = product.stock
    db.commit()
    return stocks


def test_seed_orders_creates_varied_idempotent_orders_without_changing_stock(db, capsys):
    stocks = add_seed_prerequisites(db)

    seed_orders()
    seed_orders()
    output = capsys.readouterr().out
    db.expire_all()

    assert "Orders: 250/250 (100%) | created: 250 | skipped: 0" in output
    assert "Orders: 250/250 (100%) | created: 0 | skipped: 250" in output

    orders = list(
        db.scalars(
            select(Order).options(selectinload(Order.items)).order_by(Order.order_number)
        ).all()
    )
    assert len(orders) == 250
    assert {order.order_number for order in orders} == {
        f"DEMO-ORD-{number:04d}" for number in range(1, 251)
    }
    assert Counter(order.status for order in orders) == {
        "pending": 88,
        "confirmed": 62,
        "completed": 75,
        "cancelled": 25,
    }
    assert {order.display_currency for order in orders} == {"USD", "KHR"}
    assert {order.selected_channels for order in orders} == {
        "telegram",
        "messenger",
        "telegram,messenger",
    }
    assert len({tuple(item.product_sku for item in order.items) for order in orders}) > 100

    timestamps = [order.created_at.replace(tzinfo=timezone.utc) for order in orders]
    now = datetime.now(timezone.utc)
    assert min(timestamps) >= now - timedelta(days=90)
    assert max(timestamps) <= now
    assert max(timestamps) - min(timestamps) >= timedelta(days=88)

    for order in orders:
        assert 1 <= len(order.items) <= 5
        assert len({item.product_id for item in order.items}) == len(order.items)
        assert all(1 <= item.quantity <= 3 for item in order.items)
        assert all(
            item.line_total_usd_cents == item.unit_price_usd_cents * item.quantity
            for item in order.items
        )
        assert all(
            item.unit_price_khr == khr_amount(item.unit_price_usd_cents, order.exchange_rate)
            and item.line_total_khr == khr_amount(
                item.line_total_usd_cents, order.exchange_rate
            )
            for item in order.items
        )
        assert order.total_usd_cents == sum(item.line_total_usd_cents for item in order.items)
        assert order.total_khr == sum(item.line_total_khr for item in order.items)
        assert order.inventory_deducted is False

    current_stocks = dict(db.execute(select(Product.sku, Product.stock)).all())
    assert current_stocks == stocks
    assert db.scalar(select(func.count()).select_from(OrderItem)) > 250


def test_seed_orders_requires_an_active_product(db):
    with pytest.raises(SystemExit, match="Run `python -m app.cli seed-products` first"):
        seed_orders()
