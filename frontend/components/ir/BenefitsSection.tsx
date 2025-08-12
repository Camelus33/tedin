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
      metric: '반복 재발률',
      description: '동일 주제/유형의 재발 비율(4주 코호트 전후 비교).',
      before: '도입 전',
      after: '도입 후',
      improvement: '감소 지향',
      isPositive: true,
    },
    {
      metric: '알림→행동 전환율',
      description: '알림 클릭, 카드 이동, 체크리스트 수정의 단계 전환율.',
      before: '베이스라인',
      after: '개선 상태',
      improvement: '증가 지향',
      isPositive: true,
    },
    {
      metric: '리워크율/대응 시간',
      description: '재작업 비율과 원인 교정까지 걸린 평균 시간.',
      before: '도입 전',
      after: '도입 후',
      improvement: '감소 지향',
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
            반복 실수 감축, <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">실제 지표로 확인합니다</span>
          </motion.h2>
          <motion.p variants={itemVariants} className="mt-6 text-lg text-gray-300 max-w-3xl mx-auto">
            저장 즉시 유사 사례 3가지를 제시해 빠른 비교·교정을 돕습니다. 아래 지표는 도입 전후 실제 측정·공개합니다.
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
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              참고: 
              <a href="https://asana.com/resources/anatomy-of-work" target="_blank" rel="noreferrer" className="underline hover:text-gray-300">Asana Anatomy of Work</a>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BenefitsSection; 