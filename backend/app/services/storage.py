import uuid
from functools import lru_cache
from pathlib import Path

from fastapi import HTTPException, UploadFile, status
from supabase import Client, create_client

from app.config import get_settings

ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}
MAX_IMAGE_BYTES = 5 * 1024 * 1024


@lru_cache
def get_supabase_client() -> Client:
    settings = get_settings()
    return create_client(settings.supabase_url, settings.supabase_secret_key)


def public_url(image_path: str | None) -> str | None:
    if not image_path:
        return None
    settings = get_settings()
    return (
        f"{settings.supabase_url.rstrip('/')}/storage/v1/object/public/"
        f"{settings.supabase_storage_bucket}/{image_path}"
    )


def upload_bytes(content: bytes, content_type: str, suffix: str | None = None) -> tuple[str, str]:
    if content_type not in ALLOWED_IMAGE_TYPES:
        raise ValueError("only JPEG, PNG, and WebP images are supported")
    if not content or len(content) > MAX_IMAGE_BYTES:
        raise ValueError("image must be between 1 byte and 5 MB")

    extension = suffix.lower() if suffix else ALLOWED_IMAGE_TYPES[content_type]
    if extension == ".jpeg":
        extension = ".jpg"
    if extension not in {".jpg", ".png", ".webp"}:
        extension = ALLOWED_IMAGE_TYPES[content_type]
    image_path = f"products/{uuid.uuid4()}{extension}"
    settings = get_settings()
    get_supabase_client().storage.from_(settings.supabase_storage_bucket).upload(
        image_path,
        content,
        {"content-type": content_type, "upsert": "false"},
    )
    return image_path, public_url(image_path) or ""


async def upload_product_image(file: UploadFile) -> tuple[str, str]:
    content_type = file.content_type or ""
    try:
        content = await file.read(MAX_IMAGE_BYTES + 1)
        return upload_bytes(content, content_type, Path(file.filename or "").suffix)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc))
    finally:
        await file.close()


def remove_image(image_path: str | None) -> None:
    if not image_path:
        return
    settings = get_settings()
    get_supabase_client().storage.from_(settings.supabase_storage_bucket).remove([image_path])

