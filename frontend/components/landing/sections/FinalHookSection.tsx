import React from 'react';
import Link from 'next/link';
import { FiTrendingUp, FiArrowRight } from 'react-icons/fi'; 

export default function FinalHookSection() {
  return (
    <section className="py-20 md:py-24 bg-white">
      <div className="container mx-auto px-4 text-center max-w-3xl">
        <FiTrendingUp className="w-12 h-12 mx-auto mb-5 text-brand-primary" />
        <h2 className="text-3xl md:text-4xl font-bold font-serif text-brand-primary mb-5 leading-tight">
          이제, <br className="sm:hidden" /> 
          <span className="text-brand-primary"> 작은 시작도 큰 파도로 </span>보입니다.
        </h2>
        <p className="text-lg md:text-xl text-gray-700 mb-10 max-w-2xl mx-auto">
          HABITUS33은 당신의 모든 학습을 기억합니다. 이제 첫 파문을 만들어보세요. <strong className="font-semibold text-gray-900">바로 지금.</strong>
        </p>

        <Link
          href="/auth/register" 
           className="inline-flex items-center justify-center px-8 py-3 md:px-10 md:py-4 text-lg md:text-xl font-semibold text-white bg-brand-primary rounded-md hover:opacity-90 transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary group"
        >
          첫 파도 만들기
          <FiArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  );
} 