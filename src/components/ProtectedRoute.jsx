import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Role-aware ProtectedRoute component.
 * Supports:
 * - allowedRoles: array of allowed roles, e.g. ['investigator', 'admin'] or ['victim']
 * - role: single allowed role string for backward compatibility
 */
export const ProtectedRoute = ({ children, allowedRoles, role }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show a neutral loading screen while checking authentication status with /api/auth/me
  if (loading) {
    return (
      <div className="min-h-screen bg-[#172D46] flex flex-col items-center justify-center text-[#E8E4DC]">
        <div className="w-8 h-8 border-3 border-[#C5A77B]/30 border-t-[#C5A77B] rounded-full animate-spin mb-3" />
        <span className="text-xs font-mono tracking-wider text-[#8FAFC4]">VERIFYING CREDENTIALS...</span>
      </div>
    );
  }

  // Resolve target roles
  const targetRoles = allowedRoles || (role ? [role] : null);

  // If not authenticated, redirect to the appropriate login page
  if (!isAuthenticated) {
    const isVictimRoute =
      (targetRoles && targetRoles.includes('victim')) ||
      location.pathname.startsWith('/victim');

    const redirectPath = isVictimRoute ? '/victim/login' : '/authority/login';
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // If role restriction exists, enforce it
  if (targetRoles && !targetRoles.includes(user?.role)) {
    // If a victim user attempts to access investigator/admin space, redirect to victim space
    if (user?.role === 'victim') {
      return <Navigate to="/victim/dashboard" replace />;
    }
    // If an investigator/admin attempts to access victim-only space, redirect to authority dashboard
    return <Navigate to="/authority/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
