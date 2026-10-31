import { useState, useRef, useCallback } from 'react';
import VictimLayout from '../../components/VictimLayout';

/**
 * REDACTION STUDIO — Client-side prototype
 *
 * Allows the victim to paste or type text and mark sections for redaction.
 * Produces a redacted preview. The original is never modified.
 * No files are uploaded to any server — this is entirely client-side.
 *
 * Clearly labeled as a prototype feature.
 */

function RedactableText({ text, redacted, onToggle }) {
  // Split text into words for individual selection
  const words = text.split(/(\s+)/);

  return (
    <div style={{ lineHeight: 2, fontSize: '15px', color: 'var(--white)' }}>
      {words.map((word, i) => {
        if (/^\s+$/.test(word)) return <span key={i}>{word}</span>;
        const isRedacted = redacted.has(i);
        return (
          <span
            key={i}
            onClick={() => onToggle(i)}
            title={isRedacted ? 'Click to un-redact' : 'Click to redact this word'}
            style={{
              display: 'inline-block',
              cursor: 'pointer',
              borderRadius: '3px',
              padding: '2px 1px',
              transition: 'all 150ms',
              background: isRedacted ? '#111' : 'transparent',
              color: isRedacted ? '#111' : 'var(--white)',
              userSelect: 'none',
              border: isRedacted ? '1px solid #333' : '1px solid transparent',
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
}

function RedactedPreview({ text, redacted }) {
  const words = text.split(/(\s+)/);
  return (
    <div style={{ lineHeight: 2, fontSize: '15px', color: 'var(--white)', fontFamily: 'monospace' }}>
      {words.map((word, i) => {
        if (/^\s+$/.test(word)) return <span key={i}>{word}</span>;
        const isRedacted = redacted.has(i);
        return isRedacted ? (
          <span
            key={i}
            style={{
              display: 'inline-block',
              background: '#1a1a1a',
              color: '#1a1a1a',
              borderRadius: '3px',
              padding: '2px 3px',
              border: '1px solid #333',
              minWidth: '2em',
            }}
            title="[REDACTED]"
          >
            {'█'.repeat(Math.min(word.length, 8))}
          </span>
        ) : (
          <span key={i}>{word}</span>
        );
      })}
    </div>
  );
}

export default function RedactionStudio() {
  const [text, setText] = useState('');
  const [redacted, setRedacted] = useState(new Set());
  const [mode, setMode] = useState('edit'); // 'edit' | 'mark' | 'preview'
  const [confirmed, setConfirmed] = useState(false);
  const [exported, setExported] = useState('');

  const toggleRedact = useCallback((wordIndex) => {
    setRedacted((prev) => {
      const next = new Set(prev);
      if (next.has(wordIndex)) next.delete(wordIndex);
      else next.add(wordIndex);
      return next;
    });
  }, []);

  const buildRedactedText = () => {
    const words = text.split(/(\s+)/);
    return words.map((word, i) => {
      if (/^\s+$/.test(word)) return word;
      return redacted.has(i) ? '[REDACTED]' : word;
    }).join('');
  };

  const handleConfirmAndExport = () => {
    if (!confirmed) { setConfirmed(true); return; }
    const result = buildRedactedText();
    setExported(result);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(exported || buildRedactedText());
    alert('Redacted text copied to clipboard.');
  };

  const handleClear = () => {
    setText('');
    setRedacted(new Set());
    setMode('edit');
    setConfirmed(false);
    setExported('');
  };

  return (
    <VictimLayout>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <h1 className="page-header-title" style={{ marginBottom: 0 }}>Redaction Studio</h1>
          <span className="prototype-label">Client-side prototype</span>
        </div>
        <p className="page-header-subtitle">
          Cover sensitive personal information before sharing a document.
          Your original text is never modified or uploaded anywhere.
        </p>
      </div>

      <div className="notice notice-muted" style={{ marginBottom: '24px' }}>
        <strong>How this works:</strong> Paste or type your text below. Switch to "Mark words" mode
        and click any word to redact it. Preview the result, then confirm and copy the redacted version.
        <br /><br />
        ⚠ This tool runs entirely in your browser. No text is sent to any server.
        The original document is never altered.
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { key: 'edit', label: '1. Enter text' },
          { key: 'mark', label: '2. Mark words' },
          { key: 'preview', label: '3. Preview' },
        ].map(({ key, label }) => (
          <button
            key={key}
            id={`redaction-step-${key}`}
            className={`btn btn-sm ${mode === key ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => { setMode(key); setConfirmed(false); setExported(''); }}
            disabled={key !== 'edit' && !text.trim()}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Step 1: Enter text */}
      {mode === 'edit' && (
        <div className="card">
          <div className="form-group">
            <label htmlFor="redaction-input" className="form-label">Paste or type your document text</label>
            <textarea
              id="redaction-input"
              className="form-textarea"
              rows={12}
              placeholder="Paste the text you want to redact here. This stays in your browser — nothing is uploaded."
              value={text}
              onChange={(e) => { setText(e.target.value); setRedacted(new Set()); }}
              style={{ minHeight: '220px', fontFamily: 'monospace', fontSize: '14px' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button
              id="redaction-proceed-btn"
              className="btn btn-primary"
              onClick={() => setMode('mark')}
              disabled={!text.trim()}
            >
              Continue to mark words →
            </button>
            {text && (
              <button className="btn btn-ghost btn-sm" onClick={handleClear}>Clear</button>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Mark words */}
      {mode === 'mark' && (
        <>
          <div className="card" style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <p style={{ fontSize: '13px', color: 'var(--white-muted)' }}>
                Click on any word to redact it. Click again to un-redact.
                <strong style={{ color: 'var(--cerulean)', marginLeft: '8px' }}>
                  {redacted.size} word{redacted.size !== 1 ? 's' : ''} marked for redaction.
                </strong>
              </p>
            </div>
            <div className="redaction-canvas">
              <RedactableText text={text} redacted={redacted} onToggle={toggleRedact} />
            </div>
          </div>
          <button
            id="redaction-preview-btn"
            className="btn btn-primary"
            onClick={() => setMode('preview')}
            disabled={redacted.size === 0}
          >
            Preview redacted version →
          </button>
          {redacted.size === 0 && (
            <p className="form-hint" style={{ marginTop: '8px' }}>Select at least one word to redact before previewing.</p>
          )}
        </>
      )}

      {/* Step 3: Preview */}
      {mode === 'preview' && (
        <>
          <div className="grid-2" style={{ marginBottom: '16px' }}>
            <div className="card">
              <p style={{ fontSize: '12px', color: 'var(--white-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
                ● Original (never modified)
              </p>
              <div style={{ lineHeight: 2, fontSize: '14px', color: 'var(--white-dim)', whiteSpace: 'pre-wrap' }}>
                {text}
              </div>
            </div>
            <div className="card" style={{ borderColor: 'rgba(0,180,216,0.2)' }}>
              <p style={{ fontSize: '12px', color: 'var(--cerulean)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
                ◈ Redacted preview
              </p>
              <RedactedPreview text={text} redacted={redacted} />
            </div>
          </div>

          <div className="card card-glow-rose" style={{ marginBottom: '16px' }}>
            <p style={{ fontWeight: 600, color: 'var(--white)', marginBottom: '8px' }}>
              {confirmed ? '⚠ Are you sure?' : '⚠ Confirm before sharing'}
            </p>
            <p style={{ fontSize: '13px', color: 'var(--white-muted)', marginBottom: '16px' }}>
              {confirmed
                ? `You are about to create a redacted copy with ${redacted.size} word(s) removed. This action only copies — it does not upload or share anything.`
                : 'Review the redacted preview above. Once you confirm, the redacted version will be ready to copy.'}
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                id="redaction-confirm-btn"
                className="btn btn-rose"
                onClick={handleConfirmAndExport}
              >
                {confirmed ? 'Yes, create redacted copy' : 'Confirm redaction'}
              </button>
              {!confirmed && (
                <button
                  className="btn btn-ghost"
                  onClick={() => setMode('mark')}
                >
                  ← Go back and adjust
                </button>
              )}
            </div>
          </div>

          {exported && (
            <div className="card card-glow-cerulean">
              <p style={{ fontWeight: 600, color: 'var(--cerulean)', marginBottom: '12px' }}>Redacted copy ready</p>
              <div className="redaction-canvas" style={{ marginBottom: '16px', fontFamily: 'monospace', fontSize: '14px', lineHeight: 1.8, color: 'var(--white-dim)', whiteSpace: 'pre-wrap' }}>
                {exported}
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button id="copy-redacted-btn" className="btn btn-primary btn-sm" onClick={handleCopy}>
                  Copy redacted text
                </button>
                <button className="btn btn-ghost btn-sm" onClick={handleClear}>
                  Start over
                </button>
              </div>
              <p className="form-hint" style={{ marginTop: '12px' }}>
                The original text remains unchanged. Only this redacted copy is ready to share.
              </p>
            </div>
          )}
        </>
      )}
    </VictimLayout>
  );
}
