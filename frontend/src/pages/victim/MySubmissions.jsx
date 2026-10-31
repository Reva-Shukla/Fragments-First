import { useState, useEffect } from 'react';
import VictimLayout from '../../components/VictimLayout';
import { casesApi, statementsApi, reconstructionApi } from '../../api/client';
import { useToast } from '../../components/Toast';
import Spinner from '../../components/Spinner';

function StatementCard({ statement, onSelectReconstruction }) {
  const [recons, setRecons] = useState(null);
  const [loadingRecons, setLoadingRecons] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const loadRecons = async () => {
    if (recons !== null) { setExpanded((v) => !v); return; }
    setLoadingRecons(true);
    try {
      const { data } = await reconstructionApi.getForStatement(statement.id);
      setRecons(data);
      setExpanded(true);
    } catch {
      setRecons([]);
    } finally {
      setLoadingRecons(false);
    }
  };

  const excerpt = statement.original_text?.slice(0, 220);
  const truncated = statement.original_text?.length > 220;

  return (
    <div className={`statement-card ${statement.is_draft ? 'is-draft' : 'is-submitted'}`}>
      <div className="statement-meta">
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span className="receipt-id">FF-STMT-{String(statement.id).padStart(6, '0')}</span>
          <span className={`badge ${statement.is_draft ? 'badge-blue' : 'badge-green'}`}>
            {statement.is_draft ? 'Draft' : 'Submitted'}
          </span>
          <span className="badge badge-muted">v{statement.version}</span>
        </div>
        <span>{new Date(statement.created_at).toLocaleString()}</span>
      </div>

      <div className="statement-excerpt">
        {excerpt}{truncated && '…'}
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {!statement.is_draft && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={loadRecons}
            disabled={loadingRecons}
          >
            {loadingRecons ? <Spinner /> : expanded ? '▲ Hide AI version' : '🧠 View AI reconstruction'}
          </button>
        )}
      </div>

      {expanded && recons !== null && (
        <div style={{ marginTop: '8px' }}>
          {recons.length === 0 ? (
            <div className="notice notice-muted">
              No AI reconstruction has been generated for this statement yet.
              Go to <strong>My Statement</strong> to request one.
            </div>
          ) : (
            recons.map((r) => (
              <div key={r.id} className="recon-panel" style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--cerulean)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    AI reconstruction
                  </span>
                  {r.is_approved === true && <span className="badge badge-green">Approved by you</span>}
                  {r.is_approved === false && r.victim_feedback && <span className="badge badge-rose">Rejected</span>}
                  {(r.is_approved === null || r.is_approved === undefined) && (
                    <span className="badge badge-amber">Awaiting your review</span>
                  )}
                </div>
                <p className="recon-text" style={{ fontSize: '14px' }}>{r.reconstructed_statement}</p>
                {r.preserved_uncertainties?.length > 0 && (
                  <div style={{ marginTop: '8px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--white-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Preserved uncertainties:
                    </span>
                    <ul style={{ fontSize: '13px', color: 'var(--white-muted)', paddingLeft: '16px', marginTop: '4px' }}>
                      {r.preserved_uncertainties.map((u, i) => <li key={i}>{u}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function MySubmissions() {
  const toast = useToast();
  const [cases, setCases] = useState([]);
  const [statementsMap, setStatementsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    async function load() {
      try {
        const { data: caseList } = await casesApi.list();
        setCases(caseList);
        const map = {};
        for (const c of caseList) {
          try {
            const { data } = await statementsApi.getByCase(c.id);
            map[c.id] = data;
          } catch { map[c.id] = []; }
        }
        setStatementsMap(map);
      } catch {
        toast('Could not load your submissions.', 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const allStatements = Object.values(statementsMap).flat();
  const drafts = allStatements.filter((s) => s.is_draft);
  const submitted = allStatements.filter((s) => !s.is_draft);
  const shown = activeTab === 'drafts' ? drafts : activeTab === 'submitted' ? submitted : allStatements;

  return (
    <VictimLayout>
      <div className="page-header">
        <h1 className="page-header-title">My Submissions</h1>
        <p className="page-header-subtitle">
          All your statements — drafts and submissions — in one place.
          Drafts are private. Submitted statements are shared with authorised personnel only.
        </p>
      </div>

      <div className="tabs">
        <button className={`tab${activeTab === 'all' ? ' active' : ''}`} onClick={() => setActiveTab('all')}>
          All ({allStatements.length})
        </button>
        <button className={`tab${activeTab === 'submitted' ? ' active' : ''}`} onClick={() => setActiveTab('submitted')}>
          Submitted ({submitted.length})
        </button>
        <button className={`tab${activeTab === 'drafts' ? ' active' : ''}`} onClick={() => setActiveTab('drafts')}>
          Drafts ({drafts.length})
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--white-muted)' }}>
          <Spinner /> Loading your statements…
        </div>
      ) : shown.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📄</div>
          <div className="empty-title">Nothing here yet</div>
          <p className="empty-desc">
            {activeTab === 'drafts'
              ? "You haven't saved any drafts. Drafts are private and never shared."
              : activeTab === 'submitted'
              ? "You haven't submitted any statements yet."
              : "You haven't written any statements yet. Take your time."}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {shown
            .slice()
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .map((s) => <StatementCard key={s.id} statement={s} />)}
        </div>
      )}
    </VictimLayout>
  );
}
