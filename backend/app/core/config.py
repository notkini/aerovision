from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "AeroVision API"
    app_version: str = "0.1.0"

    database_url: str = (
        "postgresql+psycopg://"
        "aerovision:aerovision_dev_password"
        "@localhost:5432/aerovision"
    )

    redis_url: str = "redis://localhost:6379/0"

    jwt_secret_key: str = "CHANGE_THIS_IN_ENV"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()