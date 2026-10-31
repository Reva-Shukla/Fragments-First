from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, Field, ConfigDict


class ReportGenerateRequest(BaseModel):
    case_id: int
    report_type: Literal["full_investigation", "executive_summary"] = "full_investigation"
    title: Optional[str] = Field(None, description="Custom report title. Defaults to case title.")


class ReportResponse(BaseModel):
    id: int
    case_id: int
    generated_by: int
    report_type: str
    title: str
    file_path: str
    download_url: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
