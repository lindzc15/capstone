from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path


#holds password/username settings from .env file
class Settings(BaseSettings):
    app_env: str
    secret_key: str
    algorithm: str
    database_user: str
    database_password: str
    database_host: str
    database_port: int = 5433
    database_name: str
    google_maps_key: str

    #dynamically creates the database url & allows it to be referenced like an attribute
    @property
    def database_url(self) -> str:
        return f"postgresql://{self.database_user}:{self.database_password}@{self.database_host}:{self.database_port}/{self.database_name}"

    #specifies the file to fill configurations with
    model_config = SettingsConfigDict(
        env_file=Path(__file__).with_name(".env"),
        env_file_encoding="utf-8",
    )


#populates each field with values found in the .env file
settings = Settings()