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
    color: hyp.rank === 1 ? '#294D6B' : hyp.rank === 2 ? '#C5A77B' : '#8FAFC4'
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif-clean text-2xl font-bold text-[#172D46] tracking-tight">Root Cause Analysis & Hypothesis Ranking</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#EAF1F7] border border-[#294D6B]/30 text-[#294D6B] font-mono text-[10px] font-semibold">
              MULTI-HYPOTHESIS ENGINE
            </span>
          </div>
          <p className="text-xs text-[#5E7A91] mt-1">
            Case Ref: <span className="text-[#294D6B] font-mono font-medium">{currentCase.id}</span> • Probabilistic weighting of competing investigative hypotheses
          </p>
        </div>

        {/* Primary Determination Badge */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#EAF1F7] border border-[#294D6B]/30 text-xs text-[#294D6B] font-mono shadow-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-[#294D6B]" />
          <span>PRIMARY FINDING: RANK #1 (92% FORENSIC CERTAINTY)</span>
        </div>
      </div>

      <EthicalNoticeBanner />

      {/* Comparative Probability Bar Chart */}
      <div className="bg-[#FCFBF9] border border-[#D8D2C6] rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C5A77B]/40 to-transparent" />

        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-serif-clean text-base font-bold text-[#172D46]">Hypothesis Corroboration Comparison</h2>
            <p className="text-xs text-[#5E7A91]">Probabilistic weight assigned by physical telemetry and corroboration matrices</p>
          </div>
        </div>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <XAxis type="number" domain={[0, 100]} stroke="#5E7A91" fontSize={11} unit="%" />
              <YAxis dataKey="name" type="category" stroke="#5E7A91" fontSize={11} width={90} />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: '#172D46', 
                  borderColor: '#C5A77B', 
                  borderRadius: '12px', 
                  color: '#FCFBF9',
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
              className={`bg-[#FCFBF9] border rounded-2xl p-6 shadow-xs transition-all cursor-pointer relative overflow-hidden group ${
                isSelected
                  ? 'border-2 border-[#294D6B] shadow-md bg-[#FAF9F5]'
                  : 'border-[#D8D2C6] hover:border-[#294D6B]'
              }`}
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C5A77B]/40 to-transparent" />

              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-[#D8D2C6]/70 mb-3">
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold text-xs ${
                    hyp.rank === 1
                      ? 'bg-[#294D6B] text-white shadow-xs'
                      : 'bg-white text-[#5E7A91] border border-[#D8D2C6]'
                  }`}>
                    #{hyp.rank}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-[#172D46]">{hyp.title}</h3>
                    <span className="text-[11px] text-[#294D6B] font-mono font-medium">Category: {hyp.category}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <div className="text-right">
                    <span className="text-[10px] text-[#5E7A91] font-mono block">PROBABILITY</span>
                    <span className={`text-base font-bold font-mono ${hyp.rank === 1 ? 'text-[#294D6B]' : 'text-[#8E6E3C]'}`}>
                      {hyp.probabilityScore}%
                    </span>
                  </div>
                  <span className={`px-3 py-1 rounded-xl text-xs font-mono font-medium border ${
                    hyp.rank === 1
                      ? 'bg-[#EAF1F7] text-[#294D6B] border-[#294D6B]/30'
                      : 'bg-white text-[#5E7A91] border-[#D8D2C6]'
                  }`}>
                    {hyp.confidenceLevel}
                  </span>
                </div>
              </div>

              {/* Supporting vs Contradicting Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                {/* Supporting */}
                <div className="p-4 bg-white border border-[#D8D2C6] rounded-xl shadow-xs">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#294D6B] mb-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-[#294D6B]" />
                    <span>Supporting Evidence & Corroborating Logs</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-[#233B54] font-reading">
                    {hyp.supportingEvidence.map((ev, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#294D6B] mt-1 font-bold">•</span>
                        <span className="leading-relaxed">{ev}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Contradicting */}
                <div className="p-4 bg-white border border-[#D8D2C6] rounded-xl shadow-xs">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#9B2C2C] mb-2">
                    <XCircle className="w-4 h-4 shrink-0 text-[#9B2C2C]" />
                    <span>Contradicting Facts & Refutations</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-[#233B54] font-reading">
                    {hyp.contradictingEvidence.length > 0 ? (
                      hyp.contradictingEvidence.map((ev, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-[#9B2C2C] mt-1 font-bold">•</span>
                          <span className="leading-relaxed">{ev}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-[#8FAFC4] italic text-[11px]">No contradictory evidence identified</li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Missing Info & Uncertainty */}
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#FAF6EF] border border-[#C5A77B]/50 rounded-xl text-[#8E6E3C] shadow-xs">
                  <span className="font-bold block font-mono text-[10px] uppercase mb-1 text-[#8E6E3C]">
                    Missing Information Required to Formally Close:
                  </span>
                  <ul className="space-y-1 text-[11px] text-[#5B4727]">
                    {hyp.missingInformation.map((gap, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-[#C5A77B] font-bold">-</span>
                        <span>{gap}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-white border border-[#D8D2C6] rounded-xl space-y-1.5 shadow-xs">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[#5E7A91]">Uncertainty Margin:</span>
                    <span className="text-[#172D46] font-semibold">{hyp.uncertaintyRating}</span>
                  </div>
                  <div className="border-t border-[#D8D2C6]/60 pt-1.5">
                    <span className="text-[10px] font-mono text-[#294D6B] block mb-1 font-semibold">SOURCE REFERENCES:</span>
                    <div className="flex flex-wrap gap-1">
                      {hyp.sourceReferences.map((ref, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-[#EAF1F7] border border-[#294D6B]/20 text-[10px] font-mono text-[#294D6B] font-medium">
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
