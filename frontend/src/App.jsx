import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SidebarProvider } from './context/SidebarContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';
import NotificationContainer from './components/notifications/NotificationContainer';
import ConfirmDialog from './components/modals/ConfirmDialog';
import LandingPage from './pages/landing/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProjectsPage from './pages/projects/ProjectsPage';
import UploadPage from './pages/upload/UploadPage';
import ProjectOverviewPage from './pages/projects/ProjectOverviewPage';
import RepositoryAnalysisPage from './pages/repository/RepositoryAnalysisPage';
import WorkflowVisualizationPage from './pages/workflows/WorkflowVisualizationPage';
import TestCasesPage from './pages/testcases/TestCasesPage';
import TestCaseDetailPage from './pages/testcases/TestCaseDetailPage';
import TestGenerationPage from './pages/testcases/TestGenerationPage';
import TestReviewPage from './pages/testcases/TestReviewPage';
import AutomationPage from './pages/automation/AutomationPage';
import ScriptViewerPage from './pages/automation/ScriptViewerPage';
import ExecutionPage from './pages/execution/ExecutionPage';
import ExecutionConfigurationPage from './pages/execution/ExecutionConfigurationPage';
import ExecutionHistoryPage from './pages/execution/ExecutionHistoryPage';
import ReportsDashboardPage from './pages/reports/ReportsDashboardPage';
import FailureAnalysisPage from './pages/reports/FailureAnalysisPage';
import CoverageReportPage from './pages/reports/CoverageReportPage';
import SettingsPage from './pages/settings/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <ConfirmProvider>
            <Routes>
                {/* Landing page for unauthenticated users */}
                <Route path="/" element={<LandingPage />} />
            {/* Protected routes */}
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<ProtectedRoute element={<DashboardPage />} />} />
              <Route path="/upload" element={<ProtectedRoute element={<UploadPage />} />} />
              <Route path="/processing" element={<ProtectedRoute element={<ProcessingPage />} />} />
              <Route path="/explorer" element={<ProtectedRoute element={<ExplorerPage />} />} />
              <Route path="/coverage" element={<ProtectedRoute element={<CoveragePage />} />} />
              <Route path="/recommendations" element={<ProtectedRoute element={<RecommendationsPage />} />} />
              <Route path="/reports" element={<ProtectedRoute element={<ReportsPage />} />} />
              <Route path="/settings" element={<ProtectedRoute element={<SettingsPage />} />} />
            </Route>

                {/* Protected Dashboard Routes */}
                <Route
                  element={
                    <ProtectedRoute>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/dashboard" element={<DashboardPage />} />
                  
                  {/* Projects */}
                  <Route path="/projects" element={<ProjectsPage />} />
                  <Route path="/upload" element={<UploadPage />} />
                  <Route path="/projects/:id" element={<ProjectOverviewPage />} />
                  
                  {/* Repository Analysis */}
                  <Route path="/repository-analysis" element={<RepositoryAnalysisPage />} />
                  <Route path="/repository-analysis/:id" element={<RepositoryAnalysisPage />} />
                  
                  {/* Workflows */}
                  <Route path="/workflows" element={<WorkflowVisualizationPage />} />
                  <Route path="/workflows/:id" element={<WorkflowVisualizationPage />} />
                  
                  {/* Test Cases */}
                  <Route path="/testcases" element={<TestCasesPage />} />
                  <Route path="/testcases/:id" element={<TestCaseDetailPage />} />
                  
                  {/* Test Generation */}
                  <Route path="/test-generation" element={<TestGenerationPage />} />
                  <Route path="/test-generation/:projectId" element={<TestGenerationPage />} />
                  
                  {/* Test Review */}
                  <Route path="/test-review" element={<TestReviewPage />} />
                  <Route path="/test-review/:projectId" element={<TestReviewPage />} />
                  
                  {/* Automation */}
                  <Route path="/automation" element={<AutomationPage />} />
                  <Route path="/automation/:id" element={<ScriptViewerPage />} />
                  
                  {/* Execution */}
                  <Route path="/executions" element={<ExecutionPage />} />
                  <Route path="/executions/configure" element={<ExecutionConfigurationPage />} />
                  <Route path="/execution-history" element={<ExecutionHistoryPage />} />
                  
                  {/* Reports */}
                  <Route path="/reports" element={<ReportsDashboardPage />} />
                  <Route path="/reports/failures/:id" element={<FailureAnalysisPage />} />
                  <Route path="/reports/coverage/:id" element={<CoverageReportPage />} />
                  
                  {/* Settings */}
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>

                {/* Default Routes */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>

              {/* Global Components */}
              <NotificationContainer />
              <ConfirmDialog />
          </ConfirmProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
