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
  signup: (userData) => api.post('/auth/signup', userData),
  getCurrentUser: () => api.get('/auth/me'),
};

export const projectService = {
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  uploadZip: (formData) => api.post('/projects/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  analyzeUrl: (payload) => api.post('/projects/analyze-url', payload),
  getAnalysis: (id) => api.get(`/projects/${id}/analysis`),
};

export const testCaseService = {
  getByProject: (projectId, params) => api.get(`/projects/${projectId}/testcases`, { params }),
  getById: (id) => api.get(`/testcases/${id}`),
  generate: (projectId) => api.post(`/projects/${projectId}/testcases/generate`),
  export: (projectId, format) => api.get(`/projects/${projectId}/testcases/export?format=${format}`, { responseType: 'blob' }),
};

export const automationService = {
  getScripts: (projectId) => api.get(`/projects/${projectId}/scripts`),
  getScript: (scriptId) => api.get(`/scripts/${scriptId}`),
  generate: (projectId) => api.post(`/projects/${projectId}/scripts/generate`),
  download: (projectId) => api.get(`/projects/${projectId}/scripts/download`, { responseType: 'blob' }),
};

export const executionService = {
  getAll: (projectId) => api.get(`/projects/${projectId}/executions`),
  getById: (id) => api.get(`/executions/${id}`),
  run: (projectId, payload) => api.post(`/projects/${projectId}/executions/run`, payload),
  retry: (executionId) => api.post(`/executions/${executionId}/retry`),
  getLogs: (executionId) => api.get(`/executions/${executionId}/logs`),
};

// Job Service — talks to Spring Boot job-service via API Gateway
export const jobService = {
  create: (repoUrl) => api.post('/jobs', { repoUrl }),
  getById: (id) => api.get(`/jobs/${id}`),
  getAll: () => api.get('/jobs'),
  remove: (id) => api.delete(`/jobs/${id}`),
};

export const reportService = {
  getAll: () => api.get('/reports'),
  getById: (id) => api.get(`/reports/${id}`),
  getFailures: (executionId) => api.get(`/executions/${executionId}/failures`),
  getCoverage: (projectId) => api.get(`/projects/${projectId}/coverage`),
  download: (reportId, format) => api.get(`/reports/${reportId}/download?format=${format}`, { responseType: 'blob' }),
};

export default api;
