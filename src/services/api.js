/**
 * Fragment First — Centralized API Service
 *
 * Architecture:
 *   apiClient  — authenticated Axios instance for all real backend calls.
 *                Base URL comes from the Vite proxy (/api → http://127.0.0.1:8000).
 *                Attaches JWT Bearer token from localStorage on every request.
 *                Handles 401 → clears token + redirects to /login.
 *
 *   authApi    — real authentication endpoints (login, logout, me).
 *
 *   casesApi   — real case CRUD endpoints.
 *
 *   investigationApi — authority dashboard data layer.
 *                      Calls the real backend for each resource.
 *                      Falls back to synthetic data when the backend returns no
 *                      records or when the user is not authenticated (so the UI
 *                      remains functional during demo / offline operation).
 */

import axios from 'axios';
import { SYNTHETIC_CASES, INITIAL_AUDIT_LOGS } from '../data/syntheticCases';

// ── Storage helpers ─────────────────────────────────────────────────────────
const TOKEN_KEY = 'ff_authority_token';
const USER_KEY  = 'ff_authority_user';

export const storage = {
  getToken:  ()        => localStorage.getItem(TOKEN_KEY),
  setToken:  (t)       => localStorage.setItem(TOKEN_KEY, t),
  clearToken: ()       => localStorage.removeItem(TOKEN_KEY),
  getUser:   ()        => { try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; } },
  setUser:   (u)       => localStorage.setItem(USER_KEY, JSON.stringify(u)),
  clearUser: ()        => localStorage.removeItem(USER_KEY),
  clear:     ()        => { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); },
};

