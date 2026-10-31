def test_submit_for_reconstruction(client, victim_headers):
    c_resp = client.post("/api/cases", json={"title": "Reconstruction Test Case"}, headers=victim_headers)
    case_id = c_resp.json()["id"]

    stmt = client.post(
        "/api/statements",
        json={
            "case_id": case_id,
            "original_text": "tall guy maybe wearing black... parked near alley... don't remember car color... maybe 9pm...",
            "is_draft": False
        },
        headers=victim_headers
    ).json()

    recon_resp = client.post(
        "/api/reconstruction/submit",
        json={"statement_id": stmt["id"]},
        headers=victim_headers
    )
    assert recon_resp.status_code == 201
    recon_data = recon_resp.json()
    assert "reconstructed_statement" in recon_data
    assert "unclear_portions" in recon_data
    assert "missing_information" in recon_data
    assert "preserved_uncertainties" in recon_data
    assert recon_data["requires_victim_review"] is True
    assert recon_data["is_approved"] is False


def test_approve_reconstruction(client, victim_headers):
    c_resp = client.post("/api/cases", json={"title": "Approval Test Case"}, headers=victim_headers)
    case_id = c_resp.json()["id"]

    stmt = client.post(
        "/api/statements",
        json={"case_id": case_id, "original_text": "fragmented narrative to approve...", "is_draft": False},
        headers=victim_headers
    ).json()

    recon = client.post(
        "/api/reconstruction/submit",
        json={"statement_id": stmt["id"]},
        headers=victim_headers
    ).json()

    approve_resp = client.post(
        f"/api/reconstruction/{recon['id']}/approve",
        json={"is_approved": True, "feedback": "Accurate reconstruction of what I remember."},
        headers=victim_headers
    )
    assert approve_resp.status_code == 200
    app_data = approve_resp.json()
    assert app_data["is_approved"] is True
    assert app_data["victim_feedback"] == "Accurate reconstruction of what I remember."
    assert app_data["approved_at"] is not None


def test_request_reconstruction_correction(client, victim_headers):
    c_resp = client.post("/api/cases", json={"title": "Correction Test Case"}, headers=victim_headers)
    case_id = c_resp.json()["id"]

    stmt = client.post(
        "/api/statements",
        json={"case_id": case_id, "original_text": "saw car leaving quickly... south avenue...", "is_draft": False},
        headers=victim_headers
    ).json()

    recon = client.post(
        "/api/reconstruction/submit",
        json={"statement_id": stmt["id"]},
        headers=victim_headers
    ).json()

    correct_resp = client.post(
        f"/api/reconstruction/{recon['id']}/correct",
        json={"correction_notes": "Please note that the car had a broken left tail light."},
        headers=victim_headers
    )
    assert correct_resp.status_code == 200
    revised = correct_resp.json()
    assert revised["id"] != recon["id"]  # Brand new revision record
    assert revised["requires_victim_review"] is True
    assert revised["is_approved"] is False
    assert "broken left tail light" in revised["victim_feedback"]
