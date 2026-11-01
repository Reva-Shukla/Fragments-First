import React, { useState } from 'react';
import { 
  Clock, 
  Filter, 
  GitCommit, 
  ShieldCheck, 
  AlertTriangle, 
  PhoneCall, 
  ShieldAlert, 
  Ambulance, 
  Building2, 
  User, 
  ArrowRight,
  Info,
  Maximize2
} from 'lucide-react';
import { useCase } from '../context/CaseContext';
import { EthicalNoticeBanner } from '../components/common/EthicalNoticeBanner';

export const TimelineAnalysis = () => {
  const { currentCase } = useCase();
  const timelineEvents = currentCase.timeline || [];

  const [selectedService, setSelectedService] = useState('ALL');
  const [selectedEvent, setSelectedEvent] = useState(timelineEvents[0]);

  const serviceCategories = [
    { id: 'ALL', label: 'All Services', icon: Clock, count: timelineEvents.length },
    { id: 'Victim Report', label: 'Victim Reports', icon: User, color: 'text-[#C5A77B]' },
    { id: 'Emergency Helpline', label: '911 Helpline', icon: PhoneCall, color: 'text-[#294D6B]' },
    { id: 'Police (CAD)', label: 'Police (CAD)', icon: ShieldAlert, color: 'text-[#172D46]' },
    { id: 'Ambulance (EMS)', label: 'Ambulance (EMS)', icon: Ambulance, color: 'text-[#294D6B]' },
    { id: 'Hospital (ER)', label: 'Hospital (ER)', icon: Building2, color: 'text-[#8FAFC4]' }
  ];

  const filteredEvents = selectedService === 'ALL'
    ? timelineEvents
    : timelineEvents.filter(e => e.service === selectedService);

  const getServiceIcon = (service) => {
    if (service.includes('Victim')) return User;
    if (service.includes('Helpline')) return PhoneCall;
    if (service.includes('Police')) return ShieldAlert;
    if (service.includes('Ambulance')) return Ambulance;
    if (service.includes('Hospital')) return Building2;
    return Clock;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif-clean text-2xl font-bold text-[#172D46] tracking-tight">Multi-Service Incident Timeline & Clock Drift</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#EAF1F7] border border-[#294D6B]/30 text-[#294D6B] font-mono text-[10px] font-semibold">
              SYNCHRONIZED CHRONOLOGY
            </span>
          </div>
          <p className="text-xs text-[#5E7A91] mt-1">
            Synthesizing 5 independent services: Victim testimony, 911 Helpline, Police CAD, EMS Paramedic, and Hospital ER
          </p>
        </div>

        {/* Sync Status Badge */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-[#D8D2C6] text-xs text-[#294D6B] font-mono shadow-xs">
          <span className="w-2 h-2 rounded-full bg-[#294D6B] animate-ping" />
          <span className="font-semibold">MASTER CLOCK: GPS-UTC NORMALIZED</span>
        </div>
      </div>

      <EthicalNoticeBanner />

      {/* Service Lane Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-[#FCFBF9] border border-[#D8D2C6] p-2 rounded-2xl shadow-xs">
        {serviceCategories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedService === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedService(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#294D6B] text-white shadow-xs font-semibold'
                  : 'text-[#5E7A91] hover:text-[#172D46] hover:bg-white'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : cat.color || ''}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Timeline View & Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Chronological Event Stream */}
        <div className="lg:col-span-2 bg-[#FCFBF9] border border-[#D8D2C6] rounded-2xl p-6 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C5A77B]/40 to-transparent" />

          <div className="flex items-center justify-between pb-3 border-b border-[#D8D2C6]/70 mb-5">
            <div>
              <h2 className="font-serif-clean text-base font-bold text-[#172D46]">Synchronized Event Stream</h2>
              <p className="text-xs text-[#5E7A91]">Events chronologically re-aligned with clock uncertainty margins</p>
            </div>
            <span className="text-[11px] font-mono text-[#294D6B] font-semibold bg-[#EAF1F7] px-2.5 py-0.5 rounded-full border border-[#294D6B]/30">
              {filteredEvents.length} KEY EVENTS
            </span>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#D8D2C6]">
            {filteredEvents.map((event) => {
              const IconComponent = getServiceIcon(event.service);
              const isSelected = selectedEvent?.id === event.id;

              return (
                <div
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className={`relative flex items-start gap-4 cursor-pointer transition-all ${
                    isSelected ? 'scale-[1.01]' : 'hover:opacity-95'
                  }`}
                >
                  <div className={`absolute -left-6 top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] transition-all ${
                    isSelected
                      ? 'bg-[#294D6B] border-[#172D46] text-white shadow-sm'
                      : 'bg-white border-[#D8D2C6] text-[#5E7A91]'
                  }`}>
                    <IconComponent className="w-3 h-3" />
                  </div>

                  <div className={`w-full rounded-2xl p-5 border transition-all ${
                    isSelected
                      ? 'bg-[#FAF9F5] border-2 border-[#294D6B] shadow-md'
                      : 'bg-white border-[#D8D2C6] hover:border-[#8FAFC4] shadow-xs'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md border font-semibold bg-[#EAF1F7] text-[#294D6B] border-[#294D6B]/30">
                          {event.service}
                        </span>
                        <span className="font-bold text-xs text-[#172D46]">{event.eventTitle}</span>
                      </div>
                      <span className="font-mono text-[#294D6B] font-bold text-xs">
                        {event.correctedTimestamp}
                      </span>
                    </div>

                    <p className="text-xs text-[#233B54] leading-relaxed font-reading">
                      {event.description}
                    </p>

                    <div className="mt-3 pt-2.5 border-t border-[#D8D2C6]/60 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono">
                      <div>
                        <span className="text-[10px] text-[#5E7A91] block">ORIGINAL LOGGED:</span>
                        <span className="text-[#172D46]">{event.originalTimestamp}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#5E7A91] block">CLOCK UNCERTAINTY:</span>
                        <span className="text-[#9B2C2C] font-semibold">{event.clockUncertainty}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#5E7A91] block">SYNC DRIFT OFFSET:</span>
                        <span className="text-[#294D6B] font-semibold">{event.syncDelta}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Column: Telemetry & Event Inspector */}
        <div className="space-y-4">
          <div className="bg-[#FCFBF9] border border-[#D8D2C6] rounded-2xl p-6 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C5A77B]/40 to-transparent" />

            <div className="flex items-center justify-between pb-3 border-b border-[#D8D2C6]/70 mb-4">
              <h3 className="font-serif-clean text-base font-bold text-[#172D46]">Event Telemetry Inspector</h3>
              <span className="font-mono text-xs text-[#294D6B] font-semibold bg-[#EAF1F7] px-2.5 py-0.5 rounded-full border border-[#294D6B]/30">
                {selectedEvent?.id}
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <span className="text-[10px] font-mono text-[#5E7A91] block uppercase font-semibold">Service Agency Lane</span>
                <span className="font-bold text-[#172D46] mt-0.5 block">{selectedEvent?.service}</span>
              </div>

              <div>
                <span className="text-[10px] font-mono text-[#5E7A91] block uppercase font-semibold">Incident Phase Title</span>
                <span className="text-[#233B54] font-medium mt-0.5 block">{selectedEvent?.eventTitle}</span>
              </div>

              <div>
                <span className="text-[10px] font-mono text-[#5E7A91] block uppercase font-semibold">Detailed Narrative</span>
                <p className="text-[#233B54] mt-1 leading-relaxed bg-white p-3 rounded-xl border border-[#D8D2C6] font-reading shadow-xs">
                  {selectedEvent?.description}
                </p>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-[#D8D2C6] space-y-2 font-mono text-[11px] shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#5E7A91]">Corrected GPS-UTC:</span>
                  <span className="text-[#294D6B] font-bold">{selectedEvent?.correctedTimestamp}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#5E7A91]">Original Logged:</span>
                  <span className="text-[#172D46]">{selectedEvent?.originalTimestamp}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#5E7A91]">Clock Uncertainty:</span>
                  <span className="text-[#9B2C2C] font-bold">{selectedEvent?.clockUncertainty}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#5E7A91]">Sync Normalization:</span>
                  <span className="text-[#294D6B] font-bold">{selectedEvent?.syncDelta}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono text-[#5E7A91] block uppercase mb-1 font-semibold">Evidentiary Attribution</span>
                <span className="px-2.5 py-1 rounded-lg bg-[#EAF1F7] text-[#294D6B] border border-[#294D6B]/30 text-xs font-mono block shadow-xs font-semibold">
                  {selectedEvent?.evidenceRef}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#FAF6EF] border border-[#C5A77B]/50 rounded-2xl p-5 text-xs text-[#5B4727] shadow-xs space-y-2">
            <div className="flex items-center gap-1.5 text-[#172D46] font-semibold">
              <Info className="w-4 h-4 text-[#C5A77B]" />
              <span>Clock Uncertainty Methodology</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Analog CCTV recorders drift by up to ±90s/month without NTP synchronization. CAD dispatch servers synchronize via GPS master clocks (±0.4s). Eyewitness memory reflects subjective duration scaling under acute trauma shock.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
