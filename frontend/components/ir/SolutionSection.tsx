'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FiBox, FiCpu, FiGitMerge, FiZap } from 'react-icons/fi';
import AMFAAnimation from './AMFAAnimation';

const steps = [
  {
    icon: FiBox,
    title: "1. Capture & Structure: 지식의 구조화",
    description: "당신의 모든 지적 활동(학업, 업무, 연구)에서 발생하는 파편화된 정보들을 포착하여, 온톨로지 기반의 '고맥락 지식 그래프'로 자동 구조화합니다. 모든 데이터는 단순한 점이 아닌, 관계를 가진 입자가 됩니다."
  },
  {
    icon: FiGitMerge,
    title: "2. Condense: 맥락의 응축",
    description: "구조화된 거대한 지식 그래프에서 현재의 과제 해결에 필요한 핵심 맥락만을 독점적인 알고리즘으로 추출하고 응축합니다. 이는 당신의 과거와 현재를 관통하는 사고의 흐름, 즉 '인과관계'를 찾아내는 과정입니다."
  },
  {
    icon: FiCpu,
    title: "3. Transmit: 지식 캡슐 전송",
    description: "응축된 핵심 맥락은 AI가 가장 효과적으로 이해할 수 있는 최적화된 데이터 패키지, 'AI-Link'로 변환되어 전송됩니다. 이는 단순한 정보 전달을 넘어, 당신의 의도와 경험을 AI에게 이식하는 것에 가깝습니다."
  },
  {
    icon: FiZap,
    title: "4. Alignment: AI 초개인화",
    description: "AI-Link를 수신한 AI는 더 이상 모호한 질문에 의존하지 않습니다. 당신의 고유한 맥락을 완벽하게 이해한 상태에서, 당신만을 위한 가장 정확하고 통찰력 있는 결과를 생성합니다. 당신과 AI는 비로소 하나의 팀이 됩니다."
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
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
              AMFA : <br/> 도메인 컨텍스트를 AI에 이식하다
            </h2>
            <p className="text-lg text-gray-400 max-w-xl">
              Habitus33의 핵심 기술 AMFA는, 당신의 모든 지적 활동을 추적하여 인과관계를 형상화한 '고맥락 지식 그래프 전송 엔진 '입니다. 온톨로지 기반 데이터 파이프라인을 통해 지식을 구조화, 응축, 전송하여 AI가 당신의 도메인 컨텍스트를 이해할 수 있게 합니다.
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