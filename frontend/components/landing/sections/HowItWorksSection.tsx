import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Clock, FileText, Link as LinkIcon, BookOpen, TrendingUp } from 'lucide-react';

const steps = [
  {
    icon: Clock,
    title: "TS 세션",
    description: "타이머를 이용한 집중 읽기",
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  {
    icon: FileText,
    title: "1줄 메모",
    description: "중요한 내용만 1줄로 요약",
    color: "text-indigo-600",
    bg: "bg-indigo-100",
  },
  {
    icon: LinkIcon,
    title: "지식 연결",
    description: "생각과 지식을 모두 연결",
    color: "text-purple-600",
    bg: "bg-purple-100",
  },
  {
    icon: BookOpen,
    title: "플래시카드",
    description: "복습용 문제 카드 작성",
    color: "text-green-600",
    bg: "bg-green-100",
  },
  {
    icon: TrendingUp,
    title: "개념이해도",
    description: "이해정도를 자동 측정",
    color: "text-orange-600",
    bg: "bg-orange-100",
  }
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
            어떻게 작동하나요?
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            학습 가속기는 5단계로 지식을 체계화하여 빠르고 오래가는 학습을 만듭니다.
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
                  <h4 className="text-lg font-bold text-gray-800 mb-2">학습 시간 37% 단축</h4>
                  <p className="text-sm text-gray-600">TS 세션과 1줄 메모로 핵심만 빠르게 파악</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                    <LinkIcon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-800 mb-2">지식 연결성 4.2배 향상</h4>
                  <p className="text-sm text-gray-600">메모 진화로 관련 개념들을 자동 연결</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-purple-600" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-800 mb-2">기억 보존률 4.2배 증가</h4>
                  <p className="text-sm text-gray-600">플래시카드와 간격 반복으로 장기 기억 강화</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
} 