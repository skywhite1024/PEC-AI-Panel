from sqlalchemy import Column, String, DateTime, Integer, func
from ..db import Base

class SmsCode(Base):
    __tablename__ = 'sms_codes'

    phone = Column(String, primary_key=True, index=True)
    code = Column(String, nullable=False)
    purpose = Column(String, nullable=False)  # login / register / reset
    expires_at = Column(DateTime(timezone=True), nullable=False)
    attempt_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

