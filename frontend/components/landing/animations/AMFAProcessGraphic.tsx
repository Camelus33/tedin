'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';
import { BookOpen, Edit3, Zap, Link, ArrowRight, Sparkles } from 'lucide-react';

interface AMFAStep {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  gradient: string;
  energyPattern: string;
}

const amfaSteps: AMFAStep[] = [
  {
    id: 'atomic',
    title: 'Atomic Reading',
    subtitle: '3분 11페이지',
    description: '작은 시작의 마법을 경험하세요. 부담 없는 분량으로 독서의 즐거움을 되찾습니다.',
    icon: BookOpen,
    color: 'text-cyan-400',
    gradient: 'from-cyan-500/20 to-cyan-600/20',
    energyPattern: 'gentle-waves'
  },
  {
    id: 'memo',
    title: 'Memo Evolve',
    subtitle: '생각의 진화',
    description: '5단계 메모 시스템으로 단순한 기록을 깊은 통찰로 발전시킵니다.',
    icon: Edit3,
    color: 'text-blue-400',
    gradient: 'from-blue-500/20 to-cyan-500/20',
    energyPattern: 'spiral-growth'
  },
  {
    id: 'furnace',
    title: 'Furnace Knowledge',
    subtitle: '지식 단련소',
    description: '개인화된 학습 공간에서 지식을 체계적으로 단련하고 내재화합니다.',
    icon: Zap,
    color: 'text-purple-400',
    gradient: 'from-purple-500/20 to-blue-500/20',
    energyPattern: 'intense-forge'
  },
  {
    id: 'link',
    title: 'AI Link',
    subtitle: '지능적 연결',
    description: 'AI와 함께 지식을 연결하고 확장하여 새로운 통찰을 발견합니다.',
    icon: Link,
    color: 'text-violet-400',
    gradient: 'from-violet-500/20 to-purple-500/20',
    energyPattern: 'neural-network'
  }
];

