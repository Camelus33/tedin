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
      title: '반복 실수의 재발',
      description: '비슷한 시간·상황에서 같은 판단을 다시 합니다.',
      delay: 0,
    },
    {
      icon: <FiCpu size={48} />,
      title: '즉시 비교의 부재',
      description: "저장 순간 ‘과거와 닮음’을 보여주는 시스템이 없습니다.",
      delay: 0.2,
    },
    {
      icon: <FiTrendingDown size={48} />,
      title: '재작업과 지연',
      description: '결국 재작업·일정 지연·손실로 이어집니다.',
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
            우리가 푸는 문제
          </motion.h2>
          <motion.p variants={textVariants} className="mt-6 text-lg text-gray-300 max-w-3xl mx-auto">
            저장 순간 과거와 비교되지 않기 때문에, 같은 이유의 오류가 반복됩니다.
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
            핵심은 “즉시 비교”입니다
          </h3>
          <p className="text-lg text-gray-300 max-w-4xl mx-auto leading-relaxed">
            저장 즉시 유사 사례 3개를 보여주면 반복 실수를 줄일 수 있습니다.
          </p>
          <p className="text-xs text-gray-500 mt-4">
            참고: 
            <a href="https://www.microsoft.com/en-us/worklab/work-trend-index" target="_blank" rel="noreferrer" className="underline hover:text-gray-300">Microsoft Work Trend Index</a>,
            <a href="https://asana.com/resources/anatomy-of-work" target="_blank" rel="noreferrer" className="underline hover:text-gray-300 ml-2">Asana Anatomy of Work</a>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default ProblemSection; 