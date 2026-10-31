import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Briefcase, 
  Calendar, 
  ShieldCheck, 
  ChevronRight, 
  FileText, 
  FolderLock, 
  Clock, 
  Share2, 
  AlertCircle,
  CheckCircle2,
  Lock,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useCase } from '../context/CaseContext';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';

export const CaseManagement = () => {
  const navigate = useNavigate();
  const { cases, currentCase, selectCase } = useCase();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [selectedCaseForModal, setSelectedCaseForModal] = useState(null);

  const filteredCases = cases.filter((c) => {
    const matchesSearch = 
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.incidentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.leadInvestigator.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || c.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6">
      {/* Header and Intake Notice */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Assigned Investigation Cases</h1>
          <p className="text-xs text-slate-400 mt-1">
            Official case docket assigned to your jurisdiction and clearance credentials.
          </p>
        </div>

        {/* Multi-Agency Intake Policy Banner */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] backdrop-blur-xl border border-white/10 text-xs text-slate-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
          <Lock className="w-3.5 h-3.5 text-sky-400 shrink-0 drop-shadow-[0_0_6px_rgba(14,165,233,0.8)]" />
          <span>Cases ingested automatically via secure 911/CAD & Legal dispatch bridges.</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.6)] space-y-3 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-400/30 to-transparent" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Case ID, keyword, investigator..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-sky-400 focus:shadow-[0_0_12px_rgba(14,165,233,0.3)] transition-all font-mono"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-hidden focus:border-sky-400 transition-all font-mono"
            >
              <option value="ALL">All Investigation Statuses</option>
              <option value="Active Investigation">Active Investigation</option>
              <option value="Verification Phase">Verification Phase</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-2">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-hidden focus:border-rose-400 transition-all font-mono"
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">High Priority (Neon Rose)</option>
              <option value="MEDIUM">Medium Priority (Cerulean)</option>
              <option value="LOW">Low Priority</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
          <span>SHOWING {filteredCases.length} OF {cases.length} ASSIGNED DOSSIERS</span>
          <span className="text-sky-400">ENCRYPTED CASE VAULT ACTIVE</span>
        </div>
      </div>

      {/* Cases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCases.map((caseItem) => {
          const isSelected = caseItem.id === currentCase.id;

          return (
            <div
              key={caseItem.id}
              className={`bg-black/60 backdrop-blur-2xl border rounded-2xl p-6 transition-all duration-300 shadow-[0_8px_32px_0_rgba(0,0,0,0.6)] flex flex-col justify-between relative overflow-hidden group ${
                isSelected
                  ? 'border-sky-400/60 shadow-[0_0_25px_rgba(14,165,233,0.25)]'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              {/* Specular highlight */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-sky-300">
                      {caseItem.id}
                    </span>
                    {isSelected && (
                      <span className="px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 text-[10px] font-mono border border-sky-400/30 shadow-[0_0_8px_rgba(14,165,233,0.3)]">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant={caseItem.priority} size="sm">
                      {caseItem.priority}
                    </Badge>
                    <Badge variant={caseItem.status} size="sm">
                      {caseItem.status}
                    </Badge>
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-white line-clamp-1">{caseItem.title}</h3>
                <p className="text-xs text-sky-400/80 mt-0.5 font-mono">{caseItem.incidentType}</p>

                <p className="text-xs text-slate-300 mt-3 line-clamp-2 leading-relaxed bg-white/[0.02] p-3 rounded-xl border border-white/10">
                  {caseItem.summary}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-slate-400 border-t border-white/10 pt-3">
                  <div>
                    <span className="text-slate-400 block font-mono text-[10px]">LEAD DETECTIVE</span>
                    <span className="text-slate-200">{caseItem.leadInvestigator}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-mono text-[10px]">DATE OCCURRED</span>
                    <span className="text-slate-200 font-mono">
                      {new Date(caseItem.dateOccurred).toLocaleDateString()} {new Date(caseItem.dateOccurred).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedCaseForModal(caseItem)}
                  className="px-3.5 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 rounded-xl text-xs font-medium border border-white/10 transition-colors shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]"
                >
                  View Case Details
                </button>

                <button
                  onClick={() => {
                    selectCase(caseItem.id);
                    navigate('/statement-review');
                  }}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-sky-500 to-rose-600 hover:from-sky-400 hover:to-rose-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_18px_rgba(14,165,233,0.3)] transition-all"
                >
                  <span>Open Investigation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Case Details Modal */}
      {selectedCaseForModal && (
        <Modal
          isOpen={!!selectedCaseForModal}
          onClose={() => setSelectedCaseForModal(null)}
          title={`Case File Docket: ${selectedCaseForModal.id}`}
          subtitle={selectedCaseForModal.incidentType}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-white/[0.02] border border-white/10 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sky-400 font-semibold">{selectedCaseForModal.id}</span>
                <Badge variant={selectedCaseForModal.clearanceLevel.split('//')[0].trim()} size="sm">
                  {selectedCaseForModal.clearanceLevel}
                </Badge>
              </div>
              <h4 className="text-sm font-semibold text-white">{selectedCaseForModal.title}</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{selectedCaseForModal.summary}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="p-3 bg-white/[0.02] border border-white/10 rounded-xl">
                <span className="text-[10px] text-slate-400 font-mono block">JURISDICTION</span>
                <span className="font-medium text-slate-200">{selectedCaseForModal.jurisdiction}</span>
              </div>
              <div className="p-3 bg-white/[0.02] border border-white/10 rounded-xl">
                <span className="text-[10px] text-slate-400 font-mono block">LEAD DETECTIVE</span>
                <span className="font-medium text-slate-200">{selectedCaseForModal.leadInvestigator}</span>
              </div>
              <div className="p-3 bg-white/[0.02] border border-white/10 rounded-xl">
                <span className="text-[10px] text-slate-400 font-mono block">VICTIM / WITNESS REF</span>
                <span className="font-mono text-sky-300">{selectedCaseForModal.victimId} ({selectedCaseForModal.victimPseudonym})</span>
              </div>
            </div>

            <div className="p-3.5 bg-white/[0.02] border border-white/10 rounded-xl space-y-1.5">
              <span className="text-[10px] font-mono text-sky-400 uppercase tracking-wider block">
                Multi-Agency Intake Records
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400">Incident Timestamp:</span>{' '}
                  <span className="font-mono text-slate-200">{selectedCaseForModal.dateOccurred}</span>
                </div>
                <div>
                  <span className="text-slate-400">Automated Intake Timestamp:</span>{' '}
                  <span className="font-mono text-slate-200">{selectedCaseForModal.dateIntake}</span>
                </div>
                <div>
                  <span className="text-slate-400">Evidence Count:</span>{' '}
                  <span className="font-mono text-slate-200">{selectedCaseForModal.evidence.length} items logged</span>
                </div>
                <div>
                  <span className="text-slate-400">Claims Extracted:</span>{' '}
                  <span className="font-mono text-slate-200">{selectedCaseForModal.claims.length} claims verified</span>
                </div>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono text-sky-400 uppercase tracking-wider block mb-2">
                Open Investigation Modules
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => {
                    selectCase(selectedCaseForModal.id);
                    setSelectedCaseForModal(null);
                    navigate('/statement-review');
                  }}
                  className="p-2.5 bg-white/[0.03] hover:bg-sky-500/15 border border-white/10 hover:border-sky-400/40 rounded-xl text-slate-200 text-center flex flex-col items-center gap-1 transition-all"
                >
                  <FileText className="w-4 h-4 text-sky-400" />
                  <span>Statement Review</span>
                </button>
                <button
                  onClick={() => {
                    selectCase(selectedCaseForModal.id);
                    setSelectedCaseForModal(null);
                    navigate('/evidence');
                  }}
                  className="p-2.5 bg-white/[0.03] hover:bg-rose-500/15 border border-white/10 hover:border-rose-400/40 rounded-xl text-slate-200 text-center flex flex-col items-center gap-1 transition-all"
                >
                  <FolderLock className="w-4 h-4 text-rose-400" />
                  <span>Evidence Explorer</span>
                </button>
                <button
                  onClick={() => {
                    selectCase(selectedCaseForModal.id);
                    setSelectedCaseForModal(null);
                    navigate('/timeline');
                  }}
                  className="p-2.5 bg-white/[0.03] hover:bg-sky-500/15 border border-white/10 hover:border-sky-400/40 rounded-xl text-slate-200 text-center flex flex-col items-center gap-1 transition-all"
                >
                  <Clock className="w-4 h-4 text-sky-400" />
                  <span>Incident Timeline</span>
                </button>
                <button
                  onClick={() => {
                    selectCase(selectedCaseForModal.id);
                    setSelectedCaseForModal(null);
                    navigate('/reports');
                  }}
                  className="p-2.5 bg-white/[0.03] hover:bg-rose-500/15 border border-white/10 hover:border-rose-400/40 rounded-xl text-slate-200 text-center flex flex-col items-center gap-1 transition-all"
                >
                  <Share2 className="w-4 h-4 text-rose-400" />
                  <span>Formal Dossier</span>
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
