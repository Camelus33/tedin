'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FiBox, FiCpu, FiGitMerge, FiZap } from 'react-icons/fi';
import AMFAAnimation from './AMFAAnimation';

const steps = [
  {
    icon: FiBox,
    title: "1. Capture & Structure: 학습 맥락 포착",
    description: "개인의 모든 학습 활동에서 핵심 개념과 이해 과정을 정확히 포착하고, 시간순으로 구조화하여 학습 진화 과정을 기록합니다."
  },
  {
    icon: FiGitMerge,
    title: "2. Evolve & Connect: 시간진화형 온톨로지 구축",
    description: "학습한 내용을 시간순으로 연결하고, 개념 간의 관계를 파악하여 AI가 학습자의 지식 진화 과정을 이해할 수 있는 '시간진화형 온톨로지'를 생성합니다."
  },
  {
    icon: FiCpu,
    title: "3. Optimize & Encapsulate: AI-Link 생성",
    description: "복잡한 학습 맥락을 AI가 즉시 추론하고 활용할 수 있도록, 최적화된 고농축 데이터 지식캡슐인 'AI-Link'로 변환합니다."
  },
  {
    icon: FiZap,
    title: "4. Accelerate & Review: 학습 가속 및 복습",
    description: "AI-Link를 통해 AI가 학습자의 맥락을 완벽히 이해하므로, NotebookLM의 동영상 오버뷰 이용시 강력한 복습 효과를 얻을 수 있습니다."
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
              The Solution: <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Learning Acceleration Engine</span>
            </h2>
            <h3 className="text-2xl sm:text-3xl font-semibold text-indigo-300 mb-6">
              AI-Link: 학습 맥락을 AI에게 기억시키다
            </h3>
            <p className="text-lg text-gray-400 max-w-xl leading-relaxed">
              AI-Link는 성인 학습자의 근본적인 한계인 '맥락 부족' 문제를 해결하는 독보적인 솔루션입니다. 학습자의 고유한 지식 진화 과정을 AI에게 '기억'시켜, 맥락추론이 가능한 강력한 학습 가속기를 제공합니다. 그 결과, 학습 시간을 획기적으로 단축하고 진정한 개인화된 복습 경험을 얻을 수 있습니다.
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