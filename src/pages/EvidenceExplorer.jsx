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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Evidence Explorer & Chain of Custody</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-sky-950/40 border border-sky-400/40 text-sky-300 font-mono text-[10px] shadow-[0_0_10px_rgba(14,165,233,0.3)]">
              EVIDENTIARY VAULT
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Case Ref: <span className="text-sky-300 font-mono font-medium">{currentCase.id}</span> • Multi-Agency Ingest: 911 CAD, SCADA, Axon BWC, EMS, Hospital HL7
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-sky-500 to-rose-600 hover:from-sky-400 hover:to-rose-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-[0_0_20px_rgba(14,165,233,0.3)] transition-all self-start md:self-auto"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Evidentiary Record</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.6)] space-y-3 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-400/30 to-transparent" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search evidence by ID, keyword, source agency, hash..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-sky-400 transition-all font-mono"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-hidden focus:border-sky-400 transition-all font-mono"
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

        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
          <span>SHOWING {filteredEvidence.length} OF {evidenceList.length} SECURED RECORDS</span>
          <span className="text-sky-400">ALL RECORDS SHA-256 SEALED</span>
        </div>
      </div>

      {/* Evidence Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEvidence.map((item) => {
          const IconComponent = getSourceIcon(item.sourceType);

          return (
            <div
              key={item.id}
              className="bg-black/60 backdrop-blur-2xl border border-white/10 hover:border-sky-400/50 rounded-2xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.6)] transition-all flex flex-col justify-between group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sky-400 group-hover:text-rose-400 group-hover:border-rose-500/40 group-hover:shadow-[0_0_12px_rgba(255,0,127,0.3)] transition-all">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-mono font-bold text-xs text-sky-300 block">{item.id}</span>
                      <span className="text-[10px] text-slate-400">{item.fileType} • {item.fileSize}</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-xs font-semibold text-white line-clamp-1 mt-1">{item.title}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">{item.source}</p>

                <p className="text-xs text-slate-300 mt-2.5 line-clamp-2 leading-relaxed bg-white/[0.02] p-2.5 rounded-xl border border-white/10">
                  {item.summary}
                </p>

                <div className="mt-3.5 space-y-1 text-[11px] font-mono border-t border-white/10 pt-2.5">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[10px]">ACQUISITION:</span>
                    <span className="text-slate-200">{item.timestamp}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[10px]">CLOCK DRIFT:</span>
                    <span className="text-rose-400 font-bold">{item.clockDrift}</span>
                  </div>
                </div>

                <div className="mt-3">
                  <span className="text-[10px] font-mono text-slate-400 block mb-1">LINKS TO CLAIMS:</span>
                  <div className="flex flex-wrap gap-1">
                    {item.linkedClaims.map((claimId) => (
                      <span
                        key={claimId}
                        className="px-2 py-0.5 bg-sky-950/40 text-sky-300 border border-sky-400/40 rounded-md text-[10px] font-mono shadow-[0_0_6px_rgba(14,165,233,0.25)]"
                      >
                        {claimId}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono truncate max-w-[140px]" title={item.hash}>
                  SHA: {item.hash.slice(0, 8)}...
                </span>
                <button
                  onClick={() => setSelectedEvidence(item)}
                  className="px-3 py-1.5 bg-white/[0.04] hover:bg-sky-500/20 text-slate-200 text-xs font-medium rounded-xl border border-white/10 hover:border-sky-400/40 transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]"
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
            <div className="p-4 bg-white/[0.02] border border-white/10 rounded-xl">
              <h4 className="text-sm font-semibold text-white">{selectedEvidence.title}</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{selectedEvidence.summary}</p>
            </div>

            <div className="p-5 bg-black/60 border border-white/10 rounded-xl flex flex-col items-center justify-center text-center py-8">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-sky-400/40 flex items-center justify-center text-sky-400 mb-2 shadow-[0_0_20px_rgba(14,165,233,0.3)]">
                {selectedEvidence.sourceType.includes('Video') ? (
                  <Video className="w-7 h-7" />
                ) : (
                  <PhoneCall className="w-7 h-7" />
                )}
              </div>
              <span className="font-semibold text-white text-sm">{selectedEvidence.fileType} Stream Preview</span>
              <span className="text-[11px] text-sky-400/90 font-mono mt-0.5">
                Playback synchronized with CAD Master at {selectedEvidence.timestamp}
              </span>
              <div className="w-full max-w-md h-2 bg-white/[0.08] rounded-full mt-4 overflow-hidden p-0.5">
                <div className="h-full bg-gradient-to-r from-sky-400 to-rose-500 rounded-full w-3/5 shadow-[0_0_8px_rgba(14,165,233,0.8)]" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-[11px]">
              <div className="p-3.5 bg-black/40 border border-white/10 rounded-xl">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] mb-1">
                  <Hash className="w-3.5 h-3.5 text-sky-400" />
                  <span>SHA-256 MERKLE HASH</span>
                </div>
                <div className="text-sky-300 break-all select-all">{selectedEvidence.hash}</div>
              </div>

              <div className="p-3.5 bg-black/40 border border-white/10 rounded-xl">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] mb-1">
                  <Clock className="w-3.5 h-3.5 text-rose-400" />
                  <span>NTP DRIFT OFFSET</span>
                </div>
                <div className="text-rose-300 font-bold">{selectedEvidence.clockDrift}</div>
              </div>
            </div>

            <div className="p-4 bg-white/[0.02] border border-white/10 rounded-xl">
              <span className="text-[10px] font-mono text-sky-400 uppercase tracking-wider block mb-2">
                Chain of Custody Ledger
              </span>
              <div className="space-y-2">
                {selectedEvidence.chainOfCustody.map((log, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-black/40 border border-white/10 text-[11px]">
                    <div>
                      <span className="font-semibold text-slate-200">{log.action}</span>
                      <div className="text-slate-400 text-[10px]">Actor: {log.actor}</div>
                    </div>
                    <span className="font-mono text-slate-400">{log.date}</span>
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
          <form onSubmit={handleSimulatedUpload} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Evidence Title</label>
              <input
                type="text"
                required
                placeholder="e.g. CCTV Camera #09 - South Concourse"
                value={uploadForm.title}
                onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-sky-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Source Agency</label>
                <select
                  value={uploadForm.source}
                  onChange={(e) => setUploadForm({ ...uploadForm, source: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-sky-400"
                >
                  <option value="District 4 Transit Police">District 4 Transit Police</option>
                  <option value="Metro Transit Security SCADA">Metro Transit Security SCADA</option>
                  <option value="City 911 Communications">City 911 Communications</option>
                  <option value="County Emergency Medical Services">County Emergency Medical Services</option>
                  <option value="Hospital ER Triage Unit">Hospital ER Triage Unit</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Source Type</label>
                <select
                  value={uploadForm.sourceType}
                  onChange={(e) => setUploadForm({ ...uploadForm, sourceType: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-sky-400"
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
              <label className="block text-slate-300 font-medium mb-1">Custody Officer</label>
              <input
                type="text"
                value={uploadForm.custodyOfficer}
                onChange={(e) => setUploadForm({ ...uploadForm, custodyOfficer: e.target.value })}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-sky-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Description & Acquisition Context</label>
              <textarea
                rows={3}
                placeholder="Details of physical recovery, device serial number, or server port..."
                value={uploadForm.summary}
                onChange={(e) => setUploadForm({ ...uploadForm, summary: e.target.value })}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-sky-400"
              />
            </div>

            <div className="p-3 rounded-xl bg-sky-950/30 border border-sky-400/30 text-[11px] text-sky-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
              <span>SHA-256 seal will be auto-calculated upon submission</span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="px-3.5 py-1.5 bg-white/[0.05] text-slate-300 rounded-xl border border-white/10"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-gradient-to-r from-sky-500 to-rose-600 text-white font-semibold rounded-xl shadow-[0_0_15px_rgba(14,165,233,0.3)]"
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
