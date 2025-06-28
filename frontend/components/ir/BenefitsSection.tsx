'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FiArrowDown, FiTrendingDown, FiTrendingUp, FiCheckCircle } from 'react-icons/fi';

const ComparisonValue = ({ value, isPositive = false }: { value: string | number; isPositive?: boolean }) => (
  <div
    className={`text-2xl sm:text-3xl font-bold py-2 px-4 rounded-lg ${
      isPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
    }`}
  >
    {value}
  </div>
);

const ImprovementChip = ({ value, isPositive = true }: { value: string; isPositive?: boolean }) => (
  <div
    className={`flex items-center justify-center font-bold py-2 px-4 rounded-full text-white ${
      isPositive ? 'bg-green-600' : 'bg-red-600'
    }`}
  >
    {isPositive ? <FiTrendingUp className="mr-2" /> : <FiTrendingDown className="mr-2" />}
    {value}
  </div>
);

const BenefitsSection = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const sectionVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };
  
  const comparisonData = [
    {
      metric: 'API 호출 횟수',
      description: 'AI와 불필요한 대화를 줄여 핵심 결과에 빠르게 도달합니다.',
      before: '60회',
      after: '20회',
      improvement: '▼ 67%',
      isPositive: false,
    },
    {
      metric: '출력 토큰 사용량',
      description: '정확한 컨텍스트 제공으로 불필요하고 값비싼 출력을 방지합니다.',
      before: '66,000 토큰',
      after: '24,000 토큰',
      improvement: '▼ 64%',
      isPositive: false,
    },
    {
      metric: '예상 월간 비용 (1인)',
      description: 'AI 운영의 ROI를 극대화하여 지속가능한 스케일을 확보합니다.',
      before: '$0.29',
      after: '$0.13',
      improvement: '▼ 55%',
      isPositive: false,
    },
  ];

  return (
    <section id="benefits" className="py-20 sm:py-32 bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/[0.03] z-0"></div>
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          ref={ref}
          variants={sectionVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="text-center mb-16"
        >
          <motion.h2 variants={itemVariants} className="text-4xl sm:text-5xl font-bold tracking-tight">
            AI 운영 비용, <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">데이터로 증명된 절감 효과</span>
          </motion.h2>
          <motion.p variants={itemVariants} className="mt-6 text-lg text-gray-300 max-w-3xl mx-auto">
            AI-Link는 AI와의 불필요한 상호작용과 값비싼 출력 토큰을 획기적으로 줄여, AI 운영 ROI를 극대화하는 가장 확실한 방법입니다.
          </motion.p>
        </motion.div>

        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="max-w-5xl mx-auto"
        >
          {/* Table Header */}
          <motion.div variants={itemVariants} className="hidden md:grid grid-cols-4 gap-4 items-center text-center font-semibold text-gray-400 mb-4 px-4">
            <div>지표</div>
            <div>Traditional AI</div>
            <div className="text-cyan-300">With AI-Link</div>
            <div className="text-green-400">개선 효과</div>
          </motion.div>
          
          {/* Comparison Cards */}
          <div className="space-y-6">
            {comparisonData.map((data, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 transition-all duration-300 hover:border-cyan-400/50"
              >
                <div className="grid md:grid-cols-4 gap-6 items-center text-center">
                  {/* Metric */}
                  <div className="text-left md:text-center">
                    <h3 className="text-lg font-bold text-white">{data.metric}</h3>
                    <p className="text-sm text-gray-400 mt-1 hidden md:block">{data.description}</p>
                  </div>
                  
                  {/* Before */}
                  <div className="md:hidden text-left text-sm text-gray-400">Traditional AI</div>
                  <ComparisonValue value={data.before} isPositive={false} />

                  {/* After */}
                  <div className="md:hidden text-left text-sm text-cyan-300">With AI-Link</div>
                  <ComparisonValue value={data.after} isPositive={true} />
                  
                  {/* Improvement */}
                  <div className="md:hidden text-left text-sm text-green-400">개선 효과</div>
                  <ImprovementChip value={data.improvement} isPositive={false} />
                  
                   <p className="text-sm text-gray-400 mt-2 md:hidden col-span-2 text-left">{data.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BenefitsSection; 