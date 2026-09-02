from decimal import Decimal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class BusinessSettingsUpdate(BaseModel):
    company_name: str | None = Field(default=None, min_length=1, max_length=180)
    company_summary: str | None = None
    address: str | None = Field(default=None, max_length=300)
    phone: str | None = Field(default=None, max_length=80)
    email: EmailStr | None = None
    logo_url: str | None = Field(default=None, max_length=500)
    telegram_username: str | None = Field(default=None, max_length=100)
    messenger_url: str | None = Field(default=None, max_length=500)
    telegram_enabled: bool | None = None
    messenger_enabled: bool | None = None
    usd_to_khr_rate: Decimal | None = Field(default=None, gt=0)


class BusinessSettingsResponse(BaseModel):
    company_name: str
    company_summary: str
    address: str
    phone: str
    email: str
    logo_url: str | None
    telegram_username: str | None
    messenger_url: str | None
    telegram_enabled: bool
    messenger_enabled: bool
    usd_to_khr_rate: Decimal | None
    default_currency: str = "USD"

    model_config = ConfigDict(from_attributes=True)

