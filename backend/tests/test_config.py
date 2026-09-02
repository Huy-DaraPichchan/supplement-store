import pytest
from pydantic import ValidationError

from app.config import Settings


def settings_for(**overrides) -> Settings:
    values = {
        "database_backend": "sqlite",
        "database_url": None,
        "sqlite_path": ":memory:",
        "secret_key": "test-secret",
        "supabase_url": "https://example.supabase.co",
        "supabase_secret_key": "test-storage-key",
    }
    values.update(overrides)
    return Settings(_env_file=None, **values)


def test_sqlite_memory_url():
    settings = settings_for()
    assert settings.sqlalchemy_database_url == "sqlite+pysqlite:///:memory:"


def test_sqlite_file_url():
    settings = settings_for(sqlite_path="/data/ecommerce.db")
    assert settings.sqlalchemy_database_url == "sqlite+pysqlite:////data/ecommerce.db"


def test_postgresql_url_uses_psycopg3():
    settings = settings_for(
        database_backend="postgresql",
        database_url="postgresql://postgres:password@db.example.com:5432/postgres",
    )
    assert settings.sqlalchemy_database_url.startswith("postgresql+psycopg://")


def test_postgresql_requires_database_url():
    with pytest.raises(ValidationError, match="DATABASE_URL is required"):
        settings_for(database_backend="postgresql", database_url=None)
