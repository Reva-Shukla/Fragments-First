from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from app.core.security import get_current_user, require_roles
from app.core.audit import create_audit_log
from app.database.session import get_db
from app.models.case import Case
from app.models.claim import Claim
from app.models.evidence import Evidence
from app.models.user import User
from app.schemas.contradiction import (
    ContradictionItem,
    ContradictionDetectionResponse
)
from app.services.contradiction_service import contradiction_service
from app.routes.deps import check_case_access

router = APIRouter(prefix="/contradictions", tags=["Contradiction Detection"])


@router.post("/detect/{case_id}", response_model=ContradictionDetectionResponse)
def detect_contradictions(
    case_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["investigator", "admin"]))
):
    """
    Identifies factual discrepancies across statements, claims, and evidence.
    Ethical rule: Informational discrepancies are analyzed objectively without labeling as deception.
    """
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    check_case_access(case, current_user)

    claims = db.query(Claim).filter(Claim.case_id == case.id).all()
    evidence_items = db.query(Evidence).filter(Evidence.case_id == case.id).all()

    claims_dicts = [
        {
            "id": c.id,
            "claim_text": c.claim_text,
            "times": c.times,
            "dates": c.dates,
            "locations": c.locations,
            "uncertainty_notes": c.uncertainty_notes
        }
        for c in claims
    ]

    evidence_dicts = [
        {
            "id": e.id,
            "title": e.title,
            "filename": e.filename,
            "extracted_text": e.extracted_text
        }
        for e in evidence_items
    ]

    contradictions_list = contradiction_service.detect_contradictions(
        claims=claims_dicts,
        evidence_items=evidence_dicts
    )

    create_audit_log(
        db=db,
        action="CONTRADICTIONS_DETECTED",
        target_type="Case",
        target_id=case.id,
        user_id=current_user.id,
        details=f"Identified {len(contradictions_list)} informational discrepancies for case #{case.id}",
        ip_address=request.client.host if request.client else None
    )

    return ContradictionDetectionResponse(
        case_id=case.id,
        contradictions=[ContradictionItem(**item) for item in contradictions_list],
        total_found=len(contradictions_list)
    )


@router.get("/case/{case_id}", response_model=ContradictionDetectionResponse)
def get_case_contradictions(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves detected discrepancies for a case."""
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    check_case_access(case, current_user)

    claims = db.query(Claim).filter(Claim.case_id == case.id).all()
    evidence_items = db.query(Evidence).filter(Evidence.case_id == case.id).all()

    claims_dicts = [
        {
            "id": c.id,
            "claim_text": c.claim_text,
            "times": c.times,
            "dates": c.dates,
            "locations": c.locations,
            "uncertainty_notes": c.uncertainty_notes
        }
        for c in claims
    ]

    evidence_dicts = [
        {
            "id": e.id,
            "title": e.title,
            "filename": e.filename,
            "extracted_text": e.extracted_text
        }
        for e in evidence_items
    ]

    contradictions_list = contradiction_service.detect_contradictions(
        claims=claims_dicts,
        evidence_items=evidence_dicts
    )

    return ContradictionDetectionResponse(
        case_id=case.id,
        contradictions=[ContradictionItem(**item) for item in contradictions_list],
        total_found=len(contradictions_list)
    )
