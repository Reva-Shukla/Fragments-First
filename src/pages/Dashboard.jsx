import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  Clock, 
  FileCheck, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  ArrowUpRight, 
  Activity, 
  FileText, 
  Database,
  Search,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { useCase } from '../context/CaseContext';
import { useAuth } from '../context/AuthContext';
import { MetricCard } from '../components/common/MetricCard';
import { Badge } from '../components/common/Badge';
import { EthicalNoticeBanner } from '../components/common/EthicalNoticeBanner';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { cases, currentCase, selectCase, auditLogs } = useCase();
  const { currentUser } = useAuth();

  const totalAssigned = cases.length;
  const activeCount = cases.filter(c => c.status === 'Active Investigation').length;
  const verificationCount = cases.filter(c => c.status === 'Verification Phase').length;
  const completedCount = cases.filter(c => c.status === 'Completed').length;

  // Chart data: Evidence types in liquid glass cerulean & neon rose palette
  const evidenceTypeData = [
    { name: 'CCTV / Video', count: 12, color: '#00f0ff', grad: 'url(#cctvPieGrad)' },
    { name: '911 / Radio Audio', count: 8, color: '#38bdf8', grad: 'url(#audioPieGrad)' },
    { name: 'CAD / Sensor SCADA', count: 15, color: '#ff007f', grad: 'url(#cadPieGrad)' },
    { name: 'Medical / ER HL7', count: 4, color: '#0ea5e9', grad: 'url(#medicalPieGrad)' },
    { name: 'Forensic Reports', count: 6, color: '#f43f5e', grad: 'url(#forensicPieGrad)' }
  ];

  // Chart data: Verification throughput (Cerulean Corroborated vs Neon Rose Discrepancies)
  const verificationThroughput = [
    { day: 'Mon', claimsCorroborated: 8, discrepancies: 2 },
    { day: 'Tue', claimsCorroborated: 12, discrepancies: 4 },
    { day: 'Wed', claimsCorroborated: 15, discrepancies: 1 },
    { day: 'Thu', claimsCorroborated: 11, discrepancies: 3 },
    { day: 'Fri', claimsCorroborated: 19, discrepancies: 2 },
    { day: 'Sat', claimsCorroborated: 6, discrepancies: 0 },
    { day: 'Sun', claimsCorroborated: 9, discrepancies: 1 }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner - Cyberpunk Liquid Glass HUD Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>Authority Investigation</span>
              <span className="text-[#00e5ff] drop-shadow-[0_0_12px_rgba(0,229,255,0.8)]">Dashboard</span>
            </h1>
            <span className="px-3 py-1 rounded-full bg-[#03142e]/90 border border-[#00f0ff]/60 text-[#00f0ff] font-mono text-[10px] font-bold tracking-widest shadow-[0_0_14px_rgba(0,240,255,0.4),inset_0_0_8px_rgba(0,240,255,0.2)] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-pulse shadow-[0_0_8px_#00f0ff]" />
              ONLINE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
            <span>Logged in as</span>
            <span className="text-sky-200 font-semibold drop-shadow-[0_0_6px_rgba(56,189,248,0.4)]">{currentUser?.name}</span>
            <span className="text-slate-400">({currentUser?.title}) • {currentUser?.agency}</span>
            <span className="px-2 py-0.5 rounded-md bg-[#051329] border border-[#0e274c] text-[10px] font-mono text-sky-400/80">
              SECURE CLEARANCE // LEVEL-4
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/claim-verification')}
            className="px-4 py-2 bg-gradient-to-r from-[#00d2ff] via-[#0088ff] to-[#ff007f] hover:from-[#38bdf8] hover:to-[#ff2d78] text-white font-semibold text-xs rounded-xl flex items-center gap-2 shadow-[0_0_24px_rgba(0,210,255,0.4),inset_0_1px_1.5px_rgba(255,255,255,0.5)] hover:shadow-[0_0_32px_rgba(255,0,127,0.5)] transition-all hover:scale-105 active:scale-95"
          >
            <span>Review Claims</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => navigate('/reports')}
            className="px-4 py-2 bg-[#04091a]/90 hover:bg-sky-500/20 text-slate-200 hover:text-white font-medium text-xs rounded-xl border border-[#0e274c] hover:border-sky-400/50 transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_0_16px_rgba(0,0,0,0.6)]"
          >
            Export Dossier
          </button>
        </div>
      </div>

      {/* Ethical Notice Banner */}
      <EthicalNoticeBanner />

      {/* Metric Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Assigned Cases"
          value={totalAssigned}
          change="+1 this week"
          trend="neutral"
          icon={Briefcase}
          subtitle="Assigned to your jurisdiction"
        />
        <MetricCard
          title="Active Investigations"
          value={activeCount}
          change="2 high priority"
          trend="up"
          icon={Activity}
          subtitle="Active sensor & timeline synthesis"
        />
        <MetricCard
          title="Pending Reviews"
          value={verificationCount + 1}
          change="3 awaiting concurrence"
          trend="down"
          icon={Clock}
          subtitle="Statement diff & claim verification"
        />
        <MetricCard
          title="Completed Inquiries"
          value={completedCount + 2}
          change="100% custody sealed"
          trend="up"
          icon={CheckCircle2}
          subtitle="Signed and submitted for legal review"
        />
      </div>

      {/* Analytics & Distribution Visualizers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Global SVG Definitions for Liquid Gradients */}
        <svg width="0" height="0" className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
          <defs>
            {/* Corroborated Liquid Cyan Gradient */}
            <linearGradient id="corroboratedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00f0ff" stopOpacity={1} />
              <stop offset="25%" stopColor="#0095ff" stopOpacity={0.9} />
              <stop offset="70%" stopColor="#0044cc" stopOpacity={0.75} />
              <stop offset="100%" stopColor="#041a4a" stopOpacity={0.6} />
            </linearGradient>

            {/* Discrepancy Liquid Rose Gradient */}
            <linearGradient id="discrepancyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff007f" stopOpacity={1} />
              <stop offset="35%" stopColor="#d6006c" stopOpacity={0.85} />
              <stop offset="75%" stopColor="#800040" stopOpacity={0.7} />
              <stop offset="100%" stopColor="#3d001e" stopOpacity={0.55} />
            </linearGradient>

            {/* Evidence Donut Segments Gradients */}
            <linearGradient id="cctvPieGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#00f0ff" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            <linearGradient id="audioPieGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>
            <linearGradient id="cadPieGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ff007f" />
              <stop offset="100%" stopColor="#a20050" />
            </linearGradient>
            <linearGradient id="medicalPieGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#075985" />
            </linearGradient>
            <linearGradient id="forensicPieGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#881337" />
            </linearGradient>
          </defs>
        </svg>

        {/* Verification Throughput Chart - Cyberpunk Liquid Glass HUD */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-2xl bg-[#040713]/95 backdrop-blur-2xl border border-[#0d274c]/80 p-6 shadow-[0_0_35px_rgba(0,180,255,0.14),0_12px_40px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.1)] group">
          {/* Subtle Ambient Radial Backlight behind bars */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_75%,rgba(0,140,255,0.09)_0%,transparent_70%)]" />

          {/* Top-Left Cyberpunk HUD Bracket */}
          <div className="pointer-events-none absolute top-0 left-0 z-20">
            <svg width="100" height="80" viewBox="0 0 100 80" fill="none">
              {/* Outer cyan bracket with chamfer */}
              <path
                d="M 2 46 L 2 20 L 20 2 L 68 2"
                stroke="#00f0ff"
                strokeWidth="2.5"
                strokeLinecap="round"
                style={{ filter: 'drop-shadow(0 0 5px #00f0ff)' }}
              />
              {/* Inner diagonal notch */}
              <line
                x1="10"
                y1="22"
                x2="22"
                y2="10"
                stroke="#00f0ff"
                strokeWidth="1.5"
                strokeOpacity="0.75"
              />
            </svg>
          </div>

          {/* Bottom-Right Cyberpunk HUD Bracket & Vents */}
          <div className="pointer-events-none absolute bottom-0 right-0 z-20">
            <svg width="120" height="80" viewBox="0 0 120 80" fill="none">
              {/* Outer rose bracket with chamfer */}
              <path
                d="M 15 78 L 98 78 L 118 58 L 118 28"
                stroke="#ff007f"
                strokeWidth="2.5"
                strokeLinecap="round"
                style={{ filter: 'drop-shadow(0 0 5px #ff007f)' }}
              />
              {/* 3 Diagonal Vents / Slashes /// */}
              <line x1="72" y1="74" x2="80" y2="66" stroke="#ff007f" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="81" y1="74" x2="89" y2="66" stroke="#ff007f" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="90" y1="74" x2="98" y2="66" stroke="#ff007f" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>

          {/* Card Header: Icon, Dual-Color Title & Capsule Legend */}
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3.5">
              {/* Custom Cyber Neon Line/Bar Chart Icon */}
              <div className="w-12 h-12 rounded-xl bg-[#031126] border border-[#00d2ff]/80 flex items-center justify-center shadow-[0_0_16px_rgba(0,210,255,0.4),inset_0_0_12px_rgba(0,210,255,0.25)] shrink-0">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" style={{ filter: 'drop-shadow(0 0 5px rgba(0, 210, 255, 0.8))' }}>
                  <rect x="3.5" y="13" width="3" height="7" rx="0.75" fill="#00d2ff" />
                  <rect x="9.5" y="9.5" width="3" height="10.5" rx="0.75" fill="#00d2ff" />
                  <rect x="15.5" y="6" width="3" height="14" rx="0.75" fill="#00d2ff" />
                  <path
                    d="M 3.5 14.5 L 9.5 10.5 L 14.5 12.5 L 20.5 6"
                    stroke="#00d2ff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 16.5 6 H 20.5 V 10"
                    stroke="#00d2ff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div>
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
                  <span>Claim Corroboration</span>
                  <span className="text-[#00e5ff] drop-shadow-[0_0_10px_rgba(0,229,255,0.8)]">Throughput</span>
                </h2>
                <p className="text-xs text-[#94a3b8] mt-0.5 font-normal">
                  Daily volume of factual verifications and flagged timeline discrepancies
                </p>
              </div>
            </div>

            {/* Capsule Legend */}
            <div className="flex items-center gap-5 px-4 py-2 rounded-full bg-[#050f24]/90 border border-[#0e3b6e]/70 shadow-[0_0_16px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.1)] self-start sm:self-auto">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#00d2ff] shadow-[0_0_10px_#00d2ff]" />
                <span className="text-xs font-medium text-[#38bdf8]">Corroborated</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#ff007f] shadow-[0_0_10px_#ff007f]" />
                <span className="text-xs font-medium text-[#ff2d78]">Discrepancies</span>
              </div>
            </div>
          </div>

          {/* Chart Canvas */}
          <div className="relative z-10 h-72 sm:h-80 min-h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={verificationThroughput}
                margin={{ top: 20, right: 15, left: -5, bottom: 10 }}
                barGap={6}
                barCategoryGap="24%"
              >
                <CartesianGrid
                  strokeDasharray="4 4"
                  stroke="#122749"
                  vertical={false}
                />

                <XAxis
                  dataKey="day"
                  stroke="#00e5ff"
                  tickLine={false}
                  axisLine={{ stroke: '#00e5ff', strokeWidth: 1.5, strokeOpacity: 0.95 }}
                  tick={{ fill: '#94a3b8', fontSize: 13, fontWeight: 500 }}
                  dy={12}
                />

                <YAxis
                  domain={[0, 20]}
                  ticks={[0, 5, 10, 15, 20]}
                  stroke="#00e5ff"
                  tickLine={false}
                  axisLine={{ stroke: '#00e5ff', strokeWidth: 1.5, strokeOpacity: 0.95 }}
                  tick={{ fill: '#94a3b8', fontSize: 13, fontWeight: 500 }}
                  dx={-8}
                />

                <Tooltip
                  cursor={{ fill: 'rgba(0, 240, 255, 0.04)' }}
                  contentStyle={{
                    backgroundColor: 'rgba(4, 9, 24, 0.95)',
                    borderColor: '#00d2ff',
                    borderWidth: '1px',
                    borderRadius: '12px',
                    backdropFilter: 'blur(16px)',
                    boxShadow: '0 0 20px rgba(0, 210, 255, 0.35)',
                    fontSize: '12px',
                    color: '#ffffff'
                  }}
                />

                <Bar
                  dataKey="claimsCorroborated"
                  fill="url(#corroboratedGrad)"
                  stroke="#00f0ff"
                  strokeWidth={1.5}
                  radius={[8, 8, 0, 0]}
                  name="Corroborated"
                  maxBarSize={32}
                  style={{ filter: 'drop-shadow(0 0 8px rgba(0, 240, 255, 0.5))' }}
                />

                <Bar
                  dataKey="discrepancies"
                  fill="url(#discrepancyGrad)"
                  stroke="#ff007f"
                  strokeWidth={1.5}
                  radius={[6, 6, 0, 0]}
                  name="Discrepancies"
                  maxBarSize={32}
                  style={{ filter: 'drop-shadow(0 0 8px rgba(255, 0, 127, 0.5))' }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Evidence Source Distribution - Cyberpunk Liquid Glass HUD */}
        <div className="relative overflow-hidden rounded-2xl bg-[#040713]/95 backdrop-blur-2xl border border-[#0d274c]/80 p-6 shadow-[0_0_35px_rgba(255,0,127,0.14),0_12px_40px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.1)] group flex flex-col justify-between">
          {/* Subtle Ambient Radial Backlight behind donut */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(255,0,127,0.08)_0%,transparent_70%)]" />

          {/* Top-Left Cyberpunk HUD Bracket */}
          <div className="pointer-events-none absolute top-0 left-0 z-20">
            <svg width="100" height="80" viewBox="0 0 100 80" fill="none">
              {/* Outer cyan bracket with chamfer */}
              <path
                d="M 2 46 L 2 20 L 20 2 L 68 2"
                stroke="#00f0ff"
                strokeWidth="2.5"
                strokeLinecap="round"
                style={{ filter: 'drop-shadow(0 0 5px #00f0ff)' }}
              />
              {/* Inner diagonal notch */}
              <line
                x1="10"
                y1="22"
                x2="22"
                y2="10"
                stroke="#00f0ff"
                strokeWidth="1.5"
                strokeOpacity="0.75"
              />
            </svg>
          </div>

          {/* Bottom-Right Cyberpunk HUD Bracket & Vents */}
          <div className="pointer-events-none absolute bottom-0 right-0 z-20">
            <svg width="120" height="80" viewBox="0 0 120 80" fill="none">
              {/* Outer rose bracket with chamfer */}
              <path
                d="M 15 78 L 98 78 L 118 58 L 118 28"
                stroke="#ff007f"
                strokeWidth="2.5"
                strokeLinecap="round"
                style={{ filter: 'drop-shadow(0 0 5px #ff007f)' }}
              />
              {/* 3 Diagonal Vents / Slashes /// */}
              <line x1="72" y1="74" x2="80" y2="66" stroke="#ff007f" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="81" y1="74" x2="89" y2="66" stroke="#ff007f" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="90" y1="74" x2="98" y2="66" stroke="#ff007f" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>

          <div>
            {/* Header: Icon, Dual-Color Title & Streams Badge */}
            <div className="relative z-10 flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                {/* Cyber Neon Donut Chart Icon */}
                <div className="w-12 h-12 rounded-xl bg-[#14061a] border border-[#ff007f]/80 flex items-center justify-center shadow-[0_0_16px_rgba(255,0,127,0.4),inset_0_0_12px_rgba(255,0,127,0.25)] shrink-0">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" style={{ filter: 'drop-shadow(0 0 5px rgba(255, 0, 127, 0.8))' }}>
                    <path
                      d="M 21.2 15.8 A 10 10 0 1 1 8.2 2.8"
                      stroke="#ff007f"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 22 12 A 10 10 0 0 0 12 2 V 12 Z"
                      fill="#ff007f"
                      stroke="#ff007f"
                      strokeWidth="1"
                    />
                  </svg>
                </div>

                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
                    <span>Evidence</span>
                    <span className="text-[#ff007f] drop-shadow-[0_0_10px_rgba(255,0,127,0.8)]">Distribution</span>
                  </h2>
                  <p className="text-xs text-[#94a3b8] mt-0.5 font-normal">
                    Ingested multi-agency evidentiary streams
                  </p>
                </div>
              </div>

              {/* Total Badge */}
              <div className="px-3 py-1.5 rounded-full bg-[#120617]/90 border border-[#ff007f]/40 shadow-[0_0_12px_rgba(255,0,127,0.25),inset_0_1px_1px_rgba(255,255,255,0.1)] shrink-0 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#ff007f] shadow-[0_0_6px_#ff007f]" />
                <span className="text-xs font-mono font-semibold text-rose-300">45 Streams</span>
              </div>
            </div>

            {/* Donut Chart Canvas with Center HUD Badge */}
            <div className="relative z-10 h-52 sm:h-56 w-full flex items-center justify-center my-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={evidenceTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={76}
                    paddingAngle={4}
                    dataKey="count"
                    stroke="#040713"
                    strokeWidth={2.5}
                  >
                    {evidenceTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.grad} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: 'rgba(4, 9, 24, 0.95)', 
                      borderColor: '#ff007f', 
                      borderWidth: '1px',
                      borderRadius: '12px', 
                      backdropFilter: 'blur(16px)',
                      boxShadow: '0 0 20px rgba(255, 0, 127, 0.35)',
                      fontSize: '12px',
                      color: '#ffffff'
                    }}
                    formatter={(value, name) => [`${value} items`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center HUD Info Badge */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-18 h-18 rounded-full border border-sky-400/25 bg-[#04091a]/85 backdrop-blur-md flex flex-col items-center justify-center shadow-[inset_0_0_12px_rgba(0,210,255,0.25),0_0_16px_rgba(0,0,0,0.8)]">
                  <span className="text-lg font-extrabold text-white tracking-tight drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]">45</span>
                  <span className="text-[8px] font-mono text-sky-300 uppercase tracking-widest -mt-0.5">Streams</span>
                </div>
              </div>
            </div>
          </div>

          {/* Evidence Types List with Glowing Dots */}
          <div className="relative z-10 space-y-1.5 mt-2 border-t border-[#0e274c]/80 pt-3.5">
            {evidenceTypeData.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg hover:bg-white/[0.04] transition-all group/item"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full transition-transform group-hover/item:scale-125"
                    style={{
                      backgroundColor: item.color,
                      boxShadow: `0 0 8px ${item.color}`
                    }}
                  />
                  <span className="text-slate-300 group-hover/item:text-white transition-colors">
                    {item.name}
                  </span>
                </div>
                <span className="font-mono text-slate-400 group-hover/item:text-slate-200 transition-colors">
                  {item.count} items
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Cases Quick Table & Live Activity - Cyberpunk Liquid Glass HUD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Cases Table - Cyberpunk Liquid Glass HUD */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-2xl bg-[#040713]/95 backdrop-blur-2xl border border-[#0d274c]/80 p-6 shadow-[0_0_35px_rgba(0,180,255,0.14),0_12px_40px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.1)] group">
          {/* Subtle Ambient Radial Backlight */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_30%,rgba(0,140,255,0.08)_0%,transparent_70%)]" />

          {/* Top-Left Cyberpunk HUD Bracket */}
          <div className="pointer-events-none absolute top-0 left-0 z-20">
            <svg width="100" height="80" viewBox="0 0 100 80" fill="none">
              {/* Outer cyan bracket with chamfer */}
              <path
                d="M 2 46 L 2 20 L 20 2 L 68 2"
                stroke="#00f0ff"
                strokeWidth="2.5"
                strokeLinecap="round"
                style={{ filter: 'drop-shadow(0 0 5px #00f0ff)' }}
              />
              {/* Inner diagonal notch */}
              <line
                x1="10"
                y1="22"
                x2="22"
                y2="10"
                stroke="#00f0ff"
                strokeWidth="1.5"
                strokeOpacity="0.75"
              />
            </svg>
          </div>

          {/* Bottom-Right Cyberpunk HUD Bracket & Vents */}
          <div className="pointer-events-none absolute bottom-0 right-0 z-20">
            <svg width="120" height="80" viewBox="0 0 120 80" fill="none">
              {/* Outer rose bracket with chamfer */}
              <path
                d="M 15 78 L 98 78 L 118 58 L 118 28"
                stroke="#ff007f"
                strokeWidth="2.5"
                strokeLinecap="round"
                style={{ filter: 'drop-shadow(0 0 5px #ff007f)' }}
              />
              {/* 3 Diagonal Vents / Slashes /// */}
              <line x1="72" y1="74" x2="80" y2="66" stroke="#ff007f" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="81" y1="74" x2="89" y2="66" stroke="#ff007f" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="90" y1="74" x2="98" y2="66" stroke="#ff007f" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>

          {/* Card Header: Icon, Dual-Color Title & Action */}
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-3.5">
              {/* Custom Cyber Neon Briefcase/Cases Icon */}
              <div className="w-12 h-12 rounded-xl bg-[#031126] border border-[#00d2ff]/80 flex items-center justify-center shadow-[0_0_16px_rgba(0,210,255,0.4),inset_0_0_12px_rgba(0,210,255,0.25)] shrink-0">
                <Briefcase className="w-6 h-6 text-[#00d2ff]" style={{ filter: 'drop-shadow(0 0 5px rgba(0, 210, 255, 0.8))' }} />
              </div>

              <div>
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
                  <span>Assigned Investigation</span>
                  <span className="text-[#00e5ff] drop-shadow-[0_0_10px_rgba(0,229,255,0.8)]">Cases</span>
                </h2>
                <p className="text-xs text-[#94a3b8] mt-0.5 font-normal">
                  Active dossiers currently under investigation
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/cases')}
              className="px-3.5 py-1.5 rounded-full bg-[#050f24]/90 border border-[#00d2ff]/40 hover:border-[#00d2ff] hover:bg-[#00d2ff]/10 text-xs font-mono font-medium text-sky-300 hover:text-white shadow-[0_0_12px_rgba(0,210,255,0.25)] transition-all flex items-center gap-1.5 self-start sm:self-auto"
            >
              <span>View All Cases</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Table Canvas */}
          <div className="relative z-10 overflow-x-auto rounded-xl border border-[#0e274c]/80 mt-4">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#061226]/90 text-sky-300/80 font-mono text-[11px] uppercase tracking-wider border-b border-[#0e274c]">
                <tr>
                  <th className="py-3 px-3.5">Case ID</th>
                  <th className="py-3 px-3.5">Incident Brief</th>
                  <th className="py-3 px-3.5">Status</th>
                  <th className="py-3 px-3.5">Priority</th>
                  <th className="py-3 px-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0e274c]/50">
                {cases.map((c) => (
                  <tr 
                    key={c.id} 
                    className={`hover:bg-sky-500/[0.08] transition-colors group/row ${
                      c.id === currentCase.id ? 'bg-sky-500/[0.09]' : ''
                    }`}
                  >
                    <td className="py-3.5 px-3.5 font-mono font-bold text-[#00e5ff] tracking-wider drop-shadow-[0_0_6px_rgba(0,210,255,0.4)]">
                      {c.id}
                    </td>
                    <td className="py-3.5 px-3.5">
                      <div className="font-medium text-slate-100 group-hover/row:text-white transition-colors line-clamp-1">{c.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{c.incidentType}</div>
                    </td>
                    <td className="py-3.5 px-3.5">
                      <Badge variant={c.status} size="sm">
                        {c.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-3.5">
                      <Badge variant={c.priority} size="sm">
                        {c.priority}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-3.5 text-right">
                      <button
                        onClick={() => {
                          selectCase(c.id);
                          navigate('/statement-review');
                        }}
                        className="px-3 py-1 rounded-xl bg-[#031126] hover:bg-sky-500/25 border border-sky-400/40 hover:border-sky-300 text-sky-200 text-[11px] font-medium shadow-[0_0_10px_rgba(0,210,255,0.2)] hover:shadow-[0_0_16px_rgba(0,210,255,0.5)] transition-all"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Audit Activity Feed - Cyberpunk Liquid Glass HUD */}
        <div className="relative overflow-hidden rounded-2xl bg-[#040713]/95 backdrop-blur-2xl border border-[#0d274c]/80 p-6 shadow-[0_0_35px_rgba(255,0,127,0.14),0_12px_40px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.1)] group flex flex-col justify-between">
          {/* Subtle Ambient Radial Backlight */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(255,0,127,0.08)_0%,transparent_70%)]" />

          {/* Top-Left Cyberpunk HUD Bracket */}
          <div className="pointer-events-none absolute top-0 left-0 z-20">
            <svg width="100" height="80" viewBox="0 0 100 80" fill="none">
              {/* Outer cyan bracket with chamfer */}
              <path
                d="M 2 46 L 2 20 L 20 2 L 68 2"
                stroke="#00f0ff"
                strokeWidth="2.5"
                strokeLinecap="round"
                style={{ filter: 'drop-shadow(0 0 5px #00f0ff)' }}
              />
              {/* Inner diagonal notch */}
              <line
                x1="10"
                y1="22"
                x2="22"
                y2="10"
                stroke="#00f0ff"
                strokeWidth="1.5"
                strokeOpacity="0.75"
              />
            </svg>
          </div>

          {/* Bottom-Right Cyberpunk HUD Bracket & Vents */}
          <div className="pointer-events-none absolute bottom-0 right-0 z-20">
            <svg width="120" height="80" viewBox="0 0 120 80" fill="none">
              {/* Outer rose bracket with chamfer */}
              <path
                d="M 15 78 L 98 78 L 118 58 L 118 28"
                stroke="#ff007f"
                strokeWidth="2.5"
                strokeLinecap="round"
                style={{ filter: 'drop-shadow(0 0 5px #ff007f)' }}
              />
              {/* 3 Diagonal Vents / Slashes /// */}
              <line x1="72" y1="74" x2="80" y2="66" stroke="#ff007f" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="81" y1="74" x2="89" y2="66" stroke="#ff007f" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="90" y1="74" x2="98" y2="66" stroke="#ff007f" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>

          <div>
            {/* Header: Icon, Dual-Color Title & Action */}
            <div className="relative z-10 flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                {/* Cyber Neon Activity Icon */}
                <div className="w-12 h-12 rounded-xl bg-[#14061a] border border-[#ff007f]/80 flex items-center justify-center shadow-[0_0_16px_rgba(255,0,127,0.4),inset_0_0_12px_rgba(255,0,127,0.25)] shrink-0">
                  <Activity className="w-6 h-6 text-[#ff007f]" style={{ filter: 'drop-shadow(0 0 5px rgba(255, 0, 127, 0.8))' }} />
                </div>

                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
                    <span>Live Investigation</span>
                    <span className="text-[#ff007f] drop-shadow-[0_0_10px_rgba(255,0,127,0.8)]">Activity</span>
                  </h2>
                  <p className="text-xs text-[#94a3b8] mt-0.5 font-normal">
                    Cryptographic immutable audit stream
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate('/audit-logs')}
                className="px-3 py-1.5 rounded-full bg-[#14061a]/90 border border-[#ff007f]/40 hover:border-[#ff007f] hover:bg-[#ff007f]/10 text-xs font-mono font-medium text-rose-300 hover:text-white shadow-[0_0_12px_rgba(255,0,127,0.25)] transition-all shrink-0"
              >
                Full Ledger
              </button>
            </div>

            {/* Activity Feed Cards */}
            <div className="relative z-10 space-y-3 mt-4 flex-1 overflow-y-auto max-h-[380px] pr-1">
              {auditLogs.slice(0, 5).map((log) => (
                <div 
                  key={log.id} 
                  className="p-3.5 rounded-xl bg-[#061226]/75 hover:bg-[#081a38] border border-[#0e274c] hover:border-sky-400/50 text-xs shadow-[inset_0_1px_1px_rgba(255,255,255,0.06),0_4px_16px_rgba(0,0,0,0.5)] transition-all duration-200 group/log"
                >
                  <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
                    <span className="text-[#00e5ff] font-bold tracking-wide drop-shadow-[0_0_6px_rgba(0,229,255,0.5)]">
                      {log.actionType}
                    </span>
                    <span className="text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 group-hover/log:text-slate-100 line-clamp-2 leading-relaxed transition-colors">
                    {log.details}
                  </p>
                  <div className="mt-2 pt-1.5 border-t border-white/[0.04] flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span className="text-sky-300/80 font-medium">{log.role}</span>
                    <span className="text-rose-400/90 font-semibold">Block #{log.blockNumber}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
