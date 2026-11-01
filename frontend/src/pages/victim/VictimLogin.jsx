import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/Toast';
import Spinner from '../../components/Spinner';
import { startAuthentication } from '@simplewebauthn/browser';
import { webauthnApi, setAccessToken } from '../../api/client';

export default function VictimLogin() {
  // All hooks must be called unconditionally at the top
  const { login, isAuthenticated, loading } = useAuth();
  const toast    = useToast();
  const navigate = useNavigate();

  const [form, setForm]           = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors]       = useState({});
const [usePasskey, setUsePasskey] = useState(false); // optional passkey login
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email    = 'Email is required.';
    if (!form.password)     errs.password = 'Password is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (usePasskey) {
      try {
        const { data: options } = await webauthnApi.authenticateOptions();
        const authResp = await startAuthentication(options);
        const verifyResp = await webauthnApi.authenticateVerify({ credential: authResp });
        const { access_token, user } = verifyResp.data;
        // Apply session similar to AuthContext
        setAccessToken(access_token);
        localStorage.setItem('ff_user', JSON.stringify({
          id: user.id,
          username: user.username,
          full_name: user.full_name,
          role: user.role,
          email: user.email,
        }));
        toast('Successfully signed in with Passkey.', 'success');
        navigate('/victim/statement');
        return;
      } catch (err) {
        const msg = err.response?.data?.detail || 'Passkey authentication failed.';
        toast(msg, 'error');
        setSubmitting(false);
        return;
      }
    }
    if (!validate()) return;
    setSubmitting(true);
    try {
      const user = await login(form.email.trim().toLowerCase(), form.password);
      // Redirect victims to the incident reporting / input submission page
      if (user.role === 'investigator' || user.role === 'admin') {
        navigate('/authority/dashboard');
      } else {
        navigate('/victim/statement');
      }
    } catch (err) {
      const msg = err.response?.data?.detail || 'Incorrect email or password.';
      toast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Conditional renders after all hooks ────────────────────────────────────

  // Show spinner while AuthContext is restoring the session from the cookie
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--deep-navy, #0b1929)' }}>
        <Spinner />
      </div>
    );
  }

  // Already authenticated (cookie session restored) — bypass the login page
  if (isAuthenticated) {
    return <Navigate to="/victim/statement" replace />;
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <span className="auth-logo">Fragment First</span>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">
          Sign in to access your private space. Your display name will greet you once inside.
        </p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="login-email" className="form-label">Email address</label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={set('email')}
              autoComplete="email"
              autoFocus
            />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="login-password" className="form-label">Password</label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              placeholder="Your password"
              value={form.password}
              onChange={set('password')}
              autoComplete="current-password"
            />
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>
          {/* Optional Passkey login toggle */}
          <div className="form-group" style={{ marginTop: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input type="checkbox" checked={usePasskey} onChange={() => setUsePasskey(!usePasskey)} />
              Sign in with Passkey (biometric) instead of password (optional)
            </label>
          </div>
          <button
            id="login-submit-btn"
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={submitting}
          >
            {submitting ? <Spinner /> : 'Sign In'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--white-muted)' }}>
            New here?{' '}
            <Link to="/victim/register" style={{ color: 'var(--cerulean)' }}>Create a private account</Link>
          </p>

          <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--white-muted)' }}>
            Are you an investigator?{' '}
            <Link to="/authority/login" style={{ color: 'var(--rose)' }}>Authority sign-in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
