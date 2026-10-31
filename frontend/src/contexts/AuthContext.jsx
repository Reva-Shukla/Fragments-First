import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authApi } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('ff_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  // Persist user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('ff_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('ff_user');
    }
  }, [user]);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const { data } = await authApi.login({ email, password });
      localStorage.setItem('ff_token', data.access_token);
      setUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async ({ email, password, username, role = 'victim' }) => {
    setLoading(true);
    try {
      const { data } = await authApi.register({
        email,
        password,
        // username is the pseudonymous display identity stored as its own field
        username,
        // full_name mirrors username for victim accounts (required by schema)
        full_name: username,
        role,
      });
      localStorage.setItem('ff_token', data.access_token);
      setUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    localStorage.removeItem('ff_token');
    localStorage.removeItem('ff_user');
    setUser(null);
  }, []);

  /**
   * displayName resolution order:
   *  1. user.username  — the chosen pseudonymous alias (new field)
   *  2. user.full_name — fallback for accounts registered before username was added
   *  3. 'You'          — safe default
   *
   * NEVER falls back to email — email is never shown in the victim interface.
   */
  const displayName = user?.username || user?.full_name || 'You';

  const value = {
    user,
    displayName,
    loading,
    isAuthenticated: !!user,
    isVictim: user?.role === 'victim',
    isInvestigator: user?.role === 'investigator' || user?.role === 'admin',
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
