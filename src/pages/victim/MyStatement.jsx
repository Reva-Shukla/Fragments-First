import { useState, useEffect } from 'react';
import VictimLayout from '../../components/victim/VictimLayout';
import { useToast } from '../../components/victim/Toast';
import { casesApi, statementsApi, reconstructionApi } from '../../api/client';
import Spinner from '../../components/victim/Spinner';
import { 
  Save, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Plus, 
  AlertCircle
} from 'lucide-react';

const CASE_DESCRIPTION = 'Statement submitted via Fragment First';

export default function MyStatement() {
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
      toast('Draft saved privately. It is visible only to you.', 'success');
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

  const handleNewStatement = () => {
    setText('');
    setSubmitted(null);
    setReconstruction(null);
    setCorrectionText('');
  };

  return (
    <VictimLayout>
      {/* Header */}
      <div className="page-header">
        <h1 className="page-header-title">My Statement</h1>
        <p className="page-header-subtitle">
          Share what happened in your own words — fragments, incomplete memories, or partial thoughts are all valid.
          Save a private draft anytime, and return whenever you feel comfortable.
        </p>
      </div>

      {/* Writing Area */}
      {!submitted && (
        <div className="card card-glow-rose mb-6">
          <div className="notice notice-muted mb-5">
            <div className="flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-[#C5A77B] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#172D46] font-semibold">Write at your own pace:</strong>
                <span className="text-xs text-[#5E7A91] block mt-0.5 leading-relaxed">
                  There is no wrong way to begin. Approximate times, disjointed fragments, and raw memories are all respected and preserved verbatim without judgment.
                </span>
              </div>
            </div>
          </div>

          {/* Case Selector */}
          {!loadingCases && cases.length > 0 && (
            <div className="form-group mb-5">
              <label htmlFor="case-select" className="form-label">Link to Case Docket (Optional)</label>
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

          {/* Text Area */}
          <div className="form-group">
            <label htmlFor="statement-text" className="form-label">Your Statement</label>
            <textarea
              id="statement-text"
              className="form-textarea"
              rows={11}
              placeholder="Write anything here. You might start with whatever detail comes to mind first. There is no pressure for chronological order or completeness."
              value={text}
              onChange={(e) => setText(e.target.value)}
              style={{ minHeight: '220px', lineHeight: 1.7 }}
            />
            <div className="flex items-center justify-between mt-1.5">
              <span className="form-hint">
                {text.length > 0 ? `${text.length} characters written` : 'Your writing remains strictly on this page until you choose to save or submit.'}
              </span>
              <span className="text-[11px] font-mono text-[#8FAFC4]">Confidential Input</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-6 flex-wrap">
            <button
              id="save-draft-btn"
              type="button"
              className="btn btn-ghost"
              onClick={handleSaveDraft}
              disabled={savingDraft || submitting || creatingCase}
            >
              {savingDraft || creatingCase ? <Spinner /> : <Save className="w-4 h-4 text-[#8FAFC4]" />}
              <span>Save Draft Privately</span>
            </button>

            <button
              id="submit-statement-btn"
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={submitting || savingDraft || creatingCase}
            >
              {submitting ? <Spinner /> : <Send className="w-4 h-4 text-[#FCFBF9]" />}
              <span>Submit Statement</span>
            </button>
          </div>

          <p className="form-hint mt-3">
            Saving a draft does not share your statement with anyone. Submitting associates it with your case for authorized investigator review.
          </p>
        </div>
      )}

      {/* Submitted State */}
      {submitted && (
        <>
          <div className="card card-glow-cerulean mb-6">
            <div className="flex justify-between items-start flex-wrap gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#1E6B52]" />
                  <span className="font-semibold text-base text-[#172D46]">Statement Submitted</span>
                </div>
                <div className="text-xs text-[#5E7A91] font-mono mt-1">
                  Docket Ref: FF-STMT-{String(submitted.id).padStart(6, '0')} · {new Date(submitted.created_at).toLocaleString()}
                </div>
              </div>
              <span className="badge badge-green">Submitted</span>
            </div>

            <div className="p-4 rounded-xl bg-[#F8F6F1] border border-[#D8D2C6]/80">
              <p className="text-xs font-mono uppercase tracking-wider text-[#C5A77B] mb-2 font-semibold">Your Original Words (Verbatim)</p>
              <p className="recon-text whitespace-pre-wrap">{submitted.original_text}</p>
            </div>
            <p className="form-hint mt-3">
              Your original statement is permanently preserved exactly as entered. It will never be edited or overwritten.
            </p>
          </div>

          {/* AI Reconstruction Section */}
          <div className="card mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-[#C5A77B]" />
              <h2 className="font-serif-clean text-lg font-bold text-[#172D46]">AI Narrative Reconstruction</h2>
            </div>
            <p className="text-xs text-[#5E7A91] leading-relaxed mb-4">
              Fragment First can assist investigators by synthesizing fragmented accounts into a coherent chronological structure.
              The AI will preserve all uncertainties and missing details. <strong className="text-[#172D46]">Your explicit review and approval is required before this reconstruction is considered final.</strong>
            </p>

            {!reconstruction && (
              <button
                id="request-reconstruction-btn"
                type="button"
                className="btn btn-ghost"
                onClick={handleRequestReconstruction}
                disabled={rerunning}
              >
                {rerunning ? <Spinner /> : <Sparkles className="w-4 h-4 text-[#C5A77B]" />}
                <span>Generate AI Narrative Reconstruction</span>
              </button>
            )}

            {rerunning && !reconstruction && (
              <div className="flex items-center gap-3 text-xs text-[#5E7A91] mt-3">
                <Spinner />
                <span>Synthesizing narrative while preserving all uncertainties...</span>
              </div>
            )}

            {reconstruction && (
              <div>
                <div className="recon-panel bg-[#FCFBF9] border border-[#D8D2C6]">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#294D6B]">
                      AI Reconstruction — Awaiting Your Review
                    </span>
                    {reconstruction.is_approved === true && <span className="badge badge-green">Approved by You</span>}
                    {reconstruction.is_approved === false && reconstruction.victim_feedback && <span className="badge badge-rose">Correction Requested</span>}
                  </div>
                  <p className="recon-text text-sm leading-relaxed">{reconstruction.reconstructed_statement}</p>
                </div>

                {/* Preserved Uncertainties */}
                {reconstruction.preserved_uncertainties?.length > 0 && (
                  <div className="notice notice-muted mt-3">
                    <strong className="text-xs text-[#172D46] uppercase font-mono tracking-wider">Preserved Uncertainties &amp; Hesitations:</strong>
                    <ul className="text-xs text-[#5E7A91] mt-1.5 pl-4 list-disc space-y-0.5">
                      {reconstruction.preserved_uncertainties.map((u, i) => <li key={i}>{u}</li>)}
                    </ul>
                  </div>
                )}

                {/* Unclear Portions */}
                {reconstruction.unclear_portions?.length > 0 && (
                  <div className="notice notice-cerulean mt-2">
                    <strong className="text-xs uppercase font-mono tracking-wider">Unclear Portions (Marked for Your Clarification):</strong>
                    <ul className="text-xs mt-1.5 pl-4 list-disc space-y-0.5">
                      {reconstruction.unclear_portions.map((u, i) => <li key={i}>{u}</li>)}
                    </ul>
                  </div>
                )}

                {/* Approval Buttons */}
                {reconstruction.is_approved === null || reconstruction.is_approved === undefined ? (
                  <div className="flex items-center gap-3 mt-4 flex-wrap">
                    <button
                      id="approve-reconstruction-btn"
                      type="button"
                      className="btn btn-primary"
                      onClick={() => handleApprove(true)}
                      disabled={approving}
                    >
                      {approving ? <Spinner /> : <CheckCircle2 className="w-4 h-4" />}
                      <span>Approve This Reconstruction</span>
                    </button>
                    <button
                      id="reject-reconstruction-btn"
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => handleApprove(false)}
                      disabled={approving}
                    >
                      {approving ? <Spinner /> : <XCircle className="w-4 h-4 text-[#9B2C2C]" />}
                      <span>Reject</span>
                    </button>
                  </div>
                ) : reconstruction.is_approved ? (
                  <div className="notice notice-cerulean mt-3">
                    <CheckCircle2 className="w-4 h-4 text-[#1E6B52] inline-block mr-1.5" />
                    <span>You have approved this reconstruction. It has been marked as verified by you.</span>
                  </div>
                ) : (
                  <div className="notice notice-rose mt-3">
                    <AlertCircle className="w-4 h-4 text-[#9B2C2C] inline-block mr-1.5" />
                    <span>You rejected this reconstruction. You can request a revised version below.</span>
                  </div>
                )}

                {/* Request Correction */}
                <div className="mt-5 pt-4 border-t border-[#D8D2C6]/60">
                  <div className="form-group mb-2">
                    <label htmlFor="correction-text" className="form-label">Request an AI Revision or Correction</label>
                    <textarea
                      id="correction-text"
                      className="form-textarea"
                      rows={3}
                      placeholder="Explain what part was misunderstood or requires adjustment..."
                      value={correctionText}
                      onChange={(e) => setCorrectionText(e.target.value)}
                    />
                  </div>
                  <button
                    id="request-correction-btn"
                    type="button"
                    className="btn btn-ghost btn-sm mt-2"
                    onClick={handleRequestCorrection}
                    disabled={rerunning}
                  >
                    {rerunning ? <Spinner /> : <RotateCcw className="w-3.5 h-3.5" />}
                    <span>Request Revised Reconstruction</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            id="new-statement-btn"
            type="button"
            className="btn btn-ghost"
            onClick={handleNewStatement}
          >
            <Plus className="w-4 h-4" />
            <span>Write Another Statement</span>
          </button>
        </>
      )}
    </VictimLayout>
  );
}
