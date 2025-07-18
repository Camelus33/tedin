'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FiTrendingUp, FiTarget, FiZap } from 'react-icons/fi';

interface TrendCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  delay: number;
}

const TrendCard: React.FC<TrendCardProps> = ({ icon, title, subtitle, description, delay }) => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay } },
  };

  return (
    <motion.div
      ref={ref}
      variants={cardVariants}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className="p-8 flex flex-col items-center text-center bg-slate-800/40 rounded-2xl border border-slate-700 shadow-lg hover:bg-slate-800/70 hover:border-cyan-400/50 transition-all duration-300 transform hover:-translate-y-2"
    >
      <div className="mb-6">{icon}</div>
      <h3 className="text-2xl font-bold mb-2 text-white">{title}</h3>
      <p className="text-md font-semibold text-cyan-400 mb-4">{subtitle}</p>
      <p className="text-sm text-slate-300 leading-relaxed max-w-xs">{description}</p>
    </motion.div>
  );
};

const WhyNowSection = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.2 } },
  };

  const trends = [
    {
      icon: <FiTrendingUp size={48} className="text-cyan-300" />,
      title: "Wave 1: 투자 앱 경쟁 시대",
      subtitle: "개인 투자 도구 혁신 (2022-2024)",
      description: "Robinhood, Webull 등 투자 앱들이 개인 투자자에게 접근성을 제공했지만, 여전히 투자자의 편향과 실수를 진단하는 기능은 부족했습니다.",
      delay: 0,
    },
    {
      icon: <FiTarget size={48} className="text-cyan-300" />,
      title: "Wave 2: 인간-AI 협업 투자",
      subtitle: "투자 편향 진단의 시대 (2025~)",
      description: "이제 투자자들은 AI의 도움을 받아 자신의 편향과 반복 실수를 진단하고 싶어합니다. '인간과 AI가 협업 투자하는 게 대세'가 되었습니다.",
      delay: 0.2,
    },
    {
      icon: <FiZap size={48} className="text-cyan-300" />,
      title: "The Opportunity",
      subtitle: "온톨로지 기반 투자 분석 시장의 개화",
      description: "투자자의 메모를 온톨로지로 분석하여 편향을 진단하는 서비스는 이제 선택이 아닌 필수입니다. 1,400만 국내 개인 투자자들이 필요로 하는 해결책입니다.",
      delay: 0.4,
    },
  ];

  return (
    <section ref={ref} className="py-24 sm:py-32 bg-black text-white overflow-hidden">
      <div className="absolute inset-0 bg-grid-cyan/[0.05] z-0"></div>
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={sectionVariants}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center tracking-tight">
            인간-AI 협업 투자의 <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">전환점</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-300 mb-16 text-center max-w-3xl mx-auto leading-relaxed">
            개인 투자 시장은 '감정적 투자'의 시대를 지나 'AI 기반 체계적 분석'의 시대로 넘어가고 있습니다. 
            <br/>
            이제 투자자들은 AI의 도움을 받아 자신의 편향과 실수를 진단하고 싶어합니다.
          </p>
        </motion.div>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid md:grid-cols-3 gap-8"
        >
          {trends.map((trend, index) => (
            <TrendCard key={index} {...trend} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default WhyNowSection; 