'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FiAlertTriangle, FiBarChart2, FiClock } from 'react-icons/fi';
import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  unit: string;
  source: string;
  delay: number;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, unit, source, delay }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay } },
  };

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg"
    >
      <div className="flex items-center text-indigo-300 mb-4">
        {icon}
        <h3 className="ml-3 text-lg font-semibold text-white">{title}</h3>
      </div>
      <div className="text-center">
        <p className="text-6xl font-bold text-white mb-2">
          {value}
          <span className="text-4xl font-medium ml-2">{unit}</span>
        </p>
        <p className="text-xs text-gray-400">{source}</p>
      </div>
    </motion.div>
  );
};

const ProblemSection = () => {
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

  const stats = [
    {
      icon: <FiBarChart2 size={24} />,
      title: '생산성 요구',
      value: '53',
      unit: '%',
      source: '리더들은 더 높은 생산성을 요구하지만,',
      delay: 0,
    },
    {
      icon: <FiClock size={24} />,
      title: '에너지 고갈',
      value: '80',
      unit: '%',
      source: '직원들은 시간과 에너지 부족을 호소합니다.',
      delay: 0.2,
    },
    {
      icon: <FiAlertTriangle size={24} />,
      title: '컨텍스트 붕괴',
      value: '275',
      unit: '회',
      source: '하루 평균 업무 중단 횟수. 2분마다 맥락이 끊깁니다.',
      delay: 0.4,
    },
  ];

  return (
    <section id="problem" className="py-20 sm:py-32 bg-gray-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/[0.05] z-0"></div>
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          ref={ref}
          variants={sectionVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="text-center mb-16"
        >
          <motion.h2 variants={textVariants} className="text-4xl sm:text-5xl font-bold tracking-tight">
            프롬프트 번아웃 : <span className="text-indigo-400">컨텍스트 붕괴</span>
          </motion.h2>
          <motion.p variants={textVariants} className="mt-6 text-lg text-gray-300 max-w-3xl mx-auto">
            AI는 대단한 혁신을 가져왔지만, 지식 근로자의 현실은 번아웃입니다. 고품질 답변에는 더 많은 도메인 컨텍스트가 필요합니다.
          </motion.p>
        </motion.div>

        <motion.div 
          variants={sectionVariants} 
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
        >
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </motion.div>

        <motion.div 
          variants={textVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="text-center mt-16"
        >
          <p className="text-xl text-gray-200 max-w-3xl mx-auto">
             <span className="font-bold text-indigo-400">'도메인 컨텍스트'</span>, 바로 여기에 <br/>진정한 투자 기회가 <span className="font-bold text-white">열리고</span> 있습니다. 
          </p>
          <p className="mt-4 text-sm text-gray-500">
            출처: Microsoft Work Trend Index 2025
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default ProblemSection; 