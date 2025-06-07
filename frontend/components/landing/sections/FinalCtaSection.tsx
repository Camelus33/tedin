import React from 'react';
import Link from 'next/link';
import { FiArrowRight, FiCheckCircle } from 'react-icons/fi'; 

export default function FinalCtaSection() {
  return (
    <section className="py-20 md:py-28 bg-brand-primary text-white">
      <div className="container mx-auto px-4 text-center max-w-3xl">
        <FiCheckCircle className="w-12 h-12 mx-auto mb-4 text-white/50" />
        <h2 className="text-3xl md:text-4xl font-bold font-serif mb-4 leading-tight">
          이제, 당신의 노력이<br className="sm:hidden" /> 헛되지 않도록.
        </h2>
        <p className="text-lg md:text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
          Habitus33과 함께 <strong className="font-semibold text-white">나만의 리듬을 찾고</strong>, 작은 노력도 온전히 성과로 이어지는 <strong className="font-semibold text-white">성장의 즐거움</strong>을 경험하세요.
        </p>

        <Link
          href="/auth/register" 
          className="inline-flex items-center justify-center px-8 py-3 md:px-10 md:py-4 text-lg md:text-xl font-bold text-brand-primary bg-white rounded-md hover:bg-gray-100 transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-primary focus:ring-white group"
        >
          나만의 리듬으로 성장하기
          <FiArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  );
} 