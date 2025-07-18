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
      title: '투자자 반복 실수율',
      value: '78%',
      description: '개인 투자자 중 78%가 자신의 반복 실수 패턴을 인지하지 못하고, 매번 같은 실수를 반복하고 있습니다.',
      source: '한국IR협의회, 2024',
      delay: 0,
    },
    {
      icon: <FiHelpCircle size={28} className="text-indigo-300" />,
      title: '투자 편향 인지 어려움',
      value: '85%',
      description: '투자자들의 85%가 자신의 투자 편향(확증편향, 손실회피 등)을 인지하지 못해 비합리적인 투자 결정을 내립니다.',
      source: '한국예탁결제원, 2024',
      delay: 0.2,
    },
    {
      icon: <FiBarChart2 size={28} className="text-indigo-300" />,
      title: '온톨로지 분석 필요성',
      value: '92%',
      description: '투자 메모 간 상관관계와 인과추론을 통한 체계적 분석이 필요한 투자자가 92%에 달하지만, 적절한 도구가 부족합니다.',
      source: 'Market.us, 2024',
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
            투자자의 숨겨진 적: <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">반복 실수와 편향</span>
          </motion.h2>
          <motion.p variants={textVariants} className="mt-6 text-lg text-gray-300 max-w-3xl mx-auto">
            1,400만 국내 개인 투자자들이 매번 같은 실수를 반복하고, 자신의 투자 편향을 인지하지 못해 손실을 겪고 있습니다.
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