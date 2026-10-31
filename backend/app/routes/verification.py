from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from app.core.security import get_current_user, require_roles
from app.core.audit import create_audit_log
from app.database.session import get_db
from app.models.case import Case
from app.models.claim import Claim
from app.models.evidence import Evidence
from app.models.verification import Verification
from app.models.user import User
from app.schemas.verification import (
    VerificationRunRequest,
    VerificationReviewRequest,
    VerificationResponse,
    CaseVerificationSummary
)
from app.services.verification_service import verification_service
from app.routes.deps import check_case_access

router = APIRouter(prefix="/verification", tags=["Claim Verification"])


@router.post("/run", response_model=CaseVerificationSummary, status_code=status.HTTP_201_CREATED)
def run_verification(
    ver_req: VerificationRunRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["investigator", "admin"]))
):
    """
    Executes AI Claim Verification.
    Compares extracted claims against uploaded evidence items for a case.
    Does NOT calculate credibility or truthfulness scores.
    References actual evidence IDs only.
    """
    case = db.query(Case).filter(Case.id == ver_req.case_id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    check_case_access(case, current_user, write_access=True)

    # Fetch claims to verify
    claims_query = db.query(Claim).filter(Claim.case_id == case.id)
    if ver_req.claim_ids:
        claims_query = claims_query.filter(Claim.id.in_(ver_req.claim_ids))
    claims = claims_query.all()

    if not claims:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No claims available for verification in this case. Extract claims first."
        )

    # Fetch evidence items
    evidence_items = db.query(Evidence).filter(Evidence.case_id == case.id).all()
    evidence_dicts = [
        {
            "id": e.id,
            "title": e.title,
            "filename": e.filename,
            "file_type": e.file_type,
            "extracted_text": e.extracted_text,
            "metadata_json": e.metadata_json
        }
        for e in evidence_items
    ]

    claims_dicts = [
        {
            "id": c.id,
            "claim_text": c.claim_text,
            "original_excerpt": c.original_excerpt,
            "times": c.times,
            "dates": c.dates,
            "locations": c.locations,
            "uncertainty_notes": c.uncertainty_notes
        }
        for c in claims
    ]

    # Run AI verification
    assessments = verification_service.verify_claims(
        claims=claims_dicts,
        evidence_items=evidence_dicts
    )

    created_verifications = []
    for ass in assessments:
        # Check if verification already exists for this claim, replace or update
        existing_ver = db.query(Verification).filter(Verification.claim_id == ass["claim_id"]).first()
        if existing_ver:
            existing_ver.status = ass.get("status", "Unverified")
            existing_ver.explanation = ass.get("explanation", "")
            existing_ver.evidence_ids = ass.get("evidence_ids", [])
            existing_ver.limitations = ass.get("limitations", [])
            existing_ver.human_review_required = True
            created_verifications.append(existing_ver)
        else:
            ver = Verification(
                claim_id=ass["claim_id"],
                case_id=case.id,
                status=ass.get("status", "Unverified"),
                explanation=ass.get("explanation", ""),
                evidence_ids=ass.get("evidence_ids", []),
                limitations=ass.get("limitations", []),
                human_review_required=True,
                is_reviewed=False
            )
            db.add(ver)
            created_verifications.append(ver)

    db.commit()
    for v in created_verifications:
        db.refresh(v)

    create_audit_log(
        db=db,
        action="VERIFICATION_COMPLETED",
        target_type="Verification",
        target_id=case.id,
        user_id=current_user.id,
        details=f"Verified {len(created_verifications)} claims for case #{case.id}",
        ip_address=request.client.host if request.client else None
    )

    # Calculate summary metrics
    supported = sum(1 for v in created_verifications if v.status == "Supported")
    partially = sum(1 for v in created_verifications if v.status == "Partially Supported")
    contradicted = sum(1 for v in created_verifications if v.status == "Contradicted")
    unverified = sum(1 for v in created_verifications if v.status == "Unverified")

    return CaseVerificationSummary(
        case_id=case.id,
        total_claims=len(created_verifications),
        supported_count=supported,
        partially_supported_count=partially,
        contradicted_count=contradicted,
        unverified_count=unverified,
        verifications=[VerificationResponse.model_validate(v) for v in created_verifications]
    )


@router.get("/case/{case_id}", response_model=CaseVerificationSummary)
def get_case_verifications(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves verification status and assessments for all claims in a case."""
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    check_case_access(case, current_user)

    verifications = db.query(Verification).filter(Verification.case_id == case_id).all()

    supported = sum(1 for v in verifications if v.status == "Supported")
    partially = sum(1 for v in verifications if v.status == "Partially Supported")
    contradicted = sum(1 for v in verifications if v.status == "Contradicted")
    unverified = sum(1 for v in verifications if v.status == "Unverified")

    return CaseVerificationSummary(
        case_id=case.id,
        total_claims=len(verifications),
        supported_count=supported,
        partially_supported_count=partially,
        contradicted_count=contradicted,
        unverified_count=unverified,
        verifications=[VerificationResponse.model_validate(v) for v in verifications]
    )


@router.put("/{verification_id}/review", response_model=VerificationResponse)
def review_verification(
    verification_id: int,
    review_in: VerificationReviewRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["investigator", "admin"]))
):
    """
    Enables an investigator or qualified human legal authority to review, confirm, or modify
    an AI verification assessment.
    """
    ver = db.query(Verification).filter(Verification.id == verification_id).first()
    if not ver:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Verification record not found")

    check_case_access(ver.claim.case, current_user, write_access=True)

    if review_in.status:
        ver.status = review_in.status
    if review_in.reviewer_notes is not None:
        ver.reviewer_notes = review_in.reviewer_notes
    ver.is_reviewed = review_in.is_reviewed
    ver.reviewer_id = current_user.id

    db.commit()
    db.refresh(ver)

    create_audit_log(
        db=db,
        action="VERIFICATION_HUMAN_REVIEWED",
        target_type="Verification",
        target_id=ver.id,
        user_id=current_user.id,
        details=f"Investigator #{current_user.id} marked verification #{ver.id} as reviewed (Status: {ver.status})",
        ip_address=request.client.host if request.client else None
    )

    return ver
