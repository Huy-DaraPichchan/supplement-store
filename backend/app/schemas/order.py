import uuid
from datetime import datetime
from decimal import Decimal
from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field, field_validator


class Currency(StrEnum):
    USD = "USD"
    KHR = "KHR"


class Channel(StrEnum):
    TELEGRAM = "telegram"
    MESSENGER = "messenger"


class OrderStatus(StrEnum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class OrderItemCreate(BaseModel):
    product_id: uuid.UUID
    quantity: int = Field(ge=1, le=999)


class OrderCreate(BaseModel):
    items: list[OrderItemCreate] = Field(min_length=1, max_length=100)
    display_currency: Currency = Currency.USD
    channels: list[Channel] = Field(min_length=1, max_length=2)

    @field_validator("channels")
    @classmethod
    def channels_must_be_unique(cls, channels: list[Channel]) -> list[Channel]:
        if len(set(channels)) != len(channels):
            raise ValueError("channels must be unique")
        return channels

    @field_validator("items")
    @classmethod
    def products_must_be_unique(cls, items: list[OrderItemCreate]) -> list[OrderItemCreate]:
        ids = [item.product_id for item in items]
        if len(set(ids)) != len(ids):
            raise ValueError("combine duplicate product quantities before checkout")
        return items


class OrderItemResponse(BaseModel):
    product_id: uuid.UUID | None
    product_name: str
    product_sku: str
    image_path: str | None
    image_url: str | None = None
    quantity: int
    unit_price_usd_cents: int
    line_total_usd_cents: int
    unit_price_khr: int
    line_total_khr: int

    model_config = ConfigDict(from_attributes=True)


class OrderResponse(BaseModel):
    id: uuid.UUID
    order_number: str
    public_token: uuid.UUID
    status: OrderStatus
    selected_channels: str
    display_currency: Currency
    exchange_rate: Decimal
    total_usd_cents: int
    total_khr: int
    created_at: datetime
    items: list[OrderItemResponse]

    model_config = ConfigDict(from_attributes=True)


class CheckoutResponse(OrderResponse):
    public_url: str
    prepared_message: str
    preferred_channel: Channel
    preferred_url: str
    fallback_url: str | None = None


class OrderStatusUpdate(BaseModel):
    status: OrderStatus
