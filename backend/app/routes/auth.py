import re
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, Query, status, Request, Response
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    get_current_user
)
from app.core.audit import create_audit_log
from app.database.session import get_db
from app.models.user import User
from app.schemas.user import (
    UserCreate, UserLogin, UserResponse, TokenResponse, UsernameAvailability
)

ROUTER_COOKIE_NAME = "ff_victim_session"


def _set_refresh_cookie(response: Response, refresh_token: str) -> None:
    """
    Attaches the refresh token as an HttpOnly, Secure, SameSite cookie.
    Called after login and register for victim accounts.
    """
    response.set_cookie(
        key=ROUTER_COOKIE_NAME,
        value=refresh_token,
        httponly=True,
        secure=settings.COOKIE_SECURE,          # False in dev (HTTP), True in prod (HTTPS)
        samesite=settings.COOKIE_SAMESITE,      # 'lax' prevents CSRF while allowing redirects
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,   # seconds
        path="/api/auth",                       # scoped: only sent to auth endpoints
        domain=settings.COOKIE_DOMAIN or None,
    )


def _clear_refresh_cookie(response: Response) -> None:
    """Clears the victim session cookie (sets it expired)."""
    response.delete_cookie(
        key=ROUTER_COOKIE_NAME,
        path="/api/auth",
        domain=settings.COOKIE_DOMAIN or None,
    )

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Allowed characters in usernames: letters, numbers, underscores, hyphens, dots
_USERNAME_RE = re.compile(r"^[A-Za-z0-9_.\-]{2,50}$")


def _validate_username_format(username: str) -> str:
    """Normalise and validate username format. Returns normalised value or raises."""
    username = username.strip()
    if not _USERNAME_RE.match(username):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                "Username must be 2–50 characters and may only contain letters, "
                "numbers, underscores ( _ ), hyphens ( - ) and dots ( . )."
            ),
        )
    return username


@router.get("/check-username", response_model=UsernameAvailability, summary="Check username availability")
def check_username(
    username: str = Query(..., min_length=2, max_length=50),
    db: Session = Depends(get_db),
):
    """
    Checks whether a chosen username is available for registration.
    Returns availability status and an explanatory message.
    Does not require authentication — called during registration flow.
    """
    try:
        normalised = _validate_username_format(username)
    except HTTPException:
        return UsernameAvailability(
            username=username,
            available=False,
            message="Username contains invalid characters. Use letters, numbers, _ - . only."
        )

    existing = db.query(User).filter(User.username == normalised).first()
    if existing:
        return UsernameAvailability(
            username=normalised,
            available=False,
            message="This username is already taken. Please choose a different one."
        )
    return UsernameAvailability(
        username=normalised,
        available=True,
        message="Username is available."
    )


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, request: Request, db: Session = Depends(get_db)):
    """
    Registers a new user (Victim or Investigator) and returns an access token.

    Username (pseudonymous display identity):
    - Required and unique for victim accounts.
    - Optional for investigator/admin accounts (falls back to full_name).
    - Never exposed in authority-facing interfaces.
    """
    # Check email uniqueness
    existing_email = db.query(User).filter(User.email == user_in.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    # Determine and validate username
    raw_username = user_in.username or user_in.full_name
    normalised_username = _validate_username_format(raw_username)

    # Check username uniqueness
    existing_username = db.query(User).filter(User.username == normalised_username).first()
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This username is already taken. Please choose a different one."
        )

    hashed_pw = hash_password(user_in.password)
    user = User(
        email=user_in.email,
        hashed_password=hashed_pw,
        username=normalised_username,
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
        details=f"Registered user with role '{user.role}' and username '{user.username}'",
        ip_address=request.client.host if request.client else None
    )

    # Issue tokens
    token_data = {"sub": user.email, "role": user.role, "id": user.id}
    access_token  = create_access_token(data=token_data)
    refresh_token = create_refresh_token(data=token_data)

    response = JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content=TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse.model_validate(user)
        ).model_dump(mode="json"),
    )
    # Set HttpOnly cookie for victim persistent login
    if user.role == "victim":
        _set_refresh_cookie(response, refresh_token)

    return response


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

    # Issue tokens
    token_data = {"sub": user.email, "role": user.role, "id": user.id}
    access_token  = create_access_token(data=token_data)
    refresh_token = create_refresh_token(data=token_data)

    response = JSONResponse(
        content=TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse.model_validate(user)
        ).model_dump(mode="json"),
    )
    # Set HttpOnly cookie for victim persistent login
    if user.role == "victim":
        _set_refresh_cookie(response, refresh_token)

    return response


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
    """Acknowledges logout; the client must discard its bearer token."""
    return {"message": "Successfully logged out. Client should discard the access token."}


# ── Victim persistent session endpoints ───────────────────────────────────────

@router.post("/session", response_model=TokenResponse, summary="Silent session refresh")
def refresh_session(
    request: Request,
    db: Session = Depends(get_db),
):
    """
    Silent session refresh for victim persistent login.

    Reads the HttpOnly 'ff_victim_session' cookie, validates the refresh token,
    and returns a new short-lived access token + rotates the refresh cookie.

    Called by the victim frontend on every page load to restore session without
    requiring the victim to log in again.

    Returns 401 if:
    - The cookie is absent or invalid
    - The refresh token is expired or revoked
    - The associated user no longer exists or is inactive
    """
    raw_token = request.cookies.get(ROUTER_COOKIE_NAME)
    if not raw_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No session cookie present.",
        )

    payload = decode_refresh_token(raw_token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has expired or is invalid. Please log in again.",
        )

    email = payload.get("sub")
    if not email:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Malformed session.")

    user = db.query(User).filter(User.email == email, User.is_active == True).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account not found or deactivated.",
        )

    # Issue new access token and rotate the refresh cookie
    token_data    = {"sub": user.email, "role": user.role, "id": user.id}
    access_token  = create_access_token(data=token_data)
    refresh_token = create_refresh_token(data=token_data)

    response = JSONResponse(
        content=TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse.model_validate(user)
        ).model_dump(mode="json"),
    )
    _set_refresh_cookie(response, refresh_token)   # rotate cookie
    return response


@router.post("/cookie-logout", summary="Victim cookie logout")
def cookie_logout(
    request: Request,
):
    """
    Clears the victim session cookie.
    Does not require authentication — clearing a non-existent cookie is harmless.
    The frontend must also discard its in-memory access token.
    """
    response = JSONResponse(content={"message": "Session cookie cleared."})
    _clear_refresh_cookie(response)
    return response

