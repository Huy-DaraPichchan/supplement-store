import uuid

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.models import Admin

bearer = HTTPBearer(auto_error=False)


def get_current_admin(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: Session = Depends(get_db),
) -> Admin:
    error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="invalid or expired admin token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if credentials is None:
        raise error
    settings = get_settings()
    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.secret_key,
            algorithms=[settings.algorithm],
        )
        if payload.get("type") != "admin":
            raise error
        admin_id = uuid.UUID(payload["sub"])
    except (jwt.PyJWTError, KeyError, TypeError, ValueError):
        raise error
    admin = db.get(Admin, admin_id)
    if not admin or not admin.is_active or not admin.is_admin:
        raise error
    return admin
