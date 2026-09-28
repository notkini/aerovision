from pydantic import BaseModel, Field


class AdminUserCreate(BaseModel):
    email: str = Field(min_length=3, max_length=255)
    full_name: str = Field(min_length=2, max_length=150)
    password: str = Field(min_length=8, max_length=128)
    role: str = Field(min_length=3, max_length=50)


class AdminUserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    is_active: bool


class AdminUserUpdate(BaseModel):
    is_active: bool | None = None
    role: str | None = None