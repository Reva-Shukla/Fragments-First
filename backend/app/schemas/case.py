from datetime import datetime
from typing import Optional, List, Literal
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.user import UserResponse


class CaseBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: Optional[str] = None


class CaseCreate(CaseBase):
    victim_id: Optional[int] = Field(None, description="Victim ID. Defaults to the requesting user if they are a victim.")
    investigator_id: Optional[int] = None


class CaseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[Literal["open", "in_progress", "review", "closed"]] = None
    investigator_id: Optional[int] = None


class CaseAssignInvestigator(BaseModel):
    investigator_id: int


class CaseResponse(CaseBase):
    id: int
    status: str
    victim_id: int
    investigator_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    victim: Optional[UserResponse] = None
    investigator: Optional[UserResponse] = None

    model_config = ConfigDict(from_attributes=True)


class CaseActivityItem(BaseModel):
    id: int
    action: str
    target_type: str
    target_id: Optional[int] = None
    details: Optional[str] = None
    timestamp: datetime


class CaseDetailResponse(CaseResponse):
    statement_count: int = 0
    evidence_count: int = 0
    claim_count: int = 0
    recent_activity: List[CaseActivityItem] = []
