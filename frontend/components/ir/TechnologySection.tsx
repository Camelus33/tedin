'use client';
import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const techData = [
  {
    image: '/images/ir/temporal-knowledge-ontology-engine.png',
    title: '시맨틱 타임라인을 적용한 지식 온톨로지 엔진',
    description:
      "기존 지식 관리가 '무엇을' 아는지에 집중했다면, Habitus33은 '언제' 학습했고 '어떤 순서로' 지식이 연결되었는지 추적하여 지식의 4차원 지도를 완성합니다. 이 '시맨틱 타임라인' 기술은 AI가 사용자의 고유한 생각의 흐름과 지식의 발전 과정을 입체적으로 이해하게 만듭니다. 이는 프롬프트 없이 최적의 지식 캡슐 'AI-Link'를 생성하는 핵심 동력입니다.",
  },
  {
    image: '/images/ir/4-step-knowledge-distillation-protocol.png',
    title: 'AI-Link™: 4단계 지식 증류 프로토콜',
    description:
      "5년간의 연구로 완성된 '정제-구조화-응축-전송' 4단계 프로토콜은 사용자의 생각을 정제하여 지식의 본질만 추출합니다. 1)핵심 아이디어 선별, 2)관계망 형성, 3)AI용 캡슐 압축, 4)AI-Link 전송 과정을 통해, 복잡한 아이디어를 AI가 즉시 이해하는 순수한 형태로 증류합니다. 이는 AI와의 상호작용을 극적으로 단순화하는 Habitus33의 핵심 경쟁력입니다.",
  },
];

const TechnologySection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };
  
  return (
    <section 
      id="technology" 
      className="py-20 md:py-32 bg-gray-900 text-white overflow-hidden"
    >
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
        style={{backgroundImage: "url('https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1950&q=80')"}}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center tracking-tight">
            강력한 도메인 인사이트, 시장 지배력 확보
          </h2>
          <p className="text-lg md:text-xl text-gray-400 mb-16 text-center max-w-3xl mx-auto leading-relaxed">
            Habitus33의 핵심 기술은 경쟁사가 쉽게 모방할 수 없는 지식관리 '암묵지'에 기반해 깊은 해자(Moat)를 구축했습니다.
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {techData.map((tech, index) => (
            <motion.div
              key={index}
              className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 text-center flex flex-col items-center shadow-lg hover:border-cyan-400/50 hover:bg-gray-800/60 transition-all duration-300"
              variants={itemVariants}
            >
              <div className="relative w-full h-56 mb-6 rounded-lg overflow-hidden">
                <Image
                  src={tech.image}
                  alt={tech.title}
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-100">{tech.title}</h3>
              <p className="text-gray-400 leading-relaxed">{tech.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TechnologySection; 