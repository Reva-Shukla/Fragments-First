import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Attach JWT token to every authenticated request
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ff_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global error handling — role-aware 401 redirection
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      // Do not auto-redirect during login/register calls so form components can show invalid credential feedback
      const isAuthAttempt =
        requestUrl.includes('/auth/login') ||
        requestUrl.includes('/auth/register') ||
        requestUrl.includes('/auth/demo-session');

      if (!isAuthAttempt) {
        localStorage.removeItem('ff_token');
        localStorage.removeItem('ff_user');

        const pathname = window.location.pathname;
        if (pathname.startsWith('/victim')) {
          window.location.href = '/victim/login';
        } else {
          window.location.href = '/authority/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth Endpoints ────────────────────────────────────────────────
export const authApi = {
  register: (data) => client.post('/auth/register', data),
  login: (data) => client.post('/auth/login', data),
  me: () => client.get('/auth/me'),
  logout: () => client.post('/auth/logout'),
  checkUsername: (username) => client.get('/auth/check-username', { params: { username } }),
  demoSession: (role) => client.post('/auth/demo-session', { role }),
  getDemoStatus: () => client.get('/auth/demo-status'),
};

// ── Cases Endpoints ───────────────────────────────────────────────
export const casesApi = {
  list: () => client.get('/cases'),
  create: (data) => client.post('/cases', data),
  get: (id) => client.get(`/cases/${id}`),
  update: (id, data) => client.put(`/cases/${id}`, data),
  assign: (id, investigatorId) => client.put(`/cases/${id}/assign`, { investigator_id: investigatorId }),
  activity: (id) => client.get(`/cases/${id}/activity`),
};

// ── Statements Endpoints ──────────────────────────────────────────
export const statementsApi = {
  submit: (data) => client.post('/statements', data),
  getByCase: (caseId) => client.get(`/statements/case/${caseId}`),
  getOne: (id) => client.get(`/statements/${id}`),
  update: (id, data) => client.put(`/statements/${id}`, data),
};

// ── Reconstruction Endpoints ──────────────────────────────────────
export const reconstructionApi = {
  submit: (statementId) => client.post('/reconstruction/submit', { statement_id: statementId }),
  getForStatement: (statementId) => client.get(`/reconstruction/statement/${statementId}`),
  approve: (id, data) => client.post(`/reconstruction/${id}/approve`, data),
  correct: (id, notes) => client.post(`/reconstruction/${id}/correct`, { correction_notes: notes }),
};

export default client;
