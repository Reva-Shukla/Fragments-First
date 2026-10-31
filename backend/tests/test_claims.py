def test_claim_extraction(client, victim_headers):
    c_resp = client.post("/api/cases", json={"title": "Claims Test Case"}, headers=victim_headers)
    case_id = c_resp.json()["id"]

    stmt = client.post(
        "/api/statements",
        json={
            "case_id": case_id,
            "original_text": "I saw a tall man wearing a dark jacket near Elm Street at around 9:00 PM yesterday. He ran into an alleyway. Maybe he dropped a notebook.",
            "is_draft": False
        },
        headers=victim_headers
    ).json()

    extract_resp = client.post(
        "/api/claims/extract",
        json={"statement_id": stmt["id"]},
        headers=victim_headers
    )
    assert extract_resp.status_code == 201
    data = extract_resp.json()
    assert data["case_id"] == case_id
    assert data["total_claims"] >= 1
    
    first_claim = data["claims"][0]
    assert "claim_text" in first_claim
    assert "original_excerpt" in first_claim
    assert "people" in first_claim
    assert "locations" in first_claim
    assert "times" in first_claim


def test_get_claims_by_case(client, victim_headers):
    c_resp = client.post("/api/cases", json={"title": "Claims Fetch Case"}, headers=victim_headers)
    case_id = c_resp.json()["id"]

    stmt = client.post(
        "/api/statements",
        json={"case_id": case_id, "original_text": "A vehicle sped away on Main St around 10 PM.", "is_draft": False},
        headers=victim_headers
    ).json()

    client.post("/api/claims/extract", json={"statement_id": stmt["id"]}, headers=victim_headers)

    list_resp = client.get(f"/api/claims/case/{case_id}", headers=victim_headers)
    assert list_resp.status_code == 200
    claims_list = list_resp.json()["claims"]
    assert len(claims_list) >= 1
