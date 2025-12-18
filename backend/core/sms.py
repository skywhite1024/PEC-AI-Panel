import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from ..models.sms import SmsCode

DEFAULT_EXPIRE_MINUTES = 5
MAX_ATTEMPTS = 5


def generate_code() -> str:
    return f"{random.randint(0, 999999):06d}"


def save_code(db: Session, phone: str, purpose: str, expire_minutes: int = DEFAULT_EXPIRE_MINUTES) -> str:
    code = generate_code()
    expires_at = datetime.utcnow() + timedelta(minutes=expire_minutes)

    record = db.query(SmsCode).filter(SmsCode.phone == phone).first()
    if record:
        record.code = code
        record.purpose = purpose
        record.expires_at = expires_at
        record.attempt_count = 0
    else:
        record = SmsCode(
            phone=phone,
            code=code,
            purpose=purpose,
            expires_at=expires_at,
            attempt_count=0,
        )
        db.add(record)

    db.commit()
    return code


def verify_code(db: Session, phone: str, code_value: str) -> None:
    record = db.query(SmsCode).filter(SmsCode.phone == phone).first()
    if not record:
        raise ValueError("invalid sms code")

    # 基本格式校验：6位数字
    if not (isinstance(code_value, str) and code_value.isdigit() and len(code_value) == 6):
        raise ValueError("invalid sms code format")

    if record.attempt_count >= MAX_ATTEMPTS:
        raise ValueError("sms code locked, too many attempts")

    if record.expires_at < datetime.utcnow():
        raise ValueError("sms code expired")

    if record.code != code_value:
        record.attempt_count += 1
        db.commit()
        raise ValueError("invalid sms code")

    # 成功后清理记录
    db.delete(record)
    db.commit()
