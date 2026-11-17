import pytest
from app.core.config import settings
from app.database.demo_seed import seed_demo_data
from app.database.session import SessionLocal


def test_public_registration_enforces_victim_role(client):
    """Verifies that requesting role='investigator' or role='admin' in public register is ignored and locked to 'victim'."""
    payload = {
        "email": "malicious_investigator_attempt@example.com",
        "full_name": "Wannabe Detective",
        "password": "Password123!",
        "role": "investigator"
    }
    resp = client.post("/api/auth/register", json=payload)
    assert resp.status_code == 201
    data = resp.json()
    assert data["user"]["role"] == "victim"


def test_public_registration_fallback_username_sanitization(client):
    """Verifies that registering with full_name containing spaces without a username succeeds with a sanitized username."""
    payload = {
        "email": "spaces_user@example.com",
        "full_name": "First Middle Last",
        "password": "Password123!"
    }
    resp = client.post("/api/auth/register", json=payload)
    assert resp.status_code == 201
    data = resp.json()
    assert data["user"]["username"] == "First_Middle_Last"
    assert data["user"]["role"] == "victim"


def test_demo_status_when_disabled(client, monkeypatch):
    """Verifies that GET /api/auth/demo-status returns enabled=False by default."""
    monkeypatch.setattr(settings, "LOCAL_DEMO_MODE", False)
    resp = client.get("/api/auth/demo-status")
    assert resp.status_code == 200
    data = resp.json()
    assert data["enabled"] is False
    assert len(data["allowed_roles"]) == 0


def test_demo_session_rejected_when_demo_mode_disabled(client, monkeypatch):
    """Verifies that POST /api/auth/demo-session returns 403 Forbidden when LOCAL_DEMO_MODE is False."""
    monkeypatch.setattr(settings, "LOCAL_DEMO_MODE", False)
    resp = client.post("/api/auth/demo-session", json={"role": "victim"})
    assert resp.status_code == 403
    assert "disabled" in resp.json()["detail"].lower()


def test_demo_session_success_when_demo_mode_enabled(client, monkeypatch):
    """Verifies that POST /api/auth/demo-session succeeds when LOCAL_DEMO_MODE is True for both victim and investigator."""
    monkeypatch.setattr(settings, "LOCAL_DEMO_MODE", True)

    # 1. Victim Demo Session
    v_resp = client.post("/api/auth/demo-session", json={"role": "victim"})
    assert v_resp.status_code == 200
    v_data = v_resp.json()
    assert "access_token" in v_data
    assert v_data["user"]["role"] == "victim"
    assert v_data["user"]["email"] == settings.DEMO_VICTIM_EMAIL

    # Verify access to /api/auth/me with the issued demo token
    v_token = v_data["access_token"]
    me_resp = client.get("/api/auth/me", headers={"Authorization": f"Bearer {v_token}"})
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == settings.DEMO_VICTIM_EMAIL

    # 2. Investigator Demo Session
    i_resp = client.post("/api/auth/demo-session", json={"role": "investigator"})
    assert i_resp.status_code == 200
    i_data = i_resp.json()
    assert "access_token" in i_data
    assert i_data["user"]["role"] == "investigator"
    assert i_data["user"]["email"] == settings.DEMO_INVESTIGATOR_EMAIL


def test_demo_invalid_role_rejected(client, monkeypatch):
    """Verifies that requesting an invalid role fails validation."""
    monkeypatch.setattr(settings, "LOCAL_DEMO_MODE", True)
    resp = client.post("/api/auth/demo-session", json={"role": "admin"})
    assert resp.status_code == 422


def test_investigator_cannot_view_victim_private_drafts(client, monkeypatch):
    """
    CRITICAL PRIVACY TEST:
    Verifies that an investigator cannot see a victim's private draft statements.
    """
    monkeypatch.setattr(settings, "LOCAL_DEMO_MODE", True)

    # Log in as demo victim and investigator
    v_token = client.post("/api/auth/demo-session", json={"role": "victim"}).json()["access_token"]
    i_token = client.post("/api/auth/demo-session", json={"role": "investigator"}).json()["access_token"]

    v_headers = {"Authorization": f"Bearer {v_token}"}
    i_headers = {"Authorization": f"Bearer {i_token}"}

    # Victim creates a case
    c_resp = client.post("/api/cases", json={"title": "Privacy Isolation Case"}, headers=v_headers)
    case_id = c_resp.json()["id"]

    # Assign investigator to case so they have legitimate read access to the case
    inv_me = client.get("/api/auth/me", headers=i_headers).json()
    client.put(f"/api/cases/{case_id}/assign", json={"investigator_id": inv_me["id"]}, headers=i_headers)

    # Victim submits one finalized statement and one private draft
    submitted_stmt = client.post(
        "/api/statements",
        json={"case_id": case_id, "original_text": "Public finalized statement.", "is_draft": False},
        headers=v_headers
    ).json()

    draft_stmt = client.post(
        "/api/statements",
        json={"case_id": case_id, "original_text": "Strictly confidential victim draft.", "is_draft": True},
        headers=v_headers
    ).json()

    # Victim should see both statements
    v_stmts = client.get(f"/api/statements/case/{case_id}", headers=v_headers).json()
    assert len(v_stmts) == 2

    # Investigator MUST ONLY see the finalized statement; the draft MUST be excluded
    i_stmts = client.get(f"/api/statements/case/{case_id}", headers=i_headers).json()
    assert len(i_stmts) == 1
    assert i_stmts[0]["id"] == submitted_stmt["id"]
    assert all(s["id"] != draft_stmt["id"] for s in i_stmts)

    # If investigator attempts to fetch the draft statement directly by ID, it must return 403 Forbidden
    direct_resp = client.get(f"/api/statements/{draft_stmt['id']}", headers=i_headers)
    assert direct_resp.status_code == 403
    assert "private" in direct_resp.json()["detail"].lower()


def test_victim_cannot_access_investigator_hypotheses_generation(client, monkeypatch):
    """Verifies that a victim account cannot call investigator-only analysis routes."""
    monkeypatch.setattr(settings, "LOCAL_DEMO_MODE", True)

    v_token = client.post("/api/auth/demo-session", json={"role": "victim"}).json()["access_token"]
    v_headers = {"Authorization": f"Bearer {v_token}"}

    c_resp = client.post("/api/cases", json={"title": "Victim Role Boundary Test"}, headers=v_headers)
    case_id = c_resp.json()["id"]

    resp = client.post(
        "/api/investigations/hypotheses",
        json={"case_id": case_id},
        headers=v_headers
    )
    assert resp.status_code == 403


def test_demo_seeder_idempotency():
    """Verifies that seed_demo_data can be executed repeatedly without failing or duplicating accounts."""
    db = SessionLocal()
    try:
        res1 = seed_demo_data(db)
        res2 = seed_demo_data(db)
        assert res1["victim_id"] == res2["victim_id"]
        assert res1["investigator_id"] == res2["investigator_id"]
        assert res1["case_1_id"] == res2["case_1_id"]
    finally:
        db.close()
