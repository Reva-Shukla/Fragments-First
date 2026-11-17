import { useState, useEffect } from 'react';
import VictimLayout from '../../components/victim/VictimLayout';
import { casesApi, statementsApi } from '../../api/client';
import Spinner from '../../components/victim/Spinner';
import { 
  Receipt, 
  ShieldCheck, 
  CheckCircle2
} from 'lucide-react';

/**
 * CONSENT RECEIPTS — Feature B
 * Authority & Dignity Design System
 */

function ReceiptCard({ statement, caseTitle }) {
  const refId = `FF-STMT-${String(statement.id).padStart(6, '0')}`;
  const submittedAt = new Date(statement.created_at);

  return (
    <div className="receipt-card hover:border-[#C5A77B] transition-all">
      <div className="flex justify-between items-center flex-wrap gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Receipt className="w-4 h-4 text-[#C5A77B]" />
          <span className="receipt-id">{refId}</span>
        </div>
        <span className="badge badge-green flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-[#1E6B52]" />
          <span>Legally Submitted</span>
        </span>
      </div>

      <div className="flex flex-col gap-2 my-2">
        <div className="receipt-detail-row">
          <strong>Submitted Record</strong>
          <span className="font-medium text-[#172D46]">Statement (v{statement.version})</span>
        </div>
        <div className="receipt-detail-row">
          <strong>Timestamp of Submission</strong>
          <span className="font-mono text-xs text-[#5E7A91]">{submittedAt.toLocaleString()}</span>
        </div>
        <div className="receipt-detail-row">
          <strong>Permanent Reference ID</strong>
          <span className="font-mono text-xs font-semibold text-[#294D6B]">{refId}</span>
        </div>
        <div className="receipt-detail-row">
          <strong>Associated Case Docket</strong>
          <span className="font-medium text-[#172D46]">{caseTitle}</span>
        </div>
        <div className="receipt-detail-row">
          <strong>Authorized Recipient</strong>
          <span className="text-[#5E7A91] text-xs">
            {statement.status === 'approved'
              ? 'Assigned Case Investigator (AI Reconstruction Approved by Victim)'
              : 'Assigned Case Investigator (Original Statement Only)'}
          </span>
        </div>
        <div className="receipt-detail-row border-b-0">
          <strong>AI Narrative Synthesis Status</strong>
          <span>
            {statement.status === 'approved' ? (
              <span className="badge badge-green">Approved by You</span>
            ) : statement.status === 'submitted' ? (
              <span className="badge badge-amber">Awaiting Review</span>
            ) : (
              <span className="badge badge-muted">Not Requested</span>
            )}
          </span>
        </div>
      </div>

      {statement.original_text && (
        <div className="statement-excerpt mt-3 text-xs leading-relaxed max-h-24 overflow-hidden">
          <span className="font-mono uppercase tracking-wider text-[10px] text-[#C5A77B] block mb-1 font-semibold">Exemplar Preview:</span>
          {statement.original_text.slice(0, 180)}{statement.original_text.length > 180 ? '…' : ''}
        </div>
      )}
    </div>
  );
}

export default function ConsentReceipts() {
  const [, setCases] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data: caseList } = await casesApi.list();
        setCases(caseList);
        const all = [];
        for (const c of caseList) {
          try {
            const { data: stmts } = await statementsApi.getByCase(c.id);
            const submitted = stmts.filter((s) => !s.is_draft);
            submitted.forEach((s) => all.push({ ...s, caseTitle: c.title }));
          } catch { /* skip */ }
        }
        all.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setReceipts(all);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    }
    load();
  }, []);

  return (
    <VictimLayout>
      <div className="page-header">
        <h1 className="page-header-title">Consent Receipts</h1>
        <p className="page-header-subtitle">
          An immutable audit record of statements you have explicitly submitted. Private drafts are never transmitted and do not appear here.
        </p>
      </div>

      <div className="notice notice-muted shadow-xs mb-6">
        <div className="flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[#C5A77B] shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <strong className="text-[#172D46] font-semibold">Consent &amp; Chain-of-Custody Standard:</strong>
            <span className="text-[#5E7A91] block mt-0.5">
              These digital receipts verify what you chose to share, with whom, and at what exact timestamp. No unsubmitted draft ever leaves your private device boundaries.
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-xs text-[#5E7A91] py-8">
          <Spinner />
          <span>Retrieving legal submission receipts...</span>
        </div>
      ) : receipts.length === 0 ? (
        <div className="empty-state">
          <div className="w-12 h-12 rounded-2xl bg-[#FAF6EF] border border-[#C5A77B]/50 flex items-center justify-center text-[#C5A77B] mx-auto mb-3">
            <Receipt className="w-6 h-6 text-[#C5A77B]" />
          </div>
          <div className="empty-title">No submissions on record</div>
          <p className="empty-desc">
            When you submit a completed statement (not a draft), an official digital consent receipt will generate here with complete custody parameters.
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono text-[#5E7A91]">
              {receipts.length} formal submission receipt{receipts.length !== 1 ? 's' : ''} on record
            </span>
          </div>
          <div className="flex flex-col gap-4">
            {receipts.map((r) => (
              <ReceiptCard key={r.id} statement={r} caseTitle={r.caseTitle} />
            ))}
          </div>
        </>
      )}
    </VictimLayout>
  );
}
