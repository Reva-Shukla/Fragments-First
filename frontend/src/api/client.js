/**
 * Fragment First — Victim Frontend API Client
 *
 * Token storage strategy (victim-side):
 *   - Short-lived ACCESS TOKEN  → in-memory only (React state in AuthContext).
 *                                 Never written to localStorage/sessionStorage.
 *   - Long-lived REFRESH TOKEN  → HttpOnly Secure cookie set by the backend.
 *                                 Never readable by JavaScript.
 *
 * withCredentials: true  — tells the browser to send cookies on every request,
 * including the ff_victim_session cookie to /api/auth/session and /api/auth/cookie-logout.
 */

import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const client = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
  withCredentials: true,   // send HttpOnly session cookie on every request
});

// ── Request interceptor: attach the in-memory access token ───────────────────
// The token is injected at runtime by AuthContext via setAccessToken().
// It is never stored in localStorage.
let _inMemoryToken = null;

export function setAccessToken(token) {
  _inMemoryToken = token;
}

export function clearAccessToken() {
  _inMemoryToken = null;
}

client.interceptors.request.use((config) => {
  if (_inMemoryToken) {
    config.headers.Authorization = `Bearer ${_inMemoryToken}`;
  }
  return config;
});

// ── Response interceptor: on 401 clear state and redirect to login ────────────
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear in-memory token — the cookie will be cleaned up by cookie-logout
      clearAccessToken();
      // Remove legacy localStorage keys if any remain from an older session
      localStorage.removeItem('ff_token');
      localStorage.removeItem('ff_user');

      // Only redirect if not already on an auth page
      const path = window.location.pathname;
      if (!path.includes('/victim/login') && !path.includes('/victim/register')) {
        window.location.href = '/victim/login';
      }
    }
    return Promise.reject(error);
  }
);

export default client;

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  register:      (data)     => client.post('/auth/register', data),
  login:         (data)     => client.post('/auth/login', data),
  me:            ()         => client.get('/auth/me'),

  /**
   * Silent session restore using the HttpOnly refresh cookie.
   * Called on every page load. Returns a new access_token + user on success.
   * Returns 401 if the cookie is absent, expired, or revoked.
   */
  refreshSession: ()        => client.post('/auth/session'),

  /**
   * Clear the HttpOnly session cookie on logout.
   * Does NOT require an Authorization header.
   */
  cookieLogout:  ()         => client.post('/auth/cookie-logout'),

  /** Legacy bearer-only logout (notifies backend, best-effort). */
  logout:        ()         => client.post('/auth/logout').catch(() => {}),

  checkUsername: (username) => client.get('/auth/check-username', { params: { username } }),
};

// ── Cases ─────────────────────────────────────────────────────────────────────
export const casesApi = {
  list:   ()         => client.get('/cases'),
  create: (data)     => client.post('/cases', data),
  get:    (id)       => client.get(`/cases/${id}`),
  update: (id, data) => client.put(`/cases/${id}`, data),
};

// ── Statements ────────────────────────────────────────────────────────────────
export const statementsApi = {
  submit:    (data)     => client.post('/statements', data),
  getByCase: (caseId)   => client.get(`/statements/case/${caseId}`),
  getOne:    (id)       => client.get(`/statements/${id}`),
  update:    (id, data) => client.put(`/statements/${id}`, data),
};

// ── Reconstruction ────────────────────────────────────────────────────────────
export const reconstructionApi = {
  submit:          (statementId) => client.post('/reconstruction/submit', { statement_id: statementId }),
  getForStatement: (statementId) => client.get(`/reconstruction/statement/${statementId}`),
  approve:         (id, data)    => client.post(`/reconstruction/${id}/approve`, data),
  correct:         (id, notes)   => client.post(`/reconstruction/${id}/correct`, { correction_notes: notes }),
};
