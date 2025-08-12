'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FiBox, FiCpu, FiGitMerge, FiZap } from 'react-icons/fi';
import AMFAAnimation from './AMFAAnimation';

const steps = [
  {
    icon: FiBox,
    title: "1. 메모 1줄",
    description: "핵심 논지를 한 문장으로 기록합니다."
  },
  {
    icon: FiGitMerge,
    title: "2. 최소 입력",
    description: "생각추가 1개, 기억강화 1칸, 링크+이유 1개."
  },
  {
    icon: FiCpu,
    title: "3. 저장 즉시 알림",
    description: "유사 사례 3가지를 자동으로 제시합니다."
  },
  {
    icon: FiZap,
    title: "4. 비교·점프·교정",
    description: "해당 메모로 이동해 비교하고, 체크리스트를 보완합니다."
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
              해결 방식
            </h2>
            <p className="text-lg text-gray-400 max-w-xl leading-relaxed">
              저장 순간, 과거 유사 사례 3가지를 보여 줍니다. 최소 입력으로 반복 실수를 줄이고, 결정 속도를 높입니다.
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