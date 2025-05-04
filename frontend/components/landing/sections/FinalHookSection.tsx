import React from 'react';
import Link from 'next/link';
import { FiTrendingUp, FiArrowRight } from 'react-icons/fi'; 

export default function FinalHookSection() {
  return (
    <section className="py-20 md:py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 text-center max-w-3xl">
        <FiTrendingUp className="w-12 h-12 mx-auto mb-5 text-indigo-600" />
        <h2 className="text-3xl md:text-4xl font-bold mb-5 text-gray-900 leading-tight">
          이제, <br className="sm:hidden" /> 
          <span className="text-indigo-600"> 매일 성장 </span>하세요.
        </h2>
        <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          데이터는 거짓말하지 않습니다. 이제 당신의 노력을 증명할 시간입니다. <strong className="text-gray-800">지금 시작</strong>
        </p>

        <Link
          href="/auth/register" 
           // Change button style to primary CTA style (solid indigo) for final push
           className="inline-flex items-center justify-center px-8 py-3 md:px-10 md:py-4 text-lg md:text-xl font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 group"
        >
          내 능력, 무료 진단!
          <FiArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  );
} 