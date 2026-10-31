import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { casesApi } from '../../api/client';
import Spinner from '../../components/Spinner';

/**
 * Authority Dashboard — placeholder for the investigator experience.
 * Shows a basic authenticated state with the authority's cases.
 * The full investigator feature set is a future scope item.
 */
export default function AuthorityDashboard() {
  const { user, displayName, logout } = useAuth();
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    casesApi.list()
      .then(({ data }) => setCases(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => { await logout(); navigate('/'); };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)', padding: '40px 32px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'var(--font-display)', background: 'linear-gradient(135deg, var(--cerulean), var(--rose))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '4px' }}>
              Fragment First
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 700 }}>Authority Dashboard</h1>
            <p style={{ color: 'var(--white-muted)', fontSize: '14px', marginTop: '4px' }}>
              Signed in as <strong style={{ color: 'var(--white-dim)' }}>{displayName}</strong> ·{' '}
              <span className="badge badge-rose">{user?.role}</span>
            </p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>↪ Sign Out</button>
        </div>

        <div className="notice notice-muted" style={{ marginBottom: '32px' }}>
          The full investigator interface is under development. Below you can view all cases in the system.
          Use the <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer" style={{ color: 'var(--cerulean)' }}>API documentation</a> for full access.
        </div>

        <p className="section-title">All Cases</p>
        {loading ? (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--white-muted)' }}>
            <Spinner /> Loading cases…
          </div>
        ) : cases.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📂</div>
            <div className="empty-title">No cases yet</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {cases.map((c) => (
              <div key={c.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ fontWeight: 500, color: 'var(--white)', marginBottom: '4px' }}>{c.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--white-muted)' }}>
                    Case #{c.id} · Victim ID: {c.victim_id} · Created: {new Date(c.created_at).toLocaleDateString()}
                  </div>
                  {c.description && (
                    <div style={{ fontSize: '13px', color: 'var(--white-muted)', marginTop: '4px' }}>{c.description.slice(0, 100)}</div>
                  )}
                </div>
                <span className={`badge ${c.status === 'open' ? 'badge-blue' : c.status === 'closed' ? 'badge-muted' : 'badge-amber'}`}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
