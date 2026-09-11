import uuid

from pydantic import BaseModel, ConfigDict, Field, field_validator


def normalize_sku_prefix(value: object) -> object:
    if isinstance(value, str):
        return value.strip().upper()
    return value


class CategoryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    slug: str = Field(pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$", max_length=140)
    sku_prefix: str = Field(pattern=r"^[A-Z]{2,5}$")
    is_active: bool = True

    _normalize_sku_prefix = field_validator("sku_prefix", mode="before")(normalize_sku_prefix)


class CategoryUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    slug: str | None = Field(
        default=None, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$", max_length=140
    )
    sku_prefix: str | None = Field(default=None, pattern=r"^[A-Z]{2,5}$")
    is_active: bool | None = None

    _normalize_sku_prefix = field_validator("sku_prefix", mode="before")(normalize_sku_prefix)


class CategoryResponse(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    sku_prefix: str | None
    is_active: bool

    model_config = ConfigDict(from_attributes=True)
