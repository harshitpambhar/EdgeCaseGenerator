import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor for auth tokens
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor for error handling
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
