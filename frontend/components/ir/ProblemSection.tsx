'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FiRepeat, FiPackage, FiZapOff } from 'react-icons/fi';
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
      icon: <FiRepeat size={48} />,
      title: '반복되는 투자 실수',
      description: '78%의 투자자가 동일한 실수를 반복합니다. 과거 투자 메모를 찾아보지 못해 "이미 경험한 실수"를 계속 되풀이하고 있습니다.',
      delay: 0,
    },
    {
      icon: <FiPackage size={48} />,
      title: '투자 편향의 무지',
      description: '85%의 투자자가 자신의 투자 편향을 인식하지 못합니다. 손실 회피, 확증 편향, 앵커링 등이 투자 결정을 왜곡시키고 있습니다.',
      delay: 0.2,
    },
    {
      icon: <FiZapOff size={48} />,
      title: '개별 메모의 한계',
      description: '투자 메모들이 서로 연결되지 않아 전체적인 투자 철학과 패턴을 파악할 수 없습니다. 숨겨진 투자 기회를 놓치고 있습니다.',
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
            The Root Cause: <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">Why Investors Keep Losing</span>
          </motion.h2>
          <motion.p variants={textVariants} className="mt-6 text-lg text-gray-300 max-w-3xl mx-auto">
            투자자들은 자신의 투자 패턴과 편향을 제대로 이해하지 못합니다. 과거 투자 메모들이 연결되지 않아 반복 실수를 하고, 숨겨진 투자 기회를 놓치고 있습니다.
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
            모든 문제의 근원은 <span className="text-red-400">"투자 패턴의 무지"</span>
          </h3>
          <p className="text-lg text-gray-300 max-w-4xl mx-auto leading-relaxed">
            투자자들이 자신의 투자 패턴과 편향을 제대로 이해하지 못하는 것. 이 하나의 문제가 모든 투자 실패와 기회 손실의 근원입니다.
            <br />
            그렇다면, <span className="text-cyan-400 font-semibold">'온톨로지 AI'</span>가 투자자의 패턴을 학습하고 편향을 진단하면 어떨까요?
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default ProblemSection; 