from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.base import Base


class Statement(Base):
    __tablename__ = "statements"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=False)
    victim_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    # Original statements are immutable and preserved permanently
    original_text = Column(Text, nullable=False)
    is_draft = Column(Boolean, default=False)
    version = Column(Integer, default=1)
    audio_file_path = Column(String(500), nullable=True)
    status = Column(String(50), default="submitted")  # draft, submitted, under_review, approved
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    case = relationship("Case", back_populates="statements")
    victim = relationship("User", back_populates="statements")
    reconstructions = relationship("Reconstruction", back_populates="statement", cascade="all, delete-orphan")
    claims = relationship("Claim", back_populates="statement", cascade="all, delete-orphan")
