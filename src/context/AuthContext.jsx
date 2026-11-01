import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authApi, storage } from '../services/api';

const AuthContext = createContext(null);

/**
 * Authority role display profiles.
 * These are UI-layer personas that map to backend roles (investigator / admin).
 * The actual identity comes from the JWT — these provide display metadata.
 */
export const ROLES = [
  {
    id: "lead_detective",
    title: "Lead Detective",
    name: "Det. Elena Vance",
    badge: "Badge #7492",
    agency: "Metro Transit Police Department",
    division: "Major Incident Taskforce",
    clearance: "RESTRICTED // LAW ENFORCEMENT SENSITIVE",
    email: "det.vance@metro-authority.gov",
    avatar: "EV",
    backendRole: "investigator",
  },
  {
    id: "forensic_specialist",
    title: "Forensic Specialist",
    name: "Marcus Lin",
    badge: "Forensics #F-441",
    agency: "State Digital & Physical Forensics Lab",
    division: "SCADA & Telemetry Cyber Division",
    clearance: "SECRET // FORENSIC INTEGRITY SEAL",
    email: "m.lin@metro-forensics.gov",
    avatar: "ML",
    backendRole: "investigator",
  },
  {
    id: "legal_counsel",
    title: "Legal Oversight Counsel",
    name: "Rachel Stern, Esq.",
    badge: "Bar #NY-89104",
    agency: "Office of the District Attorney",
    division: "Special Investigations & Admissibility",
    clearance: "RESTRICTED // LEGAL OVERSIGHT PRIVILEGED",
    email: "r.stern@metro-legal.gov",
    avatar: "RS",
    backendRole: "investigator",
  },
  {
    id: "senior_investigator",
    title: "Senior Investigator",
    name: "Cmdr. Samuel Hayes",
    badge: "Command #0019",
    agency: "Inter-Agency Joint Emergency Oversight",
    division: "Incident Command Staff",
    clearance: "TOP SECRET // INTER-AGENCY MULTI-SOURCE",
    email: "s.hayes@joint-authority.gov",
    avatar: "SH",
    backendRole: "admin",
  },
];

/**
 * Merges a backend UserResponse with a selected authority display profile.
 * The display profile provides the UI persona; the backend provides identity.
 */
function buildCurrentUser(backendUser, selectedRoleId) {
  const profile = ROLES.find(r => r.id === selectedRoleId) || ROLES[0];
  return {
    // Backend identity fields
    id:         backendUser.id,
    email:      backendUser.email,
    full_name:  backendUser.full_name,
    username:   backendUser.username,
    role:       backendUser.role,
    is_active:  backendUser.is_active,
    // UI display profile fields (override email with real one)
    ...profile,
    email:      backendUser.email,
    _backendUser: backendUser,
    _profileId: selectedRoleId,
  };
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser]     = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mfaVerified, setMfaVerified]     = useState(false);
  const [loading, setLoading]             = useState(true);
  const [loginError, setLoginError]       = useState(null);

  // ── Restore session from localStorage on mount ────────────────────────────
  useEffect(() => {
    const token   = storage.getToken();
    const stored  = storage.getUser();

    if (token && stored) {
      // We have a stored session — restore it optimistically,
      // then silently validate against /auth/me.
      setCurrentUser(stored);
      setIsAuthenticated(true);
      setMfaVerified(true);

      authApi.me()
        .then(({ data }) => {
          // Refresh user data from backend in case it changed
          const refreshed = buildCurrentUser(data, stored._profileId || ROLES[0].id);
          setCurrentUser(refreshed);
          storage.setUser(refreshed);
        })
        .catch(() => {
          // Token is expired or invalid — clear the session
          storage.clear();
          setCurrentUser(null);
          setIsAuthenticated(false);
          setMfaVerified(false);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // ── Real login ────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password, roleId) => {
    setLoginError(null);
    try {
      const { data } = await authApi.login(email, password);

      const { access_token, user: backendUser } = data;
      storage.setToken(access_token);

      const selectedRoleId = roleId || ROLES[0].id;
      const currentUserObj = buildCurrentUser(backendUser, selectedRoleId);

      storage.setUser(currentUserObj);
      setCurrentUser(currentUserObj);
      setIsAuthenticated(true);
      setMfaVerified(true);
      return { success: true, user: currentUserObj };
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Login failed. Please check your credentials.';
      setLoginError(message);
      return { success: false, error: message };
    }
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await authApi.logout();  // tells backend to invalidate (best effort)
    storage.clear();
    setCurrentUser(null);
    setIsAuthenticated(false);
    setMfaVerified(false);
    setLoginError(null);
  }, []);

  // ── Switch display role (UI persona only, no backend call) ────────────────
  const switchRole = useCallback((roleId) => {
    if (!currentUser?._backendUser) return;
    const updated = buildCurrentUser(currentUser._backendUser, roleId);
    setCurrentUser(updated);
    storage.setUser(updated);
  }, [currentUser]);

  const value = {
    currentUser,
    isAuthenticated,
    mfaVerified,
    loading,
    loginError,
    login,
    logout,
    switchRole,
    availableRoles: ROLES,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
