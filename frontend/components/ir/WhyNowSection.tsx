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
      title: "Wave 1: The Gold Rush",
      subtitle: "AI 도입 경쟁 시대 (2022-2024)",
      description: "모든 기업이 너도나도 AI를 도입하며 무한한 가능성에 베팅했습니다. 시장은 '누가 더 빨리 도입하는가'에만 집중했습니다.",
      delay: 0,
    },
    {
      icon: <FiTarget size={48} className="text-cyan-300" />,
      title: "Wave 2: The Reckoning",
      subtitle: "비용과 ROI의 심판 (2025~)",
      description: "이제 기업들은 막대한 AI 운영 비용과 불확실한 ROI라는 현실의 벽에 부딪혔습니다. 시장의 관심은 '어떻게 하면 비용을 통제할 것인가'로 이동했습니다.",
      delay: 0.2,
    },
    {
      icon: <FiZap size={48} className="text-cyan-300" />,
      title: "The Opportunity",
      subtitle: "AI 최적화 시장의 개화",
      description: "'AI 비용 최적화'는 이제 선택이 아닌 생존의 문제입니다. 이 거대한 시장의 니즈가 폭발하는 지금, 근본적인 해결책인 AI-Link에게는 전례 없는 기회가 열렸습니다.",
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
            The Market Inflection Point is <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Now</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-300 mb-16 text-center max-w-3xl mx-auto leading-relaxed">
            AI 시장은 '묻지마 도입'의 시대를 지나 '비용 최적화'의 시대로 넘어가고 있습니다. 
            <br/>
            이 거대한 패러다임 전환이 우리에게는 전례 없는 기회입니다.
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