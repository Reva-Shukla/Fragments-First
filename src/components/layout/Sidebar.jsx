import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  FolderLock, 
  Clock, 
  Share2, 
  CheckCircle2, 
  GitFork, 
  FileSpreadsheet, 
  ShieldCheck, 
  LogOut
} from 'lucide-react';
import { useCase } from '../../context/CaseContext';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/cases', label: 'Assigned Cases', icon: Briefcase },
  { path: '/statement-review', label: 'Statement Review', icon: FileText, badge: 'Diff' },
  { path: '/evidence', label: 'Evidence Explorer', icon: FolderLock },
  { path: '/timeline', label: 'Timeline Analysis', icon: Clock },
  { path: '/correlation', label: 'Service Correlation', icon: Share2, badge: 'Flow' },
  { path: '/claim-verification', label: 'Claim Verification', icon: CheckCircle2, badge: '4-Tier' },
  { path: '/root-cause', label: 'Root Cause Analysis', icon: GitFork },
  { path: '/reports', label: 'Investigation Reports', icon: FileSpreadsheet },
  { path: '/audit-logs', label: 'Audit Logs', icon: ShieldCheck }
];

export const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const { currentCase } = useCase();
  const { currentUser, logout } = useAuth();

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64
        bg-black/65 backdrop-blur-2xl border-r border-white/10 shadow-[4px_0_32px_rgba(0,0,0,0.7)]
        flex flex-col transition-transform duration-200 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-white/10 bg-white/[0.02]">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-400 via-sky-500 to-rose-500 flex items-center justify-center shadow-[0_0_20px_rgba(14,165,233,0.4)] text-black font-black text-sm">
            F1
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-wide text-slate-100">FRAGMENT</span>
              <span className="font-extrabold text-xs px-1.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_10px_rgba(255,0,127,0.3)]">
                FIRST
              </span>
            </div>
            <p className="text-[10px] text-sky-400 font-mono tracking-wider">AUTHORITY TERMINAL</p>
          </div>
        </div>

        {/* Active Case Context Pill */}
        <div className="p-3 mx-3 mt-3 mb-1 rounded-xl bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="font-mono text-sky-400 font-medium">ACTIVE DOSSIER</span>
            <span className="px-1.5 py-0.2 bg-rose-500/20 text-rose-300 rounded border border-rose-500/30 text-[9px] uppercase font-mono shadow-[0_0_8px_rgba(255,0,127,0.25)]">
              {currentCase.priority}
            </span>
          </div>
          <div className="font-semibold text-xs text-slate-100 truncate" title={currentCase.title}>
            {currentCase.id}
          </div>
          <div className="text-[11px] text-slate-400 truncate mt-0.5">
            {currentCase.incidentType}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen && setMobileOpen(false)}
                className={({ isActive }) => `
                  flex items-center justify-between px-3 py-2 text-xs font-medium rounded-xl transition-all duration-200 group
                  ${isActive
                    ? 'bg-gradient-to-r from-sky-500/20 via-sky-500/10 to-rose-500/10 border border-sky-400/40 text-sky-200 shadow-[0_0_15px_rgba(14,165,233,0.25)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110 group-hover:text-sky-300" />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-white/[0.06] text-slate-300 border border-white/10">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Identity & Clearance Badge */}
        <div className="p-3 border-t border-white/10 bg-black/40 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-950 to-rose-950 border border-sky-400/40 text-sky-300 font-bold text-xs flex items-center justify-center shadow-[0_0_10px_rgba(14,165,233,0.3)]">
                {currentUser?.avatar || 'AU'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-slate-200 truncate">{currentUser?.name}</p>
                <p className="text-[10px] text-sky-400 truncate font-mono">{currentUser?.title}</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out of Authority Terminal"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
          <div className="text-[9px] font-mono text-slate-400 bg-black/50 px-2 py-1 rounded-md border border-white/10 text-center truncate shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
            {currentUser?.clearance}
          </div>
        </div>
      </aside>
    </>
  );
};
