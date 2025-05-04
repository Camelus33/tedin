import React from 'react';
import Link from 'next/link';
import { FiCheckSquare, FiGift, FiArrowRight } from 'react-icons/fi'; // Placeholder icons

export default function CoreFeaturesFreeSection() {
  return (
    <section className="py-16 md:py-24 bg-indigo-50"> {/* Slightly different background */}
      <div className="container mx-auto px-4 text-center max-w-4xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-indigo-900">
          당신의 능력, <br className="sm:hidden" />지금  <span className="text-indigo-600">무료</span>로 확인하세요!
        </h2>
        
        <div className="grid sm:grid-cols-3 gap-6 md:gap-8 my-10 text-left">
          <div className="flex items-start space-x-3 p-4 bg-white/50 rounded-lg">
            <FiCheckSquare className="w-6 h-6 text-emerald-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-lg text-gray-800 mb-1">능력 측정</h3>
              <p className="text-gray-600 text-sm">TS 처리 속도 & ZenGo 처리 용량</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-4 bg-white/50 rounded-lg">
            <FiCheckSquare className="w-6 h-6 text-emerald-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-lg text-gray-800 mb-1">상태 확인</h3>
              <p className="text-gray-600 text-sm">33일 피드백 루프 설정</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-4 bg-white/50 rounded-lg">
            <FiCheckSquare className="w-6 h-6 text-emerald-600 mt-1 flex-shrink-0" />
             <div>
               <h3 className="font-semibold text-lg text-gray-800 mb-1">선순환 시작!</h3>
               <p className="text-gray-600 text-sm">측정-인지-개선-성장</p>
             </div>
          </div>
        </div>

         <div className="inline-flex items-center justify-center p-3 px-6 bg-emerald-100 rounded-full mb-10">
            <FiGift className="w-6 h-6 text-emerald-700 mr-3" />
            <p className="font-bold text-emerald-800 text-lg md:text-xl">
              핵심 기능은 평생 무료!
            </p>
          </div>


        <Link
          href="/auth/register" // Or link to the specific diagnostic tool if available
          className="inline-flex items-center justify-center px-8 py-3 text-lg md:text-xl font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 group"
        >
          내 능력, 지금 무료 진단!
          <FiArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Link>

      </div>
    </section>
  );
} 