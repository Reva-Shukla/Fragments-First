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
  EyeOff
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

  const handleRoleChange = (roleId) => {
    setSelectedRole(roleId);
    const found = ROLES.find(r => r.id === roleId);
    if (found) {
      setEmail(found.email);
    }
  };

  const handleCredentialsSubmit = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handleMfaSubmit = (e) => {
    e.preventDefault();
    login(email, password, selectedRole, mfaCode.join(''));
    navigate('/dashboard');
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
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Liquid Glass Ambient Fluid Light Orbs */}
      <div className="absolute top-1/4 -left-24 w-[36vw] h-[36vw] bg-sky-500/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-24 w-[36vw] h-[36vw] bg-rose-500/18 rounded-full blur-[140px] pointer-events-none" />

      {/* Official Authority Notice Header */}
      <div className="w-full max-w-md text-center mb-6 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] backdrop-blur-xl border border-white/10 text-xs text-slate-300 mb-3 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
          <ShieldCheck className="w-4 h-4 text-sky-400 drop-shadow-[0_0_8px_rgba(14,165,233,0.8)]" />
          <span className="font-mono text-[11px]">OFFICIAL USE ONLY • LAW ENFORCEMENT SENSITIVE</span>
        </div>
        <div className="flex items-center justify-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-400 via-sky-500 to-rose-500 flex items-center justify-center font-black text-black text-base shadow-[0_0_25px_rgba(14,165,233,0.4)]">
            F1
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            FRAGMENT <span className="bg-gradient-to-r from-sky-400 to-rose-400 bg-clip-text text-transparent">FIRST</span>
          </h1>
        </div>
        <p className="text-xs text-sky-400 mt-1 font-mono tracking-wider">
          AI-POWERED LEGAL & INCIDENT INVESTIGATION AUTHORITY PORTAL
        </p>
      </div>

      {/* Main Liquid Glass Authentication Card */}
      <div className="w-full max-w-md bg-black/60 backdrop-blur-2xl border border-white/15 rounded-3xl p-7 shadow-[0_24px_64px_rgba(0,0,0,0.8)] relative z-10 overflow-hidden">
        {/* Specular top reflection */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-sky-400/40 via-white/30 to-rose-400/40" />

        {step === 1 ? (
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Authority Role Identification
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map((role) => (
                  <button
                    type="button"
                    key={role.id}
                    onClick={() => handleRoleChange(role.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedRole === role.id
                        ? 'bg-sky-500/15 border-sky-400/60 text-sky-200 shadow-[0_0_15px_rgba(14,165,233,0.25)]'
                        : 'bg-white/[0.03] border-white/10 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <div className="text-[11px] font-bold truncate">{role.title}</div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">{role.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Official Agency Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-sky-400 focus:shadow-[0_0_15px_rgba(14,165,233,0.3)] font-mono transition-all"
                  placeholder="investigator@agency.gov"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-[11px] text-rose-400 hover:text-rose-300 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-9 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-sky-400 focus:shadow-[0_0_15px_rgba(14,165,233,0.3)] transition-all"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-sky-500 via-sky-600 to-rose-600 hover:from-sky-400 hover:to-rose-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(14,165,233,0.35)] transition-all"
            >
              <span>Continue to Multi-Factor Authentication</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleMfaSubmit} className="space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto mb-2.5 shadow-[0_0_20px_rgba(255,0,127,0.3)]">
                <Smartphone className="w-6 h-6" />
              </div>
              <h2 className="text-sm font-semibold text-white">Hardware / App MFA Verification</h2>
              <p className="text-xs text-slate-400 mt-1">
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
                  className="w-11 h-12 text-center text-lg font-mono font-bold bg-black/60 border border-white/15 rounded-xl text-sky-300 focus:border-rose-400 focus:shadow-[0_0_15px_rgba(255,0,127,0.4)] focus:outline-hidden transition-all"
                />
              ))}
            </div>

            <div className="p-3 bg-white/[0.03] border border-white/10 rounded-xl text-[11px] text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
              <span>Session will be bound to FIPS 140-3 Hardware Token ID #4910</span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-2.5 px-3 bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 text-xs font-medium rounded-xl border border-white/10 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                className="w-2/3 py-2.5 px-4 bg-gradient-to-r from-sky-500 to-rose-600 hover:from-sky-400 hover:to-rose-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,0,127,0.35)] transition-all"
              >
                <span>Authorize & Enter</span>
                <CheckCircle className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* Forgot Password Modal */}
        {showForgotPassword && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
            <div className="bg-black/90 border border-white/15 rounded-2xl p-6 max-w-sm w-full space-y-3 shadow-[0_24px_64px_rgba(0,0,0,0.9)]">
              <div className="flex items-center gap-2 text-rose-400">
                <KeyRound className="w-5 h-5 drop-shadow-[0_0_8px_rgba(255,0,127,0.8)]" />
                <h3 className="font-semibold text-sm text-white">Authority Credential Recovery</h3>
              </div>
              <p className="text-xs text-slate-400">
                In compliance with CJIS security policy, self-service reset is routed through your department Information Security Officer (ISO).
              </p>
              {resetSent ? (
                <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl text-xs text-rose-300">
                  Password reset ticket #SEC-7701 generated. A temporary security token was dispatched to your agency supervisor.
                </div>
              ) : (
                <input
                  type="email"
                  defaultValue={email}
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white font-mono"
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
                  className="px-3 py-1.5 bg-white/[0.05] text-slate-300 text-xs rounded-xl border border-white/10"
                >
                  Close
                </button>
                {!resetSent && (
                  <button
                    type="button"
                    onClick={() => setResetSent(true)}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-sky-500 to-rose-600 text-white text-xs font-semibold rounded-xl shadow-[0_0_12px_rgba(255,0,127,0.4)]"
                  >
                    Submit Reset Ticket
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-5 pt-3 border-t border-white/10 text-[10px] text-slate-400 text-center font-mono">
          CJIS • HIPAA • NIST 800-53 REV 5 COMPLIANT ENVIRONMENT
        </div>
      </div>
    </div>
  );
};
