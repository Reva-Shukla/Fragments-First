from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from app.core.security import get_current_user, require_roles
from app.core.audit import create_audit_log
from app.database.session import get_db
from app.models.case import Case
from app.models.claim import Claim
from app.models.evidence import Evidence
from app.models.timeline import Event
from app.models.user import User
from app.schemas.timeline import (
    EventCreate,
    EventResponse,
    TimelineResponse
)
from app.services.timeline_service import timeline_service
from app.routes.deps import check_case_access

router = APIRouter(prefix="/timeline", tags=["Timeline"])


@router.post("/generate/{case_id}", response_model=TimelineResponse, status_code=status.HTTP_201_CREATED)
def generate_timeline_endpoint(
    case_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["investigator", "admin"]))
):
    """
    Generates a chronological timeline from case claims and documentary evidence.
    Strictly preserves precision (exact, approximate, unknown) without inventing timestamps.
    """
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    check_case_access(case, current_user, write_access=True)

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
            "metadata_json": e.metadata_json
        }
        for e in evidence_items
    ]

    events_data = timeline_service.generate_timeline(
        claims=claims_dicts,
        evidence_items=evidence_dicts
    )

    # Clear existing auto-generated events for fresh regeneration if desired
    db.query(Event).filter(Event.case_id == case.id).delete()

    created_events = []
    for ev in events_data:
        event_obj = Event(
            case_id=case.id,
            description=ev.get("description", ""),
            date_time_str=ev.get("date_time_str"),
            time_precision=ev.get("time_precision", "approximate"),
            source_type=ev.get("source_type", "claim"),
            source_id=ev.get("source_id"),
            related_claim_ids=ev.get("related_claim_ids", []),
            is_uncertain=ev.get("is_uncertain", False)
        )
        db.add(event_obj)
        created_events.append(event_obj)

    db.commit()
    for e in created_events:
        db.refresh(e)

    create_audit_log(
        db=db,
        action="TIMELINE_GENERATED",
        target_type="Timeline",
        target_id=case.id,
        user_id=current_user.id,
        details=f"Generated {len(created_events)} chronological events for case #{case.id}",
        ip_address=request.client.host if request.client else None
    )

    return TimelineResponse(
        case_id=case.id,
        total_events=len(created_events),
        events=[EventResponse.model_validate(e) for e in created_events]
    )


@router.get("/case/{case_id}", response_model=TimelineResponse)
def get_case_timeline(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves all chronological events for a case."""
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    check_case_access(case, current_user)

    events = db.query(Event).filter(Event.case_id == case.id).order_by(Event.id.asc()).all()
    return TimelineResponse(
        case_id=case.id,
        total_events=len(events),
        events=[EventResponse.model_validate(e) for e in events]
    )


@router.post("/event", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
def add_custom_event(
    event_in: EventCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["investigator", "admin"]))
):
    """Manually adds an event into the case timeline."""
    case = db.query(Case).filter(Case.id == event_in.case_id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    check_case_access(case, current_user, write_access=True)

    event_obj = Event(
        case_id=case.id,
        description=event_in.description,
        date_time_str=event_in.date_time_str,
        time_precision=event_in.time_precision,
        source_type=event_in.source_type,
        source_id=event_in.source_id,
        related_claim_ids=event_in.related_claim_ids,
        is_uncertain=event_in.is_uncertain
    )
    db.add(event_obj)
    db.commit()
    db.refresh(event_obj)

    create_audit_log(
        db=db,
        action="TIMELINE_EVENT_ADDED",
        target_type="Event",
        target_id=event_obj.id,
        user_id=current_user.id,
        details=f"Added custom timeline event for case #{case.id}",
        ip_address=request.client.host if request.client else None
    )

    return event_obj
