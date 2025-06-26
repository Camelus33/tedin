'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const TrendIcon1 = () => (
  <div className="flex items-center justify-center w-16 h-16 bg-gray-800 rounded-full">
    <svg width="36" height="36" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 24H20M44 24C44 35.0457 35.0457 44 24 44C12.9543 44 4 35.0457 4 24M44 24C44 12.9543 35.0457 4 24 4C18.0637 4 12.7933 6.64962 9.01131 10.9887" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M38 18L44 24L38 30" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </div>
);

const TrendIcon2 = () => (
  <div className="flex items-center justify-center w-16 h-16 bg-gray-800 rounded-full">
    <svg width="36" height="36" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 29C28.4183 29 32 25.4183 32 21C32 16.5817 28.4183 13 24 13C19.5817 13 16 16.5817 16 21C16 25.4183 19.5817 29 24 29Z" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6 44V40C6 34.4772 14.9376 30 24 30C33.0624 30 42 34.4772 42 40V44" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M24 4V8" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M40 24H44" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4 24H8" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M35.071 9.92896L37.8995 7.10054" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7.10051 37.8995L9.92893 35.0711" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </div>
);

const TrendIcon3 = () => (
  <div className="flex items-center justify-center w-16 h-16 bg-gray-800 rounded-full">
    <svg width="36" height="36" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 36C29.5228 36 34 31.5228 34 26C34 20.4772 29.5228 16 24 16C18.4772 16 14 20.4772 14 26C14 31.5228 18.4772 36 24 36Z" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M24 16V10C24 6.68629 21.3137 4 18 4C14.6863 4 12 6.68629 12 10V18" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M24 16V10C24 6.68629 26.6863 4 30 4C33.3137 4 36 6.68629 36 10V18" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 26H6" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M34 26H42" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M24 36V44" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M19 44H29" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </div>
);


const trends = [
  {
    icon: <TrendIcon1 />,
    title: "AI 2.0: 컨텍스트 시대",
    text: "47%의 기업이 AI 환각 문제를 경험하면서, 시장은 프롬프트 의존성을 벗어나 사용자 맥락을 자동으로 파악하는 솔루션을 요구하고 있습니다. AI-Link 같은 지식 DNA 전송 기술이 차세대 AI 인터페이스의 표준이 되고 있습니다.",
  },
  {
    icon: <TrendIcon2 />,
    title: "Truth: 즉각적인 검증 요구",
    text: "83%의 전문가가 AI 생성 콘텐츠의 신뢰성 문제를 겪고 있습니다. 개인의 전문 지식과 경험을 바탕으로 한 맞춤형 검증 시스템이 AI 결과물의 품질을 보장하는 핵심 차별화 요소로 부상하고 있습니다.",
  },
  {
    icon: <TrendIcon3 />,
    title: "Data Deal: 도메인 지식 거래",
    text: "조직의 핵심 경쟁력은 이제 '업무 고유 지식을 어떻게 구조화하고 연결하는가'에 달려있습니다. 도메인 경쟁력 확보기술은 이 시대의 필수 요소입니다.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

const WhyNowSection = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  return (
    <section ref={ref} className="py-24 sm:py-32 bg-gray-900 text-white overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
          }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center tracking-tight">
            왜 <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">지금</span>이 적기인가?
          </h2>
          <p className="text-lg md:text-xl text-gray-400 mb-16 text-center max-w-3xl mx-auto leading-relaxed">
            세 가지 핵심 시장 트렌드가 AI-Link 기술의 필요성을 증명하고 있습니다.
          </p>
        </motion.div>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid md:grid-cols-3 gap-8"
        >
          {trends.map((trend, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className="p-10 flex flex-col items-center text-center bg-gray-800/40 rounded-2xl border border-white/10 shadow-lg hover:bg-gray-800/70 hover:border-cyan-400/50 transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="mb-8">
                {trend.icon}
              </div>
              <h3 className="text-2xl font-bold mb-5 text-white">{trend.title}</h3>
              <p className="text-gray-300 leading-7 max-w-xs">
                {trend.text}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default WhyNowSection; 