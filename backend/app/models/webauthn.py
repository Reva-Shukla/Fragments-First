"""
WebAuthnCredential — Stores WebAuthn/Passkey credential public keys for victim accounts.

PRIVACY GUARANTEE:
  - No biometric data is ever stored here.
  - No facial photographs, embeddings, or templates are collected.
  - Only the PUBLIC KEY and credential metadata produced by the WebAuthn protocol
    (equivalent to a cryptographic certificate) is stored.
  - The private key and all biometric processing remain exclusively on the user's device.
  - This table is exclusively for VICTIM accounts. Other roles use only password auth.

WebAuthn flow summary:
  Registration:
    1. Backend generates random challenge → sent to browser.
    2. Browser calls navigator.credentials.create() — device prompts Face ID / fingerprint / PIN.
    3. Device signs the challenge with a NEW private key; returns public key + signature.
    4. Backend verifies signature + stores public_key_cbor + credential_id here.
    5. Private key never leaves the device.

  Authentication:
    1. Backend generates random challenge → sent to browser.
    2. Browser calls navigator.credentials.get() — device prompts biometric/PIN.
    3. Device signs challenge with stored private key; returns assertion.
    4. Backend verifies assertion against stored public_key_cbor.
    5. On success: issue access token + session cookie as normal.
"""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, LargeBinary, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database.base import Base


class WebAuthnCredential(Base):
    __tablename__ = "webauthn_credentials"

    id = Column(Integer, primary_key=True, index=True)

    # The victim user this credential belongs to
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # WebAuthn credential identifier (bytes, base64url in protocol)
    # This identifies which credential the authenticator used
    credential_id = Column(String(512), unique=True, nullable=False, index=True)

    # The public key in CBOR-encoded format (stored as bytes)
    # This is NOT a biometric — it is a cryptographic public key only
    public_key = Column(LargeBinary, nullable=False)

    # Signature counter — increments each authentication; replay attack detection
    sign_count = Column(Integer, nullable=False, default=0)

    # Human-friendly label (e.g. "Face ID on iPhone 15", "Windows Hello")
    device_name = Column(String(255), nullable=True, default="Passkey")

    # Whether this credential is still active (user can disable without deleting)
    is_active = Column(Boolean, default=True)

    # Timestamps
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    last_used_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="webauthn_credentials")
