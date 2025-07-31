import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Clock, FileText, Link as LinkIcon, BookOpen, TrendingUp } from 'lucide-react';

const steps = [
  {
    icon: Clock,
    title: "집중 읽기",
    description: "타이머로 핵심만 빠르게",
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  {
    icon: FileText,
    title: "한 줄 정리",
    description: "중요한 내용만 간단히",
    color: "text-indigo-600",
    bg: "bg-indigo-100",
  },
  {
    icon: LinkIcon,
    title: "지식 연결",
    description: "관련 내용끼리 묶어서",
    color: "text-purple-600",
    bg: "bg-purple-100",
  },
  {
    icon: BookOpen,
    title: "문제 카드",
    description: "복습용 카드 만들기",
    color: "text-green-600",
    bg: "bg-green-100",
  },
  {
    icon: TrendingUp,
    title: "효과 측정",
    description: "이해정도 자동측정",
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
            Habitus33은 학습을 단순-구조화하여 시간을 줄입니다.
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
                  <h4 className="text-lg font-bold text-gray-800 mb-2">학습 시간 절반 단축</h4>
                  <p className="text-sm text-gray-600">집중 읽기로 핵심만 빠르게 파악</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                    <LinkIcon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-800 mb-2">지식 연결성 평균 3배 확장</h4>
                  <p className="text-sm text-gray-600">관련 내용끼리 묶어서 기억 강화</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-purple-600" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-800 mb-2">기억 보존률 75% 증가</h4>
                  <p className="text-sm text-gray-600">문제 카드로 복습하고 효과 확인</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
} 