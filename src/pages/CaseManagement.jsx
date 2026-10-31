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
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header and Multi-Agency Intake Policy Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-serif-clean text-2xl sm:text-3xl font-bold text-[#172D46] tracking-tight">
            Assigned Investigation Cases
          </h1>
          <p className="text-xs text-[#5E7A91] mt-1 font-sans">
            Official case docket assigned to your jurisdiction and clearance credentials.
          </p>
        </div>

        {/* Multi-Agency Intake Policy Banner */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#D8D2C6] text-xs text-[#294D6B] shadow-2xs font-sans">
          <Lock className="w-3.5 h-3.5 text-[#294D6B] shrink-0" />
          <span>Cases ingested automatically via secure 911/CAD &amp; Legal dispatch bridges.</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white/90 backdrop-blur-md border border-[#D8D2C6] rounded-2xl p-5 shadow-[0_4px_20px_rgba(23,45,70,0.05)] space-y-3 relative overflow-hidden">
        {/* Subtle Antique Gold top accent hairline */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C5A77B]/40 to-transparent" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#8FAFC4] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Case ID, keyword, investigator..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#F8F6F1] border border-[#D8D2C6] rounded-xl pl-9 pr-3 py-2 text-xs text-[#172D46] placeholder-[#8FAFC4] focus:outline-hidden focus:border-[#294D6B] focus:ring-1 focus:ring-[#294D6B]/30 transition-all font-mono"
            />
          </div>

          {/* Status Filter Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#8FAFC4]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-[#F8F6F1] border border-[#D8D2C6] rounded-xl px-3 py-2 text-xs text-[#172D46] focus:outline-hidden focus:border-[#294D6B] focus:ring-1 focus:ring-[#294D6B]/30 transition-all font-sans font-medium"
            >
              <option value="ALL">All Investigation Statuses</option>
              <option value="Active Investigation">Active Investigation</option>
              <option value="Verification Phase">Verification Phase</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Priority Filter Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full bg-[#F8F6F1] border border-[#D8D2C6] rounded-xl px-3 py-2 text-xs text-[#172D46] focus:outline-hidden focus:border-[#294D6B] focus:ring-1 focus:ring-[#294D6B]/30 transition-all font-sans font-medium"
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#5E7A91] font-mono pt-1 border-t border-[#E8E4DC]">
          <span>SHOWING {filteredCases.length} OF {cases.length} ASSIGNED DOSSIERS</span>
          <span className="text-[#294D6B] font-bold">ENCRYPTED CASE VAULT ACTIVE</span>
        </div>
      </div>

      {/* Cases Docket Grid matching Images 2 & 3 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredCases.map((caseItem) => {
          const isSelected = caseItem.id === currentCase.id;

          return (
            <div
              key={caseItem.id}
              className={`bg-[#FCFBF9] border rounded-2xl p-6 transition-all duration-300 shadow-[0_4px_20px_rgba(23,45,70,0.05)] hover:shadow-[0_8px_30px_rgba(23,45,70,0.1)] flex flex-col justify-between relative overflow-hidden group ${
                isSelected
                  ? 'border-[#294D6B] ring-2 ring-[#294D6B]/20'
                  : 'border-[#D8D2C6] hover:border-[#8FAFC4]'
              }`}
            >
              {/* Subtle top accent highlight */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C5A77B]/40 to-transparent group-hover:via-[#C5A77B]/80 transition-all" />

              <div>
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-[#294D6B]">
                      {caseItem.id}
                    </span>
                    {isSelected && (
                      <span className="px-2 py-0.5 rounded-md bg-[#294D6B] text-[#E8E4DC] text-[10px] font-mono font-bold shadow-2xs">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge variant={caseItem.priority} size="sm">
                      {caseItem.priority}
                    </Badge>
                    <Badge variant={caseItem.status} size="sm">
                      {caseItem.status}
                    </Badge>
                  </div>
                </div>

                <h3 className="font-serif-clean text-base font-bold text-[#172D46] line-clamp-1 group-hover:text-[#294D6B] transition-colors">
                  {caseItem.title}
                </h3>
                <p className="text-xs text-[#5E7A91] mt-0.5 font-sans font-medium">
                  {caseItem.incidentType}
                </p>

                <p className="text-xs text-[#233B54] mt-3 line-clamp-2 leading-relaxed bg-[#F8F6F1] p-3 rounded-xl border border-[#E0D9CD] font-sans">
                  {caseItem.summary}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] border-t border-[#E8E4DC] pt-3">
                  <div>
                    <span className="text-[#8FAFC4] block font-mono text-[10px] uppercase font-semibold">LEAD DETECTIVE</span>
                    <span className="text-[#172D46] font-sans font-semibold">{caseItem.leadInvestigator}</span>
                  </div>
                  <div>
                    <span className="text-[#8FAFC4] block font-mono text-[10px] uppercase font-semibold">DATE OCCURRED</span>
                    <span className="text-[#172D46] font-mono">
                      {new Date(caseItem.dateOccurred).toLocaleDateString()} {new Date(caseItem.dateOccurred).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Soft Ivory Secondary + Steel Blue Primary */}
              <div className="mt-5 pt-3.5 border-t border-[#E8E4DC] flex items-center justify-between gap-3">
                <button
                  onClick={() => setSelectedCaseForModal(caseItem)}
                  className="px-3.5 py-1.5 bg-white hover:bg-[#F8F6F1] text-[#294D6B] rounded-xl text-xs font-semibold border border-[#D8D2C6] hover:border-[#294D6B] transition-all shadow-2xs font-sans"
                >
                  View Case Details
                </button>

                <button
                  onClick={() => {
                    selectCase(caseItem.id);
                    navigate('/statement-review');
                  }}
                  className="px-4 py-1.5 bg-[#294D6B] hover:bg-[#172D46] text-[#E8E4DC] rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-[0_2px_10px_rgba(41,77,107,0.25)] hover:shadow-[0_4px_16px_rgba(23,45,70,0.35)] transition-all font-sans"
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
            <div className="p-4 bg-[#F8F6F1] border border-[#D8D2C6] rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[#294D6B] font-bold">{selectedCaseForModal.id}</span>
                <Badge variant={selectedCaseForModal.clearanceLevel.split('//')[0].trim()} size="sm">
                  {selectedCaseForModal.clearanceLevel}
                </Badge>
              </div>
              <h4 className="font-serif-clean text-base font-bold text-[#172D46]">{selectedCaseForModal.title}</h4>
              <p className="text-xs text-[#233B54] mt-1 leading-relaxed font-sans">{selectedCaseForModal.summary}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="p-3 bg-[#F8F6F1] border border-[#D8D2C6] rounded-xl">
                <span className="text-[10px] text-[#8FAFC4] font-mono block font-semibold">JURISDICTION</span>
                <span className="font-semibold text-[#172D46]">{selectedCaseForModal.jurisdiction}</span>
              </div>
              <div className="p-3 bg-[#F8F6F1] border border-[#D8D2C6] rounded-xl">
                <span className="text-[10px] text-[#8FAFC4] font-mono block font-semibold">LEAD DETECTIVE</span>
                <span className="font-semibold text-[#172D46]">{selectedCaseForModal.leadInvestigator}</span>
              </div>
              <div className="p-3 bg-[#F8F6F1] border border-[#D8D2C6] rounded-xl">
                <span className="text-[10px] text-[#8FAFC4] font-mono block font-semibold">VICTIM / WITNESS REF</span>
                <span className="font-mono text-[#294D6B] font-semibold">{selectedCaseForModal.victimId} ({selectedCaseForModal.victimPseudonym})</span>
              </div>
            </div>

            <div className="p-3.5 bg-[#F8F6F1] border border-[#D8D2C6] rounded-xl space-y-1.5">
              <span className="text-[10px] font-mono text-[#294D6B] uppercase tracking-wider block font-bold">
                Multi-Agency Intake Records
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-[#5E7A91]">Incident Timestamp:</span>{' '}
                  <span className="font-mono text-[#172D46] font-semibold">{selectedCaseForModal.dateOccurred}</span>
                </div>
                <div>
                  <span className="text-[#5E7A91]">Automated Intake Timestamp:</span>{' '}
                  <span className="font-mono text-[#172D46] font-semibold">{selectedCaseForModal.dateIntake}</span>
                </div>
                <div>
                  <span className="text-[#5E7A91]">Evidence Count:</span>{' '}
                  <span className="font-mono text-[#172D46] font-semibold">{selectedCaseForModal.evidence.length} items logged</span>
                </div>
                <div>
                  <span className="text-[#5E7A91]">Claims Extracted:</span>{' '}
                  <span className="font-mono text-[#172D46] font-semibold">{selectedCaseForModal.claims.length} claims verified</span>
                </div>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono text-[#294D6B] uppercase tracking-wider block mb-2 font-bold">
                Open Investigation Modules
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => {
                    selectCase(selectedCaseForModal.id);
                    setSelectedCaseForModal(null);
                    navigate('/statement-review');
                  }}
                  className="p-2.5 bg-white hover:bg-[#EAF1F7] border border-[#D8D2C6] hover:border-[#294D6B] rounded-xl text-[#172D46] text-center flex flex-col items-center gap-1 transition-all shadow-2xs font-sans font-medium"
                >
                  <FileText className="w-4 h-4 text-[#294D6B]" />
                  <span>Statement Review</span>
                </button>
                <button
                  onClick={() => {
                    selectCase(selectedCaseForModal.id);
                    setSelectedCaseForModal(null);
                    navigate('/evidence');
                  }}
                  className="p-2.5 bg-white hover:bg-[#EAF1F7] border border-[#D8D2C6] hover:border-[#294D6B] rounded-xl text-[#172D46] text-center flex flex-col items-center gap-1 transition-all shadow-2xs font-sans font-medium"
                >
                  <FolderLock className="w-4 h-4 text-[#294D6B]" />
                  <span>Evidence Explorer</span>
                </button>
                <button
                  onClick={() => {
                    selectCase(selectedCaseForModal.id);
                    setSelectedCaseForModal(null);
                    navigate('/timeline');
                  }}
                  className="p-2.5 bg-white hover:bg-[#EAF1F7] border border-[#D8D2C6] hover:border-[#294D6B] rounded-xl text-[#172D46] text-center flex flex-col items-center gap-1 transition-all shadow-2xs font-sans font-medium"
                >
                  <Clock className="w-4 h-4 text-[#294D6B]" />
                  <span>Incident Timeline</span>
                </button>
                <button
                  onClick={() => {
                    selectCase(selectedCaseForModal.id);
                    setSelectedCaseForModal(null);
                    navigate('/reports');
                  }}
                  className="p-2.5 bg-white hover:bg-[#EAF1F7] border border-[#D8D2C6] hover:border-[#294D6B] rounded-xl text-[#172D46] text-center flex flex-col items-center gap-1 transition-all shadow-2xs font-sans font-medium"
                >
                  <Share2 className="w-4 h-4 text-[#294D6B]" />
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
