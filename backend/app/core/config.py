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
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    
    # Database
    DATABASE_URL: str = "sqlite:///./fragment_first.db"
    
    # LLM Settings
    GEMINI_API_KEY: Union[str, None] = None
    PRUNE_API_KEY: Union[str, None] = None
    LLM_PROVIDER: str = "gemini"
    DEMO_MODE: bool = True

    # Local Demo Mode & Credentials Configuration
    # Disabled by default; unavailable in production unless explicitly enabled via LOCAL_DEMO_MODE=true
    LOCAL_DEMO_MODE: bool = False
    DEMO_VICTIM_EMAIL: str = "demo.victim@fragmentsfirst.org"
    DEMO_VICTIM_PASSWORD: str = "DemoVictim2026!"
    DEMO_VICTIM_USERNAME: str = "SafeHarbor_42"
    DEMO_VICTIM_NAME: str = "Demo Participant (SafeHarbor)"

    DEMO_INVESTIGATOR_EMAIL: str = "demo.investigator@fragmentsfirst.org"
    DEMO_INVESTIGATOR_PASSWORD: str = "DemoInvestigator2026!"
    DEMO_INVESTIGATOR_USERNAME: str = "det_vance"
    DEMO_INVESTIGATOR_NAME: str = "Senior Det. Marcus Vance"
    
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
