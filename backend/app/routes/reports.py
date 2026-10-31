import os
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.security import get_current_user, require_roles
from app.core.audit import create_audit_log
from app.database.session import get_db
from app.models.case import Case
from app.models.statement import Statement
from app.models.reconstruction import Reconstruction
from app.models.claim import Claim
from app.models.evidence import Evidence
from app.models.verification import Verification
from app.models.timeline import Event
from app.models.investigation import Investigation
from app.models.report import Report
from app.models.user import User
from app.schemas.report import ReportGenerateRequest, ReportResponse
from app.services.report_service import report_service
from app.services.contradiction_service import contradiction_service
from app.routes.deps import check_case_access

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.post("/generate", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
def generate_report(
    rep_req: ReportGenerateRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["investigator", "admin"]))
):
    """
    Generates a downloadable forensic investigation PDF report.
    Integrates statements, approved reconstructions, extracted claims, evidence, verification assessments,
    contradiction analysis, timeline events, and alternative hypotheses.
    """
    case = db.query(Case).filter(Case.id == rep_req.case_id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    check_case_access(case, current_user, write_access=True)

    # Gather case entities
    statements = db.query(Statement).filter(Statement.case_id == case.id).all()
    reconstructions = db.query(Reconstruction).filter(Reconstruction.case_id == case.id).all()
    claims = db.query(Claim).filter(Claim.case_id == case.id).all()
    evidence_items = db.query(Evidence).filter(Evidence.case_id == case.id).all()
    verifications = db.query(Verification).filter(Verification.case_id == case.id).all()
    events = db.query(Event).filter(Event.case_id == case.id).order_by(Event.id.asc()).all()
    investigations = db.query(Investigation).filter(Investigation.case_id == case.id).all()

    # Dynamic contradiction analysis for report
    claims_dicts = [{"id": c.id, "claim_text": c.claim_text, "times": c.times, "dates": c.dates, "locations": c.locations, "uncertainty_notes": c.uncertainty_notes} for c in claims]
    ev_dicts = [{"id": e.id, "title": e.title, "filename": e.filename, "extracted_text": e.extracted_text} for e in evidence_items]
    contradictions = contradiction_service.detect_contradictions(claims=claims_dicts, evidence_items=ev_dicts)

    case_dict = {
        "id": case.id,
        "title": case.title,
        "description": case.description,
        "status": case.status,
        "victim_id": case.victim_id,
        "investigator_id": case.investigator_id
    }

    report_title = rep_req.title or f"Investigation Report - {case.title}"

    pdf_path = report_service.generate_pdf_report(
        case_data=case_dict,
        original_statements=[{"id": s.id, "version": s.version, "original_text": s.original_text} for s in statements],
        approved_reconstructions=[{
            "id": r.id,
            "reconstructed_statement": r.reconstructed_statement,
            "preserved_uncertainties": r.preserved_uncertainties,
            "is_approved": r.is_approved
        } for r in reconstructions],
        claims=[{
            "id": c.id,
            "claim_text": c.claim_text,
            "people": c.people,
            "locations": c.locations,
            "times": c.times,
            "uncertainty_notes": c.uncertainty_notes
        } for c in claims],
        evidence_items=[{
            "id": e.id,
            "filename": e.filename,
            "original_filename": e.original_filename,
            "file_type": e.file_type,
            "extracted_text": e.extracted_text
        } for e in evidence_items],
        verifications=[{
            "claim_id": v.claim_id,
            "status": v.status,
            "explanation": v.explanation,
            "evidence_ids": v.evidence_ids,
            "limitations": v.limitations
        } for v in verifications],
        contradictions=contradictions,
        timeline_events=[{
            "date_time_str": ev.date_time_str,
            "time_precision": ev.time_precision,
            "description": ev.description
        } for ev in events],
        investigations=[{
            "label": inv.label,
            "hypothesis_text": inv.hypothesis_text,
            "assumptions": inv.assumptions,
            "missing_information": inv.missing_information,
            "is_counterfactual": inv.is_counterfactual
        } for inv in investigations]
    )

    report_record = Report(
        case_id=case.id,
        generated_by=current_user.id,
        report_type=rep_req.report_type,
        title=report_title,
        file_path=pdf_path
    )
    db.add(report_record)
    db.commit()
    db.refresh(report_record)

    create_audit_log(
        db=db,
        action="REPORT_GENERATED",
        target_type="Report",
        target_id=report_record.id,
        user_id=current_user.id,
        details=f"Generated PDF investigation report #{report_record.id} for case #{case.id}",
        ip_address=request.client.host if request.client else None
    )

    base_url = str(request.base_url).rstrip("/")
    download_url = f"{base_url}/api/reports/{report_record.id}/download"

    return ReportResponse(
        id=report_record.id,
        case_id=report_record.case_id,
        generated_by=report_record.generated_by,
        report_type=report_record.report_type,
        title=report_record.title,
        file_path=report_record.file_path,
        download_url=download_url,
        created_at=report_record.created_at
    )


@router.get("/case/{case_id}", response_model=List[ReportResponse])
def get_case_reports(
    case_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lists all PDF reports generated for a case."""
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    check_case_access(case, current_user)

    reports = db.query(Report).filter(Report.case_id == case_id).order_by(Report.created_at.desc()).all()
    base_url = str(request.base_url).rstrip("/")
    
    results = []
    for r in reports:
        resp = ReportResponse(
            id=r.id,
            case_id=r.case_id,
            generated_by=r.generated_by,
            report_type=r.report_type,
            title=r.title,
            file_path=r.file_path,
            download_url=f"{base_url}/api/reports/{r.id}/download",
            created_at=r.created_at
        )
        results.append(resp)
    return results


@router.get("/{report_id}/download")
def download_report(
    report_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Downloads a generated PDF report."""
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")

    check_case_access(report.case, current_user)

    if not os.path.exists(report.file_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Physical PDF report file not found on disk")

    create_audit_log(
        db=db,
        action="REPORT_DOWNLOADED",
        target_type="Report",
        target_id=report.id,
        user_id=current_user.id,
        details=f"Downloaded report #{report.id}",
        ip_address=request.client.host if request.client else None
    )

    return FileResponse(
        path=report.file_path,
        filename=os.path.basename(report.file_path),
        media_type="application/pdf"
    )
