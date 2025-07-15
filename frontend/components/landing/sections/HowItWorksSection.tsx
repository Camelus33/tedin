import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Database, Link as LinkIcon, Award } from 'lucide-react';

const steps = [
  {
    icon: Database,
    title: "심층 지식 온톨로지 구축",
    description: "불확실한 시장, 방대한 자료, 혹은 쌓여가는 정보 속에서 당신이 간과했을지 모르는 '숨은 신호'와 '간과한 연결고리'를 찾기 위해, 모든 투자 정보, 연구 데이터, 학습 기록을 지식 온톨로지로 정교하게 구조화합니다.",
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  {
    icon: LinkIcon,
    title: "온톨로지 기반 맥락 추론",
    description: "구축된 지식 온톨로지를 기반으로 '온톨로지 증강 맥락추론 AI'는 당신의 분석, 가설, 지식 체계에 존재하는 '사고의 비약'이나 '논리적 허점'을 깊이 있게 이해하고 정밀하게 진단하여, 빈틈없는 사고를 돕습니다.",
    color: "text-indigo-600",
    bg: "bg-indigo-100",
  },
  {
    icon: Award,
    title: "숨겨진 기회 및 통찰 제안",
    description: "AI는 방대한 지식 온톨로지 속에서 겉으로는 무관해 보이는 데이터들 간의 '숨겨진 연결성'과 '잠재적 기회'를 발굴하여, 투자 결정, 연구 방향 설정, 학습 효율에 치명적인 영향을 줄 수 있는 맹점을 제거하고 혁신적인 통찰을 제안합니다.",
    color: "text-purple-600",
    bg: "bg-purple-100",
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
            온톨로지 증강 맥락추론 AI
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            당신의 지적 성과를 극대화하는 세 가지 핵심 단계
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
              이제 AI는 단순한 정보 검색 도구를 넘어, 당신의 <span className="text-indigo-600 font-semibold">'가장 강력한 지적 파트너'</span>로서 비즈니스와 학업에서 압도적인 우위를 제공합니다.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 