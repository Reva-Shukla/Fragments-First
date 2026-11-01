import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CaseProvider } from './context/CaseContext';
import { AppLayout } from './components/layout/AppLayout';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Page Imports
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { CaseManagement } from './pages/CaseManagement';
import { StatementReview } from './pages/StatementReview';
import { EvidenceExplorer } from './pages/EvidenceExplorer';
import { ClaimVerification } from './pages/ClaimVerification';
import { TimelineAnalysis } from './pages/TimelineAnalysis';
import { ServiceCorrelation } from './pages/ServiceCorrelation';
import { RootCauseAnalysis } from './pages/RootCauseAnalysis';
import { InvestigationReports } from './pages/InvestigationReports';
import { AuditLogs } from './pages/AuditLogs';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Wait for AuthContext to finish restoring the stored session
  // before deciding whether to redirect. Without this, a page refresh
  // causes a flash-to-login even when a valid token is in localStorage.
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#172D46',
        color: '#8FAFC4',
        fontFamily: 'monospace',
        fontSize: '13px',
        letterSpacing: '0.08em',
      }}>
        AUTHENTICATING SESSION...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <CaseProvider>
            <Routes>
              {/* Public Authority Login */}
              <Route path="/login" element={<Login />} />

              {/* Protected Authority Platform Shell */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="cases" element={<CaseManagement />} />
                <Route path="statement-review" element={<StatementReview />} />
                <Route path="evidence" element={<EvidenceExplorer />} />
                <Route path="claim-verification" element={<ClaimVerification />} />
                <Route path="timeline" element={<TimelineAnalysis />} />
                <Route path="correlation" element={<ServiceCorrelation />} />
                <Route path="root-cause" element={<RootCauseAnalysis />} />
                <Route path="reports" element={<InvestigationReports />} />
                <Route path="audit-logs" element={<AuditLogs />} />
              </Route>

              {/* Catch-all fallback */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </CaseProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
