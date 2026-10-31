import React, { useState } from 'react';
import { 
  GitFork, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  HelpCircle, 
  ShieldCheck, 
  ArrowRight, 
  Search, 
  FileText, 
  Activity, 
  Layers,
  ChevronRight,
  Info
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell 
} from 'recharts';
import { useCase } from '../context/CaseContext';
import { EthicalNoticeBanner } from '../components/common/EthicalNoticeBanner';
import { Badge } from '../components/common/Badge';

export const RootCauseAnalysis = () => {
  const { currentCase } = useCase();
  const rootCauses = currentCase.rootCauses || [];

  const [selectedHypothesis, setSelectedHypothesis] = useState(rootCauses[0]);

  const chartData = rootCauses.map((hyp) => ({
    name: `Hypothesis #${hyp.rank}`,
    title: hyp.title.length > 25 ? hyp.title.slice(0, 25) + '...' : hyp.title,
    probability: hyp.probabilityScore,
    color: hyp.rank === 1 ? '#0ea5e9' : hyp.rank === 2 ? '#ff007f' : '#0284c7'
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Root Cause Analysis & Hypothesis Ranking</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-sky-950/40 border border-sky-400/40 text-sky-300 font-mono text-[10px] shadow-[0_0_10px_rgba(14,165,233,0.3)]">
              MULTI-HYPOTHESIS ENGINE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Case Ref: <span className="text-sky-300 font-mono font-medium">{currentCase.id}</span> • Probabilistic weighting of competing investigative hypotheses
          </p>
        </div>

        {/* Primary Determination Badge */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-sky-950/40 border border-sky-400/50 text-xs text-sky-300 font-mono shadow-[0_0_15px_rgba(14,165,233,0.25)]">
          <CheckCircle2 className="w-4 h-4 text-sky-400 drop-shadow-[0_0_6px_rgba(14,165,233,0.8)]" />
          <span>PRIMARY FINDING: RANK #1 (92% FORENSIC CERTAINTY)</span>
        </div>
      </div>

      <EthicalNoticeBanner />

      {/* Comparative Probability Bar Chart */}
      <div className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.6)] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-sky-400/30 to-rose-400/30" />

        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-white">Hypothesis Corroboration Comparison</h2>
            <p className="text-xs text-slate-400">Probabilistic weight assigned by physical telemetry and corroboration matrices</p>
          </div>
        </div>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={11} unit="%" />
              <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} width={90} />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: 'rgba(3, 7, 18, 0.9)', 
                  borderColor: 'rgba(255, 255, 255, 0.15)', 
                  borderRadius: '12px', 
                  backdropFilter: 'blur(16px)',
                  fontSize: '12px' 
                }}
                formatter={(val) => [`${val}% Probability`, 'Forensic Score']}
              />
              <Bar dataKey="probability" radius={[0, 6, 6, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Ranked Hypotheses List */}
      <div className="space-y-4">
        {rootCauses.map((hyp) => {
          const isSelected = selectedHypothesis?.id === hyp.id;

          return (
            <div
              key={hyp.id}
              onClick={() => setSelectedHypothesis(hyp)}
              className={`bg-black/60 backdrop-blur-2xl border rounded-2xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.6)] transition-all cursor-pointer relative overflow-hidden group ${
                isSelected
                  ? 'border-sky-400/70 shadow-[0_0_25px_rgba(14,165,233,0.25)]'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-white/10 mb-3">
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold text-xs ${
                    hyp.rank === 1
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-400/50 shadow-[0_0_12px_rgba(14,165,233,0.3)]'
                      : 'bg-white/[0.04] text-slate-400 border border-white/10'
                  }`}>
                    #{hyp.rank}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{hyp.title}</h3>
                    <span className="text-[11px] text-sky-400 font-mono">Category: {hyp.category}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-mono block">PROBABILITY</span>
                    <span className={`text-base font-bold font-mono ${hyp.rank === 1 ? 'text-sky-300' : 'text-rose-400'}`}>
                      {hyp.probabilityScore}%
                    </span>
                  </div>
                  <span className={`px-3 py-1 rounded-xl text-xs font-mono font-medium border ${
                    hyp.rank === 1
                      ? 'bg-sky-950/40 text-sky-300 border-sky-400/50 shadow-[0_0_10px_rgba(14,165,233,0.25)]'
                      : 'bg-white/[0.04] text-slate-300 border-white/10'
                  }`}>
                    {hyp.confidenceLevel}
                  </span>
                </div>
              </div>

              {/* Supporting vs Contradicting Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                {/* Supporting */}
                <div className="p-4 bg-white/[0.02] border border-white/10 rounded-xl">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-400 mb-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 drop-shadow-[0_0_6px_rgba(14,165,233,0.8)]" />
                    <span>Supporting Evidence & Corroborating Logs</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {hyp.supportingEvidence.map((ev, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-sky-400 mt-1">•</span>
                        <span className="leading-relaxed">{ev}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Contradicting */}
                <div className="p-4 bg-white/[0.02] border border-white/10 rounded-xl">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 mb-2">
                    <XCircle className="w-4 h-4 shrink-0 drop-shadow-[0_0_6px_rgba(255,0,127,0.8)]" />
                    <span>Contradicting Facts & Refutations</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {hyp.contradictingEvidence.length > 0 ? (
                      hyp.contradictingEvidence.map((ev, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-rose-400 mt-1">•</span>
                          <span className="leading-relaxed">{ev}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-slate-500 italic text-[11px]">No contradictory evidence identified</li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Missing Info & Uncertainty */}
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-rose-950/20 border border-rose-500/40 rounded-xl text-rose-300/90 shadow-[0_0_12px_rgba(255,0,127,0.15)]">
                  <span className="font-semibold block font-mono text-[10px] uppercase mb-1">
                    Missing Information Required to Formally Close:
                  </span>
                  <ul className="space-y-1 text-[11px]">
                    {hyp.missingInformation.map((gap, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-rose-400 font-bold">-</span>
                        <span>{gap}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-black/40 border border-white/10 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Uncertainty Margin:</span>
                    <span className="text-slate-200 font-semibold">{hyp.uncertaintyRating}</span>
                  </div>
                  <div className="border-t border-white/10 pt-1.5">
                    <span className="text-[10px] font-mono text-sky-400 block mb-1">SOURCE REFERENCES:</span>
                    <div className="flex flex-wrap gap-1">
                      {hyp.sourceReferences.map((ref, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/10 text-[10px] font-mono text-slate-300">
                          {ref}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
