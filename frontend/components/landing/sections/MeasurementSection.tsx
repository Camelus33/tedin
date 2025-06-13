import React from 'react';
import { FiDroplet, FiLayers, FiCompass, FiTrendingUp } from 'react-icons/fi';

export default function MeasurementSection() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold font-serif text-gray-800 mb-6">
          작은 파도가 만드는 깊은 변화를 경험하세요
        </h2>
        <p className="text-lg md:text-xl text-gray-600 mb-16 max-w-3xl mx-auto">
          3분 읽고 1줄 메모에서 시작된 당신만의 학습 파도가 어떻게 확산되는지, 두 가지 핵심 경험으로 확인해보세요.
        </p>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12 max-w-4xl mx-auto">
          {/* Atomic Reading 카드 */}
          <div className="bg-gradient-to-br from-cyan-50 to-white p-8 rounded-xl shadow-lg border border-gray-100 text-left flex flex-col h-full">
             <div className="flex items-center mb-4">
               <FiDroplet className="w-8 h-8 text-cyan-600 mr-4 flex-shrink-0" />
               <h3 className="text-xl md:text-2xl font-semibold text-gray-800">Atomic Reading</h3>
             </div>
             <p className="text-base md:text-lg text-gray-700 flex-grow">
               3분 읽고 1줄 메모. 작은 물방울이 만드는 <strong className="font-semibold text-cyan-700">첫 번째 파문의 기적</strong>을 직접 경험해보세요.
             </p>
          </div>

          {/* ZenGo 카드 */}
          <div className="bg-gradient-to-br from-purple-50 to-white p-8 rounded-xl shadow-lg border border-gray-100 text-left flex flex-col h-full">
            <div className="flex items-center mb-4">
               <FiLayers className="w-8 h-8 text-purple-600 mr-4 flex-shrink-0" />
              <h3 className="text-xl md:text-2xl font-semibold text-gray-800">ZenGo</h3>
            </div>
            <p className="text-base md:text-lg text-gray-700 flex-grow">
              깊은 바다 속에서 정보를 얼마나 선명하게 기억하는지, 당신의 <strong className="font-semibold text-purple-700">심해 기억력</strong>을 확인해보세요.
            </p>
          </div>
        </div>
        
        <div className="mt-20 pt-16 border-t border-gray-200">
          <h3 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-12 md:mb-16 text-center">
            내 안의 파도 시스템, 자연스러운 성장 순환
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-4xl mx-auto">
            
            <div className="flex flex-col items-center text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
              <FiCompass className="w-12 h-12 text-green-600 mb-5" />
              <h4 className="text-xl md:text-2xl font-semibold text-gray-800 mb-3">① 잔잔할 때, 다시 파도를 일으키는 힘</h4>
              <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-4">
                학습이 멈췄을 때, <strong className="text-green-700">작은 시작으로 다시 파문을 만드는</strong> 당신 안의 복원력입니다.
              </p>
              <p className="text-sm md:text-base text-gray-500 italic bg-green-50 p-4 rounded-lg">
                <strong>예시:</strong> 독서가 끊겼을 때, <strong className="font-medium">3분 읽고 1줄 메모로 다시 파도를 시작하는 것.</strong>
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
              <FiTrendingUp className="w-12 h-12 text-blue-600 mb-5" />
              <h4 className="text-xl md:text-2xl font-semibold text-gray-800 mb-3">② 파도가 클 때, 더 깊은 바다로 나아가는 용기</h4>
              <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-4">
                작은 성공의 파문이 <strong className="text-blue-700">더 깊은 학습으로 확산되는</strong> 당신 안의 추진력입니다.
              </p>
              <p className="text-sm md:text-base text-gray-500 italic bg-blue-50 p-4 rounded-lg">
                <strong>예시:</strong> 1줄 메모가 연결되는 <strong className="font-medium">작은 깨달음이 더 깊은 탐구 욕구로 이어지는 것.</strong>
              </p>
            </div>

          </div>

           <p className="mt-16 text-center text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
             HABITUS33은 당신 안에 잠들어 있는 <strong className="font-semibold text-cyan-700">자연스러운 학습 파도</strong>를 깨우는, 단 하나의 열쇠입니다.
           </p>
           
           <p className="mt-10 text-center text-sm md:text-base text-gray-500 italic max-w-2xl mx-auto">
             "작은 변화가 큰 차이를 만든다. 파도는 작은 물방울에서 시작된다."<br/>- 학습 과학의 지혜
           </p>
        </div>
      </div>
    </section>
  );
} 