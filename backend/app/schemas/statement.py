from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class StatementCreate(BaseModel):
    case_id: int
    original_text: str = Field(..., min_length=3, description="Original fragmented statement text from victim")
    is_draft: bool = False
    audio_file_path: Optional[str] = None


class StatementUpdate(BaseModel):
    # Only allowed if is_draft is True
    original_text: Optional[str] = None
    is_draft: Optional[bool] = None


class ReconstructionSimple(BaseModel):
    id: int
    reconstructed_statement: str
    is_approved: bool
    requires_victim_review: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class StatementResponse(BaseModel):
    id: int
    case_id: int
    victim_id: int
    original_text: str
    is_draft: bool
    version: int
    audio_file_path: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime
    reconstructions: List[ReconstructionSimple] = []

    model_config = ConfigDict(from_attributes=True)
