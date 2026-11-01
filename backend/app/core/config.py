import os
from pathlib import Path
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Fragment First API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Security
    SECRET_KEY: str = "fragment_first_super_secret_jwt_key_2025_prod_dev_hash"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30          # short-lived access token
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30            # long-lived refresh token (persistent login)

    # Cookie settings for the victim-side persistent session
    # Set COOKIE_SECURE=false in development (HTTP). Must be true in production (HTTPS).
    COOKIE_SECURE: bool = False
    COOKIE_SAMESITE: str = "lax"
    COOKIE_DOMAIN: Union[str, None] = None         # None = current domain
    
    # Database
    DATABASE_URL: str = "sqlite:///./fragment_first.db"

    # WebAuthn / Passkeys (Victim biometric login)
    # RP = Relying Party (your web app's identity in the WebAuthn protocol)
    # RP_ID must match the domain the frontend is served from (no port, no protocol).
    # In development: localhost.  In production: your-domain.com
    WEBAUTHN_RP_ID: str = "localhost"
    WEBAUTHN_RP_NAME: str = "Fragment First"
    # WEBAUTHN_ORIGIN must exactly match window.location.origin on the client.
    # In dev: http://localhost:5173.  In production: https://your-domain.com
    WEBAUTHN_ORIGIN: str = "http://localhost:5173"
    
    # LLM Settings
    GEMINI_API_KEY: Union[str, None] = None
    PRUNE_API_KEY: Union[str, None] = None
    LLM_PROVIDER: str = "gemini"
    DEMO_MODE: bool = True
    
    # CORS
    FRONTEND_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8000"
    ]
    
    # File storage limits
    MAX_UPLOAD_SIZE_MB: int = 10
    UPLOAD_DIR: str = "uploads"
    REPORTS_DIR: str = "generated_reports"

    @field_validator("FRONTEND_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return ["http://localhost:5173", "http://127.0.0.1:5173"]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()

# Ensure critical storage directories exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.REPORTS_DIR, exist_ok=True)
