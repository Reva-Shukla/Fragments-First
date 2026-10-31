# FRONTEND INTEGRATION GUIDE: FRAGMENT FIRST BACKEND

Welcome frontend engineers! This document contains everything you need to integrate your React/Vite frontend with the **Fragment First** backend API.

---

## 1. Quick Reference & Setup

- **Backend Base URL**: `http://localhost:8000`
- **Interactive Swagger Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc Interactive Docs**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Health Check**: `GET http://localhost:8000/health`
- **CORS Support**: Pre-configured for Vite default (`http://localhost:5173` and `http://127.0.0.1:5173`)

### Authentication Header
All authenticated requests must include the JWT bearer token in the `Authorization` header:
```http
Authorization: Bearer <your_access_token>
```

---

## 2. Axios / Fetch Client Setup

### Axios Instance Example (`api.js`):
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatic Bearer Token Interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### Fetch Helper Example (`fetchClient.js`):
```javascript
const BASE_URL = 'http://localhost:8000/api';

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(errorData.detail || `HTTP Error ${response.status}`);
  }

  return response.json();
}
```

---

## 3. Complete API Endpoint Catalog

---

### A. Authentication (`/api/auth`)

#### 1. Register User
- **Endpoint**: `POST /api/auth/register`
- **Auth**: None
- **Request Body**:
```json
{
  "email": "victim@example.com",
  "full_name": "Jane Doe",
  "password": "Password123!",
  "role": "victim" // "victim" | "investigator" | "admin"
}
```
- **Response (201 Created)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "victim@example.com",
    "full_name": "Jane Doe",
    "role": "victim",
    "is_active": true,
    "created_at": "2026-10-31T10:00:00Z",
    "updated_at": "2026-10-31T10:00:00Z"
  }
}
```

#### 2. JSON Login
- **Endpoint**: `POST /api/auth/login`
- **Auth**: None
- **Content-Type**: `application/json`
- **Request Body**:
```json
{
  "email": "victim@example.com",
  "password": "Password123!"
}
```
- **Response (200 OK)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "victim@example.com",
    "full_name": "Jane Doe",
    "role": "victim",
    "is_active": true
  }
}
```

#### 3. OAuth2 Token Login (Swagger UI / Form Data)
- **Endpoint**: `POST /api/auth/token`
- **Auth**: None
- **Content-Type**: `application/x-www-form-urlencoded`
- **Form Fields**:
  - `username`: Email address (e.g. `victim@example.com`)
  - `password`: Password
- **Usage**: Used automatically by Swagger UI's **Authorize** modal and standard OAuth2 password flow clients.
- **Response (200 OK)**: Same `TokenResponse` structure as JSON login.

#### 4. Current User Profile
- **Endpoint**: `GET /api/auth/me`
- **Auth**: Bearer Token
- **Response (200 OK)**: User profile object.

#### 5. Logout
- **Endpoint**: `POST /api/auth/logout`
- **Auth**: Bearer Token
- **Response (200 OK)**: `{"message": "Successfully logged out..."}`

---

### B. Users (`/api/users`)

- `GET /api/users/investigators` (Auth: Any authenticated user): Lists all registered investigators to populate assignment dropdowns.
- `GET /api/users` (Auth: Investigator/Admin): Lists all users.
- `GET /api/users/{id}` (Auth: Bearer Token): Get user profile.

---

### C. Cases (`/api/cases`)

#### 1. Create Case
- **Endpoint**: `POST /api/cases`
- **Auth**: Bearer Token
- **Request Body**:
```json
{
  "title": "Incident at Central Station",
  "description": "Fragmented notes following incident near exit 3",
  "victim_id": 1, // Optional if created by victim
  "investigator_id": 2 // Optional
}
```

#### 2. List Cases
- **Endpoint**: `GET /api/cases`
- **Auth**: Bearer Token
- **Behavior**: Victims receive only their cases; investigators receive all active cases.

#### 3. Get Case Details & Activity
- **Endpoint**: `GET /api/cases/{case_id}`
- **Response**: Includes statement count, evidence count, claim count, and recent audit activity.

#### 4. Update Case
- **Endpoint**: `PUT /api/cases/{case_id}`
- **Request Body**:
```json
{
  "title": "Updated Title",
  "status": "in_progress" // "open" | "in_progress" | "review" | "closed"
}
```

#### 5. Assign Investigator
- **Endpoint**: `PUT /api/cases/{case_id}/assign`
- **Request Body**: `{"investigator_id": 2}`

