'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FiBox, FiCpu, FiGitMerge, FiZap } from 'react-icons/fi';
import AMFAAnimation from './AMFAAnimation';

const steps = [
  {
    icon: FiBox,
    title: "1. 지식 DNA 정제 (Refine)",
    description: "당신의 모든 지적 활동에서 발생하는 파편화된 정보들을 포착하고, 핵심 아이디어만을 선별합니다. 노이즈를 제거하고 가치 있는 지식의 본질만을 추출하여, 당신만의 고유한 '지식 DNA'를 정제합니다."
  },
  {
    icon: FiGitMerge,
    title: "2. 지식 DNA 구조화 (Structure)",
    description: "정제된 지식들 사이의 관계망을 형성하고, 시맨틱 타임라인을 적용하여 지식의 발전 과정을 추적합니다. 단순한 정보 나열이 아닌, 당신의 사고 흐름과 인과관계를 반영한 입체적인 지식 구조를 완성합니다."
  },
  {
    icon: FiCpu,
    title: "3. AI-Link 생성 (Generate)",
    description: "구조화된 지식을 AI가 가장 효과적으로 이해할 수 있는 최적화된 캡슐 형태로 압축합니다. 복잡한 맥락을 AI용 언어로 번역하여, 당신의 지식 DNA가 온전히 보존된 'AI-Link'를 생성합니다."
  },
  {
    icon: FiZap,
    title: "4. 맥락 전송 (Transmit)",
    description: "생성된 AI-Link를 통해 당신의 지식 DNA를 AI에게 전송합니다. AI는 이제 당신의 경험과 사고방식을 완벽히 이해한 상태에서, 당신만을 위한 개인화된 고품질 결과물을 생성할 수 있게 됩니다."
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
              솔루션: <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">AI-Link</span>
            </h2>
            <h3 className="text-2xl sm:text-3xl font-semibold text-indigo-300 mb-6">
              시맨틱 타임라인 온톨로지 전송 엔진
            </h3>
            <p className="text-lg text-gray-400 max-w-xl leading-relaxed">
              AI-Link는 당신의 이력을 정제-구조화-전송하는 엔진입니다. 
              당신의 모든 지적 활동을 추적하여 인과관계를 형상화한 '고맥락 지식 그래프'를 생성하고, 
              이를 AI가 가장 편하게 받아들일 수 있는 형태로 전송합니다.
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