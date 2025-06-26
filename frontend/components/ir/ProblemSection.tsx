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
      title: '오류 잠재 보고서',
      value: '47',
      unit: '%',
      source: '기업 AI 사용자가 잘못된 AI 정보로 중요 결정을 내린 비율 (McKinsey 2025)',
      delay: 0,
    },
    {
      icon: <FiClock size={24} />,
      title: '가짜 논문 참조 답변',
      value: '83',
      unit: '%',
      source: '법률 전문가가 AI 사용 시 가짜 판례법을 접한 경험 (Harvard Law 2024)',
      delay: 0.2,
    },
    {
      icon: <FiBarChart2 size={24} />,
      title: '초점읽은 학습 조언',
      value: '64',
      unit: '%',
      source: '교육기관이 AI 안전성 우려로 도입을 지연한 비율 (HIMSS 2025)',
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
            기대와 다른 현재 : <span className="text-indigo-400">맥락없는 AI 결과물</span>
          </motion.h2>
          <motion.p variants={textVariants} className="mt-6 text-lg text-gray-300 max-w-3xl mx-auto">
            알아서 대신 해주길 바라지만, 아직 그 기대에 미치지 못합니다.
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
          className="text-center mt-20"
        >
          <h3 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            문제는 <span className="text-red-400">"도메인 컨텍스트 부족"</span>
          </h3>
          <p className="text-lg text-gray-300 max-w-4xl mx-auto leading-relaxed">
            AI가 사용자의 고유한 지식과 경험, 즉 <span className="font-semibold text-indigo-400">'도메인 컨텍스트'</span>가 없어, 
            무작위로 생성하는 현상입니다.
          </p>
          <p className="mt-4 text-base text-gray-400 max-w-3xl mx-auto">
            이는 AI와 인간 사이의 <span className="font-medium text-white">소통의 문제</span>입니다.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default ProblemSection; 