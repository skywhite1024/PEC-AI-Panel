from pydantic_settings import BaseSettings
from pydantic import BaseModel

class Settings(BaseSettings):
    app_name: str = 'PEC-AI Backend'
    secret_key: str = 'CHANGE_ME'
    # 简化方案：延长 Access Token 时长（默认 7 天），Refresh 可忽略
    access_token_expire_minutes: int = 60 * 24 * 7
    refresh_token_expire_minutes: int = 60 * 24 * 7
    algorithm: str = 'HS256'

    class Config:
        env_file = '.env'

class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = 'bearer'

settings = Settings()
