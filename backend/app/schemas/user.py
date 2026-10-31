from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class UserRole(str):
    VICTIM = "victim"
    INVESTIGATOR = "investigator"
    ADMIN = "admin"


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: Literal["victim", "investigator", "admin"] = "victim"


class UserCreate(UserBase):
    password: str = Field(..., min_length=6, description="User password (minimum 6 characters)")
    # username: pseudonymous display identity chosen at registration.
    # Optional to maintain backward compatibility with existing integrations;
    # the register route will enforce uniqueness when provided.
    username: Optional[str] = Field(
        None,
        min_length=2,
        max_length=50,
        description="Chosen display alias (pseudonymous username). Must be unique.",
    )


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(UserBase):
    id: int
    username: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None


class UsernameAvailability(BaseModel):
    username: str
    available: bool
    message: str
