"""Add category SKU prefixes and an automatic product SKU sequence."""

import re
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0003_automatic_product_skus"
down_revision: str | None = "0002_require_exchange_rate"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

KNOWN_PREFIXES = {
    "vitamins-supplements": "VIT",
    "food-nutrition": "NUT",
    "personal-care": "PER",
}
GENERATED_SKU = re.compile(r"^[A-Z]{2,5}-(\d{5,})$")


def upgrade() -> None:
    op.add_column("categories", sa.Column("sku_prefix", sa.String(5), nullable=True))
    op.create_index("ix_categories_sku_prefix", "categories", ["sku_prefix"], unique=True)
    op.create_table(
        "product_sku_sequences",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("next_value", sa.Integer(), nullable=False),
        sa.CheckConstraint("next_value >= 1", name="ck_product_sku_sequence_positive"),
        sa.PrimaryKeyConstraint("id"),
    )

    connection = op.get_bind()
    categories = sa.table(
        "categories",
        sa.column("slug", sa.String()),
        sa.column("sku_prefix", sa.String()),
    )
    products = sa.table("products", sa.column("sku", sa.String()))
    sequence = sa.table(
        "product_sku_sequences",
        sa.column("id", sa.Integer()),
        sa.column("next_value", sa.Integer()),
    )

    for slug, prefix in KNOWN_PREFIXES.items():
        connection.execute(
            categories.update().where(categories.c.slug == slug).values(sku_prefix=prefix)
        )

    highest_number = 0
    for sku in connection.execute(sa.select(products.c.sku)).scalars():
        match = GENERATED_SKU.fullmatch(sku)
        if match:
            highest_number = max(highest_number, int(match.group(1)))
    connection.execute(sequence.insert().values(id=1, next_value=highest_number + 1))


def downgrade() -> None:
    op.drop_table("product_sku_sequences")
    op.drop_index("ix_categories_sku_prefix", table_name="categories")
    with op.batch_alter_table("categories") as batch_op:
        batch_op.drop_column("sku_prefix")
