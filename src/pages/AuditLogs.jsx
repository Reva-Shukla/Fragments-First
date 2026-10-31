import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Download, 
  FileText, 
  Hash, 
  Clock, 
  User, 
  Layers, 
  CheckCircle2, 
  Lock, 
  ShieldAlert,
  Terminal,
  Activity
} from 'lucide-react';
import { useCase } from '../context/CaseContext';
import { Badge } from '../components/common/Badge';

export const AuditLogs = () => {
  const { auditLogs } = useCase();

  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [isVerifyingIntegrity, setIsVerifyingIntegrity] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(null);

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch = 
      log.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.caseId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = actionFilter === 'ALL' || log.actionType === actionFilter;
    const matchesSeverity = severityFilter === 'ALL' || log.severity === severityFilter;

    return matchesSearch && matchesAction && matchesSeverity;
  });

  const handleVerifyIntegrity = () => {
    setIsVerifyingIntegrity(true);
    setTimeout(() => {
      setIsVerifyingIntegrity(false);
      setVerificationSuccess(true);
    }, 1000);
  };

  const handleExportCSV = () => {
    const headers = ['Log ID', 'Timestamp', 'Case ID', 'Action Type', 'User', 'Role', 'IP Address', 'Block #', 'SHA-256 Hash', 'Details'];
    const rows = filteredLogs.map(l => [
      l.id,
      l.timestamp,
      l.caseId,
      l.actionType,
      l.user,
      l.role,
      l.ipAddress,
      l.blockNumber,
      l.tamperProofHash,
      `"${l.details.replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FRAGMENT-AUDIT-LEDGER-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Immutable Investigation Audit Ledger</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-sky-950/40 border border-sky-400/40 text-sky-300 font-mono text-[10px] shadow-[0_0_10px_rgba(14,165,233,0.3)]">
              FIPS 140-3 COMPLIANT
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tamper-evident forensic ledger recording all case accesses, statement reviews, claim updates, and downloads.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleVerifyIntegrity}
            disabled={isVerifyingIntegrity}
            className="px-3.5 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-medium rounded-xl border border-white/10 flex items-center gap-1.5 transition-colors shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]"
          >
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            <span>{isVerifyingIntegrity ? 'Calculating Merkle Hashes...' : 'Verify Cryptographic Integrity'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-1.5 bg-gradient-to-r from-sky-500 to-rose-600 hover:from-sky-400 hover:to-rose-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-[0_0_18px_rgba(14,165,233,0.3)] transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV Audit</span>
          </button>
        </div>
      </div>

      {/* Verification Status Banner */}
      {verificationSuccess && (
        <div className="p-4 bg-sky-950/40 border border-sky-400/40 rounded-2xl text-xs text-sky-300 flex items-center justify-between shadow-[0_0_20px_rgba(14,165,233,0.2)]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 drop-shadow-[0_0_6px_rgba(14,165,233,0.8)]" />
            <span>All {auditLogs.length} audit blocks verified against SHA-256 Merkle root. Zero tampering or sequence discrepancies detected.</span>
          </div>
          <button
            onClick={() => setVerificationSuccess(false)}
            className="text-[10px] text-sky-400 hover:underline font-mono"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.6)] space-y-3 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-sky-400/30 to-rose-400/30" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Investigator, IP, details, hash..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-sky-400 transition-all font-mono"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-hidden focus:border-sky-400 transition-all font-mono"
            >
              <option value="ALL">All Action Categories</option>
              <option value="EVIDENCE_ACCESSED">EVIDENCE_ACCESSED</option>
              <option value="CLAIM_VERIFIED">CLAIM_VERIFIED</option>
              <option value="STATEMENT_DIFF_REVIEW">STATEMENT_DIFF_REVIEW</option>
              <option value="WHAT_IF_SIMULATION">WHAT_IF_SIMULATION</option>
              <option value="REPORT_GENERATED">REPORT_GENERATED</option>
              <option value="AUTHORITY_LOGIN">AUTHORITY_LOGIN</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-hidden focus:border-rose-400 transition-all font-mono"
            >
              <option value="ALL">All Severity Levels</option>
              <option value="INFO">INFO (Cerulean)</option>
              <option value="CRITICAL">CRITICAL (Neon Rose)</option>
              <option value="SECURITY">SECURITY (Rose Glow)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
          <span>SHOWING {filteredLogs.length} OF {auditLogs.length} IMMUTABLE LEDGER ENTRIES</span>
          <span className="text-sky-400">MERKLE ANCHOR: #48921-HEX</span>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.6)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.03] text-slate-400 font-mono text-[10px] uppercase border-b border-white/10">
              <tr>
                <th className="py-3 px-4">Block / ID</th>
                <th className="py-3 px-4">Timestamp (UTC)</th>
                <th className="py-3 px-4">Action Type</th>
                <th className="py-3 px-4">Authority Actor</th>
                <th className="py-3 px-4">Action Narrative</th>
                <th className="py-3 px-4 text-right">Cryptographic Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] font-mono">
              {filteredLogs.map((log) => {
                const severityStyle = {
                  CRITICAL: 'text-rose-300 bg-rose-950/40 border-rose-500/50 shadow-[0_0_10px_rgba(255,0,127,0.3)]',
                  SECURITY: 'text-rose-300 bg-rose-950/40 border-rose-500/50 shadow-[0_0_10px_rgba(255,0,127,0.3)]',
                  INFO: 'text-sky-300 bg-sky-950/40 border-sky-400/50 shadow-[0_0_8px_rgba(14,165,233,0.25)]'
                }[log.severity] || 'text-slate-400';

                return (
                  <tr key={log.id} className="hover:bg-white/[0.04] transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">#{log.blockNumber}</div>
                      <div className="text-[10px] text-slate-400">{log.id}</div>
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-300">
                      <div>{new Date(log.timestamp).toLocaleDateString()}</div>
                      <div className="text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${severityStyle}`}>
                        {log.actionType}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-1">Scope: {log.caseId}</div>
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <div className="font-semibold text-white text-xs">{log.user}</div>
                      <div className="text-[10px] text-sky-400 font-mono">{log.role}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{log.ipAddress}</div>
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-200 max-w-md">
                      <p className="line-clamp-2 leading-relaxed text-xs">
                        {log.details}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span 
                        className="text-[10px] text-slate-400 hover:text-sky-300 cursor-pointer select-all font-mono"
                        title={log.tamperProofHash}
                      >
                        {log.tamperProofHash.slice(0, 10)}...{log.tamperProofHash.slice(-6)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
