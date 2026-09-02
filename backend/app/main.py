from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.config import get_settings
from app.routers.admin import router as admin_router
from app.routers.public import router as public_router


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Importing models here ensures Alembic and development checks share one metadata graph.
    import app.models  # noqa: F401

    yield


settings = get_settings()
app = FastAPI(title=settings.app_name, debug=settings.debug, lifespan=lifespan)
app.include_router(public_router)
app.include_router(admin_router)
