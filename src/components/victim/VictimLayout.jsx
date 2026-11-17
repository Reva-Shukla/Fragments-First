import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Home, 
  PenTool, 
  FileCheck2, 
  ShieldCheck, 
  Receipt, 
  UserCheck, 
  HelpCircle, 
  LogOut, 
  Menu,
  Heart
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/victim/dashboard', icon: Home, label: 'My Space' },
  { path: '/victim/statement', icon: PenTool, label: 'My Statement' },
  { path: '/victim/submissions', icon: FileCheck2, label: 'My Submissions' },
  { path: '/victim/redaction', icon: ShieldCheck, label: 'Redaction Studio' },
  { path: '/victim/receipts', icon: Receipt, label: 'Consent Receipts' },
  { path: '/victim/privacy', icon: UserCheck, label: 'Privacy & Identity' },
  { path: '/victim/help', icon: HelpCircle, label: 'Help & Guidance' },
];

export default function VictimLayout({ children }) {
  const { displayName, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const sidebar = (
    <nav className={`victim-sidebar${sidebarOpen ? ' open' : ''}`} aria-label="Main navigation">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#294D6B] to-[#172D46] border border-[#C5A77B]/60 flex items-center justify-center text-[#C5A77B] shadow-sm">
            <Heart className="w-4 h-4 stroke-[2]" />
          </div>
          <div>
            <div className="sidebar-brand-name">Fragment First</div>
            <div className="sidebar-brand-tagline">Trauma-Informed Space</div>
          </div>
        </div>
      </div>

      {/* User Session Info */}
      <div className="sidebar-user">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-[#C5A77B] animate-pulse" />
          <div className="sidebar-username">{displayName || 'Private Account'}</div>
        </div>
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#294D6B]/50 border border-[#C5A77B]/40">
          <span className="sidebar-role-badge">Protected Victim Account</span>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sidebar-nav-item${isActive ? ' active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon className="w-4 h-4 shrink-0 text-[#C5A77B]" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Sidebar Footer with Sign Out */}
      <div className="sidebar-footer">
        <button
          id="sidebar-logout-btn"
          className="btn btn-ghost btn-sm"
          style={{ width: '100%', justifyContent: 'flex-start', color: '#FCFBF9', borderColor: 'rgba(143, 175, 196, 0.3)' }}
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 text-[#8FAFC4]" />
          <span>Sign Out Safely</span>
        </button>
      </div>
    </nav>
  );

  return (
    <div className="victim-layout">
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay${sidebarOpen ? ' visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {sidebar}

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Mobile Header */}
        <header className="mobile-header">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#294D6B] border border-[#C5A77B]/60 flex items-center justify-center text-[#C5A77B]">
              <Heart className="w-3.5 h-3.5" />
            </div>
            <span className="font-brand text-sm font-semibold text-white">Fragment First</span>
          </div>
          <button
            id="mobile-menu-btn"
            className="mobile-menu-btn p-1"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5 text-white" />
          </button>
        </header>

        {/* Ambient background glow accents matching Authority AppLayout */}
        <div className="fixed top-[-10%] left-[-5%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-br from-[#C5A77B]/10 via-transparent to-transparent blur-[140px] pointer-events-none z-0" />
        <div className="fixed bottom-[-10%] right-[-5%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-tl from-[#294D6B]/10 via-transparent to-transparent blur-[150px] pointer-events-none z-0" />

        {/* Main Content Area */}
        <main className="victim-main page-enter relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
}
