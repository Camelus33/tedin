'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FiClock, FiCpu, FiTrendingDown } from 'react-icons/fi';
import React from 'react';

interface ProblemCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

const ProblemCard: React.FC<ProblemCardProps> = ({ icon, title, description, delay }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, delay } },
  };

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-8 border border-slate-700 shadow-lg text-center transform transition-all duration-300 hover:border-red-400/50 hover:-translate-y-2"
    >
      <div className="flex justify-center text-red-400 mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
      <p className="text-sm text-slate-300 leading-relaxed">{description}</p>
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

  const problems = [
    {
      icon: <FiClock size={48} />,
      title: '장시간 집중의 한계',
      description: '3시간 앉아서 공부하는 것은 불가능. 30분마다 집중력이 급격히 떨어져 학습 효율이 급감합니다.',
      delay: 0,
    },
    {
      icon: <FiCpu size={48} />,
      title: '기억의 빠른 소실',
      description: '오늘 배운 것, 내일이면 70% 잊어버림. 반복 학습해도 장기 기억으로 전환되지 않습니다.',
      delay: 0.2,
    },
    {
      icon: <FiTrendingDown size={48} />,
      title: '느린 학습 속도',
      description: '청소년에 비해 새로운 정보 습득 속도가 40% 느림. 시험까지 시간이 부족합니다.',
      delay: 0.4,
    },
  ];

  return (
    <section id="problem" className="py-20 sm:py-32 bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-red/[0.05] z-0"></div>
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          ref={ref}
          variants={sectionVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="text-center mb-16"
        >
          <motion.h2 variants={textVariants} className="text-4xl sm:text-5xl font-bold tracking-tight">
            The Root Cause: <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">Why Learning is Inefficient</span>
          </motion.h2>
          <motion.p variants={textVariants} className="mt-6 text-lg text-gray-300 max-w-3xl mx-auto">
            성인 학습자는 시간 투자 대비 학습 효과가 점점 더 떨어집니다. 전통적인 학습 방법의 한계가 명확해지고 있습니다.
          </motion.p>
        </motion.div>

        <motion.div 
          variants={sectionVariants} 
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          {problems.map((problem, index) => (
            <ProblemCard key={index} {...problem} />
          ))}
        </motion.div>

        <motion.div 
          variants={textVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="text-center mt-20"
        >
          <h3 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            모든 문제의 근원은 <span className="text-red-400">"인지적 한계와 시간 부족"</span>
          </h3>
          <p className="text-lg text-gray-300 max-w-4xl mx-auto leading-relaxed">
            성인 학습자의 인지적 특성과 현실적 제약이 학습 효율을 저해합니다.
            <br />
            그렇다면, <span className="text-cyan-400 font-semibold">인지과학 기반 학습 가속</span>으로 해결할 수 있을까요?
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default ProblemSection; 