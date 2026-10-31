from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database.base import Base


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=False)
    
    description = Column(Text, nullable=False)
    date_time_str = Column(String(255), nullable=True)
    # Time precision: exact, approximate, unknown
    time_precision = Column(String(50), default="approximate")
    # Source type: claim, evidence, statement
    source_type = Column(String(50), default="claim")
    source_id = Column(Integer, nullable=True)
    related_claim_ids = Column(JSON, default=list)
    is_uncertain = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    case = relationship("Case", back_populates="events")
