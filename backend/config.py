from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_env: str
    secret_key: str
    algorithm: str


    class Config:
        env_file = ".env"


    
settings = Settings()