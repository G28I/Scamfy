from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Scamfy API"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    # Security & Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60

    # Model Configuration (Private Server-Side)
    NVIDIA_API_KEY: str = ""
    NVIDIA_BASE_URL: str = "https://integrate.api.nvidia.com/v1"
    NEMOTRON_MODEL_SLUG: str = "nvidia/llama-3.1-nemotron-70b-instruct"

    # Database (Connection configured in Phase 3)
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/scamfy"

    # Object Storage (R2 / S3)
    R2_BUCKET_NAME: str = "scamfy-evidence"
    R2_ACCESS_KEY_ID: str = ""
    R2_SECRET_ACCESS_KEY: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
