from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from app.core.security import get_current_user, require_roles
from app.core.audit import create_audit_log
from app.database.session import get_db
from app.models.case import Case
from app.models.claim import Claim
from app.models.evidence import Evidence
from app.models.investigation import Investigation
from app.models.user import User
from app.schemas.investigation import (
    HypothesisGenerateRequest,
    CounterfactualRequest,
    InvestigationResponse,
    InvestigationListResponse
)
from app.services.investigation_service import investigation_service
from app.routes.deps import check_case_access

router = APIRouter(prefix="/investigations", tags=["Investigation Analysis"])


@router.post("/hypotheses", response_model=List[InvestigationResponse], status_code=status.HTTP_201_CREATED)
def generate_alternative_hypotheses(
    hypo_req: HypothesisGenerateRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["investigator", "admin"]))
):
    """
    Generates alternative investigative hypotheses exploring different factual explanations.
    Links hypotheses to supporting and conflicting evidence IDs and highlights assumptions.
    Never determines guilt or innocence.
    """
    case = db.query(Case).filter(Case.id == hypo_req.case_id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    check_case_access(case, current_user, write_access=True)

    claims = db.query(Claim).filter(Claim.case_id == case.id).all()
    evidence_items = db.query(Evidence).filter(Evidence.case_id == case.id).all()

    claims_dicts = [{"id": c.id, "claim_text": c.claim_text} for c in claims]
    evidence_dicts = [{"id": e.id, "title": e.title, "filename": e.filename} for e in evidence_items]

    hypotheses_data = investigation_service.generate_hypotheses(
        claims=claims_dicts,
        evidence_items=evidence_dicts,
        focus_topic=hypo_req.focus_topic
    )

    created_records = []
    for h in hypotheses_data:
        inv = Investigation(
            case_id=case.id,
            label=h.get("label", "Investigative Hypothesis"),
            hypothesis_text=h.get("hypothesis_text", ""),
            supporting_evidence_ids=h.get("supporting_evidence_ids", []),
            conflicting_evidence_ids=h.get("conflicting_evidence_ids", []),
            assumptions=h.get("assumptions", []),
            missing_information=h.get("missing_information", []),
            is_counterfactual=False
        )
        db.add(inv)
        created_records.append(inv)

    db.commit()
    for rec in created_records:
        db.refresh(rec)

    create_audit_log(
        db=db,
        action="HYPOTHESES_GENERATED",
        target_type="Investigation",
        target_id=case.id,
        user_id=current_user.id,
        details=f"Generated {len(created_records)} alternative hypotheses for case #{case.id}",
        ip_address=request.client.host if request.client else None
    )

    return created_records


@router.post("/counterfactual", response_model=InvestigationResponse, status_code=status.HTTP_201_CREATED)
def run_counterfactual_analysis(
    counter_req: CounterfactualRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["investigator", "admin"]))
):
    """
    Executes a hypothetical counterfactual 'what-if' analysis.
    Clearly isolates hypothetical scenarios and strictly avoids inserting them into the case timeline.
    """
    case = db.query(Case).filter(Case.id == counter_req.case_id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    check_case_access(case, current_user, write_access=True)

    claims = db.query(Claim).filter(Claim.case_id == case.id).all()
    evidence_items = db.query(Evidence).filter(Evidence.case_id == case.id).all()

    claims_dicts = [{"id": c.id, "claim_text": c.claim_text} for c in claims]
    evidence_dicts = [{"id": e.id, "title": e.title, "filename": e.filename} for e in evidence_items]

    h_data = investigation_service.generate_counterfactual(
        claims=claims_dicts,
        evidence_items=evidence_dicts,
        counterfactual_premise=counter_req.counterfactual_premise
    )

    inv = Investigation(
        case_id=case.id,
        label=h_data.get("label", "HYPOTHETICAL COUNTERFACTUAL SCENARIO"),
        hypothesis_text=h_data.get("hypothesis_text", ""),
        supporting_evidence_ids=h_data.get("supporting_evidence_ids", []),
        conflicting_evidence_ids=h_data.get("conflicting_evidence_ids", []),
        assumptions=h_data.get("assumptions", []),
        missing_information=h_data.get("missing_information", []),
        is_counterfactual=True
    )
    db.add(inv)
    db.commit()
    db.refresh(inv)

    create_audit_log(
        db=db,
        action="COUNTERFACTUAL_ANALYSIS_GENERATED",
        target_type="Investigation",
        target_id=inv.id,
        user_id=current_user.id,
        details=f"Generated counterfactual scenario #{inv.id} for case #{case.id}",
        ip_address=request.client.host if request.client else None
    )

    return inv


@router.get("/case/{case_id}", response_model=InvestigationListResponse)
def get_case_investigations(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves all hypotheses and counterfactual scenarios for a case."""
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    check_case_access(case, current_user)

    hypotheses = db.query(Investigation).filter(
        Investigation.case_id == case_id,
        Investigation.is_counterfactual == False
    ).order_by(Investigation.created_at.desc()).all()

    counterfactuals = db.query(Investigation).filter(
        Investigation.case_id == case_id,
        Investigation.is_counterfactual == True
    ).order_by(Investigation.created_at.desc()).all()

    return InvestigationListResponse(
        case_id=case.id,
        hypotheses=[InvestigationResponse.model_validate(h) for h in hypotheses],
        counterfactual_scenarios=[InvestigationResponse.model_validate(c) for c in counterfactuals]
    )