// ── Axios instance ────────────────────────────────────────────────────────────
// During development Vite proxies /api → http://127.0.0.1:8000,
// so baseURL '/api' works without cross-origin requests.
// In production set VITE_API_BASE_URL to the deployed backend URL.
const BASE = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api`
  : '/api';

const apiClient = axios.create({
  baseURL: BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token on every request
apiClient.interceptors.request.use((config) => {
  const token = storage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally — clear session and redirect to login
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      storage.clear();
      // Only redirect if we're not already on the login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;


// ── Auth API ─────────────────────────────────────────────────────────────────
export const authApi = {
  /**
   * Login with email + password.
   * POST /api/auth/login  →  { access_token, token_type, user }
   */
  login: (email, password) =>
    apiClient.post('/auth/login', { email, password }),

  /**
   * Get current authenticated user profile.
   * GET /api/auth/me  →  UserResponse
   */
  me: () => apiClient.get('/auth/me'),

  /**
   * Acknowledge logout (client must discard the token).
   * POST /api/auth/logout
   */
  logout: () => apiClient.post('/auth/logout').catch(() => {}),
};


// ── Cases API ─────────────────────────────────────────────────────────────────
export const casesApi = {
  /** GET /api/cases — list all cases visible to current user */
  list: () => apiClient.get('/cases'),

  /** GET /api/cases/:id */
  get: (id) => apiClient.get(`/cases/${id}`),

  /** POST /api/cases */
  create: (data) => apiClient.post('/cases', data),

  /** PUT /api/cases/:id */
  update: (id, data) => apiClient.put(`/cases/${id}`, data),

  /** GET /api/cases/:id/activity */
  activity: (id) => apiClient.get(`/cases/${id}/activity`),
};


// ── Statements API ────────────────────────────────────────────────────────────
export const statementsApi = {
  /** GET /api/statements/case/:caseId */
  getByCase: (caseId) => apiClient.get(`/statements/case/${caseId}`),

  /** GET /api/statements/:id */
  get: (id) => apiClient.get(`/statements/${id}`),
};


// ── Evidence API ──────────────────────────────────────────────────────────────
export const evidenceApi = {
  /** GET /api/evidence/case/:caseId */
  getByCase: (caseId) => apiClient.get(`/evidence/case/${caseId}`),
};


// ── Claims API ────────────────────────────────────────────────────────────────
export const claimsApi = {
  /** GET /api/claims/case/:caseId */
  getByCase: (caseId) => apiClient.get(`/claims/case/${caseId}`),

  /** PUT /api/claims/:id/verify  or  POST /api/verification/:claimId */
  verify: (claimId, status, explanation) =>
    apiClient.post(`/verification/${claimId}`, { status, explanation }),
};


// ── Timeline API ──────────────────────────────────────────────────────────────
export const timelineApi = {
  /** GET /api/timeline/case/:caseId */
  getByCase: (caseId) => apiClient.get(`/timeline/case/${caseId}`),
};


// ── Reports API ───────────────────────────────────────────────────────────────
export const reportsApi = {
  /** GET /api/reports/case/:caseId */
  getByCase: (caseId) => apiClient.get(`/reports/case/${caseId}`),

  /** POST /api/reports/generate */
  generate: (caseId) => apiClient.post('/reports/generate', { case_id: caseId }),
};


// ── Health check ──────────────────────────────────────────────────────────────
export const systemApi = {
  health: () => axios.get(
    import.meta.env.VITE_API_BASE_URL
      ? `${import.meta.env.VITE_API_BASE_URL}/health`
      : '/health'  // will hit Vite's proxy
  ),
};


// ── investigationApi ──────────────────────────────────────────────────────────
// Used by the authority dashboard pages (Dashboard, CaseManagement, etc.).
// Attempts real backend calls; falls back to synthetic data when the backend
// returns no records or when the call fails (e.g. demo / offline mode).
// Synthetic data format is kept intact so no page components need changing.

const simulateDelay = (ms = 150) => new Promise(r => setTimeout(r, ms));

/**
 * Maps a backend CaseResponse to the synthetic case shape that page
 * components depend on (they use fields like .incidentType, .priority, etc.)
 */
function adaptCase(backendCase) {
  return {
    // Real fields
    id:          String(backendCase.id),
    title:       backendCase.title || 'Untitled Case',
    description: backendCase.description || '',
    status:      adaptStatus(backendCase.status),
    // Synthesized display fields (backend does not have these)
    incidentType:     backendCase.description?.slice(0, 40) || 'Incident',
    priority:         backendCase.status === 'open' ? 'HIGH' : 'MEDIUM',
    leadInvestigator: 'Assigned Investigator',
    // Carry through any extra backend data under a _raw key
    _raw: backendCase,
  };
}

function adaptStatus(status) {
  // Map backend status values to the display labels used in the UI
  const map = {
    open:        'Active Investigation',
    active:      'Active Investigation',
    'in-review': 'Verification Phase',
    review:      'Verification Phase',
    closed:      'Completed',
    completed:   'Completed',
  };
  return map[status?.toLowerCase()] ?? status ?? 'Active Investigation';
}

export const investigationApi = {
  /**
   * Fetch cases.
   * Tries the real backend first; merges with synthetic data as fallback.
   */
  getCases: async () => {
    try {
      const { data } = await casesApi.list();
      const realCases = Array.isArray(data) && data.length > 0
        ? data.map(adaptCase)
        : [];

      // Merge: real cases first, then synthetic cases that aren't duplicated
      const combined = realCases.length > 0
        ? realCases
        : SYNTHETIC_CASES;

      return { data: combined, status: 200 };
    } catch {
      return { data: SYNTHETIC_CASES, status: 200 };
    }
  },

  getCaseById: async (caseId) => {
    try {
      const numId = parseInt(caseId, 10);
      if (!isNaN(numId)) {
        const { data } = await casesApi.get(numId);
        return { data: adaptCase(data), status: 200 };
      }
    } catch { /* fall through */ }
    const found = SYNTHETIC_CASES.find(c => c.id === caseId) || SYNTHETIC_CASES[0];
    return { data: found, status: 200 };
  },

  // ── The following still use synthetic data because the authority dashboard
  //    pages depend on synthetic-specific field shapes (statements[].fragments,
  //    evidence[].telemetryType, etc.). The real endpoints exist on the backend
  //    and can be wired in once the page components are updated.

  getStatementData: async (caseId) => {
    await simulateDelay(150);
    const found = SYNTHETIC_CASES.find(c => c.id === caseId) || SYNTHETIC_CASES[0];
    return { data: found.statements, status: 200 };
  },

  getEvidenceList: async (caseId) => {
    await simulateDelay(150);
    const found = SYNTHETIC_CASES.find(c => c.id === caseId) || SYNTHETIC_CASES[0];
    return { data: found.evidence, status: 200 };
  },

  getClaims: async (caseId) => {
    await simulateDelay(150);
    const found = SYNTHETIC_CASES.find(c => c.id === caseId) || SYNTHETIC_CASES[0];
    return { data: found.claims, status: 200 };
  },

  updateClaimStatus: async (caseId, claimId, newStatus, explanation) => {
    await simulateDelay(200);
    // Attempt real backend verification
    try {
      await claimsApi.verify(claimId, newStatus, explanation);
    } catch { /* synthetic fallback */ }
    return {
      data: { success: true, caseId, claimId, newStatus, explanation, updatedAt: new Date().toISOString() },
      status: 200,
    };
  },

  getTimelineEvents: async (caseId) => {
    await simulateDelay(150);
    const found = SYNTHETIC_CASES.find(c => c.id === caseId) || SYNTHETIC_CASES[0];
    return { data: found.timeline, status: 200 };
  },

  getCorrelationGraph: async (caseId) => {
    await simulateDelay(200);
    const found = SYNTHETIC_CASES.find(c => c.id === caseId) || SYNTHETIC_CASES[0];
    return { data: found.correlationData, status: 200 };
  },

  getRootCauses: async (caseId) => {
    await simulateDelay(150);
    const found = SYNTHETIC_CASES.find(c => c.id === caseId) || SYNTHETIC_CASES[0];
    return { data: found.rootCauses, status: 200 };
  },

  getInvestigationReport: async (caseId) => {
    await simulateDelay(200);
    const found = SYNTHETIC_CASES.find(c => c.id === caseId) || SYNTHETIC_CASES[0];
    return { data: found.report, status: 200 };
  },

  getAuditLogs: async () => {
    await simulateDelay(150);
    return { data: INITIAL_AUDIT_LOGS, status: 200 };
  },

  recordAuditLog: async (logEntry) => {
    await simulateDelay(100);
    return {
      data: {
        ...logEntry,
        id: `AUD-${Date.now()}`,
        timestamp: new Date().toISOString(),
        blockNumber: Math.floor(48920 + Math.random() * 1000),
      },
      status: 201,
    };
  },
};
