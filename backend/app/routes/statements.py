from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.core.audit import create_audit_log
from app.database.session import get_db
from app.models.case import Case
from app.models.statement import Statement
from app.models.user import User
from app.schemas.statement import StatementCreate, StatementUpdate, StatementResponse
from app.routes.deps import check_case_access

router = APIRouter(prefix="/statements", tags=["Statements"])


@router.post("", response_model=StatementResponse, status_code=status.HTTP_201_CREATED)
def submit_statement(
    statement_in: StatementCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Submits an original fragmented statement or saves a draft.
    The original statement text is permanently preserved and never overwritten.
    """
    case = db.query(Case).filter(Case.id == statement_in.case_id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    check_case_access(case, current_user, write_access=True)

    # Determine version number for statements in this case
    prev_statements = db.query(Statement).filter(Statement.case_id == case.id).all()
    version = len(prev_statements) + 1

    statement = Statement(
        case_id=case.id,
        victim_id=case.victim_id,
        original_text=statement_in.original_text,
        is_draft=statement_in.is_draft,
        version=version,
        audio_file_path=statement_in.audio_file_path,
        language=statement_in.language or "en",
        transcript_source=statement_in.transcript_source or "typed",
        status="draft" if statement_in.is_draft else "submitted"
    )
    db.add(statement)
    db.commit()
    db.refresh(statement)

    create_audit_log(
        db=db,
        action="STATEMENT_SUBMITTED" if not statement.is_draft else "STATEMENT_DRAFT_SAVED",
        target_type="Statement",
        target_id=statement.id,
        user_id=current_user.id,
        details=f"Statement ID {statement.id} version {version} ({'draft' if statement.is_draft else 'submitted'}) for case #{case.id}",
        ip_address=request.client.host if request.client else None
    )

    return statement


@router.get("/case/{case_id}", response_model=List[StatementResponse])
def get_case_statements(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves all statements recorded for a case."""
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    check_case_access(case, current_user)

    statements = db.query(Statement).filter(Statement.case_id == case_id).order_by(Statement.version.asc()).all()
    return statements


@router.get("/{statement_id}", response_model=StatementResponse)
def get_statement(
    statement_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves a single statement by ID including historical reconstructions."""
    statement = db.query(Statement).filter(Statement.id == statement_id).first()
    if not statement:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Statement not found")

    check_case_access(statement.case, current_user)
    return statement


@router.put("/{statement_id}", response_model=StatementResponse)
def update_statement(
    statement_id: int,
    statement_in: StatementUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Updates an in-progress draft statement.
    If the statement was already finalized/submitted, a new version is created to preserve immutability.
    """
    statement = db.query(Statement).filter(Statement.id == statement_id).first()
    if not statement:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Statement not found")

    check_case_access(statement.case, current_user, write_access=True)

    if statement.is_draft:
        # Can update draft directly
        if statement_in.original_text is not None:
            statement.original_text = statement_in.original_text
        if statement_in.is_draft is not None:
            statement.is_draft = statement_in.is_draft
            statement.status = "draft" if statement.is_draft else "submitted"
        db.commit()
        db.refresh(statement)
        return statement
    else:
        # Immutability requirement: create a new version rather than overwriting finalized statement
        new_version_num = statement.version + 1
        new_statement = Statement(
            case_id=statement.case_id,
            victim_id=statement.victim_id,
            original_text=statement_in.original_text or statement.original_text,
            is_draft=statement_in.is_draft if statement_in.is_draft is not None else False,
            version=new_version_num,
            status="draft" if statement_in.is_draft else "submitted"
        )
        db.add(new_statement)
        db.commit()
        db.refresh(new_statement)

        create_audit_log(
            db=db,
            action="STATEMENT_NEW_VERSION_CREATED",
            target_type="Statement",
            target_id=new_statement.id,
            user_id=current_user.id,
            details=f"Created version {new_version_num} for case #{statement.case_id} to preserve original statement immutable",
            ip_address=request.client.host if request.client else None
        )
        return new_statement