#### 6. Case Activity History
- **Endpoint**: `GET /api/cases/{case_id}/activity`
- **Response**: List of audit entries with timestamps and actions.

---

### D. Statements (`/api/statements`)

#### 1. Submit Fragmented Statement
- **Endpoint**: `POST /api/statements`
- **Auth**: Bearer Token
- **Request Body**:
```json
{
  "case_id": 1,
  "original_text": "dark jacket... maybe 9pm... someone ran into the alley... heard shout...",
  "is_draft": false,
  "audio_file_path": null
}
```
- **Response**: Permanently stored statement with version number 1.

#### 2. Get Case Statements
- **Endpoint**: `GET /api/statements/case/{case_id}`

#### 3. Update Statement / Draft
- **Endpoint**: `PUT /api/statements/{statement_id}`
- **Note**: If draft, updates draft directly. If already finalized, creates a new version to guarantee immutability of the original submission.

---

### E. AI Statement Reconstruction (`/api/reconstruction`)

#### 1. Submit Statement for Reconstruction
- **Endpoint**: `POST /api/reconstruction/submit`
- **Auth**: Bearer Token
- **Request Body**:
```json
{
  "statement_id": 1
}
```
- **Response (201 Created)**:
```json
{
  "id": 1,
  "statement_id": 1,
  "case_id": 1,
  "reconstructed_statement": "The victim observed an individual wearing a dark jacket around approximately 9:00 PM...",
  "unclear_portions": ["heard shout near alleyway"],
  "missing_information": ["Exact directional orientation inside the alley."],
  "preserved_uncertainties": ["Time stated tentatively as 'maybe 9pm'."],
  "requires_victim_review": true,
  "is_approved": false
}
```

#### 2. Victim Approval / Feedback
- **Endpoint**: `POST /api/reconstruction/{reconstruction_id}/approve`
- **Request Body**:
```json
{
  "is_approved": true,
  "feedback": "This accurately reflects my recollection."
}
```

#### 3. Request Corrections
- **Endpoint**: `POST /api/reconstruction/{reconstruction_id}/correct`
- **Request Body**:
```json
{
  "correction_notes": "Please specify that the jacket had reflective stripes."
}
```

---

### F. Claim Extraction (`/api/claims`)

#### 1. Extract Factual Claims
- **Endpoint**: `POST /api/claims/extract`
- **Auth**: Bearer Token
- **Request Body**:
```json
{
  "statement_id": 1,
  "reconstruction_id": 1 // Optional
}
```
- **Response**:
```json
{
  "case_id": 1,
  "statement_id": 1,
  "claims": [
    {
      "id": 1,
      "claim_text": "An individual in a dark jacket ran toward the alley.",
      "original_excerpt": "someone ran into the alley...",
      "people": ["individual in dark jacket"],
      "locations": ["alley"],
      "times": ["approx 9:00 PM"],
      "uncertainty_notes": "Timing is approximate.",
      "is_approved": true
    }
  ],
  "total_claims": 1
}
```

#### 2. Get Case Claims
- **Endpoint**: `GET /api/claims/case/{case_id}`

---

### G. Evidence Management (`/api/evidence`)

#### 1. Upload Evidence File
- **Endpoint**: `POST /api/evidence/upload`
- **Auth**: Investigator / Admin (Bearer Token)
- **Content-Type**: `multipart/form-data`
- **Form Fields**:
  - `case_id`: `1` (integer)
  - `title`: `"Security Camera Footage"` (string, optional)
  - `file`: `<File object>` (PDF, DOCX, TXT, PNG, JPG, MP3, WAV)
- **Axios Upload Example**:
```javascript
const formData = new FormData();
formData.append('case_id', 1);
formData.append('title', 'Badge Access Log');
formData.append('file', fileInput.files[0]);

const response = await api.post('/evidence/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
```

#### 2. List Case Evidence
- **Endpoint**: `GET /api/evidence/case/{case_id}`

#### 3. Download Raw Evidence File
- **Endpoint**: `GET /api/evidence/{evidence_id}/download`

---

### H. AI Claim Verification (`/api/verification`)

