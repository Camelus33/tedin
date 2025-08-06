'use client';

import React from 'react';

// Types from SummaryNote edit page - ensure consistency
interface DiagramNode {
  noteId: string;
  content: string;
  order: number;
  color: string;
  position: { x: number; y: number };
}

interface DiagramConnection {
  id: string;
  sourceNoteId: string;
  targetNoteId: string;
  relationshipType: RelationshipType;
}

export type RelationshipType = 'cause-effect' | 'before-after' | 'foundation-extension' | 'contains' | 'contrast';

interface RelationshipConfig {
  label: string;
  icon: string;
  color: string;
  strokeColor: string;
  description: string;
}

const RELATIONSHIP_CONFIGS: Record<RelationshipType, RelationshipConfig> = {
  'cause-effect': { label: '인과', icon: '→', color: 'text-red-400', strokeColor: '#f87171', description: 'A가 B의 원인이 됨' },
  'before-after': { label: '전후', icon: '⏭️', color: 'text-blue-400', strokeColor: '#60a5fa', description: '시간적 순서 관계' },
  'foundation-extension': { label: '확장', icon: '↑', color: 'text-green-400', strokeColor: '#4ade80', description: 'A가 B의 기반이 됨' },
  'contains': { label: '포함', icon: '⊃', color: 'text-purple-400', strokeColor: '#a78bfa', description: 'A가 B를 포함함' },
  'contrast': { label: '대조', icon: '↔', color: 'text-yellow-400', strokeColor: '#facc15', description: 'A와 B의 차이점' }
};

const calculateOptimalConnectionPoints = (
  sourcePos: { x: number; y: number },
  targetPos: { x: number; y: number },
  radius: number
) => {
  const dx = targetPos.x - sourcePos.x;
  const dy = targetPos.y - sourcePos.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance === 0) return null;
  
  const unitX = dx / distance;
  const unitY = dy / distance;
  
  const startX = sourcePos.x + unitX * radius;
  const startY = sourcePos.y + unitY * radius;
  const endX = targetPos.x - unitX * radius;
  const endY = targetPos.y - unitY * radius;
  
  return { startX, startY, endX, endY };
};

const createZigzagPath = (startX: number, startY: number, endX: number, endY: number, zigs = 5) => {
    const dx = endX - startX;
    const dy = endY - startY;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    const segmentLength = length / zigs;
    const perpendicularAngle = angle + Math.PI / 2;
    const amplitude = 5; // Zigzag height

    let path = `M ${startX} ${startY}`;
    for (let i = 1; i <= zigs; i++) {
        const progress = i / zigs;
        const currentX = startX + dx * progress;
        const currentY = startY + dy * progress;
        const offset = (i % 2 === 1 ? 1 : -1) * amplitude;
        
        const controlX = startX + dx * (progress - 0.5 / zigs) + offset * Math.cos(perpendicularAngle);
        const controlY = startY + dy * (progress - 0.5 / zigs) + offset * Math.sin(perpendicularAngle);

        path += ` Q ${controlX} ${controlY}, ${currentX} ${currentY}`;
    }
    return path;
};

interface VectorGraphCanvasProps {
  diagramData: {
    nodes: DiagramNode[];
    connections: DiagramConnection[];
  };
  onNodeSelect: (nodeId: string | null) => void;
  isMinimap?: boolean;
}

