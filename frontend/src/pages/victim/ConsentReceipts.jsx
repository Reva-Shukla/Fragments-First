import { useState, useEffect } from 'react';
import VictimLayout from '../../components/VictimLayout';
import { casesApi, statementsApi } from '../../api/client';
import Spinner from '../../components/Spinner';

/**
 * CONSENT RECEIPTS — Feature B
 *
 * Shows a clear record of every submitted statement.
 * Data is derived from actual backend submissions (non-draft statements).
 * Drafts are explicitly excluded and labeled as private.
 */

function ReceiptCard({ statement, caseTitle }) {
  const refId = `FF-STMT-${String(statement.id).padStart(6, '0')}`;
  const submittedAt = new Date(statement.created_at);

  return (
    <div className="receipt-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <span className="receipt-id">{refId}</span>
        <span className="badge badge-green">Submitted</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
        <div className="receipt-detail-row">
          <strong>What was submitted</strong>
          <span style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Statement (v{statement.version})
          </span>
        </div>
        <div className="receipt-detail-row">
          <strong>When submitted</strong>
          <span>{submittedAt.toLocaleString()}</span>
        </div>
        <div className="receipt-detail-row">
          <strong>Reference ID</strong>
          <span style={{ fontFamily: 'monospace', color: 'var(--cerulean)' }}>{refId}</span>
        </div>
        <div className="receipt-detail-row">
          <strong>Case</strong>
          <span style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{caseTitle}</span>
        </div>
        <div className="receipt-detail-row">
          <strong>Authorised recipient</strong>
          <span style={{ color: 'var(--white-muted)' }}>
            {statement.status === 'approved'
              ? 'Case investigator (AI reconstruction approved by you)'
              : 'Case investigator (original statement)'}
          </span>
        </div>
        <div className="receipt-detail-row" style={{ borderBottom: 'none' }}>
          <strong>AI reconstruction status</strong>
          <span>
            {statement.status === 'approved'
              ? <span className="badge badge-green">Approved by you</span>
              : statement.status === 'submitted'
              ? <span className="badge badge-amber">Awaiting your review</span>
              : <span className="badge badge-muted">Not yet requested</span>}
          </span>
        </div>
      </div>

      <div className="statement-excerpt" style={{ marginTop: '12px', fontSize: '13px', maxHeight: '80px', overflow: 'hidden' }}>
        <em style={{ color: 'var(--white-muted)' }}>Preview: </em>
        {statement.original_text?.slice(0, 180)}{statement.original_text?.length > 180 ? '…' : ''}
      </div>
    </div>
  );
}

export default function ConsentReceipts() {
  const [cases, setCases] = useState([]);
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
          A record of every statement you have explicitly submitted. Drafts are private
          and do not appear here.
        </p>
      </div>

      <div className="notice notice-muted" style={{ marginBottom: '24px' }}>
        <strong>These receipts record only what you explicitly submitted.</strong> Private drafts
        are not included here and are not accessible to any authority. Only submitted statements
        are associated with authorised recipients.
      </div>

      {loading ? (
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--white-muted)' }}>
          <Spinner /> Loading your submission receipts…
        </div>
      ) : receipts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🧾</div>
          <div className="empty-title">No submissions yet</div>
          <p className="empty-desc">
            When you submit a statement (not a draft), a consent receipt will appear here
            with the submission details, timestamp, and reference ID.
          </p>
        </div>
      ) : (
        <>
          <p style={{ fontSize: '13px', color: 'var(--white-muted)', marginBottom: '20px' }}>
            {receipts.length} submission{receipts.length !== 1 ? 's' : ''} on record.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {receipts.map((r) => (
              <ReceiptCard key={r.id} statement={r} caseTitle={r.caseTitle} />
            ))}
          </div>
        </>
      )}
    </VictimLayout>
  );
}
