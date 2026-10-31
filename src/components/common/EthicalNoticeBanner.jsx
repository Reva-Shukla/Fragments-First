import React, { useState } from 'react';
import { ShieldAlert, X } from 'lucide-react';

export const EthicalNoticeBanner = ({ compact = false }) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  if (compact) {
    return (
      <div className="flex items-center justify-between px-3 py-1.5 bg-black/60 backdrop-blur-xl border border-sky-500/30 text-xs text-slate-300 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-sky-400 shrink-0 drop-shadow-[0_0_8px_rgba(14,165,233,0.8)]" />
          <span>
            <strong className="text-sky-300 font-medium">LEGAL FORENSIC NOTICE:</strong> AI corroborates claims against verified electronic and physical records. System never determines human truthfulness or psychological intent.
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-slate-400 hover:text-slate-200 ml-3"
          title="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#040713]/95 backdrop-blur-2xl border border-[#0d274c]/80 p-5 my-4 shadow-[0_0_35px_rgba(0,180,255,0.12),0_12px_40px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.1)] group">
      {/* Subtle Ambient Radial Backlight */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(0,210,255,0.08)_0%,transparent_60%),radial-gradient(ellipse_at_80%_50%,rgba(255,0,127,0.06)_0%,transparent_60%)]" />

      {/* Top-Left Cyberpunk HUD Bracket */}
      <div className="pointer-events-none absolute top-0 left-0 z-20">
        <svg width="100" height="80" viewBox="0 0 100 80" fill="none">
          {/* Outer cyan bracket with chamfer */}
          <path
            d="M 2 46 L 2 20 L 20 2 L 68 2"
            stroke="#00f0ff"
            strokeWidth="2.5"
            strokeLinecap="round"
            style={{ filter: 'drop-shadow(0 0 5px #00f0ff)' }}
          />
          {/* Inner diagonal notch */}
          <line
            x1="10"
            y1="22"
            x2="22"
            y2="10"
            stroke="#00f0ff"
            strokeWidth="1.5"
            strokeOpacity="0.75"
          />
        </svg>
      </div>

      {/* Bottom-Right Cyberpunk HUD Bracket & Vents */}
      <div className="pointer-events-none absolute bottom-0 right-0 z-20">
        <svg width="120" height="80" viewBox="0 0 120 80" fill="none">
          {/* Outer rose bracket with chamfer */}
          <path
            d="M 15 78 L 98 78 L 118 58 L 118 28"
            stroke="#ff007f"
            strokeWidth="2.5"
            strokeLinecap="round"
            style={{ filter: 'drop-shadow(0 0 5px #ff007f)' }}
          />
          {/* 3 Diagonal Vents / Slashes /// */}
          <line x1="72" y1="74" x2="80" y2="66" stroke="#ff007f" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="81" y1="74" x2="89" y2="66" stroke="#ff007f" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="90" y1="74" x2="98" y2="66" stroke="#ff007f" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {/* Cyber Neon Shield Icon */}
          <div className="w-12 h-12 rounded-xl bg-[#031126] border border-[#00d2ff]/80 flex items-center justify-center shadow-[0_0_16px_rgba(0,210,255,0.4),inset_0_0_12px_rgba(0,210,255,0.25)] shrink-0 mt-0.5">
            <ShieldAlert className="w-6 h-6 text-[#00d2ff]" style={{ filter: 'drop-shadow(0 0 5px rgba(0, 210, 255, 0.8))' }} />
          </div>

          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs sm:text-sm font-bold tracking-wider uppercase text-white flex items-center gap-1.5">
                <span>EVIDENTIARY INTEGRITY STANDARD &amp;</span>
                <span className="text-[#00e5ff] drop-shadow-[0_0_10px_rgba(0,229,255,0.8)]">LEGAL MANDATE</span>
              </span>
              <span className="px-2.5 py-0.5 bg-[#051329] text-sky-300 text-[10px] rounded-full border border-sky-400/40 font-mono font-semibold shadow-[0_0_10px_rgba(0,210,255,0.25)]">
                FRCP Rule 902(14)
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              Algorithmic claim verification evaluates objective corroboration or contradiction against independent multi-agency electronic telemetries (SCADA, CAD, CCTV, EMS).
              <span className="text-rose-400 font-semibold drop-shadow-[0_0_6px_rgba(255,0,127,0.3)]"> The platform strictly prohibits and rejects inferences regarding human psychological veracity or intent to deceive.</span> Discrepancies may reflect acute trauma shock, perspective limits, or sensor clock drift.
            </p>
          </div>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="text-slate-500 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.06] border border-transparent hover:border-white/20 transition-all shrink-0"
          aria-label="Dismiss"
          title="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
