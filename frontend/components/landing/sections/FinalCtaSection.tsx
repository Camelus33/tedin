import React from 'react';
import Link from 'next/link';
import { FiArrowRight, FiCheckCircle } from 'react-icons/fi'; 

export default function FinalCtaSection() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
      <div className="container mx-auto px-4 text-center max-w-3xl">
        <FiCheckCircle className="w-12 h-12 mx-auto mb-4 text-white/80" />
        <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
          의미없는 노력에서 벗어나 <br className="sm:hidden" />당신을 깨우세요!
        </h2>
        <p className="text-lg md:text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
          지금 바로 Habitus33으로 당신의 능력을 <strong className="font-semibold text-white">무료로 진단</strong>하고, 33일간의 놀라운 <strong className="font-semibold text-white">변화</strong>를 직접 경험하세요!
        </p>

        <Link
          href="/auth/register" 
          className="inline-flex items-center justify-center px-8 py-3 md:px-10 md:py-4 text-lg md:text-xl font-bold text-indigo-700 bg-white rounded-md hover:bg-gray-100 transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-700 focus:ring-white group"
        >
          내 능력, 무료 진단 시작!
          <FiArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  );
} 