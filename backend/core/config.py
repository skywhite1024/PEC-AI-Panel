from pydantic_settings import BaseSettings
from pydantic import BaseModel

class Settings(BaseSettings):
    app_name: str = 'PEC-AI Backend'
    secret_key: str = 'CHANGE_ME'
    access_token_expire_minutes: int = 30
    refresh_token_expire_minutes: int = 60 * 24 * 7
    algorithm: str = 'HS256'

    class Config:
        env_file = '.env'

class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = 'bearer'

settings = Settings()

