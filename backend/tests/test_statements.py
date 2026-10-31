def test_submit_fragmented_statement(client, victim_headers):
    c_resp = client.post("/api/cases", json={"title": "Statement Test Case"}, headers=victim_headers)
    case_id = c_resp.json()["id"]

    stmt_payload = {
        "case_id": case_id,
        "original_text": "dark jacket... maybe 9pm... someone ran near the parking lot... heard shout...",
        "is_draft": False
    }
    resp = client.post("/api/statements", json=stmt_payload, headers=victim_headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["case_id"] == case_id
    assert data["original_text"] == stmt_payload["original_text"]
    assert data["version"] == 1
    assert data["status"] == "submitted"


def test_statement_immutability_creates_new_version(client, victim_headers):
    c_resp = client.post("/api/cases", json={"title": "Immutability Test Case"}, headers=victim_headers)
    case_id = c_resp.json()["id"]

    # Submit initial finalized statement
    s1 = client.post(
        "/api/statements",
        json={"case_id": case_id, "original_text": "original fragment 1", "is_draft": False},
        headers=victim_headers
    ).json()

    # Attempting to update finalized statement must NOT overwrite original; it creates a new version
    update_resp = client.put(
        f"/api/statements/{s1['id']}",
        json={"original_text": "revised fragment with more detail"},
        headers=victim_headers
    )
    assert update_resp.status_code == 200
    updated_data = update_resp.json()
    assert updated_data["version"] == 2
    assert updated_data["original_text"] == "revised fragment with more detail"

    # Verify original statement version 1 is still preserved in database
    orig_check = client.get(f"/api/statements/{s1['id']}", headers=victim_headers).json()
    assert orig_check["version"] == 1
    assert orig_check["original_text"] == "original fragment 1"


def test_save_and_update_draft(client, victim_headers):
    c_resp = client.post("/api/cases", json={"title": "Draft Test Case"}, headers=victim_headers)
    case_id = c_resp.json()["id"]

    # Create draft
    draft = client.post(
        "/api/statements",
        json={"case_id": case_id, "original_text": "draft text in progress", "is_draft": True},
        headers=victim_headers
    ).json()
    assert draft["is_draft"] is True
    assert draft["status"] == "draft"

    # Update draft directly
    updated_draft = client.put(
        f"/api/statements/{draft['id']}",
        json={"original_text": "updated draft text completed", "is_draft": False},
        headers=victim_headers
    ).json()
    assert updated_draft["original_text"] == "updated draft text completed"
    assert updated_draft["is_draft"] is False
    assert updated_draft["status"] == "submitted"
