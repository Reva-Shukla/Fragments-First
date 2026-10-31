import React, { useState } from 'react';
import { 
  Menu, 
  Bell, 
  ShieldCheck, 
  UserCheck, 
  ChevronDown, 
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
    <header className="h-16 bg-[#FCFBF9]/95 backdrop-blur-xl border-b border-[#D8D2C6] px-4 lg:px-6 flex items-center justify-between sticky top-0 z-30 shadow-[0_2px_14px_rgba(23,45,70,0.03)]">
      {/* Left: Mobile Toggle & Active Case Switcher */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-[#5E7A91] hover:text-[#172D46] hover:bg-[#E8E4DC]/50 rounded-xl transition-colors"
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
            className="flex items-center gap-2.5 px-3.5 py-1.5 bg-[#F8F6F1] hover:bg-[#E8E4DC]/60 border border-[#D8D2C6] hover:border-[#294D6B] rounded-xl text-xs transition-all shadow-2xs group"
          >
            <FolderGit2 className="w-3.5 h-3.5 text-[#294D6B]" />
            <div className="text-left hidden sm:block">
              <span className="text-[10px] text-[#294D6B] font-sans uppercase tracking-wider block leading-none font-bold">ACTIVE DOSSIER</span>
              <span className="font-mono font-bold text-[#172D46] leading-none text-xs">{currentCase.id}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#294D6B] ml-1" />
          </button>

          {showCaseMenu && (
            <div 
              className="absolute left-0 mt-2 w-80 bg-[#FCFBF9]/98 backdrop-blur-2xl border border-[#D8D2C6] rounded-2xl shadow-[0_16px_40px_rgba(23,45,70,0.15)] p-2 z-50 text-xs"
              onClick={() => setShowCaseMenu(false)}
            >
              <div className="px-3 py-1.5 text-[10px] font-sans uppercase tracking-wider text-[#294D6B] font-bold border-b border-[#D8D2C6]">
                Switch Investigation Dossier
              </div>
              <div className="mt-1 space-y-1">
                {cases.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => selectCase(c.id)}
                    className={`w-full text-left p-2.5 rounded-xl flex items-start justify-between transition-all ${
                      c.id === currentCase.id
                        ? 'bg-[#E8E4DC]/80 border border-[#D8D2C6] text-[#172D46]'
                        : 'hover:bg-[#F8F6F1] text-[#233B54]'
                    }`}
                  >
                    <div>
                      <div className="font-mono font-bold text-xs text-[#294D6B]">{c.id}</div>
                      <div className="font-sans text-[11px] text-[#5E7A91] line-clamp-1 mt-0.5">{c.title}</div>
                      <div className="text-[10px] text-[#5E7A91] mt-1 flex items-center gap-2 font-sans">
                        <span className="px-1.5 py-0.5 bg-white text-[#294D6B] rounded border border-[#D8D2C6] font-medium">{c.status}</span>
                        <span className="text-[#8E6E3C] font-bold">{c.priority}</span>
                      </div>
                    </div>
                    {c.id === currentCase.id && <Check className="w-4 h-4 text-[#294D6B] shrink-0 mt-0.5" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Telemetry Clock Sync Status Pill */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-xl bg-[#F8F6F1] border border-[#D8D2C6] text-[11px] text-[#294D6B] font-mono font-semibold shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-[#294D6B] animate-pulse" />
          <span className="tracking-wide">NTP GPS SYNC: ACTIVE (±0.2ms)</span>
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
            className="flex items-center gap-2 px-3.5 py-1.5 bg-[#F8F6F1] hover:bg-[#E8E4DC]/60 border border-[#D8D2C6] rounded-xl text-xs transition-all shadow-2xs"
          >
            <UserCheck className="w-3.5 h-3.5 text-[#294D6B]" />
            <span className="hidden md:inline text-[#172D46] font-sans font-bold">{currentUser?.title}</span>
            <ChevronDown className="w-3 h-3 text-[#294D6B]" />
          </button>

          {showRoleMenu && (
            <div 
              className="absolute right-0 mt-2 w-72 bg-[#FCFBF9]/98 backdrop-blur-2xl border border-[#D8D2C6] rounded-2xl shadow-[0_16px_40px_rgba(23,45,70,0.15)] p-2 z-50 text-xs"
              onClick={() => setShowRoleMenu(false)}
            >
              <div className="px-3 py-1.5 text-[10px] font-sans uppercase tracking-wider text-[#294D6B] font-bold border-b border-[#D8D2C6]">
                Switch Authority Persona / Role
              </div>
              <div className="mt-1 space-y-1">
                {availableRoles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => switchRole(role.id)}
                    className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between transition-all ${
                      role.id === currentUser?.id
                        ? 'bg-[#E8E4DC]/80 border border-[#D8D2C6] text-[#172D46]'
                        : 'hover:bg-[#F8F6F1] text-[#233B54]'
                    }`}
                  >
                    <div>
                      <div className="font-serif-clean font-bold text-xs text-[#172D46]">{role.title}</div>
                      <div className="font-sans text-[11px] text-[#5E7A91]">{role.name} ({role.badge})</div>
                      <div className="text-[10px] text-[#294D6B] mt-0.5 font-sans font-medium">{role.division}</div>
                    </div>
                    {role.id === currentUser?.id && <Check className="w-4 h-4 text-[#294D6B] shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Clearance Level Tag with Steel Blue */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-white border border-[#D8D2C6] rounded-lg text-[10px] font-mono font-bold text-[#172D46] shadow-2xs">
          <ShieldCheck className="w-3.5 h-3.5 text-[#294D6B]" />
          <span className="truncate max-w-[140px] text-[#294D6B]">{currentCase.clearanceLevel.split('//')[0]}</span>
        </div>

        {/* Notifications Trigger with Antique Gold Dot */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-[#5E7A91] hover:text-[#294D6B] hover:bg-[#E8E4DC]/50 rounded-xl relative transition-colors"
            title="Investigation Alerts"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#C5A77B] rounded-full animate-ping" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#C5A77B] rounded-full shadow-[0_0_6px_#C5A77B]" />
          </button>

          {showNotifications && (
            <div 
              className="absolute right-0 mt-2 w-80 bg-[#FCFBF9]/98 backdrop-blur-2xl border border-[#D8D2C6] rounded-2xl shadow-[0_16px_40px_rgba(23,45,70,0.15)] p-3 z-50 text-xs"
              onClick={() => setShowNotifications(false)}
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#D8D2C6] mb-2">
                <span className="font-serif-clean font-bold text-[#172D46]">Investigation Feed</span>
                <span className="text-[10px] font-sans font-bold text-[#172D46] bg-[#C5A77B] px-2 py-0.5 rounded-full border border-[#A88A5E]">
                  3 NEW ALERTS
                </span>
              </div>
              <div className="space-y-2">
                <div className="p-2.5 bg-white rounded-xl border border-[#D8D2C6] hover:border-[#294D6B] transition-colors shadow-2xs">
                  <div className="flex items-center justify-between text-[10px] text-[#8E6E3C] font-mono font-bold">
                    <span>CAD VS CCTV LAG</span>
                    <span className="font-sans text-[10px] text-[#5E7A91]">12m ago</span>
                  </div>
                  <p className="text-[11px] text-[#233B54] mt-1 leading-relaxed font-sans">
                    SCADA Gate W-3 relay delay of 42s confirmed by Cam 14 crowd bottleneck.
                  </p>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-[#D8D2C6] hover:border-[#294D6B] transition-colors shadow-2xs">
                  <div className="flex items-center justify-between text-[10px] text-[#294D6B] font-mono font-bold">
                    <span>VICTIM CONCURRENCE</span>
                    <span className="font-sans text-[10px] text-[#5E7A91]">1h ago</span>
                  </div>
                  <p className="text-[11px] text-[#233B54] mt-1 leading-relaxed font-sans">
                    Witness-A electronically confirmed reconstructed statement v2.0 via legal portal.
                  </p>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-[#D8D2C6] shadow-2xs">
                  <div className="flex items-center justify-between text-[10px] text-[#5E7A91] font-mono font-bold">
                    <span>CUSTODY SEALED</span>
                    <span className="font-sans text-[10px] text-[#5E7A91]">3h ago</span>
                  </div>
                  <p className="text-[11px] text-[#233B54] mt-1 leading-relaxed font-sans">
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
