// API Endpoints Constants
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    REFRESH: '/auth/refresh',
  },
  DASHBOARD: {
    STATS: '/dashboard/stats',
  },
  PROJECTS: {
    LIST: '/projects',
    GET: (id) => `/projects/${id}`,
    CREATE: '/projects',
    UPDATE: (id) => `/projects/${id}`,
    DELETE: (id) => `/projects/${id}`,
    UPLOAD_ZIP: '/projects/upload',
    CONNECT_REPO: '/projects/connect',
    RECENT: '/projects/recent',
    ANALYSIS: (id) => `/projects/${id}/analysis`,
  },
  ANALYSIS: {
    START: '/analysis/start',
    STATUS: (id) => `/analysis/${id}/status`,
    RESULT: (id) => `/analysis/${id}/result`,
  },
  WORKFLOWS: {
    GET: (projectId) => `/projects/${projectId}/workflow`,
    LIST: '/workflows',
  },
  TEST_CASES: {
    LIST: (projectId) => `/projects/${projectId}/testcases`,
    GET: (id) => `/testcases/${id}`,
    CREATE: '/testcases',
    UPDATE: (id) => `/testcases/${id}`,
    DELETE: (id) => `/testcases/${id}`,
    GENERATE: (projectId) => `/projects/${projectId}/testcases/generate`,
    EXPORT: (projectId, format) => `/projects/${projectId}/testcases/export?format=${format}`,
    APPROVE: (id) => `/testcases/${id}/approve`,
    REJECT: (id) => `/testcases/${id}/reject`,
  },
  AUTOMATION: {
    SCRIPTS_LIST: (projectId) => `/projects/${projectId}/scripts`,
    SCRIPT_GET: (id) => `/scripts/${id}`,
    GENERATE: (projectId) => `/projects/${projectId}/scripts/generate`,
    DOWNLOAD: (projectId) => `/projects/${projectId}/scripts/download`,
    DELETE: (id) => `/scripts/${id}`,
  },
  EXECUTION: {
    LIST: (projectId) => `/projects/${projectId}/executions`,
    GET: (id) => `/executions/${id}`,
    CONFIGURE: '/execution/configure',
    START: (projectId) => `/projects/${projectId}/executions/run`,
    HISTORY: '/executions/history',
    LOGS: (executionId) => `/executions/${executionId}/logs`,
    RETRY: (executionId) => `/executions/${executionId}/retry`,
  },
  REPORTS: {
    LIST: '/reports',
    GET: (id) => `/reports/${id}`,
    GENERATE: (executionId) => `/executions/${executionId}/report`,
    FAILURES: (executionId) => `/executions/${executionId}/failures`,
    COVERAGE: (projectId) => `/projects/${projectId}/coverage`,
    DOWNLOAD: (id, format) => `/reports/${id}/download?format=${format}`,
    RECENT: '/reports/recent',
  },
  SETTINGS: {
    GET: '/settings',
    UPDATE: '/settings',
    API_KEYS: '/settings/api-keys',
    GITHUB_TOKEN: '/settings/github-token',
    NOTIFICATIONS: '/settings/notifications',
  },
};

export const API_TIMEOUT = 30000;
