from pydantic import BaseModel, Field
from typing import Optional

class UserCreate(BaseModel):
    phone: str = Field(..., min_length=5, max_length=20)
    password: Optional[str] = Field(default=None, min_length=6, max_length=64)
    sms_code: Optional[str] = Field(default=None, min_length=4, max_length=6)

class UserLogin(BaseModel):
    phone: str = Field(..., min_length=5, max_length=20)
    password: Optional[str] = Field(default=None, min_length=6, max_length=64)
    sms_code: Optional[str] = Field(default=None, min_length=4, max_length=6)

class UserOut(BaseModel):
    id: str
    phone: str
    is_active: bool

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = 'bearer'


class RefreshRequest(BaseModel):
    refresh_token: str
