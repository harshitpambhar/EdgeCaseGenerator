import axios from 'axios';

// Calls the API Gateway directly. CORS is handled by the gateway (allowedOrigins: http://localhost:5173).
// For production, set VITE_API_URL to your deployed gateway URL.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

export function getErrorMessage(error) {
  if (!error.response) {
    if (error.code === 'ERR_CANCELED') return 'Request was canceled.';
    return 'Cannot reach the API Gateway. Ensure it is running on http://localhost:8080.';
  }
  const { status, data } = error.response;
  if (data?.errors && typeof data.errors === 'object') {
    const first = Object.values(data.errors).find((v) => typeof v === 'string');
    if (first) return first;
  }
  if (data && typeof data.message === 'string' && data.message.trim()) return data.message;
  switch (status) {
    case 400: return 'Invalid request. Check the form fields.';
    case 401: return 'Invalid email or password.';
    case 403: return 'You do not have permission for this action.';
    case 409: return typeof data?.message === 'string' ? data.message : 'This email is already registered.';
    case 422: return 'Validation failed. Check your input.';
    case 500: return 'Server error. Please try again later.';
    case 502: return 'Bad gateway: start Config Server, Eureka, auth-service, and user-service, then wait for them to register.';
    case 503: return 'Service unavailable. Try again in a moment.';
    default: return `Request failed (${status}).`;
  }
}

export function getFieldErrors(error) {
  const data = error.response?.data;
  if (data?.errors && typeof data.errors === 'object') return data.errors;
  return {};
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    const isAuthPublic = url.includes('/auth/login') || url.includes('/auth/signup');
    if (status === 401 && !isAuthPublic) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      const path = window.location.pathname;
      if (!path.startsWith('/login') && !path.startsWith('/signup')) {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  signup: (payload) =>
    api.post('/auth/signup', {
      fullName: payload.fullName ?? payload.name,
      email: payload.email,
      password: payload.password,
    }),
};

export const repoService = {
  getAll: () => api.get('/repositories'),
  getById: (id) => api.get(`/repositories/${id}`),
  upload: (formData) => api.post('/repositories/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  analyzeUrl: (url) => api.post('/repositories/analyze', { url }),
};

export const testService = {
  generate: (repoId) => api.post(`/tests/generate/${repoId}`),
  getResults: (repoId) => api.get(`/tests/results/${repoId}`),
  getStatus: (jobId) => api.get(`/tests/status/${jobId}`),
};

export const coverageService = {
  getReport: (repoId) => api.get(`/coverage/${repoId}`),
  getTrend: (repoId) => api.get(`/coverage/${repoId}/trend`),
};

export const reportService = {
  getAll: () => api.get('/reports'),
  download: (reportId, format) => api.get(`/reports/${reportId}/download?format=${format}`, { responseType: 'blob' }),
};

export default api;
