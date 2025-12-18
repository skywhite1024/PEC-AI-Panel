from pydantic import BaseModel, Field
from typing import Optional

class UserCreate(BaseModel):
    phone: str = Field(..., min_length=5, max_length=20)
    password: Optional[str] = Field(default=None)
    # 验证码长度在业务逻辑中校验，允许为空（逻辑层处理）
    sms_code: Optional[str] = Field(default=None)

class UserLogin(BaseModel):
    phone: str = Field(..., min_length=5, max_length=20)
    password: Optional[str] = Field(default=None)
    sms_code: Optional[str] = Field(default=None)

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


class SmsSendRequest(BaseModel):
    phone: str
    purpose: str = "login"  # login/register/reset


class SmsSendResponse(BaseModel):
    message: str
    expires_in_seconds: int = 300
