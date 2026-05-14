import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SidebarProvider } from './context/SidebarContext';
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';
import LandingPage from './pages/landing/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import UploadPage from './pages/upload/UploadPage';
import ProjectsPage from './pages/projects/ProjectsPage';
import ProjectOverviewPage from './pages/projects/ProjectOverviewPage';
import TestCasesPage from './pages/testcases/TestCasesPage';
import TestCaseDetailPage from './pages/testcases/TestCaseDetailPage';
import AutomationPage from './pages/automation/AutomationPage';
import ScriptViewerPage from './pages/automation/ScriptViewerPage';
import ExecutionPage from './pages/execution/ExecutionPage';
import ReportsDashboardPage from './pages/reports/ReportsDashboardPage';
import FailureAnalysisPage from './pages/reports/FailureAnalysisPage';
import CoverageReportPage from './pages/reports/CoverageReportPage';
import SettingsPage from './pages/settings/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SidebarProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
            </Route>

            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/projects/:id" element={<ProjectOverviewPage />} />
              <Route path="/testcases" element={<TestCasesPage />} />
              <Route path="/testcases/:id" element={<TestCaseDetailPage />} />
              <Route path="/automation" element={<AutomationPage />} />
              <Route path="/automation/:id" element={<ScriptViewerPage />} />
              <Route path="/executions" element={<ExecutionPage />} />
              <Route path="/reports" element={<ReportsDashboardPage />} />
              <Route path="/reports/failures/:id" element={<FailureAnalysisPage />} />
              <Route path="/reports/coverage/:id" element={<CoverageReportPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SidebarProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
