import { useState, useEffect } from 'react';
import VictimLayout from '../../components/victim/VictimLayout';
import { casesApi, statementsApi, reconstructionApi } from '../../api/client';
import { useToast } from '../../components/victim/Toast';
import Spinner from '../../components/victim/Spinner';
import { 
  FileText, 
  Brain, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Lock, 
  Send 
} from 'lucide-react';

function StatementCard({ statement }) {
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
    <div className={`statement-card ${statement.is_draft ? 'is-draft' : 'is-submitted'} hover:border-[#C5A77B]/80 transition-all`}>
      <div className="statement-meta">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="receipt-id">FF-STMT-{String(statement.id).padStart(6, '0')}</span>
          <span className={`badge ${statement.is_draft ? 'badge-amber' : 'badge-green'}`}>
            {statement.is_draft ? 'Private Draft' : 'Submitted'}
          </span>
          <span className="badge badge-muted">v{statement.version}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#5E7A91]">
          <Clock className="w-3.5 h-3.5 text-[#8FAFC4]" />
          <span>{new Date(statement.created_at).toLocaleString()}</span>
        </div>
      </div>

      <div className="statement-excerpt">
        {excerpt}{truncated && '…'}
      </div>

      <div className="flex items-center gap-2 flex-wrap pt-1">
        {!statement.is_draft && (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={loadRecons}
            disabled={loadingRecons}
          >
            {loadingRecons ? (
              <Spinner />
            ) : expanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-[#8FAFC4]" />
                <span>Hide AI Reconstruction</span>
              </>
            ) : (
              <>
                <Brain className="w-3.5 h-3.5 text-[#C5A77B]" />
                <span>View AI Reconstruction</span>
              </>
            )}
          </button>
        )}
      </div>

      {expanded && recons !== null && (
        <div className="mt-2">
          {recons.length === 0 ? (
            <div className="notice notice-muted text-xs">
              No AI narrative reconstruction has been generated for this statement yet.
              Go to <strong>My Statement</strong> to generate one.
            </div>
          ) : (
            recons.map((r) => (
              <div key={r.id} className="recon-panel bg-[#FCFBF9] border border-[#D8D2C6] mb-3">
                <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#294D6B] flex items-center gap-1.5">
                    <Brain className="w-3.5 h-3.5 text-[#C5A77B]" />
                    <span>AI Narrative Reconstruction</span>
                  </span>
                  {r.is_approved === true && <span className="badge badge-green">Approved by you</span>}
                  {r.is_approved === false && r.victim_feedback && <span className="badge badge-rose">Correction Requested</span>}
                  {(r.is_approved === null || r.is_approved === undefined) && (
                    <span className="badge badge-amber">Awaiting your review</span>
                  )}
                </div>
                <p className="recon-text text-sm leading-relaxed">{r.reconstructed_statement}</p>
                {r.preserved_uncertainties?.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-[#D8D2C6]/50">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#8FAFC4] font-semibold">
                      Preserved Uncertainties:
                    </span>
                    <ul className="text-xs text-[#5E7A91] pl-4 list-disc mt-1 space-y-0.5">
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
        toast('Could not load your statements.', 'error');
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
      {/* Header */}
      <div className="page-header">
        <h1 className="page-header-title">My Submissions</h1>
        <p className="page-header-subtitle">
          All your statements — private drafts and submitted records — accessible in one place.
          Private drafts are kept strictly for you alone, while submitted records are available to authorized case investigators.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6">
        {[
          { key: 'all', label: `All Statements (${allStatements.length})` },
          { key: 'submitted', label: `Submitted (${submitted.length})` },
          { key: 'drafts', label: `Private Drafts (${drafts.length})` },
        ].map(({ key, label }) => (
          <button
            key={key}
            type="button"
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === key
                ? 'bg-[#294D6B] text-[#FCFBF9] shadow-sm'
                : 'bg-white/80 hover:bg-white text-[#5E7A91] border border-[#D8D2C6]'
            }`}
            onClick={() => setActiveTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-xs text-[#5E7A91] py-8">
          <Spinner />
          <span>Retrieving your statement records...</span>
        </div>
      ) : shown.length === 0 ? (
        <div className="empty-state">
          <div className="w-12 h-12 rounded-2xl bg-[#EAF1F7] border border-[#8FAFC4]/50 flex items-center justify-center text-[#294D6B] mx-auto mb-3">
            <FileText className="w-6 h-6 text-[#294D6B]" />
          </div>
          <div className="empty-title">Nothing on record yet</div>
          <p className="empty-desc">
            {activeTab === 'drafts'
              ? "You haven't saved any drafts. Drafts are private and never shared."
              : activeTab === 'submitted'
              ? "You haven't submitted any statements yet. You can submit when you feel completely ready."
              : "You haven't written any statements yet. There is no rush — take your time."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {shown
            .slice()
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .map((s) => <StatementCard key={s.id} statement={s} />)}
        </div>
      )}
    </VictimLayout>
  );
}
