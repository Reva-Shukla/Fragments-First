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
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif-clean text-2xl font-bold text-[#172D46] tracking-tight">Formal Investigation Dossier & Report</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#FAF6EF] border border-[#C5A77B]/50 text-[#8E6E3C] font-mono text-[10px] font-semibold">
              COURT ADMISSIBLE
            </span>
          </div>
          <p className="text-xs text-[#5E7A91] mt-1">
            Docket Ref: <span className="text-[#294D6B] font-mono font-medium">{report.reportId}</span> • Generated: {new Date(report.generatedDate).toLocaleDateString()}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 bg-white hover:bg-[#EAF1F7] text-[#294D6B] text-xs font-medium rounded-xl border border-[#D8D2C6] flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#294D6B]" />
            <span>Print / Export PDF</span>
          </button>

          <button
            onClick={handleExportJson}
            className="px-3.5 py-1.5 bg-white hover:bg-[#EAF1F7] text-[#294D6B] text-xs font-medium rounded-xl border border-[#D8D2C6] flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#294D6B]" />
            <span>Export JSON Dossier</span>
          </button>

          <button
            onClick={handleDigitalSeal}
            disabled={isSealed}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all ${
              isSealed
                ? 'bg-[#EAF1F7] text-[#294D6B] border border-[#294D6B]/40 cursor-default'
                : 'bg-[#294D6B] hover:bg-[#172D46] text-white cursor-pointer'
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

      {/* Official Dossier Document Body */}
      <div className="bg-[#FCFBF9] border border-[#D8D2C6] rounded-3xl p-7 sm:p-12 shadow-sm space-y-8 font-sans print-card relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C5A77B]/60 to-transparent" />

        {/* Document Header & Legal Seals */}
        <div className="border-b border-[#D8D2C6] pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="text-[10px] font-mono tracking-widest uppercase text-[#8E6E3C] font-bold mb-1">
                {report.classification}
              </div>
              <h2 className="font-serif-clean text-2xl sm:text-3xl font-bold text-[#172D46] tracking-tight">
                COMPREHENSIVE MULTI-AGENCY INCIDENT DOSSIER
              </h2>
              <p className="text-xs text-[#294D6B] mt-1 font-mono font-medium">
                ISSUED BY: {report.reportingAuthority}
              </p>
            </div>

            <div className="text-right font-mono text-xs text-[#5E7A91] space-y-0.5">
              <div>REPORT ID: <span className="text-[#294D6B] font-bold">{report.reportId}</span></div>
              <div>CASE DOCKET: <span className="text-[#172D46] font-semibold">{currentCase.id}</span></div>
              <div>DATE ISSUED: <span className="text-[#172D46]">{new Date(report.generatedDate).toLocaleDateString()}</span></div>
            </div>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <section className="space-y-3">
          <h3 className="font-serif-clean text-sm font-bold tracking-wider uppercase text-[#172D46] flex items-center gap-2 border-b border-[#D8D2C6]/80 pb-2">
            <span>01. EXECUTIVE SUMMARY & INCIDENT SCOPE</span>
          </h3>
          <p className="text-xs text-[#233B54] leading-relaxed bg-white p-5 rounded-2xl border border-[#D8D2C6] font-reading shadow-xs">
            {report.executiveSummary}
          </p>
        </section>

        {/* Section 2: Statement Reconstruction & Victim Concurrence */}
        <section className="space-y-3">
          <h3 className="font-serif-clean text-sm font-bold tracking-wider uppercase text-[#172D46] flex items-center gap-2 border-b border-[#D8D2C6]/80 pb-2">
            <span>02. VICTIM STATEMENT ANALYSIS & RECONSTRUCTION</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-white border border-[#D8D2C6] rounded-2xl shadow-xs">
              <span className="text-[10px] font-mono text-[#8E6E3C] uppercase block mb-1 font-semibold">Raw Intake Audio Transcript</span>
              <p className="text-[#5E7A91] leading-relaxed italic font-reading">"{statements.raw}"</p>
            </div>
            <div className="p-4 bg-[#EAF1F7] border border-[#294D6B]/30 rounded-2xl shadow-xs">
              <span className="text-[10px] font-mono text-[#294D6B] uppercase block mb-1 font-semibold">AI Chrono-Normalized & Corroborated</span>
              <p className="text-[#172D46] leading-relaxed font-reading font-medium">"{statements.aiReconstructed}"</p>
            </div>
          </div>
          <div className="p-3.5 bg-[#FAF6EF] border border-[#C5A77B]/50 rounded-2xl text-xs flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2 text-[#8E6E3C] font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#C5A77B]" />
              <span>Victim Approved Version Authenticated (MFA Verified {statements.victimApprovalMetadata.approvedTimestamp})</span>
            </div>
            <span className="font-mono text-[10px] text-[#8E6E3C] font-semibold">{statements.victimApprovalMetadata.digitalSignature}</span>
          </div>
        </section>

        {/* Section 3: Unified Multi-Service Timeline */}
        <section className="space-y-3">
          <h3 className="font-serif-clean text-sm font-bold tracking-wider uppercase text-[#172D46] flex items-center gap-2 border-b border-[#D8D2C6]/80 pb-2">
            <span>03. SYNCHRONIZED MULTI-SERVICE INCIDENT TIMELINE</span>
          </h3>
          <div className="overflow-x-auto border border-[#D8D2C6] rounded-2xl bg-white shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F2EB] text-[#5E7A91] font-mono text-[10px] uppercase border-b border-[#D8D2C6]">
                <tr>
                  <th className="py-2.5 px-3">Service</th>
                  <th className="py-2.5 px-3">GPS-UTC Time</th>
                  <th className="py-2.5 px-3">Logged Original</th>
                  <th className="py-2.5 px-3">Event Narrative</th>
                  <th className="py-2.5 px-3">Uncertainty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8D2C6]/60">
                {timeline.slice(0, 6).map((ev) => (
                  <tr key={ev.id} className="hover:bg-[#FAF9F5] transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-[#172D46]">{ev.service}</td>
                    <td className="py-2.5 px-3 font-mono text-[#294D6B] font-bold">{ev.correctedTimestamp}</td>
                    <td className="py-2.5 px-3 font-mono text-[#5E7A91]">{ev.originalTimestamp}</td>
                    <td className="py-2.5 px-3 text-[#233B54] font-reading">{ev.eventTitle}</td>
                    <td className="py-2.5 px-3 font-mono text-[#9B2C2C] font-semibold">{ev.clockUncertainty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 4: 4-Tier Claim Verification Results */}
        <section className="space-y-3">
          <h3 className="font-serif-clean text-sm font-bold tracking-wider uppercase text-[#172D46] flex items-center gap-2 border-b border-[#D8D2C6]/80 pb-2">
            <span>04. 4-TIER CLAIM CORROBORATION MATRIX</span>
          </h3>
          <div className="space-y-2.5">
            {claims.map((claim) => (
              <div key={claim.id} className="p-3.5 bg-white border border-[#D8D2C6] rounded-xl text-xs space-y-1.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[#294D6B] font-bold">{claim.id} • {claim.category}</span>
                  <Badge variant={claim.status} size="sm">
                    {claim.status} ({Math.round(claim.confidence * 100)}%)
                  </Badge>
                </div>
                <p className="text-[#172D46] font-medium font-reading">"{claim.claimText}"</p>
                <p className="text-[#5E7A91] text-[11px] leading-relaxed">{claim.explanation}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 5: Root Cause Determination */}
        <section className="space-y-3">
          <h3 className="font-serif-clean text-sm font-bold tracking-wider uppercase text-[#172D46] flex items-center gap-2 border-b border-[#D8D2C6]/80 pb-2">
            <span>05. ROOT CAUSE FINDINGS & HYPOTHESIS EVALUATION</span>
          </h3>
          <div className="p-5 bg-[#EAF1F7] border border-[#294D6B]/30 rounded-2xl space-y-2 text-xs shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#172D46] text-sm">
                Primary Determination: {rootCauses[0]?.title}
              </span>
              <span className="font-mono text-[#294D6B] font-bold">
                Score: {rootCauses[0]?.probabilityScore}%
              </span>
            </div>
            <div className="text-[#233B54] leading-relaxed font-reading">
              Forensic evidence directly attributes the exit barrier delay to electrical relay stiction (Relay R-41), holding 42 seconds past the automated fire failsafe signal. Physical tampering and intentional delay by first responders are fully ruled out by telemetry.
            </div>
          </div>
        </section>

        {/* Section 6: Embedded What-If / Counterfactual Analysis */}
        <section className="space-y-3 print-hide">
          <div className="flex items-center justify-between">
            <h3 className="font-serif-clean text-sm font-bold tracking-wider uppercase text-[#172D46] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C5A77B]" />
              <span>06. EMBEDDED WHAT-IF & COUNTERFACTUAL ANALYSIS</span>
            </h3>
            <button
              onClick={() => setIsWhatIfExpanded(!isWhatIfExpanded)}
              className="text-xs text-[#294D6B] hover:text-[#172D46] flex items-center gap-1 font-mono transition-colors cursor-pointer"
            >
              <span>{isWhatIfExpanded ? 'Collapse Analysis' : 'Expand Analysis'}</span>
              {isWhatIfExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {isWhatIfExpanded && (
            <div className="p-6 bg-[#FAF9F5] border border-[#C5A77B]/40 rounded-2xl space-y-4 shadow-xs">
              <p className="text-xs text-[#233B54] leading-relaxed font-reading">
                Algorithmic counterfactual simulation modeling the causal impact of variable shifts in sensor drift, door mechanical timing, and dispatch prioritization.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {report.counterfactualWhatIfs?.map((scenario) => (
                  <button
                    key={scenario.id}
                    onClick={() => setSelectedWhatIf(scenario)}
                    className={`p-3.5 rounded-xl border text-left transition-all text-xs cursor-pointer ${
                      selectedWhatIf?.id === scenario.id
                        ? 'bg-[#294D6B] text-white shadow-xs font-medium border-[#172D46]'
                        : 'bg-white border-[#D8D2C6] text-[#5E7A91] hover:text-[#172D46] hover:border-[#294D6B]'
                    }`}
                  >
                    <span className={`font-mono text-[10px] block font-bold mb-1 ${
                      selectedWhatIf?.id === scenario.id ? 'text-[#C5A77B]' : 'text-[#294D6B]'
                    }`}>
                      {scenario.id}
                    </span>
                    <span className="line-clamp-2 leading-tight">{scenario.scenarioTitle}</span>
                  </button>
                ))}
              </div>

              {selectedWhatIf && (
                <div className="p-4 rounded-xl bg-white border border-[#D8D2C6] text-xs space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#172D46]">{selectedWhatIf.scenarioTitle}</span>
                    <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-md bg-[#FAF6EF] text-[#8E6E3C] border border-[#C5A77B]/50 font-semibold">
                      {selectedWhatIf.confidence}
                    </span>
                  </div>
                  <p className="text-[#233B54] leading-relaxed bg-[#F5F2EB]/60 p-3 rounded-xl border border-[#D8D2C6] font-reading">
                    {selectedWhatIf.impactAnalysis}
                  </p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Section 7: Evidentiary Limitations & Safeguards */}
        <section className="space-y-3">
          <h3 className="font-serif-clean text-sm font-bold tracking-wider uppercase text-[#172D46] flex items-center gap-2 border-b border-[#D8D2C6]/80 pb-2">
            <span>07. EVIDENTIARY LIMITATIONS & STATUTORY SAFEGUARDS</span>
          </h3>
          <ul className="space-y-2 text-xs text-[#233B54] bg-white p-5 rounded-2xl border border-[#D8D2C6] font-reading shadow-xs">
            {report.limitations.map((limit, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-[#8E6E3C] font-mono font-bold">[{i + 1}]</span>
                <span className="leading-relaxed">{limit}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Signatories */}
        <div className="pt-6 border-t border-[#D8D2C6]">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#5E7A91] mb-4 font-semibold">
            OFFICIAL INVESTIGATIVE SIGNATORIES
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {report.signatories.map((sig, i) => (
              <div key={i} className="p-4 bg-white border border-[#D8D2C6] rounded-2xl text-xs space-y-1 shadow-xs">
                <div className="font-bold text-[#172D46]">{sig.name}</div>
                <div className="text-[#5E7A91]">{sig.title} ({sig.badge})</div>
                <div className="font-mono text-[10px] text-[#294D6B] font-medium">Signed: {sig.signedDate} UTC</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
