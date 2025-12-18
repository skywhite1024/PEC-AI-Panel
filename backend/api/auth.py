from datetime import datetime
from uuid import uuid4
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import schemas
from ..models.user import User
from ..models.sms import SmsCode
from ..core.security import (
    verify_password,
    get_password_hash,
    create_access_refresh_tokens,
    decode_refresh_token,
)
from ..deps import get_db, get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=schemas.Token)
def register(payload: schemas.UserCreate, db: Session = Depends(get_db)):
    exists = db.query(User).filter(User.phone == payload.phone).first()
    if exists:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="phone already registered")

    if not payload.password and not payload.sms_code:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="password or sms_code required")

    user = User(id=str(uuid4()), phone=payload.phone, password_hash=None)

    if payload.password:
        try:
            user.password_hash = get_password_hash(payload.password)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    else:
        code = db.query(SmsCode).filter(SmsCode.phone == payload.phone).first()
        if not code or code.code != payload.sms_code:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="invalid sms code")
        if code.expires_at < datetime.utcnow():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="sms code expired")
        db.delete(code)

    db.add(user)
    db.commit()
    db.refresh(user)

    access, refresh = create_access_refresh_tokens(user.id)
    return schemas.Token(access_token=access, refresh_token=refresh)


@router.post("/login", response_model=schemas.Token)
def login(payload: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone == payload.phone).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="user not found")

    if payload.password:
        try:
            if not user.password_hash or not verify_password(payload.password, user.password_hash):
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid phone or password")
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    elif payload.sms_code:
        code = db.query(SmsCode).filter(SmsCode.phone == payload.phone).first()
        if not code or code.code != payload.sms_code:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="invalid sms code")
        if code.expires_at < datetime.utcnow():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="sms code expired")
        db.delete(code)
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="password or sms_code required")

    access, refresh = create_access_refresh_tokens(user.id)
    return schemas.Token(access_token=access, refresh_token=refresh)


@router.post("/refresh", response_model=schemas.Token)
def refresh_token(payload: schemas.RefreshRequest):
    try:
        user_id = decode_refresh_token(payload.refresh_token)
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid refresh token")

    access, refresh = create_access_refresh_tokens(user_id)
    return schemas.Token(access_token=access, refresh_token=refresh)


@router.get("/me", response_model=schemas.UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user
