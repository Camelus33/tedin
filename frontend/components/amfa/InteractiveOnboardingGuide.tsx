"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  BookOpenIcon, 
  LightBulbIcon, 
  FireIcon, 
  CpuChipIcon,
  ArrowRightIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

// 4단계 여정의 각 단계 타입
type JourneyStep = 'droplet' | 'wave' | 'vortex' | 'crystal' | 'comparison';

interface StepData {
  id: JourneyStep;
  title: string;
  subtitle: string;
  icon: React.ComponentType<any>;
  color: string;
  bgGradient: string;
  description: string;
  actionText: string;
  visualElement: React.ReactNode;
}

interface InteractiveOnboardingGuideProps {
  onComplete?: () => void;
}

export default function InteractiveOnboardingGuide({ onComplete }: InteractiveOnboardingGuideProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<JourneyStep | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 4단계 여정 데이터 - 학습 가속 중심
  const journeySteps: StepData[] = [
    {
      id: 'droplet',
      title: 'Atomic Memo',
      subtitle: '3분 집중',
      icon: BookOpenIcon,
      color: 'text-cyan-400',
      bgGradient: 'from-cyan-500/20 to-blue-500/20',
      description: '과학적으로 검증된 3분 집중으로 핵심을 추출하세요',
      actionText: '3분 집중 시작',
      visualElement: <DropletAnimation />
    },
    {
      id: 'wave',
      title: 'Memo Evolve',
      subtitle: '메모 진화',
      icon: LightBulbIcon,
      color: 'text-blue-400',
      bgGradient: 'from-blue-500/20 to-indigo-500/20',
      description: '4단계 진화로 기억 보존률을 4배 향상시키세요',
      actionText: '메모 진화하기',
      visualElement: <WaveAnimation />
    },
    {
      id: 'vortex',
      title: 'Furnace Knowledge',
      subtitle: '지식 통합',
      icon: FireIcon,
      color: 'text-purple-400',
      bgGradient: 'from-purple-500/20 to-violet-500/20',
      description: '여러 메모를 통합된 지식 체계로 재구성하세요',
      actionText: '지식 통합하기',
      visualElement: <VortexAnimation />
    },
    {
      id: 'crystal',
      title: 'AI-Link',
      subtitle: 'AI 파트너',
      icon: CpuChipIcon,
      color: 'text-violet-400',
      bgGradient: 'from-violet-500/20 to-purple-500/20',
      description: '프롬프트 없이 AI와 소통하는 개인화된 학습 파트너',
      actionText: 'AI 파트너 생성',
      visualElement: <CrystalAnimation />
    },
    {
      id: 'comparison',
      title: '학습 가속 효과를 경험해보세요',
      subtitle: '성과 비교',
      icon: CpuChipIcon,
      color: 'text-emerald-400',
      bgGradient: 'from-emerald-500/20 to-green-500/20',
      description: '일반 학습과 Habitus33의 학습 가속 효과를 직접 비교해보세요',
      actionText: '학습 시작하기',
      visualElement: <ComparisonSlider />
    }
  ];

  // 다음 단계로 진행
  const handleNextStep = () => {
    if (!currentStep) {
      setCurrentStep('droplet');
      return;
    }

    const currentIndex = journeySteps.findIndex(step => step.id === currentStep);
    if (currentIndex < journeySteps.length - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(journeySteps[currentIndex + 1].id);
        setIsTransitioning(false);
      }, 300);
    } else {
      // 마지막 단계(비교)에서는 책 페이지로 이동
      if (currentStep === 'comparison') {
        setIsTransitioning(true);
        setTimeout(() => {
          router.push('/books');
        }, 500);
      } else {
        handleComplete();
      }
    }
  };

  // 여정 완료 처리
  const handleComplete = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      onComplete?.();
      router.push('/books'); // 내 서재로 이동
    }, 500);
  };

  // 첫 시작 화면
  if (!currentStep) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-8 max-w-2xl mx-auto px-6"
        >
          {/* 시작 메시지 */}
          <div className="space-y-4">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-6xl mb-4"
            >
              ⚡
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-bold text-cyan-400">
              학습 가속의 첫 단계를
            </h2>
            <h2 className="text-3xl md:text-4xl font-bold text-purple-400">
              경험해보세요
            </h2>
          </div>

          {/* 시작 버튼 */}
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            onClick={handleNextStep}
            className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full text-white font-semibold text-lg hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-cyan-500/25"
          >
            <span className="flex items-center gap-2">
              여정 시작하기
              <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // 현재 단계 데이터
  const currentStepData = journeySteps.find(step => step.id === currentStep);
  if (!currentStepData) return null;

  return (
    <div 
      ref={containerRef}
      className={`min-h-screen bg-gradient-to-br ${currentStepData.bgGradient} from-gray-900 via-gray-800 to-gray-900 transition-all duration-1000`}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: isTransitioning ? 0 : 1, y: isTransitioning ? -50 : 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen flex items-center justify-center px-6"
        >
          <div className="max-w-4xl mx-auto text-center space-y-12">
            {/* 단계 표시 */}
            <div className="flex justify-center space-x-2 mb-8">
              {journeySteps.map((step, index) => (
                <div
                  key={step.id}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    step.id === currentStep
                      ? 'bg-cyan-400 scale-125'
                      : journeySteps.findIndex(s => s.id === currentStep) > index
                      ? 'bg-purple-400'
                      : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>

            {/* 비교 단계는 특별한 레이아웃 */}
            {currentStep === 'comparison' ? (
              <>
                {/* 시각적 요소 */}
                <div className="flex justify-center">
                  {currentStepData.visualElement}
                </div>

                {/* 액션 버튼 */}
                <div className="space-y-8">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleNextStep}
                    className={`group px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full text-white font-semibold text-lg transition-all duration-300 shadow-2xl hover:shadow-cyan-500/25`}
                  >
                    <span className="flex items-center gap-2">
                      {currentStepData.actionText}
                      <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </motion.button>
                  
                  {/* 건너뛰기 옵션 */}
                  <button
                    onClick={handleComplete}
                    className="text-gray-400 hover:text-gray-300 text-sm transition-colors underline underline-offset-4 hover:underline-offset-2"
                  >
                    건너뛰기
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* 시각적 요소 */}
                <div className="flex justify-center mb-8">
                  {currentStepData.visualElement}
                </div>

                {/* 제목과 설명 */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className={`text-2xl font-medium ${currentStepData.color}`}>
                      {currentStepData.subtitle}
                    </h3>
                    <h2 className="text-4xl md:text-5xl font-bold text-white">
                      {currentStepData.title}
                    </h2>
                  </div>
                  
                  <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                    {currentStepData.description}
                  </p>
                </div>

                {/* 액션 버튼 */}
                <div className="space-y-8">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleNextStep}
                    className={`group px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full text-white font-semibold text-lg transition-all duration-300 shadow-2xl hover:shadow-cyan-500/25`}
                  >
                    <span className="flex items-center gap-2">
                      {currentStepData.actionText}
                      <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </motion.button>
                  
                  {/* 건너뛰기 옵션 */}
                  <button
                    onClick={handleComplete}
                    className="text-gray-400 hover:text-gray-300 text-sm transition-colors underline underline-offset-4 hover:underline-offset-2"
                  >
                    건너뛰기
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// 물방울 애니메이션 컴포넌트 - 2024 Organic Fluid Motion 적용
function DropletAnimation() {
  return (
    <motion.div
      className="relative w-40 h-40 mx-auto"
      initial={{ scale: 0, rotate: -5 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ duration: 0.8, ease: "backOut" }}
    >
      {/* 메인 물방울 - Morphing Blob 효과 */}
      <motion.div
        className="absolute inset-2 bg-gradient-to-br from-cyan-300 via-blue-400 to-blue-600 rounded-full shadow-2xl"
        animate={{
          scale: [1, 1.05, 0.98, 1],
          borderRadius: ["50%", "52% 48% 54% 46%", "48% 52% 46% 54%", "50%"],
          rotate: [0, 1, -1, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          filter: "drop-shadow(0 12px 24px rgba(59, 130, 246, 0.4))",
        }}
      />
      
      {/* Caustic Light Effect - 주요 빛 굴절 */}
      <motion.div
        className="absolute top-4 left-6 w-8 h-12 bg-gradient-to-br from-white/95 via-cyan-100/80 to-transparent rounded-full"
        animate={{
          opacity: [0.8, 1, 0.8],
          scale: [1, 1.15, 1],
          x: [0, 2, 0],
          y: [0, -1, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          filter: "blur(0.3px)",
        }}
      />
      
      {/* 보조 빛 굴절 */}
      <motion.div
        className="absolute top-8 right-6 w-4 h-6 bg-gradient-to-bl from-white/70 to-transparent rounded-full"
        animate={{
          opacity: [0.4, 0.8, 0.4],
          scale: [0.8, 1.2, 0.8],
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />
      
      {/* 내부 깊이감 */}
      <motion.div
        className="absolute inset-5 bg-gradient-to-t from-blue-500/40 to-transparent rounded-full"
        animate={{
          opacity: [0.3, 0.7, 0.3],
          scale: [0.9, 1, 0.9],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.5
        }}
      />
      
      {/* Surface Tension - 표면 장력 효과 */}
      <motion.div
        className="absolute inset-1 border border-cyan-200/50 rounded-full"
        animate={{
          scale: [1, 1.02, 1],
          opacity: [0.3, 0.7, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5
        }}
      />
      
      {/* 미세 물방울들 - Organic Movement */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 bg-cyan-300/90 rounded-full"
          style={{
            top: `${10 + i * 18}%`,
            left: `${70 + Math.sin(i * 1.2) * 20}%`,
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, Math.cos(i * 0.8) * 8, 0],
            opacity: [0.2, 1, 0.2],
            scale: [0.5, 1.8, 0.5],
          }}
          transition={{
            duration: 3.5 + i * 0.8,
            repeat: Infinity,
            delay: i * 1.5,
            ease: "easeInOut"
          }}
        />
      ))}
    </motion.div>
  );
}

// 파도 애니메이션 컴포넌트 - Dynamic Wave Patterns 적용
function WaveAnimation() {
  return (
    <motion.div
      className="relative w-48 h-40 mx-auto"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      {/* 주요 파문들 - Enhanced Ripple Effect */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute inset-0 border-2 rounded-full"
          style={{
            borderColor: `rgba(59, 130, 246, ${0.8 - i * 0.15})`,
            borderWidth: `${3 - i * 0.5}px`,
          }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{
            scale: [0, 1.5, 2.8, 4],
            opacity: [1, 0.8, 0.3, 0],
            borderWidth: [`${3 - i * 0.5}px`, `${2 - i * 0.3}px`, `${1}px`, `${0.5}px`],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            delay: i * 0.8,
            ease: "easeOut"
          }}
        />
      ))}
      
      {/* Energy Flow - 에너지 흐름 시각화 */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`energy-${i}`}
          className="absolute w-2 h-2 bg-blue-300 rounded-full"
          style={{
            top: "50%",
            left: "50%",
            transformOrigin: "0 0",
          }}
          animate={{
            x: [
              0,
              Math.cos((i * 60 * Math.PI) / 180) * 40,
              Math.cos((i * 60 * Math.PI) / 180) * 80,
              Math.cos((i * 60 * Math.PI) / 180) * 120
            ],
            y: [
              0,
              Math.sin((i * 60 * Math.PI) / 180) * 40,
              Math.sin((i * 60 * Math.PI) / 180) * 80,
              Math.sin((i * 60 * Math.PI) / 180) * 120
            ],
            scale: [1, 1.5, 0.8, 0],
            opacity: [0.8, 1, 0.6, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            delay: i * 0.4,
            ease: "easeOut"
          }}
        />
      ))}
      
      {/* 중앙의 파도 생성원 - Enhanced Core */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div 
          className="relative w-12 h-12 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 rounded-full shadow-lg"
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            scale: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            },
            rotate: {
              duration: 4,
              repeat: Infinity,
              ease: "linear"
            }
          }}
          style={{
            filter: "drop-shadow(0 4px 12px rgba(99, 102, 241, 0.4))",
          }}
        >
          {/* 내부 코어 */}
          <motion.div
            className="absolute inset-2 bg-gradient-to-br from-white/60 to-transparent rounded-full"
            animate={{
              opacity: [0.6, 1, 0.6],
              scale: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      </div>
      
      {/* 물보라 효과 */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`splash-${i}`}
          className="absolute w-1 h-1 bg-cyan-200 rounded-full"
          style={{
            top: `${45 + Math.sin(i * 0.8) * 15}%`,
            left: `${45 + Math.cos(i * 0.8) * 15}%`,
          }}
          animate={{
            y: [0, -25, -10, 0],
            x: [0, Math.cos(i * 0.5) * 15, Math.cos(i * 0.5) * 8, 0],
            opacity: [0, 1, 0.5, 0],
            scale: [0.5, 2, 1, 0.5],
          }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeOut"
          }}
        />
      ))}
    </motion.div>
  );
}

