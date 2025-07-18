'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FiBox, FiCpu, FiGitMerge, FiZap, FiTarget, FiTrendingUp, FiEye } from 'react-icons/fi';
import AMFAAnimation from './AMFAAnimation';

const steps = [
  {
    icon: FiBox,
    title: "1. 투자 메모 수집 & 정제",
    description: "증권분석 보고서, 투자일지, 뉴스 기사 등 모든 투자 관련 자료를 수집하고 핵심 정보만 정확히 추출하여 투자자의 관심사와 판단 근거를 파악합니다."
  },
  {
    icon: FiGitMerge,
    title: "2. 온톨로지 지식망 구축",
    description: "분산된 투자 메모들을 연결하고 시간순, 인과관계에 따라 구조화하여 투자자의 사고 패턴과 편향을 분석할 수 있는 '투자 지식 그래프'를 생성합니다."
  },
  {
    icon: FiCpu,
    title: "3. 편향 패턴 & 기회 분석",
    description: "온톨로지 AI가 투자자의 반복 실수 패턴과 편향을 진단하고, 동시에 놓치고 있는 숨은 투자기회를 발굴하여 개인화된 투자 인사이트를 생성합니다."
  },
  {
    icon: FiZap,
    title: "4. AI 진단 & 기회 제시",
    description: "AI-Link를 통해 투자자의 모든 맥락을 이해한 AI가 '내 투자 편향과 맹점을 진단해'라는 질문에 대해 정확한 진단과 함께 놓친 투자기회까지 제시합니다."
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
              The Solution: <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">편향 진단 & 기회 발굴 AI</span>
            </h2>
            <h3 className="text-2xl sm:text-3xl font-semibold text-indigo-300 mb-6">
              온톨로지 AI: 투자자의 반복 실수와 숨은 기회를 동시에 찾아내다
            </h3>
            <p className="text-lg text-gray-400 max-w-xl leading-relaxed">
              온톨로지 AI는 투자자의 근본적인 한계인 '편향 인지 부족'과 '기회 놓침' 문제를 동시에 해결하는 독보적인 솔루션입니다. 투자자의 모든 메모를 온톨로지로 분석하여 반복 실수 패턴을 진단하고, 동시에 놓치고 있는 숨은 투자기회까지 발굴합니다. 그 결과, 투자자는 자신의 편향을 인지하고 새로운 기회를 발견할 수 있습니다.
            </p>
            
            {/* 핵심 가치 강조 */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <FiTarget className="text-red-400 mr-2" size={20} />
                  <h4 className="text-red-400 font-semibold">편향 진단</h4>
                </div>
                <p className="text-red-300 text-sm">확증편향, 손실회피, 앵커링 등 투자자의 편향 패턴을 정확히 진단</p>
              </div>
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <FiEye className="text-green-400 mr-2" size={20} />
                  <h4 className="text-green-400 font-semibold">기회 발굴</h4>
                </div>
                <p className="text-green-300 text-sm">투자자가 놓치고 있는 숨은 투자기회를 발굴하여 새로운 수익 창출</p>
              </div>
            </div>
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