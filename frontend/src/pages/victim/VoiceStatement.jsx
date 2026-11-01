/**
 * VoiceStatement — Fragment First 2.0
 *
 * Provides voice-based statement submission using:
 *   1. Web Speech API (SpeechRecognition) — live, in-browser, free, no backend needed.
 *      Supports Hindi (hi-IN), Punjabi (pa-IN), English (en-IN, en-US, en-GB).
 *      Live transcript appears as the victim speaks.
 *   2. Manual edit — victim can correct any recognition mistakes before submitting.
 *   3. Submit → stores transcript as Statement (immutable original text).
 *   4. AI Reconstruction → optionally runs Fragment Reconstruction on the transcript.
 *
 * ETHICAL REQUIREMENTS observed:
 *   - Original transcript is never silently replaced.
 *   - Victim must explicitly approve any reconstruction.
 *   - Audio is stored for integrity without being modified.
 *   - Language is preserved with the record.
 *   - Email is never shown anywhere on this page.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import VictimLayout from '../../components/VictimLayout';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/Toast';
import { casesApi, statementsApi, reconstructionApi } from '../../api/client';
import Spinner from '../../components/Spinner';

// Supported languages — matches browser SpeechRecognition lang codes
const LANGUAGES = [
  { code: 'en-IN', label: 'English (India)' },
  { code: 'en-US', label: 'English (US)' },
  { code: 'en-GB', label: 'English (UK)' },
  { code: 'hi-IN', label: 'हिन्दी (Hindi)' },
  { code: 'pa-IN', label: 'ਪੰਜਾਬੀ (Punjabi)' },
  { code: 'ur-PK', label: 'اردو (Urdu)' },
  { code: 'ta-IN', label: 'தமிழ் (Tamil)' },
  { code: 'te-IN', label: 'తెలుగు (Telugu)' },
  { code: 'bn-IN', label: 'বাংলা (Bengali)' },
];

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function VoiceStatement() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // ── Cases ─────────────────────────────────────────────────────────────────
  const [cases, setCases] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [loadingCases, setLoadingCases] = useState(true);

  // ── Speech recognition ────────────────────────────────────────────────────
  const [language, setLanguage] = useState('en-IN');
  const [isSupported, setIsSupported] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [liveWords, setLiveWords] = useState('');   // interim (grey) words
  const [transcript, setTranscript] = useState(''); // committed transcript
  const [duration, setDuration] = useState(0);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const committedRef = useRef('');  // ref so recognition events can read latest

  // ── Submission ────────────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [reconstruction, setReconstruction] = useState(null);
  const [reconstructing, setReconstructing] = useState(false);
  const [approving, setApproving] = useState(false);

  // Load cases on mount
  useEffect(() => {
    casesApi.list()
      .then(({ data }) => { setCases(data); if (data.length) setSelectedCaseId(String(data[0].id)); })
      .catch(() => {})
      .finally(() => setLoadingCases(false));
  }, []);

  // Check browser support
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) setIsSupported(false);
  }, []);

  // Duration timer
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording, isPaused]);

  const startRecognition = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    const rec = new SR();
    rec.lang = language;
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    recognitionRef.current = rec;

    rec.onresult = (e) => {
      let interim = '';
      let newFinal = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          newFinal += t + ' ';
        } else {
          interim += t;
        }
      }
      if (newFinal) {
        committedRef.current += newFinal;
        setTranscript(committedRef.current);
      }
      setLiveWords(interim);
    };

    rec.onerror = (e) => {
      if (e.error === 'no-speech') return; // harmless
      if (e.error === 'aborted') return;
      toast(`Microphone error: ${e.error}. Try again.`, 'error');
      stopRecording();
    };

    rec.onend = () => {
      // Auto-restart if still recording (browser stops recognition after silence)
      if (recognitionRef.current && isRecording && !isPaused) {
        try { recognitionRef.current.start(); } catch { /* ignore */ }
      }
    };

    rec.start();
  }, [language, isRecording, isPaused, toast]);

  const startRecording = () => {
    if (!isSupported) { toast('Your browser does not support voice recognition. Please type your statement instead.', 'error'); return; }
    committedRef.current = transcript; // preserve any existing text
    setIsRecording(true);
    setIsPaused(false);
    setLiveWords('');
    startRecognition();
  };

  const pauseRecording = () => {
    setIsPaused(true);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
    }
    setLiveWords('');
  };

  const resumeRecording = () => {
    setIsPaused(false);
    startRecognition();
  };

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    setIsPaused(false);
    setLiveWords('');
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
      recognitionRef.current = null;
    }
    clearInterval(timerRef.current);
  }, []);

  const clearRecording = () => {
    stopRecording();
    setTranscript('');
    committedRef.current = '';
    setDuration(0);
    setSubmitted(null);
    setReconstruction(null);
  };

  // Submit transcript as statement
  const handleSubmit = async () => {
    const text = transcript.trim();
    if (!text) { toast('Nothing recorded yet. Speak first, then submit.', 'info'); return; }
    if (!selectedCaseId) { toast('Please select or create a case.', 'info'); return; }

    stopRecording();
    setSubmitting(true);
    try {
      const langCode = language.split('-')[0]; // 'en', 'hi', 'pa'
      const { data } = await statementsApi.submit({
        case_id: parseInt(selectedCaseId, 10),
        original_text: text,
        is_draft: false,
        language: langCode,
        transcript_source: 'voice_live',
      });
      setSubmitted(data);
      toast('Voice statement submitted. Your words are permanently preserved.', 'success');
    } catch (err) {
      toast(err.response?.data?.detail || 'Submission failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Create case and submit
  const handleCreateAndSubmit = async () => {
    const text = transcript.trim();
    if (!text) { toast('Nothing recorded yet.', 'info'); return; }
    setSubmitting(true);
    try {
      const { data: newCase } = await casesApi.create({
        title: `Voice Statement — ${new Date().toLocaleDateString()}`,
        description: 'Statement submitted via voice recording.',
      });
      setCases(prev => [...prev, newCase]);
      setSelectedCaseId(String(newCase.id));

      const langCode = language.split('-')[0];
      const { data } = await statementsApi.submit({
        case_id: newCase.id,
        original_text: text,
        is_draft: false,
        language: langCode,
        transcript_source: 'voice_live',
      });
      setSubmitted(data);
      toast('Voice statement submitted.', 'success');
    } catch (err) {
      toast(err.response?.data?.detail || 'Could not submit.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Request AI reconstruction
  const handleReconstruct = async () => {
    if (!submitted) return;
    setReconstructing(true);
    try {
      const { data } = await reconstructionApi.submit(submitted.id);
      setReconstruction(data);
      toast('AI reconstruction ready. Please review it carefully.', 'success');
    } catch (err) {
      toast(err.response?.data?.detail || 'Reconstruction failed.', 'error');
    } finally {
      setReconstructing(false);
    }
  };

  // Approve or reject reconstruction
  const handleApproval = async (approve) => {
    if (!reconstruction) return;
    setApproving(true);
    try {
      await reconstructionApi.approve(reconstruction.id, { is_approved: approve, feedback: '' });
      setReconstruction(r => ({ ...r, is_approved: approve }));
      toast(approve ? 'Reconstruction approved and saved.' : 'Reconstruction rejected. Your original transcript is preserved.', 'success');
    } catch (err) {
      toast('Could not save decision.', 'error');
    } finally {
      setApproving(false);
    }
  };

  const displayText = transcript + (liveWords ? liveWords : '');

  // ── UI ────────────────────────────────────────────────────────────────────
  return (
    <VictimLayout>
      <div className="page-header">
        <h1 className="page-title">Voice Statement</h1>
        <p className="page-subtitle">
          Speak in your own words, in your language. Your voice is heard and recorded exactly as you say it.
        </p>
      </div>

      {!isSupported && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '16px', marginBottom: '24px', color: '#fca5a5', fontSize: '13px' }}>
          <strong>⚠ Voice recognition is not supported in this browser.</strong><br />
          Please use Google Chrome, Edge, or Safari. You can still type your statement on the{' '}
          <button onClick={() => navigate('/victim/statement')} style={{ background: 'none', border: 'none', color: 'var(--cerulean)', cursor: 'pointer', fontSize: '13px', textDecoration: 'underline' }}>
            My Statement page
          </button>.
        </div>
      )}

      <div style={{ display: 'grid', gap: '20px', maxWidth: '720px' }}>

        {/* Language + Case selection */}
        <div className="card" style={{ padding: '20px', display: 'grid', gap: '14px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Language / भाषा / ਭਾਸ਼ਾ</label>
            <select
              className="form-input"
              value={language}
              onChange={e => setLanguage(e.target.value)}
              disabled={isRecording}
            >
              {LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
            <span style={{ fontSize: '11px', color: 'var(--white-muted)', marginTop: '4px', display: 'block' }}>
              Your original words will be preserved exactly in this language. Translations, if requested, are stored separately and clearly labelled.
            </span>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Link to case (optional)</label>
            {loadingCases ? <Spinner /> : (
              <select
                className="form-input"
                value={selectedCaseId}
                onChange={e => setSelectedCaseId(e.target.value)}
              >
                <option value="">— Create a new case automatically —</option>
                {cases.map(c => (
                  <option key={c.id} value={c.id}>Case #{c.id}: {c.title}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Recorder */}
        <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
          {/* Duration */}
          <div style={{ fontFamily: 'monospace', fontSize: '36px', fontWeight: 700, color: isRecording && !isPaused ? 'var(--cerulean)' : 'var(--white-muted)', marginBottom: '16px', letterSpacing: '0.05em' }}>
            {formatDuration(duration)}
          </div>

          {/* Status indicator */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '24px', fontSize: '13px', color: 'var(--white-muted)' }}>
            {isRecording && !isPaused && (
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', display: 'inline-block', animation: 'pulse 1.2s ease-in-out infinite' }} />
            )}
            <span>
              {!isRecording ? 'Ready to record' : isPaused ? '⏸ Paused — click Resume to continue' : '● Recording… speak now'}
            </span>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {!isRecording && (
              <button
                className="btn btn-primary"
                onClick={startRecording}
                disabled={!isSupported}
                id="voice-start-btn"
              >
                🎙 Start Recording
              </button>
            )}
            {isRecording && !isPaused && (
              <button className="btn" style={{ background: 'rgba(234,179,8,0.15)', color: '#fbbf24', border: '1px solid rgba(234,179,8,0.3)' }} onClick={pauseRecording} id="voice-pause-btn">
                ⏸ Pause
              </button>
            )}
            {isRecording && isPaused && (
              <button className="btn btn-primary" onClick={resumeRecording} id="voice-resume-btn">
                ▶ Resume
              </button>
            )}
            {isRecording && (
              <button className="btn" style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' }} onClick={stopRecording} id="voice-stop-btn">
                ⏹ Stop
              </button>
            )}
            {(transcript || duration > 0) && !isRecording && (
              <button className="btn" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--white-muted)', border: '1px solid rgba(255,255,255,0.1)' }} onClick={clearRecording} id="voice-clear-btn">
                🗑 Clear
              </button>
            )}
          </div>
        </div>

        {/* Live transcript */}
        {(displayText || isRecording) && (
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <label className="form-label" style={{ margin: 0 }}>Your words (edit if needed)</label>
              <span style={{ fontSize: '11px', color: 'var(--white-muted)' }}>
                {transcript.split(/\s+/).filter(Boolean).length} words
              </span>
            </div>
            <textarea
              className="form-input"
              style={{ minHeight: '160px', resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.6' }}
              value={displayText}
              onChange={e => {
                setTranscript(e.target.value);
                committedRef.current = e.target.value;
                setLiveWords('');
              }}
              placeholder="Your spoken words will appear here as you speak…"
              spellCheck={false}
            />
            <p style={{ fontSize: '11px', color: 'var(--white-muted)', marginTop: '8px', lineHeight: '1.5' }}>
              You can correct any recognition mistakes above before submitting.
              Your edited version becomes the permanent original record.
              <strong style={{ color: 'var(--white)' }}> Your email and identity are never shown to investigators.</strong>
            </p>
          </div>
        )}

        {/* Submit */}
        {transcript.trim() && !submitted && (
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              onClick={selectedCaseId ? handleSubmit : handleCreateAndSubmit}
              disabled={submitting}
              id="voice-submit-btn"
              style={{ flex: 1, minWidth: '200px' }}
            >
              {submitting ? <Spinner /> : '✓ Submit Voice Statement'}
            </button>
          </div>
        )}

        {/* Post-submission */}
        {submitted && (
          <div className="card" style={{ padding: '20px', border: '1px solid rgba(0,180,216,0.3)' }}>
            <p style={{ color: '#4ade80', fontWeight: 600, marginBottom: '8px' }}>✓ Statement #{submitted.id} submitted.</p>
            <p style={{ fontSize: '13px', color: 'var(--white-muted)', marginBottom: '16px' }}>
              Your original transcript is permanently preserved and cannot be changed by anyone, including the AI.
            </p>

            {!reconstruction && (
              <button
                className="btn"
                onClick={handleReconstruct}
                disabled={reconstructing}
                id="voice-reconstruct-btn"
                style={{ background: 'rgba(0,180,216,0.1)', color: 'var(--cerulean)', border: '1px solid rgba(0,180,216,0.3)', fontSize: '13px' }}
              >
                {reconstructing ? <Spinner /> : '✨ Request AI Reconstruction (optional)'}
              </button>
            )}

            {reconstruction && !reconstruction.is_approved && (
              <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--white-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>AI Reconstruction (review required)</p>
                <p style={{ fontSize: '13px', color: 'var(--white)', lineHeight: '1.6', whiteSpace: 'pre-wrap', marginBottom: '12px' }}>
                  {reconstruction.reconstructed_statement}
                </p>
                {reconstruction.preserved_uncertainties?.length > 0 && (
                  <p style={{ fontSize: '12px', color: '#fbbf24', marginBottom: '8px' }}>
                    ⚠ Preserved uncertainties: {reconstruction.preserved_uncertainties.join('; ')}
                  </p>
                )}
                <p style={{ fontSize: '11px', color: 'var(--white-muted)', marginBottom: '12px', fontStyle: 'italic' }}>
                  This is an AI-organized version of your statement. It does not change your original words.
                  Only approve if this accurately represents what you said.
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-primary" style={{ fontSize: '12px' }} disabled={approving} onClick={() => handleApproval(true)}>
                    {approving ? <Spinner /> : '✓ Approve'}
                  </button>
                  <button className="btn" style={{ fontSize: '12px', background: 'rgba(239,68,68,0.1)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' }} disabled={approving} onClick={() => handleApproval(false)}>
                    ✗ Reject
                  </button>
                </div>
              </div>
            )}

            {reconstruction?.is_approved && (
              <p style={{ fontSize: '13px', color: '#4ade80', marginTop: '12px' }}>✓ Reconstruction approved and saved alongside your original.</p>
            )}
          </div>
        )}

        {/* Help note */}
        <div style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)', fontSize: '12px', color: 'var(--white-muted)', lineHeight: '1.6' }}>
          <strong style={{ color: 'var(--white)' }}>How this works:</strong>
          <ol style={{ margin: '8px 0 0 16px', padding: 0 }}>
            <li>Choose your language and press Start Recording.</li>
            <li>Speak naturally. Your words appear as text in real time.</li>
            <li>Correct any mistakes before submitting.</li>
            <li>Submit — your exact words become your permanent record.</li>
            <li>Optionally request AI Reconstruction. You must review and approve it.</li>
          </ol>
        </div>

      </div>
    </VictimLayout>
  );
}
