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
      icon: <FiAlertTriangle size={24} />,
      title: '거짓 출처 범람',
      value: '68',
      unit: '%',
      source: 'AI 생성 보고서 중 검증되지 않은 출처 비율',
      delay: 0,
    },
    {
      icon: <FiClock size={24} />,
      title: '사실 확인 피로',
      value: '4.2',
      unit: '시간',
      source: '하루 평균 출처 확인에 소모되는 시간',
      delay: 0.2,
    },
    {
      icon: <FiBarChart2 size={24} />,
      title: '신뢰도 하락',
      value: '73',
      unit: '%',
      source: 'AI 보고서에 대한 전문가들의 불신 증가율',
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
            AI 생성 신뢰성 위기: <span className="text-indigo-400">어딘가에 도사리는 오류</span>
          </motion.h2>
          <motion.p variants={textVariants} className="mt-6 text-lg text-gray-300 max-w-3xl mx-auto">
            모두가 쓰는 AI글, 점점 똑똑하게 거짓 생성하는 AI, 검증 절차강화 필요성 대두
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
             간단한 해결책은 <span className="font-bold text-indigo-400">없을까요?</span> <br/>누구나<span className="font-bold text-white"> 인정하는 </span>방법말입니다. 
          </p>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
            간간히 오류 섞인 AI 보고서로, 자신의 전문성을 의심받지 마세요. <br/>
            <span className="font-medium text-white">도메인 전문성은 언제나 검증 가능합니다.</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default ProblemSection; 