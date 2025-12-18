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
from ..core.sms import save_code, verify_code, DEFAULT_EXPIRE_MINUTES, MAX_ATTEMPTS
from ..deps import get_db, get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=schemas.Token)
def register(payload: schemas.UserCreate, db: Session = Depends(get_db)):
    exists = db.query(User).filter(User.phone == payload.phone).first()
    if exists:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="phone already registered")

    # 需同时提供密码与短信验证码
    pwd = (payload.password or "").strip() or None
    sms = (payload.sms_code or "").strip() or None

    if not pwd or not sms:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="password and sms_code required")

    if pwd and len(pwd) < 6:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="password too short (min 6 chars)")

    user = User(id=str(uuid4()), phone=payload.phone, password_hash=None)

    try:
        verify_code(db, payload.phone, sms)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    try:
        user.password_hash = get_password_hash(pwd)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    db.add(user)
    db.commit()
    db.refresh(user)
    # 如果用短信注册且成功，记录已在 verify_code 中清理

    access, refresh = create_access_refresh_tokens(user.id)
    return schemas.Token(access_token=access, refresh_token=refresh)


@router.post("/login", response_model=schemas.Token)
def login(payload: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone == payload.phone).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="user not found")

    # 空字符串视为未提供；优先密码登录，只有在未提供密码且提供短信验证码时走短信登录
    pwd = (payload.password or "").strip()
    sms = (payload.sms_code or "").strip()
    pwd = pwd if pwd else None
    sms = sms if sms else None

    if pwd:
        if not user.password_hash:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="password login not set")
        if len(pwd) < 6:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="password too short (min 6 chars)")
        try:
            if not verify_password(pwd, user.password_hash):
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid phone or password")
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    elif sms:
        try:
            verify_code(db, payload.phone, sms)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
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


@router.post("/sms/send", response_model=schemas.SmsSendResponse)
def send_sms(payload: schemas.SmsSendRequest, db: Session = Depends(get_db)):
    # 简化：不接入真实短信，生成验证码写库并返回提示
    code = save_code(db, payload.phone, payload.purpose, expire_minutes=DEFAULT_EXPIRE_MINUTES)
    # 为方便联调，直接返回提示信息；上线应改为固定提示，不回传验证码
    return schemas.SmsSendResponse(
        message=f"dev mode: code={code}, expires in {DEFAULT_EXPIRE_MINUTES} min, max attempts {MAX_ATTEMPTS}",
        expires_in_seconds=DEFAULT_EXPIRE_MINUTES * 60,
    )
