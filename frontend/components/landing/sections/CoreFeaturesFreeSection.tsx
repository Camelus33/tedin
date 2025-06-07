import React from 'react';
import Link from 'next/link';
import { FiCheckSquare, FiGift, FiArrowRight, FiZap, FiCpu, FiAward } from 'react-icons/fi'; // Placeholder icons

export default function CoreFeaturesFreeSection() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 text-center max-w-4xl">
        <h2 className="text-3xl md:text-4xl font-bold font-serif text-brand-primary mb-6">
          가장 중요한 첫걸음, <br className="sm:hidden" /> 
          <span className="text-brand-primary">당신의 리듬을 찾는 일</span>부터.
        </h2>
        
        <div className="grid sm:grid-cols-3 gap-6 md:gap-8 my-10 text-left">
          <div className="bg-brand-secondary p-6 rounded-lg">
            <FiZap className="w-8 h-8 mb-3 text-brand-primary" />
            <h3 className="font-semibold text-lg mb-2 text-gray-900">Atomic Reading</h3>
            <p className="text-sm text-gray-700">짧고 깊게 읽으며 뇌의 과부하를 막는 새로운 읽기 습관</p>
          </div>
          <div className="bg-brand-secondary p-6 rounded-lg">
            <FiCpu className="w-8 h-8 mb-3 text-brand-accent-sage" />
            <h3 className="font-semibold text-lg mb-2 text-gray-900">AI 피드백</h3>
            <p className="text-sm text-gray-700">나의 상태를 객관적으로 알려주는 인공지능 코치</p>
          </div>
          <div className="bg-brand-secondary p-6 rounded-lg">
            <FiAward className="w-8 h-8 mb-3 text-brand-accent-orange" />
            <h3 className="font-semibold text-lg mb-2 text-gray-900">장기 기억 강화</h3>
            <p className="text-sm text-gray-700">핵심만 골라, 잊히지 않는 지식으로 만드는 기억 게임</p>
          </div>
        </div>

        <div className="inline-flex items-center justify-center p-3 px-6 bg-emerald-100 rounded-full mb-10">
          <FiGift className="w-6 h-6 text-emerald-700 mr-3" />
          <p className="font-bold text-emerald-800 text-lg md:text-xl">
            핵심 기능 평생 무료!
          </p>
        </div>

        <Link
          href="/auth/register"
          className="inline-flex items-center justify-center px-8 py-3 text-lg md:text-xl font-semibold text-white bg-brand-primary rounded-md hover:opacity-90 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary group"
        >
          나만의 학습 리듬 찾기 (무료)
          <FiArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Link>

      </div>
    </section>
  );
} 