export default function AMFAProcessGraphic() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const controls = useAnimation();
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  useEffect(() => {
    if (isHovered) return;
    
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % amfaSteps.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isHovered]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const stepVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.8
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  const EnergyFlow = ({ step, index, isActive }: { step: AMFAStep, index: number, isActive: boolean }) => {
    const baseX = 200 + index * 200;
    const baseY = 200;

    if (!isActive) return null;

    switch (step.energyPattern) {
      case 'gentle-waves':
        return (
          <g>
            {[...Array(3)].map((_, i) => (
              <motion.circle
                key={i}
                cx={baseX}
                cy={baseY}
                r={20 + i * 15}
                fill="none"
                stroke="url(#gentleWaveGradient)"
                strokeWidth="2"
                opacity="0.6"
                animate={{
                  r: [20 + i * 15, 40 + i * 15, 20 + i * 15],
                  opacity: [0.6, 0.2, 0.6]
                }}
                transition={{
                  duration: 2 + i * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            ))}
          </g>
        );
      
      case 'spiral-growth':
        return (
          <g>
            <motion.path
              d={`M ${baseX} ${baseY} 
                  Q ${baseX + 20} ${baseY - 20} ${baseX + 30} ${baseY}
                  Q ${baseX + 20} ${baseY + 20} ${baseX} ${baseY + 30}
                  Q ${baseX - 20} ${baseY + 20} ${baseX - 30} ${baseY}
                  Q ${baseX - 20} ${baseY - 20} ${baseX} ${baseY - 30}`}
              fill="none"
              stroke="url(#spiralGradient)"
              strokeWidth="3"
              animate={{
                rotate: [0, 360],
                scale: [0.8, 1.2, 0.8]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{ transformOrigin: `${baseX}px ${baseY}px` }}
            />
          </g>
        );
      
      case 'intense-forge':
        return (
          <g>
            {[...Array(5)].map((_, i) => (
              <motion.rect
                key={i}
                x={baseX - 2}
                y={baseY - 30 + i * 12}
                width="4"
                height="8"
                fill="url(#forgeGradient)"
                animate={{
                  scaleY: [0.5, 1.5, 0.5],
                  opacity: [0.4, 1, 0.4]
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: "easeInOut"
                }}
              />
            ))}
          </g>
        );
      
      case 'neural-network':
        return (
          <g>
            {[...Array(6)].map((_, i) => {
              const angle = (i * 60) * Math.PI / 180;
              const endX = baseX + Math.cos(angle) * 40;
              const endY = baseY + Math.sin(angle) * 40;
              
              return (
                <motion.line
                  key={i}
                  x1={baseX}
                  y1={baseY}
                  x2={endX}
                  y2={endY}
                  stroke="url(#neuralGradient)"
                  strokeWidth="2"
                  animate={{
                    opacity: [0.2, 0.8, 0.2],
                    strokeWidth: [1, 3, 1]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut"
                  }}
                />
              );
            })}
          </g>
        );
      
      default:
        return null;
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-6xl mx-auto py-16">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-violet-500/5 rounded-3xl blur-3xl"></div>
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={controls}
        className="relative z-10"
      >
        <motion.div 
          variants={stepVariants}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-violet-400 bg-clip-text text-transparent mb-4">
            AMFA Framework
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            지식의 주변에서 중심으로, 4단계 학습 여정
          </p>
        </motion.div>

        <div className="hidden lg:block">
          <div className="relative">
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none" 
              style={{ zIndex: 1 }}
            >
              <defs>
                <linearGradient id="gentleWaveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#0891b2" stopOpacity="0.4" />
                </linearGradient>
                
                <linearGradient id="spiralGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.6" />
                </linearGradient>
                
                <linearGradient id="forgeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="1" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
                </linearGradient>
                
                <linearGradient id="neuralGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.6" />
                </linearGradient>

                <filter id="energyGlow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              {amfaSteps.map((step, index) => (
                <EnergyFlow 
                  key={step.id}
                  step={step}
                  index={index}
                  isActive={activeStep === index}
                />
              ))}
            </svg>

            <div className="grid grid-cols-4 gap-8 relative z-10">
              {amfaSteps.map((step, index) => {
                // 파도 기반 3D 레이어 계산 - 자연스러운 흐름과 연쇄 반응
                const isActive = activeStep === index;
                
                // 파도의 영향 범위 계산 - 중심에서 멀어질수록 영향 감소
                const distanceFromActive = Math.abs(index - activeStep);
                const waveInfluence = Math.max(0, 1 - (distanceFromActive * 0.3));
                
                // 파도 기반 상태 분류
                const isWaveCenter = isActive;
                const isWaveNear = !isActive && distanceFromActive === 1;
                const isWaveFar = !isActive && distanceFromActive >= 2;

                // 자연스러운 파도 변환 - 균형잡힌 크기 분포
                const getWaveTransform = () => {
                  const activeScale = 1.15; // 활성 카드 크기 (더 크게)
                  const nearScale = 0.95;   // 인근 카드 크기
                  const farScale = 0.82;    // 원거리 카드 크기 (고정값으로 균등성 확보)
                  
                  if (isWaveCenter) {
                    return {
                      scale: activeScale,
                      z: 30,
                      rotateX: -2, // 살짝 앞으로 기울어짐
                      rotateY: 0
                    };
                  } else if (isWaveNear) {
                    const direction = index < activeStep ? -1 : 1; // 파도 방향성
                    return {
                      scale: nearScale,
                      z: -10,
                      rotateX: 1 * direction, // 파도 방향에 따른 기울기
                      rotateY: 2 * direction
                    };
                  } else {
                    // 원거리 카드는 고정 스케일로 균등성 확보
                    return {
                      scale: farScale,
                      z: -35,
                      rotateX: 2,
                      rotateY: 0
                    };
                  }
                };

                const getWaveOpacity = () => {
                  if (isWaveCenter) return 1;
                  if (isWaveNear) return 0.85;
                  return Math.max(0.25, 0.7 - (distanceFromActive * 0.15));
                };

                const getWaveZIndex = () => {
                  if (isWaveCenter) return 50;
                  if (isWaveNear) return 30;
                  return Math.max(5, 20 - (distanceFromActive * 5));
                };

                // 파도 애니메이션을 위한 staggered delay 계산
                const getWaveDelay = () => {
                  return distanceFromActive * 0.08; // 80ms씩 지연되어 파도 효과 생성
                };

                // 각 카드별 고유 색상 정의 - AMFA 단계별 특성 반영
                const getStepColors = () => {
                  const stepColorMap: Record<number, {
                    active: string;
                    activeGlow: string;
                    near: string;
                    nearGlow: string;
                  }> = {
                    0: { // Atomic Reading - 시작의 에너지 (청록색)
                      active: 'linear-gradient(45deg, #06b6d4, #0891b2)',
                      activeGlow: '0 4px 15px rgba(6,182,212,0.6)',
                      near: 'linear-gradient(45deg, rgba(6,182,212,0.7), rgba(8,145,178,0.7))',
                      nearGlow: '0 2px 8px rgba(6,182,212,0.3)'
                    },
                    1: { // Memo Evolve - 진화의 에너지 (보라색)
                      active: 'linear-gradient(45deg, #8b5cf6, #7c3aed)',
                      activeGlow: '0 4px 15px rgba(139,92,246,0.6)',
                      near: 'linear-gradient(45deg, rgba(139,92,246,0.7), rgba(124,58,237,0.7))',
                      nearGlow: '0 2px 8px rgba(139,92,246,0.3)'
                    },
                    2: { // Furnace Knowledge - 변환의 에너지 (주황색)
                      active: 'linear-gradient(45deg, #f97316, #ea580c)',
                      activeGlow: '0 4px 15px rgba(249,115,22,0.6)',
                      near: 'linear-gradient(45deg, rgba(249,115,22,0.7), rgba(234,88,12,0.7))',
                      nearGlow: '0 2px 8px rgba(249,115,22,0.3)'
                    },
                    3: { // AI Link - 확장의 에너지 (핑크색)
                      active: 'linear-gradient(45deg, #ec4899, #db2777)',
                      activeGlow: '0 4px 15px rgba(236,72,153,0.6)',
                      near: 'linear-gradient(45deg, rgba(236,72,153,0.7), rgba(219,39,119,0.7))',
                      nearGlow: '0 2px 8px rgba(236,72,153,0.3)'
                    }
                  };
                  return stepColorMap[index] || stepColorMap[0];
                };

                return (
                  <motion.div
                    key={step.id}
                    variants={stepVariants}
                    className="relative group"
                    onHoverStart={() => {
                      setIsHovered(true);
                      setActiveStep(index);
                    }}
                    onHoverEnd={() => setIsHovered(false)}
                    style={{
                      perspective: '1500px',  // 더 깊은 원근감
                      transformStyle: 'preserve-3d'
                    }}
                  >
                    <motion.div
                      className={`
                        relative p-8 rounded-2xl border-2 cursor-pointer
                        ${isWaveCenter 
                          ? 'border-cyan-400 bg-gradient-to-br from-gray-900/80 to-gray-800/80 shadow-2xl shadow-cyan-500/30' 
                          : isWaveNear
                          ? 'border-gray-600 bg-gradient-to-br from-gray-900/60 to-gray-800/60 shadow-lg shadow-gray-500/20'
                          : 'border-gray-700 bg-gray-900/40 hover:border-gray-600'
                        }
                      `}
                      animate={{
                        scale: getWaveTransform().scale,
                        rotateX: getWaveTransform().rotateX,
                        rotateY: getWaveTransform().rotateY,
                        z: getWaveTransform().z,
                        opacity: getWaveOpacity(),
                        zIndex: getWaveZIndex()
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 120,
                        damping: 15,
                        mass: 0.8,
                        delay: getWaveDelay()
                      }}
                      whileHover={{
                        scale: isWaveCenter ? 1.22 : isWaveNear ? 1.0 : 0.88,
                        rotateY: isWaveCenter ? 0 : isWaveNear ? 3 : 5,
                        transition: { 
                          type: "spring",
                          stiffness: 300,
                          damping: 20
                        }
                      }}
                    >
                      {isWaveCenter && (
                        <motion.div 
                          className={`absolute inset-0 bg-gradient-to-br ${step.gradient} rounded-2xl blur-xl`}
                          animate={{
                            opacity: [0.3, 0.6],
                            scale: [1, 1.1]
                          }}
                          transition={{
                            duration: 2,
                            ease: "easeInOut",
                            repeat: Infinity,
                            repeatType: "reverse"
                          }}
                        />
                      )}
                      
                      <div className={`
                        absolute inset-0 rounded-2xl
                        ${isWaveCenter 
                          ? 'shadow-[0_25px_50px_-12px_rgba(6,182,212,0.25)]' 
                          : isWaveNear
                          ? 'shadow-[0_15px_30px_-12px_rgba(0,0,0,0.3)]'
                          : 'shadow-[0_8px_16px_-8px_rgba(0,0,0,0.2)]'
                        }
                      `} />
                      
                      <div className="relative z-10 text-center">
                        <motion.div 
                          className={`
                            inline-flex items-center justify-center w-16 h-16 rounded-full mb-6
                            ${isWaveCenter 
                              ? 'bg-gradient-to-r from-cyan-500 to-purple-500 shadow-lg shadow-cyan-500/40' 
                              : isWaveNear
                              ? 'bg-gradient-to-r from-cyan-500/70 to-purple-500/70 shadow-md shadow-cyan-500/20'
                              : 'bg-gray-800 border border-gray-600'
                            }
                          `}
                          animate={isWaveCenter ? {
                            boxShadow: [
                              '0 0 20px rgba(6,182,212,0.4)',
                              '0 0 30px rgba(139,92,246,0.6)'
                            ]
                          } : {}}
                          transition={{
                            duration: 2,
                            ease: "easeInOut",
                            repeat: isWaveCenter ? Infinity : 0,
                            repeatType: "reverse"
                          }}
                        >
                          <step.icon className={`
                            w-8 h-8
                            ${isWaveCenter 
                              ? 'text-white' 
                              : isWaveNear 
                              ? 'text-gray-200' 
                              : step.color
                            }
                          `} />
                        </motion.div>
                        
                        <h3 className={`
                          text-xl font-bold mb-2
                          ${isWaveCenter 
                            ? 'text-cyan-400 text-shadow-lg' 
                            : isWaveNear 
                            ? 'text-cyan-300' 
                            : 'text-gray-300'
                          }
                        `}>
                          {step.title}
                        </h3>
                        
                        <p className={`
                          text-sm font-medium mb-4
                          ${isWaveCenter 
                            ? 'text-purple-400' 
                            : isWaveNear 
                            ? 'text-purple-300' 
                            : 'text-gray-500'
                          }
                        `}>
                          {step.subtitle}
                        </p>
                        
                        <p className={`
                          text-sm leading-relaxed
                          ${isWaveCenter 
                            ? 'text-gray-200' 
                            : isWaveNear 
                            ? 'text-gray-400' 
                            : 'text-gray-600'
                          }
                        `}>
                          {step.description}
                        </p>
                      </div>

                      <motion.div 
                        className="absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                        animate={isWaveCenter ? {
                          scale: [1, 1.1],
                          rotate: [0, 5],
                          background: [
                            getStepColors().active,
                            getStepColors().active.replace('45deg', '225deg') // 그라데이션 방향 변경으로 색상 변화
                          ],
                          boxShadow: [
                            getStepColors().activeGlow,
                            getStepColors().activeGlow.replace('0.6', '0.8') // 글로우 강도 변화
                          ]
                        } : isWaveNear ? {
                          background: [
                            getStepColors().near,
                            getStepColors().near.replace('0.7', '0.9') // 투명도 변화
                          ],
                          boxShadow: [
                            getStepColors().nearGlow,
                            getStepColors().nearGlow.replace('0.3', '0.5') // 글로우 강도 변화
                          ]
                        } : {
                          background: '#374151',
                          color: '#9ca3af'
                        }}
                        style={{
                          background: isWaveCenter 
                            ? getStepColors().active
                            : isWaveNear
                            ? getStepColors().near
                            : '#374151',
                          color: isWaveCenter || isWaveNear ? 'white' : '#9ca3af',
                          boxShadow: isWaveCenter 
                            ? getStepColors().activeGlow
                            : isWaveNear
                            ? getStepColors().nearGlow
                            : 'none'
                        }}
                        transition={{
                          duration: isWaveCenter ? 1.5 : isWaveNear ? 1.2 : 0.8,
                          ease: "easeInOut",
                          repeat: isWaveCenter ? Infinity : isWaveNear ? 2 : 0,
                          repeatType: "reverse",
                          delay: getWaveDelay() * 0.5 // 파도 지연의 절반으로 더 빠른 반응
                        }}
                      >
                        {index + 1}
                      </motion.div>

                      <div className={`
                        absolute bottom-2 right-2 w-2 h-2 rounded-full
                        ${isWaveCenter 
                          ? 'bg-cyan-400 shadow-lg shadow-cyan-400/50' 
                          : isWaveNear 
                          ? 'bg-cyan-300 shadow-md shadow-cyan-300/30' 
                          : 'bg-gray-600'
                        }
                      `} />
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:hidden space-y-6">
          {amfaSteps.map((step, index) => (
            <motion.div
              key={step.id}
              variants={stepVariants}
              className="relative"
            >
              <div className="flex items-start space-x-4 p-6 rounded-xl bg-gray-900/30 border border-gray-700">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center">
                    <step.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-cyan-400 mb-1">{step.title}</h3>
                  <p className="text-sm text-purple-400 mb-2">{step.subtitle}</p>
                  <p className="text-sm text-gray-400 leading-relaxed">{step.description}</p>
                </div>
                
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                  {index + 1}
                </div>
              </div>
              
              {index < amfaSteps.length - 1 && (
                <div className="flex justify-center py-2">
                  <ArrowRight className="w-5 h-5 text-gray-600" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div 
          variants={stepVariants}
          className="text-center mt-16"
        >
          <div className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <span className="text-sm font-medium text-gray-300">
              4단계 여정을 통해 불가능한 독서를 가능하게
            </span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
} 