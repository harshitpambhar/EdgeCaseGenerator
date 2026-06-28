// Status Constants
export const STATUS = {
  PENDING: 'Pending',
  RUNNING: 'Running',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
  PAUSED: 'Paused',
  QUEUED: 'Queued',
  CANCELLED: 'Cancelled',
};

export const TEST_CASE_TYPES = {
  FUNCTIONAL: 'Functional',
  EDGE_CASE: 'Edge Case',
  API: 'API',
  SECURITY: 'Security',
  PERFORMANCE: 'Performance',
};

export const PRIORITY_LEVELS = {
  CRITICAL: 'Critical',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
};

export const SEVERITY_LEVELS = {
  CRITICAL: 'Critical',
  MAJOR: 'Major',
  MINOR: 'Minor',
  TRIVIAL: 'Trivial',
};

export const WORKFLOW_STEPS = {
  UPLOAD: 'Upload',
  ANALYSIS: 'AI Analysis',
  WORKFLOW_DETECTION: 'Workflow Detection',
  TEST_GENERATION: 'Test Generation',
  SCRIPT_GENERATION: 'Script Generation',
  EXECUTION_CONFIG: 'Execution Config',
  EXECUTION: 'Execution',
  REPORT: 'Report',
};

export const FRAMEWORK_TYPES = {
  REACT: 'React',
  NEXT: 'Next.js',
  VUE: 'Vue',
  ANGULAR: 'Angular',
  EXPRESS: 'Express',
  SPRING_BOOT: 'Spring Boot',
  FASTAPI: 'FastAPI',
  DJANGO: 'Django',
  JAVA: 'Java',
  PYTHON: 'Python',
  NODE_JS: 'Node.js',
  TYPESCRIPT: 'TypeScript',
};

export const TEST_FRAMEWORK_TYPES = {
  PLAYWRIGHT: 'Playwright',
  SELENIUM: 'Selenium',
  CYPRESS: 'Cypress',
  JEST: 'Jest',
  PYTEST: 'pytest',
  UNITTEST: 'unittest',
  MOCHA: 'Mocha',
  JASMINE: 'Jasmine',
};

export const COLOR_BY_STATUS = {
  [STATUS.COMPLETED]: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  [STATUS.RUNNING]: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  [STATUS.FAILED]: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  [STATUS.PENDING]: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  [STATUS.QUEUED]: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  [STATUS.PAUSED]: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  [STATUS.CANCELLED]: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
};

export const COLOR_BY_TYPE = {
  [TEST_CASE_TYPES.FUNCTIONAL]: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  [TEST_CASE_TYPES.EDGE_CASE]: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  [TEST_CASE_TYPES.API]: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  [TEST_CASE_TYPES.SECURITY]: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  [TEST_CASE_TYPES.PERFORMANCE]: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
};

export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

export const SIDEBAR_NAVIGATION = [
  { path: '/dashboard', label: 'Dashboard', id: 'dashboard' },
  { path: '/projects', label: 'Projects', id: 'projects' },
  { path: '/requirements', label: 'Requirements', id: 'requirements' },
  { path: '/requirement-mapping', label: 'Requirement Mappings', id: 'requirement-mapping' },
  { path: '/repository-analysis', label: 'Repository Analysis', id: 'analysis' },
  { path: '/workflows', label: 'Workflows', id: 'workflows' },
  { path: '/test-generation', label: 'Test Generation', id: 'test-generation' },
  { path: '/test-review', label: 'Test Reviews', id: 'test-review' },
  { path: '/automation', label: 'Automation Scripts', id: 'automation' },
  { path: '/executions', label: 'Executions', id: 'executions' },
  { path: '/reports', label: 'Reports', id: 'reports' },
  { path: '/execution-history', label: 'History', id: 'history' },
  { path: '/settings', label: 'Settings', id: 'settings' },
];
