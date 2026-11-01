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
 *   casesApi   — real case CRUD endpoints.
 *   investigationApi — authority dashboard data layer with graceful synthetic fallback.
 */

import axios from 'axios';
import { SYNTHETIC_CASES, INITIAL_AUDIT_LOGS } from '../data/syntheticCases';

// ── Storage helpers ─────────────────────────────────────────────────────────
const TOKEN_KEY = 'ff_authority_token';
const USER_KEY  = 'ff_authority_user';

export const storage = {
  getToken:   ()  => localStorage.getItem(TOKEN_KEY),
  setToken:   (t) => localStorage.setItem(TOKEN_KEY, t),
  clearToken: ()  => localStorage.removeItem(TOKEN_KEY),
  getUser:    ()  => { try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; } },
  setUser:    (u) => localStorage.setItem(USER_KEY, JSON.stringify(u)),
  clearUser:  ()  => localStorage.removeItem(USER_KEY),
  clear:      ()  => { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); },
};

// ── Axios instance ────────────────────────────────────────────────────────────
const BASE = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api`
  : '/api';

const apiClient = axios.create({
  baseURL: BASE,
  timeout: 30000,
  headers: { 
    'Content-Type': 'application/json',
    'X-Client-Platform': 'FRAGMENT-FIRST-AUTHORITY',
    'X-Clearance-Level': 'RESTRICTED-LE-SENSITIVE'
  },
});

// Attach JWT token on every request
apiClient.interceptors.request.use((config) => {
  const token = storage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      storage.clear();
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
  login: (email, password) =>
    apiClient.post('/auth/login', { email, password }),

  me: () => apiClient.get('/auth/me'),

  logout: () => apiClient.post('/auth/logout').catch(() => {}),
};

// ── Cases API ─────────────────────────────────────────────────────────────────
export const casesApi = {
  list: () => apiClient.get('/cases'),
  get: (id) => apiClient.get(`/cases/${id}`),
  create: (data) => apiClient.post('/cases', data),
  update: (id, data) => apiClient.put(`/cases/${id}`, data),
  activity: (id) => apiClient.get(`/cases/${id}/activity`),
};

// ── Statements API ────────────────────────────────────────────────────────────
export const statementsApi = {
  getByCase: (caseId) => apiClient.get(`/statements/case/${caseId}`),
  get: (id) => apiClient.get(`/statements/${id}`),
};

// ── Evidence API ──────────────────────────────────────────────────────────────
export const evidenceApi = {
  getByCase: (caseId) => apiClient.get(`/evidence/case/${caseId}`),
};

// ── Claims API ────────────────────────────────────────────────────────────────
export const claimsApi = {
  getByCase: (caseId) => apiClient.get(`/claims/case/${caseId}`),
  verify: (claimId, status, explanation) =>
    apiClient.post(`/verification/${claimId}`, { status, explanation }),
};

// ── Timeline API ──────────────────────────────────────────────────────────────
export const timelineApi = {
  getByCase: (caseId) => apiClient.get(`/timeline/case/${caseId}`),
};

// ── Reports API ───────────────────────────────────────────────────────────────
export const reportsApi = {
  getByCase: (caseId) => apiClient.get(`/reports/case/${caseId}`),
  generate: (caseId) => apiClient.post('/reports/generate', { case_id: caseId }),
};

// ── Health check ──────────────────────────────────────────────────────────────
export const systemApi = {
  health: () => axios.get(
    import.meta.env.VITE_API_BASE_URL
      ? `${import.meta.env.VITE_API_BASE_URL}/health`
      : '/health'
  ),
};

// ── investigationApi ──────────────────────────────────────────────────────────
const simulateDelay = (ms = 150) => new Promise(r => setTimeout(r, ms));

function adaptCase(backendCase) {
  return {
    id: String(backendCase.id),
    title: backendCase.title || 'Untitled Case',
    description: backendCase.description || '',
    status: adaptStatus(backendCase.status),
    incidentType: backendCase.description?.slice(0, 40) || 'Incident',
    priority: backendCase.status === 'open' ? 'HIGH' : 'MEDIUM',
    leadInvestigator: 'Assigned Investigator',
    _raw: backendCase,
  };
}

function adaptStatus(status) {
  const map = {
    open: 'Active Investigation',
    active: 'Active Investigation',
    'in-review': 'Verification Phase',
    review: 'Verification Phase',
    closed: 'Completed',
    completed: 'Completed',
  };
  return map[status?.toLowerCase()] ?? status ?? 'Active Investigation';
}

export const investigationApi = {
  getCases: async () => {
    try {
      const { data } = await casesApi.list();
      const realCases = Array.isArray(data) && data.length > 0
        ? data.map(adaptCase)
        : [];

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
