import os
import io


def test_generate_pdf_report(client, investigator_headers, victim_headers):
    # 1. Create case with statements, claims, and evidence
    c_resp = client.post("/api/cases", json={"title": "PDF Report Generation Case"}, headers=victim_headers)
    case_id = c_resp.json()["id"]

    stmt_resp = client.post(
        "/api/statements",
        json={"case_id": case_id, "original_text": "Heard loud footsteps... saw shadow near door around 20:45.", "is_draft": False},
        headers=victim_headers
    )
    stmt_id = stmt_resp.json()["id"]

    # Reconstruct and approve
    recon_resp = client.post("/api/reconstruction/submit", json={"statement_id": stmt_id}, headers=victim_headers)
    recon_id = recon_resp.json()["id"]
    client.post(f"/api/reconstruction/{recon_id}/approve", json={"is_approved": True}, headers=victim_headers)

    # Extract claims
    client.post("/api/claims/extract", json={"statement_id": stmt_id}, headers=victim_headers)

    # Upload evidence
    files = {"file": ("dispatch.txt", io.BytesIO(b"Dispatch log: Unit 12 arrived at 20:50."), "text/plain")}
    client.post("/api/evidence/upload", data={"case_id": str(case_id)}, files=files, headers=investigator_headers)

    # Generate timeline
    client.post(f"/api/timeline/generate/{case_id}", headers=investigator_headers)

    # Generate PDF report
    rep_resp = client.post(
        "/api/reports/generate",
        json={"case_id": case_id, "report_type": "full_investigation"},
        headers=investigator_headers
    )
    assert rep_resp.status_code == 201
    rep_data = rep_resp.json()
    assert rep_data["case_id"] == case_id
    assert "download_url" in rep_data
    assert os.path.exists(rep_data["file_path"])
    assert os.path.getsize(rep_data["file_path"]) > 1000  # Non-trivial PDF generated

    # Download report
    download_resp = client.get(f"/api/reports/{rep_data['id']}/download", headers=investigator_headers)
    assert download_resp.status_code == 200
    assert download_resp.headers["content-type"] == "application/pdf"
    assert download_resp.content.startswith(b"%PDF")
