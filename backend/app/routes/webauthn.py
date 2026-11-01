import json
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import create_access_token, create_refresh_token, _set_refresh_cookie
from app.models import User, WebAuthnCredential, WebAuthnChallenge
from app.database.session import get_db
from app.schemas.webauthn import WebAuthnRegistrationResponse, WebAuthnAuthenticationResponse

from simplewebauthn.server import (
    generate_registration_options,
    verify_registration_response,
    generate_authentication_options,
    verify_authentication_response,
)

router = APIRouter(prefix="/webauthn", tags=["WebAuthn"])

# Helper to get current victim user (must be authenticated)
def get_current_victim_user(current_user: User = Depends(Request.user)):
    if current_user.role != "victim":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="WebAuthn only available for victim accounts")
    return current_user

@router.post("/register/options", response_model=dict)
def webauthn_register_options(request: Request, db: Session = Depends(get_db), user: User = Depends(get_current_victim_user)):
    # Generate a new challenge and registration options
    registration_options = generate_registration_options(
        rp_name=settings.WEBAUTHN_RP_NAME,
        rp_id=settings.WEBAUTHN_RP_ID,
        user_id=str(user.id),
        user_name=user.username or f"user-{user.id}",
        user_display_name=user.username or f"User {user.id}",
        timeout=60000,
        exclude_credentials=[
            {
                "id": cred.credential_id,
                "type": "public-key",
            }
            for cred in user.webauthn_credentials if cred.is_active
        ],
        authenticator_selection={"userVerification": "required"},
        attestation="none",
    )
    # Store challenge
    challenge = WebAuthnChallenge(
        user_id=user.id,
        challenge=registration_options.challenge,
        challenge_type="register",
    )
    db.add(challenge)
    db.commit()
    db.refresh(challenge)
    return registration_options

@router.post("/register/verify", response_model=dict)
def webauthn_register_verify(response: WebAuthnRegistrationResponse, db: Session = Depends(get_db), user: User = Depends(get_current_victim_user)):
    # Retrieve challenge
    challenge_obj = db.query(WebAuthnChallenge).filter(
        WebAuthnChallenge.user_id == user.id,
        WebAuthnChallenge.challenge_type == "register"
    ).order_by(WebAuthnChallenge.created_at.desc()).first()
    if not challenge_obj:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No registration challenge found")
    verification = verify_registration_response(
        credential=response.credential,
        expected_challenge=challenge_obj.challenge,
        expected_origin=settings.WEBAUTHN_ORIGIN,
        expected_rp_id=settings.WEBAUTHN_RP_ID,
        require_user_verification=True,
    )
    if not verification.verified:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Registration verification failed")
    # Store credential
    cred = WebAuthnCredential(
        user_id=user.id,
        credential_id=verification.credential_id,
        public_key=verification.public_key,
        sign_count=verification.sign_count,
        device_name=response.device_name or "Passkey",
    )
    db.add(cred)
    db.commit()
    # Clean up challenge
    db.delete(challenge_obj)
    db.commit()
    # Issue tokens like normal login
    token_data = {"sub": user.email, "role": user.role, "id": user.id}
    access_token = create_access_token(data=token_data)
    refresh_token = create_refresh_token(data=token_data)
    response = JSONResponse(content={"access_token": access_token, "token_type": "bearer", "user": user.__dict__})
    _set_refresh_cookie(response, refresh_token)
    return response

@router.post("/authenticate/options", response_model=dict)
def webauthn_authenticate_options(request: Request, db: Session = Depends(get_db), user: User = Depends(get_current_victim_user)):
    auth_options = generate_authentication_options(
        rp_id=settings.WEBAUTHN_RP_ID,
        allow_credentials=[
            {"id": cred.credential_id, "type": "public-key", "transports": ["internal", "usb", "ble", "nfc"]}
            for cred in user.webauthn_credentials if cred.is_active
        ],
        timeout=60000,
        user_verification="required",
    )
    # Store challenge
    challenge = WebAuthnChallenge(
        user_id=user.id,
        challenge=auth_options.challenge,
        challenge_type="authenticate",
    )
    db.add(challenge)
    db.commit()
    db.refresh(challenge)
    return auth_options

@router.post("/authenticate/verify", response_model=dict)
def webauthn_authenticate_verify(response: WebAuthnAuthenticationResponse, db: Session = Depends(get_db), user: User = Depends(get_current_victim_user)):
    challenge_obj = db.query(WebAuthnChallenge).filter(
        WebAuthnChallenge.user_id == user.id,
        WebAuthnChallenge.challenge_type == "authenticate"
    ).order_by(WebAuthnChallenge.created_at.desc()).first()
    if not challenge_obj:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No authentication challenge found")
    verification = verify_authentication_response(
        credential=response.credential,
        expected_challenge=challenge_obj.challenge,
        expected_origin=settings.WEBAUTHN_ORIGIN,
        expected_rp_id=settings.WEBAUTHN_RP_ID,
        credential_public_key=None,  # will be looked up automatically by lib using stored cred
        credential_current_sign_count=None,
        require_user_verification=True,
    )
    if not verification.verified:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Authentication verification failed")
    # Update sign count
    stored_cred = db.query(WebAuthnCredential).filter(WebAuthnCredential.credential_id == verification.credential_id).first()
    if stored_cred:
        stored_cred.sign_count = verification.new_sign_count
        stored_cred.last_used_at = datetime.now(timezone.utc)
        db.commit()
    # Clean up challenge
    db.delete(challenge_obj)
    db.commit()
    # Issue tokens
    token_data = {"sub": user.email, "role": user.role, "id": user.id}
    access_token = create_access_token(data=token_data)
    refresh_token = create_refresh_token(data=token_data)
    resp = JSONResponse(content={"access_token": access_token, "token_type": "bearer", "user": user.__dict__})
    _set_refresh_cookie(resp, refresh_token)
    return resp
