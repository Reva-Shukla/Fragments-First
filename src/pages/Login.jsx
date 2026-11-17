import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  KeyRound, 
  Mail, 
  Lock, 
  ArrowRight, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Fingerprint,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const navigate = useNavigate();
  const { login, demoLogin, logout } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your official agency email and password.');
      return;
    }

    setLoading(true);
    try {
      const user = await login(email.trim().toLowerCase(), password);

      // Verify investigator/admin role — victim accounts cannot enter Authority Portal
      if (user.role === 'victim') {
        await logout();
        setErrorMessage('Access denied. This portal is restricted to authorized investigative and legal oversight personnel.');
        return;
      }

      navigate('/authority/dashboard');
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setErrorMessage(detail);
      } else if (Array.isArray(detail)) {
        setErrorMessage(detail[0]?.msg || 'Validation error.');
      } else {
        setErrorMessage('Unable to authorize credentials. Please check your email and password.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setErrorMessage('');
    setDemoLoading(true);
    try {
      const user = await demoLogin('investigator');
      if (user.role === 'victim') {
        await logout();
        setErrorMessage('Access denied. Demo investigator role required.');
        return;
      }
      navigate('/authority/dashboard');
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setErrorMessage(detail);
      } else {
        setErrorMessage('Authority demo login unavailable. Ensure LOCAL_DEMO_MODE=True in backend configuration.');
      }
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#172D46] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle Ambient Background Depth */}
      <div className="absolute top-1/4 -left-24 w-[40vw] h-[40vw] bg-[#294D6B]/30 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-24 w-[40vw] h-[40vw] bg-[#C5A77B]/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Official Authority Notice Header */}
      <div className="w-full max-w-md text-center mb-6 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs text-[#E8E4DC] mb-4 shadow-sm">
          <ShieldCheck className="w-4 h-4 text-[#C5A77B]" />
          <span className="font-mono text-[11px] font-medium tracking-wide">OFFICIAL USE ONLY • LAW ENFORCEMENT SENSITIVE</span>
        </div>

        <div className="flex flex-col items-center justify-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#294D6B] to-[#172D46] border border-[#C5A77B]/60 flex items-center justify-center shadow-md">
            <Fingerprint className="w-7 h-7 text-[#C5A77B]" />
          </div>
          <h1 className="font-brand text-3xl sm:text-4xl font-normal tracking-tight text-white mt-1">
            Fragments First
          </h1>
        </div>
        <p className="text-xs text-[#8FAFC4] mt-1.5 font-mono tracking-wider">
          AI-POWERED MULTI-AGENCY INCIDENT INVESTIGATION AUTHORITY
        </p>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-md bg-[#FCFBF9] border border-[#D8D2C6] rounded-3xl p-7 sm:p-8 shadow-2xl relative z-10 overflow-hidden">
        {/* Specular top hairline in antique gold */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#294D6B] via-[#C5A77B] to-[#294D6B]" />

        <div className="mb-4">
          <div className="text-xs font-bold text-[#172D46] uppercase tracking-wider mb-1">
            Authority Personnel Sign-In
          </div>
          <p className="text-xs text-[#5E7A91] font-reading">
            Enter your official agency credentials to access assigned investigation dockets.
          </p>
        </div>

        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-[#9B2C2C]/10 border border-[#9B2C2C]/30 rounded-xl text-xs text-[#9B2C2C] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#172D46] mb-1">
              Official Agency Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8FAFC4] absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
                className="w-full bg-white border border-[#D8D2C6] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#172D46] placeholder-[#8FAFC4] focus:outline-hidden focus:border-[#294D6B] font-mono transition-all shadow-xs"
                placeholder="investigator@agency.gov"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-[#172D46]">Password</label>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-[11px] text-[#294D6B] hover:text-[#172D46] hover:underline font-medium cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8FAFC4] absolute left-3 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full bg-white border border-[#D8D2C6] rounded-xl pl-9 pr-9 py-2.5 text-xs text-[#172D46] placeholder-[#8FAFC4] focus:outline-hidden focus:border-[#294D6B] transition-all shadow-xs"
                placeholder="••••••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-[#8FAFC4] hover:text-[#172D46] cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-[#294D6B] hover:bg-[#172D46] disabled:opacity-60 text-white font-medium text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Authenticating Credentials...</span>
              </>
            ) : (
              <>
                <span>Authenticate & Access Docket</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Local Demo Mode Quick Launch */}
        <div className="mt-5 pt-4 border-t border-[#D8D2C6]">
          <div className="text-[11px] font-semibold text-[#8E6E3C] uppercase tracking-wider mb-2 flex items-center justify-between font-mono">
            <span>Evaluation &amp; Judge Access</span>
            <span className="text-[10px] text-[#5E7A91] lowercase bg-[#E8E4DC]/60 px-1.5 py-0.5 rounded font-mono">local demo</span>
          </div>
          <button
            type="button"
            id="authority-demo-btn"
            disabled={demoLoading || loading}
            onClick={handleDemoLogin}
            className="w-full py-2.5 px-3.5 bg-[#FAF6EF] hover:bg-[#F2ECE1] text-[#172D46] border border-[#C5A77B] rounded-xl font-medium text-xs shadow-2xs hover:shadow-xs transition-all flex items-center justify-between cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group"
          >
            <div className="flex items-center gap-2.5 text-left">
              <div className="w-7 h-7 rounded-lg bg-[#C5A77B]/20 text-[#8E6E3C] flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A77B]" />
              </div>
              <div>
                <div className="font-semibold text-[#172D46] group-hover:text-[#294D6B] transition-colors">
                  Explore Authority Demo
                </div>
                <div className="text-[10px] text-[#5E7A91] font-mono">
                  Det. Marcus Vance • Full Investigation Dockets
                </div>
              </div>
            </div>
            {demoLoading ? (
              <div className="w-4 h-4 border-2 border-[#C5A77B]/30 border-t-[#C5A77B] rounded-full animate-spin" />
            ) : (
              <ArrowRight className="w-3.5 h-3.5 text-[#C5A77B] group-hover:translate-x-0.5 transition-transform" />
            )}
          </button>
        </div>

        {/* Forgot Password Modal */}
        {showForgotPassword && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-[#FCFBF9] border border-[#D8D2C6] rounded-2xl p-6 max-w-sm w-full space-y-3 shadow-xl">
              <div className="flex items-center gap-2 text-[#294D6B]">
                <KeyRound className="w-5 h-5" />
                <h3 className="font-bold text-sm text-[#172D46]">Authority Credential Recovery</h3>
              </div>
              <p className="text-xs text-[#5E7A91]">
                In compliance with CJIS security policy, self-service reset is routed through your department Information Security Officer (ISO).
              </p>
              {resetSent ? (
                <div className="p-3 bg-[#FAF6EF] border border-[#C5A77B]/50 rounded-xl text-xs text-[#8E6E3C]">
                  Password reset ticket generated. A temporary security token was dispatched to your agency supervisor.
                </div>
              ) : (
                <input
                  type="email"
                  defaultValue={email}
                  className="w-full bg-white border border-[#D8D2C6] rounded-xl px-3 py-2 text-xs text-[#172D46] font-mono"
                  placeholder="official.email@agency.gov"
                />
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetSent(false);
                  }}
                  className="px-3 py-1.5 bg-white text-[#5E7A91] text-xs rounded-xl border border-[#D8D2C6] cursor-pointer"
                >
                  Close
                </button>
                {!resetSent && (
                  <button
                    type="button"
                    onClick={() => setResetSent(true)}
                    className="px-3.5 py-1.5 bg-[#294D6B] hover:bg-[#172D46] text-white text-xs font-semibold rounded-xl shadow-xs cursor-pointer transition-colors"
                  >
                    Submit Reset Ticket
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-5 pt-3 border-t border-[#D8D2C6] text-[10px] text-[#8FAFC4] text-center font-mono font-medium">
          CJIS • HIPAA • NIST 800-53 REV 5 COMPLIANT ENVIRONMENT
        </div>
      </div>

      {/* Navigation Links */}
      <div className="mt-4 text-center flex flex-col gap-1.5 text-xs relative z-10">
        <Link to="/victim/login" className="text-[#C5A77B] hover:text-white transition-colors">
          Switch to Victim &amp; Witness Space →
        </Link>
        <Link to="/" className="text-[#8FAFC4] hover:text-[#E8E4DC] transition-colors">
          ← Return to Fragment First Home
        </Link>
      </div>
    </div>
  );
};