// 소용돌이 애니메이션 컴포넌트 - Advanced Spiral Dynamics 적용
function VortexAnimation() {
  return (
    <motion.div
      className="relative w-56 h-56 mx-auto"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "backOut" }}
    >
      {/* 다층 나선 구조 - Spiral Dynamics */}
      {[...Array(5)].map((_, ringIndex) => (
        <motion.div
          key={`ring-${ringIndex}`}
          className="absolute border border-dashed rounded-full"
          style={{
            inset: `${ringIndex * 15}px`,
            borderColor: `rgba(147, 51, 234, ${0.8 - ringIndex * 0.15})`,
            borderWidth: `${3 - ringIndex * 0.4}px`,
          }}
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.05, 1],
          }}
          transition={{
            rotate: {
              duration: 3 + ringIndex * 0.5,
              repeat: Infinity,
              ease: "linear"
            },
            scale: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: ringIndex * 0.3
            }
          }}
        />
      ))}
      
      {/* 중앙 소용돌이 코어 - 3D Depth Effect */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="relative w-16 h-16 bg-gradient-to-br from-purple-400 via-violet-500 to-purple-700 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, -360],
          }}
          transition={{
            scale: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            },
            rotate: {
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }
          }}
          style={{
            filter: "drop-shadow(0 8px 32px rgba(147, 51, 234, 0.6))",
          }}
        >
          {/* 내부 깊이감 */}
          <motion.div
            className="absolute inset-2 bg-gradient-to-t from-black/40 to-transparent rounded-full"
            animate={{
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* 중심 빛 */}
          <motion.div
            className="absolute inset-4 bg-white/80 rounded-full"
            animate={{
              scale: [0.5, 1, 0.5],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      </div>
      
      {/* 나선형 흡입 파티클들 - Advanced Particle Vortex */}
      {[...Array(12)].map((_, i) => {
        const spiralTurns = 3;
        const totalSteps = 60;
        return (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-2 h-2 bg-gradient-to-r from-purple-300 to-violet-400 rounded-full"
            style={{
              top: '50%',
              left: '50%',
              transformOrigin: '0 0',
            }}
            animate={{
              x: Array.from({ length: totalSteps }, (_, step) => {
                const angle = (step / totalSteps) * spiralTurns * 2 * Math.PI + (i * 30 * Math.PI) / 180;
                const radius = 100 - (step / totalSteps) * 90;
                return Math.cos(angle) * radius;
              }),
              y: Array.from({ length: totalSteps }, (_, step) => {
                const angle = (step / totalSteps) * spiralTurns * 2 * Math.PI + (i * 30 * Math.PI) / 180;
                const radius = 100 - (step / totalSteps) * 90;
                return Math.sin(angle) * radius;
              }),
              scale: [1, 1.5, 0.5, 0],
              opacity: [0.8, 1, 0.6, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.4,
              ease: "easeInOut"
            }}
          />
        );
      })}
      
      {/* 추가 에너지 효과 */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`energy-${i}`}
          className="absolute w-1 h-1 bg-purple-200 rounded-full"
          style={{
            top: `${50 + Math.sin(i * 1.2) * 30}%`,
            left: `${50 + Math.cos(i * 1.2) * 30}%`,
          }}
          animate={{
            scale: [0, 2, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeOut"
          }}
        />
      ))}
    </motion.div>
  );
}

