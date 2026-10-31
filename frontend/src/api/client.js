import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const client = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Attach JWT token to every authenticated request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('ff_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global error handling — redirect to login on 401
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ff_token');
      localStorage.removeItem('ff_user');
      window.location.href = '/victim/login';
    }
    return Promise.reject(error);
  }
);

export default client;

// ── Auth ─────────────────────────────────────────────────────────
export const authApi = {
  register:        (data)     => client.post('/auth/register', data),
  login:           (data)     => client.post('/auth/login', data),
  me:              ()         => client.get('/auth/me'),
  logout:          ()         => client.post('/auth/logout'),
  checkUsername:   (username) => client.get('/auth/check-username', { params: { username } }),
};

// ── Cases ─────────────────────────────────────────────────────────
export const casesApi = {
  list:   ()         => client.get('/cases'),
  create: (data)     => client.post('/cases', data),
  get:    (id)       => client.get(`/cases/${id}`),
  update: (id, data) => client.put(`/cases/${id}`, data),
};

// ── Statements ────────────────────────────────────────────────────
export const statementsApi = {
  submit:       (data)     => client.post('/statements', data),
  getByCase:    (caseId)   => client.get(`/statements/case/${caseId}`),
  getOne:       (id)       => client.get(`/statements/${id}`),
  update:       (id, data) => client.put(`/statements/${id}`, data),
};

// ── Reconstruction ────────────────────────────────────────────────
export const reconstructionApi = {
  submit:          (statementId)    => client.post('/reconstruction/submit', { statement_id: statementId }),
  getForStatement: (statementId)    => client.get(`/reconstruction/statement/${statementId}`),
  approve:         (id, data)       => client.post(`/reconstruction/${id}/approve`, data),
  correct:         (id, notes)      => client.post(`/reconstruction/${id}/correct`, { correction_notes: notes }),
};
