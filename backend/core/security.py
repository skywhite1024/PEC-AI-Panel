from datetime import datetime, timedelta
from typing import Optional
from jose import jwt, JWTError
from passlib.context import CryptContext
from .config import settings

pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def ensure_password_length(password: str) -> None:
    if password is None:
        return
    if len(password.encode("utf-8")) > 72:
        raise ValueError("password too long for bcrypt (max 72 bytes)")


def get_password_hash(password: str) -> str:
    ensure_password_length(password)
    return pwd_context.hash(password)


def create_token(data: dict, expires_minutes: int) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=expires_minutes)
    to_encode.update({'exp': expire})
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)


def create_access_refresh_tokens(user_id: str) -> tuple[str, str]:
    access = create_token({'sub': user_id, 'type': 'access'}, settings.access_token_expire_minutes)
    refresh = create_token({'sub': user_id, 'type': 'refresh'}, settings.refresh_token_expire_minutes)
    return access, refresh


def decode_refresh_token(token: str) -> str:
    payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
    if payload.get("type") != "refresh":
        raise JWTError("invalid token type")
    user_id = payload.get("sub")
    if not user_id:
        raise JWTError("missing subject")
    return user_id
