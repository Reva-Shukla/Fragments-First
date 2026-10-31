from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user
)
from app.core.audit import create_audit_log
from app.database.session import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserResponse, TokenResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, request: Request, db: Session = Depends(get_db)):
    """Registers a new user (Victim or Investigator) and returns access token."""
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    hashed_pw = hash_password(user_in.password)
    user = User(
        email=user_in.email,
        hashed_password=hashed_pw,
        full_name=user_in.full_name,
        role=user_in.role,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    create_audit_log(
        db=db,
        action="USER_REGISTERED",
        target_type="User",
        target_id=user.id,
        user_id=user.id,
        details=f"Registered user with role '{user.role}'",
        ip_address=request.client.host if request.client else None
    )

    access_token = create_access_token(
        data={"sub": user.email, "role": user.role, "id": user.id}
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )


@router.post("/login", response_model=TokenResponse)
def login(
    login_data: UserLogin,
    request: Request,
    db: Session = Depends(get_db)
):
    """JSON-based login endpoint returning JWT access token."""
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"}
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account is currently inactive."
        )

    create_audit_log(
        db=db,
        action="USER_LOGIN",
        target_type="User",
        target_id=user.id,
        user_id=user.id,
        ip_address=request.client.host if request.client else None
    )

    access_token = create_access_token(
        data={"sub": user.email, "role": user.role, "id": user.id}
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )


@router.post("/token", response_model=TokenResponse, summary="OAuth2 Token Login")
def login_form(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    OAuth2 compatible token login endpoint (application/x-www-form-urlencoded).
    Used by Swagger UI Authorize button and standard OAuth2 password flow clients.
    """
    username = form_data.username.strip()
    user = db.query(User).filter(User.email == username).first()
    if not user:
        user = db.query(User).filter(User.email == username.lower()).first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"}
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account is currently inactive."
        )

    create_audit_log(
        db=db,
        action="USER_LOGIN_OAUTH2",
        target_type="User",
        target_id=user.id,
        user_id=user.id,
        ip_address=request.client.host if request.client else None
    )

    access_token = create_access_token(
        data={"sub": user.email, "role": user.role, "id": user.id}
    )
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Returns profile of currently authenticated user."""
    return current_user


@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    """Logs out the user and acknowledges session termination."""
    return {"message": "Successfully logged out. Client should discard the access token."}
