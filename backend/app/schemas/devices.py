from datetime import datetime

from pydantic import BaseModel, Field


class DeviceCreate(BaseModel):
    device_uid: str = Field(
        min_length=2,
        max_length=100,
    )

    name: str = Field(
        min_length=2,
        max_length=150,
    )

    device_type: str = Field(
        min_length=2,
        max_length=50,
    )

    ip_address: str | None = Field(
        default=None,
        max_length=45,
    )


class DeviceUpdate(BaseModel):
    name: str | None = Field(
        default=None,
        max_length=150,
    )

    device_type: str | None = Field(
        default=None,
        max_length=50,
    )

    status: str | None = Field(
        default=None,
        max_length=30,
    )

    ip_address: str | None = Field(
        default=None,
        max_length=45,
    )


class DeviceResponse(BaseModel):
    id: int
    device_uid: str
    name: str
    device_type: str
    status: str
    ip_address: str | None
    last_seen_at: datetime | None
    created_at: datetime


class DeviceTokenResponse(BaseModel):
    device_id: int
    device_uid: str
    token: str