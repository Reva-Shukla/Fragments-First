import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/victim/Toast';
import { authApi } from '../../api/client';
import Spinner from '../../components/victim/Spinner';
import { 
  Heart, 
  Lock, 
  Mail, 
  User, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  ShieldCheck, 
  ArrowRight 
} from 'lucide-react';

// ── Password strength scoring in Authority tones ──────────────────
function scorePassword(pw) {
  if (!pw) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  const levels = [
    { label: 'Very weak',  color: '#9B2C2C' },
    { label: 'Weak',       color: '#B45309' },
    { label: 'Fair',       color: '#C5A77B' },
    { label: 'Good',       color: '#294D6B' },
    { label: 'Strong',     color: '#1E6B52' },
    { label: 'Very strong',color: '#1E6B52' },
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

// ── Password input with toggle ────────────────────────────────────
function PasswordInput({ id, value, onChange, placeholder, autoComplete, error }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Lock className="w-4 h-4 text-[#8FAFC4] absolute left-3 top-3" />
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`w-full bg-white border ${error ? 'border-[#9B2C2C]' : 'border-[#D8D2C6]'} rounded-xl pl-9 pr-9 py-2.5 text-xs text-[#172D46] placeholder-[#8FAFC4] focus:outline-hidden focus:border-[#294D6B] focus:ring-2 focus:ring-[#294D6B]/10 transition-all shadow-xs`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-3 text-[#8FAFC4] hover:text-[#172D46] cursor-pointer"
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

// ── Password strength bar ────────────────────────────────────────
function PasswordStrength({ password }) {
  const { score, label, color } = scorePassword(password);
  if (!password) return null;
  return (
    <div className="mt-1.5">
      <div className="flex gap-1 mb-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full transition-all duration-300"
            style={{
              backgroundColor: i < score ? color : '#E8E4DC',
            }}
          />
        ))}
      </div>
      <span className="text-[11px] font-medium" style={{ color }}>
        Strength: {label}
      </span>
    </div>
  );
}

// ── Password requirements checklist ──────────────────────────────
function PasswordRequirements({ password }) {
  const reqs = [
    { label: '6+ characters', met: password.length >= 6 },
    { label: 'Number',        met: /[0-9]/.test(password) },
    { label: 'Uppercase',     met: /[A-Z]/.test(password) },
    { label: 'Symbol',        met: /[^A-Za-z0-9]/.test(password) },
  ];
  if (!password) return null;
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
      {reqs.map((r) => (
        <div 
          key={r.label} 
          className={`flex items-center gap-1 text-[11px] ${r.met ? 'text-[#1E6B52] font-medium' : 'text-[#8FAFC4]'}`}
        >
          {r.met ? <Check className="w-3 h-3 text-[#1E6B52]" /> : <X className="w-3 h-3 text-[#8FAFC4]" />}
          <span>{r.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Main Register Component ──────────────────────────────────────
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
    if (errors[field]) setErrors((e) => { const n = { ...e }; delete n[field]; return n; });
  };

  const usernameCheck = useUsernameCheck(form.username);

  function validate() {
    const errs = {};
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const usernameRe = /^[A-Za-z0-9_.-]{2,50}$/;

    if (!form.username.trim())
      errs.username = 'Please choose a preferred alias.';
    else if (!usernameRe.test(form.username.trim()))
      errs.username = 'Use letters, numbers, _ - . only (2–50 chars).';
    else if (usernameCheck.available === false)
      errs.username = usernameCheck.message || 'This alias is not available.';

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
      toast(`Welcome, ${user.username || user.full_name || 'Friend'}. Your private account is ready.`, 'success');
      navigate('/victim/dashboard');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Registration could not be completed. Please try again.';
      toast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const renderUsernameStatus = () => {
    if (!form.username || form.username.trim().length < 2) return null;
    if (usernameCheck.checking) return (
      <span className="flex items-center gap-1 text-[11px] text-[#8FAFC4]">
        <Spinner /> Checking...
      </span>
    );
    if (usernameCheck.available === true) return (
      <span className="flex items-center gap-1 text-[11px] text-[#1E6B52] font-semibold">
        <Check className="w-3.5 h-3.5 text-[#1E6B52]" /> Available
      </span>
    );
    if (usernameCheck.available === false) return (
      <span className="flex items-center gap-1 text-[11px] text-[#9B2C2C] font-semibold">
        <X className="w-3.5 h-3.5 text-[#9B2C2C]" /> {usernameCheck.message}
      </span>
    );
    return null;
  };

  return (
    <div className="min-h-screen bg-[#172D46] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle Ambient Background Depth */}
      <div className="absolute top-1/4 -left-24 w-[40vw] h-[40vw] bg-[#294D6B]/30 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-24 w-[40vw] h-[40vw] bg-[#C5A77B]/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <div className="w-full max-w-lg text-center mb-6 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs text-[#E8E4DC] mb-4 shadow-sm">
          <Heart className="w-3.5 h-3.5 text-[#C5A77B]" />
          <span className="font-mono text-[11px] font-medium tracking-wide">PRIVATE SPACE • TRAUMA-INFORMED CARE</span>
        </div>

        <div className="flex flex-col items-center justify-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#294D6B] to-[#172D46] border border-[#C5A77B]/60 flex items-center justify-center shadow-md">
            <Heart className="w-6 h-6 text-[#C5A77B] stroke-[2]" />
          </div>
          <h1 className="font-brand text-3xl sm:text-4xl font-normal tracking-tight text-white mt-1">
            Create Your Private Space
          </h1>
        </div>
        <p className="text-xs text-[#8FAFC4] mt-1.5 font-mono tracking-wider uppercase">
          Choose a comfortable alias. Your true identity is kept private.
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-lg bg-[#FCFBF9] border border-[#D8D2C6] rounded-3xl p-7 sm:p-9 shadow-2xl relative z-10 overflow-hidden">
        {/* Specular hairline top accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#294D6B] via-[#C5A77B] to-[#294D6B]" />

        {/* Notice */}
        <div className="mb-5 p-3.5 bg-[#FAF6EF] border border-[#C5A77B]/40 rounded-xl text-xs text-[#172D46] flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[#C5A77B] shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-[#172D46] font-semibold">Pseudonymous Privacy:</strong>
            <span className="text-[#5E7A91] block mt-0.5">
              Your chosen username represents you inside Fragment First. Your official email is kept strictly separated and never shared with other parties.
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Preferred Alias */}
          <div>
            <label className="block text-xs font-semibold text-[#172D46] mb-1">
              Preferred Alias / Display Name <span className="text-[#C5A77B]">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#8FAFC4] absolute left-3 top-3" />
              <input
                id="reg-username"
                type="text"
                value={form.username}
                onChange={set('username')}
                autoComplete="username"
                autoFocus
                maxLength={50}
                placeholder="e.g. River_Calm, Phoenix, M.S."
                className={`w-full bg-white border ${errors.username ? 'border-[#9B2C2C]' : 'border-[#D8D2C6]'} rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#172D46] placeholder-[#8FAFC4] focus:outline-hidden focus:border-[#294D6B] focus:ring-2 focus:ring-[#294D6B]/10 transition-all shadow-xs`}
              />
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-[11px] text-[#8FAFC4]">Letters, numbers, _ – . only (2–50 chars)</span>
              {renderUsernameStatus()}
            </div>
            {errors.username && <p className="text-[11px] text-[#9B2C2C] mt-1">{errors.username}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-[#172D46] mb-1">
              Account Email <span className="text-[#C5A77B]">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8FAFC4] absolute left-3 top-3" />
              <input
                id="reg-email"
                type="email"
                value={form.email}
                onChange={set('email')}
                autoComplete="email"
                placeholder="you@example.com"
                className={`w-full bg-white border ${errors.email ? 'border-[#9B2C2C]' : 'border-[#D8D2C6]'} rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#172D46] placeholder-[#8FAFC4] focus:outline-hidden focus:border-[#294D6B] focus:ring-2 focus:ring-[#294D6B]/10 transition-all shadow-xs`}
              />
            </div>
            <span className="text-[11px] text-[#8FAFC4] block mt-1">Used exclusively for sign-in verification. Never displayed.</span>
            {errors.email && <p className="text-[11px] text-[#9B2C2C] mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-[#172D46] mb-1">
              Password <span className="text-[#C5A77B]">*</span>
            </label>
            <PasswordInput
              id="reg-password"
              value={form.password}
              onChange={set('password')}
              placeholder="Create a private password"
              autoComplete="new-password"
              error={!!errors.password}
            />
            {form.password && <PasswordStrength password={form.password} />}
            {form.password && <PasswordRequirements password={form.password} />}
            {errors.password && <p className="text-[11px] text-[#9B2C2C] mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold text-[#172D46] mb-1">
              Confirm Password <span className="text-[#C5A77B]">*</span>
            </label>
            <PasswordInput
              id="reg-confirm"
              value={form.confirm}
              onChange={set('confirm')}
              placeholder="Re-enter your password"
              autoComplete="new-password"
              error={!!errors.confirm}
            />
            {errors.confirm && <p className="text-[11px] text-[#9B2C2C] mt-1">{errors.confirm}</p>}
            {!errors.confirm && form.confirm && form.password === form.confirm && (
              <span className="flex items-center gap-1 text-[11px] text-[#1E6B52] font-semibold mt-1">
                <Check className="w-3.5 h-3.5 text-[#1E6B52]" /> Passwords match
              </span>
            )}
          </div>

          {/* Submit */}
          <button
            id="register-submit-btn"
            type="submit"
            disabled={submitting || usernameCheck.checking}
            className="w-full py-2.5 px-4 bg-[#294D6B] hover:bg-[#172D46] text-white text-xs font-semibold rounded-xl border border-[#172D46] shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {submitting ? (
              <>
                <Spinner />
                <span>Creating Private Account...</span>
              </>
            ) : (
              <>
                <span>Begin Safely &amp; Create Account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-[#D8D2C6]/70 flex flex-col gap-2 text-center text-xs text-[#5E7A91]">
          <p>
            Already have an account?{' '}
            <Link to="/victim/login" className="font-semibold text-[#294D6B] hover:text-[#172D46]">
              Sign in to your space
            </Link>
          </p>
          <p className="text-[11px] text-[#8E6E3C]">
            Judging or evaluating?{' '}
            <Link to="/victim/login" className="font-semibold text-[#C5A77B] hover:text-[#172D46]">
              Launch Victim Demo →
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-4 text-center">
        <Link to="/" className="text-xs text-[#8FAFC4] hover:text-[#E8E4DC] transition-colors">
          ← Return to Fragment First Home
        </Link>
      </div>
    </div>
  );
}
