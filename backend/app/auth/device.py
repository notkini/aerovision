import hashlib
import secrets

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import Device


def generate_device_token() -> str:
    return "avd_" + secrets.token_urlsafe(32)


def hash_device_token(token: str) -> str:
    return hashlib.sha256(
        token.encode("utf-8")
    ).hexdigest()


def get_authenticated_device(
    x_aerovision_device_token: str | None = Header(
        default=None,
        alias="X-AeroVision-Device-Token",
    ),
    db: Session = Depends(get_db),
) -> Device:

    if not x_aerovision_device_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Device token is required.",
        )

    token_hash = hash_device_token(
        x_aerovision_device_token
    )

    device = db.scalar(
        select(Device).where(
            Device.api_key_hash == token_hash
        )
    )

    if device is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid device token.",
        )

    return device