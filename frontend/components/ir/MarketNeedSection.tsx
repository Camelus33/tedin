'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FiBriefcase, FiBookOpen, FiUsers } from 'react-icons/fi';

interface NeedCardProps {
  icon: React.ReactNode;
  userType: string;
  need: string;
  description: string;
  delay: number;
}

const NeedCard: React.FC<NeedCardProps> = ({ icon, userType, need, description, delay }) => {
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
      className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-lg text-center"
    >
      <div className="flex justify-center text-indigo-300 mb-6">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-white mb-4">{userType}</h3>
      <div className="text-center">
        <p className="text-lg font-semibold text-cyan-400 mb-4">필요: {need}</p>
        <p className="text-sm text-gray-300 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
};

const MarketNeedSection = () => {
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

  const needs = [
    {
      icon: <FiBriefcase size={48} />,
      userType: '직장인',
      need: 'AI 비서',
      description: '업무 보고서 작성, 데이터 분석, 프레젠테이션 자료 준비 등 일상 업무를 효율적으로 처리할 수 있는 개인화된 AI 어시스턴트가 필요합니다.',
      delay: 0,
    },
    {
      icon: <FiBookOpen size={48} />,
      userType: '연구자',
      need: 'AI 조교',
      description: '논문 리뷰, 연구 동향 분석, 실험 데이터 해석 등 연구 활동 전반을 지원하며 전문 지식을 바탕으로 통찰을 제공하는 AI가 필요합니다.',
      delay: 0.2,
    },
    {
      icon: <FiUsers size={48} />,
      userType: '학습자',
      need: 'AI 튜터',
      description: '개인의 학습 수준과 목표에 맞춘 맞춤형 학습 계획 수립, 개념 설명, 문제 해결 가이드를 제공하는 개인화된 AI 튜터가 필요합니다.',
      delay: 0.4,
    },
  ];

  return (
    <section id="market-need" className="py-20 sm:py-32 bg-gray-900 text-white relative overflow-hidden">
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
            고객이 원하는 건, <span className="text-indigo-400">나를 아는 AI Agent</span>
          </motion.h2>
          <motion.p variants={textVariants} className="mt-6 text-lg text-gray-300 max-w-3xl mx-auto">
            각기 다른 3가지 고객들 모두가 '나의 이력'을 알고 있는 AI를 원합니다.
          </motion.p>
        </motion.div>

        <motion.div 
          variants={sectionVariants} 
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          {needs.map((need, index) => (
            <NeedCard key={index} {...need} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default MarketNeedSection; 