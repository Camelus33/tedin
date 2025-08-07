'use client';

import React, { useState } from 'react';

// Types from SummaryNote edit page - ensure consistency
interface DiagramNode {
  noteId: string;
  content: string;
  order: number;
  color: string;
  position: { x: number; y: number };
  // 크기 조절 기능 추가 (하위 호환성을 위해 기본값 설정)
  size?: {
    width: number;
    height: number;
  };
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

export const RELATIONSHIP_CONFIGS: Record<RelationshipType, RelationshipConfig> = {
  'cause-effect': { label: '인과', icon: '→', color: 'text-red-400', strokeColor: '#8b5cf6', description: 'A가 B의 원인이 됨' },
  'before-after': { label: '전후', icon: '⏭️', color: 'text-blue-400', strokeColor: '#8b5cf6', description: '시간적 순서 관계' },
  'foundation-extension': { label: '확장', icon: '↑', color: 'text-green-400', strokeColor: '#8b5cf6', description: 'A가 B의 기반이 됨' },
  'contains': { label: '포함', icon: '⊃', color: 'text-purple-400', strokeColor: '#8b5cf6', description: 'A가 B를 포함함' },
  'contrast': { label: '대조', icon: '↔', color: 'text-yellow-400', strokeColor: '#8b5cf6', description: 'A와 B의 차이점' }
};

// 크기 관련 상수 및 유틸리티 함수들
const DEFAULT_NODE_SIZE = { width: 40, height: 40 };

const getNodeSize = (node: DiagramNode) => {
  return node.size || DEFAULT_NODE_SIZE;
};

const getNodeRadius = (node: DiagramNode) => {
  const size = getNodeSize(node);
  return Math.min(size.width, size.height) / 2;
};

const calculateOptimalConnectionPoints = (
  sourcePos: { x: number; y: number },
  targetPos: { x: number; y: number },
  sourceRadius: number,
  targetRadius: number
) => {
  const dx = targetPos.x - sourcePos.x;
  const dy = targetPos.y - sourcePos.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance === 0) return null;
  
  const unitX = dx / distance;
  const unitY = dy / distance;
  
