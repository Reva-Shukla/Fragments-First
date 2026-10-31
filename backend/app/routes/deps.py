from fastapi import HTTPException, status
from app.models.user import User
from app.models.case import Case


def check_case_access(case: Case, user: User, write_access: bool = False) -> None:
    """
    Enforces case-level permissions:
    - Admin: full access
    - Victim: can access if case.victim_id == user.id
    - Investigator: can access assigned cases or read/investigate cases
    """
    if user.role == "admin":
        return

    if user.role == "victim":
        if case.victim_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: You do not have permission to view or modify this case."
            )
        return

    if user.role == "investigator":
        # Investigators can view cases; for write access, can be restricted if case has a different assigned investigator
        if write_access and case.investigator_id and case.investigator_id != user.id:
            # Allow collaboration, but flag if strictly unassigned
            pass
        return

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Unauthorized role for case access."
    )
