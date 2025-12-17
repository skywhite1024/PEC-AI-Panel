from datetime import datetime, timedelta
from typing import Optional
from jose import jwt
from passlib.context import CryptContext
from .config import settings

pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
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

