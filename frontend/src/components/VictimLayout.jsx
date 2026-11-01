import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const NAV_ITEMS = [
  { path: '/victim/dashboard',  icon: '⬡',  label: 'My Space' },
  { path: '/victim/statement',  icon: '✍',  label: 'My Statement' },
  { path: '/victim/voice',      icon: '🎙', label: 'Voice Statement' },
  { path: '/victim/submissions',icon: '📋', label: 'My Submissions' },
  { path: '/victim/redaction',  icon: '🔲', label: 'Redaction Studio' },
  { path: '/victim/receipts',   icon: '🧾', label: 'Consent Receipts' },
  { path: '/victim/privacy',    icon: '🔒', label: 'Privacy & Identity' },
  { path: '/victim/help',       icon: '❓', label: 'Help & Guidance' },
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
      <div className="sidebar-brand">
        <div className="sidebar-brand-name">Fragment First</div>
        <div className="sidebar-brand-tagline">Your story, safely told</div>
      </div>

      <div className="sidebar-user">
        <div className="sidebar-username">{displayName}</div>
        <span className="sidebar-role-badge">Private Account</span>
      </div>

      <div className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `sidebar-nav-item${isActive ? ' active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <span className="nav-icon" aria-hidden="true">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </div>

      <div className="sidebar-footer">
        <button
          id="sidebar-logout-btn"
          className="btn btn-ghost btn-sm"
          style={{ width: '100%', justifyContent: 'flex-start' }}
          onClick={handleLogout}
        >
          <span>↪</span> Sign Out
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
        {/* Mobile header */}
        <header className="mobile-header">
          <span className="sidebar-brand-name" style={{ fontSize: '16px' }}>Fragment First</span>
          <button
            id="mobile-menu-btn"
            className="mobile-menu-btn"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Open navigation menu"
          >
            ☰
          </button>
        </header>

        <main className="victim-main page-enter">
          {children}
        </main>
      </div>
    </div>
  );
}
