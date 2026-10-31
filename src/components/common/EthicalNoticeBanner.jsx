import React, { useState } from 'react';
import { ShieldCheck, X, Sparkles } from 'lucide-react';

export const EthicalNoticeBanner = ({ compact = false }) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  if (compact) {
    return (
      <div className="flex items-center justify-between px-3.5 py-2 bg-white/90 backdrop-blur-md border border-[#D8D2C6] text-xs text-[#172D46] rounded-xl shadow-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#294D6B] shrink-0" />
          <span className="font-sans text-xs">
            <strong className="text-[#294D6B] font-semibold">Evidentiary Integrity Standard:</strong> Algorithmic corroboration verifies electronic telemetry. The platform never evaluates human veracity or intent.
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-[#5E7A91] hover:text-[#172D46] ml-3 transition-colors"
          title="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-white/90 via-[#F8F6F1]/90 to-white/90 backdrop-blur-md border border-[#D8D2C6] p-5 my-4 shadow-[0_4px_24px_rgba(23,45,70,0.05)] group transition-all">
      {/* Radiant Ambient Accents */}
      <div className="pointer-events-none absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#C5A77B]/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-[#8FAFC4]/15 blur-3xl" />

      {/* Antique Gold to Steel Blue Top Edge Line */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#294D6B] via-[#C5A77B] to-[#294D6B]" />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {/* Steel Blue Shield with Antique Gold Border */}
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#EAF1F7] to-[#FAF6EF] border border-[#D8D2C6] flex items-center justify-center text-[#294D6B] shadow-[0_2px_10px_rgba(23,45,70,0.08)] shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5 text-[#294D6B]" />
          </div>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-serif-clean text-base font-bold tracking-wide uppercase text-[#172D46] flex items-center gap-1.5">
                <span>Evidentiary Integrity Standard &amp;</span>
                <span className="text-[#294D6B]">Legal Mandate</span>
              </span>
              <Sparkles className="w-4 h-4 text-[#C5A77B]" />
            </div>
            <p className="font-sans text-xs text-[#5E7A91] mt-1.5 leading-relaxed">
              Algorithmic claim verification evaluates objective corroboration or contradiction against independent multi-agency electronic telemetries (SCADA, CAD, CCTV, EMS).
              <span className="text-[#172D46] font-semibold"> The platform strictly prohibits inferences regarding human psychological veracity or intent to deceive.</span> Discrepancies may reflect acute trauma shock, perspective limits, or sensor clock drift.
            </p>
          </div>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="text-[#5E7A91] hover:text-[#172D46] p-1.5 rounded-lg hover:bg-white/90 border border-transparent hover:border-[#D8D2C6] transition-all shrink-0"
          aria-label="Dismiss"
          title="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
