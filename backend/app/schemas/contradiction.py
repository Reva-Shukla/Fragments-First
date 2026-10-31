from typing import List, Optional
from pydantic import BaseModel, Field


class ContradictionItem(BaseModel):
    contradiction_id: Optional[str] = None
    conflicting_claim_ids: List[int] = Field(default_factory=list, description="IDs of claims involved in the discrepancy")
    source_references: List[str] = Field(default_factory=list, description="Source names, excerpts, or timestamps")
    discrepancy_explanation: str = Field(..., description="Objective explanation of the conflict without deceptive intent labeling")
    relevant_evidence_ids: List[int] = Field(default_factory=list, description="Evidence items supporting or revealing the conflict")
    uncertainties: List[str] = Field(default_factory=list, description="Uncertainties or unverified assumptions")
    human_review_required: bool = True


class ContradictionDetectionResponse(BaseModel):
    case_id: int
    contradictions: List[ContradictionItem] = []
    total_found: int = 0
    ethical_disclaimer: str = "Discrepancies indicate investigative divergence and must never be interpreted as victim deception."
