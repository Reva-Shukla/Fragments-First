"""
ExtractedEntity — Named entity extracted from a statement, evidence, or reconstruction.

Entity extraction is performed by the AI but ALL results are explicitly tagged as
AI-generated hypotheses. Investigators must verify before acting on any entity.

Supported entity types:
  - PERSON       (names, aliases, descriptions)
  - LOCATION     (addresses, areas, buildings, coordinates)
  - VEHICLE      (make, model, colour, registration)
  - PHONE        (phone numbers)
  - EMAIL        (email addresses)
  - DATE         (dates, times, relative references)
  - ORGANIZATION (companies, agencies, groups)
  - OBJECT       (weapons, documents, digital devices)
  - IDENTIFIER   (usernames, account numbers, case refs)
  - OTHER        (anything that doesn't fit above)
"""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from app.database.base import Base


class ExtractedEntity(Base):
    __tablename__ = "extracted_entities"

    id = Column(Integer, primary_key=True, index=True)

    # Source record (one of these will be set)
    statement_id     = Column(Integer, ForeignKey("statements.id"),     nullable=True)
    evidence_id      = Column(Integer, ForeignKey("evidence.id"),       nullable=True)
    reconstruction_id = Column(Integer, ForeignKey("reconstructions.id"), nullable=True)
    case_id          = Column(Integer, ForeignKey("cases.id"),          nullable=False)

    # Entity details
    entity_type  = Column(String(50),  nullable=False)   # PERSON, LOCATION, VEHICLE, etc.
    entity_value = Column(String(500), nullable=False)   # The raw extracted text
    normalized_value = Column(String(500), nullable=True) # Cleaned/normalized form
    context_snippet  = Column(Text, nullable=True)        # Surrounding text for traceability

    # Confidence and uncertainty — AI extractions are never certain
    confidence_score = Column(Float, nullable=True, default=0.7)
    is_verified      = Column(Boolean, default=False)     # Set by investigator
    verified_by      = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Flags
    is_ai_generated  = Column(Boolean, default=True)
    is_redacted      = Column(Boolean, default=False)     # Privacy control

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    statement      = relationship("Statement",      foreign_keys=[statement_id])
    evidence       = relationship("Evidence",       foreign_keys=[evidence_id])
    reconstruction = relationship("Reconstruction", foreign_keys=[reconstruction_id])
    case           = relationship("Case",           foreign_keys=[case_id])
    verifier       = relationship("User",           foreign_keys=[verified_by])
