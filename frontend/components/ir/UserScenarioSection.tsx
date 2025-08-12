'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FiEdit3, FiLink2, FiBook, FiUploadCloud, FiAward, FiChevronRight, FiZap, FiTrendingUp } from 'react-icons/fi';

const LearningImpactChip = ({ text }: { text: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: 0.7, duration: 0.3 }}
    className="ml-3 px-2.5 py-1 text-xs font-semibold text-green-300 bg-green-500/10 border border-green-500/20 rounded-full flex items-center"
  >
    <FiTrendingUp className="mr-1.5 flex-shrink-0" />
    <span>{text}</span>
  </motion.div>
);

interface ScenarioStepProps {
  stepNumber: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  detailedDescription: string;
  learningImpact?: string;
  learningImpactShort?: string;
  delay: number;
  isLast?: boolean;
  isActive: boolean;
  isCompleted: boolean;
  isAutomatic?: boolean;
  onClick: () => void;
  onHover: (isHovered: boolean) => void;
}

const ScenarioStep: React.FC<ScenarioStepProps> = ({ 
  stepNumber, 
  icon, 
  title, 
  description, 
  detailedDescription,
  learningImpact,
  learningImpactShort,
  delay, 
  isLast, 
  isActive,
  isCompleted,
  isAutomatic,
  onClick,
  onHover
}) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const variants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, delay } },
  };

  const cardVariants = {
    idle: { scale: 1, y: 0 },
    hover: { scale: 1.02, y: -2 },
    active: { scale: 1.05, y: -4 }
  };

  const iconVariants = {
    idle: { rotate: 0, scale: 1 },
    hover: { rotate: 5, scale: 1.1 },
    active: { rotate: 10, scale: 1.2 }
  };

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className="relative mb-8"
    >
      {/* Interactive Card */}
      <motion.div
        variants={cardVariants}
        animate={isActive ? 'active' : 'idle'}
        whileHover="hover"
        onClick={onClick}
        onHoverStart={() => onHover(true)}
        onHoverEnd={() => onHover(false)}
        className={`
          relative p-6 rounded-xl cursor-pointer transition-all duration-300
          ${isActive 
            ? isAutomatic
              ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-2 border-indigo-400'
              : 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-2 border-cyan-400' 
            : isAutomatic
              ? 'bg-slate-800/50 border border-slate-600 hover:border-indigo-400/50'
              : 'bg-gray-800/50 border border-gray-600 hover:border-cyan-400/50'
          }
          ${isCompleted ? 'ring-2 ring-green-400/30' : ''}
        `}
      >
        <div className="flex items-center">
          {/* Step Icon and Number */}
          <div className="flex flex-col items-center mr-6 relative">
            <motion.div 
              variants={iconVariants}
              className={`
                p-4 rounded-full shadow-lg mb-2 transition-all duration-300
                ${isActive 
                  ? isAutomatic
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/30'
                    : 'bg-gradient-to-br from-cyan-400 to-blue-500 shadow-cyan-400/30'
                  : isCompleted
                    ? 'bg-gradient-to-br from-green-400 to-emerald-500'
                    : isAutomatic
                      ? 'bg-gradient-to-br from-slate-600 to-slate-700'
                      : 'bg-gradient-to-br from-gray-600 to-gray-700'
                }
              `}
            >
              <div className="text-white">
                {isCompleted ? <FiZap size={24} /> : icon}
              </div>
            </motion.div>
            <motion.div 
              className={`
                text-sm font-bold px-3 py-1 rounded-full transition-all duration-300
                ${isActive 
                  ? isAutomatic
                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                    : 'bg-cyan-500 text-white shadow-lg shadow-cyan-400/30'
                  : isCompleted
                    ? 'bg-green-500 text-white'
                    : 'bg-indigo-600 text-white'
                }
              `}
              animate={isActive ? { scale: [1, 1.1, 1] } : { scale: 1 }}
              transition={{ duration: 2, repeat: isActive ? Infinity : 0 }}
            >
              {stepNumber}
            </motion.div>
          </div>
          
          {/* Step Content */}
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <h3 className={`text-xl font-bold transition-colors duration-300 ${
                  isActive 
                    ? isAutomatic ? 'text-indigo-400' : 'text-cyan-400' 
                    : 'text-white'
                }`}>
                  {title}
                </h3>
                {learningImpactShort && (
                  <LearningImpactChip text={learningImpactShort} />
                )}
              </div>
              <motion.div
                animate={isActive ? { x: [0, 5, 0] } : { x: 0 }}
                transition={{ duration: 1.5, repeat: isActive ? Infinity : 0 }}
              >
                <FiChevronRight className={`
                  transition-colors duration-300 ${
                    isActive 
                      ? isAutomatic ? 'text-indigo-400' : 'text-cyan-400' 
                      : 'text-gray-400'
                  }
                `} />
              </motion.div>
            </div>
            <p className="text-gray-300 leading-relaxed mt-2">
              {description}
            </p>
            
            {/* Progress Bar */}
            <div className="mt-4 h-1 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className={`h-full transition-all duration-500 ${
                  isCompleted ? 'bg-green-400' : isActive ? 'bg-cyan-400' : 'bg-gray-600'
                }`}
                initial={{ width: '0%' }}
                animate={{ 
                  width: isCompleted ? '100%' : isActive ? '70%' : '0%' 
                }}
                transition={{ duration: 0.8, delay: delay }}
              />
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className={`mt-6 pt-6 border-t ${isActive && isAutomatic ? 'border-indigo-400/30' : 'border-cyan-400/30'}`}
            >
              <div className={`${isAutomatic ? 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10' : 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10'} p-4 rounded-lg`}>
                <p className={`${isAutomatic ? 'text-indigo-100' : 'text-cyan-100'} leading-relaxed`}>
                  {detailedDescription}
                </p>
              </div>

              {/* 학습 효과 섹션 추가 */}
              {learningImpact && (
                <div className="mt-4 p-4 rounded-lg bg-green-900/30 border border-green-500/20">
                  <div className="flex items-start">
                    <FiTrendingUp className="text-green-400 mr-3 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-green-300">학습 효과</h4>
                      <p className="text-green-200/80 text-sm leading-relaxed mt-1">
                        {learningImpact}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Connecting Arrow */}
        {!isLast && (
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
            <motion.div
              animate={isCompleted ? { y: [0, -3, 0] } : { y: 0 }}
              transition={{ duration: 1.5, repeat: isCompleted ? Infinity : 0 }}
              className={`
                w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
                ${isCompleted 
                  ? 'bg-green-400 text-black shadow-lg shadow-green-400/30' 
                  : 'bg-gray-600 text-gray-300'
                }
              `}
            >
              <FiChevronRight className="rotate-90" size={16} />
            </motion.div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

const UserScenarioSection = () => {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  
  const sectionVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.2 } },
  };

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const handleStepClick = (stepIndex: number) => {
    if (activeStep === stepIndex) {
      setActiveStep(null);
    } else {
      setActiveStep(stepIndex);
      setCompletedSteps(prev => new Set([...prev, stepIndex]));
    }
  };

  const handleStepHover = (stepIndex: number, isHovered: boolean) => {
    setHoveredStep(isHovered ? stepIndex : null);
  };

  const scenarios = [
    {
      icon: <FiEdit3 size={24} />,
      title: '학습 내용 포착',
      description: '교재, 강의, 노트에서 중요한 개념과 이해 과정을 정확히 포착하여 기록합니다.',
      detailedDescription: '형식에 구애받지 않고 자유롭게 기록할 수 있습니다. 텍스트, 이미지, 링크 등 다양한 형태의 학습 정보를 손쉽게 저장하고, 태그를 통해 분류할 수 있습니다. 모바일과 데스크톱 모든 환경에서 동기화되어 언제든 접근 가능합니다.',
      learningImpact: '학습 효과: 중립. 고품질 학습 맥락의 원재료를 축적하여 향후 학습 가속의 기반을 마련합니다.',
      learningImpactShort: undefined,
      delay: 0,
    },
    {
      icon: <FiLink2 size={24} />,
      title: '개념 연결 및 구조화',
      description: '학습한 내용에 추가적인 생각을 더하고, 기존의 다른 지식이나 경험과 연결점을 찾아 관계를 형성합니다.',
      detailedDescription: 'AI가 자동으로 관련된 학습 내용들을 추천하고, 사용자가 직접 연결고리를 만들 수 있습니다. 지식 간의 맥락이 풍부해지면서 새로운 인사이트가 창발됩니다. 시각적 학습 맵을 통해 연결 관계를 한눈에 파악할 수 있습니다.',
      learningImpact: '학습 효과: 기억 보존률 20% 향상. AI가 관계를 추론하는 과정을 생략시켜 학습 효율을 증대시킵니다.',
      learningImpactShort: '기억 보존률 ▲',
      delay: 0.2,
    },
    {
      icon: <FiBook size={24} />,
      title: '지식캡슐 생성',
      description: '연결된 학습 내용들을 하나의 주제로 모아 정리하고, 새로운 통찰이나 결론을 추가합니다.',
      detailedDescription: '파편화된 학습 내용이 체계적인 지식으로 발전됩니다. 자동 요약 기능과 함께 사용자만의 고유한 관점과 경험을 추가하여 개인화된 학습 베이스를 구축합니다. 다양한 템플릿을 제공하여 효율적인 정리가 가능합니다.',
      learningImpact: '학습 효과: 학습 시간 30% 단축. 명확한 목표를 제시하여, 학습의 장황하고 관련 없는 내용 생성을 원천 차단합니다.',
      learningImpactShort: '학습 시간 ▼',
      delay: 0.4,
    },
    {
      icon: <FiUploadCloud size={24} />,
      title: 'AI-Link 생성 & 전송',
      description: '완성된 학습 구조를 바탕으로 AI-Link 지식캡슐이 자동 생성됩니다.',
      detailedDescription: '당신의 학습 DNA가 AI가 이해할 수 있는 시간진화형 온톨로지 형태의 지식캡슐로 변환되어 전송됩니다. 개인의 학습 패턴, 선호도, 전문 영역을 모두 포함한 맥락이 지식캡슐로 압축되어 AI에게 전달됩니다. 보안이 철저히 보장되는 암호화된 채널을 통해 안전하게 전송됩니다.',
      learningImpact: '학습 효과: 정보 습득 속도 50% 향상. 분산된 학습 과정을 단일 트랜잭션으로 압축하여 학습 효율을 최대화합니다.',
      learningImpactShort: '습득 속도 ▲▲',
      delay: 0.6,
      isAutomatic: true,
    },
    {
      icon: <FiAward size={24} />,
      title: '개인화된 학습 가속',
      description: 'AI-Link를 받은 AI는 당신의 학습 맥락을 완벽히 이해한 상태에서 개인화된 학습 가속을 제공합니다.',
      detailedDescription: '더 이상 일반적인 학습이 아닌, 당신만을 위한 맞춤형 학습 경험을 제공합니다. 당신의 학습 수준, 관심사, 학습 맥락을 모두 고려한 맞춤형 학습 가속이 제공됩니다. 지속적인 학습을 통해 학습 효율이 계속 향상됩니다.',
      learningImpact: '학습 효과: 총 학습 효율성 55% 향상. 최소한의 시간으로 최대의 학습 효과를 창출하며, 학습의 ROI를 극대화합니다.',
      learningImpactShort: '총 효율성 ▲▲▲',
      delay: 0.8,
      isAutomatic: true,
    },
  ];

  return (
    <section id="user-scenario" className="py-20 sm:py-32 bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 to-black z-0"></div>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-0">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-cyan-400/20 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + i * 10}%`,
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          ref={ref}
          variants={sectionVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="text-center mb-16"
        >
          <motion.h2 variants={textVariants} className="text-4xl sm:text-5xl font-bold tracking-tight">
            이렇게 사용합니다 <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">5단계</span>
          </motion.h2>
          <motion.p variants={textVariants} className="mt-6 text-lg text-gray-300 max-w-3xl mx-auto">
            메모 1줄 → 최소 입력 → 저장 즉시 유사 사례 3개 → 비교·점프 → 체크리스트 보완.
          </motion.p>
          <motion.p variants={textVariants} className="mt-4 text-sm text-cyan-400 font-medium">
            💡 각 단계를 클릭하여 상세 정보를 확인하세요
          </motion.p>
        </motion.div>

        <motion.div 
          variants={sectionVariants} 
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="max-w-4xl mx-auto"
        >
          {scenarios.map((scenario, index) => (
            <ScenarioStep 
              key={index} 
              stepNumber={index + 1}
              icon={scenario.icon}
              title={scenario.title}
              description={scenario.description}
              detailedDescription={scenario.detailedDescription}
              learningImpact={scenario.learningImpact}
              learningImpactShort={scenario.learningImpactShort}
              delay={scenario.delay}
              isLast={index === scenarios.length - 1}
              isActive={activeStep === index}
              isCompleted={completedSteps.has(index)}
              isAutomatic={scenario.isAutomatic}
              onClick={() => handleStepClick(index)}
              onHover={(isHovered) => handleStepHover(index, isHovered)}
            />
          ))}
        </motion.div>

        {/* Progress Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center space-x-4 bg-gray-800/50 px-6 py-3 rounded-full border border-gray-600">
            <span className="text-gray-300">진행률:</span>
            <div className="flex space-x-1">
              {scenarios.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    completedSteps.has(index) 
                      ? 'bg-green-400 shadow-lg shadow-green-400/30' 
                      : activeStep === index
                        ? 'bg-cyan-400 shadow-lg shadow-cyan-400/30'
                        : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
            <span className="text-cyan-400 font-semibold">
              {completedSteps.size}/{scenarios.length}
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default UserScenarioSection; 