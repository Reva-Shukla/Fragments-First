from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database.base import Base


class Investigation(Base):
    __tablename__ = "investigations"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=False)
    
    label = Column(String(100), default="Investigative Hypothesis")
    hypothesis_text = Column(Text, nullable=False)
    supporting_evidence_ids = Column(JSON, default=list)
    conflicting_evidence_ids = Column(JSON, default=list)
    assumptions = Column(JSON, default=list)
    missing_information = Column(JSON, default=list)
    
    # Counterfactual analysis flag - must be isolated from ground-truth timeline
    is_counterfactual = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    case = relationship("Case", back_populates="investigations")
