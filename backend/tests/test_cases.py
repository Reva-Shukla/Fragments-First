def test_create_case_as_victim(client, victim_headers):
    payload = {
        "title": "Incident at Downtown Station",
        "description": "Fragmented notes following an evening incident near the south exit."
    }
    resp = client.post("/api/cases", json=payload, headers=victim_headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["title"] == "Incident at Downtown Station"
    assert data["status"] == "open"
    assert "id" in data


def test_list_cases_for_victim(client, victim_headers):
    resp = client.get("/api/cases", headers=victim_headers)
    assert resp.status_code == 200
    cases = resp.json()
    assert len(cases) >= 1
    assert any(c["title"] == "Incident at Downtown Station" for c in cases)


def test_case_detail_and_activity(client, victim_headers):
    # Create a fresh case
    c_resp = client.post(
        "/api/cases",
        json={"title": "Detail Test Case", "description": "Testing detail view and logs"},
        headers=victim_headers
    )
    case_id = c_resp.json()["id"]

    resp = client.get(f"/api/cases/{case_id}", headers=victim_headers)
    assert resp.status_code == 200
    detail = resp.json()
    assert detail["id"] == case_id
    assert "statement_count" in detail
    assert "evidence_count" in detail

    act_resp = client.get(f"/api/cases/{case_id}/activity", headers=victim_headers)
    assert act_resp.status_code == 200
    activities = act_resp.json()
    assert len(activities) >= 1
    assert any(a["action"] == "CASE_CREATED" for a in activities)


def test_assign_investigator(client, investigator_headers, victim_headers):
    # Create case as victim
    c_resp = client.post(
        "/api/cases",
        json={"title": "Assignment Test Case"},
        headers=victim_headers
    )
    case_id = c_resp.json()["id"]

    # Get investigator profile
    me_resp = client.get("/api/auth/me", headers=investigator_headers)
    inv_id = me_resp.json()["id"]

    # Assign investigator
    assign_resp = client.put(
        f"/api/cases/{case_id}/assign",
        json={"investigator_id": inv_id},
        headers=investigator_headers
    )
    assert assign_resp.status_code == 200
    assert assign_resp.json()["investigator_id"] == inv_id


def test_unauthorized_case_access_prevented(client, victim_headers):
    # Register a second victim
    v2_reg = client.post("/api/auth/register", json={
        "email": "victim2_isolation@example.com",
        "full_name": "Second Victim",
        "password": "Password123!",
        "role": "victim"
    })
    v2_token = v2_reg.json()["access_token"]
    v2_headers = {"Authorization": f"Bearer {v2_token}"}

    # First victim creates a case
    c1 = client.post("/api/cases", json={"title": "Private Case Victim 1"}, headers=victim_headers).json()
    case_id = c1["id"]

    # Second victim attempts to access first victim's case
    forbidden_resp = client.get(f"/api/cases/{case_id}", headers=v2_headers)
    assert forbidden_resp.status_code == 403
    assert "Access denied" in forbidden_resp.json()["detail"]
