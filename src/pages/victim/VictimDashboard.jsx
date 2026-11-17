import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import VictimLayout from '../../components/victim/VictimLayout';
import { useAuth } from '../../context/AuthContext';
import { casesApi, statementsApi } from '../../api/client';
import Spinner from '../../components/victim/Spinner';
import { 
  PenTool, 
  FileCheck2, 
  ShieldCheck, 
  HelpCircle, 
  Lock, 
  FolderGit2, 
  ArrowRight, 
  Sparkles,
  Clock
} from 'lucide-react';

export default function VictimDashboard() {
  const { displayName } = useAuth();
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
            drafts += stmts.filter((s) => s.is_draft).length;
            submitted += stmts.filter((s) => !s.is_draft).length;
          } catch {
            // skip
          }
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
      {/* Page Header */}
      <div className="page-header">
        <div className="flex items-center gap-2 mb-1">
          <Clock className="w-3.5 h-3.5 text-[#C5A77B]" />
          <span className="text-xs font-mono font-medium text-[#C5A77B] tracking-wider uppercase">
            {greeting}
          </span>
        </div>
        <h1 className="page-header-title">{displayName || 'Private Space'}</h1>
        <p className="page-header-subtitle">
          This is your protected, personal space. There is no urgency and no time pressure — take your time, and remember that nothing here is ever shared without your explicit consent.
        </p>
      </div>

      {/* Reassuring Privacy Notice */}
      <div className="notice notice-muted shadow-xs mb-8">
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-lg bg-[#FAF6EF] border border-[#C5A77B]/50 flex items-center justify-center text-[#C5A77B] shrink-0 mt-0.5">
            <Lock className="w-4 h-4 text-[#C5A77B]" />
          </div>
          <div>
            <strong className="text-[#172D46] font-semibold">Your drafts remain strictly private.</strong>
            <p className="text-xs text-[#5E7A91] mt-0.5 mb-0 leading-relaxed">
              Draft accounts and partial thoughts are stored securely for you alone. Only statements you explicitly choose to submit are shared with authorized investigators.
            </p>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div className="flex items-center gap-3 text-xs text-[#5E7A91] mb-8">
          <Spinner />
          <span>Retrieving your secure workspace information...</span>
        </div>
      ) : (
        <div className="stat-grid">
          <div className="stat-card">
            <span className="stat-label">Active Cases</span>
            <span className="stat-value">{stats.total}</span>
            <span className="stat-sub">{stats.total === 0 ? 'No open cases' : 'Total linked case files'}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Statements Shared</span>
            <span className="stat-value">{stats.submitted}</span>
            <span className="stat-sub">Explicitly submitted by you</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Private Drafts</span>
            <span className="stat-value">{stats.drafts}</span>
            <span className="stat-sub">Saved privately for your eyes only</span>
          </div>
        </div>
      )}

      {/* Quick Action Navigation Grid */}
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-[#C5A77B]" />
        <h2 className="section-title mb-0">What would you like to do?</h2>
      </div>

      <div className="grid-2 mb-10">
        <Link 
          to="/victim/statement" 
          id="dash-write-statement" 
          className="card group hover:-translate-y-1 transition-all cursor-pointer no-underline block"
        >
          <div className="w-10 h-10 rounded-xl bg-[#EAF1F7] border border-[#8FAFC4]/50 flex items-center justify-center text-[#294D6B] mb-3 group-hover:border-[#C5A77B] transition-colors">
            <PenTool className="w-5 h-5 text-[#294D6B]" />
          </div>
          <div className="flex items-center justify-between">
            <div className="font-semibold text-base text-[#172D46] group-hover:text-[#294D6B] transition-colors">
              Write a Statement
            </div>
            <ArrowRight className="w-4 h-4 text-[#C5A77B] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </div>
          <p className="text-xs text-[#5E7A91] mt-1.5 leading-relaxed">
            Share what happened in pieces, fragments, or audio recordings. Save as a private draft anytime, or submit when you feel ready.
          </p>
        </Link>

        <Link 
          to="/victim/submissions" 
          id="dash-view-submissions" 
          className="card group hover:-translate-y-1 transition-all cursor-pointer no-underline block"
        >
          <div className="w-10 h-10 rounded-xl bg-[#EAF1F7] border border-[#8FAFC4]/50 flex items-center justify-center text-[#294D6B] mb-3 group-hover:border-[#C5A77B] transition-colors">
            <FileCheck2 className="w-5 h-5 text-[#294D6B]" />
          </div>
          <div className="flex items-center justify-between">
            <div className="font-semibold text-base text-[#172D46] group-hover:text-[#294D6B] transition-colors">
              Review My Submissions
            </div>
            <ArrowRight className="w-4 h-4 text-[#C5A77B] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </div>
          <p className="text-xs text-[#5E7A91] mt-1.5 leading-relaxed">
            Review past submissions and private drafts. Inspect AI-generated narrative reconstructions and approve or request revisions.
          </p>
        </Link>

        <Link 
          to="/victim/redaction" 
          id="dash-redaction-studio" 
          className="card group hover:-translate-y-1 transition-all cursor-pointer no-underline block"
        >
          <div className="w-10 h-10 rounded-xl bg-[#FAF6EF] border border-[#C5A77B]/50 flex items-center justify-center text-[#C5A77B] mb-3 group-hover:border-[#C5A77B] transition-colors">
            <ShieldCheck className="w-5 h-5 text-[#C5A77B]" />
          </div>
          <div className="flex items-center justify-between">
            <div className="font-semibold text-base text-[#172D46] group-hover:text-[#294D6B] transition-colors">
              Redaction Studio
            </div>
            <span className="prototype-label">Client Tool</span>
          </div>
          <p className="text-xs text-[#5E7A91] mt-1.5 leading-relaxed">
            Mask sensitive personal details from documents before sharing. Runs completely inside your browser — zero files uploaded.
          </p>
        </Link>

        <Link 
          to="/victim/help" 
          id="dash-help" 
          className="card group hover:-translate-y-1 transition-all cursor-pointer no-underline block"
        >
          <div className="w-10 h-10 rounded-xl bg-[#EAF1F7] border border-[#8FAFC4]/50 flex items-center justify-center text-[#294D6B] mb-3 group-hover:border-[#C5A77B] transition-colors">
            <HelpCircle className="w-5 h-5 text-[#294D6B]" />
          </div>
          <div className="flex items-center justify-between">
            <div className="font-semibold text-base text-[#172D46] group-hover:text-[#294D6B] transition-colors">
              Help &amp; Guidance
            </div>
            <ArrowRight className="w-4 h-4 text-[#C5A77B] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </div>
          <p className="text-xs text-[#5E7A91] mt-1.5 leading-relaxed">
            Learn what happens when you submit, what AI does, what AI never does, and how your privacy and psychological safety are guarded.
          </p>
        </Link>
      </div>

      {/* Your Cases Docket Section */}
      {!loading && cases.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title mb-0">Your Associated Cases</h2>
            <span className="text-xs font-mono text-[#5E7A91]">{cases.length} case docket(s)</span>
          </div>
          <div className="flex flex-col gap-3">
            {cases.slice(0, 5).map((c) => (
              <div 
                key={c.id} 
                className="card p-4 sm:p-5 flex items-center justify-between flex-wrap gap-3 hover:border-[#C5A77B] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#EAF1F7] border border-[#8FAFC4]/40 flex items-center justify-center text-[#294D6B] shrink-0">
                    <FolderGit2 className="w-4 h-4 text-[#294D6B]" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-[#172D46]">{c.title}</div>
                    <div className="text-xs text-[#5E7A91] font-mono mt-0.5">
                      Case Ref: FF-{String(c.id).padStart(6, '0')} · {new Date(c.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <span className={`badge ${c.status === 'open' ? 'badge-blue' : c.status === 'closed' ? 'badge-muted' : 'badge-amber'}`}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && cases.length === 0 && (
        <div className="notice notice-cerulean mt-8">
          You haven't initiated a case statement yet. Navigate to <Link to="/victim/statement" className="font-semibold underline text-[#294D6B] hover:text-[#172D46]">My Statement</Link> to begin in your own time whenever you feel ready.
        </div>
      )}
    </VictimLayout>
  );
}