#### 1. Run Verification
- **Endpoint**: `POST /api/verification/run`
- **Auth**: Investigator / Admin
- **Request Body**:
```json
{
  "case_id": 1,
  "claim_ids": [] // Optional: specify claim IDs or leave empty for all claims
}
```
- **Response**:
```json
{
  "case_id": 1,
  "total_claims": 2,
  "supported_count": 1,
  "partially_supported_count": 0,
  "contradicted_count": 0,
  "unverified_count": 1,
  "verifications": [
    {
      "id": 1,
      "claim_id": 1,
      "case_id": 1,
      "status": "Supported", // "Supported" | "Partially Supported" | "Contradicted" | "Unverified"
      "explanation": "Security badge scan (Evidence ID 1) corroborates entry at 21:15.",
      "evidence_ids": [1],
      "limitations": ["Camera timestamp clock drift margin +/- 2 min."],
      "human_review_required": true,
      "is_reviewed": false
    }
  ]
}
```

#### 2. Investigator Review / Override
- **Endpoint**: `PUT /api/verification/{verification_id}/review`
- **Request Body**:
```json
{
  "status": "Supported",
  "reviewer_notes": "Corroborated by badge records."
}
```

---

### I. Contradiction Detection (`/api/contradictions`)

- **Run Detection**: `POST /api/contradictions/detect/{case_id}`
- **Retrieve**: `GET /api/contradictions/case/{case_id}`
- **Response**:
```json
{
  "case_id": 1,
  "contradictions": [
    {
      "contradiction_id": "DISC-A4F1",
      "conflicting_claim_ids": [1, 2],
      "source_references": ["Claim 1: 9:00 PM", "Claim 2: 1:00 AM"],
      "discrepancy_explanation": "Divergent reported timeframes across statement fragments.",
      "relevant_evidence_ids": [1],
      "uncertainties": ["Time references are approximate due to stress."],
      "human_review_required": true
    }
  ],
  "ethical_disclaimer": "Discrepancies indicate investigative divergence and must never be interpreted as victim deception."
}
```

---

### J. Timeline (`/api/timeline`)

- **Generate Timeline**: `POST /api/timeline/generate/{case_id}`
- **Get Timeline**: `GET /api/timeline/case/{case_id}`
- **Add Manual Event**: `POST /api/timeline/event`
  ```json
  {
    "case_id": 1,
    "description": "Witness 911 call logged.",
    "date_time_str": "21:04",
    "time_precision": "exact", // "exact" | "approximate" | "unknown"
    "source_type": "evidence",
    "is_uncertain": false
  }
  ```

---

### K. Investigation Hypotheses & Counterfactuals (`/api/investigations`)

- **Generate Alternative Hypotheses**: `POST /api/investigations/hypotheses`
  ```json
  { "case_id": 1, "focus_topic": "Vehicle movement" }
  ```
- **Run Counterfactual "What-If"**: `POST /api/investigations/counterfactual`
  ```json
  {
    "case_id": 1,
    "counterfactual_premise": "What if the suspect arrived by foot rather than vehicle?"
  }
  ```
  *(Note: Output has `is_counterfactual: true` and is isolated from the case timeline).*
- **Get Investigations**: `GET /api/investigations/case/{case_id}`

---

### L. PDF Report Generation (`/api/reports`)

#### 1. Generate Report
- **Endpoint**: `POST /api/reports/generate`
- **Request Body**:
```json
{
  "case_id": 1,
  "report_type": "full_investigation", // "full_investigation" | "executive_summary"
  "title": "Forensic Report - Central Station Incident"
}
```
- **Response**:
```json
{
  "id": 1,
  "case_id": 1,
  "generated_by": 2,
  "report_type": "full_investigation",
  "title": "Forensic Report - Central Station Incident",
  "file_path": "generated_reports/case_1_report_20261031.pdf",
  "download_url": "http://localhost:8000/api/reports/1/download",
  "created_at": "2026-10-31T10:45:00Z"
}
```

#### 2. Download Report
- **Endpoint**: `GET /api/reports/{report_id}/download`
- **Trigger direct browser download**:
```javascript
window.open(`http://localhost:8000/api/reports/${reportId}/download`, '_blank');
```

---

## 4. Error Handling & HTTP Status Codes

All errors return JSON in standard FastAPI format:
```json
{
  "detail": "Error description message"
}
```

Common status codes:
- `200 OK`: Request succeeded.
- `201 Created`: Resource successfully created.
- `400 Bad Request`: Validation failure or business logic error.
- `401 Unauthorized`: Invalid credentials or expired access token.
- `403 Forbidden`: Role or case-level permission denied.
- `404 Not Found`: Case, statement, evidence, or report not found.
- `413 Payload Too Large`: Uploaded file exceeds configured limit (default: 10MB).
- `500 Internal Server Error`: Server exception.
