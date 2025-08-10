import React from 'react';
import Link from 'next/link';
import { ArrowRight, Zap } from 'lucide-react';

export default function FinalCtaSection() {
  return (
    <section className="py-24 sm:py-32 bg-gray-900 text-white">
      <div className="container mx-auto px-4 text-center max-w-3xl">
        <Zap className="w-12 h-12 mx-auto mb-6 text-indigo-400" />
        <h2 className="text-4xl md:text-5xl font-bold font-serif mb-6 leading-tight">
          생각의 흐름을 읽으면,<br />
          다음이 보입니다
        </h2>
        <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
          내가 자주 반복하는 생각, 깊어지는 타이밍, 확장되는 방향.<br />
          오늘부터 패턴을 기록해 보세요.
        </p>

        <Link
          href="/analytics"
          className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-500 group shadow-lg hover:shadow-indigo-500/50"
        >
          내 생각 패턴 확인하기
          <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  );
} 