def test_generate_alternative_hypotheses(client, investigator_headers, victim_headers):
    c_resp = client.post("/api/cases", json={"title": "Hypotheses Test Case"}, headers=victim_headers)
    case_id = c_resp.json()["id"]

    s_resp = client.post(
        "/api/statements",
        json={"case_id": case_id, "original_text": "A vehicle with tinted windows parked across the street.", "is_draft": False},
        headers=victim_headers
    )
    client.post("/api/claims/extract", json={"statement_id": s_resp.json()["id"]}, headers=victim_headers)

    hypo_resp = client.post(
        "/api/investigations/hypotheses",
        json={"case_id": case_id, "focus_topic": "Vehicle involvement and driver intent"},
        headers=investigator_headers
    )
    assert hypo_resp.status_code == 201
    hypotheses = hypo_resp.json()
    assert len(hypotheses) >= 1
    assert "hypothesis_text" in hypotheses[0]
    assert "assumptions" in hypotheses[0]
    assert "missing_information" in hypotheses[0]


def test_counterfactual_analysis(client, investigator_headers, victim_headers):
    c_resp = client.post("/api/cases", json={"title": "Counterfactual Test Case"}, headers=victim_headers)
    case_id = c_resp.json()["id"]

    counter_resp = client.post(
        "/api/investigations/counterfactual",
        json={
            "case_id": case_id,
            "counterfactual_premise": "What if the delivery van arrived 30 minutes after the incident rather than before?"
        },
        headers=investigator_headers
    )
    assert counter_resp.status_code == 201
    counter_data = counter_resp.json()
    assert counter_data["is_counterfactual"] is True
    assert "HYPOTHETICAL" in counter_data["label"].upper()
    assert "hypothesis_text" in counter_data


def test_list_case_investigations(client, investigator_headers, victim_headers):
    c_resp = client.post("/api/cases", json={"title": "List Investigations Case"}, headers=victim_headers)
    case_id = c_resp.json()["id"]

    # Generate one hypothesis and one counterfactual
    client.post("/api/investigations/hypotheses", json={"case_id": case_id}, headers=investigator_headers)
    client.post(
        "/api/investigations/counterfactual",
        json={"case_id": case_id, "counterfactual_premise": "What if the emergency lights malfunctioned?"},
        headers=investigator_headers
    )

    list_resp = client.get(f"/api/investigations/case/{case_id}", headers=investigator_headers)
    assert list_resp.status_code == 200
    data = list_resp.json()
    assert len(data["hypotheses"]) >= 1
    assert len(data["counterfactual_scenarios"]) >= 1
