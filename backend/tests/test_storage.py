import pytest

from app.services.storage import upload_bytes


def test_upload_rejects_unsupported_content_type():
    with pytest.raises(ValueError, match="only JPEG"):
        upload_bytes(b"not-an-image", "text/plain")


def test_upload_returns_path_and_public_url(monkeypatch):
    calls = []

    class Bucket:
        def upload(self, path, content, options):
            calls.append((path, content, options))

    class Storage:
        def from_(self, _bucket):
            return Bucket()

    class Supabase:
        storage = Storage()

    monkeypatch.setattr("app.services.storage.get_supabase_client", lambda: Supabase())
    path, url = upload_bytes(b"small-image", "image/jpeg", ".jpg")
    assert path.startswith("products/") and path.endswith(".jpg")
    assert url.endswith(path)
    assert calls[0][1] == b"small-image"
