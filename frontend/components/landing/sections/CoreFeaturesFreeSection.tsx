import React from 'react';
import Link from 'next/link';
import { FiZap, FiBox, FiBarChart2, FiGift, FiArrowRight } from 'react-icons/fi';

export default function CoreFeaturesFreeSection() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="container mx-auto px-4 text-center max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-bold font-serif text-gray-800 mb-6">
          성장의 첫걸음, <br className="sm:hidden" /> 
          핵심 기능은 평생 무료입니다.
        </h2>
        <p className="text-lg md:text-xl text-gray-600 mb-16 max-w-3xl mx-auto">
          당신의 학습 피드백 루프를 점검하고, '나만의 리듬'을 찾는 핵심 경험을 비용 부담 없이 시작하세요.
        </p>
        
        <div className="grid md:grid-cols-3 gap-8 mb-16 text-left">
          <div className="bg-gray-50 border border-gray-200 p-8 rounded-2xl">
            <FiZap className="w-8 h-8 mb-4 text-blue-600" />
            <h3 className="font-semibold text-xl mb-2 text-gray-800">Atomic Reading (TS 모드)</h3>
            <p className="text-gray-600">짧고 강한 몰입으로 정보 처리 속도를 측정하고, 최적의 학습 리듬을 발견하세요.</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 p-8 rounded-2xl">
            <FiBox className="w-8 h-8 mb-4 text-purple-600" />
            <h3 className="font-semibold text-xl mb-2 text-gray-800">ZenGo (기본 모드)</h3>
            <p className="text-gray-600">핵심 정보를 얼마나 잘 붙잡아두는지, 당신의 작업 기억 용량을 직접 확인하세요.</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 p-8 rounded-2xl">
            <FiBarChart2 className="w-8 h-8 mb-4 text-green-600" />
            <h3 className="font-semibold text-xl mb-2 text-gray-800">개인 대시보드</h3>
            <p className="text-gray-600">당신의 모든 노력이 어떻게 성장으로 이어지는지, 변화의 과정을 한눈에 추적하세요.</p>
          </div> 
        </div>

        <div className="p-4 bg-blue-50 rounded-xl mb-10 max-w-2xl mx-auto">
          <p className="font-semibold text-blue-800 text-lg">
            <FiGift className="inline-block w-6 h-6 mr-2" />
            위 핵심 기능들이 추가 비용 없이, 평생 무료로 제공됩니다.
          </p>
        </div>

        <Link
          href="/auth/register"
          className="inline-flex items-center justify-center px-10 py-4 text-lg font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-transform duration-200 ease-in-out transform hover:scale-105 shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300 group"
        >
          나만의 성장 리듬 찾기 (무료)
          <FiArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
        </Link>

      </div>
    </section>
  );
} 