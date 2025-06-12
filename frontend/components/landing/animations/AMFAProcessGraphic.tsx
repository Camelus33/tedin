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
}

const amfaSteps: AMFAStep[] = [
  {
    id: 'atomic',
    title: 'Atomic Reading',
    subtitle: '3분 11페이지',
    description: '작은 시작의 마법을 경험하세요. 부담 없는 분량으로 독서의 즐거움을 되찾습니다.',
    icon: BookOpen,
    color: 'text-cyan-400',
    gradient: 'from-cyan-500/20 to-cyan-600/20'
  },
  {
    id: 'memo',
    title: 'Memo Evolve',
    subtitle: '생각의 진화',
    description: '5단계 메모 시스템으로 단순한 기록을 깊은 통찰로 발전시킵니다.',
    icon: Edit3,
    color: 'text-blue-400',
    gradient: 'from-blue-500/20 to-cyan-500/20'
  },
  {
    id: 'furnace',
    title: 'Furnace Knowledge',
    subtitle: '지식 단련소',
    description: '개인화된 학습 공간에서 지식을 체계적으로 단련하고 내재화합니다.',
    icon: Zap,
    color: 'text-purple-400',
    gradient: 'from-purple-500/20 to-blue-500/20'
  },
  {
    id: 'link',
    title: 'AI Link',
    subtitle: '지능적 연결',
    description: 'AI와 함께 지식을 연결하고 확장하여 새로운 통찰을 발견합니다.',
    icon: Link,
    color: 'text-violet-400',
    gradient: 'from-violet-500/20 to-purple-500/20'
  }
];

export default function AMFAProcessGraphic() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const controls = useAnimation();
  const [activeStep, setActiveStep] = useState<number>(0);

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % amfaSteps.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

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

  const connectionVariants = {
    hidden: { 
      pathLength: 0,
      opacity: 0
    },
    visible: { 
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 1.5, ease: "easeInOut" },
        opacity: { duration: 0.5 }
      }
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-6xl mx-auto py-16">
      {/* Background Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-violet-500/5 rounded-3xl blur-3xl"></div>
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={controls}
        className="relative z-10"
      >
        {/* Main Title */}
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

        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <div className="relative">
            {/* Connection Lines */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none" 
              style={{ zIndex: 1 }}
            >
              <defs>
                <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.6" />
                  <stop offset="33%" stopColor="#3b82f6" stopOpacity="0.6" />
                  <stop offset="66%" stopColor="#8b5cf6" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0.6" />
                </linearGradient>
              </defs>
              
              {/* Horizontal connection line */}
              <motion.path
                d="M 200 150 Q 400 100 600 150 Q 800 200 1000 150"
                stroke="url(#connectionGradient)"
                strokeWidth="3"
                fill="none"
                variants={connectionVariants}
                style={{ filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.3))' }}
              />
              
              {/* Animated particles along the path */}
              <motion.circle
                r="4"
                fill="#06b6d4"
                style={{ 
                  filter: 'drop-shadow(0 0 6px #06b6d4)',
                  offsetPath: "path('M 200 150 Q 400 100 600 150 Q 800 200 1000 150')"
                }}
                animate={{
                  offsetDistance: ["0%", "100%"]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            </svg>

            {/* Steps Grid */}
            <div className="grid grid-cols-4 gap-8 relative z-10">
              {amfaSteps.map((step, index) => (
                <motion.div
                  key={step.id}
                  variants={stepVariants}
                  className="relative group"
                  onHoverStart={() => setActiveStep(index)}
                >
                  {/* Step Card */}
                  <div className={`
                    relative p-8 rounded-2xl border-2 transition-all duration-500 cursor-pointer
                    ${activeStep === index 
                      ? 'border-cyan-400 bg-gradient-to-br from-gray-900/50 to-gray-800/50 shadow-2xl shadow-cyan-500/20' 
                      : 'border-gray-700 bg-gray-900/30 hover:border-gray-600'
                    }
                  `}>
                    {/* Background Glow */}
                    {activeStep === index && (
                      <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient} rounded-2xl blur-xl opacity-50`}></div>
                    )}
                    
                    {/* Content */}
                    <div className="relative z-10 text-center">
                      {/* Icon */}
                      <div className={`
                        inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 transition-all duration-500
                        ${activeStep === index 
                          ? 'bg-gradient-to-r from-cyan-500 to-purple-500 shadow-lg shadow-cyan-500/30' 
                          : 'bg-gray-800 border border-gray-600'
                        }
                      `}>
                        <step.icon className={`w-8 h-8 ${activeStep === index ? 'text-white' : step.color}`} />
                      </div>
                      
                      {/* Title */}
                      <h3 className={`text-xl font-bold mb-2 transition-colors duration-300 ${
                        activeStep === index ? 'text-cyan-400' : 'text-gray-300'
                      }`}>
                        {step.title}
                      </h3>
                      
                      {/* Subtitle */}
                      <p className={`text-sm font-medium mb-4 transition-colors duration-300 ${
                        activeStep === index ? 'text-purple-400' : 'text-gray-500'
                      }`}>
                        {step.subtitle}
                      </p>
                      
                      {/* Description */}
                      <p className={`text-sm leading-relaxed transition-colors duration-300 ${
                        activeStep === index ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {step.description}
                      </p>
                    </div>

                    {/* Step Number */}
                    <div className={`
                      absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
                      ${activeStep === index 
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg' 
                        : 'bg-gray-700 text-gray-400'
                      }
                    `}>
                      {index + 1}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden space-y-6">
          {amfaSteps.map((step, index) => (
            <motion.div
              key={step.id}
              variants={stepVariants}
              className="relative"
            >
              <div className="flex items-start space-x-4 p-6 rounded-xl bg-gray-900/30 border border-gray-700">
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center">
                    <step.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-cyan-400 mb-1">{step.title}</h3>
                  <p className="text-sm text-purple-400 mb-2">{step.subtitle}</p>
                  <p className="text-sm text-gray-400 leading-relaxed">{step.description}</p>
                </div>
                
                {/* Step Number */}
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                  {index + 1}
                </div>
              </div>
              
              {/* Connection Arrow */}
              {index < amfaSteps.length - 1 && (
                <div className="flex justify-center py-2">
                  <ArrowRight className="w-5 h-5 text-gray-600" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
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