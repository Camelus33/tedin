'use client';
import React from 'react';

const IntroSection: React.FC = () => {
  return (
    <section className="bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          {/* 헤드라인 */}
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            내가 쓴 투자 메모에서<br />
            <span className="text-yellow-400">반복 실수를 찾아줍니다</span>
          </h1>
          
          {/* 서브텍스트 */}
          <p className="text-xl md:text-2xl mb-8 text-gray-200 leading-relaxed">
            온톨로지 AI가 당신의 모든 투자 메모를 분석하여,<br />
            보이지 않는 투자 허점과 반복 실수를 자동으로 진단합니다
          </p>
          
          {/* 브랜드 메시지 */}
          <div className="mb-8">
            <span className="inline-block bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full text-lg font-semibold">
              Habitus33 - 투자자를 위한 메모관리 온톨로지 서비스
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IntroSection; 