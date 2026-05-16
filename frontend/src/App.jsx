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
import ProcessingPage from './pages/processing/ProcessingPage';
import ExplorerPage from './pages/explorer/ExplorerPage';
import CoveragePage from './pages/coverage/CoveragePage';
import RecommendationsPage from './pages/recommendations/RecommendationsPage';
import ReportsPage from './pages/reports/ReportsPage';
import SettingsPage from './pages/settings/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SidebarProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
            </Route>

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

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SidebarProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
