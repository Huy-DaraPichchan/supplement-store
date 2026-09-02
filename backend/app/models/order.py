import uuid
from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    order_number: Mapped[str] = mapped_column(String(30), unique=True, index=True)
    public_token: Mapped[uuid.UUID] = mapped_column(default=uuid.uuid4, unique=True, index=True)
    status: Mapped[str] = mapped_column(String(20), default="pending", index=True)
    selected_channels: Mapped[str] = mapped_column(String(30))
    display_currency: Mapped[str] = mapped_column(String(3), default="USD")
    exchange_rate: Mapped[Decimal | None] = mapped_column(Numeric(12, 4), nullable=True)
    total_usd_cents: Mapped[int] = mapped_column(Integer)
    total_khr: Mapped[int | None] = mapped_column(Integer, nullable=True)
    inventory_deducted: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    order_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("orders.id", ondelete="CASCADE"), index=True
    )
    product_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("products.id", ondelete="SET NULL"), nullable=True
    )
    product_name: Mapped[str] = mapped_column(String(180))
    product_sku: Mapped[str] = mapped_column(String(80))
    image_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    quantity: Mapped[int] = mapped_column(Integer)
    unit_price_usd_cents: Mapped[int] = mapped_column(Integer)
    line_total_usd_cents: Mapped[int] = mapped_column(Integer)
    unit_price_khr: Mapped[int | None] = mapped_column(Integer, nullable=True)
    line_total_khr: Mapped[int | None] = mapped_column(Integer, nullable=True)

    order = relationship("Order", back_populates="items")
