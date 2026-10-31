from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.core.audit import create_audit_log
from app.database.session import get_db
from app.models.statement import Statement
from app.models.reconstruction import Reconstruction
from app.models.user import User
from app.schemas.reconstruction import (
    ReconstructionRequest,
    ReconstructionApproval,
    ReconstructionCorrectionRequest,
    ReconstructionResponse
)
from app.services.reconstruction_service import reconstruction_service
from app.routes.deps import check_case_access

router = APIRouter(prefix="/reconstruction", tags=["Statement Reconstruction"])


@router.post("/submit", response_model=ReconstructionResponse, status_code=status.HTTP_201_CREATED)
def submit_for_reconstruction(
    recon_req: ReconstructionRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Submits a victim statement to the AI reconstruction pipeline.
    Reconstructs fragmented sentences into coherent language while strictly preserving uncertainty
    and refusing to hallucinate missing facts.
    """
    statement = db.query(Statement).filter(Statement.id == recon_req.statement_id).first()
    if not statement:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Statement not found")

    check_case_access(statement.case, current_user)

    # Perform AI reconstruction
    llm_output = reconstruction_service.reconstruct(
        original_text=statement.original_text
    )

    reconstruction = Reconstruction(
        statement_id=statement.id,
        case_id=statement.case_id,
        reconstructed_statement=llm_output.get("reconstructed_statement", ""),
        unclear_portions=llm_output.get("unclear_portions", []),
        missing_information=llm_output.get("missing_information", []),
        preserved_uncertainties=llm_output.get("preserved_uncertainties", []),
        requires_victim_review=True,
        is_approved=False
    )
    db.add(reconstruction)
    db.commit()
    db.refresh(reconstruction)

    create_audit_log(
        db=db,
        action="STATEMENT_RECONSTRUCTED",
        target_type="Reconstruction",
        target_id=reconstruction.id,
        user_id=current_user.id,
        details=f"Generated AI reconstruction #{reconstruction.id} for statement #{statement.id}",
        ip_address=request.client.host if request.client else None
    )

    return reconstruction


@router.get("/{reconstruction_id}", response_model=ReconstructionResponse)
def get_reconstruction(
    reconstruction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Views an individual statement reconstruction."""
    reconstruction = db.query(Reconstruction).filter(Reconstruction.id == reconstruction_id).first()
    if not reconstruction:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reconstruction not found")

    check_case_access(reconstruction.statement.case, current_user)
    return reconstruction


@router.get("/statement/{statement_id}", response_model=List[ReconstructionResponse])
def get_statement_reconstructions(
    statement_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves all previous reconstructions generated for a specific statement."""
    statement = db.query(Statement).filter(Statement.id == statement_id).first()
    if not statement:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Statement not found")

    check_case_access(statement.case, current_user)

    reconstructions = (
        db.query(Reconstruction)
        .filter(Reconstruction.statement_id == statement_id)
        .order_by(Reconstruction.created_at.desc())
        .all()
    )
    return reconstructions


@router.post("/{reconstruction_id}/approve", response_model=ReconstructionResponse)
def approve_reconstruction(
    reconstruction_id: int,
    approval: ReconstructionApproval,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Victim approval/rejection endpoint.
    Ethical requirement: Reconstructed statements MUST have victim review before being treated as approved.
    """
    reconstruction = db.query(Reconstruction).filter(Reconstruction.id == reconstruction_id).first()
    if not reconstruction:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reconstruction not found")

    case = reconstruction.statement.case
    check_case_access(case, current_user, write_access=True)

    reconstruction.is_approved = approval.is_approved
    reconstruction.victim_feedback = approval.feedback
    if approval.is_approved:
        reconstruction.approved_at = datetime.now(timezone.utc)
        reconstruction.statement.status = "approved"

    db.commit()
    db.refresh(reconstruction)

    create_audit_log(
        db=db,
        action="RECONSTRUCTION_APPROVED" if approval.is_approved else "RECONSTRUCTION_DISAPPROVED",
        target_type="Reconstruction",
        target_id=reconstruction.id,
        user_id=current_user.id,
        details=f"Reconstruction #{reconstruction.id} approval status set to {approval.is_approved}",
        ip_address=request.client.host if request.client else None
    )

    return reconstruction


@router.post("/{reconstruction_id}/correct", response_model=ReconstructionResponse)
def request_reconstruction_correction(
    reconstruction_id: int,
    correction: ReconstructionCorrectionRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Allows the victim or authorized lawyer to request corrections.
    Re-runs reconstruction with feedback, producing a new Reconstruction record.
    """
    old_recon = db.query(Reconstruction).filter(Reconstruction.id == reconstruction_id).first()
    if not old_recon:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reconstruction not found")

    statement = old_recon.statement
    check_case_access(statement.case, current_user, write_access=True)

    # Re-run LLM reconstruction taking user correction notes into account
    llm_output = reconstruction_service.reconstruct(
        original_text=statement.original_text,
        correction_feedback=correction.correction_notes
    )

    new_recon = Reconstruction(
        statement_id=statement.id,
        case_id=statement.case_id,
        reconstructed_statement=llm_output.get("reconstructed_statement", ""),
        unclear_portions=llm_output.get("unclear_portions", []),
        missing_information=llm_output.get("missing_information", []),
        preserved_uncertainties=llm_output.get("preserved_uncertainties", []),
        requires_victim_review=True,
        is_approved=False,
        victim_feedback=f"Requested correction: {correction.correction_notes}"
    )
    db.add(new_recon)
    db.commit()
    db.refresh(new_recon)

    create_audit_log(
        db=db,
        action="RECONSTRUCTION_CORRECTION_REQUESTED",
        target_type="Reconstruction",
        target_id=new_recon.id,
        user_id=current_user.id,
        details=f"Created revised reconstruction #{new_recon.id} with correction notes",
        ip_address=request.client.host if request.client else None
    )

    return new_recon
