from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database.base import Base


class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=False)
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    title = Column(String(255), nullable=True)
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)  # pdf, docx, txt, image, audio
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, nullable=False)  # in bytes
    
    extracted_text = Column(Text, nullable=True)
    # Audio/video transcription (stored separately from extracted_text)
    transcription = Column(Text, nullable=True)
    metadata_json = Column(JSON, default=dict)
    # Human-readable description / source attribution
    description = Column(Text, nullable=True)
    source_info = Column(String(500), nullable=True)   # e.g. "Submitted by victim on 2025-01-01"
    # Verification: unverified, verified, disputed, pending_review
    verification_status = Column(String(30), nullable=True, default="unverified")
    # File integrity hash (SHA-256 of original file, computed on upload)
    hash_sha256 = Column(String(64), nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    case = relationship("Case", back_populates="evidence")
    uploader = relationship("User", back_populates="uploaded_evidence")
