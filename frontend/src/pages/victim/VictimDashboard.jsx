import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import VictimLayout from '../../components/VictimLayout';
import { useAuth } from '../../contexts/AuthContext';
import { casesApi, statementsApi } from '../../api/client';
import Spinner from '../../components/Spinner';

export default function VictimDashboard() {
  const { displayName, user } = useAuth();
  const [cases, setCases] = useState([]);
  const [stats, setStats] = useState({ total: 0, drafts: 0, submitted: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await casesApi.list();
        setCases(data);

        // Tally statements across all cases
        let drafts = 0;
        let submitted = 0;
        for (const c of data) {
          try {
            const { data: stmts } = await statementsApi.getByCase(c.id);
            drafts    += stmts.filter((s) => s.is_draft).length;
            submitted += stmts.filter((s) => !s.is_draft).length;
          } catch { /* skip */ }
        }
        setStats({ total: data.length, drafts, submitted });
      } catch {
        // no cases yet — that's fine
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' :
    hour < 18 ? 'Good afternoon' :
    'Good evening';

  return (
    <VictimLayout>
      <div className="page-header">
        <p style={{ color: 'var(--white-muted)', fontSize: '13px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {greeting}
        </p>
        <h1 className="page-header-title">{displayName}</h1>
        <p className="page-header-subtitle">
          This is your private space. Take your time — nothing here is ever shared without your knowledge.
        </p>
      </div>

      {/* Privacy reminder */}
      <div className="notice notice-muted" style={{ marginBottom: '32px' }}>
        🔒 Your drafts are private. Only information you explicitly submit is shared with authorised personnel.
      </div>

      {/* Stats */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--white-muted)', marginBottom: '32px' }}>
          <Spinner /> Loading your information…
        </div>
      ) : (
        <div className="stat-grid">
          <div className="stat-card">
            <span className="stat-label">Cases</span>
            <span className="stat-value">{stats.total}</span>
            <span className="stat-sub">{stats.total === 0 ? 'No cases yet' : 'Total cases'}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Submitted</span>
            <span className="stat-value">{stats.submitted}</span>
            <span className="stat-sub">Statements shared</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Drafts</span>
            <span className="stat-value">{stats.drafts}</span>
            <span className="stat-sub">Saved privately</span>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <p className="section-title">What would you like to do?</p>
      <div className="grid-2" style={{ marginBottom: '40px' }}>
        <Link to="/victim/statement" id="dash-write-statement" className="card" style={{ cursor: 'pointer', textDecoration: 'none' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>✍</div>
          <div style={{ fontWeight: 600, marginBottom: '4px', color: 'var(--white)' }}>Write a statement</div>
          <p style={{ fontSize: '13px', color: 'var(--white-muted)' }}>
            Share what happened — fragments, incomplete thoughts, voice notes.
            Save as draft or submit when ready.
          </p>
        </Link>

        <Link to="/victim/submissions" id="dash-view-submissions" className="card" style={{ cursor: 'pointer', textDecoration: 'none' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>📋</div>
          <div style={{ fontWeight: 600, marginBottom: '4px', color: 'var(--white)' }}>Review my submissions</div>
          <p style={{ fontSize: '13px', color: 'var(--white-muted)' }}>
            View your previously submitted statements and drafts. See AI reconstructions
            and approve or request corrections.
          </p>
        </Link>

        <Link to="/victim/redaction" id="dash-redaction-studio" className="card" style={{ cursor: 'pointer', textDecoration: 'none' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔲</div>
          <div style={{ fontWeight: 600, marginBottom: '4px', color: 'var(--white)' }}>Redaction Studio</div>
          <p style={{ fontSize: '13px', color: 'var(--white-muted)' }}>
            Redact sensitive information from documents before sharing.
            Preview and confirm before anything is sent.
          </p>
          <span className="prototype-label" style={{ marginTop: '8px', alignSelf: 'flex-start' }}>Preview feature</span>
        </Link>

        <Link to="/victim/help" id="dash-help" className="card" style={{ cursor: 'pointer', textDecoration: 'none' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>❓</div>
          <div style={{ fontWeight: 600, marginBottom: '4px', color: 'var(--white)' }}>Help & guidance</div>
          <p style={{ fontSize: '13px', color: 'var(--white-muted)' }}>
            Understand how Fragment First works, what happens after you submit,
            and what AI does and does not do.
          </p>
        </Link>
      </div>

      {/* Your cases */}
      {!loading && cases.length > 0 && (
        <>
          <p className="section-title">Your cases</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {cases.slice(0, 5).map((c) => (
              <div key={c.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ fontWeight: 500, color: 'var(--white)', marginBottom: '4px' }}>{c.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--white-muted)' }}>
                    Ref: FF-{String(c.id).padStart(6, '0')} · {new Date(c.created_at).toLocaleDateString()}
                  </div>
                </div>
                <span className={`badge ${c.status === 'open' ? 'badge-blue' : c.status === 'closed' ? 'badge-muted' : 'badge-amber'}`}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {!loading && cases.length === 0 && (
        <div className="notice notice-cerulean">
          You haven't started a case yet. Go to <Link to="/victim/statement" style={{ color: 'var(--cerulean)', fontWeight: 600 }}>My Statement</Link> to begin sharing your account when you're ready.
        </div>
      )}
    </VictimLayout>
  );
}
