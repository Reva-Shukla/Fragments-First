import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home,
  FileText,
  Search,
  BookOpen,
  Headphones,
  FolderLock,
  Clock,
  Share2,
  CheckCircle2,
  GitFork,
  ShieldCheck,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: Home },
  { path: '/cases', label: 'Report Incident', icon: FileText },
  { path: '/evidence', label: 'Track Status', icon: Search },
  { path: '/statement-review', label: 'Statement Review', icon: FileText },
  { path: '/timeline', label: 'Timeline Analysis', icon: Clock },
  { path: '/correlation', label: 'Service Correlation', icon: Share2 },
  { path: '/claim-verification', label: 'Claim Verification', icon: CheckCircle2 },
  { path: '/root-cause', label: 'Root Cause Analysis', icon: GitFork },
  { path: '/reports', label: 'Resources', icon: BookOpen },
  { path: '/audit-logs', label: 'Help & Support', icon: Headphones }
];

export const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const { logout } = useAuth();

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-[#0a1827]/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64
        bg-gradient-to-b from-[#172D46] via-[#15283E] to-[#101F31]
        border-r border-[#0D1C2D] shadow-[4px_0_24px_rgba(10,24,39,0.35)]
        flex flex-col justify-between transition-transform duration-200 ease-in-out
        overflow-hidden
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Top Section: Shield Fingerprint Emblem & Brand Title (Image 4 Typography) */}
        <div className="pt-7 pb-4 px-6 flex flex-col items-center text-center shrink-0">
          {/* Antique Gold Shield with Fingerprint Emblem */}
          <div className="relative mb-3 flex items-center justify-center">
            <svg width="68" height="82" viewBox="0 0 100 120" fill="none" className="drop-shadow-xs">
              {/* Outer Shield Border */}
              <path
                d="M50 8 C68 8 86 12 88 30 C88 72 66 102 50 114 C34 102 12 72 12 30 C14 12 32 8 50 8 Z"
                stroke="#C5A77B"
                strokeWidth="3.2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {/* Concentric Fingerprint Ridges */}
              <g stroke="#C5A77B" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.95">
                <path d="M38 24 C45 21 55 21 62 24" />
                <path d="M32 30 C42 26 58 26 68 30" />
                <path d="M26 40 C38 34 62 34 74 40" />
                <path d="M24 54 C24 38 76 38 76 54 C76 76 65 94 50 102 C35 94 24 76 24 54" />
                <path d="M30 56 C30 44 70 44 70 56 C70 72 61 86 50 93 C39 86 30 72 30 56" />
                <path d="M36 58 C36 49 64 49 64 58 C64 68 57 78 50 84 C43 78 36 68 36 58" />
                <path d="M42 60 C42 54 58 54 58 60 C58 66 54 72 50 76 C46 72 42 66 42 60" />
                <path d="M48 62 C48 60 52 60 52 62 C52 65 50 68 50 70" />
              </g>
            </svg>
          </div>

          {/* Centered Brand Title matching Image 4 lettering */}
          <h1 className="font-brand text-2xl font-bold tracking-tight text-[#E8E4DC] leading-tight drop-shadow-xs">
            Fragments<br />First
          </h1>

          {/* Subtle Horizontal Divider */}
          <div className="w-40 h-[1px] bg-gradient-to-r from-transparent via-[#C5A77B]/40 to-transparent mt-4 mb-1" />
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-2 space-y-1.5 overflow-y-auto min-h-0 custom-nav-scrollbar">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen && setMobileOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3.5 px-4 py-2.5 rounded-full transition-all duration-200 font-sans text-sm font-medium
                  ${isActive
                    ? 'bg-[#294D6B] text-[#E8E4DC] shadow-[0_2px_12px_rgba(23,45,70,0.5)] border border-[#8FAFC4]/30'
                    : 'text-[#8FAFC4] hover:text-[#E8E4DC] hover:bg-white/[0.06]'
                  }
                `}
              >
                <Icon className="w-5 h-5 shrink-0 transition-transform group-hover:scale-105" />
                <span className="truncate tracking-wide">{item.label}</span>
              </NavLink>
            );
          })}

          {/* Logout Button */}
          <button
            onClick={logout}
            className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-full text-[#8FAFC4] hover:text-[#E8E4DC] hover:bg-white/[0.06] transition-all font-sans text-sm font-medium mt-3"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className="truncate tracking-wide">Logout</span>
          </button>
        </nav>

        {/* Bottom Section: Cursive Quote & Layered Ocean Waves */}
        <div className="relative pt-3 pb-0 text-center shrink-0">
          {/* Cursive Quote in Antique Gold */}
          <div className="px-6 pb-2">
            <p className="font-script text-2xl sm:text-[26px] text-[#C5A77B] leading-tight tracking-wide drop-shadow-2xs">
              Every fragment<br />
              brings us closer<br />
              to the truth.
            </p>
            {/* Subtle Arc Line Flourish */}
            <div className="mt-2 flex justify-center">
              <svg width="100" height="12" viewBox="0 0 100 12" fill="none">
                <path d="M10 2 Q50 14 90 2" stroke="#C5A77B" strokeWidth="1" strokeOpacity="0.45" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* Overlapping Layered Ocean Waves in Midnight Trust Tones */}
          <div className="w-full h-14 overflow-hidden relative mt-1">
            <svg
              className="w-full h-full absolute bottom-0 left-0"
              viewBox="0 0 256 56"
              fill="none"
              preserveAspectRatio="none"
            >
              {/* Back Wave */}
              <path
                d="M0 34 C60 18 120 48 180 28 C215 16 240 32 256 24 L256 56 L0 56 Z"
                fill="#1B3550"
                opacity="0.8"
              />
              {/* Mid Wave */}
              <path
                d="M0 40 C50 26 110 46 170 32 C210 22 240 38 256 32 L256 56 L0 56 Z"
                fill="#244563"
                opacity="0.7"
              />
              {/* Front Wave */}
              <path
                d="M0 46 C70 34 140 50 200 40 C230 34 250 44 256 40 L256 56 L0 56 Z"
                fill="#294D6B"
                opacity="0.6"
              />
            </svg>
          </div>
        </div>
      </aside>
    </>
  );
};
