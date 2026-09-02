from decimal import Decimal

from sqlalchemy import Boolean, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class BusinessSettings(Base):
    __tablename__ = "business_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    company_name: Mapped[str] = mapped_column(String(180), default="Demo Supplement Store")
    company_summary: Mapped[str] = mapped_column(Text, default="")
    address: Mapped[str] = mapped_column(String(300), default="")
    phone: Mapped[str] = mapped_column(String(80), default="")
    email: Mapped[str] = mapped_column(String(320), default="")
    logo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    telegram_username: Mapped[str | None] = mapped_column(String(100), nullable=True)
    messenger_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    telegram_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    messenger_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    usd_to_khr_rate: Mapped[Decimal | None] = mapped_column(Numeric(12, 4), nullable=True)

