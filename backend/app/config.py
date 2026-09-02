from functools import lru_cache
from typing import Literal

from pydantic import AliasChoices, Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "ecommerce-supplement-api"
    app_env: str = "development"
    debug: bool = False

    database_backend: Literal["sqlite", "postgresql"] = "postgresql"
    database_url: str | None = None
    sqlite_path: str = "./ecommerce.db"
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    supabase_url: str
    supabase_secret_key: str = Field(
        validation_alias=AliasChoices("SUPABASE_SECRET_KEY", "SUPABASE_KEY")
    )
    supabase_storage_bucket: str = "product-images"
    public_base_url: str = "http://localhost:8000"

    @field_validator("database_url", mode="before")
    @classmethod
    def use_psycopg3_driver(cls, value: str | None) -> str | None:
        if value and value.startswith("postgresql://"):
            return value.replace("postgresql://", "postgresql+psycopg://", 1)
        return value

    @model_validator(mode="after")
    def validate_database_configuration(self) -> "Settings":
        if self.database_backend == "postgresql" and not self.database_url:
            raise ValueError("DATABASE_URL is required when DATABASE_BACKEND=postgresql")
        if self.database_backend == "sqlite" and not self.sqlite_path.strip():
            raise ValueError("SQLITE_PATH is required when DATABASE_BACKEND=sqlite")
        return self

    @property
    def sqlalchemy_database_url(self) -> str:
        if self.database_backend == "postgresql":
            assert self.database_url is not None
            return self.database_url
        if self.sqlite_path == ":memory:":
            return "sqlite+pysqlite:///:memory:"
        return f"sqlite+pysqlite:///{self.sqlite_path}"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
        populate_by_name=True,
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
