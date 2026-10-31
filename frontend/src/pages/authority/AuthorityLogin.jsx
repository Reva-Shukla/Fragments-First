import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/Toast';
import Spinner from '../../components/Spinner';

/**
 * Authority Login — for investigators and admins.
 * Uses the same backend /api/auth/login endpoint.
 * Redirects to /authority/dashboard on success.
 */
export default function AuthorityLogin() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const set = (f) => (e) => setForm((v) => ({ ...v, [f]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const user = await login(form.email.trim().toLowerCase(), form.password);
      if (user.role === 'victim') {
        toast('This login is for authorised personnel only.', 'error');
        return;
      }
      navigate('/authority/dashboard');
    } catch (err) {
      toast(err.response?.data?.detail || 'Incorrect credentials.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page" style={{ background: 'radial-gradient(ellipse at 80% 20%, rgba(255,45,107,0.06) 0%, transparent 50%), var(--black)' }}>
      <div className="auth-card">
        <span className="auth-logo">Fragment First</span>

        <div style={{ marginBottom: '16px' }}>
          <span className="badge badge-rose" style={{ marginBottom: '12px', display: 'inline-block' }}>Authorised Personnel Only</span>
        </div>

        <h1 className="auth-title">Authority Sign In</h1>
        <p className="auth-subtitle">
          This portal is for registered investigators and administrators.
          Victim accounts are managed separately.
        </p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="authority-email" className="form-label">Email address</label>
            <input id="authority-email" type="email" className="form-input" value={form.email} onChange={set('email')} autoComplete="email" autoFocus />
          </div>
          <div className="form-group">
            <label htmlFor="authority-password" className="form-label">Password</label>
            <input id="authority-password" type="password" className="form-input" value={form.password} onChange={set('password')} autoComplete="current-password" />
          </div>
          <button id="authority-login-btn" type="submit" className="btn btn-rose" style={{ width: '100%' }} disabled={submitting}>
            {submitting ? <Spinner /> : 'Sign In — Authority'}
          </button>
          <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--white-muted)' }}>
            Victim account?{' '}
            <Link to="/victim/login" style={{ color: 'var(--cerulean)' }}>Sign in here</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