  const startX = sourcePos.x + unitX * sourceRadius;
  const startY = sourcePos.y + unitY * sourceRadius;
  const endX = targetPos.x - unitX * targetRadius;
  const endY = targetPos.y - unitY * targetRadius;
  
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

// 연결된 노드 ID들을 계산하는 유틸리티 함수
const getConnectedNodeIds = (nodeId: string, connections: DiagramConnection[]): Set<string> => {
  const connectedIds = new Set<string>();
  
  connections.forEach(connection => {
    if (connection.sourceNoteId === nodeId) {
      connectedIds.add(connection.targetNoteId);
    }
    if (connection.targetNoteId === nodeId) {
      connectedIds.add(connection.sourceNoteId);
    }
  });
  
  return connectedIds;
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
  
  // 호버 상태 관리
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const handleNodeClick = (nodeId: string) => {
    onNodeSelect(nodeId);
  };

  const handleNodeHover = (nodeId: string | null) => {
    setHoveredNodeId(nodeId);
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

    // 호버된 노드와 연결된 노드 ID들 계산
    const connectedNodeIds = hoveredNodeId ? getConnectedNodeIds(hoveredNodeId, canvasConnections) : new Set<string>();

    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} style={{ background: '#111827' }}>
        <defs>
            {Object.entries(RELATIONSHIP_CONFIGS).map(([key, config]) => (
                 <marker key={key} id={`arrow-${key}`} markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                  <polygon points="0 0, 6 2, 0 4" fill={config.strokeColor}/>
                </marker>
            ))}
            
            {/* 전류 애니메이션을 위한 정의 */}
            <style>
              {`
                @keyframes currentFlow {
                  0% { stroke-dashoffset: 0; }
                  100% { stroke-dashoffset: -20; }
                }
                
                .current-flow {
                  animation: currentFlow 1.5s linear infinite;
                }
                
                .current-glow {
                  filter: drop-shadow(0 0 3px currentColor);
                }
              `}
            </style>
        </defs>

        {canvasConnections.map(connection => {
          const sourceNode = canvasNodes.find(n => n.noteId === connection.sourceNoteId);
          const targetNode = canvasNodes.find(n => n.noteId === connection.targetNoteId);
          
          if (!sourceNode || !targetNode) return null;
          
          const sourcePos = normalizePosition(sourceNode.position);
          const targetPos = normalizePosition(targetNode.position);
          const config = RELATIONSHIP_CONFIGS[connection.relationshipType];
          
          // 동적 크기를 반영한 연결점 계산
          const sourceRadius = getNodeRadius(sourceNode);
          const targetRadius = getNodeRadius(targetNode);
          const connectionPoints = calculateOptimalConnectionPoints(sourcePos, targetPos, sourceRadius, targetRadius);
          if (!connectionPoints) return null;
          
          const { startX, startY, endX, endY } = connectionPoints;
          const midX = (startX + endX) / 2;
          const midY = (startY + endY) / 2;

          // 연결선이 호버된 노드와 관련된지 확인
          const isConnectedToHovered = hoveredNodeId && 
            (connection.sourceNoteId === hoveredNodeId || connection.targetNoteId === hoveredNodeId);

          // 연결선 스타일 결정
          let strokeWidth: string;
          let strokeOpacity: string = "1";
          let strokeDasharray: string = "none";
          let className: string = "";
          
          if (isConnectedToHovered) {
            // 호버된 노드와 연결된 선은 더 굵게 + 전류 애니메이션
            strokeWidth = isMinimap ? "1.5" : "2.5";
            strokeOpacity = "1";
            strokeDasharray = "5,5";
            className = "current-flow current-glow";
          } else if (hoveredNodeId) {
            // 호버 상태에서 연결되지 않은 선은 투명하게
            strokeWidth = isMinimap ? "0.8" : "1.5";
            strokeOpacity = "0.2";
          } else {
            // 기본 상태에서 연결선 두께 조정
            strokeWidth = isMinimap ? "0.8" : "1.5";
            strokeOpacity = "1";
          }

          // contains 관계는 여전히 조금 더 굵게
          if (connection.relationshipType === 'contains') {
            if (isConnectedToHovered) {
              strokeWidth = isMinimap ? "2" : "3";
            } else if (hoveredNodeId) {
              strokeWidth = isMinimap ? "1" : "2";
            } else {
              strokeWidth = isMinimap ? "1.2" : "2.5";
            }
          }

          let lineElement;
          switch (connection.relationshipType) {
              case 'before-after':
                  lineElement = (
                    <line 
                      x1={startX} y1={startY} x2={endX} y2={endY} 
                      stroke={config.strokeColor} 
                      strokeWidth={strokeWidth} 
                      strokeDasharray={isConnectedToHovered ? "5,5" : "3,3"} 
                      strokeOpacity={strokeOpacity} 
                      markerEnd={`url(#arrow-${connection.relationshipType})`}
                      className={className}
                    />
                  );
                  break;
              case 'contrast':
                  lineElement = (
                    <path 
                      d={createZigzagPath(startX, startY, endX, endY)} 
                      stroke={config.strokeColor} 
                      strokeWidth={strokeWidth} 
                      fill="none" 
                      strokeDasharray={isConnectedToHovered ? "5,5" : "3,3"}
                      strokeOpacity={strokeOpacity} 
                      markerEnd={`url(#arrow-${connection.relationshipType})`}
                      className={className}
                    />
                  );
                  break;
              case 'contains':
                  lineElement = (
                    <line 
                      x1={startX} y1={startY} x2={endX} y2={endY} 
                      stroke={config.strokeColor} 
                      strokeWidth={strokeWidth} 
                      strokeDasharray={isConnectedToHovered ? "8,4" : "6,3"}
                      strokeOpacity={strokeOpacity} 
                      markerEnd={`url(#arrow-${connection.relationshipType})`}
                      className={className}
                    />
                  );
                  break;
              default:
                  lineElement = (
                    <line 
                      x1={startX} y1={startY} x2={endX} y2={endY} 
                      stroke={config.strokeColor} 
                      strokeWidth={strokeWidth} 
                      strokeDasharray={isConnectedToHovered ? "5,5" : "3,3"}
                      strokeOpacity={strokeOpacity} 
                      markerEnd={`url(#arrow-${connection.relationshipType})`}
                      className={className}
                    />
                  );
          }

          return (
            <g key={connection.id}>
              {lineElement}
              {!isMinimap && (
                <>
                    <circle cx={midX} cy={midY} r="10" fill={config.strokeColor} stroke="#1f2937" strokeWidth="1" opacity={strokeOpacity}/>
                    <text x={midX} y={midY + 4} textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" opacity={strokeOpacity}>{config.icon}</text>
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
          
          // 동적 크기 지원: 크기 정보가 있으면 사용, 없으면 기본값
          const nodeSize = getNodeSize(node);
          const radius = Math.min(nodeSize.width, nodeSize.height) / 2;
          
          // 노드 스타일 결정
          let nodeRadius = radius;
          let nodeOpacity = "1";
          let nodeStrokeWidth = "2";
          let nodeStrokeColor = "#4b5563";
          
          if (node.noteId === hoveredNodeId) {
            // 호버된 노드: 크기 증가, 글로우 효과
            nodeRadius = radius * 1.2;
            nodeOpacity = "1";
            nodeStrokeWidth = "3";
            nodeStrokeColor = "#60a5fa";
          } else if (connectedNodeIds.has(node.noteId)) {
            // 연결된 노드: 약간 크기 증가, 하이라이트
            nodeRadius = radius * 1.1;
            nodeOpacity = "0.8";
            nodeStrokeWidth = "2";
            nodeStrokeColor = "#fbbf24";
          } else if (hoveredNodeId) {
            // 호버 상태에서 연결되지 않은 노드: 투명하게
            nodeOpacity = "0.3";
          }
          
          return (
            <g 
              key={node.noteId} 
              transform={`translate(${pos.x}, ${pos.y})`} 
              onClick={() => handleNodeClick(node.noteId)}
              onMouseEnter={() => handleNodeHover(node.noteId)}
              onMouseLeave={() => handleNodeHover(null)}
              style={{ cursor: 'pointer' }}
            >
              <circle 
                r={nodeRadius} 
                fill={fillColor} 
                stroke={nodeStrokeColor} 
                strokeWidth={nodeStrokeWidth}
                opacity={nodeOpacity}
                style={{
                  transition: 'all 0.2s ease-in-out',
                  filter: node.noteId === hoveredNodeId ? 'drop-shadow(0 0 8px rgba(96, 165, 250, 0.6))' : 'none'
                }}
              />
              {!isMinimap && (
                <text 
                  textAnchor="middle" 
                  dy=".3em" 
                  fill="white" 
                  fontSize={Math.max(12, Math.min(20, nodeRadius * 0.8))} 
                  fontWeight="bold"
                  opacity={nodeOpacity}
                  style={{ transition: 'opacity 0.2s ease-in-out' }}
                >
                  {node.order}
                </text>
              )}
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
