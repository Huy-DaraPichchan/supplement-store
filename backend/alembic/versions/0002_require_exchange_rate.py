"""Require an exchange rate and backfill KHR order snapshots."""

from collections.abc import Sequence
from decimal import Decimal, ROUND_HALF_UP

import sqlalchemy as sa
from alembic import op

revision: str = "0002_require_exchange_rate"
down_revision: str | None = "0001_initial"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

DEFAULT_RATE = Decimal("4000")


def khr_amount(usd_cents: int, rate: Decimal) -> int:
    amount = Decimal(usd_cents) * rate / Decimal(100)
    return int(amount.quantize(Decimal("1"), ROUND_HALF_UP))


def upgrade() -> None:
    connection = op.get_bind()
    business_settings = sa.table(
        "business_settings",
        sa.column("id", sa.Integer()),
        sa.column("usd_to_khr_rate", sa.Numeric(12, 4)),
    )
    orders = sa.table(
        "orders",
        sa.column("id", sa.Uuid()),
        sa.column("exchange_rate", sa.Numeric(12, 4)),
        sa.column("total_khr", sa.Integer()),
    )
    order_items = sa.table(
        "order_items",
        sa.column("id", sa.Uuid()),
        sa.column("order_id", sa.Uuid()),
        sa.column("unit_price_usd_cents", sa.Integer()),
        sa.column("line_total_usd_cents", sa.Integer()),
        sa.column("unit_price_khr", sa.Integer()),
        sa.column("line_total_khr", sa.Integer()),
    )

    connection.execute(
        business_settings.update()
        .where(business_settings.c.usd_to_khr_rate.is_(None))
        .values(usd_to_khr_rate=DEFAULT_RATE)
    )

    order_rows = connection.execute(
        sa.select(orders.c.id, orders.c.exchange_rate, orders.c.total_khr)
    ).mappings().all()
    for order in order_rows:
        rate = Decimal(order["exchange_rate"] or DEFAULT_RATE)
        item_rows = connection.execute(
            sa.select(
                order_items.c.id,
                order_items.c.unit_price_usd_cents,
                order_items.c.line_total_usd_cents,
                order_items.c.unit_price_khr,
                order_items.c.line_total_khr,
            ).where(order_items.c.order_id == order["id"])
        ).mappings().all()
        total_khr = 0
        for item in item_rows:
            unit_khr = item["unit_price_khr"]
            if unit_khr is None:
                unit_khr = khr_amount(item["unit_price_usd_cents"], rate)
            line_khr = item["line_total_khr"]
            if line_khr is None:
                line_khr = khr_amount(item["line_total_usd_cents"], rate)
            total_khr += line_khr
            connection.execute(
                order_items.update()
                .where(order_items.c.id == item["id"])
                .values(unit_price_khr=unit_khr, line_total_khr=line_khr)
            )

        connection.execute(
            orders.update()
            .where(orders.c.id == order["id"])
            .values(
                exchange_rate=rate,
                total_khr=order["total_khr"] if order["total_khr"] is not None else total_khr,
            )
        )

    with op.batch_alter_table("business_settings") as batch_op:
        batch_op.alter_column(
            "usd_to_khr_rate",
            existing_type=sa.Numeric(12, 4),
            nullable=False,
            server_default=sa.text("4000"),
        )
    with op.batch_alter_table("orders") as batch_op:
        batch_op.alter_column(
            "exchange_rate", existing_type=sa.Numeric(12, 4), nullable=False
        )
        batch_op.alter_column("total_khr", existing_type=sa.Integer(), nullable=False)
    with op.batch_alter_table("order_items") as batch_op:
        batch_op.alter_column("unit_price_khr", existing_type=sa.Integer(), nullable=False)
        batch_op.alter_column("line_total_khr", existing_type=sa.Integer(), nullable=False)


def downgrade() -> None:
    with op.batch_alter_table("order_items") as batch_op:
        batch_op.alter_column("line_total_khr", existing_type=sa.Integer(), nullable=True)
        batch_op.alter_column("unit_price_khr", existing_type=sa.Integer(), nullable=True)
    with op.batch_alter_table("orders") as batch_op:
        batch_op.alter_column("total_khr", existing_type=sa.Integer(), nullable=True)
        batch_op.alter_column(
            "exchange_rate", existing_type=sa.Numeric(12, 4), nullable=True
        )
    with op.batch_alter_table("business_settings") as batch_op:
        batch_op.alter_column(
            "usd_to_khr_rate",
            existing_type=sa.Numeric(12, 4),
            nullable=True,
            server_default=None,
        )
