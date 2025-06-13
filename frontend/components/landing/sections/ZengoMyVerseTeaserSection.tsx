import React from 'react';
// Using react-icons/fi for consistency and to resolve potential type issues
import { FiDatabase, FiEdit, FiAward, FiStar, FiArrowRight } from 'react-icons/fi'; 
import Link from 'next/link';

export default function ZengoMyVerseTeaserSection() {
  return (
    // Premium dark background with gradient
    <section className="py-20 md:py-28 bg-gray-900 text-white">
      <div className="container mx-auto px-4 text-center max-w-5xl">
        
        <FiStar className="w-10 h-10 mx-auto mb-5 text-yellow-400" /> 
        
        <h2 className="text-3xl md:text-4xl font-bold font-serif mb-5 leading-tight">
          깊은 바다 속 보물 같은 지식이 있다면
        </h2>
        <p className="text-lg md:text-xl text-gray-300 mb-16 max-w-3xl mx-auto">
          ZenGo 마이버스는 당신의 가장 소중한 지식을 심해 속 보석처럼 선명하게 기억하도록 돕는 <strong className="text-white font-semibold">개인화된 기억 바다</strong>입니다. (프리미엄 플랜)
        </p>

        <div className="grid md:grid-cols-3 gap-8 mb-16 text-left">
          <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700">
            <FiEdit className="w-8 h-8 text-yellow-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">나만의 지식 파도 만들기</h3>
            <p className="text-gray-400">
              시험 과목, 업무 용어, 외국어 단어 등, 기억하고 싶은 어떤 지식이든 당신만의 학습 파도로 만들 수 있습니다.
            </p>
          </div>
          <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700">
            <FiDatabase className="w-8 h-8 text-yellow-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">뇌과학 기반의 파도 설계</h3>
            <p className="text-gray-400">
              단순 반복이 아닌, '인출'과 '간섭' 효과를 활용한 파도 방식으로 깊은 기억의 바다로 안내합니다.
            </p>
          </div>
          <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700">
             <FiAward className="w-8 h-8 text-yellow-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">즐거운 파도 타기 경험</h3>
            <p className="text-gray-400">
              즐겁게 파도를 타다 보면, 어느새 가장 중요한 지식들이 당신의 깊은 바다에 자리잡게 됩니다.
            </p>
          </div>
        </div>

        <Link
          href="/profile/upgrade" 
          className="inline-flex items-center justify-center px-8 py-3 text-lg font-semibold text-gray-900 bg-yellow-400 rounded-lg hover:bg-yellow-300 transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-yellow-400 group"
        >
          프리미엄 플랜 자세히 보기
          <FiArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  );
} 