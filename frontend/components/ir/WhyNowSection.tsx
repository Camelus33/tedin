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
      title: "반복 실수 자각 니즈",
      subtitle: "2023~2025, 체감 수요 증가",
      description: "비슷한 실수가 다시 발생하기 전에 알아채고 싶다는 요구가 커졌습니다.",
      delay: 0,
    },
    {
      icon: <FiTarget size={48} className="text-cyan-300" />,
      title: "기록은 늘었지만, 비교는 부재",
      subtitle: "도구는 많고, 연결은 없다",
      description: "메신저·문서·노트에 기록되지만 ‘지금과 닮은 과거’는 자동으로 안 보입니다.",
      delay: 0.2,
    },
    {
      icon: <FiZap size={48} className="text-cyan-300" />,
      title: "기술 여건 성숙",
      subtitle: "임베딩/벡터 검색 상용화",
      description: "개인 맥락 기반의 실시간 유사도 비교가 비용 대비 현실화되었습니다.",
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
            지금 필요한 이유
          </h2>
          <p className="text-lg md:text-xl text-gray-300 mb-16 text-center max-w-3xl mx-auto leading-relaxed">
            같은 실수를 줄이려면, 저장 순간에 과거와 비교가 되어야 합니다. 이제 기술과 수요가 맞물렸습니다.
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

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            참고: 
            <a href="https://www.microsoft.com/en-us/worklab/work-trend-index" target="_blank" rel="noreferrer" className="underline hover:text-gray-300"> Microsoft Work Trend Index</a>,
            <a href="https://asana.com/resources/anatomy-of-work" target="_blank" rel="noreferrer" className="underline hover:text-gray-300"> Asana Anatomy of Work</a>,
            <a href="https://www.morningstar.com/lp/mind-the-gap" target="_blank" rel="noreferrer" className="underline hover:text-gray-300"> Morningstar Mind the Gap</a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default WhyNowSection; 