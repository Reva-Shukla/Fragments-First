import React, { useState } from 'react';
import { 
  FolderLock, 
  Search, 
  Upload, 
  FileText, 
  Video, 
  PhoneCall, 
  Cpu, 
  Ambulance, 
  Building2, 
  ShieldCheck, 
  Clock, 
  Hash, 
  ExternalLink, 
  Filter, 
  Check, 
  Download,
  AlertCircle
} from 'lucide-react';
import { useCase } from '../context/CaseContext';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';

export const EvidenceExplorer = () => {
  const { currentCase, recordAction } = useCase();
  const { currentUser } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const [uploadForm, setUploadForm] = useState({
    title: '',
    source: 'District 4 Transit Police',
    sourceType: 'Surveillance Video',
    custodyOfficer: currentUser?.name || 'Investigator',
    linkedClaims: ['CLM-01'],
    summary: ''
  });

  const evidenceList = currentCase.evidence || [];

  const filteredEvidence = evidenceList.filter((item) => {
    const matchesSearch = 
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'ALL' || item.sourceType === typeFilter;

    return matchesSearch && matchesType;
  });

  const getSourceIcon = (sourceType) => {
    switch (sourceType) {
      case 'Surveillance Video':
        return Video;
      case 'Emergency Audio & Telemetry':
        return PhoneCall;
      case 'Police Bodycam':
        return ShieldCheck;
      case 'Sensor & Telemetry Log':
        return Cpu;
      case 'Paramedic Triage Log':
        return Ambulance;
      case 'Hospital ER Record':
        return Building2;
      default:
        return FileText;
    }
  };

  const handleSimulatedUpload = (e) => {
    e.preventDefault();
    recordAction(
      'EVIDENCE_UPLOADED',
      `Manual evidence upload initiated for [${uploadForm.title}] by ${uploadForm.custodyOfficer}. SHA-256 calculated.`,
      'CRITICAL'
    );
    setIsUploadModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif-clean text-2xl sm:text-3xl font-bold text-[#172D46] tracking-tight">
              Evidence Explorer &amp; Chain of Custody
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#EAF1F7] border border-[#8FAFC4]/60 text-[#294D6B] font-mono text-[10px] font-bold shadow-2xs">
              EVIDENTIARY VAULT
            </span>
          </div>
          <p className="text-xs text-[#5E7A91] mt-1 font-sans">
            Case Ref: <span className="text-[#294D6B] font-mono font-semibold">{currentCase.id}</span> • Multi-Agency Ingest: 911 CAD, SCADA, Axon BWC, EMS, Hospital HL7
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="px-4 py-2 bg-[#294D6B] hover:bg-[#172D46] text-[#E8E4DC] text-xs font-semibold rounded-xl flex items-center gap-2 shadow-[0_2px_10px_rgba(41,77,107,0.25)] hover:shadow-[0_4px_16px_rgba(23,45,70,0.35)] transition-all self-start md:self-auto font-sans"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Evidentiary Record</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/90 backdrop-blur-md border border-[#D8D2C6] rounded-2xl p-5 shadow-[0_4px_20px_rgba(23,45,70,0.05)] space-y-3 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C5A77B]/40 to-transparent" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#8FAFC4] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search evidence by ID, keyword, source agency, hash..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#F8F6F1] border border-[#D8D2C6] rounded-xl pl-9 pr-3 py-2 text-xs text-[#172D46] placeholder-[#8FAFC4] focus:outline-hidden focus:border-[#294D6B] focus:ring-1 focus:ring-[#294D6B]/30 transition-all font-mono"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#8FAFC4]" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-[#F8F6F1] border border-[#D8D2C6] rounded-xl px-3 py-2 text-xs text-[#172D46] focus:outline-hidden focus:border-[#294D6B] focus:ring-1 focus:ring-[#294D6B]/30 transition-all font-sans font-medium"
            >
              <option value="ALL">All Multi-Agency Sources</option>
              <option value="Surveillance Video">Surveillance Video</option>
              <option value="Emergency Audio & Telemetry">Emergency Audio & Telemetry</option>
              <option value="Police Bodycam">Police Bodycam</option>
              <option value="Sensor & Telemetry Log">Sensor & Telemetry Log</option>
              <option value="Paramedic Triage Log">Paramedic Triage Log</option>
              <option value="Hospital ER Record">Hospital ER Record</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#5E7A91] font-mono pt-1 border-t border-[#E8E4DC]">
          <span>SHOWING {filteredEvidence.length} OF {evidenceList.length} SECURED RECORDS</span>
          <span className="text-[#294D6B] font-bold">ALL RECORDS SHA-256 SEALED</span>
        </div>
      </div>

      {/* Evidence Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredEvidence.map((item) => {
          const IconComponent = getSourceIcon(item.sourceType);

          return (
            <div
              key={item.id}
              className="bg-[#FCFBF9] border border-[#D8D2C6] hover:border-[#294D6B] rounded-2xl p-5 shadow-[0_4px_20px_rgba(23,45,70,0.05)] hover:shadow-[0_8px_30px_rgba(23,45,70,0.1)] transition-all flex flex-col justify-between group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C5A77B]/40 to-transparent group-hover:via-[#C5A77B]/80 transition-all" />

              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-[#EAF1F7] border border-[#8FAFC4]/50 text-[#294D6B] group-hover:scale-105 transition-all shadow-2xs">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-mono font-bold text-xs text-[#294D6B] block">{item.id}</span>
                      <span className="text-[10px] text-[#5E7A91] font-sans">{item.fileType} • {item.fileSize}</span>
                    </div>
                  </div>
                </div>

                <h3 className="font-serif-clean text-sm font-bold text-[#172D46] line-clamp-1 mt-1 group-hover:text-[#294D6B] transition-colors">
                  {item.title}
                </h3>
                <p className="text-[11px] text-[#5E7A91] mt-0.5 font-sans font-medium">{item.source}</p>

                <p className="text-xs text-[#233B54] mt-2.5 line-clamp-2 leading-relaxed bg-[#F8F6F1] p-2.5 rounded-xl border border-[#E0D9CD] font-sans">
                  {item.summary}
                </p>

                <div className="mt-3.5 space-y-1 text-[11px] font-mono border-t border-[#E8E4DC] pt-2.5">
                  <div className="flex items-center justify-between text-[#5E7A91]">
                    <span className="text-[10px] font-semibold text-[#8FAFC4]">ACQUISITION:</span>
                    <span className="text-[#172D46]">{item.timestamp}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#5E7A91]">
                    <span className="text-[10px] font-semibold text-[#8FAFC4]">CLOCK DRIFT:</span>
                    <span className="text-[#9B2C2C] font-bold">{item.clockDrift}</span>
                  </div>
                </div>

                <div className="mt-3">
                  <span className="text-[10px] font-mono text-[#8FAFC4] block mb-1 font-semibold">LINKS TO CLAIMS:</span>
                  <div className="flex flex-wrap gap-1">
                    {item.linkedClaims.map((claimId) => (
                      <span
                        key={claimId}
                        className="px-2 py-0.5 bg-[#EAF1F7] text-[#294D6B] border border-[#8FAFC4]/60 rounded-md text-[10px] font-mono font-bold shadow-2xs"
                      >
                        {claimId}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E8E4DC] flex items-center justify-between">
                <span className="text-[10px] text-[#5E7A91] font-mono truncate max-w-[140px]" title={item.hash}>
                  SHA: {item.hash.slice(0, 8)}...
                </span>
                <button
                  onClick={() => setSelectedEvidence(item)}
                  className="px-3 py-1.5 bg-white hover:bg-[#F8F6F1] text-[#294D6B] text-xs font-semibold rounded-xl border border-[#D8D2C6] hover:border-[#294D6B] transition-all shadow-2xs font-sans"
                >
                  Examine Item
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Examine Evidence Modal */}
      {selectedEvidence && (
        <Modal
          isOpen={!!selectedEvidence}
          onClose={() => setSelectedEvidence(null)}
          title={`Evidentiary Inspection: ${selectedEvidence.id}`}
          subtitle={`${selectedEvidence.source} • ${selectedEvidence.sourceType}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-[#F8F6F1] border border-[#D8D2C6] rounded-xl">
              <h4 className="font-serif-clean text-base font-bold text-[#172D46]">{selectedEvidence.title}</h4>
              <p className="text-xs text-[#233B54] mt-1 leading-relaxed font-sans">{selectedEvidence.summary}</p>
            </div>

            <div className="p-6 bg-[#172D46] border border-[#294D6B] rounded-2xl flex flex-col items-center justify-center text-center py-8 text-[#E8E4DC] shadow-inner">
              <div className="w-14 h-14 rounded-2xl bg-[#294D6B] border border-[#C5A77B]/50 flex items-center justify-center text-[#E8E4DC] mb-2 shadow-xs">
                {selectedEvidence.sourceType.includes('Video') ? (
                  <Video className="w-7 h-7 text-[#8FAFC4]" />
                ) : (
                  <PhoneCall className="w-7 h-7 text-[#8FAFC4]" />
                )}
              </div>
              <span className="font-serif-clean font-bold text-base text-[#E8E4DC]">{selectedEvidence.fileType} Stream Preview</span>
              <span className="text-[11px] text-[#8FAFC4] font-mono mt-0.5">
                Playback synchronized with CAD Master at {selectedEvidence.timestamp}
              </span>
              <div className="w-full max-w-md h-2 bg-white/20 rounded-full mt-4 overflow-hidden p-0.5">
                <div className="h-full bg-[#C5A77B] rounded-full w-3/5 shadow-xs" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-[11px]">
              <div className="p-3.5 bg-white border border-[#D8D2C6] rounded-xl shadow-2xs">
                <div className="flex items-center gap-1.5 text-[#5E7A91] text-[10px] mb-1 font-semibold">
                  <Hash className="w-3.5 h-3.5 text-[#294D6B]" />
                  <span>SHA-256 MERKLE HASH</span>
                </div>
                <div className="text-[#294D6B] break-all select-all font-bold">{selectedEvidence.hash}</div>
              </div>

              <div className="p-3.5 bg-white border border-[#D8D2C6] rounded-xl shadow-2xs">
                <div className="flex items-center gap-1.5 text-[#5E7A91] text-[10px] mb-1 font-semibold">
                  <Clock className="w-3.5 h-3.5 text-[#9B2C2C]" />
                  <span>NTP DRIFT OFFSET</span>
                </div>
                <div className="text-[#9B2C2C] font-bold">{selectedEvidence.clockDrift}</div>
              </div>
            </div>

            <div className="p-4 bg-[#F8F6F1] border border-[#D8D2C6] rounded-xl">
              <span className="text-[10px] font-mono text-[#294D6B] uppercase tracking-wider block mb-2 font-bold">
                Chain of Custody Ledger
              </span>
              <div className="space-y-2">
                {selectedEvidence.chainOfCustody.map((log, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-[#D8D2C6] text-[11px] shadow-2xs">
                    <div>
                      <span className="font-semibold text-[#172D46]">{log.action}</span>
                      <div className="text-[#5E7A91] text-[10px]">Actor: {log.actor}</div>
                    </div>
                    <span className="font-mono text-[#5E7A91]">{log.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <Modal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          title="Secure Evidence Intake"
          subtitle="Cryptographically sealed ingestion under Chain of Custody Protocol"
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleSimulatedUpload} className="space-y-4 text-xs font-sans">
            <div>
              <label className="block text-[#172D46] font-semibold mb-1">Evidence Title</label>
              <input
                type="text"
                required
                placeholder="e.g. CCTV Camera #09 - South Concourse"
                value={uploadForm.title}
                onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                className="w-full bg-[#F8F6F1] border border-[#D8D2C6] rounded-xl px-3 py-2 text-[#172D46] focus:outline-hidden focus:border-[#294D6B]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#172D46] font-semibold mb-1">Source Agency</label>
                <select
                  value={uploadForm.source}
                  onChange={(e) => setUploadForm({ ...uploadForm, source: e.target.value })}
                  className="w-full bg-[#F8F6F1] border border-[#D8D2C6] rounded-xl px-3 py-2 text-[#172D46] focus:outline-hidden focus:border-[#294D6B]"
                >
                  <option value="District 4 Transit Police">District 4 Transit Police</option>
                  <option value="Metro Transit Security SCADA">Metro Transit Security SCADA</option>
                  <option value="City 911 Communications">City 911 Communications</option>
                  <option value="County Emergency Medical Services">County Emergency Medical Services</option>
                  <option value="Hospital ER Triage Unit">Hospital ER Triage Unit</option>
                </select>
              </div>

              <div>
                <label className="block text-[#172D46] font-semibold mb-1">Source Type</label>
                <select
                  value={uploadForm.sourceType}
                  onChange={(e) => setUploadForm({ ...uploadForm, sourceType: e.target.value })}
                  className="w-full bg-[#F8F6F1] border border-[#D8D2C6] rounded-xl px-3 py-2 text-[#172D46] focus:outline-hidden focus:border-[#294D6B]"
                >
                  <option value="Surveillance Video">Surveillance Video</option>
                  <option value="Emergency Audio & Telemetry">Emergency Audio & Telemetry</option>
                  <option value="Police Bodycam">Police Bodycam</option>
                  <option value="Sensor & Telemetry Log">Sensor & Telemetry Log</option>
                  <option value="Paramedic Triage Log">Paramedic Triage Log</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[#172D46] font-semibold mb-1">Custody Officer</label>
              <input
                type="text"
                value={uploadForm.custodyOfficer}
                onChange={(e) => setUploadForm({ ...uploadForm, custodyOfficer: e.target.value })}
                className="w-full bg-[#F8F6F1] border border-[#D8D2C6] rounded-xl px-3 py-2 text-[#172D46] focus:outline-hidden focus:border-[#294D6B] font-mono"
              />
            </div>

            <div>
              <label className="block text-[#172D46] font-semibold mb-1">Description &amp; Acquisition Context</label>
              <textarea
                rows={3}
                placeholder="Details of physical recovery, device serial number, or server port..."
                value={uploadForm.summary}
                onChange={(e) => setUploadForm({ ...uploadForm, summary: e.target.value })}
                className="w-full bg-[#F8F6F1] border border-[#D8D2C6] rounded-xl px-3 py-2 text-[#172D46] focus:outline-hidden focus:border-[#294D6B]"
              />
            </div>

            <div className="p-3 rounded-xl bg-[#EAF1F7] border border-[#8FAFC4]/50 text-[11px] text-[#294D6B] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#294D6B] shrink-0" />
              <span className="font-medium">SHA-256 seal will be auto-calculated upon submission</span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="px-3.5 py-1.5 bg-white text-[#5E7A91] hover:text-[#172D46] rounded-xl border border-[#D8D2C6]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#294D6B] hover:bg-[#172D46] text-[#E8E4DC] font-semibold rounded-xl shadow-xs"
              >
                Ingest Record
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
