import React from 'react';
// Using react-icons/fi for consistency and to resolve potential type issues
import { FiDatabase, FiEdit, FiAward, FiStar } from 'react-icons/fi'; 

export default function ZengoMyVerseTeaserSection() {
  return (
    // Premium dark background with gradient
    <section className="py-20 md:py-28 bg-gradient-to-br from-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 text-center max-w-4xl">
        
        <FiStar className="w-12 h-12 mx-auto mb-4 text-indigo-400" /> 
        
        <h2 className="text-3xl md:text-4xl font-bold mb-5 leading-tight">
          당신에게 꼭 필요한 지식들을<br className="sm:hidden" /> <span className="text-yellow-400">더욱 선명하게 간직하는 법</span>
        </h2>
        <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
          ZenGo 마이버스: 즐거운 몰입으로 만드는 <strong className="text-white font-semibold">나만의 지식 저장고</strong>
        </p>

        <div className="grid md:grid-cols-3 gap-8 md:gap-10 mb-12 text-left">
          {/* Feature 1: Custom Content */}
          <div className="flex items-start space-x-4">
            <FiEdit className="w-8 h-8 text-indigo-400 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">꼭 기억해야 할 것들</h3>
              <p className="text-sm md:text-base text-gray-400">
                시험 문제, 업무 매뉴얼, 외국어 공부 등 어떤 것이든 간단히 제압하세요.
              </p>
            </div>
          </div>
          {/* Feature 2: Targeted Training */}
          <div className="flex items-start space-x-4">
            <FiDatabase className="w-8 h-8 text-indigo-400 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">정교한 뇌과학적 설계</h3>
              <p className="text-sm md:text-base text-gray-400">
                떠올리기 쉬운 바둑판 위, 바둑돌을 이용해 기억을 DIY하세요.
              </p>
            </div>
          </div>
          {/* Feature 3: Engaging Gameplay */}
          <div className="flex items-start space-x-4">
             <FiAward className="w-8 h-8 text-indigo-400 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">단순 반복 암기 NO</h3>
              <p className="text-sm md:text-base text-gray-400">
                단순한 ZenGo 게임 룰로 즐기다 보면, 어느새 저절로 외워집니다.
              </p>
            </div>
          </div>
        </div>

        <p className="text-base md:text-lg text-gray-500 italic mt-10">
          ZenGo Myverse는 당신의 지식이 흩어지지 않도록 돕는 <strong className="text-gray-400">즐거운 여정</strong>입니다. (프리미엄 플랜)
        </p>
      </div>
    </section>
  );
} 