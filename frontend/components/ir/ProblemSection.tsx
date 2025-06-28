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
      title: '밑 빠진 독, 프롬프트 입력 반복',
      description: '한 번의 질문, 다섯 번의 재시도. 원하는 답을 얻기 위한 "프롬프트 튜닝"은 끝없는 뫼비우스의 띠와 같습니다. 모든 "재시도"는 청구서에 새로운 숫자를 더할 뿐입니다.',
      delay: 0,
    },
    {
      icon: <FiPackage size={48} />,
      title: '거듭되는 토큰 소모',
      description: 'API 호출 비용의 80%는 AI가 이미 "알아야 할" 정보를 다시 설명하는 데 쓰입니다. 이는 같은 토큰을 계속 태우는 것과 같습니다.',
      delay: 0.2,
    },
    {
      icon: <FiZapOff size={48} />,
      title: '지금은 200달러, 내년엔?',
      description: 'API 호출비용 구조는 의도된 전략. 시간이 지날수록 빠져 나오기 힘든 고가형 고정비용이 되고 있습니다.',
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
            The Root Cause: <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">Why AI Costs Explode</span>
          </motion.h2>
          <motion.p variants={textVariants} className="mt-6 text-lg text-gray-300 max-w-3xl mx-auto">
            AI는 금붕어와 같습니다. 대화가 끝나면 모든 것을 잊어버립니다. 그래서 매 API 호출마다 핵심 컨텍스트를 처음부터 다시 주입해야 합니다. 이 것이 비용의 주범입니다.
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
            모든 문제의 근원은 <span className="text-red-400">"AI의 단기 기억상실증"</span>
          </h3>
          <p className="text-lg text-gray-300 max-w-4xl mx-auto leading-relaxed">
            AI가 사용자의 고유한 '컨텍스트(Context)'를 기억하지 못하는 것. 이 하나의 문제가 모든 비효율과 비용 낭비의 근원입니다.
            <br />
            그렇다면, AI에게 <span className="text-cyan-400 font-semibold">'컨텍스트 캡슐'</span>을 한번에 주입하면 어떨까요?
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default ProblemSection; 