import React from 'react';
import { FiZap, FiGrid, FiTarget, FiTrendingUp } from 'react-icons/fi'; // Placeholder icons

export default function MeasurementSection() {
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
          당신의 성장, 어떻게 측정하고 가속할까요?
        </h2>
        <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
          잠재력을 깨우는 핵심, 정보 처리 속도와 용량을 파악하세요.
        </p>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12 max-w-4xl mx-auto">
          {/* TS 모드 카드 - Responsive padding and text size */}
          <div className="bg-white p-6 md:p-8 rounded-lg shadow-md text-left flex flex-col h-full">
             <div className="flex items-center mb-4">
               <FiZap className="w-8 h-8 text-indigo-600 mr-3 flex-shrink-0" />
               {/* Responsive heading size */}
               <h3 className="text-lg md:text-xl font-semibold text-gray-800">TS: 얼마나 빠르게 받아 들이나요?</h3>
             </div>
             {/* Responsive paragraph size */}
             <p className="text-sm md:text-base text-gray-600 flex-grow">
               얼마나 빠르게 <strong className="text-indigo-700">페이지 단위로 정보를 흡수하는지</strong> 측정하며, 
               <strong className="text-indigo-700">당신의 속도</strong>를 확인해 보세요.
             </p>
          </div>

          {/* ZenGo (기본) 카드 - Responsive padding and text size */}
          <div className="bg-white p-6 md:p-8 rounded-lg shadow-md text-left flex flex-col h-full">
            <div className="flex items-center mb-4">
               <FiGrid className="w-8 h-8 text-emerald-600 mr-3 flex-shrink-0" />
               {/* Responsive heading size */}
              <h3 className="text-lg md:text-xl font-semibold text-gray-800">ZenGo: 얼마나 많이 떠올릴 수 있나요?</h3>
            </div>
             {/* Responsive paragraph size */}
            <p className="text-sm md:text-base text-gray-600 flex-grow">
              한 번에 얼마나 많이 <strong className="text-emerald-700">기억 속에 붙잡아 둘 수 있는지</strong>, 바둑 원리를 활용한 게임으로 
              <strong className="text-emerald-700">당신의 용량</strong>을 확인해 보세요.
            </p>
          </div>
        </div>

        {/* Responsive text size for concluding paragraph */}
        {/*
        <p className="mt-12 text-lg md:text-xl text-gray-700">
          이 두 가지 핵심 지표를 통해 현재 나의 작업 기억력 상태를 명확히 인지할 수 있습니다.
        </p>
        */}

        {/* --- 아이콘 중심의 2x2 그리드 피드백 루프 설명 --- */}
        <div className="mt-16 pt-12 border-t border-gray-200">
          <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-10 md:mb-12 text-center">
            잠재력 가속 엔진 : 피드백 루프
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-4xl mx-auto">
            
            {/* Card 1: 안정화 피드백 루프 (Balancing Loop) */}
            <div className="flex flex-col items-center text-center p-6 md:p-8 bg-white rounded-lg shadow-md border border-gray-100">
              <FiTarget className="w-12 h-12 text-blue-600 mb-4" />
              <h4 className="text-lg md:text-xl font-semibold text-gray-800 mb-3">① 안정화 루프</h4>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed mb-4">
                목표에서 멀어졌다고 느낄 때, <strong className="text-blue-700">다시 제자리로 돌아오도록</strong> 방향을 잡아주는 당신 안의 나침반입니다.
              </p>
              <p className="text-xs md:text-sm text-gray-500 italic bg-blue-50 p-3 rounded">
                <strong>예시:</strong> '매일 영어 공부' 다짐이 무너질 때, <strong className="font-medium">작은 도전으로 다시 동기 부여</strong>를 받는 당신의 모습처럼, 다시 돌아오도록 돕습니다.
              </p>
            </div>

            {/* Card 2: 강화 피드백 루프 (Reinforcing Loop) */}
            <div className="flex flex-col items-center text-center p-6 md:p-8 bg-white rounded-lg shadow-md border border-gray-100">
              <FiTrendingUp className="w-12 h-12 text-purple-600 mb-4" />
              <h4 className="text-lg md:text-xl font-semibold text-gray-800 mb-3">② 강화 루프 </h4>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed mb-4">
                작은 성취가 다음 행동을 이끌며, <strong className="text-purple-700">성장에 점점 가속도가 붙게</strong> 하는 당신 안의 엔진입니다.
              </p>
              <p className="text-xs md:text-sm text-gray-500 italic bg-purple-50 p-3 rounded">
                <strong>예시:</strong> 새로운 지식 하나를 외운 <strong className="font-medium">작은 기쁨이 더 큰 학습 의욕</strong>으로 이어져, 어느새 훌쩍 성장한 당신을 발견하는 경험입니다.
              </p>
            </div>

          </div>

           {/* 최종 요약 메시지 */}
           <p className="mt-12 text-center text-base md:text-lg text-gray-700 max-w-3xl mx-auto">
             Habitus33은 이 <strong className="font-semibold text-indigo-700"> 가속 엔진</strong>을 깨워,<strong className="font-semibold text-indigo-700"> 잠재력</strong>을 계속 일깨웁니다
           </p>

           {/* Updated Quote */}
           <p className="mt-10 text-center text-xs md:text-sm text-gray-500 italic max-w-2xl mx-auto">
             "자신의 시스템에 귀 기울이면 더 편안하게 멀리 나아갈 수 있습니다."<br/>- 도넬라 메도우즈. MIT
           </p>
        </div>
        {/* --- 피드백 루프 설명 섹션 끝 --- */}
      </div>
    </section>
  );
} 