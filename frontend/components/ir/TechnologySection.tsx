'use client';
import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';

const techData = [
  {
    image: '/images/ir/temporal-knowledge-ontology-engine.png',
    title: 'The Data Moat: 시맨틱 타임라인 지식 그래프',
    description: "사용자의 모든 디지털 발자취를 시간과 맥락에 따라 연결하여, 파편화된 정보를 '고품질 지식 그래프'로 변환합니다. 이 데이터는 시간이 지날수록 강력해지며, 돈으로는 살 수 없는 우리만의 독점적 자산이 됩니다. 경쟁사는 이 깊이를 따라올 수 없습니다.",
  },
  {
    image: '/images/ir/4-step-knowledge-distillation-protocol.png',
    title: 'The Unfair Advantage: 4단계 지식 증류 프로토콜',
    description: "단순히 정보를 요약하는 것을 넘어, '정제-구조화-생성-전송'의 4단계 프로토콜을 통해 사용자의 암묵지를 AI가 이해할 수 있는 형식지로 변환합니다. 이 독점적인 프로세스는 우리의 기술적 해자(Moat)를 만듭니다.",
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
            우리의 해자는 단일 기술이 아닌, 세 가지 핵심 엔진이 유기적으로 결합된 '지능 증강 시스템'입니다. 하나를 모방하더라도, 전체 시스템이 만들어내는 시너지는 결코 따라올 수 없습니다.
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