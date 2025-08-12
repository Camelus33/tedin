'use client';
import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';

const techData = [
  {
    image: '/images/ir/temporal-knowledge-ontology-engine.png',
    title: '입력 소스 확장',
    description: '메모 본문 + 생각추가(≤5) + 기억강화 4칸 + 링크 이유(≤5)를 하나로 묶어 비교합니다.',
  },
  {
    image: '/images/ir/4-step-knowledge-distillation-protocol.png',
    title: '유사도 계산 & 시간 가중',
    description: '의미 유사도(임베딩) + 문자열 유사도(폴백). 요일·시간대·작성 간격이 비슷할수록 가중합니다.',
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
            저장 즉시 유사 사례를 찾는 방법
          </h2>
          <p className="text-lg md:text-xl text-gray-400 mb-16 text-center max-w-3xl mx-auto leading-relaxed">
            메모의 뜻과 상황을 함께 반영해 비교합니다. 목적은 빠른 교정 행동입니다.
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
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            참고: 
            <a href="https://www.morningstar.com/lp/mind-the-gap" target="_blank" rel="noreferrer" className="underline hover:text-gray-300">Morningstar Mind the Gap</a>,
            <a href="https://www.dalbar.com/Products-and-Services/QAIB" target="_blank" rel="noreferrer" className="underline hover:text-gray-300 ml-2">DALBAR QAIB</a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default TechnologySection; 