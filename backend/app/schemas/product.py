import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ProductCreate(BaseModel):
    category_id: uuid.UUID | None = None
    name: str = Field(min_length=1, max_length=180)
    slug: str = Field(pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$", max_length=200)
    description: str = ""
    price_usd_cents: int = Field(ge=0)
    stock: int = Field(ge=0)
    is_active: bool = True

    model_config = ConfigDict(extra="forbid")


class ProductUpdate(BaseModel):
    category_id: uuid.UUID | None = None
    name: str | None = Field(default=None, min_length=1, max_length=180)
    slug: str | None = Field(
        default=None, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$", max_length=200
    )
    description: str | None = None
    price_usd_cents: int | None = Field(default=None, ge=0)
    stock: int | None = Field(default=None, ge=0)
    is_active: bool | None = None

    model_config = ConfigDict(extra="forbid")


class ProductResponse(BaseModel):
    id: uuid.UUID
    category_id: uuid.UUID | None
    name: str
    slug: str
    sku: str
    description: str
    price_usd_cents: int
    price_khr: int | None = None
    stock: int
    image_path: str | None
    image_url: str | None = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ImageUploadResponse(BaseModel):
    image_path: str
    public_url: str
