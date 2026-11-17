import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CaseProvider } from './context/CaseContext';
import { AppLayout } from './components/layout/AppLayout';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ToastProvider } from './components/victim/Toast';

// Authority Page Imports (Navy + Beige Theme from commit 17331b2)
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

// Victim Portal Page Imports (Scoped styling)
import LandingPage from './pages/LandingPage';
import VictimRegister from './pages/victim/VictimRegister';
import VictimLogin from './pages/victim/VictimLogin';
import VictimDashboard from './pages/victim/VictimDashboard';
import MyStatement from './pages/victim/MyStatement';
import MySubmissions from './pages/victim/MySubmissions';
import RedactionStudio from './pages/victim/RedactionStudio';
import ConsentReceipts from './pages/victim/ConsentReceipts';
import PrivacyIdentity from './pages/victim/PrivacyIdentity';
import HelpGuidance from './pages/victim/HelpGuidance';

/**
 * Scoped Layout Wrapper for Public Landing & Victim Portal Pages.
 * Ensures victim styles, fonts, and Toast notifications are encapsulated
 * within .victim-theme without leaking to the Navy + Beige Authority Portal.
 */
function VictimSpaceLayout() {
  return (
    <ToastProvider>
      <div className="victim-theme min-h-screen">
        <Outlet />
      </div>
    </ToastProvider>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <CaseProvider>
            <Routes>
              {/* ────────────────────────────────────────────────────────────
                  PUBLIC LANDING & VICTIM PORTAL SPACE (Scoped victim-theme)
                  ──────────────────────────────────────────────────────────── */}
              <Route element={<VictimSpaceLayout />}>
                {/* Landing Page */}
                <Route path="/" element={<LandingPage />} />

                {/* Victim Authentication */}
                <Route path="/victim/register" element={<VictimRegister />} />
                <Route path="/victim/login" element={<VictimLogin />} />

                {/* Protected Victim Routes (Role: victim only) */}
                <Route
                  path="/victim"
                  element={
                    <ProtectedRoute allowedRoles={['victim']}>
                      <Outlet />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/victim/dashboard" replace />} />
                  <Route path="dashboard" element={<VictimDashboard />} />
                  <Route path="statement" element={<MyStatement />} />
                  <Route path="submissions" element={<MySubmissions />} />
                  <Route path="redaction" element={<RedactionStudio />} />
                  <Route path="receipts" element={<ConsentReceipts />} />
                  <Route path="privacy" element={<PrivacyIdentity />} />
                  <Route path="help" element={<HelpGuidance />} />
                </Route>
              </Route>

              {/* ────────────────────────────────────────────────────────────
                  AUTHORITY PORTAL SPACE (Preserved Navy + Beige commit 17331b2)
                  ──────────────────────────────────────────────────────────── */}
              {/* Authority Authentication */}
              <Route path="/authority/login" element={<Login />} />
              <Route path="/login" element={<Navigate to="/authority/login" replace />} />

              {/* Protected Authority Platform Shell (Roles: investigator, admin) */}
              <Route
                path="/authority"
                element={
                  <ProtectedRoute allowedRoles={['investigator', 'admin']}>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/authority/dashboard" replace />} />
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

              {/* ────────────────────────────────────────────────────────────
                  BACKWARD-COMPATIBLE REDIRECTS FOR LEGACY DIRECT ROUTES
                  ──────────────────────────────────────────────────────────── */}
              <Route path="/dashboard" element={<Navigate to="/authority/dashboard" replace />} />
              <Route path="/cases" element={<Navigate to="/authority/cases" replace />} />
              <Route path="/statement-review" element={<Navigate to="/authority/statement-review" replace />} />
              <Route path="/evidence" element={<Navigate to="/authority/evidence" replace />} />
              <Route path="/claim-verification" element={<Navigate to="/authority/claim-verification" replace />} />
              <Route path="/timeline" element={<Navigate to="/authority/timeline" replace />} />
              <Route path="/correlation" element={<Navigate to="/authority/correlation" replace />} />
              <Route path="/root-cause" element={<Navigate to="/authority/root-cause" replace />} />
              <Route path="/reports" element={<Navigate to="/authority/reports" replace />} />
              <Route path="/audit-logs" element={<Navigate to="/authority/audit-logs" replace />} />

              {/* ────────────────────────────────────────────────────────────
                  FALLBACK CATCH-ALL
                  ──────────────────────────────────────────────────────────── */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </CaseProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
