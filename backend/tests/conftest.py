import os

os.environ["DATABASE_URL"] = "sqlite+pysqlite:///:memory:"
os.environ["DATABASE_BACKEND"] = "postgresql"
os.environ["SECRET_KEY"] = "test-secret-key-that-is-long-enough"
os.environ["SUPABASE_URL"] = "https://example.supabase.co"
os.environ["SUPABASE_SECRET_KEY"] = "test-key"
os.environ["PUBLIC_BASE_URL"] = "http://testserver"

import pytest

from app.database import Base, SessionLocal, engine
from app.models import Admin
from app.services.auth import hash_password


@pytest.fixture(autouse=True)
def clean_database():
    Base.metadata.create_all(engine)
    yield
    Base.metadata.drop_all(engine)


@pytest.fixture
def db():
    with SessionLocal() as session:
        yield session


@pytest.fixture
def admin(db):
    admin = Admin(
        email="admin@example.com",
        password_hash=hash_password("correct-password"),
        is_admin=True,
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return admin
