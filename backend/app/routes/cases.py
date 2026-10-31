from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from app.core.security import get_current_user, require_roles
from app.core.audit import create_audit_log
from app.database.session import get_db
from app.models.case import Case
from app.models.user import User
from app.models.audit_log import AuditLog
from app.schemas.case import (
    CaseCreate,
    CaseUpdate,
    CaseResponse,
    CaseDetailResponse,
    CaseAssignInvestigator,
    CaseActivityItem
)
from app.routes.deps import check_case_access

router = APIRouter(prefix="/cases", tags=["Cases"])


@router.post("", response_model=CaseResponse, status_code=status.HTTP_201_CREATED)
def create_case(
    case_in: CaseCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Creates a new case.
    - If caller is a victim, case is automatically associated with them.
    - If caller is an investigator, they can specify the victim_id or default to themselves as manager.
    """
    if current_user.role == "victim":
        victim_id = current_user.id
    else:
        victim_id = case_in.victim_id or current_user.id

    # Verify victim exists
    victim = db.query(User).filter(User.id == victim_id).first()
    if not victim:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Target victim user with ID {victim_id} does not exist."
        )

    investigator_id = case_in.investigator_id
    if current_user.role == "investigator" and not investigator_id:
        investigator_id = current_user.id

    case = Case(
        title=case_in.title,
        description=case_in.description,
        status="open",
        victim_id=victim_id,
        investigator_id=investigator_id
    )
    db.add(case)
    db.commit()
    db.refresh(case)

    create_audit_log(
        db=db,
        action="CASE_CREATED",
        target_type="Case",
        target_id=case.id,
        user_id=current_user.id,
        details=f"Created case '{case.title}' with victim ID {victim_id}",
        ip_address=request.client.host if request.client else None
    )

    return case


@router.get("", response_model=List[CaseResponse])
def list_cases(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieves all authorized cases for current user.
    - Victims only retrieve cases where they are the victim.
    - Investigators & Admins can access all cases in the jurisdiction.
    """
    if current_user.role == "victim":
        cases = db.query(Case).filter(Case.victim_id == current_user.id).order_by(Case.created_at.desc()).all()
    else:
        cases = db.query(Case).order_by(Case.created_at.desc()).all()
    return cases


@router.get("/{case_id}", response_model=CaseDetailResponse)
def get_case(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves full case details, entity counts, and recent activity logs."""
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    check_case_access(case, current_user)

    # Fetch recent activity logs for this case
    activity_logs = db.query(AuditLog).filter(
        AuditLog.target_type == "Case",
        AuditLog.target_id == case.id
    ).order_by(AuditLog.timestamp.desc()).limit(15).all()

    activity_items = [
        CaseActivityItem(
            id=log.id,
            action=log.action,
            target_type=log.target_type,
            target_id=log.target_id,
            details=log.details,
            timestamp=log.timestamp
        )
        for log in activity_logs
    ]

    return CaseDetailResponse(
        id=case.id,
        title=case.title,
        description=case.description,
        status=case.status,
        victim_id=case.victim_id,
        investigator_id=case.investigator_id,
        created_at=case.created_at,
        updated_at=case.updated_at,
        victim=case.victim,
        investigator=case.investigator,
        statement_count=len(case.statements),
        evidence_count=len(case.evidence),
        claim_count=len(case.claims),
        recent_activity=activity_items
    )


@router.put("/{case_id}", response_model=CaseResponse)
def update_case(
    case_id: int,
    case_in: CaseUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Updates case title, description, status, or assigned investigator."""
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    check_case_access(case, current_user, write_access=True)

    if case_in.title is not None:
        case.title = case_in.title
    if case_in.description is not None:
        case.description = case_in.description
    if case_in.status is not None:
        case.status = case_in.status
    if case_in.investigator_id is not None:
        case.investigator_id = case_in.investigator_id

    db.commit()
    db.refresh(case)

    create_audit_log(
        db=db,
        action="CASE_UPDATED",
        target_type="Case",
        target_id=case.id,
        user_id=current_user.id,
        details=f"Updated case #{case.id} status to '{case.status}'",
        ip_address=request.client.host if request.client else None
    )

    return case


@router.put("/{case_id}/assign", response_model=CaseResponse)
def assign_investigator(
    case_id: int,
    assign_in: CaseAssignInvestigator,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["investigator", "admin"]))
):
    """Assigns an investigator to a case."""
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    investigator = db.query(User).filter(User.id == assign_in.investigator_id, User.role == "investigator").first()
    if not investigator:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Investigator user not found")

    case.investigator_id = investigator.id
    db.commit()
    db.refresh(case)

    create_audit_log(
        db=db,
        action="CASE_INVESTIGATOR_ASSIGNED",
        target_type="Case",
        target_id=case.id,
        user_id=current_user.id,
        details=f"Assigned investigator ID {investigator.id} to case #{case.id}",
        ip_address=request.client.host if request.client else None
    )

    return case


@router.get("/{case_id}/activity", response_model=List[CaseActivityItem])
def get_case_activity(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves full chronological audit activity history for a case."""
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    check_case_access(case, current_user)

    logs = db.query(AuditLog).filter(
        AuditLog.target_type == "Case",
        AuditLog.target_id == case.id
    ).order_by(AuditLog.timestamp.desc()).all()

    return [
        CaseActivityItem(
            id=l.id,
            action=l.action,
            target_type=l.target_type,
            target_id=l.target_id,
            details=l.details,
            timestamp=l.timestamp
        )
        for l in logs
    ]
