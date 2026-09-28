from pydantic import BaseModel, Field


class CameraCreate(BaseModel):
    device_id: int
    name: str = Field(min_length=2, max_length=150)
    source: str = Field(min_length=1, max_length=255)
    width: int | None = Field(default=None, ge=1, le=7680)
    height: int | None = Field(default=None, ge=1, le=4320)


class CameraUpdate(BaseModel):
    name: str | None = Field(default=None, max_length=150)
    source: str | None = Field(default=None, max_length=255)
    status: str | None = Field(default=None, max_length=30)
    width: int | None = Field(default=None, ge=1, le=7680)
    height: int | None = Field(default=None, ge=1, le=4320)


class CameraResponse(BaseModel):
    id: int
    device_id: int
    name: str
    source: str
    status: str
    width: int | None
    height: int | None