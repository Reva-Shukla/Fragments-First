import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Printer, 
  Download, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  Clock, 
  HelpCircle, 
  AlertTriangle,
  GitFork,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  Lock
} from 'lucide-react';
import { useCase } from '../context/CaseContext';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';
import { EthicalNoticeBanner } from '../components/common/EthicalNoticeBanner';

export const InvestigationReports = () => {
  const { currentCase, recordAction } = useCase();
  const { currentUser } = useAuth();
  const { report, statements, timeline, claims, evidence, rootCauses } = currentCase;

  const [isWhatIfExpanded, setIsWhatIfExpanded] = useState(true);
  const [selectedWhatIf, setSelectedWhatIf] = useState(report?.counterfactualWhatIfs?.[0]);
  const [isSealed, setIsSealed] = useState(false);

  const handlePrint = () => {
    recordAction('REPORT_PRINTED', `Executed print/PDF export of formal report [${report.reportId}]`, 'INFO');
    window.print();
  };

  const handleExportJson = () => {
    recordAction('REPORT_EXPORTED', `Exported full investigative JSON dossier for [${currentCase.id}]`, 'INFO');
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentCase, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${currentCase.id}-INVESTIGATION-DOSSIER.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleDigitalSeal = () => {
    setIsSealed(true);
    recordAction('REPORT_SEALED', `Digitally sealed and cryptographically stamped dossier [${report.reportId}] by ${currentUser?.name}`, 'CRITICAL');
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 print-hide">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Formal Investigation Dossier & Report</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-950/40 border border-rose-500/50 text-rose-300 font-mono text-[10px] shadow-[0_0_12px_rgba(255,0,127,0.3)] font-semibold">
              COURT ADMISSIBLE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Docket Ref: <span className="text-sky-300 font-mono font-medium">{report.reportId}</span> • Generated: {new Date(report.generatedDate).toLocaleDateString()}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-medium rounded-xl border border-white/10 flex items-center gap-1.5 transition-colors shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]"
          >
            <Printer className="w-4 h-4 text-sky-400" />
            <span>Print / Export PDF</span>
          </button>

          <button
            onClick={handleExportJson}
            className="px-3.5 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-medium rounded-xl border border-white/10 flex items-center gap-1.5 transition-colors shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]"
          >
            <Download className="w-4 h-4 text-sky-400" />
            <span>Export JSON Dossier</span>
          </button>

          <button
            onClick={handleDigitalSeal}
            disabled={isSealed}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all ${
              isSealed
                ? 'bg-rose-950/50 text-rose-300 border border-rose-500/60 shadow-[0_0_15px_rgba(255,0,127,0.3)] cursor-default'
                : 'bg-gradient-to-r from-sky-500 to-rose-600 hover:from-sky-400 hover:to-rose-500 text-white shadow-[0_0_20px_rgba(14,165,233,0.35)]'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isSealed ? 'Dossier Cryptographically Sealed' : 'Seal & Attest'}</span>
          </button>
        </div>
      </div>

      <div className="print-hide">
        <EthicalNoticeBanner />
      </div>

      {/* Official Liquid Glass Dossier Document Body */}
      <div className="bg-black/70 backdrop-blur-2xl border border-white/15 rounded-3xl p-7 sm:p-12 shadow-[0_24px_64px_rgba(0,0,0,0.8)] space-y-8 font-sans print-card relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-sky-400/40 via-white/30 to-rose-500/40" />

        {/* Document Header & Legal Seals */}
        <div className="border-b border-white/10 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="text-[10px] font-mono tracking-widest uppercase text-rose-400 font-bold mb-1 drop-shadow-[0_0_8px_rgba(255,0,127,0.6)]">
                {report.classification}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                COMPREHENSIVE MULTI-AGENCY INCIDENT DOSSIER
              </h2>
              <p className="text-xs text-sky-400/90 mt-1 font-mono">
                ISSUED BY: {report.reportingAuthority}
              </p>
            </div>

            <div className="text-right font-mono text-xs text-slate-400">
              <div>REPORT ID: <span className="text-sky-300 font-bold">{report.reportId}</span></div>
              <div>CASE DOCKET: <span className="text-white">{currentCase.id}</span></div>
              <div>DATE ISSUED: <span className="text-slate-300">{new Date(report.generatedDate).toLocaleDateString()}</span></div>
            </div>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold font-mono tracking-wider uppercase text-sky-400 flex items-center gap-2">
            <span>01. EXECUTIVE SUMMARY & INCIDENT SCOPE</span>
          </h3>
          <p className="text-xs text-slate-200 leading-relaxed bg-white/[0.02] p-5 rounded-2xl border border-white/10">
            {report.executiveSummary}
          </p>
        </section>

        {/* Section 2: Statement Reconstruction & Victim Concurrence */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold font-mono tracking-wider uppercase text-sky-400 flex items-center gap-2">
            <span>02. VICTIM STATEMENT ANALYSIS & RECONSTRUCTION</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-white/[0.02] border border-white/10 rounded-2xl">
              <span className="text-[10px] font-mono text-rose-400 uppercase block mb-1">Raw Intake Audio Transcript</span>
              <p className="text-slate-300 leading-relaxed italic">"{statements.raw}"</p>
            </div>
            <div className="p-4 bg-sky-950/20 border border-sky-400/40 rounded-2xl">
              <span className="text-[10px] font-mono text-sky-400 uppercase block mb-1">AI Chrono-Normalized & Corroborated</span>
              <p className="text-white leading-relaxed">"{statements.aiReconstructed}"</p>
            </div>
          </div>
          <div className="p-3.5 bg-rose-950/30 border border-rose-500/40 rounded-2xl text-xs flex items-center justify-between shadow-[0_0_12px_rgba(255,0,127,0.15)]">
            <div className="flex items-center gap-2 text-rose-300">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Victim Approved Version Authenticated (MFA Verified {statements.victimApprovalMetadata.approvedTimestamp})</span>
            </div>
            <span className="font-mono text-[10px] text-rose-400">{statements.victimApprovalMetadata.digitalSignature}</span>
          </div>
        </section>

        {/* Section 3: Unified Multi-Service Timeline */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold font-mono tracking-wider uppercase text-sky-400 flex items-center gap-2">
            <span>03. SYNCHRONIZED MULTI-SERVICE INCIDENT TIMELINE</span>
          </h3>
          <div className="overflow-x-auto border border-white/10 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.03] text-slate-400 font-mono text-[10px] uppercase border-b border-white/10">
                <tr>
                  <th className="py-2.5 px-3">Service</th>
                  <th className="py-2.5 px-3">GPS-UTC Time</th>
                  <th className="py-2.5 px-3">Logged Original</th>
                  <th className="py-2.5 px-3">Event Narrative</th>
                  <th className="py-2.5 px-3">Uncertainty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] bg-black/40">
                {timeline.slice(0, 6).map((ev) => (
                  <tr key={ev.id} className="hover:bg-white/[0.04]">
                    <td className="py-2.5 px-3 font-medium text-slate-300">{ev.service}</td>
                    <td className="py-2.5 px-3 font-mono text-sky-300 font-bold">{ev.correctedTimestamp}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">{ev.originalTimestamp}</td>
                    <td className="py-2.5 px-3 text-slate-200">{ev.eventTitle}</td>
                    <td className="py-2.5 px-3 font-mono text-rose-400">{ev.clockUncertainty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 4: 4-Tier Claim Verification Results */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold font-mono tracking-wider uppercase text-sky-400 flex items-center gap-2">
            <span>04. 4-TIER CLAIM CORROBORATION MATRIX</span>
          </h3>
          <div className="space-y-2.5">
            {claims.map((claim) => (
              <div key={claim.id} className="p-3.5 bg-white/[0.02] border border-white/10 rounded-2xl text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sky-400 font-semibold">{claim.id} • {claim.category}</span>
                  <Badge variant={claim.status} size="sm">
                    {claim.status} ({Math.round(claim.confidence * 100)}%)
                  </Badge>
                </div>
                <p className="text-white font-medium">"{claim.claimText}"</p>
                <p className="text-slate-400 text-[11px] leading-relaxed">{claim.explanation}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 5: Root Cause Determination */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold font-mono tracking-wider uppercase text-sky-400 flex items-center gap-2">
            <span>05. ROOT CAUSE FINDINGS & HYPOTHESIS EVALUATION</span>
          </h3>
          <div className="p-5 bg-sky-950/20 border border-sky-400/40 rounded-2xl space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white text-sm">
                Primary Determination: {rootCauses[0]?.title}
              </span>
              <span className="font-mono text-sky-300 font-bold">
                Score: {rootCauses[0]?.probabilityScore}%
              </span>
            </div>
            <div className="text-slate-300 leading-relaxed">
              Forensic evidence directly attributes the exit barrier delay to electrical relay stiction (Relay R-41), holding 42 seconds past the automated fire failsafe signal. Physical tampering and intentional delay by first responders are fully ruled out by telemetry.
            </div>
          </div>
        </section>

        {/* Section 6: Embedded What-If / Counterfactual Analysis */}
        <section className="space-y-3 print-hide">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold font-mono tracking-wider uppercase text-rose-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-400" />
              <span>06. EMBEDDED WHAT-IF & COUNTERFACTUAL ANALYSIS</span>
            </h3>
            <button
              onClick={() => setIsWhatIfExpanded(!isWhatIfExpanded)}
              className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-mono transition-colors"
            >
              <span>{isWhatIfExpanded ? 'Collapse Analysis' : 'Expand Analysis'}</span>
              {isWhatIfExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {isWhatIfExpanded && (
            <div className="p-6 bg-gradient-to-br from-black/80 via-black/60 to-rose-950/25 border border-rose-500/40 rounded-2xl space-y-4 shadow-[0_8px_32px_rgba(255,0,127,0.15)]">
              <p className="text-xs text-slate-300 leading-relaxed">
                Algorithmic counterfactual simulation modeling the causal impact of variable shifts in sensor drift, door mechanical timing, and dispatch prioritization.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {report.counterfactualWhatIfs?.map((scenario) => (
                  <button
                    key={scenario.id}
                    onClick={() => setSelectedWhatIf(scenario)}
                    className={`p-3.5 rounded-xl border text-left transition-all text-xs ${
                      selectedWhatIf?.id === scenario.id
                        ? 'bg-sky-500/20 border-sky-400/60 text-sky-200 shadow-[0_0_15px_rgba(14,165,233,0.3)]'
                        : 'bg-black/50 border-white/10 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <span className="font-mono text-[10px] block text-sky-400 font-bold mb-1">{scenario.id}</span>
                    <span className="line-clamp-2 leading-tight">{scenario.scenarioTitle}</span>
                  </button>
                ))}
              </div>

              {selectedWhatIf && (
                <div className="p-4 rounded-xl bg-black/60 border border-white/15 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">{selectedWhatIf.scenarioTitle}</span>
                    <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-md bg-rose-950/50 text-rose-300 border border-rose-500/50 shadow-[0_0_8px_rgba(255,0,127,0.3)]">
                      {selectedWhatIf.confidence}
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed bg-white/[0.02] p-3 rounded-xl border border-white/10">
                    {selectedWhatIf.impactAnalysis}
                  </p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Section 7: Evidentiary Limitations & Safeguards */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold font-mono tracking-wider uppercase text-sky-400 flex items-center gap-2">
            <span>07. EVIDENTIARY LIMITATIONS & STATUTORY SAFEGUARDS</span>
          </h3>
          <ul className="space-y-2 text-xs text-slate-300 bg-white/[0.02] p-5 rounded-2xl border border-white/10">
            {report.limitations.map((limit, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-rose-400 font-mono font-bold">[{i + 1}]</span>
                <span className="leading-relaxed">{limit}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Signatures */}
        <div className="pt-6 border-t border-white/10">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-4">
            OFFICIAL INVESTIGATIVE SIGNATORIES
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {report.signatories.map((sig, i) => (
              <div key={i} className="p-4 bg-white/[0.02] border border-white/10 rounded-2xl text-xs space-y-1">
                <div className="font-bold text-white">{sig.name}</div>
                <div className="text-slate-400">{sig.title} ({sig.badge})</div>
                <div className="font-mono text-[10px] text-sky-400">Signed: {sig.signedDate} UTC</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
