from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, Field, ConfigDict


class ClaimExtractRequest(BaseModel):
    statement_id: int
    reconstruction_id: Optional[int] = None


class ClaimBase(BaseModel):
    claim_text: str
    original_excerpt: str
    people: List[str] = []
    locations: List[str] = []
    dates: List[str] = []
    times: List[str] = []
    events: List[str] = []
    actions: List[str] = []
    uncertainty_notes: Optional[str] = None
    is_approved: bool = True


class ClaimCreate(ClaimBase):
    statement_id: int
    case_id: int
    reconstruction_id: Optional[int] = None


class ClaimResponse(ClaimBase):
    id: int
    statement_id: int
    case_id: int
    reconstruction_id: Optional[int] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ClaimListResponse(BaseModel):
    case_id: int
    statement_id: Optional[int] = None
    claims: List[ClaimResponse]
    total_claims: int
