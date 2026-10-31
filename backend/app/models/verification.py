from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database.base import Base


class Verification(Base):
    __tablename__ = "verifications"

    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(Integer, ForeignKey("claims.id"), nullable=False)
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=False)
    
    # Supported, Partially Supported, Contradicted, Unverified
    status = Column(String(50), nullable=False)
    explanation = Column(Text, nullable=False)
    evidence_ids = Column(JSON, default=list)  # List of integer Evidence IDs
    limitations = Column(JSON, default=list)  # Methodological or evidential limitations
    
    # Ethical & human-in-the-loop safeguards
    human_review_required = Column(Boolean, default=True)
    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    reviewer_notes = Column(Text, nullable=True)
    is_reviewed = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    claim = relationship("Claim", back_populates="verifications")
    reviewer = relationship("User", foreign_keys=[reviewer_id])
