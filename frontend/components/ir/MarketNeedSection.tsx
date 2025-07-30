'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FiUsers, FiClock, FiCpu, FiBook } from 'react-icons/fi';

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
      animate={inView ? "visible" : "hidden"}
      className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:bg-slate-800/70 transition-all duration-300"
    >
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
          <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-2">
            {value}
          </div>
          <p className="text-slate-300 text-sm mb-2">{description}</p>
          <p className="text-slate-500 text-xs">{source}</p>
        </div>
      </div>
    </motion.div>
  );
};

const MarketNeedSection = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const facts = [
    {
      icon: <FiUsers size={28} className="text-indigo-300" />,
      title: '성인 학습자 증가',
      value: '20%↑',
      description: 'OECD 국가에서 성인 학습 참여율은 꾸준히 증가 중입니다.',
      source: 'OECD Skills Outlook, 2023',
      delay: 0,
    },
    {
      icon: <FiCpu size={28} className="text-indigo-300" />,
      title: '단기기억 용량 한계',
      value: '30%↓',
      description: '성인은 청소년에 비해 단기기억 용량이 평균적으로 낮습니다.',
      source: 'Cognitive Aging Research, 2023',
      delay: 0.1,
    },
    {
      icon: <FiClock size={28} className="text-indigo-300" />,
      title: '학습 시간 부족',
      value: '30분',
      description: '성인 학습자의 평균 일일 학습 시간입니다.',
      source: 'OECD Time Use Surveys, 2023',
      delay: 0.2,
    },
    {
      icon: <FiBook size={28} className="text-indigo-300" />,
      title: '의미 기반 학습 강점',
      value: '70%↑',
      description: '성인은 경험과 지식을 활용한 의미 기반 학습에서 우수합니다.',
      source: 'Adult Learning Theory Research, 2023',
      delay: 0.3,
    },
  ];

  return (
    <section id="market-need" className="py-20 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            학습의 역설:
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
              성인의 인지적 특성과 학습 니즈
            </span>
          </h2>
          <p className="text-xl text-slate-300 max-w-4xl mx-auto">
            성인은 청소년에 비해 단기기억 용량이 제한적이지만, 
            경험과 지식을 활용한 의미 기반 학습에서는 오히려 우수합니다. 
            하지만 시간 부족과 효율성 문제로 인해 학습의 궁극적 목표를 달성하기 어려운 상황입니다.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {facts.map((fact, index) => (
            <FactCard key={index} {...fact} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MarketNeedSection; 