from datetime import datetime
from typing import Optional, List, Literal
from pydantic import BaseModel, Field, ConfigDict


class EventBase(BaseModel):
    description: str
    date_time_str: Optional[str] = Field(None, description="Reported date and/or time")
    time_precision: Literal["exact", "approximate", "unknown"] = "approximate"
    source_type: Literal["claim", "evidence", "statement"] = "claim"
    source_id: Optional[int] = None
    related_claim_ids: List[int] = []
    is_uncertain: bool = False


class EventCreate(EventBase):
    case_id: int


class EventResponse(EventBase):
    id: int
    case_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TimelineResponse(BaseModel):
    case_id: int
    total_events: int
    events: List[EventResponse]
