import React, { useRef, useState, useEffect } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { FiBook, FiClock, FiActivity, FiCheckCircle } from 'react-icons/fi';

export interface ImmersionTimerAnimationProps {
  className?: string;
}

// 숫자 정밀도를 고정하는 헬퍼 함수
const fixPrecision = (num: number): string => {
  return num.toFixed(6);
};

const ImmersionTimerAnimation: React.FC<ImmersionTimerAnimationProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: false, margin: "-10% 0px" });
  const controls = useAnimation();
  const [activeSegment, setActiveSegment] = useState<number | null>(null);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [isClient, setIsClient] = useState(false);
  
  // 클라이언트 사이드에서만 계산하도록 설정
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // 화면 크기에 맞게 조정
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    
    if (typeof window !== 'undefined') {
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);
  
  // 뷰포트 내에 있으면 애니메이션 시작
  useEffect(() => {
    if (isInView && isClient) {
      controls.start("visible");
      
      let currentSegment = 0;
      const interval = setInterval(() => {
        setActiveSegment(currentSegment);
        currentSegment = (currentSegment + 1) % segments.length;
      }, 2500);
      
      return () => clearInterval(interval);
    } else {
      controls.start("hidden");
      setActiveSegment(null);
    }
  }, [isInView, controls, isClient]);
  
  // 반응형 디자인을 위한 값 조정
  const isMobile = windowSize.width < 640;
  const isTablet = windowSize.width >= 640 && windowSize.width < 1024;
  
  // 전체 너비
  const containerSize = isMobile ? 85 : isTablet ? 90 : 95;
  
  // 중앙 원 크기
  const centerSize = isMobile ? 25 : 30;
  
  // 16분 타이머 세그먼트 정의
  const segments = [
    {
      name: "준비",
      color: "#f59e42", // 주황
      icon: null,
      duration: 2, // 2분
      description: "집중 준비 단계"
    },
    {
      name: "학습",
      color: "#3b82f6", // 파랑
      icon: null,
      duration: 11, // 11분
      description: "몰입 학습 단계"
    },
    {
      name: "반추",
      color: "#10b981", // 초록
      icon: null,
      duration: 3, // 3분
      description: "내용 정리/반추 단계"
    }
  ];
  
  // 전체 지속 시간
  const totalDuration = segments.reduce((total, segment) => total + segment.duration, 0);
  
  // 애니메이션 변형 정의
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        delayChildren: 0.2,
        staggerChildren: 0.1
      }
    }
  };
  
  const segmentVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5, type: "spring", stiffness: 200, damping: 15 }
    }
  };
  
  const iconVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };
  
  const textVariants = {
    hidden: { opacity: 0, y: 5 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3, delay: 0.2 }
    }
  };
  
  const timelineVariants = {
    hidden: { pathLength: 0 },
    visible: { 
      pathLength: 1,
      transition: { duration: 2, ease: "easeInOut" }
    }
  };
  
  // 중심점 계산
  const centerX = 50;
  const centerY = 50;
  
  // 세그먼트 경로 계산 함수
  const calculateSegmentPath = (index: number, total: number, innerRadius: number, outerRadius: number) => {
    // 각 세그먼트의 시작 및 끝 각도 계산
    const segmentDuration = segments[index].duration;
    const segmentPercentage = segmentDuration / totalDuration;
    const segmentAngle = segmentPercentage * 360;
    
    let startAngle = 0;
    for (let i = 0; i < index; i++) {
      startAngle += (segments[i].duration / totalDuration) * 360;
    }
    
    // 시작 각도에서 시계방향으로 끝 각도까지
    const endAngle = startAngle + segmentAngle;
    
    // 각도를 라디안으로 변환
    const startRadians = (startAngle - 90) * (Math.PI / 180);
    const endRadians = (endAngle - 90) * (Math.PI / 180);
    
    // 내부 및 외부 반지름 좌표 계산
    const innerStartX = Number(fixPrecision(centerX + innerRadius * Math.cos(startRadians)));
    const innerStartY = Number(fixPrecision(centerY + innerRadius * Math.sin(startRadians)));
    const innerEndX = Number(fixPrecision(centerX + innerRadius * Math.cos(endRadians)));
    const innerEndY = Number(fixPrecision(centerY + innerRadius * Math.sin(endRadians)));
    
    const outerStartX = Number(fixPrecision(centerX + outerRadius * Math.cos(startRadians)));
    const outerStartY = Number(fixPrecision(centerY + outerRadius * Math.sin(startRadians)));
    const outerEndX = Number(fixPrecision(centerX + outerRadius * Math.cos(endRadians)));
    const outerEndY = Number(fixPrecision(centerY + outerRadius * Math.sin(endRadians)));
    
    // 세그먼트가 180도 이상인지 확인
    const largeArcFlag = segmentAngle > 180 ? 1 : 0;
    
    // SVG 경로 정의
    return `
      M ${innerStartX} ${innerStartY}
      L ${outerStartX} ${outerStartY}
      A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEndX} ${outerEndY}
      L ${innerEndX} ${innerEndY}
      A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStartX} ${innerStartY}
      Z
    `;
  };
  
  // 세그먼트 중앙 위치 계산
  const calculateSegmentCenter = (index: number, radius: number) => {
    let startAngle = 0;
    for (let i = 0; i < index; i++) {
      startAngle += (segments[i].duration / totalDuration) * 360;
    }
    
    const segmentDuration = segments[index].duration;
    const segmentAngle = (segmentDuration / totalDuration) * 360;
    const midAngle = startAngle + (segmentAngle / 2);
    const midRadians = (midAngle - 90) * (Math.PI / 180);
    
    return {
      x: Number(fixPrecision(centerX + radius * Math.cos(midRadians))),
      y: Number(fixPrecision(centerY + radius * Math.sin(midRadians)))
    };
  };
  
  // 진행 바 계산
  const calculateProgressArc = (percent: number, radius: number) => {
    const angle = percent * 360;
    const endRadians = ((angle - 90) * Math.PI) / 180;
    
    const endX = Number(fixPrecision(centerX + radius * Math.cos(endRadians)));
    const endY = Number(fixPrecision(centerY + radius * Math.sin(endRadians)));
    
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    return `
      M ${fixPrecision(centerX)} ${fixPrecision(centerY - radius)}
      A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}
    `;
  };
  
  // 서클 텍스트용 회전 각도 계산
  const getTextRotation = (index: number) => {
    let startAngle = 0;
    for (let i = 0; i < index; i++) {
      startAngle += (segments[i].duration / totalDuration) * 360;
    }
    
    const segmentDuration = segments[index].duration;
    const segmentAngle = (segmentDuration / totalDuration) * 360;
    const midAngle = startAngle + (segmentAngle / 2);
    
    // 텍스트가 항상 올바른 방향으로 표시되도록 조정
    if (midAngle > 90 && midAngle < 270) {
      return Number(fixPrecision(midAngle + 180));
    }
    return Number(fixPrecision(midAngle));
  };
  
  // 클라이언트 사이드만 렌더링
  if (!isClient) {
    return (
      <div
        ref={containerRef}
        className={`w-full h-auto aspect-square max-w-md mx-auto p-2 ${className}`}
      >
        <div className="w-full h-full bg-gray-100 animate-pulse rounded-full" />
      </div>
    );
  }
  
  return (
    <div
      ref={containerRef}
      className={`w-full h-auto aspect-square max-w-md mx-auto p-2 ${className}`}
      suppressHydrationWarning
    >
      <motion.div
        initial="hidden"
        animate={controls}
        variants={containerVariants}
        className="w-full h-full relative"
        suppressHydrationWarning
      >
        <svg 
          viewBox="0 0 100 100" 
          className="w-full h-full"
          style={{ background: 'radial-gradient(circle at center, #f0f9ff 10%, #e0f2fe 70%, #bae6fd 100%)' }}
          suppressHydrationWarning
        >
          <defs>
            {/* 세그먼트 그라데이션 */}
            {segments.map((segment, i) => (
              <linearGradient
                key={`gradient-${i}`}
                id={`segment-gradient-${i}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor={segment.color} stopOpacity="0.9" />
                <stop offset="100%" stopColor={segment.color} stopOpacity="0.7" />
              </linearGradient>
            ))}
            
            {/* 중앙 원 그라데이션 */}
            <radialGradient
              id="center-gradient"
              cx="50%"
              cy="50%"
              r="50%"
              fx="50%"
              fy="50%"
            >
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f0f9ff" />
            </radialGradient>
            
            {/* 발광 효과 필터 */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            
            {/* 세그먼트 용 드롭 쉐도우 */}
            <filter id="segment-shadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.3" />
            </filter>
          </defs>
          
          {/* 배경 시간 눈금 */}
          {[...Array(12)].map((_, i) => {
            const angle = (i * 30 - 90) * (Math.PI / 180);
            const outerX = centerX + (containerSize / 2 - 2) * Math.cos(angle);
            const outerY = centerY + (containerSize / 2 - 2) * Math.sin(angle);
            const innerX = centerX + (containerSize / 2 - 5) * Math.cos(angle);
            const innerY = centerY + (containerSize / 2 - 5) * Math.sin(angle);
            
            return (
              <motion.line
                key={`tick-${i}`}
                x1={innerX}
                y1={innerY}
                x2={outerX}
                y2={outerY}
                stroke="#cbd5e1"
                strokeWidth="0.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ delay: 0.5 + i * 0.05 }}
              />
            );
          })}
          
          {/* 세그먼트 */}
          {segments.map((segment, i) => {
            const isActive = activeSegment === i;
            const path = calculateSegmentPath(
              i, 
              segments.length, 
              centerSize / 2, 
              containerSize / 2 - 10
            );
            
            const segmentCenter = calculateSegmentCenter(i, containerSize / 2 - 22);
            
            return (
              <motion.g key={`segment-${i}`} variants={segmentVariants}>
                {/* 세그먼트 영역 */}
                <motion.path
                  d={path}
                  fill={`url(#segment-gradient-${i})`}
                  stroke="white"
                  strokeWidth="0.5"
                  filter="url(#segment-shadow)"
                  animate={{ 
                    scale: isActive ? 1.03 : 1,
                    filter: isActive ? "url(#glow)" : "url(#segment-shadow)"
                  }}
                  transition={{ duration: 0.3 }}
                />
                
                {/* 세그먼트 아이콘 */}
                <motion.g
                  variants={iconVariants}
                  animate={{ 
                    scale: isActive ? 1.2 : 1,
                    opacity: isActive ? 1 : 0.8
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <circle
                    cx={segmentCenter.x}
                    cy={segmentCenter.y}
                    r={isMobile ? 4 : 5}
                    fill="white"
                    stroke={segment.color}
                    strokeWidth="0.5"
                  />
                  <g
                    transform={`translate(${segmentCenter.x - (isMobile ? 2 : 2.5)}, ${segmentCenter.y - (isMobile ? 2 : 2.5)}) scale(${isMobile ? 0.08 : 0.1})`}
                    fill={segment.color}
                  >
                    {segment.icon}
                  </g>
                </motion.g>
                
                {/* 타이머 세그먼트 이름/분 라벨: 원 안에 두 줄로 중앙 정렬 */}
                {!isMobile && (
                  <motion.g variants={textVariants}>
                    <motion.text
                      x={segmentCenter.x}
                      y={segmentCenter.y}
                      textAnchor="middle"
                      fontSize="3.2"
                      fontWeight="bold"
                      fill="#222"
                      stroke="#fff"
                      strokeWidth="0.25"
                      paintOrder="stroke"
                      style={{ filter: 'drop-shadow(0 1px 2px #fff)' }}
                      animate={{ opacity: isActive ? 1 : 0.92 }}
                    >
                      {segment.name}
                      <tspan x={segmentCenter.x} dy={"2.8"} fontSize="2.2" fontWeight="bold">{segment.duration}분</tspan>
                    </motion.text>
                  </motion.g>
                )}
              </motion.g>
            );
          })}
          
          {/* 진행 표시 바 - 활성화된 세그먼트에만 표시 */}
          {activeSegment !== null && (
            <motion.path
              d={calculateProgressArc(
                segments.slice(0, activeSegment + 1).reduce((acc, seg, i) => {
                  // 마지막 세그먼트는 진행률 애니메이션
                  if (i === activeSegment) {
                    return acc;
                  }
                  return acc + (seg.duration / totalDuration);
                }, 0),
                containerSize / 2 - 5
              )}
              stroke="#0284c7"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ 
                pathLength: 1,
                opacity: [0.7, 1, 0.7]
              }}
              transition={{ 
                pathLength: { duration: 2, ease: "easeInOut" },
                opacity: { duration: 2, repeat: Infinity }
              }}
            />
          )}
          
          {/* 중앙 원 영역 */}
          <motion.circle
            cx={centerX}
            cy={centerY}
            r={centerSize / 2}
            fill="url(#center-gradient)"
            stroke="#e2e8f0"
            strokeWidth="0.8"
            variants={{
              hidden: { scale: 0, opacity: 0 },
              visible: { 
                scale: 1, 
                opacity: 1,
                transition: { duration: 0.5, delay: 0.3, type: "spring" }
              }
            }}
          />
          
          {/* 중앙 텍스트 영역 */}
          <motion.g
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { delay: 0.5, duration: 0.5 } }
            }}
          >
            <text
              x={centerX}
              y={centerY + 2}
              textAnchor="middle"
              fontSize={isMobile ? "5" : "6"}
              fontWeight="bold"
              fill="#0f172a"
            >
              TS모드
            </text>
          </motion.g>
        </svg>
      </motion.div>
      {/* 하단 설명 텍스트 */}
      {activeSegment !== null && segments[activeSegment] && (
        <div
          style={{
            marginTop: isMobile ? 12 : 18,
            padding: isMobile ? '7px 0' : '10px 0',
            background: 'rgba(255,255,255,0.92)',
            borderRadius: 8,
            textAlign: 'center',
            fontWeight: 600,
            fontSize: isMobile ? 15 : 18,
            color: '#1e293b',
            boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)'
          }}
        >
          {segments[activeSegment].description}
        </div>
      )}
    </div>
  );
};

export default ImmersionTimerAnimation; 