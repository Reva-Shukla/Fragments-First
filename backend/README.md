# Fragment First Backend Engine

This directory contains the production FastAPI backend for **Fragment First**.

## Core Modules & Architecture

### 1. `app/core/`
- **`config.py`**: Pydantic `BaseSettings` reading environment configurations with automatic CORS origin assembly and directory preparation.
- **`security.py`**: Direct `bcrypt` password hashing (Python 3.13 compliant), PyJWT encoding/decoding, `get_current_user` OAuth2 dependency, and role-based authorization factories (`require_roles`).
- **`audit.py`**: Immutable security audit logger that records operational activities while strictly omitting raw confidential statements and evidence payloads.

### 2. `app/database/`
- **`base.py`**: DeclarativeBase for SQLAlchemy models.
- **`session.py`**: SQLite engine (with thread safety disabled) and session generator; easily swappable for PostgreSQL via `DATABASE_URL`.
- **`init_db()`**: Automatically generates all registered database tables on app startup.

### 3. `app/models/`
- `User`: User accounts with roles (`victim`, `investigator`, `admin`).
- `Case`: Investigative case files with victim/investigator associations.
- `Statement`: Original victim statements, version tracking, and draft flags.
- `Reconstruction`: AI narrative reconstructions, unclear portions, missing context, preserved uncertainties, and victim approval timestamps.
- `Claim`: Extracted atomic factual claims with parsed entities (people, locations, dates, times, events, actions).
- `Evidence`: Uploaded files with extracted text, file size, MIME type, and metadata.
- `Verification`: AI claim-versus-evidence assessments (`Supported`, `Partially Supported`, `Contradicted`, `Unverified`), evidence citations, and human review notes.
- `Event`: Chronological timeline events with precision indicators (`exact`, `approximate`, `unknown`).
- `Investigation`: Alternative hypotheses and isolated counterfactual scenarios.
- `Report`: Downloadable forensic PDF reports.
- `AuditLog`: Action logs for audit trails.

### 4. `app/services/`
- **`llm_service.py`**: Reusable Gemini API client with graceful fallback to labeled Demo Mode, JSON response sanitization, and exponential retries.
- **`reconstruction_service.py`**: Trauma-informed narrative synthesis preserving uncertainty and identifying unclear fragments.
- **`claim_service.py`**: Atomic fact extractor that parses entities without converting assumptions into facts.
- **`verification_service.py`**: Objective claim verification comparing claims against supplied evidence records.
- **`contradiction_service.py`**: Discrepancy detector across statements and evidence without deception labeling.
- **`timeline_service.py`**: Chronological sequencer adhering to stated timestamps.
- **`investigation_service.py`**: Hypothesis generator and counterfactual "what-if" analyzer.
- **`report_service.py`**: ReportLab PDF compiler generating structured forensic reports.

### 5. `app/utils/`
- **`text_extraction.py`**: Robust text and metadata extraction from PDF (PyMuPDF), DOCX (python-docx), and plain text.
- **`file_storage.py`**: Safe filename sanitation and upload size enforcement.

---

## Running Locally

```powershell
# From the backend directory:
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Running Automated Tests

```powershell
pytest tests/ -v
```
