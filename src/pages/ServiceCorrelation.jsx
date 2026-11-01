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

// Custom Midnight Trust React Flow Service Node
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
    <div className={`p-4 rounded-2xl border bg-[#FCFBF9] shadow-md min-w-[220px] text-xs transition-all relative overflow-hidden ${
      selected 
        ? 'border-2 border-[#294D6B] shadow-lg ring-2 ring-[#294D6B]/30' 
        : 'border-[#D8D2C6] hover:border-[#294D6B]'
    }`}>
      {/* Specular top edge */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C5A77B]/40 to-transparent" />

      {/* Target handle */}
      <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 !bg-[#294D6B] border border-white" />

      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 font-bold text-[#172D46]">
          <span className="p-1.5 rounded-lg border bg-[#EAF1F7] border-[#294D6B]/30 text-[#294D6B]">
            {getIcon()}
          </span>
          <span className="truncate text-[11px]">{data.agency}</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono border-t border-[#D8D2C6]/70 pt-2 mt-2 text-[#5E7A91]">
        <span className="text-[#294D6B] font-bold">{data.eventId}</span>
        <span className="text-[#172D46] font-semibold">{data.timestamp}</span>
      </div>

      <p className="text-[10px] text-[#233B54] mt-1.5 line-clamp-2 leading-tight font-reading">
        {data.details}
      </p>

      {/* Source handle */}
      <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 !bg-[#C5A77B] border border-white" />
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
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif-clean text-2xl font-bold text-[#172D46] tracking-tight">Cross-Service Incident Correlation Graph</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#EAF1F7] border border-[#294D6B]/30 text-[#294D6B] font-mono text-[10px] font-semibold">
              REACT FLOW TOPOLOGY
            </span>
          </div>
          <p className="text-xs text-[#5E7A91] mt-1">
            Case Ref: <span className="text-[#294D6B] font-mono font-medium">{currentCase.id}</span> • Interactive topology of linked multi-agency records and correlation justifications
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] font-mono text-[#5E7A91] bg-white border border-[#D8D2C6] px-3.5 py-1.5 rounded-xl shadow-xs">
          <span className="flex items-center gap-1.5 text-[#294D6B] font-semibold">
            <span className="w-3 h-0.5 bg-[#294D6B] inline-block" /> Steel Blue High Sync
          </span>
          <span className="flex items-center gap-1.5 text-[#C5A77B] font-semibold">
            <span className="w-3 h-0.5 border-t border-dashed border-[#C5A77B] inline-block" /> Antique Gold Drift
          </span>
        </div>
      </div>

      <EthicalNoticeBanner />

      {/* Main Flow Canvas and Side Inspector Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* React Flow Container */}
        <div className="lg:col-span-3 bg-[#EDE9E2] border border-[#D8D2C6] rounded-2xl overflow-hidden shadow-sm relative h-[560px]">
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
              style: { stroke: '#294D6B', strokeWidth: 2 },
            }}
          >
            <Background color="#294D6B" gap={24} size={1} className="opacity-20" />
            <Controls />
            <MiniMap 
              nodeColor="#294D6B" 
              maskColor="rgba(23, 45, 70, 0.15)" 
              className="!bg-white/95 !border-[#D8D2C6] !rounded-xl shadow-xs"
            />
          </ReactFlow>

          <div className="absolute top-3 left-3 px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-xl border border-[#D8D2C6] text-[10px] font-mono text-[#294D6B] font-semibold pointer-events-none shadow-xs">
            DRAG NODES OR CLICK EDGES TO INSPECT CAUSAL LINKS
          </div>
        </div>

        {/* Right Inspector Panel */}
        <div className="bg-[#FCFBF9] border border-[#D8D2C6] rounded-2xl p-6 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C5A77B]/40 to-transparent" />

          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#D8D2C6]/70 mb-4">
              <h3 className="font-serif-clean text-base font-bold text-[#172D46]">Correlation Inspector</h3>
              <Network className="w-4 h-4 text-[#294D6B]" />
            </div>

            {selectedEntity ? (
              <div className="space-y-4 text-xs">
                {selectedEntity.type === 'node' ? (
                  <>
                    <div className="p-3.5 bg-white rounded-xl border border-[#D8D2C6] shadow-xs">
                      <span className="text-[10px] font-mono text-[#294D6B] uppercase block font-semibold">SELECTED ENTITY</span>
                      <h4 className="text-sm font-bold text-[#172D46] mt-0.5">{selectedEntity.data.agency}</h4>
                      <div className="text-[10px] text-[#5E7A91] font-mono mt-1">ID: <span className="text-[#294D6B] font-semibold">{selectedEntity.data.eventId}</span></div>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono text-[#5E7A91] uppercase block mb-1 font-semibold">Telemetry Record</span>
                      <p className="text-[#233B54] leading-relaxed bg-white p-3 rounded-xl border border-[#D8D2C6] font-reading shadow-xs">
                        {selectedEntity.data.details}
                      </p>
                    </div>

                    <div className="p-3 bg-white border border-[#D8D2C6] rounded-xl space-y-1.5 font-mono text-[11px] shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[#5E7A91]">Timestamp:</span>
                        <span className="text-[#172D46] font-semibold">{selectedEntity.data.timestamp}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#5E7A91]">Status:</span>
                        <span className="text-[#294D6B] font-bold">{selectedEntity.data.status}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-3.5 bg-white rounded-xl border border-[#D8D2C6] shadow-xs">
                      <span className="text-[10px] font-mono text-[#C5A77B] uppercase block font-semibold">CORRELATION BRIDGE</span>
                      <h4 className="text-xs font-bold text-[#172D46] mt-0.5">{selectedEntity.label}</h4>
                      <div className="text-[10px] text-[#5E7A91] font-mono mt-1">Edge: <span className="text-[#294D6B]">{selectedEntity.id}</span></div>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono text-[#5E7A91] uppercase block mb-1 font-semibold">Correlation Justification</span>
                      <p className="text-[#233B54] leading-relaxed bg-white p-3 rounded-xl border border-[#D8D2C6] font-reading shadow-xs">
                        {selectedEntity.data.correlationReason}
                      </p>
                    </div>

                    <div className="p-3 bg-white border border-[#D8D2C6] rounded-xl space-y-1.5 font-mono text-[11px] shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[#5E7A91]">Confidence Score:</span>
                        <span className="text-[#294D6B] font-bold">{selectedEntity.data.confidence}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#5E7A91]">Uncertainty Risk:</span>
                        <span className="text-[#C5A77B] font-bold">{selectedEntity.data.uncertainty}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-[#5E7A91] space-y-2">
                <Info className="w-6 h-6 text-[#8FAFC4] mx-auto" />
                <p>Click any agency node or edge in the graph to view technical correlation rationale and confidence metrics.</p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[#D8D2C6]/70 text-[10px] text-[#5E7A91] font-mono font-medium">
            MULTI-AGENCY BRIDGE PROTOCOL • IEEE 1588 PTP
          </div>
        </div>
      </div>
    </div>
  );
};
