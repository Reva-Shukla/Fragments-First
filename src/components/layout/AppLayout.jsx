import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const AppLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#E8E4DC] bg-[url('/site-bg.jpg')] bg-repeat bg-fixed text-[#172D46] flex relative overflow-hidden">
      {/* Subtle Ambient Light Glows over the Soft Ivory Canvas */}
      <div className="fixed top-[-10%] left-[-5%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-br from-[#C5A77B]/10 via-transparent to-transparent blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-tl from-[#294D6B]/10 via-transparent to-transparent blur-[150px] pointer-events-none z-0" />

      {/* Persistent Authority Sidebar */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 relative z-10">
        {/* Top Header */}
        <Header onMenuClick={() => setMobileOpen(true)} />

        {/* Dynamic Page Router View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
