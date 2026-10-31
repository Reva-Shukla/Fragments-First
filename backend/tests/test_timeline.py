def test_timeline_generation(client, investigator_headers, victim_headers):
    c_resp = client.post("/api/cases", json={"title": "Timeline Test Case"}, headers=victim_headers)
    case_id = c_resp.json()["id"]

    s_resp = client.post(
        "/api/statements",
        json={"case_id": case_id, "original_text": "At 8:30 PM I entered the lobby. Then around 9:00 PM I heard footsteps.", "is_draft": False},
        headers=victim_headers
    )
    client.post("/api/claims/extract", json={"statement_id": s_resp.json()["id"]}, headers=victim_headers)

    t_resp = client.post(f"/api/timeline/generate/{case_id}", headers=investigator_headers)
    assert t_resp.status_code == 201
    timeline_data = t_resp.json()
    assert timeline_data["case_id"] == case_id
    assert timeline_data["total_events"] >= 1
    
    first_event = timeline_data["events"][0]
    assert first_event["time_precision"] in ["exact", "approximate", "unknown"]
    assert "description" in first_event


def test_add_custom_timeline_event(client, investigator_headers, victim_headers):
    c_resp = client.post("/api/cases", json={"title": "Custom Event Case"}, headers=victim_headers)
    case_id = c_resp.json()["id"]

    event_payload = {
        "case_id": case_id,
        "description": "Witness 911 emergency call logged by dispatch.",
        "date_time_str": "21:04",
        "time_precision": "exact",
        "source_type": "evidence",
        "is_uncertain": False
    }
    resp = client.post("/api/timeline/event", json=event_payload, headers=investigator_headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["description"] == event_payload["description"]
    assert data["time_precision"] == "exact"
