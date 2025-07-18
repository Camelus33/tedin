'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FiEdit3, FiLink2, FiBook, FiUploadCloud, FiAward, FiChevronRight, FiZap, FiTrendingDown, FiFileText, FiCheckSquare } from 'react-icons/fi';

const CostImpactChip = ({ text }: { text: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: 0.7, duration: 0.3 }}
    className="ml-3 px-2.5 py-1 text-xs font-semibold text-green-300 bg-green-500/10 border border-green-500/20 rounded-full flex items-center"
  >
    <FiTrendingDown className="mr-1.5 flex-shrink-0" />
    <span>{text}</span>
  </motion.div>
);

interface ScenarioStepProps {
  stepNumber: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  detailedDescription: string;
  costImpact?: string;
  costImpactShort?: string;
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
  costImpact,
  costImpactShort,
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
                {costImpactShort && (
                  <CostImpactChip text={costImpactShort} />
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
              className="mt-6 pt-6 border-t border-gray-600"
            >
              <div className="bg-gray-800/30 rounded-lg p-4 mb-4">
                <h4 className="text-lg font-semibold text-white mb-3">상세 과정</h4>
                <p className="text-gray-300 leading-relaxed text-sm">
                  {detailedDescription}
                </p>
              </div>
              
              {costImpact && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-green-400 mb-2">투자 진단 효과</h4>
                  <p className="text-green-300 text-sm leading-relaxed">
                    {costImpact}
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
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
      icon: <FiFileText size={24} />,
      title: '투자 자료 등록 & 메모 생성',
      description: '증권분석 보고서 PDF를 등록하고 밑줄쳐서 곧바로 메모카드를 생성합니다.',
      detailedDescription: '증권사 리포트, 기업 공시자료, 뉴스 기사 등 다양한 투자 자료를 PDF로 업로드하면 AI가 자동으로 핵심 내용을 추출하여 메모카드로 변환합니다. 밑줄 친 부분은 투자자의 관심사와 판단 근거로 인식되어 더욱 정확한 분석이 가능합니다. 투자일지도 함께 등록하여 개인적인 투자 이력과 감정 상태까지 기록됩니다.',
      costImpact: '투자 진단 효과: 투자 자료의 체계적 수집으로 편향 패턴 분석의 기반을 마련합니다.',
      costImpactShort: '편향 패턴 분석',
      delay: 0,
    },
    {
      icon: <FiEdit3 size={24} />,
      title: '투자 맥락 기록 & 진화',
      description: '메모카드에 인라인 쓰레드, 메모진화 4단계, 지식연결을 통해 투자시점의 여러 사용자 맥락을 기록합니다.',
      detailedDescription: '각 투자 메모카드에는 투자 시점의 감정 상태, 판단 근거, 시장 상황 등이 인라인 쓰레드로 기록됩니다. 메모진화 4단계(Atomic Reading → Memo Evolution → Focused Note → AI-Link)를 거치면서 투자자의 사고 과정이 체계화됩니다. 지식연결을 통해 과거 투자 경험과 현재 판단이 연결되어 패턴 분석이 가능해집니다.',
      costImpact: '투자 진단 효과: 투자자의 사고 과정과 편향 패턴이 명확히 드러나 반복 실수 진단의 정확도가 향상됩니다.',
      costImpactShort: '편향 패턴 드러남',
      delay: 0.2,
    },
    {
      icon: <FiLink2 size={24} />,
      title: '지식카트 선별 & 단권화',
      description: '필요한 메모카드만 선별해서 지식카트에 담아 단권화 노트에 추가적인 생각을 보탭니다.',
      detailedDescription: '분산된 투자 메모들 중 특정 종목이나 투자 테마와 관련된 카드들만 선별하여 지식카트에 담습니다. 단권화 노트에서는 선별된 메모들을 종합하여 투자 판단의 근거와 과정을 체계적으로 정리합니다. 추가적인 생각과 분석을 보탬으로써 투자자의 사고 과정이 더욱 명확해집니다.',
      costImpact: '투자 진단 효과: 투자 판단의 논리적 일관성과 편향 여부를 체계적으로 분석할 수 있는 기반이 마련됩니다.',
      costImpactShort: '논리 일관성 분석',
      delay: 0.4,
    },
    {
      icon: <FiUploadCloud size={24} />,
      title: 'AI-Link 생성 & 투자 맥락 전송',
      description: '완성된 투자 지식을 바탕으로 AI-Link가 자동 생성되어 투자자의 맥락이 LLM에 전송됩니다.',
      detailedDescription: '투자자의 모든 메모, 판단 과정, 감정 상태, 과거 경험이 온톨로지 형태로 구조화되어 AI-Link로 압축됩니다. 이 과정에서 투자자의 편향 패턴, 반복 실수, 투자 스타일이 모두 포함됩니다. 암호화된 채널을 통해 안전하게 LLM에 전송되어 투자 진단의 기반이 됩니다.',
      costImpact: '투자 진단 효과: 투자자의 모든 맥락이 AI에게 전달되어 정확한 편향 진단이 가능해집니다.',
      costImpactShort: '정확한 편향 진단',
      delay: 0.6,
      isAutomatic: true,
    },
    {
      icon: <FiAward size={24} />,
      title: '투자 편향 & 맹점 진단',
      description: 'LLM에 "내가 OO에 투자할려고 학습한 내용이다. 나의 투자 정보의 편향과 맹점을 진단해."를 입력하여 AI가 투자자의 허점을 분석합니다.',
      detailedDescription: 'AI-Link를 받은 LLM은 투자자의 모든 맥락을 이해한 상태에서 "내가 OO에 투자할려고 학습한 내용이다. 나의 투자 정보의 편향과 맹점을 진단해."라는 질문에 대해 개인화된 답변을 제공합니다. 확증편향, 손실회피, 앵커링 등 투자자의 편향과 반복 실수 패턴을 정확히 진단하고, 구체적인 개선 방안을 제시합니다.',
      costImpact: '투자 진단 효과: 투자자의 반복 실수와 편향을 정확히 진단하여 투자 성과 향상의 기반을 마련합니다.',
      costImpactShort: '실수 패턴 진단',
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
            투자 실수 진단 <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">5단계</span>
          </motion.h2>
          <motion.p variants={textVariants} className="mt-6 text-lg text-gray-300 max-w-3xl mx-auto">
            투자 메모가 온톨로지 AI로 진화하여 반복 실수를 자동 진단합니다.
            <br className="hidden sm:block" />
            <span className="text-base text-gray-400">
              (앞 3단계는 <span className="text-cyan-400 font-semibold">투자자 액션</span>, 뒤 2단계는 <span className="text-indigo-400 font-semibold">AI 자동 진단</span> 단계입니다.)
            </span>
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
              costImpact={scenario.costImpact}
              costImpactShort={scenario.costImpactShort}
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