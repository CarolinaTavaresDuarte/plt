from functools import lru_cache
from pydantic import Field, EmailStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # App
    app_name: str = "Plataa Backend"

    # DB
    database_url: str | None = Field(default=None, env="DATABASE_URL")
    database_host: str = Field("200.144.245.12", env="DATABASE_HOST")
    database_port: int = Field(45432, env="DATABASE_PORT")
    database_user: str = Field("u_grupo05", env="DATABASE_USER")
    database_password: str = Field("grupo05", env="DATABASE_PASSWORD")
    database_name: str = Field("db_grupo05", env="DATABASE_NAME")

    # Schemas
    user_schema: str = Field("user_auth", env="USER_SCHEMA")
    specialist_schema: str = Field("specialist_auth", env="SPECIALIST_SCHEMA")
    tests_schema: str = Field("test_data", env="TESTS_SCHEMA")

    # Auth/JWT
    jwt_secret_key: str = Field("super-secret-development-key", env="JWT_SECRET_KEY")
    jwt_algorithm: str = Field("HS256", env="JWT_ALGORITHM")
    jwt_expiration_minutes: int = Field(60 * 12, env="JWT_EXPIRATION_MINUTES")

    # SMTP / E-mail
    smtp_host: str = Field("smtp.gmail.com", env="SMTP_HOST")
    smtp_port: int = Field(587, env="SMTP_PORT")
    smtp_user: str = Field("", env="SMTP_USER")     # ex.: plataa.noreply@gmail.com
    smtp_pass: str = Field("", env="SMTP_PASS")     # senha de app (16 chars)
    email_destino: EmailStr = Field("carolinatavaresduarte@usp.br", env="EMAIL_DESTINO")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,  # permite SMTP_HOST preencher smtp_host
    )

    @property
    def base_database_url(self) -> str:
        return (
            f"postgresql+psycopg2://{self.database_user}:{self.database_password}"
            f"@{self.database_host}:{self.database_port}/{self.database_name}"
        )

    @property
    def sqlalchemy_url(self) -> str:
        return self.database_url or self.base_database_url


@lru_cache()
def get_settings() -> Settings:
    return Settings()
