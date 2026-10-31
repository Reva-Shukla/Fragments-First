import { useState } from 'react';
import VictimLayout from '../../components/VictimLayout';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/Toast';
import { authApi } from '../../api/client';
import client from '../../api/client';
import Spinner from '../../components/Spinner';

export default function PrivacyIdentity() {
  const { user, displayName } = useAuth();
  const toast = useToast();

  const [editing, setEditing] = useState(false);
  const [newAlias, setNewAlias] = useState(displayName);
  const [saving, setSaving] = useState(false);

  // Note: The backend does not currently expose a PATCH /auth/me or PUT /users/{id} endpoint
  // for updating full_name. This UI is presented as a prototype until backend support is added.
  const handleSaveAlias = async () => {
    if (!newAlias.trim()) { toast('Alias cannot be empty.', 'error'); return; }
    setSaving(true);
    try {
      await client.put(`/users/${user.id}`, { full_name: newAlias.trim() });
      // Update local storage
      const stored = JSON.parse(localStorage.getItem('ff_user') || '{}');
      localStorage.setItem('ff_user', JSON.stringify({ ...stored, full_name: newAlias.trim() }));
      toast('Alias updated. Sign in again to see the change.', 'success');
      setEditing(false);
    } catch (err) {
      // The backend may not support this endpoint yet — handle gracefully
      if (err.response?.status === 405 || err.response?.status === 404) {
        toast('Alias editing is not yet supported by the backend. This is a prototype view.', 'info');
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
          Understand how your identity is managed in Fragment First.
        </p>
      </div>

      {/* Display identity */}
      <div className="card card-glow-cerulean" style={{ marginBottom: '24px' }}>
        <p className="section-title" style={{ marginBottom: '16px' }}>Your display identity</p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{
            width: 60, height: 60,
            background: 'linear-gradient(135deg, var(--cerulean), var(--rose))',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '22px', fontWeight: 700, color: '#fff',
            fontFamily: 'var(--font-display)',
            flexShrink: 0,
          }}>
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--white)' }}>{displayName}</div>
            <span className="sidebar-role-badge">Private Account</span>
          </div>
        </div>

        {!editing ? (
          <button
            id="edit-alias-btn"
            className="btn btn-ghost btn-sm"
            onClick={() => { setEditing(true); setNewAlias(displayName); }}
          >
            ✏ Edit display alias
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
              <label htmlFor="alias-input" className="form-label">New alias</label>
              <input
                id="alias-input"
                type="text"
                className="form-input"
                value={newAlias}
                onChange={(e) => setNewAlias(e.target.value)}
                maxLength={50}
              />
            </div>
            <button
              id="save-alias-btn"
              className="btn btn-primary btn-sm"
              onClick={handleSaveAlias}
              disabled={saving}
            >
              {saving ? <Spinner /> : 'Save'}
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setEditing(false)}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Account details */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <p className="section-title">Account information</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
          <div className="receipt-detail-row">
            <strong>Internal account ID</strong>
            <span style={{ fontFamily: 'monospace', color: 'var(--cerulean)' }}>
              FF-{String(user?.id).padStart(8, '0')}
            </span>
          </div>
          <div className="receipt-detail-row">
            <strong>Role</strong>
            <span>Private victim account</span>
          </div>
          <div className="receipt-detail-row">
            <strong>Account created</strong>
            <span>{user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}</span>
          </div>
          <div className="receipt-detail-row" style={{ borderBottom: 'none' }}>
            <strong>Email (sign-in only)</strong>
            <span style={{ color: 'var(--white-muted)' }}>●●●●●●●●@●●●●●●</span>
          </div>
        </div>
        <p className="form-hint" style={{ marginTop: '12px' }}>
          Your email address is used for sign-in verification only. It is never displayed in
          your victim-facing experience or shared publicly. It is stored separately from your
          display identity.
        </p>
      </div>

      {/* What authorities see */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <p className="section-title">What authorised personnel can access</p>
        <ul className="info-list" style={{ marginTop: '8px' }}>
          <li>The content of statements you have <strong>submitted</strong> (not drafts)</li>
          <li>Your internal account ID (not your display alias or email)</li>
          <li>Submission dates and reference IDs for your submitted statements</li>
          <li>AI reconstructions that <strong>you have approved</strong></li>
        </ul>
        <div className="notice notice-muted" style={{ marginTop: '16px' }}>
          <strong>Drafts</strong> are never visible to anyone other than you. Drafts are
          stored in the system but are not shared with investigators or any other party.
        </div>
      </div>

      {/* Honest privacy statement */}
      <div className="card card-glow-rose" style={{ marginBottom: '24px' }}>
        <p className="section-title">Honest privacy statement</p>
        <ul className="info-list" style={{ marginTop: '8px' }}>
          <li>
            Fragment First does <strong>not</strong> offer full anonymity. Your account is
            linked to your email address, which may be accessible to appropriately authorised
            administrators if required by law or case management.
          </li>
          <li>
            Your display alias is a <em>pseudonymous</em> identity — it separates your
            displayed name from your legal contact information.
          </li>
          <li>
            Your original statement words are permanently preserved and never altered.
          </li>
          <li>
            No device fingerprinting or background data collection occurs.
          </li>
        </ul>
      </div>
    </VictimLayout>
  );
}
