import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  KeyRound, 
  Mail, 
  Lock, 
  UserCheck, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle, 
  Smartphone,
  Eye,
  EyeOff,
  Fingerprint
} from 'lucide-react';
import { useAuth, ROLES } from '../context/AuthContext';

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [selectedRole, setSelectedRole] = useState(ROLES[0].id);
  const [email, setEmail] = useState(ROLES[0].email);
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [mfaCode, setMfaCode] = useState(['4', '8', '9', '2', '1', '0']);
  const [step, setStep] = useState(1);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleRoleChange = (roleId) => {
    setSelectedRole(roleId);
    setError(null);
    const found = ROLES.find(r => r.id === roleId);
    if (found) {
      setEmail(found.email);
    }
  };

  const handleCredentialsSubmit = (e) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setStep(2);
  };

  const handleMfaSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await login(email.trim().toLowerCase(), password, selectedRole, mfaCode.join(''));
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Login failed. Please try again.');
        setStep(1);
      }
    } catch {
      setError('Network error. Please try again.');
      setStep(1);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMfaDigitChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    const nextCode = [...mfaCode];
    nextCode[index] = value;
    setMfaCode(nextCode);

    if (value && index < 5) {
      const nextInput = document.getElementById(`mfa-${index + 1}`);
      if (nextInput) nextInput.focus();
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

        {step === 1 ? (
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#172D46] uppercase tracking-wider mb-2">
                Authority Role Identification
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map((role) => (
                  <button
                    type="button"
                    key={role.id}
                    onClick={() => handleRoleChange(role.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedRole === role.id
                        ? 'bg-[#294D6B] border-[#172D46] text-white shadow-xs font-medium'
                        : 'bg-white border-[#D8D2C6] text-[#5E7A91] hover:text-[#172D46] hover:border-[#294D6B]'
                    }`}
                  >
                    <div className="text-[11px] font-bold truncate">{role.title}</div>
                    <div className={`text-[10px] truncate mt-0.5 ${selectedRole === role.id ? 'text-[#8FAFC4]' : 'text-[#8FAFC4]'}`}>
                      {role.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>

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

            {/* Error message */}
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full mt-2 py-3 px-4 bg-[#294D6B] hover:bg-[#172D46] text-white font-medium text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <span>Continue to Multi-Factor Authentication</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleMfaSubmit} className="space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#EAF1F7] border border-[#294D6B]/30 text-[#294D6B] flex items-center justify-center mx-auto mb-2.5 shadow-xs">
                <Smartphone className="w-6 h-6" />
              </div>
              <h2 className="text-sm font-bold text-[#172D46]">Hardware / App MFA Verification</h2>
              <p className="text-xs text-[#5E7A91] mt-1 font-reading">
                Enter the 6-digit cryptographic verification code sent to your authorized authenticator app or hardware key.
              </p>
            </div>

            <div className="flex justify-center gap-2 my-4">
              {mfaCode.map((digit, i) => (
                <input
                  key={i}
                  id={`mfa-${i}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleMfaDigitChange(i, e.target.value)}
                  className="w-11 h-12 text-center text-lg font-mono font-bold bg-white border-2 border-[#D8D2C6] rounded-xl text-[#172D46] focus:border-[#294D6B] focus:outline-hidden transition-all shadow-xs"
                />
              ))}
            </div>

            <div className="p-3 bg-[#FAF6EF] border border-[#C5A77B]/50 rounded-xl text-[11px] text-[#8E6E3C] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#C5A77B] shrink-0" />
              <span>Session will be bound to FIPS 140-3 Hardware Token ID #4910</span>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-2.5 px-3 bg-white hover:bg-gray-50 text-[#5E7A91] text-xs font-medium rounded-xl border border-[#D8D2C6] transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="w-2/3 py-2.5 px-4 bg-[#294D6B] hover:bg-[#172D46] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-60"
              >
                {submitting ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Authorize &amp; Enter</span>
                    <CheckCircle className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

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
                  Password reset ticket #SEC-7701 generated. A temporary security token was dispatched to your agency supervisor.
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
    </div>
  );
};
