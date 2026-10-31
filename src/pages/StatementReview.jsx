import React, { useState } from 'react';
import { 
  FileText, 
  GitCompare, 
  CheckCircle2, 
  History, 
  AlertCircle, 
  HelpCircle, 
  ShieldCheck, 
  ArrowRight, 
  Clock, 
  Sparkles,
  Info,
  UserCheck,
  Hash
} from 'lucide-react';
import { useCase } from '../context/CaseContext';
import { EthicalNoticeBanner } from '../components/common/EthicalNoticeBanner';

export const StatementReview = () => {
  const { currentCase } = useCase();
  const { statements } = currentCase;

  const [activeTab, setActiveTab] = useState('diff');
  const [selectedPhrase, setSelectedPhrase] = useState(statements.phraseAnalysis[0]);
  const [filterType, setFilterType] = useState('all');

  const filteredPhrases = filterType === 'all' 
    ? statements.phraseAnalysis 
    : statements.phraseAnalysis.filter(p => p.type === filterType);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Victim Statement Review & Reconstruction</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-sky-950/40 border border-sky-400/40 text-sky-300 font-mono text-[10px] shadow-[0_0_10px_rgba(14,165,233,0.3)]">
              VERIFIED RECORD
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Case Ref: <span className="text-sky-300 font-mono font-medium">{currentCase.id}</span> • Subject: <span className="text-slate-100">{currentCase.victimPseudonym}</span> ({currentCase.victimId})
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 p-1.5 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
          <button
            onClick={() => setActiveTab('diff')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'diff'
                ? 'bg-sky-500/20 text-sky-200 border border-sky-400/50 shadow-[0_0_15px_rgba(14,165,233,0.3)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Side-by-Side Comparison</span>
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'approved'
                ? 'bg-rose-500/20 text-rose-200 border border-rose-500/50 shadow-[0_0_15px_rgba(255,0,127,0.3)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Victim-Approved Version</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'history'
                ? 'bg-white/[0.08] text-white border border-white/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Version History</span>
          </button>
        </div>
      </div>

      <EthicalNoticeBanner />

      {/* Main Tab Content */}
      {activeTab === 'diff' && (
        <div className="space-y-6">
          {/* Side-by-Side Liquid Glass Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Original Raw Statement */}
            <div className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.6)] flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-rose-500/30 to-transparent" />

              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-rose-400 drop-shadow-[0_0_6px_rgba(255,0,127,0.6)]" />
                    <h2 className="text-sm font-semibold text-slate-100">Original Intake Statement</h2>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-rose-950/40 text-rose-300 border border-rose-500/40 shadow-[0_0_8px_rgba(255,0,127,0.25)]">
                    RAW AUDIO TRANSCRIPT
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 text-xs text-slate-300 leading-relaxed font-sans min-h-[220px]">
                  {statements.raw}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-slate-400 flex items-center justify-between font-mono">
                <span>Ingest: Emergency 911 Voice Intake</span>
                <span className="text-slate-400">Recorded: 2026-10-24 22:15 UTC</span>
              </div>
            </div>

            {/* Right: AI Chronological Reconstruction */}
            <div className="bg-black/60 backdrop-blur-2xl border border-sky-400/40 rounded-2xl p-6 shadow-[0_8px_32px_0_rgba(14,165,233,0.15)] flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-sky-400 via-white/30 to-sky-400" />

              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-sky-400 drop-shadow-[0_0_8px_rgba(14,165,233,0.8)]" />
                    <h2 className="text-sm font-semibold text-white">AI Reconstructed Chronological Statement</h2>
                  </div>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-md bg-sky-950/50 text-sky-300 border border-sky-400/50 shadow-[0_0_10px_rgba(14,165,233,0.3)]">
                    CORROBORATED CHRONOLOGY
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-sky-950/15 border border-sky-400/30 text-xs text-slate-100 leading-relaxed font-sans min-h-[220px]">
                  {statements.aiReconstructed}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-sky-300 flex items-center justify-between font-mono">
                <span>Multi-Feed Synced: SCADA + CAD + CCTV-14</span>
                <span className="text-slate-400">Confidence: 94.2%</span>
              </div>
            </div>
          </div>

          {/* Granular Phrase Discrepancy & Gap Analysis */}
          <div className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.6)] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-sky-400/30 via-rose-400/30 to-transparent" />

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Evidentiary Phrase Discrepancy & Gap Analysis</h3>
                <p className="text-xs text-slate-400">
                  Granular tracking of syntax modifications, ambiguous terminology, and missing investigatory elements
                </p>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 text-xs">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1 rounded-xl text-[11px] font-mono transition-colors ${
                    filterType === 'all'
                      ? 'bg-white/[0.1] text-white border border-white/20'
                      : 'bg-black/40 text-slate-400 hover:text-slate-200 border border-white/10'
                  }`}
                >
                  All ({statements.phraseAnalysis.length})
                </button>
                <button
                  onClick={() => setFilterType('change')}
                  className={`px-3 py-1 rounded-xl text-[11px] font-mono transition-all ${
                    filterType === 'change'
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-400/50 shadow-[0_0_10px_rgba(14,165,233,0.3)]'
                      : 'bg-black/40 text-slate-400 hover:text-slate-200 border border-white/10'
                  }`}
                >
                  Changes
                </button>
                <button
                  onClick={() => setFilterType('unclear')}
                  className={`px-3 py-1 rounded-xl text-[11px] font-mono transition-all ${
                    filterType === 'unclear'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-400/50 shadow-[0_0_10px_rgba(255,0,127,0.3)]'
                      : 'bg-black/40 text-slate-400 hover:text-slate-200 border border-white/10'
                  }`}
                >
                  Unclear Phrases
                </button>
                <button
                  onClick={() => setFilterType('missing')}
                  className={`px-3 py-1 rounded-xl text-[11px] font-mono transition-all ${
                    filterType === 'missing'
                      ? 'bg-rose-500/30 text-rose-200 border border-rose-500/70 shadow-[0_0_14px_rgba(255,0,127,0.4)] font-bold'
                      : 'bg-black/40 text-slate-400 hover:text-slate-200 border border-white/10'
                  }`}
                >
                  Missing Info
                </button>
              </div>
            </div>

            {/* Phrase items list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredPhrases.map((phrase, idx) => {
                const isSelected = selectedPhrase?.original === phrase.original;

                const badgeConfig = {
                  change: { label: 'SYNTAX / CHRONO CHANGE', color: 'border-sky-400/40 bg-sky-950/40 text-sky-300 shadow-[0_0_8px_rgba(14,165,233,0.25)]' },
                  unclear: { label: 'UNCLEAR PHRASE', color: 'border-rose-400/40 bg-rose-950/40 text-rose-300 shadow-[0_0_8px_rgba(255,0,127,0.25)]' },
                  missing: { label: 'MISSING INFORMATION', color: 'border-rose-500/50 bg-rose-950/50 text-rose-300 shadow-[0_0_10px_rgba(255,0,127,0.3)]' }
                }[phrase.type] || { label: 'ANALYSIS', color: 'border-white/10 bg-white/[0.04] text-slate-300' };

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedPhrase(phrase)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-sky-400 bg-white/[0.05] shadow-[0_0_20px_rgba(14,165,233,0.2)]'
                        : 'border-white/10 bg-black/40 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded-md border ${badgeConfig.color}`}>
                        {badgeConfig.label}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{phrase.status}</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 block">ORIGINAL PHRASE</span>
                        <span className="text-rose-300/90 font-medium italic">"{phrase.original}"</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 block">RECONSTRUCTED REFERENCE</span>
                        <span className="text-sky-300 font-medium">"{phrase.reconstructed}"</span>
                      </div>
                      <div className="pt-2 border-t border-white/10">
                        <span className="text-[10px] font-mono text-slate-400 block">INVESTIGATIVE RATIONALE</span>
                        <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{phrase.explanation}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Victim-Approved Version Tab */}
      {activeTab === 'approved' && (
        <div className="bg-black/60 backdrop-blur-2xl border border-rose-500/30 rounded-2xl p-7 shadow-[0_8px_32px_0_rgba(255,0,127,0.15)] space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-rose-500/50 via-white/30 to-sky-400/50" />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-rose-400 drop-shadow-[0_0_8px_rgba(255,0,127,0.8)]" />
                <h2 className="text-base font-semibold text-white">Victim-Approved Official Statement</h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Concurred and cryptographically signed by the victim through the secure legal portal.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-rose-950/50 text-rose-300 border border-rose-500/50 font-mono text-xs font-semibold shadow-[0_0_12px_rgba(255,0,127,0.3)]">
                LEGAL STATUS: ADMISSIBLE
              </span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 text-sm text-slate-100 leading-relaxed font-serif shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
            "{statements.victimApproved}"
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-3.5 bg-black/40 border border-white/10 rounded-xl">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono mb-1">
                <Clock className="w-3.5 h-3.5 text-rose-400" />
                <span>APPROVAL TIMESTAMP</span>
              </div>
              <div className="font-mono text-xs text-slate-200">
                {statements.victimApprovalMetadata.approvedTimestamp}
              </div>
            </div>

            <div className="p-3.5 bg-black/40 border border-white/10 rounded-xl">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                <span>VERIFICATION METHOD</span>
              </div>
              <div className="text-xs text-slate-200">
                {statements.victimApprovalMetadata.verifiedMethod}
              </div>
            </div>

            <div className="p-3.5 bg-black/40 border border-white/10 rounded-xl">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono mb-1">
                <Hash className="w-3.5 h-3.5 text-rose-400" />
                <span>DIGITAL SIGNATURE HASH</span>
              </div>
              <div className="font-mono text-[10px] text-rose-300 truncate" title={statements.victimApprovalMetadata.digitalSignature}>
                {statements.victimApprovalMetadata.digitalSignature}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Version History Tab */}
      {activeTab === 'history' && (
        <div className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-7 shadow-[0_8px_32px_0_rgba(0,0,0,0.6)] space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-sky-400/30 via-white/20 to-transparent" />

          <div className="pb-3 border-b border-white/10">
            <h2 className="text-base font-semibold text-white">Statement Iteration & Chain of Custody History</h2>
            <p className="text-xs text-slate-400 mt-1">
              Immutable audit trail of statement transcript revisions from raw ingestion to legal confirmation.
            </p>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-white/10">
            {statements.versionHistory.map((item, idx) => (
              <div key={idx} className="relative flex items-start gap-4">
                <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-black border-2 border-sky-400 flex items-center justify-center text-[10px] text-sky-300 font-bold shadow-[0_0_8px_rgba(14,165,233,0.8)]">
                  {idx + 1}
                </div>
                <div className="w-full bg-white/[0.02] border border-white/10 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-xs text-sky-300 px-2.5 py-0.5 bg-sky-950/40 border border-sky-400/40 rounded-lg shadow-[0_0_8px_rgba(14,165,233,0.25)]">
                      {item.version}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">{item.date}</span>
                  </div>
                  <div className="font-semibold text-xs text-slate-200 mt-2">{item.author}</div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.notes}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
