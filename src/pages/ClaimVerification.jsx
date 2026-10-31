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
        return <CheckCircle2 className="w-4 h-4 text-[#294D6B]" />;
      case 'CONTRADICTED':
        return <XCircle className="w-4 h-4 text-[#9B2C2C]" />;
      case 'PARTIALLY SUPPORTED':
        return <AlertCircle className="w-4 h-4 text-[#C5A77B]" />;
      case 'UNVERIFIED':
      default:
        return <HelpCircle className="w-4 h-4 text-[#8FAFC4]" />;
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
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif-clean text-2xl font-bold text-[#172D46] tracking-tight">4-Tier Claim Verification Matrix</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#EAF1F7] border border-[#294D6B]/30 text-[#294D6B] font-mono text-[10px] font-semibold">
              EVIDENTIARY CORROBORATION
            </span>
          </div>
          <p className="text-xs text-[#5E7A91] mt-1">
            Case Ref: <span className="text-[#294D6B] font-mono font-medium">{currentCase.id}</span> • Multi-agency evidentiary corroboration against physical & digital logs
          </p>
        </div>

        {/* Status Count Summary Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-xl bg-[#EAF1F7] text-[#294D6B] border border-[#294D6B]/30 text-xs font-mono font-medium shadow-xs">
            {claimsList.filter(c => c.status === 'SUPPORTED').length} Supported
          </span>
          <span className="px-3 py-1 rounded-xl bg-[#FDF0EE] text-[#9B2C2C] border border-[#E57373]/40 text-xs font-mono font-medium shadow-xs">
            {claimsList.filter(c => c.status === 'CONTRADICTED').length} Contradicted
          </span>
          <span className="px-3 py-1 rounded-xl bg-[#FAF6EF] text-[#8E6E3C] border border-[#C5A77B]/50 text-xs font-mono font-medium shadow-xs">
            {claimsList.filter(c => c.status === 'PARTIALLY SUPPORTED').length} Partial
          </span>
          <span className="px-3 py-1 rounded-xl bg-white text-[#5E7A91] border border-[#D8D2C6] text-xs font-mono shadow-xs">
            {claimsList.filter(c => c.status === 'UNVERIFIED').length} Unverified
          </span>
        </div>
      </div>

      <EthicalNoticeBanner />

      {/* Search and Filters */}
      <div className="bg-[#FCFBF9] border border-[#D8D2C6] rounded-2xl p-5 shadow-xs space-y-3 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C5A77B]/40 to-transparent" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-[#8FAFC4] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search claims by keyword, claim ID, category, or explanation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-[#D8D2C6] rounded-xl pl-9 pr-3 py-2 text-xs text-[#172D46] placeholder-[#8FAFC4] focus:outline-hidden focus:border-[#294D6B] transition-all font-mono shadow-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#8FAFC4]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-white border border-[#D8D2C6] rounded-xl px-3 py-2 text-xs text-[#172D46] focus:outline-hidden focus:border-[#294D6B] transition-all font-mono shadow-xs"
            >
              <option value="ALL">All 4-Tier Statuses</option>
              <option value="SUPPORTED">SUPPORTED (Corroborated)</option>
              <option value="CONTRADICTED">CONTRADICTED (Factual Mismatch)</option>
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
            className="bg-[#FCFBF9] border border-[#D8D2C6] hover:border-[#294D6B] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C5A77B]/40 to-transparent" />

            {/* Top row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-[#D8D2C6]/70 mb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs text-[#294D6B] px-2.5 py-0.5 rounded-lg bg-[#EAF1F7] border border-[#294D6B]/30">
                  {claim.id}
                </span>
                <span className="text-xs text-[#5E7A91] font-mono">Category: {claim.category}</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs font-mono text-[#5E7A91]">
                  <span>Confidence:</span>
                  <span className="text-[#172D46] font-semibold">{Math.round(claim.confidence * 100)}%</span>
                </div>
                <Badge variant={claim.status} size="md">
                  {getStatusIcon(claim.status)}
                  <span>{claim.status}</span>
                </Badge>
              </div>
            </div>

            {/* Extracted Claim Statement */}
            <div className="text-xs font-medium text-[#172D46] bg-white p-3.5 rounded-xl border border-[#D8D2C6] leading-relaxed shadow-xs font-reading">
              "{claim.claimText}"
            </div>

            {/* Objective Corroboration Explanation */}
            <div className="mt-3">
              <span className="text-[10px] font-mono text-[#294D6B] uppercase tracking-wider block mb-1 font-semibold">
                Objective Factual Corroboration / Contradiction Analysis
              </span>
              <p className="text-xs text-[#233B54] leading-relaxed bg-[#F5F2EB]/60 p-3.5 rounded-xl border border-[#D8D2C6]">
                {claim.explanation}
              </p>
            </div>

            {/* Missing Information Gap Alert */}
            {claim.missingInformation && (
              <div className="mt-3 p-3 rounded-xl bg-[#FAF6EF] border border-[#C5A77B]/50 text-xs text-[#8E6E3C] flex items-start gap-2.5 shadow-xs">
                <AlertCircle className="w-4 h-4 text-[#C5A77B] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#8E6E3C] block font-mono text-[10px] uppercase">
                    Investigative Gap / Missing Telemetry:
                  </span>
                  <p className="mt-0.5 text-[#5B4727] text-[11px] leading-relaxed">
                    {claim.missingInformation}
                  </p>
                </div>
              </div>
            )}

            {/* Bottom Row */}
            <div className="mt-4 pt-3 border-t border-[#D8D2C6]/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-[#5E7A91]">LINKED EVIDENCE:</span>
                {claim.corroboratingEvidenceIds.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {claim.corroboratingEvidenceIds.map((evId) => (
                      <span
                        key={evId}
                        className="px-2 py-0.5 bg-[#EAF1F7] text-[#294D6B] border border-[#294D6B]/30 rounded-md text-[10px] font-mono font-medium shadow-xs"
                      >
                        {evId}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-[11px] text-[#8FAFC4] italic">No corroborating items logged</span>
                )}
              </div>

              <button
                onClick={() => handleOpenEdit(claim)}
                className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#EAF1F7] text-[#294D6B] text-xs font-medium border border-[#D8D2C6] hover:border-[#294D6B] flex items-center gap-1.5 transition-all shadow-xs self-end sm:self-auto cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#294D6B]" />
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
            <div className="p-3.5 bg-white rounded-xl border border-[#D8D2C6] shadow-xs">
              <span className="text-[10px] font-mono text-[#294D6B] block mb-1 font-semibold">CLAIM STATEMENT</span>
              <p className="text-[#172D46] font-medium font-reading">"{editingClaim.claimText}"</p>
            </div>

            <div>
              <label className="block text-[#172D46] font-semibold mb-1">Verification Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full bg-white border border-[#D8D2C6] rounded-xl px-3 py-2 text-[#172D46] focus:outline-hidden focus:border-[#294D6B] font-mono shadow-xs"
              >
                <option value="SUPPORTED">SUPPORTED (Corroborated by independent logs)</option>
                <option value="CONTRADICTED">CONTRADICTED (Factual mismatch with telemetry/physical evidence)</option>
                <option value="PARTIALLY SUPPORTED">PARTIALLY SUPPORTED (Substance verified, minor drift/details differ)</option>
                <option value="UNVERIFIED">UNVERIFIED (Insufficient records or pending lab report)</option>
              </select>
            </div>

            <div>
              <label className="block text-[#172D46] font-semibold mb-1">Investigative Explanation & Rationale</label>
              <textarea
                rows={4}
                required
                value={newExplanation}
                onChange={(e) => setNewExplanation(e.target.value)}
                className="w-full bg-white border border-[#D8D2C6] rounded-xl px-3 py-2 text-[#172D46] focus:outline-hidden focus:border-[#294D6B] leading-relaxed shadow-xs"
                placeholder="Detail the technical telemetry or forensic findings supporting this determination..."
              />
            </div>

            <div className="p-3 rounded-xl bg-[#FAF6EF] border border-[#C5A77B]/50 text-[11px] text-[#8E6E3C] flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-[#C5A77B]" />
              <span>Mandate: Ensure explanations describe electronic consistency without judging psychological intent.</span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingClaim(null)}
                className="px-3.5 py-1.5 bg-white text-[#5E7A91] hover:text-[#172D46] rounded-xl border border-[#D8D2C6] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#294D6B] hover:bg-[#172D46] text-white font-medium rounded-xl shadow-xs transition-colors cursor-pointer"
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
