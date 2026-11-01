import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage          from './pages/LandingPage';
import VictimRegister       from './pages/victim/VictimRegister';
import VictimLogin          from './pages/victim/VictimLogin';
import VictimDashboard      from './pages/victim/VictimDashboard';
import MyStatement          from './pages/victim/MyStatement';
import VoiceStatement       from './pages/victim/VoiceStatement';
import MySubmissions        from './pages/victim/MySubmissions';
import PrivacyIdentity      from './pages/victim/PrivacyIdentity';
import HelpGuidance         from './pages/victim/HelpGuidance';
import RedactionStudio      from './pages/victim/RedactionStudio';
import ConsentReceipts      from './pages/victim/ConsentReceipts';
import AuthorityLogin       from './pages/authority/AuthorityLogin';
import AuthorityDashboard   from './pages/authority/AuthorityDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Landing */}
            <Route path="/" element={<LandingPage />} />

            {/* Victim auth */}
            <Route path="/victim/register" element={<VictimRegister />} />
            <Route path="/victim/login"    element={<VictimLogin />} />

            {/* Victim protected routes */}
            <Route path="/victim/dashboard" element={
              <ProtectedRoute role="victim"><VictimDashboard /></ProtectedRoute>
            } />
            <Route path="/victim/statement" element={
              <ProtectedRoute role="victim"><MyStatement /></ProtectedRoute>
            } />
            <Route path="/victim/voice" element={
              <ProtectedRoute role="victim"><VoiceStatement /></ProtectedRoute>
            } />
            <Route path="/victim/submissions" element={
              <ProtectedRoute role="victim"><MySubmissions /></ProtectedRoute>
            } />
            <Route path="/victim/privacy" element={
              <ProtectedRoute role="victim"><PrivacyIdentity /></ProtectedRoute>
            } />
            <Route path="/victim/help" element={
              <ProtectedRoute role="victim"><HelpGuidance /></ProtectedRoute>
            } />
            <Route path="/victim/redaction" element={
              <ProtectedRoute role="victim"><RedactionStudio /></ProtectedRoute>
            } />
            <Route path="/victim/receipts" element={
              <ProtectedRoute role="victim"><ConsentReceipts /></ProtectedRoute>
            } />

            {/* Authority routes */}
            <Route path="/authority/login"     element={<AuthorityLogin />} />
            <Route path="/authority/dashboard" element={
              <ProtectedRoute><AuthorityDashboard /></ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
