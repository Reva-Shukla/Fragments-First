import io
from reportlab.pdfgen import canvas


def test_upload_txt_evidence(client, investigator_headers, victim_headers):
    # Victim creates case
    c_resp = client.post("/api/cases", json={"title": "Evidence Test Case"}, headers=victim_headers)
    case_id = c_resp.json()["id"]

    file_content = b"SECURITY LOG: Entry detected at rear entrance 21:15. Card #4092."
    files = {"file": ("security_log.txt", io.BytesIO(file_content), "text/plain")}
    data = {"case_id": str(case_id), "title": "Building Security Badge Log"}

    resp = client.post("/api/evidence/upload", data=data, files=files, headers=investigator_headers)
    assert resp.status_code == 201
    ev_data = resp.json()
    assert ev_data["case_id"] == case_id
    assert ev_data["file_type"] == "txt"
    assert "21:15" in ev_data["extracted_text"]


def test_upload_pdf_evidence(client, investigator_headers, victim_headers):
    c_resp = client.post("/api/cases", json={"title": "PDF Evidence Case"}, headers=victim_headers)
    case_id = c_resp.json()["id"]

    # Generate a small in-memory PDF using ReportLab
    pdf_buffer = io.BytesIO()
    p = canvas.Canvas(pdf_buffer)
    p.drawString(100, 750, "OFFICIAL POLICE DISPATCH LOG - Unit 4 responding to Elm Street.")
    p.save()
    pdf_buffer.seek(0)

    files = {"file": ("dispatch_report.pdf", pdf_buffer, "application/pdf")}
    data = {"case_id": str(case_id), "title": "Police Dispatch PDF"}

    resp = client.post("/api/evidence/upload", data=data, files=files, headers=investigator_headers)
    assert resp.status_code == 201
    ev_data = resp.json()
    assert ev_data["file_type"] == "pdf"
    assert "Unit 4" in ev_data["extracted_text"]


def test_download_evidence(client, investigator_headers, victim_headers):
    c_resp = client.post("/api/cases", json={"title": "Download Evidence Case"}, headers=victim_headers)
    case_id = c_resp.json()["id"]

    files = {"file": ("note.txt", io.BytesIO(b"Confidential handwritten note extract."), "text/plain")}
    ev_resp = client.post("/api/evidence/upload", data={"case_id": str(case_id)}, files=files, headers=investigator_headers)
    ev_id = ev_resp.json()["id"]

    download_resp = client.get(f"/api/evidence/{ev_id}/download", headers=investigator_headers)
    assert download_resp.status_code == 200
    assert download_resp.content == b"Confidential handwritten note extract."


def test_unsupported_file_extension_rejected(client, investigator_headers, victim_headers):
    c_resp = client.post("/api/cases", json={"title": "File Validation Case"}, headers=victim_headers)
    case_id = c_resp.json()["id"]

    files = {"file": ("malicious.exe", io.BytesIO(b"executable binaries"), "application/octet-stream")}
    data = {"case_id": str(case_id)}

    resp = client.post("/api/evidence/upload", data=data, files=files, headers=investigator_headers)
    assert resp.status_code == 400
    assert "is not supported" in resp.json()["detail"]
