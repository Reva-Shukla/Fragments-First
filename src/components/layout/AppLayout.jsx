import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const AppLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-slate-100 flex relative overflow-hidden">
      {/* Ambient Fluid Light Orbs (Cerulean Blue & Neon Rose only) */}
      <div className="fixed top-[-10%] left-[-5%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-br from-sky-500/18 to-transparent blur-[130px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-tl from-rose-500/15 to-transparent blur-[140px] pointer-events-none z-0" />
      <div className="fixed top-[45%] right-[20%] w-[25vw] h-[25vw] rounded-full bg-sky-600/10 blur-[120px] pointer-events-none z-0" />

      {/* Persistent Liquid Glass Authority Sidebar */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 relative z-10">
        {/* Top Liquid Glass Header */}
        <Header onMenuClick={() => setMobileOpen(true)} />

        {/* Dynamic Page Router View */}
        <main className="flex-1 p-4 lg:p-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
