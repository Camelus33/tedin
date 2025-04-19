import React, { useRef, useState, useEffect } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';

// 컴포넌트 정의 전에 타입 정의
type Point = {
  x: number;
  y: number;
};

export interface LearningCycleAnimationProps {
  className?: string;
}

const LearningCycleAnimation: React.FC<LearningCycleAnimationProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: false, margin: "-10% 0px" });
  const controls = useAnimation();
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [activeStage, setActiveStage] = useState(0);
  
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
      
      // 자동으로 단계 변경하는 인터벌 설정
      const interval = setInterval(() => {
        setActiveStage(prev => (prev + 1) % stages.length);
      }, 3000);
      
      return () => clearInterval(interval);
    } else {
      controls.start("hidden");
    }
  }, [isInView, controls]);
  
  // 반응형 디자인을 위한 값 조정
  const isMobile = windowSize.width < 640;
  const isTablet = windowSize.width >= 640 && windowSize.width < 1024;
  
  // 화면 크기에 따른 스케일 조정
  const getFontSize = (baseSize: number) => {
    if (isMobile) return baseSize * 0.8;
    if (isTablet) return baseSize * 0.9;
    return baseSize;
  };
  
  // 학습 사이클 단계 정의 - 각 단계별 더 자세한 설명 추가
  const stages = [
    { 
      name: "정보 기억", 
      color: "#8b5cf6", 
      icon: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      description: "정보를 단기 기억에서 장기 기억으로 전환",
      details: [
        "작업 기억 활성화",
        "패턴 인식 강화",
        "정보 연결 구조화"
      ]
    },
    { 
      name: "판단력 향상", 
      color: "#4f46e5", 
      icon: "M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18",
      description: "비판적 사고 능력과 추론 기술 개발",
      details: [
        "문제 해결 능력",
        "논리적 사고력",
        "정보 평가 능력"
      ]
    },
    { 
      name: "즉각 피드백", 
      color: "#f59e0b", 
      icon: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z",
      description: "성취 검증 및 학습 경로 최적화",
      details: [
        "오류 수정 기회",
        "정확도 향상",
        "성취감 강화"
      ]
    },
    { 
      name: "루틴화", 
      color: "#10b981", 
      icon: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5",
      description: "지속적 학습 습관 형성 및 자동화",
      details: [
        "학습 자동화",
        "장기 기억 강화",
        "지식 체계화"
      ]
    },
  ];
  
  // 애니메이션 변형 정의
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };
  
  const cycleVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.2 
      }
    }
  };
  
  const stageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 260, 
        damping: 20,
        duration: 0.5 
      }
    }
  };
  
  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { 
      pathLength: 1, 
      opacity: 1,
      transition: { 
        duration: 1, 
        ease: "easeInOut"
      }
    }
  };
  
  const iconVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 15,
        delay: 0.2
      }
    }
  };
  
  const detailsVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.4,
        staggerChildren: 0.1
      }
    }
  };
  
  // 원형 레이아웃 계산
  const centerX = 50;
  const centerY = 50;
  // 화면 크기에 따라 원의 반지름 조정
  const radius = isMobile ? 28 : isTablet ? 32 : 34;
  
  // 각 단계의 위치 계산
  const getStagePosition = (index: number) => {
    const angle = (index * Math.PI * 2) / stages.length - Math.PI / 2;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  };
  
  // 베지어 곡선 제어점 계산 (곡선을 더 자연스럽게)
  const getControlPoints = (startPos: {x: number, y: number}, endPos: {x: number, y: number}) => {
    const midX = (startPos.x + endPos.x) / 2;
    const midY = (startPos.y + endPos.y) / 2;
    const distance = Math.sqrt(Math.pow(endPos.x - startPos.x, 2) + Math.pow(endPos.y - startPos.y, 2));
    
    const angle = Math.atan2(endPos.y - startPos.y, endPos.x - startPos.x) + Math.PI/2;
    const controlDistance = distance * 0.4;
    
    return {
      x: midX + controlDistance * Math.cos(angle),
      y: midY + controlDistance * Math.sin(angle)
    };
  };
  
  // 연결선 애니메이션 효과
  const connectorVariants = {
    hidden: { opacity: 0, pathLength: 0 },
    visible: { 
      opacity: 1,
      pathLength: 1,
      transition: { 
        duration: 0.7,
        ease: "easeInOut"
      } 
    }
  };
  
  // 커넥터 진행 상태 계산 함수
  const getConnectorProgress = (index: number) => {
    if (index === activeStage) return 1;
    if ((index + 1) % stages.length === activeStage) return 1;
    return 0.7;
  };
  
  // 화살표 경로 생성 함수
  const getArrowPath = (start: Point, end: Point, control: Point) => {
    // 곡선 위의 중간 지점 계산 (t=0.5)
    const t = 0.5;
    const midX = (1-t)*(1-t)*start.x + 2*(1-t)*t*control.x + t*t*end.x;
    const midY = (1-t)*(1-t)*start.y + 2*(1-t)*t*control.y + t*t*end.y;
    
    // 접선 벡터 계산
    const dx = 2*(1-t)*(control.x-start.x) + 2*t*(end.x-control.x);
    const dy = 2*(1-t)*(control.y-start.y) + 2*t*(end.y-control.y);
    
    // 벡터 정규화
    const len = Math.sqrt(dx*dx + dy*dy);
    const nx = dx / len;
    const ny = dy / len;
    
    // 화살표 크기 (화면 크기에 따라 조정)
    const arrowSize = isMobile ? 0.8 : 1.2;
    
    // 화살표 꼭지점
    const ax = midX + arrowSize * nx;
    const ay = midY + arrowSize * ny;
    
    // 화살표 날개
    const wx1 = midX + arrowSize * (-nx * 0.3 - ny * 0.8);
    const wy1 = midY + arrowSize * (-ny * 0.3 + nx * 0.8);
    const wx2 = midX + arrowSize * (-nx * 0.3 + ny * 0.8);
    const wy2 = midY + arrowSize * (-ny * 0.3 - nx * 0.8);
    
    return `M ${ax},${ay} L ${wx1},${wy1} L ${midX},${midY} L ${wx2},${wy2} Z`;
  };
  
  // SVG 내부 컴포넌트들의 위치 및 크기 조정을 위한 계산 함수
  const getStageNodeSize = () => {
    // 화면 크기에 따른 동적 계산
    const baseSize = Math.min(windowSize.width, windowSize.height) / 800;
    const sizeMultiplier = baseSize > 1 ? baseSize : 1;
    
    if (isMobile) return { normal: 6 * sizeMultiplier, active: 7 * sizeMultiplier };
    if (isTablet) return { normal: 7 * sizeMultiplier, active: 8 * sizeMultiplier };
    return { normal: 8 * sizeMultiplier, active: 9 * sizeMultiplier };
  };
  
  // 설명 박스 위치 조정
  const getDescriptionBoxPosition = () => {
    // 화면 비율에 따른 동적 계산
    const aspectRatio = windowSize.width / windowSize.height;
    const widthAdjustment = aspectRatio > 1 ? 0 : 5;
    
    if (isMobile) {
      return { x: 15, y: 78, width: 70 - widthAdjustment, height: 17 };
    }
    if (isTablet) {
      return { x: 15, y: 75, width: 70 - widthAdjustment, height: 19 };
    }
    return { x: 15, y: 75, width: 70 - widthAdjustment, height: 20 };
  };
  
  const nodeSize = getStageNodeSize();
  const descBox = getDescriptionBoxPosition();
  
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
          style={{ background: 'radial-gradient(circle at center, #f8fafc 10%, #f1f5f9 70%, #e2e8f0 100%)' }}
        >
          <defs>
            {/* 그라데이션 정의 */}
            {stages.map((stage, i) => (
              <linearGradient
                key={`gradient-${i}`}
                id={`gradient-${i}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  stopColor={stage.color}
                  stopOpacity="0.8"
                />
                <stop
                  offset="100%"
                  stopColor={stage.color}
                  stopOpacity="1"
                />
              </linearGradient>
            ))}
            
            {/* 중앙 원 그라데이션 */}
            <linearGradient
              id="centerGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="1" />
            </linearGradient>
            
            {/* 글로우 효과 필터 */}
            <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="1" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            
            {/* 커넥터 라인 패턴 */}
            <pattern id="dashPattern" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
              <path d="M0,2 L4,2" stroke="#cbd5e1" strokeWidth="0.7" strokeDasharray="1,1" />
            </pattern>
          </defs>
          
          {/* 배경 장식 */}
          <rect x="0" y="0" width="100" height="100" fill="url(#circlePattern)" opacity="0.5" />
          
          {/* 안내선 원 */}
          <motion.circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="0.5"
            strokeDasharray="1,2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ duration: 1, delay: 0.5 }}
          />
          
          {/* 사이클 단계 연결선 */}
          <motion.g variants={cycleVariants}>
            {stages.map((stage, i) => {
              const start = getStagePosition(i);
              const end = getStagePosition((i + 1) % stages.length);
              const control = getControlPoints(start, end);
              const isActive = i === activeStage || (i + 1) % stages.length === activeStage;
              
              // 커넥터 라인의 두께와 스타일을 화면 크기에 따라 동적 계산
              const strokeWidth = isMobile ? "0.5" : "0.7";
              const dashArray = isMobile ? "1,1.2" : "1.5,1.5";
              
              // z-index 효과를 위한 렌더링 순서 조정
              const renderOrder = isActive ? 1 : 0;
              
              return (
                <motion.g 
                  key={`connector-${i}`} 
                  variants={connectorVariants}
                  style={{ zIndex: renderOrder }}
                >
                  <motion.path
                    d={`M ${start.x} ${start.y} Q ${control.x} ${control.y} ${end.x} ${end.y}`}
                    fill="none"
                    stroke={isActive ? `url(#gradient-${i})` : "url(#dashPattern)"}
                    strokeWidth={isActive ? (isMobile ? "0.8" : "1") : strokeWidth}
                    strokeDasharray={isActive ? "none" : dashArray}
                    initial={{ pathLength: 0 }}
                    animate={{ 
                      pathLength: getConnectorProgress(i),
                      strokeOpacity: isActive ? 1 : 0.6
                    }}
                    transition={{ 
                      duration: 0.5, 
                      delay: 0.2 + i * 0.1,
                      ease: "easeInOut" 
                    }}
                  />
                  
                  {/* 커넥터 방향 표시 화살표 */}
                  {isActive && (
                    <motion.path
                      d={getArrowPath(start, end, control)}
                      fill={`url(#gradient-${i})`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.5 }}
                    />
                  )}
                </motion.g>
              );
            })}
          </motion.g>
          
          {/* 사이클 단계 노드 */}
          <motion.g variants={cycleVariants}>
            {stages.map((stage, i) => {
              const pos = getStagePosition(i);
              const isActive = i === activeStage;
              
              return (
                <motion.g
                  key={`stage-${i}`}
                  variants={stageVariants}
                  animate={{ 
                    scale: isActive ? 1.1 : 1,
                    filter: isActive ? "url(#glow)" : "none"
                  }}
                  whileHover={{ scale: 1.08 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => setActiveStage(i)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* 배경 원 */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isActive ? nodeSize.active : nodeSize.normal}
                    fill={`url(#gradient-${i})`}
                    stroke="white"
                    strokeWidth="0.8"
                    filter={isActive ? "drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.15))" : "none"}
                  />
                  
                  {/* 아이콘 */}
                  <motion.g variants={iconVariants}>
                    <path
                      d={stage.icon}
                      transform={`translate(${pos.x - 3.5}, ${pos.y - 3.5}) scale(${isMobile ? 0.12 : 0.14})`}
                      fill={isActive ? "white" : "#f8fafc"}
                      stroke={isActive ? "white" : "#f8fafc"}
                      strokeWidth="0.5"
                    />
                  </motion.g>
                  
                  {/* 이름 레이블 - 원 아래 충분히 떨어진 곳에, 진한 색상+외곽선 */}
                  <motion.text
                    x={pos.x}
                    y={pos.y + (isMobile ? 13 : 15)}
                    textAnchor="middle"
                    fontSize={getFontSize(3.2)}
                    fontWeight="bold"
                    fill="#222"
                    stroke="#fff"
                    strokeWidth="0.18"
                    paintOrder="stroke"
                    style={{ filter: 'drop-shadow(0 1px 2px #fff)' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                  >
                    {stage.name}
                  </motion.text>
                </motion.g>
              );
            })}
          </motion.g>
          
          {/* 중앙 원 */}
          <motion.circle
            cx={centerX}
            cy={centerY}
            r={isMobile ? 10 : isTablet ? 12 : 14}
            fill="url(#centerGradient)"
            stroke="white"
            strokeWidth="1"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 260, 
              damping: 20, 
              delay: 0.5 
            }}
          />
          
          {/* 중앙 텍스트 */}
          <motion.text
            x={centerX}
            y={centerY}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={getFontSize(5)}
            fontWeight="bold"
            fill="white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            학습
          </motion.text>
        </svg>
      </motion.div>
      {/* 설명 박스: 활성 단계 설명을 SVG 밖에 분리 */}
      <div
        style={{
          marginTop: isMobile ? 12 : 18,
          padding: isMobile ? '10px 8px' : '16px 18px',
          background: 'rgba(255,255,255,0.97)',
          borderRadius: 10,
          textAlign: 'center',
          fontWeight: 600,
          fontSize: isMobile ? 15 : 18,
          color: stages[activeStage].color,
          boxShadow: '0 2px 12px 0 rgba(0,0,0,0.06)',
          border: `1.5px solid ${stages[activeStage].color}`,
          maxWidth: 480,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        <div style={{ fontWeight: 700, fontSize: isMobile ? 18 : 22, marginBottom: 4 }}>{stages[activeStage].name}</div>
        <div style={{ color: '#334155', fontWeight: 500, fontSize: isMobile ? 15 : 17, marginBottom: 6 }}>{stages[activeStage].description}</div>
        <ul style={{ listStyle: 'disc', paddingLeft: 18, color: '#475569', textAlign: 'left', margin: 0 }}>
          {stages[activeStage].details.map((detail, idx) => (
            <li key={idx} style={{ marginBottom: 2, fontSize: isMobile ? 14 : 16 }}>{detail}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default LearningCycleAnimation; 