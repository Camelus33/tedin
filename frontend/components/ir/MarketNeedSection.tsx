'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FiTrendingUp, FiHelpCircle, FiBarChart2 } from 'react-icons/fi';

interface FactCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
  source: string;
  delay: number;
}

const FactCard: React.FC<FactCardProps> = ({ icon, title, value, description, source, delay }) => {
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
      className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-8 border border-slate-700 shadow-lg text-left transform transition-all duration-300 hover:-translate-y-2 hover:border-indigo-400/50"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-slate-700/50 rounded-lg">
          {icon}
        </div>
        <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
          {value}
        </p>
      </div>
      <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
      <p className="text-sm text-slate-300 leading-relaxed mb-4">{description}</p>
      <p className="text-xs text-slate-500 text-right">Source: {source}</p>
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

  const facts = [
    {
      icon: <FiTrendingUp size={28} className="text-indigo-300" />,
      title: 'AI 예산의 급증',
      value: '+36%',
      description: '기업들의 월 평균 AI 관련 예산은 폭발적으로 증가하고 있지만, 그 지출이 실질적인 성과로 이어지는지는 미지수입니다.',
      source: 'CloudZero, 2025',
      delay: 0,
    },
    {
      icon: <FiHelpCircle size={28} className="text-indigo-300" />,
      title: '불확실한 ROI',
      value: '51%',
      description: 'AI에 막대한 비용을 투자한 기업 중 절반 이상이 그 투자에 대한 수익률(ROI)을 확신하지 못하고 있습니다.',
      source: 'CloudZero, 2025',
      delay: 0.2,
    },
    {
      icon: <FiBarChart2 size={28} className="text-indigo-300" />,
      title: '예측 불가능한 추론 비용',
      value: 'Hidden',
      description: '반복적으로 발생하는 AI 추론(Inference) 비용은 예측이 어렵고 변동성이 커, 기술의 전사적 도입을 막는 가장 큰 장벽이 되고 있습니다.',
      source: 'The Register, 2025',
      delay: 0.4,
    },
  ];

  return (
    <section id="market-need" className="py-20 sm:py-32 bg-slate-900 text-white relative overflow-hidden">
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
            AI 도입의 역설: <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">혁신 뒤의 비용 문제</span>
          </motion.h2>
          <motion.p variants={textVariants} className="mt-6 text-lg text-gray-300 max-w-3xl mx-auto">
            모든 기업이 AI의 잠재력에 투자하고 있지만, 그 이면에서는 통제 불가능한 비용과 불확실한 ROI라는 심각한 문제에 직면해 있습니다.
          </motion.p>
        </motion.div>

        <motion.div 
          variants={sectionVariants} 
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          {facts.map((fact, index) => (
            <FactCard key={index} {...fact} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default MarketNeedSection; 