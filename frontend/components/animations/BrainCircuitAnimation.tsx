import React, { useRef, useState, useEffect } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';

export interface BrainCircuitAnimationProps {
  className?: string;
}

const BrainCircuitAnimation: React.FC<BrainCircuitAnimationProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: false, margin: "-10% 0px" });
  const controls = useAnimation();
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [activeNodeGroups, setActiveNodeGroups] = useState<number[]>([]);
  
  // 화면 크기 변경 감지
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    
    // 초기 설정
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // 뷰포트에 들어올 때 애니메이션 시작
  useEffect(() => {
    if (isInView) {
      controls.start("visible");
      
      // 활성화되는 노드 그룹 시퀀스
      const activationSequence = [0, 1, 2, 3, 1, 0, 2, 3, 0, 1];
      let currentIndex = 0;
      
      const interval = setInterval(() => {
        const newActiveGroup = activationSequence[currentIndex];
        setActiveNodeGroups(prev => {
          // 최대 3개의 그룹만 활성화 유지
          const updated = [...prev, newActiveGroup];
          if (updated.length > 3) {
            updated.shift();
          }
          return updated;
        });
        
        currentIndex = (currentIndex + 1) % activationSequence.length;
      }, 1200);
      
      return () => clearInterval(interval);
    } else {
      controls.start("hidden");
      setActiveNodeGroups([]);
    }
  }, [isInView, controls]);
  
  // 반응형 디자인을 위한 값 조정
  const isMobile = windowSize.width < 640;
  const isTablet = windowSize.width >= 640 && windowSize.width < 1024;
  
  // 뇌 영역 노드 정의
  const brainRegions = [
    // 그룹 0: 전두엽 (Frontal Lobe) - 실행 기능, 의사 결정
    { id: 'f1', name: '전두엽', x: 30, y: 25, color: '#4c1d95', size: isMobile ? 2.8 : 3.5, group: 0, connections: ['f2', 'p1', 't1'] },
    { id: 'f2', name: '전전두엽', x: 22, y: 32, color: '#5b21b6', size: isMobile ? 2.5 : 3.2, group: 0, connections: ['f1', 't2', 'o1'] },
    { id: 'f3', name: '브로카영역', x: 37, y: 33, color: '#6d28d9', size: isMobile ? 2.3 : 3.0, group: 0, connections: ['f1', 't1'] },
    
    // 그룹 1: 두정엽 (Parietal Lobe) - 공간 인식, 주의력
    { id: 'p1', name: '두정엽', x: 45, y: 22, color: '#1e40af', size: isMobile ? 2.8 : 3.5, group: 1, connections: ['f1', 't2', 'o2'] },
    { id: 'p2', name: '체감각피질', x: 55, y: 27, color: '#2563eb', size: isMobile ? 2.5 : 3.2, group: 1, connections: ['p1', 'o1'] },
    
    // 그룹 2: 측두엽 (Temporal Lobe) - 기억, 언어 이해
    { id: 't1', name: '측두엽', x: 37, y: 45, color: '#0e7490', size: isMobile ? 2.8 : 3.5, group: 2, connections: ['f1', 'f3', 'h1'] },
    { id: 't2', name: '베르니케영역', x: 48, y: 40, color: '#06b6d4', size: isMobile ? 2.5 : 3.2, group: 2, connections: ['f2', 'p1', 'h1'] },
    
    // 그룹 3: 후두엽 (Occipital Lobe) - 시각 처리
    { id: 'o1', name: '후두엽', x: 62, y: 40, color: '#047857', size: isMobile ? 2.8 : 3.5, group: 3, connections: ['f2', 'p2', 'o2'] },
    { id: 'o2', name: '일차시각피질', x: 70, y: 34, color: '#10b981', size: isMobile ? 2.5 : 3.2, group: 3, connections: ['p1', 'o1'] },
    
    // 기타 영역
    { id: 'h1', name: '해마', x: 50, y: 50, color: '#b91c1c', size: isMobile ? 2.5 : 3.2, group: 2, connections: ['t1', 't2'] },
    { id: 'c1', name: '소뇌', x: 75, y: 55, color: '#c2410c', size: isMobile ? 2.8 : 3.5, group: 3, connections: ['o1'] },
  ];
  
  // 애니메이션 변형 정의
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.3
      }
    }
  };
  
  const nodeVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 20 }
    }
  };
  
  const connectionVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { 
      pathLength: 1, 
      opacity: 0.8,
      transition: { 
        pathLength: { type: "spring", duration: 1.5, bounce: 0 },
        opacity: { duration: 0.5 }
      }
    }
  };
  
  const pulseVariants = {
    initial: { scale: 0.8, opacity: 1 },
    pulse: { 
      scale: 1.5, 
      opacity: 0,
      transition: { 
        duration: 1.2, 
        repeat: Infinity,
        repeatDelay: 0.5
      }
    }
  };
  
  // 연결선 효과 정의
  const getConnectionGradientId = (sourceId: string, targetId: string) => `gradient-${sourceId}-${targetId}`;
  
  // 노드 그룹 활성화 상태 확인
  const isNodeActive = (group: number) => activeNodeGroups.includes(group);
  
  // 연결 활성화 상태 확인 (두 노드가 연결되어있고, 둘 중 하나라도 활성화 상태)
  const isConnectionActive = (source: string, target: string) => {
    const sourceNode = brainRegions.find(node => node.id === source);
    const targetNode = brainRegions.find(node => node.id === target);
    
    if (!sourceNode || !targetNode) return false;
    
    return isNodeActive(sourceNode.group) || isNodeActive(targetNode.group);
  };
  
  return (
    <div 
      ref={containerRef}
      className={`w-full h-auto aspect-square max-w-md mx-auto p-2 ${className}`}
    >
      <motion.div
        initial="hidden"
        animate={controls}
        variants={containerVariants}
        className="w-full h-full relative rounded-xl overflow-hidden"
      >
        <svg 
          viewBox="0 0 100 100" 
          className="w-full h-full" 
          style={{ background: 'radial-gradient(circle at center, #f0f9ff 10%, #e0f2fe 70%, #bae6fd 100%)' }}
        >
          <defs>
            {/* 뇌 실루엣 클리핑 마스크 */}
            <clipPath id="brainClip">
              <ellipse cx="50" cy="40" rx="40" ry="35" />
            </clipPath>

            {/* 발광 효과 필터 */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            
            {/* 연결선 그라데이션 정의 */}
            {brainRegions.map(source => 
              source.connections.map(targetId => {
                const target = brainRegions.find(node => node.id === targetId);
                if (!target) return null;
                
                return (
                  <linearGradient 
                    key={getConnectionGradientId(source.id, target.id)} 
                    id={getConnectionGradientId(source.id, target.id)} 
                    x1={source.x + "%"} 
                    y1={source.y + "%"} 
                    x2={target.x + "%"} 
                    y2={target.y + "%"}
                  >
                    <stop offset="0%" stopColor={source.color} />
                    <stop offset="100%" stopColor={target.color} />
                  </linearGradient>
                );
              })
            )}
          </defs>
          
          {/* 배경 장식 효과 */}
          <g clipPath="url(#brainClip)">
            {/* 뇌 파동 효과 - 동심원 */}
            {[...Array(5)].map((_, i) => (
              <motion.circle
                key={`wave-${i}`}
                cx="50"
                cy="40"
                r={10 + i * 8}
                fill="none"
                stroke="#e0e7ff"
                strokeWidth="0.3"
                strokeDasharray="1,2"
                initial={{ opacity: 0.3 }}
                animate={{ 
                  opacity: [0.1, 0.3, 0.1],
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  duration: 3 + i,
                  repeat: Infinity,
                  delay: i * 0.5
                }}
              />
            ))}
          </g>
          
          {/* 연결선 */}
          {brainRegions.map(source => 
            source.connections.map(targetId => {
              const target = brainRegions.find(node => node.id === targetId);
              if (!target) return null;
              
              // 베지어 곡선 제어점 계산
              const midX = (source.x + target.x) / 2;
              const midY = (source.y + target.y) / 2;
              const distance = Math.sqrt(Math.pow(target.x - source.x, 2) + Math.pow(target.y - source.y, 2));
              const offset = distance * 0.2; // 곡선 휘어짐 정도
              
              // 제어점 방향 조정
              const angle = Math.atan2(target.y - source.y, target.x - source.x) + Math.PI/2;
              const controlX = midX + offset * Math.cos(angle);
              const controlY = midY + offset * Math.sin(angle);
              
              const isActive = isConnectionActive(source.id, target.id);
              
              return (
                <motion.path
                  key={`connection-${source.id}-${target.id}`}
                  d={`M ${source.x} ${source.y} Q ${controlX} ${controlY} ${target.x} ${target.y}`}
                  stroke={`url(#${getConnectionGradientId(source.id, target.id)})`}
                  strokeWidth={isActive ? (isMobile ? "0.6" : "0.8") : (isMobile ? "0.3" : "0.4")}
                  strokeLinecap="round"
                  fill="none"
                  variants={connectionVariants}
                  animate={{ 
                    strokeWidth: isActive ? (isMobile ? "0.6" : "0.8") : (isMobile ? "0.3" : "0.4"),
                    filter: isActive ? "url(#glow)" : "none",
                    strokeDasharray: isActive ? "0" : "0.5,1.5"
                  }}
                />
              );
            })
          )}
          
          {/* 노드 */}
          {brainRegions.map(node => {
            const isActive = isNodeActive(node.group);
            
            return (
              <motion.g key={`node-${node.id}`}>
                {/* 펄스 효과 - 활성 노드에만 적용 */}
                {isActive && (
                  <motion.circle
                    cx={node.x}
                    cy={node.y}
                    r={node.size}
                    fill={node.color}
                    opacity="0.5"
                    variants={pulseVariants}
                    initial="initial"
                    animate="pulse"
                  />
                )}
                
                {/* 노드 본체 */}
                <motion.circle
                  cx={node.x}
                  cy={node.y}
                  r={node.size}
                  fill={isActive ? node.color : `${node.color}80`}
                  stroke={isActive ? "white" : "transparent"}
                  strokeWidth="0.5"
                  variants={nodeVariants}
                  filter={isActive ? "url(#glow)" : "none"}
                  whileHover={{ scale: 1.2 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
                
                {/* 노드 텍스트 라벨 - 특정 사이즈 이상에서만 표시 */}
                {(!isMobile || node.size > 3) && (
                  <motion.text
                    x={node.x}
                    y={node.y + node.size + 2}
                    textAnchor="middle"
                    fontSize={isMobile ? "2" : "2.2"}
                    fontWeight={isActive ? "bold" : "normal"}
                    fill={isActive ? node.color : "#64748b"}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isActive ? 1 : 0.7 }}
                  >
                    {node.name}
                  </motion.text>
                )}
              </motion.g>
            );
          })}
          
          {/* 설명 텍스트 */}
          <motion.text
            x="50"
            y="85"
            textAnchor="middle"
            fontSize={isMobile ? "3" : "3.5"}
            fontWeight="bold"
            fill="#1e293b"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            뇌의 인지 영역 활성화 패턴
          </motion.text>
        </svg>
      </motion.div>
    </div>
  );
};

export default BrainCircuitAnimation; 