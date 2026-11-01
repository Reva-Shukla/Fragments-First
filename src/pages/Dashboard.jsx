import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  Activity, 
  ArrowUpRight, 
  ChevronRight,
  PieChart as PieIcon,
  BarChart3,
  Edit3,
  ArrowRight
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

  // Chart data: Evidence types in strict Midnight Trust palette
  const evidenceTypeData = [
    { name: 'CAD / Sensor SCADA', count: 15, color: '#294D6B' }, // Steel Blue
    { name: 'CCTV / Video Streams', count: 12, color: '#C5A77B' }, // Antique Gold
    { name: '911 / Radio Audio', count: 8, color: '#8FAFC4' },    // Muted Blue
    { name: 'Forensic Records', count: 6, color: '#172D46' },     // Midnight Navy
    { name: 'Medical / ER HL7', count: 4, color: '#416B8E' }      // Supporting Slate Steel
  ];

  // Chart data: Verification throughput (Steel Blue Corroborated vs Antique Gold Discrepancies)
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
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Hero Banner Card: Replaces Image 2 with Image 1 layout & Image 3 Puzzle Mind artwork */}
      <div className="relative overflow-hidden rounded-3xl bg-[#fbf9f4] border border-[#D8D2C6] shadow-[0_6px_30px_rgba(23,45,70,0.06)] flex flex-col md:flex-row items-stretch min-h-[280px] sm:min-h-[310px]">
        {/* Subtle Ambient Light Orbs */}
        <div className="pointer-events-none absolute -top-16 -left-16 w-56 h-56 rounded-full bg-[#C5A77B]/15 blur-3xl" />

        {/* Left Side: Brand Typography, Tagline, Body & Action Buttons */}
        <div className="flex-1 p-6 sm:p-8 lg:p-10 z-10 flex flex-col justify-between relative bg-gradient-to-r from-[#fbf9f4] via-[#fbf9f4] to-[#fbf9f4]/95 md:to-transparent">
          <div>
            {/* Title matching Image 4 lettering */}
            <h1 className="font-brand text-3xl sm:text-4xl lg:text-5xl font-bold text-[#172D46] tracking-tight leading-tight">
              Fragments First
            </h1>

            {/* Italic Tagline matching Images 2 & 3 */}
            <p className="font-brand italic text-lg sm:text-xl text-[#294D6B] mt-1.5 font-medium tracking-wide">
              Report. Reconstruct. Resolve.
            </p>

            {/* Antique Gold Hairline Divider */}
            <div className="w-16 h-[2px] bg-[#C5A77B] my-3.5" />

            {/* Description Text */}
            <p className="font-sans text-xs sm:text-sm text-[#5E7A91] leading-relaxed max-w-md font-medium">
              Together, let's turn fragmented information into clarity and justice.
            </p>
          </div>

          {/* Action Buttons matching Image 3 with Steel Blue primary pill */}
          <div className="mt-6 flex items-center gap-3.5 flex-wrap">
            {/* Main Pill Button */}
            <button
              onClick={() => navigate('/cases')}
              className="px-5 py-2.5 rounded-full bg-[#294D6B] hover:bg-[#172D46] text-[#E8E4DC] font-sans text-xs sm:text-sm font-semibold flex items-center gap-2.5 shadow-[0_4px_16px_rgba(41,77,107,0.3)] hover:shadow-[0_6px_22px_rgba(23,45,70,0.4)] transition-all hover:-translate-y-0.5"
            >
              <Edit3 className="w-4 h-4 text-[#8FAFC4]" />
              <span>Report an Incident</span>
              <ArrowRight className="w-4 h-4 text-[#E8E4DC]" />
            </button>

            {/* Secondary Claims Button */}
            <button
              onClick={() => navigate('/claim-verification')}
              className="px-4 py-2.5 rounded-full bg-white/90 hover:bg-white text-[#294D6B] hover:text-[#172D46] font-sans text-xs sm:text-sm font-semibold border border-[#D8D2C6] hover:border-[#294D6B] transition-all shadow-xs"
            >
              Review Claims
            </button>
          </div>
        </div>

        {/* Right Side: Image 3 (Puzzle Mind Silhouette) with Sweeping Wave Gradient Transitions */}
        <div className="md:w-5/12 lg:w-1/2 relative min-h-[220px] md:min-h-full overflow-hidden bg-[#061833]">
          {/* Glowing blue background backlight for Image 3 */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#021833] via-[#092c5a] to-[#04152d]" />

          {/* The Puzzle Mind Image (Image 3) */}
          <img
            src="/hero-puzzle-head.png"
            alt="Fragments First - Puzzle Mind Reconstruction"
            className="w-full h-full object-cover object-center relative z-0 opacity-95 transition-transform duration-700 hover:scale-105"
          />

          {/* Radial Sea-Blue Glow around the puzzle silhouette */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_45%,rgba(14,165,233,0.3)_0%,transparent_65%)] pointer-events-none z-10" />

          {/* Sweeping Smooth Transition Gradient from Left into Image */}
          <div className="absolute inset-y-0 left-0 w-36 bg-gradient-to-r from-[#fbf9f4] via-[#fbf9f4]/80 to-transparent pointer-events-none hidden md:block z-10" />

          {/* Curved Wave Ribbons bridging cream text area to the glowing blue artwork */}
          <div className="absolute inset-y-0 left-0 w-28 pointer-events-none hidden md:block z-20">
            <svg className="h-full w-full" viewBox="0 0 100 300" preserveAspectRatio="none" fill="none">
              {/* Primary Cream Curve */}
              <path
                d="M0 0 L55 0 C30 90 85 190 35 300 L0 300 Z"
                fill="#fbf9f4"
              />
              {/* Semi-transparent Sea Blue Wave Layer */}
              <path
                d="M55 0 C30 90 85 190 35 300 C55 210 15 95 75 0 Z"
                fill="rgba(2, 132, 199, 0.15)"
              />
              {/* Subtle Ambient Golden Sun Wave Line */}
              <path
                d="M58 0 C32 92 88 192 38 300"
                stroke="rgba(213, 170, 85, 0.3)"
                strokeWidth="1.5"
              />
            </svg>
          </div>

          {/* Subtle bottom edge vignette */}
          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/30 to-transparent pointer-events-none z-10" />
        </div>
      </div>

      {/* Reassuring Ethical Notice Banner */}
      <EthicalNoticeBanner />

      {/* 4 Stat Metric Indicators */}
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
          change="2 priority cases"
          trend="up"
          icon={Activity}
          subtitle="Sensor telemetry & timeline sync"
        />
        <MetricCard
          title="Pending Reviews"
          value={verificationCount + 1}
          change="3 in queue"
          trend="down"
          icon={Clock}
          subtitle="Statement diff & corroboration"
        />
        <MetricCard
          title="Completed Inquiries"
          value={completedCount + 2}
          change="100% custody sealed"
          trend="up"
          icon={CheckCircle2}
          subtitle="Legally verified & closed"
        />
      </div>

      {/* Analytics & Data Distribution with Midnight Trust palette */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Verification Throughput Chart */}
        <div className="lg:col-span-2 rounded-2xl bg-white/90 backdrop-blur-md border border-[#D8D2C6] p-6 shadow-[0_4px_20px_rgba(23,45,70,0.05)] flex flex-col justify-between">
          <div>
            {/* Header with Title and Legend */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EAF1F7] border border-[#8FAFC4]/50 flex items-center justify-center text-[#294D6B] shadow-2xs">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif-clean text-lg font-bold text-[#172D46] tracking-wide">
                    Claim Corroboration Throughput
                  </h2>
                  <p className="font-sans text-xs text-[#5E7A91] mt-0.5">
                    Factual verifications and flagged discrepancies over time
                  </p>
                </div>
              </div>

              {/* Legend with Midnight Trust contrast */}
              <div className="flex items-center gap-4 px-4 py-1.5 rounded-full bg-[#F8F6F1] border border-[#D8D2C6] self-start sm:self-auto text-xs font-sans shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#294D6B] shadow-xs" />
                  <span className="text-[#294D6B] font-bold">Corroborated</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#C5A77B] shadow-xs" />
                  <span className="text-[#8E6E3C] font-bold">Discrepancies</span>
                </div>
              </div>
            </div>

            {/* Chart Canvas */}
            <div className="h-72 sm:h-80 min-h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={verificationThroughput}
                  margin={{ top: 15, right: 15, left: -10, bottom: 5 }}
                  barGap={6}
                  barCategoryGap="28%"
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#E2E8F0"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="day"
                    stroke="#294D6B"
                    tickLine={false}
                    axisLine={{ stroke: '#CBD5E1', strokeWidth: 1 }}
                    tick={{ fill: '#172D46', fontSize: 12, fontWeight: 600, fontFamily: 'Inter, sans-serif' }}
                    dy={10}
                  />

                  <YAxis
                    domain={[0, 20]}
                    ticks={[0, 5, 10, 15, 20]}
                    stroke="#294D6B"
                    tickLine={false}
                    axisLine={{ stroke: '#CBD5E1', strokeWidth: 1 }}
                    tick={{ fill: '#172D46', fontSize: 12, fontWeight: 600, fontFamily: 'Inter, sans-serif' }}
                    dx={-6}
                  />

                  <Tooltip
                    cursor={{ fill: 'rgba(41, 77, 107, 0.08)' }}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.98)',
                      borderColor: '#294D6B',
                      borderWidth: '1.5px',
                      borderRadius: '12px',
                      boxShadow: '0 4px 20px rgba(23, 45, 70, 0.15)',
                      fontSize: '12px',
                      color: '#172D46',
                      fontFamily: 'Inter, sans-serif'
                    }}
                  />

                  {/* Steel Blue Bar */}
                  <Bar
                    dataKey="claimsCorroborated"
                    fill="#294D6B"
                    radius={[6, 6, 0, 0]}
                    name="Corroborated"
                    maxBarSize={30}
                  />

                  {/* Antique Gold Bar */}
                  <Bar
                    dataKey="discrepancies"
                    fill="#C5A77B"
                    radius={[6, 6, 0, 0]}
                    name="Discrepancies"
                    maxBarSize={30}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Evidence Distribution Donut Chart */}
        <div className="rounded-2xl bg-white/90 backdrop-blur-md border border-[#D8D2C6] p-6 shadow-[0_4px_20px_rgba(23,45,70,0.05)] flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FAF6EF] border border-[#C5A77B]/50 flex items-center justify-center text-[#8E6E3C] shadow-2xs">
                  <PieIcon className="w-5 h-5 text-[#8E6E3C]" />
                </div>
                <div>
                  <h2 className="font-serif-clean text-lg font-bold text-[#172D46] tracking-wide">
                    Evidence Streams
                  </h2>
                  <p className="font-sans text-xs text-[#5E7A91] mt-0.5">
                    Multi-agency ingested telemetries
                  </p>
                </div>
              </div>

              <div className="px-3 py-1 rounded-full bg-[#EAF1F7] border border-[#8FAFC4]/60 text-xs font-bold text-[#294D6B] font-mono shadow-2xs">
                45 Total
              </div>
            </div>

            {/* Donut Chart with Center Pill */}
            <div className="relative h-52 sm:h-56 w-full flex items-center justify-center my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={evidenceTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="count"
                    stroke="#ffffff"
                    strokeWidth={2.5}
                  >
                    {evidenceTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.98)',
                      borderColor: '#294D6B',
                      borderWidth: '1.5px',
                      borderRadius: '12px',
                      boxShadow: '0 4px 20px rgba(23, 45, 70, 0.15)',
                      fontSize: '12px',
                      color: '#172D46',
                      fontFamily: 'Inter, sans-serif'
                    }}
                    formatter={(value, name) => [`${value} items`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Info Badge */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-16 h-16 rounded-full bg-[#F8F6F1] border-2 border-[#D8D2C6] flex flex-col items-center justify-center shadow-xs">
                  <span className="font-mono text-2xl font-extrabold text-[#294D6B] leading-none">45</span>
                  <span className="font-sans text-[9px] uppercase tracking-wider text-[#172D46] mt-0.5 font-bold">Streams</span>
                </div>
              </div>
            </div>
          </div>

          {/* Evidence Types List */}
          <div className="space-y-1.5 mt-3 border-t border-[#E8E4DC] pt-3 font-sans">
            {evidenceTypeData.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg hover:bg-[#F8F6F1] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3 h-3 rounded-full shadow-2xs"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-[#172D46] font-semibold text-xs">
                    {item.name}
                  </span>
                </div>
                <span className="text-[#294D6B] text-[11px] font-bold font-mono">
                  {item.count} items
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Cases & Live Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Cases Table */}
        <div className="lg:col-span-2 rounded-2xl bg-white/90 backdrop-blur-md border border-[#D8D2C6] p-6 shadow-[0_4px_20px_rgba(23,45,70,0.05)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EAF1F7] border border-[#8FAFC4]/50 flex items-center justify-center text-[#294D6B]">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif-clean text-lg font-bold text-[#172D46] tracking-wide">
                  Assigned Investigation Cases
                </h2>
                <p className="font-sans text-xs text-[#5E7A91] mt-0.5">
                  Active dossiers currently under your oversight
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/cases')}
              className="px-4 py-1.5 rounded-full bg-[#294D6B] hover:bg-[#172D46] text-xs font-bold text-[#E8E4DC] border border-[#294D6B] transition-all flex items-center gap-1.5 self-start sm:self-auto font-sans shadow-2xs"
            >
              <span>View All Cases</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#E8E4DC]" />
            </button>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto rounded-xl border border-[#D8D2C6] mt-4">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F6F1] text-[#294D6B] font-sans font-bold text-[11px] uppercase tracking-wider border-b border-[#D8D2C6]">
                <tr>
                  <th className="py-3 px-3.5">Case ID</th>
                  <th className="py-3 px-3.5">Incident Brief</th>
                  <th className="py-3 px-3.5">Status</th>
                  <th className="py-3 px-3.5">Priority</th>
                  <th className="py-3 px-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E4DC]">
                {cases.map((c) => (
                  <tr 
                    key={c.id} 
                    className={`hover:bg-[#F8F6F1]/80 transition-colors ${
                      c.id === currentCase.id ? 'bg-[#E8E4DC]/40' : ''
                    }`}
                  >
                    <td className="py-3.5 px-3.5 font-mono font-bold text-[#294D6B]">
                      {c.id}
                    </td>
                    <td className="py-3.5 px-3.5">
                      <div className="font-serif-clean font-bold text-[#172D46] text-xs line-clamp-1">{c.title}</div>
                      <div className="text-[11px] text-[#5E7A91] mt-0.5 font-sans">{c.incidentType}</div>
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
                        className="px-3.5 py-1 rounded-lg bg-white hover:bg-[#294D6B] text-[#294D6B] hover:text-[#E8E4DC] text-[11px] font-bold border border-[#D8D2C6] hover:border-[#294D6B] transition-all font-sans shadow-2xs"
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

        {/* Live Audit Activity Feed */}
        <div className="rounded-2xl bg-white/90 backdrop-blur-md border border-[#D8D2C6] p-6 shadow-[0_4px_20px_rgba(23,45,70,0.05)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FAF6EF] border border-[#C5A77B]/50 flex items-center justify-center text-[#8E6E3C]">
                  <Activity className="w-5 h-5 text-[#8E6E3C]" />
                </div>
                <div>
                  <h2 className="font-serif-clean text-lg font-bold text-[#172D46] tracking-wide">
                    Live Audit Ledger
                  </h2>
                  <p className="font-sans text-xs text-[#5E7A91] mt-0.5">
                    Immutable investigation ledger
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate('/audit-logs')}
                className="px-3 py-1 rounded-full bg-white hover:bg-[#F8F6F1] text-xs font-bold text-[#294D6B] border border-[#D8D2C6] hover:border-[#294D6B] transition-all shrink-0 font-sans shadow-2xs"
              >
                Full Log
              </button>
            </div>

            {/* Audit Log Cards */}
            <div className="space-y-2.5 mt-4 overflow-y-auto max-h-[380px] pr-1">
              {auditLogs.slice(0, 5).map((log) => (
                <div 
                  key={log.id} 
                  className="p-3.5 rounded-xl bg-[#F8F6F1] hover:bg-white border border-[#D8D2C6] hover:border-[#294D6B]/50 text-xs transition-colors shadow-2xs"
                >
                  <div className="flex items-center justify-between text-[11px] mb-1 font-mono font-bold">
                    <span className="text-[#294D6B]">
                      {log.actionType}
                    </span>
                    <span className="text-[#5E7A91] font-mono text-[10px]">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#233B54] line-clamp-2 leading-relaxed font-sans">
                    {log.details}
                  </p>
                  <div className="mt-2 pt-1.5 border-t border-[#E8E4DC] flex items-center justify-between text-[10px] text-[#5E7A91] font-sans">
                    <span className="font-semibold text-[#172D46]">{log.role}</span>
                    <span className="font-mono font-bold text-[#172D46] bg-[#C5A77B] px-2 py-0.5 rounded border border-[#A88A5E]">
                      Block #{log.blockNumber}
                    </span>
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
