from typing import Literal

from pydantic import BaseModel, Field

class UserCreate(BaseModel):
    email: str
    password: str
    role: Literal["user", "admin"] = Field(
        default="user",
        description="Account role; choose admin only when you need to manage catalog data.",
    )

class UserOut(BaseModel):
    id: int
    email: str
    role: Literal["user", "admin"]

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut
