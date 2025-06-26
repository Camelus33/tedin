'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FiCalendar, FiAward, FiTrendingUp, FiUsers, FiStar, FiArrowRight } from 'react-icons/fi';
import Link from 'next/link';

interface HistoryItemProps {
  date: string;
  title: string;
  description: string;
  type: 'foundation' | 'funding' | 'patent' | 'product' | 'partnership' | 'milestone';
  isHighlight?: boolean;
  delay: number;
  isLast?: boolean;
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'foundation':
      return <FiCalendar size={20} />;
    case 'funding':
      return <FiTrendingUp size={20} />;
    case 'patent':
      return <FiAward size={20} />;
    case 'product':
      return <FiStar size={20} />;
    case 'partnership':
      return <FiUsers size={20} />;
    default:
      return <FiCalendar size={20} />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'foundation':
      return 'from-purple-400 to-indigo-400';
    case 'funding':
      return 'from-green-400 to-cyan-400';
    case 'patent':
      return 'from-yellow-400 to-orange-400';
    case 'product':
      return 'from-cyan-400 to-blue-500';
    case 'partnership':
      return 'from-pink-400 to-purple-400';
    default:
      return 'from-gray-400 to-gray-500';
  }
};

const HistoryItem: React.FC<HistoryItemProps> = ({ date, title, description, type, isHighlight, delay, isLast }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const variants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, delay } },
  };

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className="flex items-start relative"
    >
      {/* Timeline Icon and Line */}
      <div className="flex flex-col items-center mr-6 relative">
        <div className={`bg-gradient-to-br ${getTypeColor(type)} p-3 rounded-full shadow-lg ${isHighlight ? 'ring-4 ring-cyan-400/30' : ''}`}>
          <div className="text-white">
            {getTypeIcon(type)}
          </div>
        </div>
        {/* Connecting Line */}
        {!isLast && (
          <div className="w-0.5 h-16 bg-gradient-to-b from-gray-600 to-gray-700 mt-4"></div>
        )}
      </div>
      
      {/* Content */}
      <div className={`flex-1 pb-16 ${isHighlight ? 'bg-gradient-to-r from-cyan-900/20 to-transparent p-6 rounded-lg border border-cyan-400/20' : ''}`}>
        <div className="flex items-center mb-2">
          <span className={`text-sm font-bold px-3 py-1 rounded-full ${isHighlight ? 'bg-cyan-400 text-black' : 'bg-gray-700 text-gray-300'}`}>
            {date}
          </span>
        </div>
        <h3 className={`text-lg font-bold mb-3 ${isHighlight ? 'text-cyan-300' : 'text-white'}`}>
          {title}
        </h3>
        <p className="text-gray-300 leading-relaxed text-sm">
          {description}
        </p>
      </div>
    </motion.div>
  );
};

