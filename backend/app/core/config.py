from functools import lru_cache
from urllib.parse import quote_plus

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "backend/.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "AD GLOBAL API"
    environment: str = "development"
    api_v1_prefix: str = "/api/v1"
    secret_key: str = Field(min_length=32)
    access_token_minutes: int = 30
    refresh_token_days: int = 7

    mysql_host: str = "127.0.0.1"
    mysql_port: int = 3306
    mysql_database: str = "adglobal"
    mysql_user: str = "adglobal"
    mysql_password: str = ""
    database_url_override: str | None = None

    cors_origins: str = "http://localhost:3000,http://localhost:3001"
    upload_directory: str = "backend/uploads"
    public_upload_url: str = "/uploads"
    max_upload_mb: int = 10
    max_video_upload_mb: int = 100

    initial_samuel_password: str | None = None
    initial_joaquin_password: str | None = None

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def database_url(self) -> str:
        if self.database_url_override:
            return self.database_url_override
        user = quote_plus(self.mysql_user)
        password = quote_plus(self.mysql_password)
        return (
            f"mysql+pymysql://{user}:{password}@{self.mysql_host}:{self.mysql_port}/"
            f"{self.mysql_database}?charset=utf8mb4"
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]
