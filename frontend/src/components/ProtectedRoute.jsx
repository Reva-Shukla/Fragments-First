import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Protects a route to authenticated users only.
 * If a required role is specified, also checks the user's role.
 */
export default function ProtectedRoute({ children, role }) {
  const { isAuthenticated, user } = useAuth();

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
