import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/Toast';
import { authApi } from '../../api/client';
import Spinner from '../../components/Spinner';

// ── Password strength scoring ────────────────────────────────────
function scorePassword(pw) {
  if (!pw) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  const levels = [
    { label: 'Very weak',  color: '#ef4444' },
    { label: 'Weak',       color: '#f97316' },
    { label: 'Fair',       color: '#eab308' },
    { label: 'Good',       color: '#22c55e' },
    { label: 'Strong',     color: '#00b4d8' },
    { label: 'Very strong',color: '#a78bfa' },
  ];
  return { score, ...levels[Math.min(score, 5)] };
}

// ── Username availability hook ───────────────────────────────────
function useUsernameCheck(username) {
  const [state, setState] = useState({ checking: false, available: null, message: '' });
  const timerRef = useRef(null);

  useEffect(() => {
    if (!username || username.trim().length < 2) {
      setState({ checking: false, available: null, message: '' });
      return;
    }

    setState((s) => ({ ...s, checking: true, available: null, message: '' }));
    clearTimeout(timerRef.current);

    // Debounce: wait 500ms after the user stops typing
    timerRef.current = setTimeout(async () => {
      try {
        const { data } = await authApi.checkUsername(username.trim());
        setState({ checking: false, available: data.available, message: data.message });
      } catch {
        setState({ checking: false, available: null, message: 'Could not check availability.' });
      }
    }, 500);

    return () => clearTimeout(timerRef.current);
  }, [username]);

  return state;
}

// ── Inline icon components ──────────────────────────────────────
const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

// ── Password input with visibility toggle ────────────────────────
function PasswordInput({ id, value, onChange, placeholder, autoComplete }) {
  const [visible, setVisible] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        className="form-input"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        style={{ paddingRight: '44px' }}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        style={{
          position: 'absolute', right: '12px', top: '50%',
          transform: 'translateY(-50%)',
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--white-muted)', padding: '4px',
          display: 'flex', alignItems: 'center',
          transition: 'color 150ms',
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--white)'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--white-muted)'}
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}

// ── Password strength bar ────────────────────────────────────────
function PasswordStrength({ password }) {
  const { score, label, color } = scorePassword(password);
  if (!password) return null;
  return (
    <div style={{ marginTop: '6px' }}>
      <div style={{ display: 'flex', gap: '3px', marginBottom: '4px' }}>
        {[0,1,2,3,4].map((i) => (
          <div
            key={i}
            style={{
              flex: 1, height: '3px', borderRadius: '2px',
              background: i < score ? color : 'var(--black-hover)',
              transition: 'background 300ms',
            }}
          />
        ))}
      </div>
      <span style={{ fontSize: '11px', color, fontWeight: 500 }}>{label}</span>
    </div>
  );
}

// ── Requirement checklist ────────────────────────────────────────
function PasswordRequirements({ password }) {
  const reqs = [
    { label: 'At least 6 characters', met: password.length >= 6 },
    { label: 'Contains a number',     met: /[0-9]/.test(password) },
    { label: 'Contains uppercase',    met: /[A-Z]/.test(password) },
    { label: 'Contains a symbol',     met: /[^A-Za-z0-9]/.test(password) },
  ];
  if (!password) return null;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', marginTop: '6px' }}>
      {reqs.map((r) => (
        <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: r.met ? '#4ade80' : 'var(--white-muted)' }}>
          {r.met ? <CheckIcon /> : <XIcon />}
          {r.label}
        </div>
      ))}
    </div>
  );
}

