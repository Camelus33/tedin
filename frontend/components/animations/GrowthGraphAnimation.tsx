import React, { useRef, useState, useEffect } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';

export interface GrowthGraphAnimationProps {
  className?: string;
}

const GrowthGraphAnimation: React.FC<GrowthGraphAnimationProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: false, margin: "-10% 0px" });
  const controls = useAnimation();
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [activePointIndex, setActivePointIndex] = useState<number>(0);
  
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
    } else {
      controls.start("hidden");
    }
  }, [isInView, controls]);
  
  // 자동으로 데이터 포인트 활성화 (애니메이션 효과)
  useEffect(() => {
    if (!isInView) return;
    
    const interval = setInterval(() => {
      setActivePointIndex(prev => (prev + 1) % userGrowthData.length);
    }, 2000);
    
    return () => clearInterval(interval);
  }, [isInView]);
  
  // 그래프 데이터 포인트 - 더 역동적인 성장 곡선
  const userGrowthData = [
    { day: 0, value: 10, label: "1일차" },
    { day: 1, value: 15, label: "2일차" },
    { day: 2, value: 22, label: "3일차" },
    { day: 3, value: 28, label: "4일차" },
    { day: 4, value: 38, label: "5일차" },
    { day: 5, value: 45, label: "6일차" },
    { day: 6, value: 58, label: "7일차" },
  ];

  const averageData = [
    { day: 0, value: 10, label: "1일차" },
    { day: 1, value: 13, label: "2일차" },
    { day: 2, value: 17, label: "3일차" },
    { day: 3, value: 21, label: "4일차" },
    { day: 4, value: 25, label: "5일차" },
    { day: 5, value: 28, label: "6일차" },
    { day: 6, value: 32, label: "7일차" },
  ];

  // 성취 포인트 (특정 지점에서 인증서 아이콘 표시)
  const achievements = [
    { day: 2, value: userGrowthData[2].value, label: '집중력 +25%', icon: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { day: 4, value: userGrowthData[4].value, label: '암기력 +35%', icon: "M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" },
    { day: 6, value: userGrowthData[6].value, label: '통찰력 +45%', icon: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" },
  ];

  // 반응형 디자인을 위한 값 조정
  const isMobile = windowSize.width < 640;
  const isTablet = windowSize.width >= 640 && windowSize.width < 1024;
  
  // 그래프 영역 정의
  const padding = isMobile ? 12 : 15;
  const paddingTop = isMobile ? 20 : 25;
  const paddingBottom = 20;
  const graphWidth = 100 - (padding * 2);
  const graphHeight = 60;
  const maxValue = 70; // 값 범위 확장
  
  // 그래프 변형 정의
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6, 
        ease: "easeOut",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };
  
  const lineVariants = {
    hidden: { pathLength: 0 },
    visible: { 
      pathLength: 1,
      transition: { 
        duration: 1.5,
        ease: "easeInOut"
      }
    }
  };

  // 포인트 좌표 계산 함수
  const getXPosition = (day: number) => padding + (day / 6) * graphWidth;
  const getYPosition = (value: number) => 100 - paddingBottom - (value / maxValue) * graphHeight;

  // 그래프 라인 패스 생성 (곡선형)
  const createCurvedPath = (data: { day: number; value: number }[]) => {
    if (data.length < 2) return '';
    
    const points = data.map(point => ({
      x: getXPosition(point.day),
      y: getYPosition(point.value)
    }));
    
    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      
      // 제어점: 현재 포인트와 다음 포인트 사이의 중간점
      const controlX1 = current.x + (next.x - current.x) / 3;
      const controlY1 = current.y;
      const controlX2 = current.x + 2 * (next.x - current.x) / 3;
      const controlY2 = next.y;
      
      path += ` C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${next.x} ${next.y}`;
    }
    
    return path;
  };
  
  // 그래프 영역 패스 생성 (채우기 영역용)
  const createAreaPath = (data: { day: number; value: number }[]) => {
    if (data.length < 2) return '';
    
    const curvedPath = createCurvedPath(data);
    const lastX = getXPosition(data[data.length - 1].day);
    const lastY = getYPosition(data[data.length - 1].value);
    const firstX = getXPosition(data[0].day);
    const baseline = 100 - paddingBottom;
    
    return `${curvedPath} L ${lastX} ${baseline} L ${firstX} ${baseline} Z`;
  };

  const userPath = createCurvedPath(userGrowthData);
  const averagePath = createCurvedPath(averageData);
  const userAreaPath = createAreaPath(userGrowthData);
  const averageAreaPath = createAreaPath(averageData);

  return (
    <div 
      ref={containerRef}
      className={`w-full max-w-md mx-auto ${className}`}
      style={{ position: 'relative' }}
    >
      <motion.div
        initial="hidden"
        animate={controls}
        variants={containerVariants}
        className="w-full h-full"
      >
        <svg viewBox="0 0 100 100" className="w-full" style={{ overflow: 'visible' }}>
          {/* 배경 그라데이션 및 필터 */}
          <defs>
            {/* 유저 그래프 그라데이션 */}
            <linearGradient id="userGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(79, 70, 229, 0.7)" />
              <stop offset="100%" stopColor="rgba(99, 102, 241, 0)" />
            </linearGradient>
            
            {/* 평균 그래프 그라데이션 */}
            <linearGradient id="avgGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(148, 163, 184, 0.4)" />
              <stop offset="100%" stopColor="rgba(148, 163, 184, 0)" />
            </linearGradient>
            
            {/* 발광 효과 */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            
            {/* 드롭 쉐도우 */}
            <filter id="cardShadow" x="-5%" y="-5%" width="110%" height="110%">
              <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.1" />
            </filter>
            
            {/* 마스크 */}
            <clipPath id="graphClip">
              <rect 
                x={padding} 
                y={paddingTop} 
                width={graphWidth} 
                height={100 - paddingTop - paddingBottom} 
                rx="2"
              />
            </clipPath>
            
            {/* 성취 아이콘 배경 */}
            <radialGradient id="achievementGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" stopColor="#fef3c7" />
              <stop offset="100%" stopColor="#fef9c3" />
            </radialGradient>
          </defs>
          
          {/* 배경 카드 */}
          <rect 
            width="100" 
            height="100" 
            fill="white" 
            rx="10" 
            ry="10" 
            filter="url(#cardShadow)" 
          />
          
          {/* 그래프 제목 */}
          <motion.g variants={itemVariants}>
            <text
              x="50"
              y="16"
              textAnchor="middle"
              fontWeight="bold"
              fontSize={isMobile ? "4.2" : "4.8"}
              fill="#1e293b"
            >
              학습 성장 그래프
            </text>
            <text
              x="50"
              y="22"
              textAnchor="middle"
              fontSize={isMobile ? "2.6" : "3.2"}
              fill="#64748b"
            >
              7일간의 성장 곡선
            </text>
          </motion.g>
          
          {/* Y축 라벨 */}
          <motion.g variants={itemVariants} stroke="#f1f5f9" strokeWidth="0.5">
            {[0, 20, 40, 60].map((value) => {
              const y = getYPosition(value);
              return (
                <g key={`y-${value}`}>
                  <line 
                    x1={padding - 1} 
                    y1={y} 
                    x2={100 - padding} 
                    y2={y} 
                    strokeDasharray="1,1.5"
                  />
                </g>
              );
            })}
          </motion.g>
          
          {/* X축 라벨 */}
          <motion.g variants={itemVariants}>
            {userGrowthData.map((point) => {
              const x = getXPosition(point.day);
              const y = 100 - paddingBottom + 5;
              return (
                <text
                  key={`x-${point.day}`}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  fontSize="2.5"
                  fill="#64748b"
                >
                  {point.label}
                </text>
              );
            })}
          </motion.g>
          
          {/* 하단 중앙 범례 */}
          <g>
            {/* 중앙 기준 좌표 계산 */}
            <rect x={40} y={100 - paddingBottom + 10} width="3" height="3" rx="1" fill="#4f46e5" />
            <text x={44.5} y={100 - paddingBottom + 12.5} fontSize="2.6" fill="#334155">나의 성장</text>
            <rect x={60} y={100 - paddingBottom + 10} width="3" height="3" rx="1" fill="#94a3b8" />
            <text x={64.5} y={100 - paddingBottom + 12.5} fontSize="2.6" fill="#334155">전체 평균</text>
          </g>
          
          {/* 그래프 영역 */}
          <g clipPath="url(#graphClip)">
            {/* 평균 영역 채우기 */}
            <motion.path
              d={averageAreaPath}
              fill="url(#avgGradient)"
              opacity="0.7"
              variants={itemVariants}
            />
            
            {/* 유저 영역 채우기 */}
            <motion.path
              d={userAreaPath}
              fill="url(#userGradient)"
              opacity="0.8"
              variants={itemVariants}
            />
          </g>
          
          {/* 평균 라인 */}
          <motion.path
            d={averagePath}
            fill="none"
            stroke="#94a3b8"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="0"
            variants={lineVariants}
          />
          
          {/* 유저 라인 */}
          <motion.path
            d={userPath}
            fill="none"
            stroke="#4f46e5"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
            variants={lineVariants}
          />
          
          {/* 평균 데이터 포인트 */}
          {averageData.map((point, i) => {
            const x = getXPosition(point.day);
            const y = getYPosition(point.value);
            const isActive = i === activePointIndex;
            
            return (
              <g key={`avg-point-${i}`}>
                <motion.circle
                  cx={x}
                  cy={y}
                  r={isActive ? 2 : 1.5}
                  fill="#94a3b8"
                  stroke="white"
                  strokeWidth="0.5"
                  variants={itemVariants}
                  animate={{ 
                    scale: isActive ? 1.2 : 1,
                    opacity: isActive ? 1 : 0.8
                  }}
                  transition={{ duration: 0.3 }}
                />
              </g>
            );
          })}
          
          {/* 유저 데이터 포인트 */}
          {userGrowthData.map((point, i) => {
            const x = getXPosition(point.day);
            const y = getYPosition(point.value);
            const isActive = i === activePointIndex;
            
            return (
              <g 
                key={`user-point-${i}`}
                onMouseEnter={() => setHoveredPoint(i)}
                onMouseLeave={() => setHoveredPoint(null)}
                style={{ cursor: 'pointer' }}
                onClick={() => setActivePointIndex(i)}
              >
                {/* 포인트 주변 펄스 효과 (활성화된 경우만) */}
                {isActive && (
                  <motion.circle
                    cx={x}
                    cy={y}
                    r={4}
                    fill="#4f46e5"
                    opacity={0.3}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ 
                      scale: [1, 1.8, 1],
                      opacity: [0.7, 0, 0.7]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "loop"
                    }}
                  />
                )}
                
                <motion.circle
                  cx={x}
                  cy={y}
                  r={isActive ? 3.5 : 2.5}
                  fill="#4f46e5"
                  stroke="white"
                  strokeWidth="1"
                  variants={itemVariants}
                  animate={{ 
                    scale: isActive || i === hoveredPoint ? 1.3 : 1,
                    filter: isActive ? "url(#glow)" : "none"
                  }}
                  transition={{ duration: 0.3 }}
                  style={{ zIndex: 10 }}
                />
              </g>
            );
          })}
        </svg>
      </motion.div>
    </div>
  );
};

export default GrowthGraphAnimation; 