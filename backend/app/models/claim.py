from datetime import datetime, timezone
from sqlalchemy import Column, Integer, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database.base import Base


class Claim(Base):
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True, index=True)
    statement_id = Column(Integer, ForeignKey("statements.id"), nullable=False)
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=False)
    reconstruction_id = Column(Integer, ForeignKey("reconstructions.id"), nullable=True)
    
    claim_text = Column(Text, nullable=False)
    original_excerpt = Column(Text, nullable=False)
    
    # Entities extracted
    people = Column(JSON, default=list)
    locations = Column(JSON, default=list)
    dates = Column(JSON, default=list)
    times = Column(JSON, default=list)
    events = Column(JSON, default=list)
    actions = Column(JSON, default=list)
    
    uncertainty_notes = Column(Text, nullable=True)
    is_approved = Column(Boolean, default=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    case = relationship("Case", back_populates="claims")
    statement = relationship("Statement", back_populates="claims")
    reconstruction = relationship("Reconstruction", back_populates="claims")
    verifications = relationship("Verification", back_populates="claim", cascade="all, delete-orphan")
