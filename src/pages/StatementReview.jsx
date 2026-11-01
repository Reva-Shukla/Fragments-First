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
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif-clean text-2xl sm:text-3xl font-bold text-[#172D46] tracking-tight">
              Victim Statement Review &amp; Reconstruction
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#EAF1F7] border border-[#8FAFC4]/60 text-[#294D6B] font-mono text-[10px] font-bold shadow-2xs">
              VERIFIED RECORD
            </span>
          </div>
          <p className="text-xs text-[#5E7A91] mt-1 font-sans">
            Case Ref: <span className="text-[#294D6B] font-mono font-semibold">{currentCase.id}</span> • Subject:{' '}
            <span className="text-[#172D46] font-semibold">{currentCase.victimPseudonym}</span> ({currentCase.victimId})
          </p>
        </div>

        {/* Tab Controls in Soft Ivory */}
        <div className="flex items-center gap-1.5 p-1.5 bg-white/90 backdrop-blur-md border border-[#D8D2C6] rounded-2xl shadow-2xs">
          <button
            onClick={() => setActiveTab('diff')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'diff'
                ? 'bg-[#294D6B] text-[#E8E4DC] shadow-xs'
                : 'text-[#5E7A91] hover:text-[#172D46] hover:bg-[#F8F6F1]'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Side-by-Side Comparison</span>
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'approved'
                ? 'bg-[#294D6B] text-[#E8E4DC] shadow-xs'
                : 'text-[#5E7A91] hover:text-[#172D46] hover:bg-[#F8F6F1]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Victim-Approved Version</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'history'
                ? 'bg-[#294D6B] text-[#E8E4DC] shadow-xs'
                : 'text-[#5E7A91] hover:text-[#172D46] hover:bg-[#F8F6F1]'
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
          {/* Side-by-Side Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Original Raw Statement */}
            <div className="bg-[#FCFBF9] border border-[#D8D2C6] rounded-2xl p-6 shadow-[0_4px_20px_rgba(23,45,70,0.05)] flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#8FAFC4]/50 to-transparent" />

              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#E8E4DC] mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#5E7A91]" />
                    <h2 className="font-serif-clean text-base font-bold text-[#172D46]">Original Intake Statement</h2>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#FAF6EF] text-[#8E6E3C] border border-[#C5A77B]/50 font-bold">
                    RAW AUDIO TRANSCRIPT
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-[#F8F6F1] border border-[#E0D9CD] text-xs text-[#233B54] leading-relaxed font-sans min-h-[220px]">
                  {statements.raw}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E8E4DC] text-[11px] text-[#5E7A91] flex items-center justify-between font-mono">
                <span>Ingest: Emergency 911 Voice Intake</span>
                <span>Recorded: 2026-10-24 22:15 UTC</span>
              </div>
            </div>

            {/* Right: AI Chronological Reconstruction */}
            <div className="bg-[#FCFBF9] border-2 border-[#294D6B]/50 rounded-2xl p-6 shadow-[0_4px_24px_rgba(41,77,107,0.08)] flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#294D6B] via-[#C5A77B] to-[#294D6B]" />

              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#E8E4DC] mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#294D6B]" />
                    <h2 className="font-serif-clean text-base font-bold text-[#172D46]">AI Reconstructed Chronological Statement</h2>
                  </div>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-md bg-[#EAF1F7] text-[#294D6B] border border-[#8FAFC4]/60 font-bold">
                    CORROBORATED CHRONOLOGY
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-[#F4F8FA] border border-[#C5D8E4] text-xs text-[#172D46] leading-relaxed font-sans min-h-[220px] font-medium">
                  {statements.aiReconstructed}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E8E4DC] text-[11px] text-[#294D6B] flex items-center justify-between font-mono font-semibold">
                <span>Multi-Feed Synced: SCADA + CAD + CCTV-14</span>
                <span className="text-[#5E7A91]">Confidence: 94.2%</span>
              </div>
            </div>
          </div>

          {/* Granular Phrase Discrepancy & Gap Analysis */}
          <div className="bg-[#FCFBF9] border border-[#D8D2C6] rounded-2xl p-6 shadow-[0_4px_20px_rgba(23,45,70,0.05)] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#294D6B] via-[#C5A77B] to-transparent" />

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <h3 className="font-serif-clean text-base font-bold text-[#172D46]">Evidentiary Phrase Discrepancy &amp; Gap Analysis</h3>
                <p className="text-xs text-[#5E7A91] mt-0.5 font-sans">
                  Granular tracking of syntax modifications, ambiguous terminology, and missing investigatory elements
                </p>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 text-xs flex-wrap">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1 rounded-xl text-[11px] font-mono font-semibold transition-colors ${
                    filterType === 'all'
                      ? 'bg-[#294D6B] text-[#E8E4DC]'
                      : 'bg-[#F8F6F1] text-[#5E7A91] hover:text-[#172D46] border border-[#D8D2C6]'
                  }`}
                >
                  All ({statements.phraseAnalysis.length})
                </button>
                <button
                  onClick={() => setFilterType('change')}
                  className={`px-3 py-1 rounded-xl text-[11px] font-mono font-semibold transition-all ${
                    filterType === 'change'
                      ? 'bg-[#294D6B] text-[#E8E4DC]'
                      : 'bg-[#F8F6F1] text-[#5E7A91] hover:text-[#172D46] border border-[#D8D2C6]'
                  }`}
                >
                  Changes
                </button>
                <button
                  onClick={() => setFilterType('unclear')}
                  className={`px-3 py-1 rounded-xl text-[11px] font-mono font-semibold transition-all ${
                    filterType === 'unclear'
                      ? 'bg-[#C5A77B] text-[#172D46]'
                      : 'bg-[#F8F6F1] text-[#5E7A91] hover:text-[#172D46] border border-[#D8D2C6]'
                  }`}
                >
                  Unclear Phrases
                </button>
                <button
                  onClick={() => setFilterType('missing')}
                  className={`px-3 py-1 rounded-xl text-[11px] font-mono font-semibold transition-all ${
                    filterType === 'missing'
                      ? 'bg-[#9B2C2C] text-white'
                      : 'bg-[#F8F6F1] text-[#5E7A91] hover:text-[#172D46] border border-[#D8D2C6]'
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
                  change: { label: 'SYNTAX / CHRONO CHANGE', color: 'border-[#8FAFC4]/60 bg-[#EAF1F7] text-[#294D6B]' },
                  unclear: { label: 'UNCLEAR PHRASE', color: 'border-[#C5A77B]/60 bg-[#FAF6EF] text-[#8E6E3C]' },
                  missing: { label: 'MISSING INFORMATION', color: 'border-[#E8B4B4] bg-[#FDF0EE] text-[#9B2C2C]' }
                }[phrase.type] || { label: 'ANALYSIS', color: 'border-[#D8D2C6] bg-[#E8E4DC]/60 text-[#5E7A91]' };

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedPhrase(phrase)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#294D6B] bg-white ring-1 ring-[#294D6B]/30 shadow-xs'
                        : 'border-[#D8D2C6] bg-[#F8F6F1] hover:border-[#8FAFC4]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md border ${badgeConfig.color}`}>
                        {badgeConfig.label}
                      </span>
                      <span className="text-[10px] text-[#5E7A91] font-mono">{phrase.status}</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-[10px] font-mono text-[#8FAFC4] block font-semibold">ORIGINAL PHRASE</span>
                        <span className="text-[#9B2C2C] font-sans font-medium italic">"{phrase.original}"</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-[#8FAFC4] block font-semibold">RECONSTRUCTED REFERENCE</span>
                        <span className="text-[#294D6B] font-sans font-semibold">"{phrase.reconstructed}"</span>
                      </div>
                      <div className="pt-2 border-t border-[#E8E4DC]">
                        <span className="text-[10px] font-mono text-[#8FAFC4] block font-semibold">INVESTIGATIVE RATIONALE</span>
                        <p className="text-[11px] text-[#233B54] mt-0.5 leading-relaxed font-sans">{phrase.explanation}</p>
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
        <div className="bg-[#FCFBF9] border border-[#D8D2C6] rounded-2xl p-7 shadow-[0_4px_20px_rgba(23,45,70,0.05)] space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#294D6B] via-[#C5A77B] to-[#294D6B]" />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E8E4DC]">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#294D6B]" />
                <h2 className="font-serif-clean text-lg font-bold text-[#172D46]">Victim-Approved Official Statement</h2>
              </div>
              <p className="text-xs text-[#5E7A91] mt-1 font-sans">
                Concurred and cryptographically signed by the victim through the secure legal portal.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-[#EAF1F7] text-[#294D6B] border border-[#8FAFC4]/60 font-mono text-xs font-bold shadow-2xs">
                LEGAL STATUS: ADMISSIBLE
              </span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#F8F6F1] border border-[#E0D9CD] text-sm text-[#172D46] leading-relaxed font-serif shadow-xs">
            "{statements.victimApproved}"
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-3.5 bg-white border border-[#D8D2C6] rounded-xl shadow-2xs">
              <div className="flex items-center gap-1.5 text-[#5E7A91] text-[10px] font-mono mb-1 font-semibold">
                <Clock className="w-3.5 h-3.5 text-[#294D6B]" />
                <span>APPROVAL TIMESTAMP</span>
              </div>
              <div className="font-mono text-xs text-[#172D46] font-semibold">
                {statements.victimApprovalMetadata.approvedTimestamp}
              </div>
            </div>

            <div className="p-3.5 bg-white border border-[#D8D2C6] rounded-xl shadow-2xs">
              <div className="flex items-center gap-1.5 text-[#5E7A91] text-[10px] font-mono mb-1 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-[#294D6B]" />
                <span>VERIFICATION METHOD</span>
              </div>
              <div className="text-xs text-[#172D46] font-sans font-semibold">
                {statements.victimApprovalMetadata.verifiedMethod}
              </div>
            </div>

            <div className="p-3.5 bg-white border border-[#D8D2C6] rounded-xl shadow-2xs">
              <div className="flex items-center gap-1.5 text-[#5E7A91] text-[10px] font-mono mb-1 font-semibold">
                <Hash className="w-3.5 h-3.5 text-[#294D6B]" />
                <span>DIGITAL SIGNATURE HASH</span>
              </div>
              <div className="font-mono text-[10px] text-[#294D6B] truncate font-bold" title={statements.victimApprovalMetadata.digitalSignature}>
                {statements.victimApprovalMetadata.digitalSignature}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Version History Tab */}
      {activeTab === 'history' && (
        <div className="bg-[#FCFBF9] border border-[#D8D2C6] rounded-2xl p-7 shadow-[0_4px_20px_rgba(23,45,70,0.05)] space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#294D6B] via-[#C5A77B] to-transparent" />

          <div className="pb-3 border-b border-[#E8E4DC]">
            <h2 className="font-serif-clean text-lg font-bold text-[#172D46]">Statement Iteration &amp; Chain of Custody History</h2>
            <p className="text-xs text-[#5E7A91] mt-1 font-sans">
              Immutable audit trail of statement transcript revisions from raw ingestion to legal confirmation.
            </p>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#D8D2C6]">
            {statements.versionHistory.map((item, idx) => (
              <div key={idx} className="relative flex items-start gap-4">
                <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-[#294D6B] border-2 border-white flex items-center justify-center text-[10px] text-[#E8E4DC] font-bold shadow-xs">
                  {idx + 1}
                </div>
                <div className="w-full bg-[#F8F6F1] border border-[#D8D2C6] rounded-2xl p-4 shadow-2xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-xs text-[#294D6B] px-2.5 py-0.5 bg-[#EAF1F7] border border-[#8FAFC4]/50 rounded-lg">
                      {item.version}
                    </span>
                    <span className="font-mono text-[11px] text-[#5E7A91]">{item.date}</span>
                  </div>
                  <div className="font-semibold text-xs text-[#172D46] mt-2 font-sans">{item.author}</div>
                  <p className="text-xs text-[#5E7A91] mt-1 leading-relaxed font-sans">{item.notes}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
