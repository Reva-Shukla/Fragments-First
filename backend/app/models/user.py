from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.database.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    # username: the pseudonymous display identity chosen at registration.
    # Unique and required for new accounts. Nullable for backward compatibility
    # with any pre-existing rows (they will use full_name as fallback).
    username = Column(String(100), unique=True, index=True, nullable=True)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="victim")  # victim, investigator, admin
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    victim_cases = relationship("Case", foreign_keys="Case.victim_id", back_populates="victim")
    investigator_cases = relationship("Case", foreign_keys="Case.investigator_id", back_populates="investigator")
    statements = relationship("Statement", back_populates="victim")
    uploaded_evidence = relationship("Evidence", back_populates="uploader")
    audit_logs = relationship("AuditLog", back_populates="user")
