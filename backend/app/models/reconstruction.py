from datetime import datetime, timezone
from sqlalchemy import Column, Integer, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database.base import Base


class Reconstruction(Base):
    __tablename__ = "reconstructions"

    id = Column(Integer, primary_key=True, index=True)
    statement_id = Column(Integer, ForeignKey("statements.id"), nullable=False)
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=False)
    
    reconstructed_statement = Column(Text, nullable=False)
    unclear_portions = Column(JSON, default=list)  # list of unclear parts identified
    missing_information = Column(JSON, default=list)  # list of missing context identified
    preserved_uncertainties = Column(JSON, default=list)  # list of uncertainty markers preserved
    
    # Victim review and ethical guardrails
    requires_victim_review = Column(Boolean, default=True)
    is_approved = Column(Boolean, default=False)
    victim_feedback = Column(Text, nullable=True)
    approved_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    statement = relationship("Statement", back_populates="reconstructions")
    claims = relationship("Claim", back_populates="reconstruction")
