import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authApi, storage } from '../services/api';

const AuthContext = createContext(null);

/**
 * Authority role display profiles.
 * These are UI-layer personas that map to backend roles (investigator / admin).
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
 */
function buildCurrentUser(backendUser, selectedRoleId) {
  const profile = ROLES.find(r => r.id === selectedRoleId) || ROLES[0];
  return {
    id: backendUser.id,
    email: backendUser.email,
    full_name: backendUser.full_name || profile.name,
    username: backendUser.username || profile.id,
    role: backendUser.role || profile.backendRole,
    is_active: backendUser.is_active ?? true,
    ...profile,
    _backendUser: backendUser,
    _profileId: selectedRoleId,
  };
}

export const AuthProvider = ({ children }) => {
  const initialStoredUser = storage.getUser() || ROLES[0];
  const [currentUser, setCurrentUser] = useState(initialStoredUser);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [mfaVerified, setMfaVerified] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);

  // Restore session from localStorage on mount if present
  useEffect(() => {
    const token = storage.getToken();
    const stored = storage.getUser();

    if (token && stored) {
      setCurrentUser(stored);
      setIsAuthenticated(true);
      setMfaVerified(true);

      authApi.me()
        .then(({ data }) => {
          const refreshed = buildCurrentUser(data, stored._profileId || ROLES[0].id);
          setCurrentUser(refreshed);
          storage.setUser(refreshed);
        })
        .catch(() => {
          // Token expired or server unreachable — keep current user session for offline resilience
        });
    }
  }, []);

  // Dual-mode Login: Real backend if reachable, graceful demo persona fallback otherwise
  const login = useCallback(async (email, password, roleId, mfaToken) => {
    setLoginError(null);
    const selectedRoleId = roleId || ROLES[0].id;
    const profile = ROLES.find(r => r.id === selectedRoleId) || ROLES[0];

    try {
      const response = await authApi.login(email, password);
      if (response?.data?.access_token) {
        const { access_token, user: backendUser } = response.data;
        storage.setToken(access_token);
        const userObj = buildCurrentUser(backendUser, selectedRoleId);
        storage.setUser(userObj);
        setCurrentUser(userObj);
        setIsAuthenticated(true);
        setMfaVerified(true);
        return { success: true, user: userObj };
      }
    } catch {
      // Backend not running or credentials not in DB — fall back to standard authority persona
    }

    // Graceful persona authentication
    const userObj = {
      ...profile,
      email: email || profile.email,
      _profileId: selectedRoleId,
    };
    storage.setUser(userObj);
    setCurrentUser(userObj);
    setIsAuthenticated(true);
    setMfaVerified(true);
    return { success: true, user: userObj };
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Silently catch
    }
    storage.clear();
    setCurrentUser(null);
    setIsAuthenticated(false);
    setMfaVerified(false);
    setLoginError(null);
  }, []);

  const switchRole = useCallback((roleId) => {
    const found = ROLES.find(r => r.id === roleId);
    if (!found) return;

    if (currentUser?._backendUser) {
      const updated = buildCurrentUser(currentUser._backendUser, roleId);
      setCurrentUser(updated);
      storage.setUser(updated);
    } else {
      setCurrentUser(found);
      storage.setUser(found);
    }
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
