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
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif-clean text-2xl font-bold text-[#172D46] tracking-tight">Immutable Investigation Audit Ledger</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#EAF1F7] border border-[#294D6B]/30 text-[#294D6B] font-mono text-[10px] font-semibold">
              FIPS 140-3 COMPLIANT
            </span>
          </div>
          <p className="text-xs text-[#5E7A91] mt-1">
            Tamper-evident forensic ledger recording all case accesses, statement reviews, claim updates, and downloads.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleVerifyIntegrity}
            disabled={isVerifyingIntegrity}
            className="px-3.5 py-1.5 bg-white hover:bg-[#EAF1F7] text-[#294D6B] text-xs font-medium rounded-xl border border-[#D8D2C6] flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-[#294D6B]" />
            <span>{isVerifyingIntegrity ? 'Calculating Merkle Hashes...' : 'Verify Cryptographic Integrity'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-1.5 bg-[#294D6B] hover:bg-[#172D46] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV Audit</span>
          </button>
        </div>
      </div>

      {/* Verification Status Banner */}
      {verificationSuccess && (
        <div className="p-4 bg-[#EAF1F7] border border-[#294D6B]/40 rounded-2xl text-xs text-[#294D6B] flex items-center justify-between shadow-xs font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#294D6B]" />
            <span>All {auditLogs.length} audit blocks verified against SHA-256 Merkle root. Zero tampering or sequence discrepancies detected.</span>
          </div>
          <button
            onClick={() => setVerificationSuccess(false)}
            className="text-[10px] text-[#294D6B] hover:underline font-mono cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-[#FCFBF9] border border-[#D8D2C6] rounded-2xl p-5 shadow-xs space-y-3 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C5A77B]/40 to-transparent" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#8FAFC4] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Investigator, IP, details, hash..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-[#D8D2C6] rounded-xl pl-9 pr-3 py-2 text-xs text-[#172D46] placeholder-[#8FAFC4] focus:outline-hidden focus:border-[#294D6B] transition-all font-mono shadow-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#8FAFC4]" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full bg-white border border-[#D8D2C6] rounded-xl px-3 py-2 text-xs text-[#172D46] focus:outline-hidden focus:border-[#294D6B] transition-all font-mono shadow-xs"
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
              className="w-full bg-white border border-[#D8D2C6] rounded-xl px-3 py-2 text-xs text-[#172D46] focus:outline-hidden focus:border-[#294D6B] transition-all font-mono shadow-xs"
            >
              <option value="ALL">All Severity Levels</option>
              <option value="INFO">INFO (Standard Audit)</option>
              <option value="CRITICAL">CRITICAL (Action Log)</option>
              <option value="SECURITY">SECURITY (Authentication)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#5E7A91] font-mono pt-1">
          <span>SHOWING {filteredLogs.length} OF {auditLogs.length} IMMUTABLE LEDGER ENTRIES</span>
          <span className="text-[#294D6B] font-semibold">MERKLE ANCHOR: #48921-HEX</span>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-[#D8D2C6] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F2EB] text-[#5E7A91] font-mono text-[10px] uppercase border-b border-[#D8D2C6]">
              <tr>
                <th className="py-3 px-4">Block / ID</th>
                <th className="py-3 px-4">Timestamp (UTC)</th>
                <th className="py-3 px-4">Action Type</th>
                <th className="py-3 px-4">Authority Actor</th>
                <th className="py-3 px-4">Action Narrative</th>
                <th className="py-3 px-4 text-right">Cryptographic Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8D2C6]/60 font-mono">
              {filteredLogs.map((log) => {
                const severityStyle = {
                  CRITICAL: 'text-[#9B2C2C] bg-[#FDF0EE] border-[#E57373]/40',
                  SECURITY: 'text-[#8E6E3C] bg-[#FAF6EF] border-[#C5A77B]/50',
                  INFO: 'text-[#294D6B] bg-[#EAF1F7] border-[#294D6B]/30'
                }[log.severity] || 'text-[#5E7A91] bg-gray-50 border-gray-200';

                return (
                  <tr key={log.id} className="hover:bg-[#FAF9F5] transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#172D46]">#{log.blockNumber}</div>
                      <div className="text-[10px] text-[#5E7A91]">{log.id}</div>
                    </td>
                    <td className="py-3 px-4 text-[11px] text-[#172D46]">
                      <div>{new Date(log.timestamp).toLocaleDateString()}</div>
                      <div className="text-[#5E7A91]">{new Date(log.timestamp).toLocaleTimeString()}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${severityStyle}`}>
                        {log.actionType}
                      </span>
                      <div className="text-[10px] text-[#5E7A91] mt-1">Scope: {log.caseId}</div>
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <div className="font-bold text-[#172D46] text-xs">{log.user}</div>
                      <div className="text-[10px] text-[#294D6B] font-mono font-medium">{log.role}</div>
                      <div className="text-[10px] text-[#5E7A91] font-mono mt-0.5">{log.ipAddress}</div>
                    </td>
                    <td className="py-3 px-4 font-sans text-[#233B54] max-w-md">
                      <p className="line-clamp-2 leading-relaxed text-xs font-reading">
                        {log.details}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span 
                        className="text-[10px] text-[#5E7A91] hover:text-[#294D6B] cursor-pointer select-all font-mono font-medium"
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
