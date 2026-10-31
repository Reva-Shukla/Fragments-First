from datetime import datetime
from typing import Optional, List, Literal
from pydantic import BaseModel, Field, ConfigDict


class VerificationRunRequest(BaseModel):
    case_id: int
    claim_ids: Optional[List[int]] = Field(None, description="Optional specific claim IDs to verify. If empty, all unverified claims in the case are verified.")


class VerificationReviewRequest(BaseModel):
    status: Optional[Literal["Supported", "Partially Supported", "Contradicted", "Unverified"]] = None
    reviewer_notes: Optional[str] = Field(None, description="Investigator notes confirming or correcting the assessment")
    is_reviewed: bool = True


class VerificationResponse(BaseModel):
    id: int
    claim_id: int
    case_id: int
    status: str  # Supported, Partially Supported, Contradicted, Unverified
    explanation: str
    evidence_ids: List[int] = []
    limitations: List[str] = []
    human_review_required: bool = True
    reviewer_id: Optional[int] = None
    reviewer_notes: Optional[str] = None
    is_reviewed: bool = False
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CaseVerificationSummary(BaseModel):
    case_id: int
    total_claims: int
    supported_count: int
    partially_supported_count: int
    contradicted_count: int
    unverified_count: int
    verifications: List[VerificationResponse]
