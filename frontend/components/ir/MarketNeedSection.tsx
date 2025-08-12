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
      title: '투자자',
      value: '투자실수',
      description: '감정/FOMO 편향을 줄이고 과거 판단 패턴과의 대조를 원함. 지표 예: 투자자 수익률-상품 수익률 격차, 이벤트 전후 성과 Δ',
      source: '참고: Morningstar Mind the Gap / DALBAR QAIB',
      delay: 0,
    },
    {
      icon: <FiCpu size={28} className="text-indigo-300" />,
      title: '직장',
      value: '재작업',
      description: '재작업·컨텍스트 전환을 줄이고 근거 대조로 결정 속도를 높이고자 함. 지표 예: 리워크율, 의사결정 리드타임',
      source: '참고: Microsoft Work Trend Index / Asana Anatomy of Work',
      delay: 0.1,
    },
    {
      icon: <FiClock size={28} className="text-indigo-300" />,
      title: '수험생',
      value: '오답 재발',
      description: '동일 개념 오답 재발을 낮추고 교정 루틴을 정착시키려는 수요. 지표 예: 동일 문항군 오답 재발률, 교정 체크리스트 적용률',
      source: '참고: Dunlosky 2013 / Cepeda 2006·2008',
      delay: 0.2,
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
            시장의 필요: “같은 실수를 반복하고 싶진 않다”
          </h2>
          <p className="text-xl text-slate-300 max-w-4xl mx-auto">
            잘못된 판단의 반복을 AI로 줄이려는 니즈가 커지고 있습니다.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {facts.map((fact, index) => (
            <FactCard key={index} {...fact} />
          ))}
        </div>
      </div>
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          참고: 
          <a href="https://www.microsoft.com/en-us/worklab/work-trend-index" target="_blank" rel="noreferrer" className="underline hover:text-gray-300">Microsoft Work Trend Index</a>,
          <a href="https://asana.com/resources/anatomy-of-work" target="_blank" rel="noreferrer" className="underline hover:text-gray-300 ml-2">Asana Anatomy of Work</a>,
          <a href="https://www.morningstar.com/lp/mind-the-gap" target="_blank" rel="noreferrer" className="underline hover:text-gray-300 ml-2">Morningstar Mind the Gap</a>,
          <a href="https://www.dalbar.com/Products-and-Services/QAIB" target="_blank" rel="noreferrer" className="underline hover:text-gray-300 ml-2">DALBAR QAIB</a>
        </p>
      </div>
    </section>
  );
};

export default MarketNeedSection; 