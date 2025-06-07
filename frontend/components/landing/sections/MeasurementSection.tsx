import React from 'react';
import { FiAward, FiPocket, FiCompass, FiTrendingUp } from 'react-icons/fi';

export default function MeasurementSection() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold font-serif text-gray-800 mb-6">
          나의 노력을 발견하고, 성장을 목격하세요.
        </h2>
        <p className="text-lg md:text-xl text-gray-600 mb-16 max-w-3xl mx-auto">
          당신의 잠재력이 어떻게 빛을 발하는지, 두 가지 핵심 경험으로 안내합니다.
        </p>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12 max-w-4xl mx-auto">
          {/* TS 모드 카드 */}
          <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-xl shadow-lg border border-gray-100 text-left flex flex-col h-full">
             <div className="flex items-center mb-4">
               <FiAward className="w-8 h-8 text-blue-600 mr-4 flex-shrink-0" />
               <h3 className="text-xl md:text-2xl font-semibold text-gray-800">Atomic Reading: 작고 강한 몰입</h3>
             </div>
             <p className="text-base md:text-lg text-gray-700 flex-grow">
               단 3분, 온전히 빠져드는 경험. 당신의 집중력이 가장 빛나는 <strong className="font-semibold text-blue-700">최적의 리듬</strong>을 찾아보세요.
             </p>
          </div>

          {/* ZenGo (기본) 카드 */}
          <div className="bg-gradient-to-br from-purple-50 to-white p-8 rounded-xl shadow-lg border border-gray-100 text-left flex flex-col h-full">
            <div className="flex items-center mb-4">
               <FiPocket className="w-8 h-8 text-purple-600 mr-4 flex-shrink-0" />
              <h3 className="text-xl md:text-2xl font-semibold text-gray-800">ZenGo: 기억의 선명함을 느껴보세요</h3>
            </div>
            <p className="text-base md:text-lg text-gray-700 flex-grow">
              정보를 얼마나 효과적으로 붙잡아두는지, 당신의 <strong className="font-semibold text-purple-700">작업 기억력(Working Memory) 크기</strong>를 직접 확인해 보세요.
            </p>
          </div>
        </div>
        
        <div className="mt-20 pt-16 border-t border-gray-200">
          <h3 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-12 md:mb-16 text-center">
            내 안의 성장 시스템, 피드백 루프
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-4xl mx-auto">
            
            <div className="flex flex-col items-center text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
              <FiCompass className="w-12 h-12 text-green-600 mb-5" />
              <h4 className="text-xl md:text-2xl font-semibold text-gray-800 mb-3">① 흔들릴 때, 방향을 되찾는 나침반</h4>
              <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-4">
                목표에서 멀어질 때, <strong className="text-green-700">다시 나아갈 힘</strong>을 주는 당신 안의 시스템입니다.
              </p>
              <p className="text-sm md:text-base text-gray-500 italic bg-green-50 p-4 rounded-lg">
                <strong>예시:</strong> '매일 책읽기' 다짐이 무너졌을 때, <strong className="font-medium">3분의 짧은 독서로 다시 리듬을 찾는 것.</strong>
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
              <FiTrendingUp className="w-12 h-12 text-orange-600 mb-5" />
              <h4 className="text-xl md:text-2xl font-semibold text-gray-800 mb-3">② 좋을 때, 가속도가 붙는 엔진</h4>
              <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-4">
                작은 성공의 경험이 <strong className="text-orange-700">더 큰 성장을 이끄는</strong> 당신 안의 동력입니다.
              </p>
              <p className="text-sm md:text-base text-gray-500 italic bg-orange-50 p-4 rounded-lg">
                <strong>예시:</strong> 새로운 지식 하나를 명확히 이해한 <strong className="font-medium">작은 성취감이 더 큰 학습 의욕으로 이어지는 것.</strong>
              </p>
            </div>

          </div>

           <p className="mt-16 text-center text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
             Habitus33은 당신 안에 잠들어 있는 <strong className="font-semibold text-indigo-700">강력한 성장 시스템</strong>을 깨우는, 단 하나의 열쇠입니다.
           </p>
           
           <p className="mt-10 text-center text-sm md:text-base text-gray-500 italic max-w-2xl mx-auto">
             "시스템에 귀 기울이면, 우리는 상상 이상의 곳에 도달할 수 있습니다."<br/>- 도넬라 메도우즈. MIT
           </p>
        </div>
      </div>
    </section>
  );
} 