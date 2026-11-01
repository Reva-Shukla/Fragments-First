import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Spinner from './Spinner';

/**
 * Protects a route to authenticated users only.
 *
 * loading=true while AuthContext is restoring the session from the
 * HttpOnly cookie (POST /auth/session). Showing a spinner here prevents
 * the victim from briefly seeing the login page on refresh.
 *
 * If a required role is specified, also checks the user's role.
 */
export default function ProtectedRoute({ children, role }) {
  const { isAuthenticated, loading, user } = useAuth();

  // Wait for session restoration before making any redirect decision.
  // Without this check, a page refresh always lands on /victim/login even
  // when a valid session cookie exists.
  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--deep-navy, #0b1929)',
        }}
      >
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/victim/login" replace />;
  }

  if (role && user?.role !== role) {
    // Redirect investigators away from victim routes and vice versa
    if (user?.role === 'investigator' || user?.role === 'admin') {
      return <Navigate to="/authority/dashboard" replace />;
    }
    return <Navigate to="/victim/login" replace />;
  }

  return children;
}
