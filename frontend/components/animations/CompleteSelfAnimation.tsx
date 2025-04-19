import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// 만다라트 3x3 격자: 중앙(자기완성) + 8대 역량
const mandalart = [
  { label: '집중력', x: 0, y: 0 },
  { label: '기억력', x: 1, y: 0 },
  { label: '조절력', x: 2, y: 0 },
  { label: '추론력', x: 0, y: 1 },
  { label: '목표', x: 1, y: 1, center: true },
  { label: '비판적 사고', x: 2, y: 1 },
  { label: '자기주도성', x: 0, y: 2 },
  { label: '메타인지', x: 1, y: 2 },
  { label: '성공습관', x: 2, y: 2 },
];

const activeGradient = 'url(#activeGradient)';
const centerGradient = 'url(#centerGradient)';
const goldGradient = 'url(#goldGradient)';
const glowColor = '#facc15';
const gridSize = 3;
const cellSize = 60;
const svgSize = cellSize * gridSize;

// 긴 텍스트 자동 줄바꿈(2줄) 함수
function splitLabel(label: string) {
  if (label.length > 4) {
    // 5글자 이상이면 2:3 또는 3:3으로 분할
    const mid = Math.ceil(label.length / 2);
    return [label.slice(0, mid), label.slice(mid)];
  }
  return [label];
}

const CompleteSelfAnimation: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [activeIdx, setActiveIdx] = useState(-1);
  const isComplete = activeIdx >= mandalart.length;

  useEffect(() => {
    if (activeIdx < mandalart.length) {
      const timer = setTimeout(() => setActiveIdx(activeIdx + 1), 900);
      return () => clearTimeout(timer);
    }
  }, [activeIdx]);

  return (
    <div className={`w-full flex flex-col items-center ${className}`} style={{ minHeight: 220 }}>
      <svg viewBox={`0 0 ${svgSize} ${svgSize}`} width={svgSize * 1.5} height={svgSize * 1.5} style={{ maxWidth: '100%' }}>
        <defs>
          <linearGradient id="activeGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <linearGradient id="centerGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
          <linearGradient id="goldGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#fde68a" />
          </linearGradient>
          <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* 3D 바둑돌용 그라데이션 */}
          <radialGradient id="blackStoneGrad" cx="35%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#444" />
            <stop offset="60%" stopColor="#18181b" />
            <stop offset="100%" stopColor="#000" />
          </radialGradient>
          <radialGradient id="whiteStoneGrad" cx="35%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#fff" />
            <stop offset="60%" stopColor="#e5e7eb" />
            <stop offset="100%" stopColor="#bbb" />
          </radialGradient>
          <filter id="stoneShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.18" />
          </filter>
        </defs>
        {/* 3x3 만다라트 격자 */}
        {mandalart.map((cell, idx) => {
          const x = cell.x * cellSize + cellSize / 2;
          const y = cell.y * cellSize + cellSize / 2;
          const isCenter = !!cell.center;
          const isActive = activeIdx >= idx;
          const lines = splitLabel(cell.label);
          // 입체감 있는 바둑돌: 그라데이션 + 하이라이트
          const stoneRadius = isCenter ? cellSize * 0.48 : cellSize * 0.42;
          const gradId = isCenter ? 'whiteStoneGrad' : 'blackStoneGrad';
          return (
            <g key={cell.label}>
              <motion.circle
                cx={x}
                cy={y}
                r={stoneRadius}
                fill={`url(#${gradId})`}
                stroke={isCenter ? '#bbb' : '#fff'}
                strokeWidth={isCenter ? 2 : 1.5}
                filter="url(#stoneShadow)"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: isActive ? 1 : 0, scale: isActive ? 1 : 0.7 }}
                transition={{ duration: 0.7, delay: idx * 0.1 }}
              />
              {/* 입체 하이라이트(활성화된 돌만) */}
              {isActive && (
                <ellipse
                  cx={x - stoneRadius * 0.32}
                  cy={y - stoneRadius * 0.32}
                  rx={stoneRadius * 0.32}
                  ry={stoneRadius * 0.18}
                  fill="white"
                  opacity={isCenter ? 0.22 : 0.18}
                />
              )}
              {/* 텍스트(자동 줄바꿈, 중앙정렬) */}
              {lines.map((line, i) => (
                <motion.text
                  key={i}
                  x={x}
                  y={y + ((i - (lines.length - 1) / 2) * ((isCenter ? 15 : 12) + 1))}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontWeight={isCenter ? 800 : 700}
                  fontSize={isCenter ? 15 : 12}
                  fill={isCenter ? '#222' : '#fff'}
                  stroke={isCenter ? '#fff' : 'none'}
                  strokeWidth={isCenter ? 0.5 : 0}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: isActive ? 1 : 0, scale: isActive ? 1 : 0.8 }}
                  transition={{ duration: 0.7, delay: idx * 0.1 + 0.2 + i * 0.05 }}
                  style={{ pointerEvents: 'none', userSelect: 'none', paintOrder: 'stroke', letterSpacing: isCenter ? 1 : 0 }}
                >
                  {line}
                </motion.text>
              ))}
            </g>
          );
        })}
        {/* 완전체 빛 효과 제거 */}
      </svg>
    </div>
  );
};

export default CompleteSelfAnimation; 