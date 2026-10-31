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
    { id: 'Victim Report', label: 'Victim Reports', icon: User, color: 'text-rose-400' },
    { id: 'Emergency Helpline', label: '911 Helpline', icon: PhoneCall, color: 'text-sky-400' },
    { id: 'Police (CAD)', label: 'Police (CAD)', icon: ShieldAlert, color: 'text-sky-300' },
    { id: 'Ambulance (EMS)', label: 'Ambulance (EMS)', icon: Ambulance, color: 'text-sky-400' },
    { id: 'Hospital (ER)', label: 'Hospital (ER)', icon: Building2, color: 'text-rose-300' }
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
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Multi-Service Incident Timeline & Clock Drift</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-sky-950/40 border border-sky-400/40 text-sky-300 font-mono text-[10px] shadow-[0_0_10px_rgba(14,165,233,0.3)]">
              SYNCHRONIZED CHRONOLOGY
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Synthesizing 5 independent services: Victim testimony, 911 Helpline, Police CAD, EMS Paramedic, and Hospital ER
          </p>
        </div>

        {/* Sync Status Badge */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-black/60 backdrop-blur-xl border border-white/10 text-xs text-sky-300 font-mono shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping shadow-[0_0_8px_rgba(14,165,233,0.9)]" />
          <span>MASTER CLOCK: GPS-UTC NORMALIZED</span>
        </div>
      </div>

      <EthicalNoticeBanner />

      {/* Service Lane Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-black/60 backdrop-blur-2xl border border-white/10 p-2 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.6)]">
        {serviceCategories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedService === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedService(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-gradient-to-r from-sky-500/25 to-rose-500/20 text-white border border-sky-400/50 shadow-[0_0_15px_rgba(14,165,233,0.25)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${cat.color || ''}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Timeline View & Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Chronological Event Stream */}
        <div className="lg:col-span-2 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.6)] relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-400/30 to-transparent" />

          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Synchronized Event Stream</h2>
              <p className="text-xs text-slate-400">Events chronologically re-aligned with clock uncertainty margins</p>
            </div>
            <span className="text-[11px] font-mono text-sky-400">{filteredEvents.length} KEY EVENTS</span>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-white/10">
            {filteredEvents.map((event) => {
              const IconComponent = getServiceIcon(event.service);
              const isSelected = selectedEvent?.id === event.id;

              return (
                <div
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className={`relative flex items-start gap-4 cursor-pointer transition-all ${
                    isSelected ? 'scale-[1.01]' : 'hover:opacity-90'
                  }`}
                >
                  <div className={`absolute -left-6 top-1.5 w-6 h-6 rounded-full bg-black border-2 flex items-center justify-center text-[10px] transition-all ${
                    isSelected
                      ? 'border-sky-400 text-sky-300 shadow-[0_0_12px_rgba(14,165,233,0.8)]'
                      : 'border-white/20 text-slate-400'
                  }`}>
                    <IconComponent className="w-3 h-3" />
                  </div>

                  <div className={`w-full rounded-2xl p-5 border transition-all ${
                    isSelected
                      ? 'bg-white/[0.04] border-sky-400/60 shadow-[0_0_20px_rgba(14,165,233,0.2)]'
                      : 'bg-white/[0.02] border-white/10'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${event.serviceColor}`}>
                          {event.service}
                        </span>
                        <span className="font-semibold text-xs text-white">{event.eventTitle}</span>
                      </div>
                      <span className="font-mono text-sky-300 font-bold text-xs">
                        {event.correctedTimestamp}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {event.description}
                    </p>

                    <div className="mt-3 pt-2.5 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono">
                      <div>
                        <span className="text-[10px] text-slate-400 block">ORIGINAL LOGGED:</span>
                        <span className="text-slate-300">{event.originalTimestamp}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">CLOCK UNCERTAINTY:</span>
                        <span className="text-rose-400 font-semibold">{event.clockUncertainty}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">SYNC DRIFT OFFSET:</span>
                        <span className="text-sky-300 font-semibold">{event.syncDelta}</span>
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
          <div className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.6)] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-sky-400/30 to-transparent" />

            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <h3 className="text-sm font-semibold text-white">Event Telemetry Inspector</h3>
              <span className="font-mono text-xs text-sky-400 font-semibold">{selectedEvent?.id}</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Service Agency Lane</span>
                <span className="font-semibold text-white mt-0.5 block">{selectedEvent?.service}</span>
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Incident Phase Title</span>
                <span className="text-slate-200 font-medium mt-0.5 block">{selectedEvent?.eventTitle}</span>
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Detailed Narrative</span>
                <p className="text-slate-300 mt-1 leading-relaxed bg-white/[0.02] p-3 rounded-xl border border-white/10">
                  {selectedEvent?.description}
                </p>
              </div>

              <div className="p-3.5 bg-black/40 rounded-xl border border-white/10 space-y-2 font-mono text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Corrected GPS-UTC:</span>
                  <span className="text-sky-300 font-bold">{selectedEvent?.correctedTimestamp}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Original Logged:</span>
                  <span className="text-slate-300">{selectedEvent?.originalTimestamp}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Clock Uncertainty:</span>
                  <span className="text-rose-400 font-bold">{selectedEvent?.clockUncertainty}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Sync Normalization:</span>
                  <span className="text-sky-400 font-bold">{selectedEvent?.syncDelta}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-400 block uppercase mb-1">Evidentiary Attribution</span>
                <span className="px-2.5 py-1 rounded-lg bg-sky-950/40 text-sky-300 border border-sky-400/40 text-xs font-mono block shadow-[0_0_8px_rgba(14,165,233,0.2)]">
                  {selectedEvent?.evidenceRef}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 text-xs text-slate-400 shadow-[0_8px_32px_0_rgba(0,0,0,0.6)] space-y-2">
            <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
              <Info className="w-4 h-4 text-sky-400" />
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
