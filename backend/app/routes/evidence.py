import os
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Request
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.security import get_current_user, require_roles
from app.core.audit import create_audit_log
from app.database.session import get_db
from app.models.case import Case
from app.models.evidence import Evidence
from app.models.user import User
from app.schemas.evidence import (
    EvidenceResponse,
    EvidenceListResponse,
    EvidenceExtractResponse
)
from app.utils.file_storage import save_upload_file
from app.utils.text_extraction import extract_file_content
from app.routes.deps import check_case_access

router = APIRouter(prefix="/evidence", tags=["Evidence Management"])


@router.post("/upload", response_model=EvidenceResponse, status_code=status.HTTP_201_CREATED)
def upload_evidence(
    request: Request,
    case_id: int = Form(...),
    title: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["investigator", "admin"]))
):
    """
    Uploads documentary or physical evidence (PDF, DOCX, TXT, image, audio) for a case.
    Validates file format and size, secures storage path, and executes automated text/metadata extraction.
    """
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    check_case_access(case, current_user, write_access=True)

    # Save to secure storage
    file_path, original_filename, file_type, file_size = save_upload_file(file, case_id)

    # Automated text and metadata extraction
    extracted_text, metadata = extract_file_content(file_path, file_type)

    evidence = Evidence(
        case_id=case.id,
        uploaded_by=current_user.id,
        title=title or original_filename,
        filename=os.path.basename(file_path),
        original_filename=original_filename,
        file_type=file_type,
        file_path=file_path,
        file_size=file_size,
        extracted_text=extracted_text,
        metadata_json=metadata
    )
    db.add(evidence)
    db.commit()
    db.refresh(evidence)

    create_audit_log(
        db=db,
        action="EVIDENCE_UPLOADED",
        target_type="Evidence",
        target_id=evidence.id,
        user_id=current_user.id,
        details=f"Uploaded evidence #{evidence.id} ({file_type}, {file_size} bytes) for case #{case.id}",
        ip_address=request.client.host if request.client else None
    )

    return evidence


@router.get("/case/{case_id}", response_model=EvidenceListResponse)
def get_case_evidence(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves list of all evidence items associated with a case."""
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    check_case_access(case, current_user)

    items = db.query(Evidence).filter(Evidence.case_id == case_id).order_by(Evidence.created_at.desc()).all()
    return EvidenceListResponse(
        case_id=case_id,
        items=[EvidenceResponse.model_validate(item) for item in items],
        total_count=len(items)
    )


@router.get("/{evidence_id}", response_model=EvidenceResponse)
def get_evidence(
    evidence_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves metadata and extracted text for an evidence item."""
    evidence = db.query(Evidence).filter(Evidence.id == evidence_id).first()
    if not evidence:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evidence not found")

    check_case_access(evidence.case, current_user)
    return evidence


@router.get("/{evidence_id}/download")
def download_evidence(
    evidence_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Downloads the raw original evidence file."""
    evidence = db.query(Evidence).filter(Evidence.id == evidence_id).first()
    if not evidence:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evidence not found")

    check_case_access(evidence.case, current_user)

    if not os.path.exists(evidence.file_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Physical file missing from storage")

    create_audit_log(
        db=db,
        action="EVIDENCE_DOWNLOADED",
        target_type="Evidence",
        target_id=evidence.id,
        user_id=current_user.id,
        details=f"Downloaded evidence #{evidence.id}",
        ip_address=request.client.host if request.client else None
    )

    return FileResponse(
        path=evidence.file_path,
        filename=evidence.original_filename,
        media_type="application/octet-stream"
    )


@router.post("/{evidence_id}/extract", response_model=EvidenceExtractResponse)
def reextract_evidence(
    evidence_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["investigator", "admin"]))
):
    """Triggers re-extraction of text and metadata from the stored evidence file."""
    evidence = db.query(Evidence).filter(Evidence.id == evidence_id).first()
    if not evidence:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evidence not found")

    check_case_access(evidence.case, current_user, write_access=True)

    extracted_text, metadata = extract_file_content(evidence.file_path, evidence.file_type)
    evidence.extracted_text = extracted_text
    evidence.metadata_json = metadata
    db.commit()
    db.refresh(evidence)

    return EvidenceExtractResponse(
        evidence_id=evidence.id,
        filename=evidence.original_filename,
        file_type=evidence.file_type,
        extracted_text_snippet=(extracted_text or "")[:300],
        total_characters=len(extracted_text or ""),
        metadata=metadata
    )
