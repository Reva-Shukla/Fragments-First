import io


def test_claim_verification_pipeline(client, investigator_headers, victim_headers):
    # 1. Create case
    c_resp = client.post("/api/cases", json={"title": "Verification Pipeline Case"}, headers=victim_headers)
    case_id = c_resp.json()["id"]

    # 2. Submit statement
    s_resp = client.post(
        "/api/statements",
        json={"case_id": case_id, "original_text": "I was near the rear door at 21:15.", "is_draft": False},
        headers=victim_headers
    )
    stmt_id = s_resp.json()["id"]

    # 3. Extract claims
    extract_resp = client.post("/api/claims/extract", json={"statement_id": stmt_id}, headers=victim_headers)
    assert extract_resp.status_code == 201

    # 4. Upload corroborating evidence
    files = {"file": ("log.txt", io.BytesIO(b"Badge scan rear door at 21:15 confirmed."), "text/plain")}
    client.post("/api/evidence/upload", data={"case_id": str(case_id)}, files=files, headers=investigator_headers)

    # 5. Run claim verification
    ver_resp = client.post(
        "/api/verification/run",
        json={"case_id": case_id},
        headers=investigator_headers
    )
    assert ver_resp.status_code == 201
    summary = ver_resp.json()
    assert summary["case_id"] == case_id
    assert summary["total_claims"] >= 1
    
    first_ver = summary["verifications"][0]
    assert first_ver["status"] in ["Supported", "Partially Supported", "Contradicted", "Unverified"]
    assert first_ver["human_review_required"] is True
    assert "explanation" in first_ver

    # 6. Human Investigator Review
    review_resp = client.put(
        f"/api/verification/{first_ver['id']}/review",
        json={"status": "Supported", "reviewer_notes": "Corroborated by badge log timestamp."},
        headers=investigator_headers
    )
    assert review_resp.status_code == 200
    rev_data = review_resp.json()
    assert rev_data["is_reviewed"] is True
    assert rev_data["status"] == "Supported"
    assert rev_data["reviewer_notes"] == "Corroborated by badge log timestamp."


def test_contradiction_detection(client, investigator_headers, victim_headers):
    c_resp = client.post("/api/cases", json={"title": "Contradiction Case"}, headers=victim_headers)
    case_id = c_resp.json()["id"]

    s_resp = client.post(
        "/api/statements",
        json={"case_id": case_id, "original_text": "I arrived at 9 PM. Later I noticed it was 1 AM.", "is_draft": False},
        headers=victim_headers
    )
    client.post("/api/claims/extract", json={"statement_id": s_resp.json()["id"]}, headers=victim_headers)

    resp = client.post(f"/api/contradictions/detect/{case_id}", headers=investigator_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "contradictions" in data
    assert "ethical_disclaimer" in data
    assert "deception" in data["ethical_disclaimer"]
