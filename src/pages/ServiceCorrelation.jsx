import React, { useState, useCallback } from 'react';
import { 
  ReactFlow, 
  Controls, 
  Background, 
  MiniMap, 
  applyNodeChanges, 
  applyEdgeChanges,
  Handle,
  Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { 
  PhoneCall, 
  ShieldAlert, 
  Cpu, 
  Video, 
  Ambulance, 
  Building2, 
  Network, 
  Info, 
  CheckCircle2, 
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { useCase } from '../context/CaseContext';
import { EthicalNoticeBanner } from '../components/common/EthicalNoticeBanner';

// Custom Liquid Glass React Flow Service Node
const ServiceNode = ({ data, selected }) => {
  const getIcon = () => {
    switch (data.agencyType) {
      case 'Helpline / Dispatch': return <PhoneCall className="w-3.5 h-3.5" />;
      case 'Law Enforcement': return <ShieldAlert className="w-3.5 h-3.5" />;
      case 'Transit System IoT': return <Cpu className="w-3.5 h-3.5" />;
      case 'Visual Evidence': return <Video className="w-3.5 h-3.5" />;
      case 'Medical First Response': return <Ambulance className="w-3.5 h-3.5" />;
      case 'Trauma Receiving Facility': return <Building2 className="w-3.5 h-3.5" />;
      default: return <Cpu className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className={`p-4 rounded-2xl border bg-black/80 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.8)] min-w-[220px] text-xs transition-all relative overflow-hidden ${
      selected 
        ? 'border-sky-400 ring-2 ring-sky-400/50 shadow-[0_0_25px_rgba(14,165,233,0.4)]' 
        : 'border-white/15 hover:border-white/30'
    }`}>
      {/* Specular top edge */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

      {/* Target handle */}
      <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 !bg-sky-400 shadow-[0_0_8px_rgba(14,165,233,0.9)]" />

      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 font-semibold text-white">
          <span className={`p-1.5 rounded-lg border bg-white/[0.04] ${data.badgeColor || 'border-sky-400/40 text-sky-400 shadow-[0_0_8px_rgba(14,165,233,0.3)]'}`}>
            {getIcon()}
          </span>
          <span className="truncate text-[11px]">{data.agency}</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono border-t border-white/10 pt-2 mt-2 text-slate-400">
        <span className="text-sky-300 font-bold">{data.eventId}</span>
        <span className="text-rose-400 font-semibold">{data.timestamp}</span>
      </div>

      <p className="text-[10px] text-slate-300 mt-1.5 line-clamp-2 leading-tight">
        {data.details}
      </p>

      {/* Source handle */}
      <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 !bg-rose-500 shadow-[0_0_8px_rgba(255,0,127,0.9)]" />
    </div>
  );
};

const nodeTypes = {
  serviceNode: ServiceNode
};

export const ServiceCorrelation = () => {
  const { currentCase } = useCase();
  const initialCorrelation = currentCase.correlationData || { nodes: [], edges: [] };

  const [nodes, setNodes] = useState(initialCorrelation.nodes);
  const [edges, setEdges] = useState(initialCorrelation.edges);
  const [selectedEntity, setSelectedEntity] = useState(null);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onNodeClick = (_, node) => {
    setSelectedEntity({ type: 'node', data: node.data, id: node.id });
  };

  const onEdgeClick = (_, edge) => {
    setSelectedEntity({ type: 'edge', data: edge.data, label: edge.label, id: edge.id });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Cross-Service Incident Correlation Graph</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-sky-950/40 border border-sky-400/40 text-sky-300 font-mono text-[10px] shadow-[0_0_10px_rgba(14,165,233,0.3)]">
              REACT FLOW TOPOLOGY
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Case Ref: <span className="text-sky-300 font-mono font-medium">{currentCase.id}</span> • Interactive topology of linked multi-agency records and correlation justifications
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 bg-black/60 backdrop-blur-xl border border-white/10 px-3.5 py-1.5 rounded-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
          <span className="flex items-center gap-1.5 text-sky-400">
            <span className="w-3 h-0.5 bg-sky-400 inline-block shadow-[0_0_6px_rgba(14,165,233,0.8)]" /> Cerulean High Sync
          </span>
          <span className="flex items-center gap-1.5 text-rose-400">
            <span className="w-3 h-0.5 border-t border-dashed border-rose-500 inline-block shadow-[0_0_6px_rgba(255,0,127,0.8)]" /> Neon Rose Drift
          </span>
        </div>
      </div>

      <EthicalNoticeBanner />

      {/* Main Flow Canvas and Side Inspector Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* React Flow Container */}
        <div className="lg:col-span-3 bg-black/70 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.8)] relative h-[560px]">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            defaultEdgeOptions={{
              style: { stroke: 'rgba(14, 165, 233, 0.4)', strokeWidth: 2 },
            }}
          >
            <Background color="#0ea5e9" gap={24} size={1} className="opacity-15" />
            <Controls />
            <MiniMap 
              nodeColor="#0ea5e9" 
              maskColor="rgba(3, 7, 18, 0.9)" 
              className="!bg-black/90 !border-white/10 !rounded-xl"
            />
          </ReactFlow>

          <div className="absolute top-3 left-3 px-3 py-1.5 rounded-xl bg-black/75 backdrop-blur-xl border border-white/10 text-[10px] font-mono text-sky-300 pointer-events-none shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
            DRAG NODES OR CLICK EDGES TO INSPECT CAUSAL LINKS
          </div>
        </div>

        {/* Right Inspector Panel */}
        <div className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.6)] flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-sky-400/30 to-rose-400/30" />

          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <h3 className="text-sm font-semibold text-white">Correlation Inspector</h3>
              <Network className="w-4 h-4 text-sky-400" />
            </div>

            {selectedEntity ? (
              <div className="space-y-4 text-xs animate-in fade-in duration-150">
                {selectedEntity.type === 'node' ? (
                  <>
                    <div className="p-3.5 bg-white/[0.02] rounded-xl border border-white/10">
                      <span className="text-[10px] font-mono text-sky-400 uppercase block">SELECTED ENTITY</span>
                      <h4 className="text-sm font-semibold text-white mt-0.5">{selectedEntity.data.agency}</h4>
                      <div className="text-[10px] text-sky-300 font-mono mt-1">ID: {selectedEntity.data.eventId}</div>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Telemetry Record</span>
                      <p className="text-slate-300 leading-relaxed bg-black/40 p-3 rounded-xl border border-white/10">
                        {selectedEntity.data.details}
                      </p>
                    </div>

                    <div className="p-3 bg-black/40 border border-white/10 rounded-xl space-y-1 font-mono text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Timestamp:</span>
                        <span className="text-white">{selectedEntity.data.timestamp}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Status:</span>
                        <span className="text-sky-300 font-bold">{selectedEntity.data.status}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-3.5 bg-white/[0.02] rounded-xl border border-white/10">
                      <span className="text-[10px] font-mono text-rose-400 uppercase block">CORRELATION BRIDGE</span>
                      <h4 className="text-xs font-semibold text-sky-300 mt-0.5">{selectedEntity.label}</h4>
                      <div className="text-[10px] text-slate-400 font-mono mt-1">Edge: {selectedEntity.id}</div>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Correlation Justification</span>
                      <p className="text-slate-300 leading-relaxed bg-black/40 p-3 rounded-xl border border-white/10">
                        {selectedEntity.data.correlationReason}
                      </p>
                    </div>

                    <div className="p-3 bg-black/40 border border-white/10 rounded-xl space-y-1 font-mono text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Confidence Score:</span>
                        <span className="text-sky-300 font-bold">{selectedEntity.data.confidence}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Uncertainty Risk:</span>
                        <span className="text-rose-400 font-bold">{selectedEntity.data.uncertainty}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                <Info className="w-6 h-6 text-slate-600 mx-auto" />
                <p>Click any agency node or edge in the graph to view technical correlation rationale and confidence metrics.</p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 text-[10px] text-slate-400 font-mono">
            MULTI-AGENCY BRIDGE PROTOCOL • IEEE 1588 PTP
          </div>
        </div>
      </div>
    </div>
  );
};
