from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import uuid4
from datetime import datetime, timedelta

from .. import schemas
from ..db import SessionLocal
from ..models.user import User
from ..models.sms import SmsCode
from ..core.security import verify_password, get_password_hash, create_access_refresh_tokens

router = APIRouter(prefix='/auth', tags=['auth'])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post('/register', response_model=schemas.Token)
def register(payload: schemas.UserCreate, db: Session = Depends(get_db)):
    exists = db.query(User).filter(User.phone == payload.phone).first()
    if exists:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='手机号已注册')

    if not payload.password and not payload.sms_code:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='需要密码或短信验证码')

    user = User(id=str(uuid4()), phone=payload.phone, password_hash=None)

    if payload.password:
        user.password_hash = get_password_hash(payload.password)
    else:
        # 短信校验占位：应校验 SmsCode
        code = db.query(SmsCode).filter(SmsCode.phone == payload.phone).first()
        if not code or code.code != payload.sms_code:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='验证码无效')
        if code.expires_at < datetime.utcnow():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='验证码过期')
        db.delete(code)

    db.add(user)
    db.commit()
    db.refresh(user)

    access, refresh = create_access_refresh_tokens(user.id)
    return schemas.Token(access_token=access, refresh_token=refresh)


@router.post('/login', response_model=schemas.Token)
def login(payload: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone == payload.phone).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='用户不存在')

    if payload.password:
        if not user.password_hash or not verify_password(payload.password, user.password_hash):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='手机号或密码错误')
    elif payload.sms_code:
        code = db.query(SmsCode).filter(SmsCode.phone == payload.phone).first()
        if not code or code.code != payload.sms_code:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='验证码无效')
        if code.expires_at < datetime.utcnow():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='验证码过期')
        db.delete(code)
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='需要密码或验证码')

    access, refresh = create_access_refresh_tokens(user.id)
    return schemas.Token(access_token=access, refresh_token=refresh)


@router.get('/me', response_model=schemas.UserOut)
def me(current_user: User = Depends()):  # 占位，后续用依赖解析 JWT
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail='待实现')

