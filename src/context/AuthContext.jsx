import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { authApi } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('ff_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // If a token is in localStorage, start with loading=true until verified with /api/auth/me
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('ff_token')));

  // Verify and refresh session on mount via /api/auth/me
  useEffect(() => {
    const token = localStorage.getItem('ff_token');
    if (!token) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    authApi
      .me()
      .then(({ data }) => {
        if (isMounted) {
          setUser(data);
          localStorage.setItem('ff_user', JSON.stringify(data));
        }
      })
      .catch(() => {
        if (isMounted) {
          localStorage.removeItem('ff_token');
          localStorage.removeItem('ff_user');
          setUser(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const { data } = await authApi.login({ email, password });
      localStorage.setItem('ff_token', data.access_token);
      localStorage.setItem('ff_user', JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async ({ email, password, username, full_name, role = 'victim' }) => {
    // Critical security check: Never allow public registration with elevated roles
    if (role !== 'victim') {
      throw new Error('Public registration is restricted to victim accounts.');
    }

    setLoading(true);
    try {
      const { data } = await authApi.register({
        email,
        password,
        username,
        full_name: full_name || username,
        role: 'victim',
      });
      localStorage.setItem('ff_token', data.access_token);
      localStorage.setItem('ff_user', JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  }, []);

  const demoLogin = useCallback(async (role) => {
    setLoading(true);
    try {
      const { data } = await authApi.demoSession(role);
      localStorage.setItem('ff_token', data.access_token);
      localStorage.setItem('ff_user', JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore network/server errors during logout
    } finally {
      localStorage.removeItem('ff_token');
      localStorage.removeItem('ff_user');
      setUser(null);
    }
  }, []);

  // Display name: never falls back to email in victim-facing contexts
  const displayName = user?.username || user?.full_name || 'You';

  // Enriched currentUser object for backward compatibility with Authority Portal components
  const currentUser = useMemo(() => {
    if (!user) return null;
    return {
      ...user,
      name: user.full_name || user.username || 'Authorized Personnel',
      title:
        user.role === 'admin'
          ? 'Administrator'
          : user.role === 'investigator'
          ? 'Investigator'
          : 'Victim User',
    };
  }, [user]);

  const value = {
    user,
    currentUser,
    displayName,
    loading,
    isAuthenticated: Boolean(user),
    isVictim: user?.role === 'victim',
    isInvestigator: user?.role === 'investigator' || user?.role === 'admin',
    isAdmin: user?.role === 'admin',
    login,
    register,
    demoLogin,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
