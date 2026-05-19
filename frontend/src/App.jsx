import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { SidebarProvider } from './context/SidebarContext';

import ProtectedRoute from './components/ProtectedRoute';

import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';

import LandingPage from './pages/landing/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';

import DashboardPage from './pages/dashboard/DashboardPage';
import UploadPage from './pages/upload/UploadPage';
import SettingsPage from './pages/settings/SettingsPage';

// New pages
import RepositoryAnalysisPage from './pages/repository/RepositoryAnalysisPage';
import ReportsDashboardPage from './pages/reports/ReportsDashboardPage';
import TestCasesPage from './pages/testcases/TestCasesPage';
import ExecutionPage from './pages/execution/ExecutionPage';
import WorkflowVisualizationPage from './pages/workflows/WorkflowVisualizationPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SidebarProvider>
          <Routes>

            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />

            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
            </Route>

            {/* Protected Routes */}
            <Route element={<DashboardLayout />}>

              <Route
                path="/dashboard"
                element={<ProtectedRoute element={<DashboardPage />} />}
              />

              <Route
                path="/upload"
                element={<ProtectedRoute element={<UploadPage />} />}
              />

              <Route
                path="/repository"
                element={<ProtectedRoute element={<RepositoryAnalysisPage />} />}
              />

              <Route
                path="/reports"
                element={<ProtectedRoute element={<ReportsDashboardPage />} />}
              />

              <Route
                path="/testcases"
                element={<ProtectedRoute element={<TestCasesPage />} />}
              />

              <Route
                path="/execution"
                element={<ProtectedRoute element={<ExecutionPage />} />}
              />

              <Route
                path="/workflows"
                element={<ProtectedRoute element={<WorkflowVisualizationPage />} />}
              />

              <Route
                path="/settings"
                element={<ProtectedRoute element={<SettingsPage />} />}
              />

            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </SidebarProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}