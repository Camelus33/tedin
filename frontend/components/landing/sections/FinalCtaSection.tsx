import React from 'react';
import Link from 'next/link';
import { FiArrowRight, FiCheckCircle } from 'react-icons/fi'; 

export default function FinalCtaSection() {
  return (
    <section className="py-20 md:py-28 bg-brand-primary text-white">
      <div className="container mx-auto px-4 text-center max-w-3xl">
        <FiCheckCircle className="w-12 h-12 mx-auto mb-4 text-white/50" />
        <h2 className="text-3xl md:text-4xl font-bold font-serif mb-4 leading-tight">
          이제, 당신의 첫 파도를<br className="sm:hidden" /> 시작할 차례입니다.
        </h2>
        <p className="text-lg md:text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
          HABITUS33과 함께 <strong className="font-semibold text-white">작은 시작이 만드는 큰 변화</strong>를 경험하고, 
          <strong className="font-semibold text-white">당신만의 지식 바다</strong>를 탐험하세요.
        </p>

        <Link
          href="/auth/register" 
          className="inline-flex items-center justify-center px-8 py-3 md:px-10 md:py-4 text-lg md:text-xl font-bold text-brand-primary bg-white rounded-md hover:bg-gray-100 transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-primary focus:ring-white group"
        >
          첫 파도 시작하기
          <FiArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  );
} 