import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Database, Link as LinkIcon, Award } from 'lucide-react';

const steps = [
  {
    icon: Database,
    title: "1. 지식 베이스 구축",
    description: "당신의 메모, 문서, 기록이 모여 관점을 담은 '지식 베이스'가 됩니다. 당신처럼 생각하는 AI 두뇌가 탄생합니다.",
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  {
    icon: LinkIcon,
    title: "2. AI-Link 생성",
    description: "작업을 요청하면 목표와 지식 베이스가 결합한 만능 설계도 'AI-Link'가 즉시 생성됩니다.",
    color: "text-indigo-600",
    bg: "bg-indigo-100",
  },
  {
    icon: Award,
    title: "3. 맞춤 결과물 도출",
    description: "AI-Link 하나로 텍스트, 이미지, 영상 AI를 조종하세요. 차원이 다른 결과물을 얻게 됩니다.",
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
            AI 행동 설계, 3단계 프로세스
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            당신의 생각과 AI의 능력이 만나, 최고의 결과물을 만드는 과정입니다.
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