const VectorGraphCanvas: React.FC<VectorGraphCanvasProps> = ({ diagramData, onNodeSelect, isMinimap = false }) => {
  const { nodes: canvasNodes, connections: canvasConnections } = diagramData;

  const handleNodeClick = (nodeId: string) => {
    onNodeSelect(nodeId);
  };

  const renderGraph = () => {
    if (!canvasNodes || canvasNodes.length === 0) return null;
    
    const width = 800;
    const height = 600;
    const padding = isMinimap ? 20 : 80;
    
    const minX = Math.min(...canvasNodes.map(n => n.position.x));
    const maxX = Math.max(...canvasNodes.map(n => n.position.x));
    const minY = Math.min(...canvasNodes.map(n => n.position.y));
    const maxY = Math.max(...canvasNodes.map(n => n.position.y));
    
    const rangeX = maxX - minX || 100;
    const rangeY = maxY - minY || 100;
    
    const scaleX = (width - 2 * padding) / rangeX;
    const scaleY = (height - 2 * padding) / rangeY;
    const scale = Math.min(scaleX, scaleY);
    
    const normalizePosition = (pos: { x: number; y: number }) => ({
      x: padding + (pos.x - minX) * scale,
      y: padding + (pos.y - minY) * scale
    });
    
    const nodeRadius = isMinimap ? 10 : 25;

    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} style={{ background: '#111827' }}>
        <defs>
            {Object.entries(RELATIONSHIP_CONFIGS).map(([key, config]) => (
                 <marker key={key} id={`arrow-${key}`} markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill={config.strokeColor}/>
                </marker>
            ))}
        </defs>

        {canvasConnections.map(connection => {
          const sourceNode = canvasNodes.find(n => n.noteId === connection.sourceNoteId);
          const targetNode = canvasNodes.find(n => n.noteId === connection.targetNoteId);
          
          if (!sourceNode || !targetNode) return null;
          
          const sourcePos = normalizePosition(sourceNode.position);
          const targetPos = normalizePosition(targetNode.position);
          const config = RELATIONSHIP_CONFIGS[connection.relationshipType];
          
          const connectionPoints = calculateOptimalConnectionPoints(sourcePos, targetPos, nodeRadius);
          if (!connectionPoints) return null;
          
          const { startX, startY, endX, endY } = connectionPoints;
          const midX = (startX + endX) / 2;
          const midY = (startY + endY) / 2;

          let lineElement;
          switch (connection.relationshipType) {
              case 'before-after':
                  lineElement = <line x1={startX} y1={startY} x2={endX} y2={endY} stroke={config.strokeColor} strokeWidth={isMinimap ? "1" : "2"} strokeDasharray="3,3" markerEnd={`url(#arrow-${connection.relationshipType})`} />;
                  break;
              case 'contrast':
                  lineElement = <path d={createZigzagPath(startX, startY, endX, endY)} stroke={config.strokeColor} strokeWidth={isMinimap ? "1" : "2"} fill="none" markerEnd={`url(#arrow-${connection.relationshipType})`} />;
                  break;
              case 'contains':
                  lineElement = <line x1={startX} y1={startY} x2={endX} y2={endY} stroke={config.strokeColor} strokeWidth={isMinimap ? "2" : "4"} strokeOpacity="0.7" markerEnd={`url(#arrow-${connection.relationshipType})`} />;
                  break;
              default:
                  lineElement = <line x1={startX} y1={startY} x2={endX} y2={endY} stroke={config.strokeColor} strokeWidth={isMinimap ? "1" : "2"} markerEnd={`url(#arrow-${connection.relationshipType})`} />;
          }

          return (
            <g key={connection.id}>
              {lineElement}
              {!isMinimap && (
                <>
                    <circle cx={midX} cy={midY} r="10" fill={config.strokeColor} stroke="#1f2937" strokeWidth="1"/>
                    <text x={midX} y={midY + 4} textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">{config.icon}</text>
                </>
              )}
            </g>
          );
        })}

        {canvasNodes.map(node => {
          const pos = normalizePosition(node.position);
          const color = node.color.replace('bg-', '').replace('-600', '');
          const fillColorMap: Record<string, string> = {
            'blue': '#2563eb', 'green': '#16a34a', 'purple': '#9333ea', 'orange': '#ea580c',
            'red': '#dc2626', 'teal': '#0d9488', 'pink': '#db2777', 'indigo': '#4f46e5'
          };
          const fillColor = fillColorMap[color] || '#2563eb';
          
          return (
            <g key={node.noteId} transform={`translate(${pos.x}, ${pos.y})`} onClick={() => handleNodeClick(node.noteId)} style={{ cursor: 'pointer' }}>
              <circle r={nodeRadius} fill={fillColor} stroke="#4b5563" strokeWidth="2" />
              {!isMinimap && <text textAnchor="middle" dy=".3em" fill="white" fontSize="16" fontWeight="bold">{node.order}</text>}
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div className="w-full h-full">
      {renderGraph()}
    </div>
  );
};

export default VectorGraphCanvas;
