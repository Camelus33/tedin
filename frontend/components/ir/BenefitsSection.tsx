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
      metric: '학습 시간 단축',
      description: '인지과학 기반 학습 가속으로 학습 효율을 획기적으로 향상시킵니다.',
      before: '3시간',
      after: '1.5시간',
      improvement: '▲ 50%',
      isPositive: true,
    },
    {
      metric: '기억 보존률',
      description: '시간진화형 온톨로지로 장기 기억 전환을 보장합니다.',
      before: '30%',
      after: '70%',
      improvement: '▲ 133%',
      isPositive: true,
    },
    {
      metric: '정보 습득 속도',
      description: 'AI-Link를 통한 맥락추론으로 새로운 정보 습득 속도를 향상시킵니다.',
      before: '40% 느림',
      after: '20% 빠름',
      improvement: '▲ 150%',
      isPositive: true,
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
            학습 효율성, <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">데이터로 증명된 개선 효과</span>
          </motion.h2>
          <motion.p variants={itemVariants} className="mt-6 text-lg text-gray-300 max-w-3xl mx-auto">
            AI-Link는 성인 학습자의 인지적 한계를 극복하고, 학습 시간을 획기적으로 단축하면서도 기억 보존률을 크게 향상시키는 가장 확실한 방법입니다.
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
            <div>Traditional Learning</div>
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
                  <div className="md:hidden text-left text-sm text-gray-400">Traditional Learning</div>
                  <ComparisonValue value={data.before} isPositive={false} />

                  {/* After */}
                  <div className="md:hidden text-left text-sm text-cyan-300">With AI-Link</div>
                  <ComparisonValue value={data.after} isPositive={true} />
                  
                  {/* Improvement */}
                  <div className="md:hidden text-left text-sm text-green-400">개선 효과</div>
                  <ImprovementChip value={data.improvement} isPositive={true} />
                  
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