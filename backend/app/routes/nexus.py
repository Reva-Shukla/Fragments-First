"""
Nexus Intelligence Routes — Fragment First 2.0

All routes require investigator or admin role.
All results are explicitly labeled as AI-generated suggestions requiring human review.
Cross-case access is strictly limited to cases the investigator is authorized to view.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy.orm import Session

from app.core.security import get_current_user, require_roles
from app.core.audit import create_audit_log
from app.database.session import get_db
from app.models.user import User
from app.models.case import Case
from app.models.nexus import NexusConnection
from app.models.entity import ExtractedEntity
from app.models.statement import Statement
from app.models.evidence import Evidence
from app.routes.deps import check_case_access
from app.services.nexus_service import nexus_service

router = APIRouter(prefix="/nexus", tags=["Nexus Intelligence"])


def _authorized_case_ids(current_user: User, db: Session) -> List[int]:
    """Returns IDs of all cases this investigator is authorized to access."""
    if current_user.role == "admin":
        return [c.id for c in db.query(Case).all()]
    # Investigators see cases assigned to them
    cases = db.query(Case).filter(
        (Case.investigator_id == current_user.id)
    ).all()
    return [c.id for c in cases]


# ── Entity Extraction ─────────────────────────────────────────────────────────

@router.post(
    "/extract/{case_id}",
    summary="Extract entities from all records in a case",
    status_code=status.HTTP_200_OK,
)
def extract_entities(
    case_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["investigator", "admin"])),
):
    """
    Runs AI entity extraction on all statements and evidence text for a case.
    Results are stored and labeled as AI-generated hypotheses requiring verification.
    Existing entities for this case are NOT deleted — new ones are appended.
    """
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found.")
    check_case_access(case, current_user)

    total_extracted = 0

    # Extract from statements
    statements = db.query(Statement).filter(Statement.case_id == case_id).all()
    for stmt in statements:
        if stmt.original_text:
            entities = nexus_service.extract_entities(
                text=stmt.original_text,
                case_id=case_id,
                statement_id=stmt.id,
                db=db,
            )
            total_extracted += len(entities)

    # Extract from evidence text
    evidence_items = db.query(Evidence).filter(Evidence.case_id == case_id).all()
    for ev in evidence_items:
        text = ev.extracted_text or ev.transcription or ""
        if text:
            entities = nexus_service.extract_entities(
                text=text,
                case_id=case_id,
                evidence_id=ev.id,
                db=db,
            )
            total_extracted += len(entities)

    create_audit_log(
        db=db,
        action="NEXUS_ENTITY_EXTRACTION",
        target_type="Case",
        target_id=case_id,
        user_id=current_user.id,
        details=f"Extracted {total_extracted} entities from case #{case_id}",
        ip_address=request.client.host if request.client else None,
    )

    return {
        "case_id": case_id,
        "entities_extracted": total_extracted,
        "status": "complete",
        "ethical_note": (
            "All extracted entities are AI-generated hypotheses. "
            "They require investigator verification before being treated as facts."
        ),
    }


@router.get(
    "/entities/{case_id}",
    summary="List extracted entities for a case",
)
def get_entities(
    case_id: int,
    entity_type: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["investigator", "admin"])),
):
    """Returns all AI-extracted entities for a case, filterable by type."""
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found.")
    check_case_access(case, current_user)

    query = db.query(ExtractedEntity).filter(
        ExtractedEntity.case_id == case_id,
        ExtractedEntity.is_redacted == False,
    )
    if entity_type:
        query = query.filter(ExtractedEntity.entity_type == entity_type.upper())

    entities = query.order_by(ExtractedEntity.confidence_score.desc()).all()

    return {
        "case_id": case_id,
        "total": len(entities),
        "entities": [
            {
                "id": e.id,
                "entity_type": e.entity_type,
                "entity_value": e.entity_value,
                "normalized_value": e.normalized_value,
                "context_snippet": e.context_snippet,
                "confidence_score": e.confidence_score,
                "is_verified": e.is_verified,
                "is_ai_generated": e.is_ai_generated,
                "statement_id": e.statement_id,
                "evidence_id": e.evidence_id,
                "created_at": e.created_at.isoformat(),
            }
            for e in entities
        ],
    }


# ── Cross-Case Connection Analysis ────────────────────────────────────────────

@router.post(
    "/analyze/{case_id}",
    summary="Find cross-case connections for a case",
    status_code=status.HTTP_200_OK,
)
def analyze_connections(
    case_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["investigator", "admin"])),
):
    """
    Compares entities in this case against other authorized cases to find
    POSSIBLE connections. All suggestions are:
      - Labeled as AI-generated
      - Marked pending_review
      - Accompanied by source excerpts and rationale
      - Never presented as facts
    """
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found.")
    check_case_access(case, current_user)

    authorized_ids = _authorized_case_ids(current_user, db)
    if case_id not in authorized_ids:
        raise HTTPException(status_code=403, detail="Not authorized for this case.")

    connections = nexus_service.find_connections(
        case_id=case_id,
        authorized_case_ids=authorized_ids,
        db=db,
    )

    create_audit_log(
        db=db,
        action="NEXUS_CROSS_CASE_ANALYSIS",
        target_type="Case",
        target_id=case_id,
        user_id=current_user.id,
        details=f"Nexus analysis found {len(connections)} possible connections for case #{case_id}",
        ip_address=request.client.host if request.client else None,
    )

    return {
        "case_id": case_id,
        "connections_found": len(connections),
        "connections": connections,
        "ethical_disclaimer": (
            "These are AI-suggested POSSIBLE connections only. "
            "They have NOT been verified. Similar names, locations, or identifiers "
            "do not prove that two records involve the same person or event. "
            "All connections require investigator review before any action is taken."
        ),
    }


@router.get("/connections", summary="List all pending nexus connections")
def list_connections(
    review_status: Optional[str] = Query(default=None),
    case_id: Optional[int] = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["investigator", "admin"])),
):
    """Returns nexus connections for authorized cases, filterable by review status."""
    authorized_ids = _authorized_case_ids(current_user, db)

    query = db.query(NexusConnection).filter(
        NexusConnection.source_case_id.in_(authorized_ids)
    )
    if review_status:
        query = query.filter(NexusConnection.review_status == review_status)
    if case_id:
        query = query.filter(
            (NexusConnection.source_case_id == case_id) |
            (NexusConnection.target_case_id == case_id)
        )

    conns = query.order_by(NexusConnection.confidence_score.desc()).limit(100).all()

    return {
        "total": len(conns),
        "connections": [
            {
                "id": c.id,
                "source_case_id": c.source_case_id,
                "target_case_id": c.target_case_id,
                "connection_type": c.connection_type,
                "rationale": c.rationale,
                "supporting_text_a": c.supporting_text_a,
                "supporting_text_b": c.supporting_text_b,
                "confidence_score": c.confidence_score,
                "confidence_label": c.confidence_label,
                "review_status": c.review_status,
                "review_notes": c.review_notes,
                "is_ai_generated": c.is_ai_generated,
                "created_at": c.created_at.isoformat(),
            }
            for c in conns
        ],
    }


@router.patch("/connections/{connection_id}/review", summary="Review a nexus connection")
def review_connection(
    connection_id: int,
    review_status: str,
    notes: Optional[str] = None,
    request: Request = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["investigator", "admin"])),
):
    """Investigator confirms, rejects, or flags a suggested connection for follow-up."""
    from datetime import datetime, timezone

    valid_statuses = {"confirmed", "rejected", "needs_more_info", "pending_review"}
    if review_status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid review_status. Use one of: {valid_statuses}",
        )

    conn = db.query(NexusConnection).filter(NexusConnection.id == connection_id).first()
    if not conn:
        raise HTTPException(status_code=404, detail="Connection not found.")

    authorized_ids = _authorized_case_ids(current_user, db)
    if conn.source_case_id not in authorized_ids:
        raise HTTPException(status_code=403, detail="Not authorized to review this connection.")

    conn.review_status = review_status
    conn.reviewed_by = current_user.id
    conn.review_notes = notes
    conn.reviewed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(conn)

    return {"id": conn.id, "review_status": conn.review_status, "message": "Connection review recorded."}


# ── Connection Graph Data ─────────────────────────────────────────────────────

@router.get("/graph", summary="Get graph nodes and edges for visualization")
def get_graph(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["investigator", "admin"])),
):
    """
    Returns graph nodes (cases, entities) and edges (connections) for
    the visual connection graph. Limited to authorized cases only.
    """
    authorized_ids = _authorized_case_ids(current_user, db)
    graph = nexus_service.get_graph_data(authorized_ids, db)
    return graph


# ── AI Investigation Assistant ────────────────────────────────────────────────

@router.post("/query", summary="Ask the AI investigation assistant a question")
def ai_query(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["investigator", "admin"])),
    question: str = Query(..., description="Natural language investigation question"),
):
    """
    Answers a natural-language question about authorized case records.
    Sources every answer with citations. States when information is unavailable.
    Never invents evidence or declares guilt.
    """
    if not question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")
    if len(question) > 1000:
        raise HTTPException(status_code=400, detail="Question too long (max 1000 characters).")

    authorized_ids = _authorized_case_ids(current_user, db)
    result = nexus_service.answer_query(
        question=question,
        authorized_case_ids=authorized_ids,
        db=db,
    )

    create_audit_log(
        db=db,
        action="AI_QUERY",
        target_type="Query",
        target_id=None,
        user_id=current_user.id,
        details=f"AI query: '{question[:100]}...' across {len(authorized_ids)} authorized cases",
        ip_address=request.client.host if request.client else None,
    )

    return result
