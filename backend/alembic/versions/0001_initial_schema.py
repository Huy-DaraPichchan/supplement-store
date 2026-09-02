"""Initial e-commerce schema."""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0001_initial"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "admins",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("email", sa.String(320), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("is_admin", sa.Boolean(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_admins_email", "admins", ["email"], unique=True)
    op.create_table(
        "business_settings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("company_name", sa.String(180), nullable=False),
        sa.Column("company_summary", sa.Text(), nullable=False),
        sa.Column("address", sa.String(300), nullable=False),
        sa.Column("phone", sa.String(80), nullable=False),
        sa.Column("email", sa.String(320), nullable=False),
        sa.Column("logo_url", sa.String(500), nullable=True),
        sa.Column("telegram_username", sa.String(100), nullable=True),
        sa.Column("messenger_url", sa.String(500), nullable=True),
        sa.Column("telegram_enabled", sa.Boolean(), nullable=False),
        sa.Column("messenger_enabled", sa.Boolean(), nullable=False),
        sa.Column("usd_to_khr_rate", sa.Numeric(12, 4), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "categories",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("name", sa.String(120), nullable=False),
        sa.Column("slug", sa.String(140), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )
    op.create_index("ix_categories_slug", "categories", ["slug"], unique=True)
    op.create_table(
        "products",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("category_id", sa.Uuid(), nullable=True),
        sa.Column("name", sa.String(180), nullable=False),
        sa.Column("slug", sa.String(200), nullable=False),
        sa.Column("sku", sa.String(80), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("price_usd_cents", sa.Integer(), nullable=False),
        sa.Column("stock", sa.Integer(), nullable=False),
        sa.Column("image_path", sa.String(500), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["category_id"], ["categories.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_products_category_id", "products", ["category_id"])
    op.create_index("ix_products_created_at", "products", ["created_at"])
    op.create_index("ix_products_is_active", "products", ["is_active"])
    op.create_index("ix_products_sku", "products", ["sku"], unique=True)
    op.create_index("ix_products_slug", "products", ["slug"], unique=True)
    op.create_table(
        "orders",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("order_number", sa.String(30), nullable=False),
        sa.Column("public_token", sa.Uuid(), nullable=False),
        sa.Column("status", sa.String(20), nullable=False),
        sa.Column("selected_channels", sa.String(30), nullable=False),
        sa.Column("display_currency", sa.String(3), nullable=False),
        sa.Column("exchange_rate", sa.Numeric(12, 4), nullable=True),
        sa.Column("total_usd_cents", sa.Integer(), nullable=False),
        sa.Column("total_khr", sa.Integer(), nullable=True),
        sa.Column("inventory_deducted", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_orders_created_at", "orders", ["created_at"])
    op.create_index("ix_orders_order_number", "orders", ["order_number"], unique=True)
    op.create_index("ix_orders_public_token", "orders", ["public_token"], unique=True)
    op.create_index("ix_orders_status", "orders", ["status"])
    op.create_table(
        "order_items",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("order_id", sa.Uuid(), nullable=False),
        sa.Column("product_id", sa.Uuid(), nullable=True),
        sa.Column("product_name", sa.String(180), nullable=False),
        sa.Column("product_sku", sa.String(80), nullable=False),
        sa.Column("image_path", sa.String(500), nullable=True),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("unit_price_usd_cents", sa.Integer(), nullable=False),
        sa.Column("line_total_usd_cents", sa.Integer(), nullable=False),
        sa.Column("unit_price_khr", sa.Integer(), nullable=True),
        sa.Column("line_total_khr", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(["order_id"], ["orders.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_order_items_order_id", "order_items", ["order_id"])


def downgrade() -> None:
    op.drop_table("order_items")
    op.drop_table("orders")
    op.drop_table("products")
    op.drop_table("categories")
    op.drop_table("business_settings")
    op.drop_table("admins")
