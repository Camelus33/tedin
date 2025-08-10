import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Clock, FileText, Link as LinkIcon, BookOpen, TrendingUp } from 'lucide-react';
import { motion as m } from 'framer-motion';
import { showSuccess } from '@/lib/toast';

const steps = [
  {
    icon: FileText,
    title: "한 줄 메모",
    description: "핵심을 1줄로 남깁니다",
    color: "text-indigo-600",
    bg: "bg-indigo-100",
  },
  {
    icon: Clock,
    title: "생각 추가",
    description: "흐름 속에서 인라인 쓰레드로 확장",
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  {
    icon: BookOpen,
    title: "메모 진화 4단계",
    description: "이유·맥락·연결·심상으로 깊이를 더함",
    color: "text-green-600",
    bg: "bg-green-100",
  },
  {
    icon: LinkIcon,
    title: "지식 연결",
    description: "유사/관련 메모를 연결",
    color: "text-purple-600",
    bg: "bg-purple-100",
  },
  {
    icon: TrendingUp,
    title: "생각 패턴 분석",
    description: "속도·곡률·리듬·시간대 분포 집계",
    color: "text-orange-600",
    bg: "bg-orange-100",
  },
];

export default function HowItWorksSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.3, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <section className="py-24 sm:py-32 bg-white">
      <div className="container mx-auto px-4 text-center max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="mb-16 md:mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold font-serif tracking-tight text-gray-900 mb-5">
            메모 → 연결 → 진화 → 분석
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            흐름을 보면 다음이 보입니다. 반복과 확장을 놓치지 마세요.
          </p>
        </motion.div>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="max-w-6xl mx-auto"
        >
          {/* 5단계 시각적 표현 */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-12">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                variants={itemVariants}
                className="relative"
              >
                {/* 단계 번호 */}
                <div className="absolute -top-2 -left-2 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold z-10">
                  {index + 1}
                </div>
                
                {/* 아이콘과 설명 */}
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                  <div className={`w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full ${step.bg}`}>
                    <step.icon className={`w-8 h-8 ${step.color}`} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {step.description}
                  </p>
                </div>
                
                {/* 연결선 (마지막 단계 제외) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                    <div className="w-6 h-0.5 bg-indigo-300"></div>
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-indigo-300 border-t-2 border-t-transparent border-b-2 border-b-transparent"></div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
          
          {/* 흐름형 스텝 화살표 (얇은 SVG, 순차 이동) */}
          <div className="relative h-10 mb-8 hidden md:block">
            <m.svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 40" preserveAspectRatio="none" aria-hidden>
              {[0,1,2,3].map((i) => (
                <m.path
                  key={i}
                  d={`M ${100 + i*250},20 L ${300 + i*250},20`}
                  stroke="#6366F1"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: [0,1,0.4], x: [0,6,12] }}
                  transition={{ duration: 2.4, ease: 'easeInOut', repeat: Infinity, delay: i * 0.4 }}
                />
              ))}
              {[0,1,2,3].map((i)=> (
                <m.circle key={`c-${i}`} cx={300 + i*250} cy={20} r={2.5} fill="#22D3EE"
                  initial={{ opacity: 0 }} animate={{ opacity: [0,1,0.6] }}
                  transition={{ duration: 2.4, ease: 'easeInOut', repeat: Infinity, delay: i * 0.4 + 0.2 }}
                />
              ))}
            </m.svg>
          </div>

          {/* 결과 시각화 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="mt-16"
          >
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-100">
              <div className="grid md:grid-cols-3 gap-8 items-center">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-800 mb-2">유사/반복 생각 자동 감지</h4>
                  <p className="text-sm text-gray-600 mb-3">임베딩 유사도 + 자카드 폴백으로 과거 맥락 탐지</p>
                  <m.svg viewBox="0 0 120 40" className="mx-auto" width={160} height={60}>
                    {[0,1,2,3,4].map((i)=> (
                      <m.circle key={i} cx={20 + i*20} cy={20} r={3} fill="#6366F1"
                        animate={{ cx: [20 + i*20, 20 + i*20 + (i%2===0?4:-4), 20 + i*20] }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: i*0.1 }}
                      />
                    ))}
                    <m.line x1={20} y1={20} x2={100} y2={20} stroke="#A5B4FC" strokeDasharray="4 6"
                      animate={{ strokeDashoffset: [0, -10] }} transition={{ duration: 2, repeat: Infinity }} />
                  </m.svg>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                    <LinkIcon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-800 mb-2">생각의 방향과 속도 가시화</h4>
                  <p className="text-sm text-gray-600 mb-3">속도·곡률·리듬·시간대 분포를 한눈에</p>
                  <m.svg viewBox="0 0 140 60" className="mx-auto" width={160} height={60}>
                    {[0,1,2].map((i)=> (
                      <m.path key={i} d={`M10,${50 - i*10} Q70,${10 + i*8} 130,${50 - i*12}`}
                        fill="none" stroke="#22D3EE" strokeWidth="1.5" strokeLinecap="round"
                        animate={{ d: [`M10,${50 - i*10} Q70,${12 + i*8} 130,${50 - i*12}`, `M10,${50 - i*10} Q70,${8 + i*8} 130,${50 - i*12}`] }}
                        transition={{ duration: 2.5, repeat: Infinity, repeatType: 'reverse', delay: i*0.2 }}
                      />
                    ))}
                  </m.svg>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-purple-600" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-800 mb-2">마일스톤 자동 알림</h4>
                  <p className="text-sm text-gray-600 mb-3">시작/깊이/연결 달성 시 다음 행동 추천</p>
                  <button
                    onClick={() => showSuccess('좋아요! 생각추가/기억강화/지식연결을 시작했어요. 비슷한 메모 연결해볼까요?')}
                    className="px-3 py-1.5 text-xs rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition"
                  >
                    토스트 체험하기
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
} 