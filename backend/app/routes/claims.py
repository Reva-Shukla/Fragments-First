from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.core.audit import create_audit_log
from app.database.session import get_db
from app.models.statement import Statement
from app.models.reconstruction import Reconstruction
from app.models.claim import Claim
from app.models.case import Case
from app.models.user import User
from app.schemas.claim import (
    ClaimExtractRequest,
    ClaimResponse,
    ClaimListResponse
)
from app.services.claim_service import claim_service
from app.routes.deps import check_case_access

router = APIRouter(prefix="/claims", tags=["Claims"])


@router.post("/extract", response_model=ClaimListResponse, status_code=status.HTTP_201_CREATED)
def extract_claims_endpoint(
    extract_req: ClaimExtractRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Extracts atomic factual claims from an approved reconstruction or statement.
    Populates extracted entities (People, Locations, Dates, Times, Events, Actions, Uncertainty Notes).
    """
    statement = db.query(Statement).filter(Statement.id == extract_req.statement_id).first()
    if not statement:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Statement not found")

    check_case_access(statement.case, current_user, write_access=True)

    # Determine text to extract from
    source_text = statement.original_text
    reconstruction_id = extract_req.reconstruction_id

    if reconstruction_id:
        recon = db.query(Reconstruction).filter(Reconstruction.id == reconstruction_id).first()
        if recon:
            source_text = recon.reconstructed_statement

    extracted_data = claim_service.extract_claims(
        text=source_text,
        original_statement_text=statement.original_text
    )

    created_claims = []
    for c_dict in extracted_data:
        claim_obj = Claim(
            statement_id=statement.id,
            case_id=statement.case_id,
            reconstruction_id=reconstruction_id,
            claim_text=c_dict.get("claim_text", ""),
            original_excerpt=c_dict.get("original_excerpt", ""),
            people=c_dict.get("people", []),
            locations=c_dict.get("locations", []),
            dates=c_dict.get("dates", []),
            times=c_dict.get("times", []),
            events=c_dict.get("events", []),
            actions=c_dict.get("actions", []),
            uncertainty_notes=c_dict.get("uncertainty_notes"),
            is_approved=True
        )
        db.add(claim_obj)
        created_claims.append(claim_obj)

    db.commit()
    for c in created_claims:
        db.refresh(c)

    create_audit_log(
        db=db,
        action="CLAIMS_EXTRACTED",
        target_type="Claim",
        target_id=statement.id,
        user_id=current_user.id,
        details=f"Extracted {len(created_claims)} claims for statement #{statement.id}",
        ip_address=request.client.host if request.client else None
    )

    return ClaimListResponse(
        case_id=statement.case_id,
        statement_id=statement.id,
        claims=[ClaimResponse.model_validate(c) for c in created_claims],
        total_claims=len(created_claims)
    )


@router.get("/case/{case_id}", response_model=ClaimListResponse)
def get_case_claims(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves all extracted claims associated with a case."""
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    check_case_access(case, current_user)

    claims = db.query(Claim).filter(Claim.case_id == case_id).order_by(Claim.id.asc()).all()
    return ClaimListResponse(
        case_id=case_id,
        claims=[ClaimResponse.model_validate(c) for c in claims],
        total_claims=len(claims)
    )


@router.get("/statement/{statement_id}", response_model=List[ClaimResponse])
def get_statement_claims(
    statement_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves all claims extracted from a specific statement."""
    statement = db.query(Statement).filter(Statement.id == statement_id).first()
    if not statement:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Statement not found")

    check_case_access(statement.case, current_user)

    claims = db.query(Claim).filter(Claim.statement_id == statement_id).all()
    return claims


@router.get("/{claim_id}", response_model=ClaimResponse)
def get_claim(
    claim_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves a single claim by its ID."""
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Claim not found")

    check_case_access(claim.case, current_user)
    return claim
