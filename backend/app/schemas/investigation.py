from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class HypothesisGenerateRequest(BaseModel):
    case_id: int
    focus_topic: Optional[str] = Field(None, description="Optional investigative focus or specific question")


class CounterfactualRequest(BaseModel):
    case_id: int
    counterfactual_premise: str = Field(..., min_length=5, description="What-if premise (e.g., 'What if the suspect arrived by train rather than car?')")


class InvestigationResponse(BaseModel):
    id: int
    case_id: int
    label: str
    hypothesis_text: str
    supporting_evidence_ids: List[int] = []
    conflicting_evidence_ids: List[int] = []
    assumptions: List[str] = []
    missing_information: List[str] = []
    is_counterfactual: bool = False
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class InvestigationListResponse(BaseModel):
    case_id: int
    hypotheses: List[InvestigationResponse]
    counterfactual_scenarios: List[InvestigationResponse]
