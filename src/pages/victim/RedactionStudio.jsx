import { useState, useCallback } from 'react';
import VictimLayout from '../../components/victim/VictimLayout';
import { useToast } from '../../components/victim/Toast';
import { 
  ShieldCheck, 
  Copy, 
  RotateCcw, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle
} from 'lucide-react';

/**
 * REDACTION STUDIO — Client-Side Prototype
 * Authority & Dignity Design System
 */

function RedactableText({ text, redacted, onToggle }) {
  const words = text.split(/(\s+)/);

  return (
    <div className="leading-relaxed text-sm text-[#172D46] font-reading">
      {words.map((word, i) => {
        if (/^\s+$/.test(word)) return <span key={i}>{word}</span>;
        const isRedacted = redacted.has(i);
        return (
          <span
            key={i}
            onClick={() => onToggle(i)}
            title={isRedacted ? 'Click to un-redact this word' : 'Click to redact this word'}
            className={`inline-block cursor-pointer rounded-sm px-1 py-0.5 mx-0.5 transition-all text-xs select-none ${
              isRedacted
                ? 'bg-[#172D46] text-[#172D46] border border-[#172D46] shadow-2xs'
                : 'hover:bg-[#EAF1F7] text-[#172D46] border border-transparent'
            }`}
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
    <div className="leading-relaxed text-xs text-[#172D46] font-mono whitespace-pre-wrap">
      {words.map((word, i) => {
        if (/^\s+$/.test(word)) return <span key={i}>{word}</span>;
        const isRedacted = redacted.has(i);
        return isRedacted ? (
          <span
            key={i}
            className="inline-block bg-[#172D46] text-[#172D46] rounded-xs px-1 mx-0.5 select-none"
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
  const toast = useToast();
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
    toast('Redacted copy ready for copying.', 'success');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(exported || buildRedactedText());
    toast('Redacted text copied to clipboard.', 'success');
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
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="page-header-title mb-0">Redaction Studio</h1>
          <span className="prototype-label">Client-Side Tool</span>
        </div>
        <p className="page-header-subtitle">
          Obscure names, locations, or sensitive identifiable details before sharing documentation.
          Runs entirely in your local browser — your original text is never modified or sent to any server.
        </p>
      </div>

      {/* Security Note */}
      <div className="notice notice-muted mb-6">
        <div className="flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[#C5A77B] shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <strong className="text-[#172D46] font-semibold">100% Client-Side Protection:</strong>
            <span className="text-[#5E7A91] block mt-0.5">
              Paste your text below and mark words to redact. All text processing occurs strictly in your device's memory.
            </span>
          </div>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {[
          { key: 'edit', label: '1. Enter Document Text' },
          { key: 'mark', label: '2. Mark Sensitive Words' },
          { key: 'preview', label: '3. Preview & Export' },
        ].map(({ key, label }) => (
          <button
            key={key}
            id={`redaction-step-${key}`}
            type="button"
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
          <div className="form-group mb-4">
            <label htmlFor="redaction-input" className="form-label">Paste or Type Text</label>
            <textarea
              id="redaction-input"
              className="form-textarea font-mono text-xs"
              rows={11}
              placeholder="Paste the document or text you wish to redact. Nothing typed here leaves your computer."
              value={text}
              onChange={(e) => { setText(e.target.value); setRedacted(new Set()); }}
              style={{ minHeight: '220px' }}
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              id="redaction-proceed-btn"
              type="button"
              className="btn btn-primary"
              onClick={() => setMode('mark')}
              disabled={!text.trim()}
            >
              <span>Continue to Mark Words</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            {text && (
              <button 
                type="button" 
                className="btn btn-ghost btn-sm" 
                onClick={handleClear}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Mark words */}
      {mode === 'mark' && (
        <>
          <div className="card mb-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs text-[#5E7A91]">
                Click on any word to mask it. Click again to un-mask.
              </span>
              <span className="badge badge-amber font-mono">
                {redacted.size} word{redacted.size !== 1 ? 's' : ''} masked
              </span>
            </div>
            <div className="redaction-canvas">
              <RedactableText text={text} redacted={redacted} onToggle={toggleRedact} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              id="redaction-preview-btn"
              type="button"
              className="btn btn-primary"
              onClick={() => setMode('preview')}
              disabled={redacted.size === 0}
            >
              <span>Preview Redacted Document</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setMode('edit')}
            >
              ← Back to Edit Text
            </button>
          </div>
          {redacted.size === 0 && (
            <p className="form-hint mt-2">Select at least one word to mask before previewing.</p>
          )}
        </>
      )}

      {/* Step 3: Preview */}
      {mode === 'preview' && (
        <>
          <div className="grid-2 mb-4">
            <div className="card">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#8FAFC4] font-semibold block mb-2">
                ● Original (Unchanged)
              </span>
              <div className="text-xs text-[#5E7A91] leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto">
                {text}
              </div>
            </div>

            <div className="card border-[#C5A77B]/60">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#294D6B] font-semibold block mb-2">
                ◈ Redacted Preview
              </span>
              <div className="max-h-72 overflow-y-auto">
                <RedactedPreview text={text} redacted={redacted} />
              </div>
            </div>
          </div>

          <div className="card card-glow-rose mb-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-[#C5A77B]" />
              <strong className="text-sm text-[#172D46]">
                {confirmed ? 'Confirm Redacted Copy Generation' : 'Review Before Sharing'}
              </strong>
            </div>
            <p className="text-xs text-[#5E7A91] mb-4">
              {confirmed
                ? `You are about to generate a clean redacted copy with ${redacted.size} word(s) replaced with [REDACTED]. This creates a local copy only.`
                : 'Inspect the preview above carefully to ensure all identifying and sensitive details have been obscured.'}
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                id="redaction-confirm-btn"
                type="button"
                className="btn btn-rose"
                onClick={handleConfirmAndExport}
              >
                {confirmed ? 'Create Redacted Copy' : 'Confirm Redactions'}
              </button>
              {!confirmed && (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setMode('mark')}
                >
                  ← Adjust Masked Words
                </button>
              )}
            </div>
          </div>

          {exported && (
            <div className="card card-glow-cerulean">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-[#1E6B52]" />
                <span className="font-semibold text-sm text-[#172D46]">Redacted Document Ready</span>
              </div>
              <div className="redaction-canvas text-xs font-mono text-[#172D46] whitespace-pre-wrap mb-4 max-h-60 overflow-y-auto">
                {exported}
              </div>
              <div className="flex items-center gap-3">
                <button 
                  id="copy-redacted-btn" 
                  type="button" 
                  className="btn btn-primary btn-sm" 
                  onClick={handleCopy}
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Redacted Text</span>
                </button>
                <button 
                  type="button" 
                  className="btn btn-ghost btn-sm" 
                  onClick={handleClear}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Start Over</span>
                </button>
              </div>
              <p className="form-hint mt-2">
                Your original text remains completely untouched on your device. Only this sanitized copy is ready for distribution.
              </p>
            </div>
          )}
        </>
      )}
    </VictimLayout>
  );
}
