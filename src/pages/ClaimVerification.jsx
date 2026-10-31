import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  HelpCircle, 
  Filter, 
  Search, 
  ShieldAlert, 
  FileCheck2, 
  Layers, 
  Edit3, 
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import { useCase } from '../context/CaseContext';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';
import { EthicalNoticeBanner } from '../components/common/EthicalNoticeBanner';
import { Modal } from '../components/common/Modal';

export const ClaimVerification = () => {
  const { currentCase, updateClaimStatus } = useCase();
  const { currentUser } = useAuth();

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingClaim, setEditingClaim] = useState(null);
  const [newStatus, setNewStatus] = useState('SUPPORTED');
  const [newExplanation, setNewExplanation] = useState('');

  const claimsList = currentCase.claims || [];

  const filteredClaims = claimsList.filter((claim) => {
    const matchesSearch = 
      claim.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.claimText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.explanation.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || claim.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'SUPPORTED':
        return <CheckCircle2 className="w-4 h-4 text-sky-400 drop-shadow-[0_0_6px_rgba(14,165,233,0.8)]" />;
      case 'CONTRADICTED':
        return <XCircle className="w-4 h-4 text-rose-400 drop-shadow-[0_0_6px_rgba(255,0,127,0.8)]" />;
      case 'PARTIALLY SUPPORTED':
        return <AlertCircle className="w-4 h-4 text-rose-300 drop-shadow-[0_0_6px_rgba(255,0,127,0.6)]" />;
      case 'UNVERIFIED':
      default:
        return <HelpCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  const handleOpenEdit = (claim) => {
    setEditingClaim(claim);
    setNewStatus(claim.status);
    setNewExplanation(claim.explanation);
  };

  const handleSaveClaim = (e) => {
    e.preventDefault();
    if (editingClaim) {
      updateClaimStatus(editingClaim.id, newStatus, newExplanation);
      setEditingClaim(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">4-Tier Claim Verification Matrix</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-sky-950/40 border border-sky-400/40 text-sky-300 font-mono text-[10px] shadow-[0_0_10px_rgba(14,165,233,0.3)]">
              EVIDENTIARY CORROBORATION
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Case Ref: <span className="text-sky-300 font-mono font-medium">{currentCase.id}</span> • Multi-agency evidentiary corroboration against physical & digital logs
          </p>
        </div>

        {/* Status Count Summary Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-xl bg-sky-950/40 text-sky-300 border border-sky-400/50 text-xs font-mono shadow-[0_0_12px_rgba(14,165,233,0.2)]">
            {claimsList.filter(c => c.status === 'SUPPORTED').length} Supported (Cerulean)
          </span>
          <span className="px-3 py-1 rounded-xl bg-rose-950/50 text-rose-300 border border-rose-500/50 text-xs font-mono shadow-[0_0_12px_rgba(255,0,127,0.25)]">
            {claimsList.filter(c => c.status === 'CONTRADICTED').length} Contradicted (Neon Rose)
          </span>
          <span className="px-3 py-1 rounded-xl bg-rose-950/30 text-rose-200 border border-rose-400/40 text-xs font-mono shadow-[0_0_8px_rgba(255,0,127,0.15)]">
            {claimsList.filter(c => c.status === 'PARTIALLY SUPPORTED').length} Partial (Rose Subtle)
          </span>
          <span className="px-3 py-1 rounded-xl bg-white/[0.04] text-slate-300 border border-white/10 text-xs font-mono">
            {claimsList.filter(c => c.status === 'UNVERIFIED').length} Unverified (Jet Glass)
          </span>
        </div>
      </div>

      <EthicalNoticeBanner />

      {/* Search and Filters */}
      <div className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.6)] space-y-3 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-400/30 to-transparent" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search claims by keyword, claim ID, category, or explanation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-sky-400 transition-all font-mono"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-hidden focus:border-sky-400 transition-all font-mono"
            >
              <option value="ALL">All 4-Tier Statuses</option>
              <option value="SUPPORTED">SUPPORTED (Cerulean)</option>
              <option value="CONTRADICTED">CONTRADICTED (Neon Rose)</option>
              <option value="PARTIALLY SUPPORTED">PARTIALLY SUPPORTED</option>
              <option value="UNVERIFIED">UNVERIFIED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Claims List */}
      <div className="space-y-4">
        {filteredClaims.map((claim) => (
          <div
            key={claim.id}
            className="bg-black/60 backdrop-blur-2xl border border-white/10 hover:border-white/20 rounded-2xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.6)] transition-all relative overflow-hidden group"
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

            {/* Top row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-white/10 mb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs text-sky-300 px-2.5 py-0.5 rounded-lg bg-sky-950/30 border border-sky-400/40">
                  {claim.id}
                </span>
                <span className="text-xs text-slate-400 font-mono">Category: {claim.category}</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
                  <span>Confidence:</span>
                  <span className="text-white font-semibold">{Math.round(claim.confidence * 100)}%</span>
                </div>
                <Badge variant={claim.status} size="md">
                  {getStatusIcon(claim.status)}
                  <span>{claim.status}</span>
                </Badge>
              </div>
            </div>

            {/* Extracted Claim Statement */}
            <div className="text-xs font-medium text-white bg-white/[0.02] p-3.5 rounded-xl border border-white/10 leading-relaxed shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
              "{claim.claimText}"
            </div>

            {/* Objective Corroboration Explanation */}
            <div className="mt-3">
              <span className="text-[10px] font-mono text-sky-400 uppercase tracking-wider block mb-1">
                Objective Factual Corroboration / Contradiction Analysis
              </span>
              <p className="text-xs text-slate-300 leading-relaxed bg-black/40 p-3.5 rounded-xl border border-white/10">
                {claim.explanation}
              </p>
            </div>

            {/* Missing Information Gap Alert */}
            {claim.missingInformation && (
              <div className="mt-3 p-3 rounded-xl bg-rose-950/25 border border-rose-500/40 text-xs text-rose-300/90 flex items-start gap-2.5 shadow-[0_0_12px_rgba(255,0,127,0.15)]">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5 drop-shadow-[0_0_6px_rgba(255,0,127,0.8)]" />
                <div>
                  <span className="font-semibold text-rose-300 block font-mono text-[10px] uppercase">
                    Investigative Gap / Missing Telemetry:
                  </span>
                  <p className="mt-0.5 text-rose-200/80 text-[11px] leading-relaxed">
                    {claim.missingInformation}
                  </p>
                </div>
              </div>
            )}

            {/* Bottom Row */}
            <div className="mt-4 pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-400">LINKED EVIDENCE:</span>
                {claim.corroboratingEvidenceIds.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {claim.corroboratingEvidenceIds.map((evId) => (
                      <span
                        key={evId}
                        className="px-2 py-0.5 bg-sky-950/40 text-sky-300 border border-sky-400/40 rounded-md text-[10px] font-mono shadow-[0_0_6px_rgba(14,165,233,0.25)]"
                      >
                        {evId}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-500 italic">No corroborating items logged</span>
                )}
              </div>

              <button
                onClick={() => handleOpenEdit(claim)}
                className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-sky-500/20 text-slate-200 text-xs font-medium border border-white/10 hover:border-sky-400/40 flex items-center gap-1.5 transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] self-end sm:self-auto"
              >
                <Edit3 className="w-3.5 h-3.5 text-sky-400" />
                <span>Adjust Corroboration</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Adjust Claim Status Modal */}
      {editingClaim && (
        <Modal
          isOpen={!!editingClaim}
          onClose={() => setEditingClaim(null)}
          title={`Adjust Corroboration Status: ${editingClaim.id}`}
          subtitle="Modifications are written to the immutable investigation ledger"
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleSaveClaim} className="space-y-4 text-xs">
            <div className="p-3.5 bg-white/[0.02] rounded-xl border border-white/10">
              <span className="text-[10px] font-mono text-sky-400 block mb-1">CLAIM STATEMENT</span>
              <p className="text-white font-medium">"{editingClaim.claimText}"</p>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Verification Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-sky-400 font-mono"
              >
                <option value="SUPPORTED">SUPPORTED (Corroborated by independent logs)</option>
                <option value="CONTRADICTED">CONTRADICTED (Factual mismatch with telemetry/physical evidence)</option>
                <option value="PARTIALLY SUPPORTED">PARTIALLY SUPPORTED (Substance verified, minor drift/details differ)</option>
                <option value="UNVERIFIED">UNVERIFIED (Insufficient records or pending lab report)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Investigative Explanation & Rationale</label>
              <textarea
                rows={4}
                required
                value={newExplanation}
                onChange={(e) => setNewExplanation(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-sky-400 leading-relaxed"
                placeholder="Detail the technical telemetry or forensic findings supporting this determination..."
              />
            </div>

            <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/40 text-[11px] text-rose-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
              <span>Mandate: Ensure explanations describe electronic consistency without judging psychological intent.</span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingClaim(null)}
                className="px-3.5 py-1.5 bg-white/[0.05] text-slate-300 rounded-xl border border-white/10"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-gradient-to-r from-sky-500 to-rose-600 text-white font-semibold rounded-xl shadow-[0_0_15px_rgba(14,165,233,0.3)]"
              >
                Commit Determination
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
