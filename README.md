# Fragment First: AI-Powered Legal Communication Assistance & Evidence Investigation Platform

**Fragment First** is an AI-powered legal assistance and evidence investigation platform designed to empower individuals who struggle to communicate their experiences clearly, especially during high-stress legal situations and trauma recovery.

Victims can submit fragmented thoughts, incomplete sentences, or recordings. The trauma-informed LLM pipeline reconstructs these fragments into coherent, readable narratives while strictly preserving stated uncertainties and avoiding the fabrication of details. Qualified human investigators and attorneys can then examine statements, extract atomic factual claims, verify them against physical/documentary evidence, detect contradictions, sequence chronological timelines, and generate forensic PDF reports.

---

## Ethical Architecture & Safeguards

- **No Credibility or Deception Scoring**: The system NEVER calculates truthfulness or lie-detection metrics.
- **No Determination of Guilt or Innocence**: Final legal judgments rest solely with human authorities.
- **Preservation of Uncertainty**: Hesitations, approximations, and tentative memories are explicitly preserved.
- **Missing Evidence Protocol**: Absence of evidence is never treated as proof of contradiction.
- **Statement Immutability**: Original raw victim statements are permanently preserved and never overwritten.
- **Victim Approval Gate**: AI reconstructions require victim review and explicit sign-off before being treated as approved.
- **Counterfactual Isolation**: Hypothetical "what-if" investigative scenarios are strictly flagged and never injected into the ground-truth timeline.

---

## Repository Structure

```
fragment-first/
│
├── backend/
│   ├── main.py                    # FastAPI application entrypoint & middleware
│   ├── requirements.txt           # Production & test dependencies
│   ├── .env.example               # Environment variables template
│   ├── .env                       # Local environment configuration
│   ├── .gitignore                 # Backend git ignore rules
│   ├── README.md                  # Backend technical documentation
│   │
│   ├── app/
│   │   ├── __init__.py
│   │   ├── core/                  # Security (bcrypt/JWT), config, audit logging
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   └── audit.py
│   │   ├── database/              # SQLAlchemy session & base model
│   │   │   ├── base.py
│   │   │   └── session.py
│   │   ├── models/                # 11 SQLAlchemy database models
│   │   │   ├── user.py
│   │   │   ├── case.py
│   │   │   ├── statement.py
│   │   │   ├── reconstruction.py
│   │   │   ├── claim.py
│   │   │   ├── evidence.py
│   │   │   ├── verification.py
│   │   │   ├── timeline.py
│   │   │   ├── investigation.py
│   │   │   ├── report.py
│   │   │   └── audit_log.py
│   │   ├── schemas/               # Pydantic v2 validation models
│   │   │   ├── user.py
│   │   │   ├── case.py
│   │   │   ├── statement.py
│   │   │   ├── reconstruction.py
│   │   │   ├── claim.py
│   │   │   ├── evidence.py
│   │   │   ├── verification.py
│   │   │   ├── contradiction.py
│   │   │   ├── timeline.py
│   │   │   ├── investigation.py
│   │   │   └── report.py
│   │   ├── routes/                # 12 REST API route modules
│   │   │   ├── auth.py
│   │   │   ├── users.py
│   │   │   ├── cases.py
│   │   │   ├── statements.py
│   │   │   ├── reconstruction.py
│   │   │   ├── claims.py
│   │   │   ├── evidence.py
│   │   │   ├── verification.py
│   │   │   ├── contradictions.py
│   │   │   ├── timeline.py
│   │   │   ├── investigations.py
│   │   │   ├── reports.py
│   │   │   └── deps.py
│   │   ├── services/              # AI and business logic services
│   │   │   ├── llm_service.py     # Gemini SDK + Demo Mode fallback
│   │   │   ├── reconstruction_service.py
│   │   │   ├── claim_service.py
│   │   │   ├── verification_service.py
│   │   │   ├── contradiction_service.py
│   │   │   ├── timeline_service.py
│   │   │   ├── investigation_service.py
│   │   │   └── report_service.py  # ReportLab PDF generation
│   │   └── utils/
│   │       ├── text_extraction.py # PDF (PyMuPDF), DOCX, TXT parsers
│   │       └── file_storage.py    # Path traversal protection & validation
│   │
│   ├── uploads/                   # Secure evidence file storage
│   ├── generated_reports/         # Generated PDF reports storage
│   └── tests/                     # 31 comprehensive automated pytest tests
│
├── FRONTEND_INTEGRATION.md        # Comprehensive API & frontend guide
└── README.md                      # Platform overview & quickstart
```

---

## Quickstart Guide

### 1. Prerequisites
- Python 3.11+ (Tested on Python 3.13)
- Windows PowerShell or Bash terminal

### 2. Activate Virtual Environment
```powershell
# Windows PowerShell
.\backend\venv\Scripts\Activate.ps1
```

### 3. Install Dependencies
```powershell
pip install -r backend\requirements.txt
```

### 4. Configure Environment
Copy `.env.example` to `.env` inside `backend/`:
```ini
DATABASE_URL=sqlite:///./fragment_first.db
SECRET_KEY=your-secure-random-secret-key-32-chars-min
GEMINI_API_KEY=your_gemini_api_key_here
LLM_PROVIDER=gemini
DEMO_MODE=true
FRONTEND_ORIGINS=http://localhost:5173
MAX_UPLOAD_SIZE_MB=10
```
> **Note**: If `GEMINI_API_KEY` is omitted, the backend automatically runs in clearly-labeled **DEMO MODE**, providing high-fidelity synthetic responses adhering to all ethical guidelines.

### 5. Run the Server
From the `backend` directory:
```powershell
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
Or directly from the project root:
```powershell
backend\venv\Scripts\python.exe -m uvicorn --app-dir backend main:app --reload --host 0.0.0.0 --port 8000
```

### 6. Interactive Documentation
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

### 7. Run Test Suite
```powershell
backend\venv\Scripts\pytest.exe backend/tests -v
```
All 31 unit and integration tests validate authentication, RBAC, statement immutability, reconstruction approval, claim extraction, evidence processing, verification assessments, contradiction detection, timeline generation, and PDF reports.