// 결정체 애니메이션 컴포넌트 - Premium Knowledge Capsule
function CrystalAnimation() {
  return (
    <motion.div
      className="relative w-44 h-52 mx-auto"
      initial={{ opacity: 0, scale: 0, rotateY: -90 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      transition={{ duration: 1, ease: "backOut" }}
    >
      {/* 외부 오라 효과 */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-violet-300/30 to-purple-600/30 rounded-full blur-lg"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* 메인 지식 캡슐 (세로 길쭉한 알약 형태) */}
      <motion.div
        className="absolute inset-x-8 inset-y-6 bg-gradient-to-b from-violet-400 to-purple-600 rounded-full shadow-2xl"
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.9, 1, 0.9],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          filter: "drop-shadow(0 10px 40px rgba(139, 69, 219, 0.5))",
        }}
      />
      
      {/* 캡슐 내부 하이라이트 */}
      <motion.div
        className="absolute inset-x-10 inset-y-8 bg-gradient-to-b from-violet-300 to-purple-500 rounded-full opacity-80"
        animate={{
          scale: [0.95, 1, 0.95],
          opacity: [0.6, 0.9, 0.6],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5
        }}
      />
      
      {/* 캡슐 상단 빛 반사 - Enhanced */}
      <motion.div
        className="absolute top-10 left-1/2 transform -translate-x-1/2 w-5 h-10 bg-gradient-to-b from-white to-white/20 rounded-full"
        animate={{
          opacity: [0.6, 1, 0.6],
          scaleY: [0.8, 1, 0.8],
          scaleX: [1, 1.1, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* 지식 파티클들이 캡슐 안으로 흡수되는 효과 - Enhanced */}
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-2 h-2 bg-gradient-to-r from-cyan-400 to-violet-400 rounded-full"
          style={{
            top: '50%',
            left: '50%',
            transformOrigin: '0 0',
          }}
          animate={{
            x: [
              Math.cos((i * 36 * Math.PI) / 180) * 70,
              Math.cos((i * 36 * Math.PI) / 180) * 25,
              0
            ],
            y: [
              Math.sin((i * 36 * Math.PI) / 180) * 70,
              Math.sin((i * 36 * Math.PI) / 180) * 25,
              0
            ],
            scale: [1, 1.5, 0],
            opacity: [0.8, 1, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.25,
            ease: "easeInOut"
          }}
        />
      ))}
      
      {/* 캡슐 내부 활성화 지표 */}
      <motion.div
        className="absolute inset-x-12 inset-y-16 flex items-center justify-center"
        animate={{
          scale: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="w-3 h-3 bg-white rounded-full opacity-90" />
      </motion.div>
      
      {/* AI-Link 연결 표시 - Enhanced */}
      <motion.div
        className="absolute -bottom-4 left-1/2 transform -translate-x-1/2"
        animate={{
          opacity: [0, 1, 0],
          y: [0, -8, 0],
          scale: [0.9, 1, 0.9],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      >
        <div className="text-sm font-bold text-violet-700 bg-gradient-to-r from-white via-violet-50 to-white px-3 py-1.5 rounded-full shadow-xl border border-violet-200">
          AI-Link Ready
        </div>
      </motion.div>
      
      {/* 완성 효과 - 주변 스파클 */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            top: `${20 + Math.sin(i * 1.5) * 60}%`,
            left: `${20 + Math.cos(i * 1.5) * 60}%`,
          }}
          animate={{
            scale: [0, 3, 0],
            opacity: [0, 1, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.6,
            ease: "easeOut"
          }}
        />
      ))}
    </motion.div>
  );
}

// AI 답변 비교 컴포넌트 - 자동 전환 Side-by-Side 방식
function ComparisonSlider() {
  const [currentView, setCurrentView] = useState<'normal' | 'ailink'>('normal');
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  
  const normalLearning = {
    title: "일반 학습",
    response: "학습은 시간을 투자하고 반복하는 것이 중요합니다. 하루에 몇 시간씩 공부하고, 정기적으로 복습하는 것이 효과적입니다. 노트를 작성하고 중요한 내용을 암기하는 전통적인 방법을 사용하세요...",
    color: "from-gray-500 to-gray-700",
    bgColor: "bg-gray-600",
    icon: "📚"
  };
  
  const habitusLearning = {
    title: "Habitus33 학습",
    response: "3분 집중으로 핵심을 추출하고, 4단계 진화로 기억을 강화하세요. 지식 카트로 체계화하고 AI 파트너와 함께 학습하면 시간은 25% 단축되고 기억은 4배 향상됩니다. 당신의 학습 패턴을 분석한 맞춤형 가이드를 제공합니다...",
    color: "from-violet-500 to-purple-700",
    bgColor: "bg-violet-600",
    icon: "⚡"
  };

  // 자동 전환 효과
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentView(prev => prev === 'normal' ? 'ailink' : 'normal');
    }, 3000); // 3초마다 전환

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const handleManualToggle = (view: 'normal' | 'ailink') => {
    setIsAutoPlaying(false);
    setCurrentView(view);
  };
  
  return (
    <motion.div
      className="relative w-full max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* 질문 카드 */}
      <motion.div
        className="bg-slate-800/50 rounded-xl p-4 mb-6 border border-slate-700/50 text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          <span className="text-blue-400 text-sm font-medium">같은 질문, 다른 답변</span>
        </div>
        <p className="text-white text-base font-medium">
          "프로젝트 관리 방식을 개선하고 싶어요. 어떤 방법이 좋을까요?"
        </p>
      </motion.div>

      {/* Side-by-Side 비교 컨테이너 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* 일반 학습 */}
        <motion.div
          className={`relative p-4 rounded-xl border-2 transition-all duration-500 cursor-pointer ${
            currentView === 'normal' 
              ? 'border-gray-400 bg-gray-900/80 shadow-2xl shadow-gray-500/20' 
              : 'border-gray-700/50 bg-gray-900/40'
          }`}
          onClick={() => handleManualToggle('normal')}
          whileHover={{ scale: 1.02 }}
          animate={{
            scale: currentView === 'normal' ? 1.05 : 1,
            opacity: currentView === 'normal' ? 1 : 0.6
          }}
        >
          {/* 헤더 */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-lg">
              {normalLearning.icon}
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">{normalLearning.title}</h3>
              <p className="text-gray-400 text-xs">전통적인 학습 방법</p>
            </div>
          </div>
          
          {/* 답변 내용 */}
          <div className="text-gray-300 text-sm leading-relaxed">
            {normalLearning.response}
          </div>

          {/* 활성 표시 */}
          {currentView === 'normal' && (
            <motion.div
              className="absolute -top-1 -right-1 w-3 h-3 bg-gray-400 rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500 }}
            />
          )}
        </motion.div>

        {/* Habitus33 학습 */}
        <motion.div
          className={`relative p-4 rounded-xl border-2 transition-all duration-500 cursor-pointer ${
            currentView === 'ailink' 
              ? 'border-violet-400 bg-violet-900/80 shadow-2xl shadow-violet-500/20' 
              : 'border-violet-700/50 bg-violet-900/40'
          }`}
          onClick={() => handleManualToggle('ailink')}
          whileHover={{ scale: 1.02 }}
          animate={{
            scale: currentView === 'ailink' ? 1.05 : 1,
            opacity: currentView === 'ailink' ? 1 : 0.6
          }}
        >
          {/* 헤더 */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center text-lg">
              {habitusLearning.icon}
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">{habitusLearning.title}</h3>
              <p className="text-violet-300 text-xs">학습 가속 방법</p>
            </div>
          </div>
          
          {/* 답변 내용 */}
          <div className="text-violet-100 text-sm leading-relaxed">
            {habitusLearning.response}
          </div>

          {/* 활성 표시 */}
          {currentView === 'ailink' && (
            <motion.div
              className="absolute -top-1 -right-1 w-3 h-3 bg-violet-400 rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500 }}
            />
          )}
        </motion.div>
      </div>

      {/* 컨트롤 및 설명 */}
      <div className="text-center">
        {/* 자동재생 컨트롤 */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              isAutoPlaying 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {isAutoPlaying ? '⏸️ 자동 전환 중' : '▶️ 자동 전환 시작'}
          </button>
        </div>

        {/* 차이점 강조 */}
        <motion.div
          className="bg-gradient-to-r from-violet-900/30 to-purple-900/30 rounded-lg p-4 border border-violet-700/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-violet-400 font-semibold text-sm">학습 가속 효과</span>
          </div>
          <p className="text-violet-200 text-xs leading-relaxed">
            Habitus33은 과학적으로 검증된 방법으로 
            <br />
            <strong className="text-violet-300">학습 시간 25% 단축, 기억 보존률 4배 향상</strong>을 달성합니다
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
} 