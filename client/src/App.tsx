import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Layout } from './components/layout/Layout';

// Page Views
import { FindBuyersPage } from './pages/FindBuyersPage';
import { DashboardPage } from './pages/DashboardPage';
import { IndustrialWorkspace } from './pages/IndustrialWorkspace';
import { LeadsPage } from './pages/LeadsPage';
import { CompaniesPage } from './pages/CompaniesPage';
import { ImportPage } from './pages/ImportPage';
import { CampaignsPage } from './pages/CampaignsPage';
import { TemplatesPage } from './pages/TemplatesPage';
import { FollowUpsPage } from './pages/FollowUpsPage';
import { SuppressionPage } from './pages/SuppressionPage';
import { ReportsPage } from './pages/ReportsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { NotFoundPage } from './pages/NotFoundPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return <div className="h-screen flex items-center justify-center text-slate-400">Loading ExportFlow...</div>;
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected App Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/find-buyers" replace />} />
                <Route path="find-buyers" element={<FindBuyersPage />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="industrial" element={<IndustrialWorkspace />} />
                <Route path="leads" element={<LeadsPage />} />
                <Route path="companies" element={<CompaniesPage />} />
                <Route path="import" element={<ImportPage />} />
                <Route path="campaigns" element={<CampaignsPage />} />
                <Route path="templates" element={<TemplatesPage />} />
                <Route path="followups" element={<FollowUpsPage />} />
                <Route path="suppression" element={<SuppressionPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="audit" element={<AuditLogsPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};
export default App;
