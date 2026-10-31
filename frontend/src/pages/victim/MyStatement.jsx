import { useState, useEffect } from 'react';
import VictimLayout from '../../components/VictimLayout';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/Toast';
import { casesApi, statementsApi, reconstructionApi } from '../../api/client';
import Spinner from '../../components/Spinner';

const CASE_DESCRIPTION = 'Statement submitted via Fragment First';

export default function MyStatement() {
  const { user } = useAuth();
  const toast = useToast();

  const [cases, setCases] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [text, setText] = useState('');
  const [loadingCases, setLoadingCases] = useState(true);
  const [savingDraft, setSavingDraft] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [reconstruction, setReconstruction] = useState(null);
  const [rerunning, setRerunning] = useState(false);
  const [approving, setApproving] = useState(false);
  const [correctionText, setCorrectionText] = useState('');
  const [creatingCase, setCreatingCase] = useState(false);

  useEffect(() => {
    casesApi.list()
      .then(({ data }) => setCases(data))
      .catch(() => {})
      .finally(() => setLoadingCases(false));
  }, []);

  async function ensureCase() {
    if (selectedCaseId) return parseInt(selectedCaseId, 10);
    // Create a default case for the victim
    setCreatingCase(true);
    try {
      const { data } = await casesApi.create({
        title: `My Statement — ${new Date().toLocaleDateString()}`,
        description: CASE_DESCRIPTION,
      });
      setCases((prev) => [...prev, data]);
      setSelectedCaseId(String(data.id));
      return data.id;
    } finally {
      setCreatingCase(false);
    }
  }

  const handleSaveDraft = async () => {
    if (!text.trim()) { toast('Please write something first.', 'info'); return; }
    setSavingDraft(true);
    try {
      const caseId = await ensureCase();
      await statementsApi.submit({ case_id: caseId, original_text: text.trim(), is_draft: true });
      toast('Draft saved. It is private and only visible to you.', 'success');
    } catch (err) {
      toast(err.response?.data?.detail || 'Could not save draft.', 'error');
    } finally {
      setSavingDraft(false);
    }
  };

  const handleSubmit = async () => {
    if (!text.trim()) { toast('Please write something first.', 'info'); return; }
    setSubmitting(true);
    try {
      const caseId = await ensureCase();
      const { data } = await statementsApi.submit({
        case_id: caseId,
        original_text: text.trim(),
        is_draft: false,
      });
      setSubmitted(data);
      toast('Statement submitted. Your original words are permanently preserved.', 'success');
    } catch (err) {
      toast(err.response?.data?.detail || 'Submission failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestReconstruction = async () => {
    if (!submitted) return;
    setRerunning(true);
    try {
      const { data } = await reconstructionApi.submit(submitted.id);
      setReconstruction(data);
      toast('AI reconstruction generated. Please review it below.', 'info');
    } catch (err) {
      toast(err.response?.data?.detail || 'Reconstruction failed.', 'error');
    } finally {
      setRerunning(false);
    }
  };

  const handleApprove = async (isApproved) => {
    if (!reconstruction) return;
    setApproving(true);
    try {
      const { data } = await reconstructionApi.approve(reconstruction.id, {
        is_approved: isApproved,
        feedback: isApproved ? 'Approved by victim.' : 'Rejected by victim.',
      });
      setReconstruction(data);
      toast(
        isApproved
          ? 'Reconstruction approved. Thank you for reviewing.'
          : 'Reconstruction rejected. Your original statement remains unchanged.',
        'success',
      );
    } catch (err) {
      toast(err.response?.data?.detail || 'Could not record approval.', 'error');
    } finally {
      setApproving(false);
    }
  };

  const handleRequestCorrection = async () => {
    if (!reconstruction || !correctionText.trim()) { toast('Please describe the correction needed.', 'info'); return; }
    setRerunning(true);
    try {
      const { data } = await reconstructionApi.correct(reconstruction.id, correctionText.trim());
      setReconstruction(data);
      setCorrectionText('');
      toast('A revised reconstruction has been generated. Please review it above.', 'info');
    } catch (err) {
      toast(err.response?.data?.detail || 'Correction request failed.', 'error');
    } finally {
      setRerunning(false);
    }
  };

  // Reset to write a new statement
  const handleNewStatement = () => {
    setText('');
    setSubmitted(null);
    setReconstruction(null);
    setCorrectionText('');
  };

  return (
    <VictimLayout>
      <div className="page-header">
        <h1 className="page-header-title">My Statement</h1>
        <p className="page-header-subtitle">
          Write what happened — fragments, incomplete memories, or partial sentences are all valid.
          You can save a private draft anytime and come back later.
        </p>
      </div>

      {/* Writing area */}
      {!submitted && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div style={{ marginBottom: '20px' }}>
            <div className="notice notice-muted" style={{ marginBottom: '16px' }}>
              💡 Write in your own words. There is no wrong way to start. Fragmented thoughts, partial sentences,
              and approximate times are all preserved exactly as you write them.
            </div>
          </div>

          {/* Case selector */}
          {!loadingCases && cases.length > 0 && (
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label htmlFor="case-select" className="form-label">Link to case (optional)</label>
              <select
                id="case-select"
                className="form-select"
                value={selectedCaseId}
                onChange={(e) => setSelectedCaseId(e.target.value)}
              >
                <option value="">— Create a new case automatically —</option>
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="statement-text" className="form-label">Your statement</label>
            <textarea
              id="statement-text"
              className="form-textarea"
              rows={10}
              placeholder="Write anything here. You might start with what you remember first, even if it's just fragments. There is no pressure to be complete or perfectly ordered."
              value={text}
              onChange={(e) => setText(e.target.value)}
              style={{ minHeight: '200px' }}
            />
            <span className="form-hint">
              {text.length > 0 ? `${text.length} characters` : 'Your writing stays here until you choose to save or submit.'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
            <button
              id="save-draft-btn"
              className="btn btn-ghost"
              onClick={handleSaveDraft}
              disabled={savingDraft || submitting || creatingCase}
            >
              {savingDraft || creatingCase ? <Spinner /> : '💾'} Save draft privately
            </button>

            <button
              id="submit-statement-btn"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={submitting || savingDraft || creatingCase}
            >
              {submitting ? <Spinner /> : '→'} Submit statement
            </button>
          </div>

          <p className="form-hint" style={{ marginTop: '12px' }}>
            Saving a draft does not share your statement with anyone.
            Submitting makes it available to authorised personnel assigned to your case.
          </p>
        </div>
      )}

      {/* Submitted state */}
      {submitted && (
        <>
          <div className="card card-glow-cerulean" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
              <div>
                <div style={{ fontWeight: 600, marginBottom: '4px', color: 'var(--white)' }}>Statement submitted ✓</div>
                <div style={{ fontSize: '12px', color: 'var(--white-muted)' }}>
                  Ref: FF-STMT-{String(submitted.id).padStart(6, '0')} · {new Date(submitted.created_at).toLocaleString()}
                </div>
              </div>
              <span className="badge badge-green">Submitted</span>
            </div>
            <div className="recon-panel" style={{ background: 'var(--black)', border: '1px solid var(--border)' }}>
              <p style={{ fontSize: '12px', color: 'var(--white-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Your original words</p>
              <p className="recon-text">{submitted.original_text}</p>
            </div>
            <p className="form-hint" style={{ marginTop: '12px' }}>
              Your original statement is permanently preserved exactly as written above.
              It will never be overwritten or altered.
            </p>
          </div>

          {/* AI Reconstruction section */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--white)' }}>AI Reconstruction</div>
            <p style={{ fontSize: '14px', color: 'var(--white-muted)', marginBottom: '16px' }}>
              Fragment First can generate a clearer, readable version of your statement using AI.
              The AI will not invent information or remove uncertainties — it only helps structure
              what you already wrote. <strong style={{ color: 'var(--white-dim)' }}>Your approval is required before this is considered final.</strong>
            </p>

            {!reconstruction && (
              <button
                id="request-reconstruction-btn"
                className="btn btn-ghost"
                onClick={handleRequestReconstruction}
                disabled={rerunning}
              >
                {rerunning ? <Spinner /> : '🧠'} Generate AI reconstruction
              </button>
            )}

            {rerunning && !reconstruction && (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--white-muted)', marginTop: '12px' }}>
                <Spinner /> Analysing your statement…
              </div>
            )}

            {reconstruction && (
              <div>
                <div className="recon-panel">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <p style={{ fontSize: '12px', color: 'var(--cerulean)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>AI reconstruction — awaiting your review</p>
                    {reconstruction.is_approved === true && <span className="badge badge-green">Approved by you</span>}
                    {reconstruction.is_approved === false && reconstruction.victim_feedback && <span className="badge badge-rose">Rejected</span>}
                  </div>
                  <p className="recon-text">{reconstruction.reconstructed_statement}</p>
                </div>

                {/* Preserved uncertainties */}
                {reconstruction.preserved_uncertainties?.length > 0 && (
                  <div className="notice notice-muted" style={{ marginTop: '12px' }}>
                    <strong>Preserved uncertainties:</strong>
                    <ul style={{ marginTop: '6px', paddingLeft: '16px' }}>
                      {reconstruction.preserved_uncertainties.map((u, i) => <li key={i}>{u}</li>)}
                    </ul>
                  </div>
                )}

                {/* Unclear portions */}
                {reconstruction.unclear_portions?.length > 0 && (
                  <div className="notice notice-cerulean" style={{ marginTop: '8px' }}>
                    <strong>Unclear portions (marked for review):</strong>
                    <ul style={{ marginTop: '6px', paddingLeft: '16px' }}>
                      {reconstruction.unclear_portions.map((u, i) => <li key={i}>{u}</li>)}
                    </ul>
                  </div>
                )}

                {/* Approval buttons — only if not yet approved/rejected */}
                {reconstruction.is_approved === null || reconstruction.is_approved === undefined ? (
                  <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
                    <button
                      id="approve-reconstruction-btn"
                      className="btn btn-primary"
                      onClick={() => handleApprove(true)}
                      disabled={approving}
                    >
                      {approving ? <Spinner /> : '✓'} Approve this reconstruction
                    </button>
                    <button
                      id="reject-reconstruction-btn"
                      className="btn btn-ghost"
                      onClick={() => handleApprove(false)}
                      disabled={approving}
                    >
                      {approving ? <Spinner /> : '✕'} Reject
                    </button>
                  </div>
                ) : reconstruction.is_approved ? (
                  <div className="notice notice-cerulean" style={{ marginTop: '12px' }}>
                    ✓ You have approved this reconstruction.
                  </div>
                ) : (
                  <div className="notice notice-muted" style={{ marginTop: '12px' }}>
                    You have rejected this reconstruction. You may request a revised version below.
                  </div>
                )}

                {/* Request correction */}
                <div style={{ marginTop: '20px' }}>
                  <div className="form-group">
                    <label htmlFor="correction-text" className="form-label">Request a correction</label>
                    <textarea
                      id="correction-text"
                      className="form-textarea"
                      rows={3}
                      placeholder="Describe what is incorrect or needs to be adjusted..."
                      value={correctionText}
                      onChange={(e) => setCorrectionText(e.target.value)}
                    />
                  </div>
                  <button
                    id="request-correction-btn"
                    className="btn btn-ghost btn-sm"
                    style={{ marginTop: '8px' }}
                    onClick={handleRequestCorrection}
                    disabled={rerunning}
                  >
                    {rerunning ? <Spinner /> : '↩'} Request revised reconstruction
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            id="new-statement-btn"
            className="btn btn-ghost"
            onClick={handleNewStatement}
          >
            + Write another statement
          </button>
        </>
      )}
    </VictimLayout>
  );
}
