'use client';
import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const techData = [
  {
    image: '/images/ir/temporal-knowledge-ontology-engine.png',
    title: '시맨틱 온톨로지 엔진: 지식 DNA 매핑',
    description:
      "기존 AI가 단순히 '무엇을' 아는지만 처리했다면, 우리의 엔진은 '언제, 어떤 맥락에서, 어떤 순서로' 지식이 형성되었는지까지 추적합니다. 개인의 학습 이력, 사고 패턴, 전문 영역을 시간축으로 구조화한 4차원 지식 지도를 생성하여, AI가 사용자의 고유한 인지 구조를 완벽히 이해하게 만듭니다. 이는 47%의 AI 환각 문제를 근본적으로 해결하는 핵심 기술입니다.",
  },
  {
    image: '/images/ir/4-step-knowledge-distillation-protocol.png',
    title: 'AI-Link™ 보안 프로토콜: 지식 DNA 캡슐화',
    description:
      "메모→연결→단권화→AI-Link 생성의 4단계를 통해 개인의 복잡한 지식 구조를 AI가 즉시 이해할 수 있는 압축된 형태로 변환합니다. 독자적인 지식 증류 알고리즘이 핵심 인사이트만 추출하고, 암호화된 시맨틱 캡슐로 패키징하여 AI에게 전송합니다. 이 과정에서 개인정보는 완전히 보호되며, AI는 마치 사용자의 뇌 구조를 이해한 것처럼 정확한 답변을 생성합니다.",
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
            핵심 기술: <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">AI-Link</span> 엔진
          </h2>
          <p className="text-lg md:text-xl text-gray-400 mb-16 text-center max-w-3xl mx-auto leading-relaxed">
            5년간의 연구개발로 완성된 지식 DNA 전송 기술, 경쟁사가 모방할 수 없는 깊은 기술적 해자를 구축했습니다.
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