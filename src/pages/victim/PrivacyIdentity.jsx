import { useState } from 'react';
import VictimLayout from '../../components/victim/VictimLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/victim/Toast';
import client from '../../api/client';
import Spinner from '../../components/victim/Spinner';
import { 
  UserCheck, 
  ShieldCheck, 
  Edit3, 
  Key, 
  Sparkles
} from 'lucide-react';

export default function PrivacyIdentity() {
  const { user, displayName } = useAuth();
  const toast = useToast();

  const [editing, setEditing] = useState(false);
  const [newAlias, setNewAlias] = useState(displayName);
  const [saving, setSaving] = useState(false);

  const handleSaveAlias = async () => {
    if (!newAlias.trim()) { toast('Alias cannot be empty.', 'error'); return; }
    setSaving(true);
    try {
      await client.put(`/users/${user.id}`, { full_name: newAlias.trim() });
      const stored = JSON.parse(localStorage.getItem('ff_user') || '{}');
      localStorage.setItem('ff_user', JSON.stringify({ ...stored, full_name: newAlias.trim() }));
      toast('Display alias updated. Sign in again to refresh session.', 'success');
      setEditing(false);
    } catch (err) {
      if (err.response?.status === 405 || err.response?.status === 404) {
        toast('Alias editing is a client-side prototype in this version.', 'info');
      } else {
        toast(err.response?.data?.detail || 'Could not update alias.', 'error');
      }
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <VictimLayout>
      <div className="page-header">
        <h1 className="page-header-title">Privacy &amp; Identity</h1>
        <p className="page-header-subtitle">
          Transparent accounting of how your identity is isolated, protected, and managed within Fragment First.
        </p>
      </div>

      {/* Display Identity Card */}
      <div className="card card-glow-cerulean mb-6">
        <div className="flex items-center gap-2 mb-4">
          <UserCheck className="w-4 h-4 text-[#C5A77B]" />
          <h2 className="section-title mb-0">Your Display Identity</h2>
        </div>

        <div className="flex items-center gap-4 mb-5 flex-wrap">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#294D6B] to-[#172D46] border border-[#C5A77B]/60 flex items-center justify-center text-xl font-bold text-[#FCFBF9] font-serif-clean shrink-0 shadow-md">
            {(displayName || 'P').charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-brand text-xl font-bold text-[#172D46]">{displayName || 'Private Account'}</div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#FAF6EF] border border-[#C5A77B]/50 mt-1">
              <span className="text-[10px] font-mono text-[#8E6E3C] uppercase tracking-wider font-semibold">Protected Pseudonymous Alias</span>
            </div>
          </div>
        </div>

        {!editing ? (
          <button
            id="edit-alias-btn"
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => { setEditing(true); setNewAlias(displayName); }}
          >
            <Edit3 className="w-3.5 h-3.5 text-[#8FAFC4]" />
            <span>Edit Display Alias</span>
          </button>
        ) : (
          <div className="flex items-end gap-3 flex-wrap max-w-md">
            <div className="form-group flex-1 min-w-[200px] mb-0">
              <label htmlFor="alias-input" className="form-label">New Display Alias</label>
              <input
                id="alias-input"
                type="text"
                className="form-input text-xs"
                value={newAlias}
                onChange={(e) => setNewAlias(e.target.value)}
                maxLength={50}
              />
            </div>
            <button
              id="save-alias-btn"
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleSaveAlias}
              disabled={saving}
            >
              {saving ? <Spinner /> : 'Save Alias'}
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setEditing(false)}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Account Details */}
      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Key className="w-4 h-4 text-[#294D6B]" />
          <h2 className="section-title mb-0">Account Information &amp; Isolation</h2>
        </div>
        <div className="flex flex-col gap-2">
          <div className="receipt-detail-row">
            <strong>Internal Account Reference</strong>
            <span className="font-mono text-xs text-[#294D6B] font-semibold">
              FF-{String(user?.id || '00000000').padStart(8, '0')}
            </span>
          </div>
          <div className="receipt-detail-row">
            <strong>Access Tier</strong>
            <span className="font-medium text-[#172D46]">Private Victim Account</span>
          </div>
          <div className="receipt-detail-row">
            <strong>Account Established</strong>
            <span className="text-xs text-[#5E7A91]">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Active Docket'}
            </span>
          </div>
          <div className="receipt-detail-row border-b-0">
            <strong>Sign-In Credential (Email)</strong>
            <span className="font-mono text-xs text-[#8FAFC4]">●●●●●●●●@●●●●●● (Masked for Security)</span>
          </div>
        </div>
        <p className="form-hint mt-3">
          Your email address is utilized solely for cryptographic authentication. It is never rendered in public-facing interfaces or shared with investigative personnel.
        </p>
      </div>

      {/* What Authorities See */}
      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="w-4 h-4 text-[#1E6B52]" />
          <h2 className="section-title mb-0">What Authorized Authorities Can Access</h2>
        </div>
        <ul className="info-list text-xs space-y-2">
          <li>The contents of statements that you have <strong>explicitly submitted</strong> (never drafts)</li>
          <li>Your internal account reference identifier (never your personal email address)</li>
          <li>Formal digital submission timestamps and reference tracking numbers</li>
          <li>AI narrative reconstructions that <strong>you have reviewed and approved</strong></li>
        </ul>
        <div className="notice notice-muted mt-4">
          <strong className="text-xs text-[#172D46]">Draft Confidentiality Guarantee:</strong>
          <span className="text-xs text-[#5E7A91] block mt-0.5">
            Private drafts are never exposed to investigative authorities, legal representatives, or administrators.
          </span>
        </div>
      </div>

      {/* Honest Privacy Statement */}
      <div className="card card-glow-rose">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-[#C5A77B]" />
          <h2 className="section-title mb-0">Honest Transparency Commitment</h2>
        </div>
        <ul className="info-list text-xs space-y-2.5">
          <li>
            Fragment First provides <strong>pseudonymous isolation</strong> rather than unqualified anonymity. Your account is tied to a secure email address for legal integrity.
          </li>
          <li>
            Your original statement fragments are preserved verbatim and can never be retroactively altered by algorithmic systems.
          </li>
          <li>
            No device fingerprinting, biometric profiling, or background tracking mechanisms are ever deployed.
          </li>
        </ul>
      </div>
    </VictimLayout>
  );
}
