from typing import Optional
from sqlalchemy.orm import Session
import logging

logger = logging.getLogger("fragment_first.audit")


def create_audit_log(
    db: Session,
    action: str,
    target_type: str,
    target_id: Optional[int] = None,
    user_id: Optional[int] = None,
    details: Optional[str] = None,
    ip_address: Optional[str] = None
):
    """
    Records security and operational audit actions in the database.
    Strictly avoids logging raw confidential statement text or sensitive evidence payloads.
    """
    from app.models.audit_log import AuditLog
    
    try:
        log_entry = AuditLog(
            user_id=user_id,
            action=action,
            target_type=target_type,
            target_id=target_id,
            details=details,
            ip_address=ip_address
        )
        db.add(log_entry)
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to record audit log: {e}")
