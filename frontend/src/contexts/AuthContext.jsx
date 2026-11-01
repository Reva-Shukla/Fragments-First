/**
 * Fragment First — Victim AuthContext
 *
 * Session architecture:
 *   ACCESS TOKEN  — short-lived JWT stored in React state (_accessToken) only.
 *                   Injected into every API request via setAccessToken() in client.js.
 *                   Never written to localStorage or sessionStorage.
 *
 *   REFRESH TOKEN — long-lived JWT stored as an HttpOnly Secure SameSite cookie
 *                   set by the backend on login/register.
 *                   JavaScript cannot read it — it is sent automatically by the
 *                   browser to POST /api/auth/session.
 *
 * Session restoration flow (on every page load / browser restart):
 *   1. AuthContext mounts with loading=true.
 *   2. Calls POST /api/auth/session — the browser sends the HttpOnly cookie automatically.
 *   3a. If 200: receives a new access token + user → session restored silently.
 *   3b. If 401: no valid cookie → victim must log in.
 *   4. Sets loading=false → ProtectedRoute renders correctly.
 */

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { authApi, setAccessToken, clearAccessToken } from '../api/client';

const AuthContext = createContext(null);

// Interval at which the access token is silently refreshed (ms).
// Access tokens expire in 30 min; we refresh at 25 min to stay ahead.
const REFRESH_INTERVAL_MS = 25 * 60 * 1000;

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);   // true while restoring session on mount
  const refreshTimerRef       = useRef(null);

  // ── Internal: apply a successful auth response ────────────────────────────
  const _applySession = useCallback((data) => {
    const { access_token, user: backendUser } = data;
    setAccessToken(access_token);    // inject into axios interceptor
    setUser(backendUser);
    // Persist safe display-only fields for quick reads (NO tokens stored)
    localStorage.setItem('ff_user', JSON.stringify({
      id:        backendUser.id,
      username:  backendUser.username,
      full_name: backendUser.full_name,
      role:      backendUser.role,
      email:     backendUser.email,
    }));
  }, []);

  // ── Internal: clear all session state ────────────────────────────────────
  const _clearSession = useCallback(() => {
    clearAccessToken();
    setUser(null);
    localStorage.removeItem('ff_user');
    localStorage.removeItem('ff_token');   // clean up any legacy key
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  // ── Internal: silent refresh called periodically ──────────────────────────
  const _silentRefresh = useCallback(async () => {
    try {
      const { data } = await authApi.refreshSession();
      _applySession(data);
    } catch {
      // Cookie expired or revoked — clear session but don't redirect here;
      // the 401 interceptor in client.js handles the redirect.
      _clearSession();
    }
  }, [_applySession, _clearSession]);

  // ── Start periodic silent refresh ─────────────────────────────────────────
  const _startRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    refreshTimerRef.current = setInterval(_silentRefresh, REFRESH_INTERVAL_MS);
  }, [_silentRefresh]);

  // ── Session restoration on mount ──────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        const { data } = await authApi.refreshSession();
        if (!cancelled) {
          _applySession(data);
          _startRefreshTimer();
        }
      } catch {
        // No valid cookie — victim is not logged in; show login page
        if (!cancelled) _clearSession();
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    restoreSession();

    return () => {
      cancelled = true;
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const { data } = await authApi.login({ email, password });
    _applySession(data);
    _startRefreshTimer();
    return data.user;
  }, [_applySession, _startRefreshTimer]);

  // ── Register ──────────────────────────────────────────────────────────────
  const register = useCallback(async ({ email, password, username, role = 'victim' }) => {
    const { data } = await authApi.register({
      email,
      password,
      username,
      full_name: username,   // full_name mirrors username for victim accounts
      role,
    });
    _applySession(data);
    _startRefreshTimer();
    return data.user;
  }, [_applySession, _startRefreshTimer]);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    // 1. Ask backend to clear the HttpOnly cookie
    await authApi.cookieLogout().catch(() => {});
    // 2. Notify backend to invalidate the bearer token (best-effort)
    await authApi.logout().catch(() => {});
    // 3. Clear all local state
    _clearSession();
  }, [_clearSession]);

  // ── displayName ───────────────────────────────────────────────────────────
  // Resolution order:
  //   1. user.username  — chosen pseudonymous alias
  //   2. user.full_name — fallback for pre-username accounts
  //   3. 'You'          — safe default; email is NEVER shown
  const displayName = user?.username || user?.full_name || 'You';

  const value = {
    user,
    displayName,
    loading,
    isAuthenticated: !!user,
    isVictim:       user?.role === 'victim',
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
