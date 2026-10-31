from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, ConfigDict


class EvidenceResponse(BaseModel):
    id: int
    case_id: int
    uploaded_by: int
    title: Optional[str] = None
    filename: str
    original_filename: str
    file_type: str
    file_size: int
    extracted_text: Optional[str] = None
    metadata_json: Dict[str, Any] = {}
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EvidenceListResponse(BaseModel):
    case_id: int
    items: List[EvidenceResponse]
    total_count: int


class EvidenceExtractResponse(BaseModel):
    evidence_id: int
    filename: str
    file_type: str
    extracted_text_snippet: str
    total_characters: int
    metadata: Dict[str, Any]