// ── Main register component ──────────────────────────────────────
export default function VictimRegister() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirm: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    // Clear field error on edit
    if (errors[field]) setErrors((e) => { const n = {...e}; delete n[field]; return n; });
  };

  // Real-time username availability check
  const usernameCheck = useUsernameCheck(form.username);

  function validate() {
    const errs = {};
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const usernameRe = /^[A-Za-z0-9_.\-]{2,50}$/;

    if (!form.username.trim())
      errs.username = 'Please choose a username.';
    else if (!usernameRe.test(form.username.trim()))
      errs.username = 'Use letters, numbers, _ - . only (2–50 chars).';
    else if (usernameCheck.available === false)
      errs.username = usernameCheck.message || 'This username is not available.';

    if (!form.email.trim())
      errs.email = 'Email address is required.';
    else if (!emailRe.test(form.email))
      errs.email = 'Please enter a valid email address.';

    if (!form.password)
      errs.password = 'Password is required.';
    else if (form.password.length < 6)
      errs.password = 'Password must be at least 6 characters.';

    if (form.password !== form.confirm)
      errs.confirm = 'Passwords do not match.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const user = await register({
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: 'victim',
      });
      toast(`Welcome, ${user.username || user.full_name}. Your account is ready.`, 'success');
      navigate('/victim/dashboard');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Registration failed. Please try again.';
      toast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Username status indicator
  const renderUsernameStatus = () => {
    if (!form.username || form.username.trim().length < 2) return null;
    if (usernameCheck.checking) return (
      <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--white-muted)' }}>
        <Spinner /> Checking…
      </span>
    );
    if (usernameCheck.available === true) return (
      <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#4ade80' }}>
        <CheckIcon /> Available
      </span>
    );
    if (usernameCheck.available === false) return (
      <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#ef4444' }}>
        <XIcon /> {usernameCheck.message}
      </span>
    );
    return null;
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: '480px' }}>

        {/* Brand */}
        <span className="auth-logo">Fragment First</span>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 className="auth-title" style={{ marginBottom: '8px' }}>
            Your story. Your identity. Your space.
          </h1>
          <p className="auth-subtitle" style={{ marginBottom: 0 }}>
            Choose a name that feels comfortable. You decide how you want to be
            represented here.
          </p>
        </div>

        {/* Privacy notice */}
        <div className="notice notice-muted" style={{ marginBottom: '28px' }}>
          <span style={{ fontSize: '13px' }}>
            Your chosen username represents you within Fragment First. Your registered
            account information is stored separately and is not displayed as your public identity.
          </span>
        </div>

        {/* Registration form */}
        <form className="auth-form" onSubmit={handleSubmit} noValidate>

          {/* ── Username ── */}
          <div className="form-group">
            <label htmlFor="reg-username" className="form-label">
              Preferred username <span style={{ color: 'var(--rose)' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="reg-username"
                type="text"
                className="form-input"
                placeholder="e.g. SilentSky_482, moonrise, J.M."
                value={form.username}
                onChange={set('username')}
                autoComplete="username"
                autoFocus
                maxLength={50}
                style={{
                  borderColor: errors.username
                    ? 'var(--rose)'
                    : usernameCheck.available === true
                    ? 'rgba(74,222,128,0.4)'
                    : undefined,
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '5px' }}>
              <span className="form-hint" style={{ margin: 0 }}>
                Letters, numbers, _ – . only (2–50 characters).
              </span>
              {renderUsernameStatus()}
            </div>
            {errors.username && (
              <span className="form-error">{errors.username}</span>
            )}
          </div>

          {/* ── Email ── */}
          <div className="form-group">
            <label htmlFor="reg-email" className="form-label">
              Email address <span style={{ color: 'var(--rose)' }}>*</span>
            </label>
            <input
              id="reg-email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={set('email')}
              autoComplete="email"
              style={{ borderColor: errors.email ? 'var(--rose)' : undefined }}
            />
            {errors.email ? (
              <span className="form-error">{errors.email}</span>
            ) : (
              <span className="form-hint">
                Used for sign-in only. Never displayed in your account.
              </span>
            )}
          </div>

          {/* ── Password ── */}
          <div className="form-group">
            <label htmlFor="reg-password" className="form-label">
              Password <span style={{ color: 'var(--rose)' }}>*</span>
            </label>
            <PasswordInput
              id="reg-password"
              value={form.password}
              onChange={set('password')}
              placeholder="Create a password"
              autoComplete="new-password"
            />
            {form.password && <PasswordStrength password={form.password} />}
            {form.password && <PasswordRequirements password={form.password} />}
            {errors.password && (
              <span className="form-error">{errors.password}</span>
            )}
          </div>

          {/* ── Confirm password ── */}
          <div className="form-group">
            <label htmlFor="reg-confirm" className="form-label">
              Confirm password <span style={{ color: 'var(--rose)' }}>*</span>
            </label>
            <PasswordInput
              id="reg-confirm"
              value={form.confirm}
              onChange={set('confirm')}
              placeholder="Re-enter your password"
              autoComplete="new-password"
            />
            {errors.confirm && (
              <span className="form-error">{errors.confirm}</span>
            )}
            {!errors.confirm && form.confirm && form.password === form.confirm && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#4ade80', marginTop: '4px' }}>
                <CheckIcon /> Passwords match
              </span>
            )}
          </div>

          {/* ── Submit ── */}
          <button
            id="register-submit-btn"
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '8px' }}
            disabled={submitting || usernameCheck.checking}
          >
            {submitting ? <><Spinner /> Creating account…</> : 'Create My Account'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--white-muted)' }}>
            Already have an account?{' '}
            <Link to="/victim/login" style={{ color: 'var(--cerulean)' }}>Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
