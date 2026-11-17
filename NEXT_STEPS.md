# Fragments First — Next Implementation Steps

This document outlines the remaining roadmap tasks for transitioning the application from a hackathon demonstration to a full production deployment.

> **Current Architecture Status (Hackathon Demo Build):**  
> The application currently operates as a fully functional, unified demonstration platform:
> - **Unified Frontend:** Both the Victim and Authority portals run in a single Vite React application styled with the Navy, Beige, Slate Blue, and Antique Gold design system (derived from commit `17331b2`).
> - **Authentication & Demo Access:** Real backend-issued JWT tokens power authenticated sessions for both Demo Victim (`SafeHarbor_42`) and Demo Investigator (`det_vance`) roles under an explicit `LOCAL_DEMO_MODE` flag.
> - **Victim Portal Workflow:** Fully connected to the FastAPI backend (`POST /api/statements`, `POST /api/reconstruction/submit`, corrections, approvals, and receipts).
> - **AI Engine & Authority Portal:** The backend AI service currently operates in high-fidelity simulated demo mode (`_meta.source = "DEMO_MODE_MOCK"`), and the Authority Portal UI renders rich interactive investigation dockets, multi-agency timelines, and React Flow dependency graphs via `syntheticCases.js` and `CaseContext`.

---

## Roadmap & Remaining Tasks

### 1. Connect Authority Portal to Real FastAPI Case Data
- Replace `src/data/syntheticCases.js` as the primary data source in `src/context/CaseContext.jsx` with real HTTP calls to:
  - `GET /api/cases`
  - `GET /api/cases/{id}`
  - `GET /api/cases/{id}/activity`
- Synchronize case switching and assignment with the backend database.

### 2. Configure & Verify Live Prune/Gemini AI Generation
- Set up production `PRUNE_API_KEY` credentials in the server environment.
- Toggle `DEMO_MODE=false` in `backend/app/core/config.py` (or `.env`).
- Verify live upstream connectivity with the configured `gemini-3.8-flash` thinking model.
- Monitor chain-of-thought token usage and adjust `GEMINI_MAX_TOKENS` if necessary for complex forensic queries.

### 3. Connect Forensic Analysis Features to Backend Endpoints
- **Claim Verification:** Wire `src/pages/ClaimVerification.jsx` to `POST /api/verification/run` and `PUT /api/verification/{id}/review`.
- **Timeline Generation:** Wire `src/pages/TimelineAnalysis.jsx` to `POST /api/timeline/generate` and `POST /api/timeline/events`.
- **Evidence & Contradiction Correlation:** Wire `src/pages/ServiceCorrelation.jsx` to `POST /api/contradictions/detect`.
- **Root Cause & Alternative Hypotheses:** Wire `src/pages/RootCauseAnalysis.jsx` to `POST /api/investigations/hypotheses` and `POST /api/investigations/counterfactual`.

### 4. Connect Authority Statement Review to Approved Backend Records
- Update `src/pages/StatementReview.jsx` to fetch approved reconstructions directly from `GET /api/reconstruction/statement/{id}` and `GET /api/statements/case/{id}`.
- Preserve the side-by-side diffing, phrase analysis, and victim approval timestamp verification using live database records.

### 5. Integrate Backend-Generated PDF Investigation Reports
- Wire the "Print / Export PDF" action in `src/pages/InvestigationReports.jsx` to trigger `POST /api/reports/generate` and download the ReportLab court-admissible forensic PDF via `GET /api/reports/{id}/download`.
- Supplement browser-level printing with cryptographic server-stamped PDF dossiers.

### 6. Production Hardening, Demo-Data Isolation & E2E Testing
- Disable `LOCAL_DEMO_MODE` in production environments (`LOCAL_DEMO_MODE=False`).
- Implement automated test pipelines (CI/CD GitHub Actions) running frontend build/lint checks and pytest.
- Conduct final security reviews for CORS origin whitelisting, database connection pooling, and credential lifecycle management.