const HistorySection = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  
  const sectionVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  };

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const ctaVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, delay: 1.8 } },
  };

  const historyItems: (Omit<HistoryItemProps, 'isLast'>)[] = [
    {
      date: '2021.10',
      title: '(주) 테딘 설립',
      description: '혁신적인 AI 기술 개발을 목표로 회사를 설립하였습니다.',
      type: 'foundation' as const,
      delay: 0,
    },
    {
      date: '2021.03',
      title: 'IP디딤돌 지원사업 선정',
      description: '지적재산권 기반 창업을 위한 정부 지원사업에 선정되었습니다.',
      type: 'funding' as const,
      delay: 0.1,
    },
    {
      date: '2021.05',
      title: '대전-세종 관광스타트업 선정',
      description: '관광 분야 스타트업으로 선정되어 사업화 지원금을 확보했습니다.',
      type: 'funding' as const,
      delay: 0.2,
    },
    {
      date: '2021.07',
      title: '사업관련 특허 1건 출원',
      description: '핵심 기술에 대한 첫 번째 특허를 출원하였습니다.',
      type: 'patent' as const,
      delay: 0.3,
    },
    {
      date: '2021.08',
      title: '세종혁신 프로젝트 선정',
      description: '세종시 혁신 프로젝트에 선정되어 추가 사업화 지원을 받았습니다.',
      type: 'funding' as const,
      delay: 0.4,
    },
    {
      date: '2021.10',
      title: '과학벨트 창업성장지원사업 선정',
      description: '과학기술 기반 창업 성장을 위한 지원사업에 선정되었습니다.',
      type: 'funding' as const,
      delay: 0.5,
    },
    {
      date: '2021.12',
      title: '세종시 관광편의시설업 (인)허가',
      description: '관광 서비스 제공을 위한 정식 허가를 취득했습니다.',
      type: 'milestone' as const,
      delay: 0.6,
    },
    {
      date: '2022.05',
      title: '창진원 재도전성공패키지 선정',
      description: '창업진흥원의 재도전 성공패키지 지원사업에 선정되었습니다.',
      type: 'funding' as const,
      delay: 0.7,
    },
    {
      date: '2022.08',
      title: '사업관련 특허 3건 출원',
      description: '핵심 기술 확장을 위한 추가 특허 3건을 출원했습니다.',
      type: 'patent' as const,
      delay: 0.8,
    },
    {
      date: '2022.09',
      title: '경도인지장애인용 내비게이션 앱 출시',
      description: '특수 목적 내비게이션 콘텐츠 앱을 정식 출시했습니다.',
      type: 'product' as const,
      delay: 0.9,
    },
    {
      date: '2022.12',
      title: '사업관련 PCT 기술출원',
      description: '국제 특허 출원을 통해 글로벌 기술 보호를 확보했습니다.',
      type: 'patent' as const,
      delay: 1.0,
    },
    {
      date: '2023.06',
      title: '아웃도어 도움요청 서비스 Aidin 출시',
      description: '실외 활동 중 응급상황 대응 서비스를 정식 출시했습니다.',
      type: 'product' as const,
      delay: 1.1,
    },
    {
      date: '2024.01',
      title: '도메인 데이터 및 사용자 확보',
      description: '도메인 데이터 1시간 및 사고 인터뷰 84건, 가입자 8,000여명을 확보했습니다.',
      type: 'milestone' as const,
      delay: 1.2,
    },
    {
      date: '2024.02',
      title: 'OpenAI LLM API 연동 서비스 출시',
      description: 'AI 기술을 활용한 도움요청 서비스를 고도화했습니다.',
      type: 'product' as const,
      delay: 1.3,
    },
    {
      date: '2024.04',
      title: '제주 자치경찰위원회 MOU',
      description: '제주 자치경찰위원회와 공식 업무협약을 체결했습니다.',
      type: 'partnership' as const,
      delay: 1.4,
    },
    {
      date: '2024.12',
      title: '제주 추자도 위급대응 서비스 도입',
      description: '제주 자치경찰위원회와 협업하여 추자도 주민 대상 서비스를 도입했습니다.',
      type: 'partnership' as const,
      delay: 1.5,
    },
    {
      date: '2025.03',
      title: 'Habitus33 베타 출시',
      description: '생성형 AI 솔루션 Habitus33을 베타 출시하여 혁신 파워 유저 100여명이 사용 중입니다.',
      type: 'product' as const,
      isHighlight: true,
      delay: 1.6,
    },
    {
      date: '2025.06',
      title: '현재 - 사업 확장 중',
      description: '전국 로스쿨 솔루션 도입 상담 6건, 중견기업 임원 도입 상담 7건을 진행하고 있습니다.',
      type: 'milestone' as const,
      isHighlight: true,
      delay: 1.7,
    },
  ];

  return (
    <section id="history" className="py-20 sm:py-32 bg-gradient-to-b from-black to-gray-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/[0.02] z-0"></div>
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          ref={ref}
          variants={sectionVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="text-center mb-16"
        >
          <motion.h2 variants={textVariants} className="text-4xl sm:text-5xl font-bold tracking-tight">
            회사 레퍼런스: <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">4년간의 성장</span>
          </motion.h2>
          <motion.p variants={textVariants} className="mt-6 text-lg text-gray-300 max-w-3xl mx-auto">
            2021년 설립 이후 지속적인 기술 개발과 사업 확장을 통해 AI 혁신을 선도해온 여정입니다
          </motion.p>
        </motion.div>

        <motion.div 
          variants={sectionVariants} 
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="max-w-4xl mx-auto"
        >
          {historyItems.map((item, index) => (
            <HistoryItem 
              key={index} 
              {...item}
              isLast={index === historyItems.length - 1}
            />
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          variants={ctaVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="text-center mt-20"
        >
          <div className="bg-gradient-to-r from-purple-900/30 to-cyan-900/30 p-8 rounded-3xl border border-purple-400/20 backdrop-blur-sm">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
              지금 Habitus33과 함께 시작하세요
            </h3>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
               
              새로운 차원의 AI 협업을 시작하세요.
            </p>
            
            <Link href="/auth/register">
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 20px 40px rgba(168, 85, 247, 0.4)"
                }}
                whileTap={{ scale: 0.95 }}
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full shadow-lg transition-all duration-300 hover:from-purple-600 hover:to-cyan-600"
              >
                <span className="relative z-10">무료 시작</span>
                <FiArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
              </motion.button>
            </Link>
            
            <div className="mt-6 flex items-center justify-center space-x-6 text-sm text-gray-400">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                무료 가입
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                즉시 사용 가능
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                언제든 구독/취소 가능
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HistorySection; 