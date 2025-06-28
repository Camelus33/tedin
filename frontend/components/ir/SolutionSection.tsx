'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FiBox, FiCpu, FiGitMerge, FiZap } from 'react-icons/fi';
import AMFAAnimation from './AMFAAnimation';

const steps = [
  {
    icon: FiBox,
    title: "1. Capture & Refine: 가치있는 지식 포착",
    description: "개인의 모든 디지털 활동에서 핵심 아이디어와 유의미한 데이터만 정확히 포착하고 정제하여 노이즈를 제거합니다."
  },
  {
    icon: FiGitMerge,
    title: "2. Structure & Contextualize: 맥락적 지식망 구축",
    description: "정제된 지식들을 연결하고 시간과 인과관계에 따라 구조화하여, AI가 사용자의 사고 흐름을 이해할 수 있는 '지식 그래프'를 생성합니다."
  },
  {
    icon: FiCpu,
    title: "3. Generate & Encapsulate: AI-Link 생성",
    description: "거대한 지식 그래프를 AI가 즉시 이해하고 활용할 수 있도록, 최적화된 고농축 데이터 캡슐인 'AI-Link'로 변환합니다."
  },
  {
    icon: FiZap,
    title: "4. Transmit & Augment: AI 지능 증강",
    description: "AI-Link를 통해 AI에게 '기억'과 '맥락'을 주입합니다. AI는 비로소 사용자의 의도를 완벽히 이해하고, 비용 효율적인 초개인화 결과물을 생성합니다."
  }
];

const SolutionSection = () => {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start end', 'end start']
  });

  // A simple representation of the animation stages based on scroll progress
  const opacityStep1 = useTransform(scrollYProgress, [0.1, 0.25], [1, 0.2]);
  const opacityStep2 = useTransform(scrollYProgress, [0.25, 0.45, 0.5], [0.2, 1, 0.2]);
  const opacityStep3 = useTransform(scrollYProgress, [0.5, 0.65, 0.7], [0.2, 1, 0.2]);
  const opacityStep4 = useTransform(scrollYProgress, [0.7, 0.9], [0.2, 1]);


  return (
    <section ref={targetRef} id="solution" className="relative bg-black text-white py-24 sm:py-40" style={{ minHeight: '300vh' }}>
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-16">
        
        {/* Sticky Visual Side */}
        <div className="sticky top-0 flex items-center justify-center h-screen">
          <div className="w-full max-w-md aspect-square rounded-2xl bg-gray-900/50 border border-indigo-800/50 p-4">
            <AMFAAnimation scrollYProgress={scrollYProgress} />
          </div>
        </div>

        {/* Scrolling Text Side */}
        <div className="relative pt-16">
          <div className="text-left mb-16" style={{ height: '100vh' }}>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              The Solution: <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">AI's External Brain</span>
            </h2>
            <h3 className="text-2xl sm:text-3xl font-semibold text-indigo-300 mb-6">
              AI-Link: AI에게 기억력과 지능을 부여하다
            </h3>
            <p className="text-lg text-gray-400 max-w-xl leading-relaxed">
              AI-Link는 AI의 근본적인 한계인 '컨텍스트 부족' 문제를 해결하는 독보적인 솔루션입니다. 사용자의 고유한 지식과 경험을 AI에게 '기억'시켜, 불필요한 API 호출과 토큰 낭비를 원천적으로 차단합니다. 그 결과, AI 운영 비용을 획기적으로 절감하고 진정한 초개인화 결과물을 얻을 수 있습니다.
            </p>
          </div>

          <div className="space-y-24">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start" style={{minHeight: '60vh'}}>
                <div className="bg-cyan-400/10 p-3 rounded-full mr-6 mt-1">
                  <step.icon className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                  <p className="text-gray-400 text-lg leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SolutionSection; 