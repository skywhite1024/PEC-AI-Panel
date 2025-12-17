from sqlalchemy import Column, String, Boolean, DateTime, func
from ..db import Base

class User(Base):
    __tablename__ = 'users'

    id = Column(String, primary_key=True, index=True)
    phone = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

