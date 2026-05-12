import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SidebarProvider } from './context/SidebarContext';
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import ProcessingPage from './pages/ProcessingPage';
import ExplorerPage from './pages/ExplorerPage';
import CoveragePage from './pages/CoveragePage';
import RecommendationsPage from './pages/RecommendationsPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';

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
            </Route>

            {/* Dashboard routes */}
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/processing" element={<ProcessingPage />} />
              <Route path="/explorer" element={<ExplorerPage />} />
              <Route path="/coverage" element={<CoveragePage />} />
              <Route path="/recommendations" element={<RecommendationsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SidebarProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
