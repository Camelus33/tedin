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
      title: "Wave 1: 평생학습의 부상",
      subtitle: "성인 학습자 증가 시대 (2020-2024)",
      description: "기술 변화와 경쟁 압박으로 인해 성인 학습자들이 꾸준히 증가했습니다. OECD 국가에서 성인 학습 참여율이 20% 증가하며, 평생학습의 필요성이 절실해졌습니다.",
      delay: 0,
    },
    {
      icon: <FiTarget size={48} className="text-cyan-300" />,
      title: "Wave 2: 학습 효율성의 한계",
      subtitle: "전통적 학습 방법의 한계 (2025~)",
      description: "이제 성인 학습자들은 시간 부족과 인지적 한계라는 현실의 벽에 부딪혔습니다. 시장의 관심은 '어떻게 하면 효율적으로 학습할 것인가'로 이동했습니다.",
      delay: 0.2,
    },
    {
      icon: <FiZap size={48} className="text-cyan-300" />,
      title: "The Opportunity",
      subtitle: "지식캡슐 학습 시간 단축 시장의 개화",
      description: "'지식캡슐 학습 시간 단축'은 이제 선택이 아닌 필수입니다. 이 거대한 시장의 니즈가 폭발하는 지금, 근본적인 해결책인 AI-Link 지식캡슐에게는 전례 없는 기회가 열렸습니다.",
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
            The Learning Market Inflection Point is <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Now</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-300 mb-16 text-center max-w-3xl mx-auto leading-relaxed">
            학습 시장은 '무작정 공부'의 시대를 지나 '효율적 학습'의 시대로 넘어가고 있습니다. 
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