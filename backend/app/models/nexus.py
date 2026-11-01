"""
NexusConnection — Cross-case entity relationship record.

Represents a POSSIBLE connection between two records (evidence, statements,
entities) across one or more cases identified by the Nexus Intelligence engine.

ETHICAL REQUIREMENT:
  - A NexusConnection is always a SUGGESTION, never a proven fact.
  - Every connection must carry:
      * source references explaining WHY it was suggested
      * a confidence score (0.0–1.0) with explicit uncertainty
      * investigator review status before it influences any decision
  - Investigators must confirm/reject. Unreviewed connections must never
    be treated as established facts.
"""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from app.database.base import Base


class NexusConnection(Base):
    __tablename__ = "nexus_connections"

    id = Column(Integer, primary_key=True, index=True)

    # The two connected entities (can be statements, evidence, entities, cases)
    source_type = Column(String(50), nullable=False)   # 'entity', 'statement', 'evidence', 'case'
    source_id   = Column(Integer, nullable=False)      # ID within source_type's table
    source_case_id = Column(Integer, ForeignKey("cases.id"), nullable=True)

    target_type = Column(String(50), nullable=False)
    target_id   = Column(Integer, nullable=False)
    target_case_id = Column(Integer, ForeignKey("cases.id"), nullable=True)

    # What kind of connection this is
    connection_type = Column(String(100), nullable=False)  # 'same_person', 'shared_location', 'shared_phone', 'similar_vehicle', 'temporal_overlap', etc.

    # Why this connection was identified — required for every suggestion
    rationale = Column(Text, nullable=False)           # human-readable explanation
    supporting_text_a = Column(Text, nullable=True)    # excerpt from source record
    supporting_text_b = Column(Text, nullable=True)    # excerpt from target record

    # Uncertainty — MANDATORY fields
    confidence_score = Column(Float, nullable=False, default=0.5)   # 0.0 = very uncertain, 1.0 = very high
    confidence_label = Column(String(30), nullable=False, default="possible")  # possible, probable, unlikely, speculative

    # Investigator review
    # 'pending_review', 'confirmed', 'rejected', 'needs_more_info'
    review_status = Column(String(30), nullable=False, default="pending_review")
    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    review_notes = Column(Text, nullable=True)
    reviewed_at = Column(DateTime, nullable=True)

    # AI generation metadata
    generated_by_model = Column(String(100), nullable=True)
    is_ai_generated = Column(Boolean, default=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    reviewer = relationship("User", foreign_keys=[reviewed_by])
