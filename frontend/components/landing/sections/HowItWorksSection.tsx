import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Database, Link as LinkIcon, Award, BookOpen, FileText, Zap } from 'lucide-react';

const steps = [
  {
    icon: Database,
    title: "1. 생각 추가",
    description: "1줄메모 바로 아래 시간 진화형태로 생각을 추가합니다. 생각의 흐름과 발전 과정을 추적하여 깊이 있는 이해를 시작합니다.",
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  {
    icon: LinkIcon,
    title: "2. 메모 진화",
    description: "중요성 인식부터 맥락 기록, 지식 연결, 심상 형성까지 4단계로 메모가 진화합니다.",
    color: "text-indigo-600",
    bg: "bg-indigo-100",
  },
  {
    icon: Award,
    title: "3. 지식 연결",
    description: "링크 추가를 통해 관련된 지식을 하나의 메모카드에서 등록 관리합니다. 개념 간 관계를 시각적으로 확인하고 지식 네트워크를 구축하세요.",
    color: "text-purple-600",
    bg: "bg-purple-100",
  },
  {
    icon: BookOpen,
    title: "4. 플래시카드",
    description: "직접 만드는 복습용 문제카드로 장기기억을 체계적으로 훈련합니다. 중요한 개념을 질문과 답변 형태로 만들어 암기 효과를 극대화하세요.",
    color: "text-green-600",
    bg: "bg-green-100",
  },
  {
    icon: FileText,
    title: "5. 단권화",
    description: "분산된 지식을 하나의 통합된 문서로 정리합니다. 핵심 내용을 체계적으로 구조화합니다.",
    color: "text-orange-600",
    bg: "bg-orange-100",
  },
  {
    icon: Zap,
    title: "6. AI-Link 생성",
    description: "모든 학습 과정이 하나의 지식 캡슐로 모여 AI가 이해할 수 있는 형태로 변환됩니다. 이 캡슐을 AI에 입력하면 매번 같은 맥락을 설명할 필요 없이 재사용할 수 있습니다.",
    color: "text-red-600",
    bg: "bg-red-100",
  }
];

export default function HowItWorksSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
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
            학습 가속기, 6단계 지식 발전 과정
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            생각 추가부터 AI-Link 생성까지, 지식을 체계적으로 발전시켜 학습 효율을 3배 향상시킵니다.
          </p>
        </motion.div>
        
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="relative"
          >
            {steps.map((step) => (
              <motion.div
                key={step.title}
                variants={itemVariants}
                className="relative flex items-start gap-6 sm:gap-8 mb-10 last:mb-0"
              >
                <div className="flex-shrink-0 flex flex-col items-center pt-1">
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-full ${step.bg} border-4 border-white shadow-lg`}>
                     <step.icon className={`w-8 h-8 sm:w-10 sm:h-10 ${step.color}`} />
                  </div>
                </div>
                <div className="text-left">
                  <h3 className={`text-xl sm:text-2xl font-bold text-gray-800 mb-2`}>
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed max-w-prose">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="mt-8 lg:mt-0"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
               <Image
                src="/images/how-it-works-ai-link.png"
                alt="AI-Link 사용 예시"
                width={1200}
                height={750}
                className="object-cover w-full h-full"
              />
            </div>
             <p className="mt-6 text-center text-gray-600 font-medium">
              하나의 <span className="text-indigo-600 font-semibold">'AI-Link'</span>로, 딥 리서치, 글쓰기, 이미지/영상 생성까지. <br/>모든 AI의 성능을 극대화하세요.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 