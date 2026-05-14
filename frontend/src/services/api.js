import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  signup: (userData) => api.post('/auth/register', userData),
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

export const reportService = {
  getAll: () => api.get('/reports'),
  getById: (id) => api.get(`/reports/${id}`),
  getFailures: (executionId) => api.get(`/executions/${executionId}/failures`),
  getCoverage: (projectId) => api.get(`/projects/${projectId}/coverage`),
  download: (reportId, format) => api.get(`/reports/${reportId}/download?format=${format}`, { responseType: 'blob' }),
};

export default api;
