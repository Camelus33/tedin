'use client';
import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';

const techData = [
  {
    image: '/images/ir/temporal-knowledge-ontology-engine.png',
    title: 'The Learning Moat: 시간진화형 학습 온톨로지',
    description: "학습자의 모든 학습 활동을 시간순으로 구조화하여, 단순한 정보가 아닌 '학습 진화 과정'을 지식캡슐로 기록합니다. 이 데이터는 학습할수록 더 정확해지며, 개인만의 독특한 학습 패턴을 만들어냅니다. 경쟁사는 이 깊이를 따라올 수 없습니다.",
  },
  {
    image: '/images/ir/4-step-knowledge-distillation-protocol.png',
    title: 'The Acceleration Engine: 4단계 학습 가속 프로토콜',
    description: "단순히 내용을 요약하는 것을 넘어, '포착-구조화-최적화-단축'의 4단계 프로토콜을 통해 복잡한 학습 내용을 AI가 즉시 추론할 수 있는 지식캡슐 형태로 변환합니다. 이 독점적인 프로세스는 학습 효율을 획기적으로 향상시킵니다.",
  },
  // {
  //   image: '/images/ir/creative-persona-engine.png',
  //   title: 'The Personalization Core: Creative Persona Engine',
  //   description: "지식 그래프를 바탕으로 사용자의 고유한 '창의적 페르소나'를 모델링합니다. AI는 이 페르소나를 기반으로 사용자의 스타일, 톤, 관점을 완벽하게 모방하여, 단순한 정보가 아닌 '지적 파트너'로서의 결과물을 제공합니다.",
  // },
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
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };
  
  return (
    <section 
      id="technology" 
      className="py-20 md:py-32 bg-slate-900 text-white overflow-hidden"
    >
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center tracking-tight">
            Our Technological <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Moat</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-400 mb-16 text-center max-w-3xl mx-auto leading-relaxed">
            우리의 해자는 단일 기술이 아닌, 두 가지 핵심 엔진이 유기적으로 결합된 '학습 가속 시스템'입니다. 하나를 모방하더라도, 전체 시스템이 만들어내는 학습 효율성은 결코 따라올 수 없습니다.
          </p>
        </motion.div>

        <motion.div 
          className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {techData.map((tech, index) => (
            <React.Fragment key={index}>
              <motion.div
                className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 text-center flex flex-col items-center shadow-lg hover:border-cyan-400/50 hover:bg-gray-800/60 transition-all duration-300 w-full md:w-1/3"
                variants={itemVariants}
              >
                <div className="relative w-full h-48 mb-6 rounded-lg overflow-hidden">
                  <Image
                    src={tech.image}
                    alt={tech.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-100">{tech.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed flex-grow">{tech.description}</p>
              </motion.div>
              {index < techData.length - 1 && (
                <motion.div variants={itemVariants} className="hidden md:block">
                  <FiArrowRight className="w-10 h-10 text-cyan-500" />
                </motion.div>
              )}
            </React.Fragment>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TechnologySection; 