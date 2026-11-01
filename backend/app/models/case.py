from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database.base import Base


class Case(Base):
    __tablename__ = "cases"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="open")  # open, in_progress, review, closed
    # Category: free-form — murder, theft, cybercrime, domestic_violence, fraud, missing_person, harassment, other, etc.
    category = Column(String(100), nullable=True, default="other")
    # Priority: critical, high, medium, low
    priority = Column(String(20), nullable=True, default="medium")
    # Unique case reference number (e.g. FF-2025-0001)
    reference_number = Column(String(50), nullable=True, index=True)
    victim_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    investigator_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    victim = relationship("User", foreign_keys=[victim_id], back_populates="victim_cases")
    investigator = relationship("User", foreign_keys=[investigator_id], back_populates="investigator_cases")
    statements = relationship("Statement", back_populates="case", cascade="all, delete-orphan")
    evidence = relationship("Evidence", back_populates="case", cascade="all, delete-orphan")
    claims = relationship("Claim", back_populates="case", cascade="all, delete-orphan")
    events = relationship("Event", back_populates="case", cascade="all, delete-orphan")
    investigations = relationship("Investigation", back_populates="case", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="case", cascade="all, delete-orphan")
