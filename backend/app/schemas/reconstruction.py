from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, Field, ConfigDict


class ReconstructionRequest(BaseModel):
    statement_id: int = Field(..., description="ID of the original statement to reconstruct")


class ReconstructionApproval(BaseModel):
    is_approved: bool = Field(..., description="Whether victim approves this reconstruction")
    feedback: Optional[str] = Field(None, description="Optional corrections or feedback from the victim")


class ReconstructionCorrectionRequest(BaseModel):
    correction_notes: str = Field(..., min_length=3, description="Instructions or missing details the victim wants addressed")


class ReconstructionResponse(BaseModel):
    id: int
    statement_id: int
    case_id: int
    reconstructed_statement: str
    unclear_portions: List[Any] = []
    missing_information: List[Any] = []
    preserved_uncertainties: List[Any] = []
    requires_victim_review: bool
    is_approved: bool
    victim_feedback: Optional[str] = None
    approved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
