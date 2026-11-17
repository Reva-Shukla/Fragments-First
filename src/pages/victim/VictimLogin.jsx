import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/victim/Toast';
import Spinner from '../../components/victim/Spinner';
import { Heart, Lock, Mail, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';

export default function VictimLogin() {
  const { login, demoLogin } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = 'Email address is required.';
    if (!form.password)     errs.password = 'Password is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const user = await login(form.email.trim().toLowerCase(), form.password);
      if (user.role === 'investigator' || user.role === 'admin') {
        navigate('/authority/dashboard');
      } else {
        navigate('/victim/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.detail || 'Incorrect email or password.';
      toast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    try {
      await demoLogin('victim');
      toast('Demo session initialized successfully.', 'success');
      navigate('/victim/dashboard');
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        'Demo login is currently unavailable. Ensure LOCAL_DEMO_MODE=True in backend configuration.';
      toast(msg, 'error');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#172D46] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle Ambient Background Depth matching Authority Login */}
      <div className="absolute top-1/4 -left-24 w-[40vw] h-[40vw] bg-[#294D6B]/30 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-24 w-[40vw] h-[40vw] bg-[#C5A77B]/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Reassuring Header */}
      <div className="w-full max-w-md text-center mb-6 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs text-[#E8E4DC] mb-4 shadow-sm">
          <Heart className="w-3.5 h-3.5 text-[#C5A77B]" />
          <span className="font-mono text-[11px] font-medium tracking-wide">PRIVATE SPACE • TRAUMA-INFORMED CARE</span>
        </div>

        <div className="flex flex-col items-center justify-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#294D6B] to-[#172D46] border border-[#C5A77B]/60 flex items-center justify-center shadow-md">
            <Heart className="w-6 h-6 text-[#C5A77B] stroke-[2]" />
          </div>
          <h1 className="font-brand text-3xl sm:text-4xl font-normal tracking-tight text-white mt-1">
            Fragment First
          </h1>
        </div>
        <p className="text-xs text-[#8FAFC4] mt-1.5 font-mono tracking-wider uppercase">
          Private Incident Memory Documentation
        </p>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-[#FCFBF9] border border-[#D8D2C6] rounded-3xl p-7 sm:p-8 shadow-2xl relative z-10 overflow-hidden">
        {/* Specular hairline top accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#294D6B] via-[#C5A77B] to-[#294D6B]" />

        <div className="mb-5">
          <div className="text-xs font-bold text-[#172D46] uppercase tracking-wider mb-1">
            Victim Space Sign-In
          </div>
          <p className="text-xs text-[#5E7A91] leading-relaxed">
            Sign in to access your personal workspace. Take your time — nothing is shared without your explicit consent.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#172D46] mb-1">
              Account Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8FAFC4] absolute left-3 top-3" />
              <input
                id="login-email"
                type="email"
                value={form.email}
                onChange={set('email')}
                autoComplete="email"
                autoFocus
                placeholder="you@example.com"
                className="w-full bg-white border border-[#D8D2C6] rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#172D46] placeholder-[#8FAFC4] focus:outline-hidden focus:border-[#294D6B] focus:ring-2 focus:ring-[#294D6B]/10 transition-all shadow-xs"
              />
            </div>
            {errors.email && <p className="text-[11px] text-[#9B2C2C] mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#172D46] mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8FAFC4] absolute left-3 top-3" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={set('password')}
                autoComplete="current-password"
                placeholder="••••••••••••"
                className="w-full bg-white border border-[#D8D2C6] rounded-xl pl-9 pr-9 py-2.5 text-xs text-[#172D46] placeholder-[#8FAFC4] focus:outline-hidden focus:border-[#294D6B] focus:ring-2 focus:ring-[#294D6B]/10 transition-all shadow-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-[#8FAFC4] hover:text-[#172D46] cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-[11px] text-[#9B2C2C] mt-1">{errors.password}</p>}
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 px-4 bg-[#294D6B] hover:bg-[#172D46] text-white text-xs font-semibold rounded-xl border border-[#172D46] shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Spinner />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <>
                <span>Sign In Safely</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Local Demo Mode Quick Launch */}
        <div className="mt-5 pt-4 border-t border-[#D8D2C6]/60">
          <div className="text-[11px] font-semibold text-[#8E6E3C] uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Evaluation &amp; Judge Access</span>
            <span className="text-[10px] font-mono text-[#5E7A91] lowercase bg-[#E8E4DC]/60 px-1.5 py-0.5 rounded">local demo</span>
          </div>
          <button
            type="button"
            id="victim-demo-btn"
            disabled={demoLoading || submitting}
            onClick={handleDemoLogin}
            className="w-full py-2.5 px-3.5 bg-[#FAF6EF] hover:bg-[#F2ECE1] text-[#172D46] border border-[#C5A77B] rounded-xl font-medium text-xs shadow-2xs hover:shadow-xs transition-all flex items-center justify-between cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group"
          >
            <div className="flex items-center gap-2.5 text-left">
              <div className="w-7 h-7 rounded-lg bg-[#C5A77B]/20 text-[#8E6E3C] flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A77B]" />
              </div>
              <div>
                <div className="font-semibold text-[#172D46] group-hover:text-[#294D6B] transition-colors">
                  Explore Victim Demo
                </div>
                <div className="text-[10px] text-[#5E7A91] font-mono">
                  SafeHarbor_42 • Simulated Cases &amp; Receipts
                </div>
              </div>
            </div>
            {demoLoading ? (
              <Spinner />
            ) : (
              <ArrowRight className="w-3.5 h-3.5 text-[#C5A77B] group-hover:translate-x-0.5 transition-transform" />
            )}
          </button>
        </div>

        <div className="mt-5 pt-4 border-t border-[#D8D2C6]/70 flex flex-col gap-2 text-center text-xs">
          <p className="text-[#5E7A91]">
            New to Fragment First?{' '}
            <Link to="/victim/register" className="font-semibold text-[#294D6B] hover:text-[#172D46]">
              Create a private account
            </Link>
          </p>
          <p className="text-[#8FAFC4] text-[11px]">
            Official investigator or law enforcement?{' '}
            <Link to="/authority/login" className="font-semibold text-[#C5A77B] hover:text-[#172D46]">
              Go to Authority Portal →
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
