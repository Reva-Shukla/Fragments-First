import React, { useState } from 'react';
import { 
  Menu, 
  Bell, 
  Search, 
  ShieldCheck, 
  UserCheck, 
  ChevronDown, 
  Clock, 
  AlertTriangle,
  FolderGit2,
  Check
} from 'lucide-react';
import { useCase } from '../../context/CaseContext';
import { useAuth } from '../../context/AuthContext';

export const Header = ({ onMenuClick }) => {
  const { cases, currentCase, selectCase } = useCase();
  const { currentUser, switchRole, availableRoles } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showCaseMenu, setShowCaseMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="h-16 bg-black/60 backdrop-blur-2xl border-b border-white/10 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-30 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      {/* Left: Mobile Toggle & Active Case Switcher */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-400 hover:text-slate-100 hover:bg-white/[0.06] rounded-xl transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Case Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowCaseMenu(!showCaseMenu);
              setShowRoleMenu(false);
            }}
            className="flex items-center gap-2.5 px-3 py-1.5 bg-white/[0.04] backdrop-blur-xl border border-white/10 hover:border-sky-400/50 rounded-xl text-xs transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)] group"
          >
            <FolderGit2 className="w-3.5 h-3.5 text-sky-400 group-hover:drop-shadow-[0_0_8px_rgba(14,165,233,0.8)]" />
            <div className="text-left hidden sm:block">
              <span className="text-[10px] text-slate-400 font-mono block leading-none">CASE DOSSIER</span>
              <span className="font-semibold text-slate-100 leading-none">{currentCase.id}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>

          {showCaseMenu && (
            <div 
              className="absolute left-0 mt-2 w-80 bg-black/85 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.8)] p-2 z-50 text-xs"
              onClick={() => setShowCaseMenu(false)}
            >
              <div className="px-3 py-1.5 text-[10px] font-mono text-sky-400 uppercase tracking-wider border-b border-white/10">
                Switch Investigation Dossier
              </div>
              <div className="mt-1 space-y-1">
                {cases.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => selectCase(c.id)}
                    className={`w-full text-left p-2.5 rounded-xl flex items-start justify-between transition-all ${
                      c.id === currentCase.id
                        ? 'bg-sky-500/15 border border-sky-400/40 text-sky-200 shadow-[0_0_15px_rgba(14,165,233,0.2)]'
                        : 'hover:bg-white/[0.05] text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-semibold font-mono text-xs">{c.id}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{c.title}</div>
                      <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2">
                        <span className="px-1.5 py-0.2 bg-white/[0.06] text-slate-300 rounded border border-white/10">{c.status}</span>
                        <span className="text-rose-400 font-mono">{c.priority}</span>
                      </div>
                    </div>
                    {c.id === currentCase.id && <Check className="w-4 h-4 text-sky-400 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Telemetry Clock Sync Status Pill */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-xl bg-white/[0.03] backdrop-blur-xl border border-white/10 text-[11px] font-mono text-sky-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse shadow-[0_0_8px_rgba(14,165,233,0.9)]" />
          <span>NTP GPS SYNC: ACTIVE (±0.2ms)</span>
        </div>
      </div>

      {/* Right Controls: Role Switcher, Clearance Badge, Notifications */}
      <div className="flex items-center gap-2.5">
        {/* Role Switcher Pill */}
        <div className="relative">
          <button
            onClick={() => {
              setShowRoleMenu(!showRoleMenu);
              setShowCaseMenu(false);
            }}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.04] backdrop-blur-xl border border-white/10 hover:border-white/20 rounded-xl text-xs transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]"
          >
            <UserCheck className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden md:inline text-slate-200 font-medium">{currentUser?.title}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div 
              className="absolute right-0 mt-2 w-72 bg-black/85 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.8)] p-2 z-50 text-xs"
              onClick={() => setShowRoleMenu(false)}
            >
              <div className="px-3 py-1.5 text-[10px] font-mono text-sky-400 uppercase tracking-wider border-b border-white/10">
                Switch Authority Persona / Role
              </div>
              <div className="mt-1 space-y-1">
                {availableRoles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => switchRole(role.id)}
                    className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between transition-all ${
                      role.id === currentUser?.id
                        ? 'bg-sky-500/15 border border-sky-400/40 text-sky-200 shadow-[0_0_15px_rgba(14,165,233,0.2)]'
                        : 'hover:bg-white/[0.05] text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-xs text-slate-100">{role.title}</div>
                      <div className="text-[11px] text-slate-400">{role.name} ({role.badge})</div>
                      <div className="text-[10px] text-sky-400/80 font-mono mt-0.5">{role.division}</div>
                    </div>
                    {role.id === currentUser?.id && <Check className="w-4 h-4 text-sky-400 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Clearance Level Tag */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-rose-950/40 backdrop-blur-xl border border-rose-500/40 rounded-lg text-[10px] font-mono text-rose-300 shadow-[0_0_12px_rgba(255,0,127,0.2)]">
          <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
          <span className="truncate max-w-[140px]">{currentCase.clearanceLevel.split('//')[0]}</span>
        </div>

        {/* Notifications Trigger */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-white/[0.06] rounded-xl relative transition-colors"
            title="Investigation Alerts"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full shadow-[0_0_8px_rgba(255,0,127,0.8)]" />
          </button>

          {showNotifications && (
            <div 
              className="absolute right-0 mt-2 w-80 bg-black/85 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.8)] p-3 z-50 text-xs"
              onClick={() => setShowNotifications(false)}
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
                <span className="font-semibold text-slate-200">Investigation Feed</span>
                <span className="text-[10px] font-mono text-rose-400 font-bold">3 NEW ALERTS</span>
              </div>
              <div className="space-y-2">
                <div className="p-2.5 bg-white/[0.03] rounded-xl border border-white/10 hover:border-rose-500/30 transition-colors">
                  <div className="flex items-center justify-between text-[10px] text-rose-400 font-mono font-medium">
                    <span>CAD VS CCTV LAG</span>
                    <span>12m ago</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1">
                    SCADA Gate W-3 relay delay of 42s confirmed by Cam 14 crowd bottleneck.
                  </p>
                </div>
                <div className="p-2.5 bg-white/[0.03] rounded-xl border border-white/10 hover:border-sky-500/30 transition-colors">
                  <div className="flex items-center justify-between text-[10px] text-sky-400 font-mono font-medium">
                    <span>VICTIM CONCURRENCE</span>
                    <span>1h ago</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1">
                    Witness-A electronically confirmed reconstructed statement v2.0 via legal portal.
                  </p>
                </div>
                <div className="p-2.5 bg-white/[0.03] rounded-xl border border-white/10">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono font-medium">
                    <span>CUSTODY SEALED</span>
                    <span>3h ago</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1">
                    Hospital ER HL7 trauma intake record signed into vault by Legal Liaison Patel.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
