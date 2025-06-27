'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FiCheckCircle, FiBriefcase, FiBookOpen, FiUsers } from 'react-icons/fi';

interface BenefitCardProps {
  icon: React.ReactNode;
  userType: string;
  benefit: string;
  description: string;
  features: string[];
  delay: number;
}

const BenefitCard: React.FC<BenefitCardProps> = ({ icon, userType, benefit, description, features, delay }) => {
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
      className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-xl text-center hover:border-cyan-400/30 transition-all duration-300"
    >
      <div className="flex justify-center text-cyan-400 mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{userType}</h3>
      <div className="text-center mb-6">
        <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-4">
          "{benefit}"
        </p>
        <p className="text-sm text-gray-300 leading-relaxed">{description}</p>
      </div>
      
      {/* Features List */}
      <div className="space-y-3">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start text-left">
            <FiCheckCircle className="text-green-400 mr-3 mt-1 flex-shrink-0" size={16} />
            <span className="text-gray-300 text-sm">{feature}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const BenefitsSection = () => {
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

  const benefits = [
    {
      icon: <FiBriefcase size={48} />,
      userType: '직장인',
      benefit: 'Well-Made Report',
      description: '당신의 전문성과 경험이 반영된 완성도 높은 업무 보고서를 생성합니다.',
      features: [
        '개인의 업무 히스토리와 전문 지식 반영',
        '회사 내 맥락과 업계 트렌드 고려',
        '신뢰할 수 있는 데이터 기반 분석',
        '상사와 동료가 인정하는 품질'
      ],
      delay: 0,
    },
    {
      icon: <FiBookOpen size={48} />,
      userType: '연구자',
      benefit: 'Good Research Paper',
      description: '연구 분야의 깊이 있는 이해를 바탕으로 한 고품질 연구 논문을 작성합니다.',
      features: [
        '연구자의 전문 분야와 관심사 반영',
        '기존 연구와의 연관성 및 차별점 명확화',
        '논리적 구조와 학술적 엄밀성 확보',
        '동료 연구자들이 인정하는 수준'
      ],
      delay: 0.2,
    },
    {
      icon: <FiUsers size={48} />,
      userType: '학습자',
      benefit: 'Pin-point Lesson',
      description: '개인의 학습 수준과 목표에 정확히 맞춘 맞춤형 학습 가이드를 제공합니다.',
      features: [
        '개인의 학습 히스토리와 이해도 분석',
        '취약점과 강점을 고려한 학습 계획',
        '구체적이고 실행 가능한 학습 방법 제시',
        '효과적인 성취감과 동기부여 제공'
      ],
      delay: 0.4,
    },
  ];

  return (
    <section id="benefits" className="py-20 sm:py-32 bg-gradient-to-b from-gray-900 to-black text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/[0.03] z-0"></div>
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          ref={ref}
          variants={sectionVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="text-center mb-16"
        >
          <motion.h2 variants={textVariants} className="text-4xl sm:text-5xl font-bold tracking-tight">
            기대 효과 : <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">이력반영 답변유도</span>
          </motion.h2>
          <motion.p variants={textVariants} className="mt-6 text-lg text-gray-300 max-w-3xl mx-auto">
            AI-Link를 입력하면 각 고객들은 원하는 고품질 결과물을 얻습니다
          </motion.p>
        </motion.div>

        <motion.div 
          variants={sectionVariants} 
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto"
        >
          {benefits.map((benefit, index) => (
            <BenefitCard key={index} {...benefit} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default BenefitsSection; 