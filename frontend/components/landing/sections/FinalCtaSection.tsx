import React from 'react';
import Link from 'next/link';
import { ArrowRight, Zap } from 'lucide-react';

export default function FinalCtaSection() {
  return (
    <section className="py-24 sm:py-32 bg-gray-900 text-white">
      <div className="container mx-auto px-4 text-center max-w-3xl">
        <Zap className="w-12 h-12 mx-auto mb-6 text-indigo-400" />
        <h2 className="text-4xl md:text-5xl font-bold font-serif mb-6 leading-tight">
          지금 당신의 학습을 가속화하세요
        </h2>
        <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
          지식의 새로운 성장을 경험하세요.
        </p>

        <Link
          href="/auth/register"
          className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-500 group shadow-lg hover:shadow-indigo-500/50"
        >
          무료 사용하기
          <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  );
} 