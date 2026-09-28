from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    email: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=8)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    role: str


class CurrentUserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    is_active: bool