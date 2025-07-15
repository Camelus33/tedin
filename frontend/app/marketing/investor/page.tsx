'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';

export default function HighStressStudentsPage() {
  const slidesRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement;
          element.style.opacity = '1';
          element.style.transform = 'translateY(0)';
        }
      });
    }, observerOptions);

    slidesRef.current.forEach(slide => {
      if (slide) {
        slide.style.opacity = '0';
        slide.style.transform = 'translateY(30px)';
        slide.style.transition = 'all 0.6s ease-out';
        observer.observe(slide);
      }
    });

    return () => observer.disconnect();
  }, []);

  const addSlideRef = (el: HTMLDivElement | null) => {
    if (el && !slidesRef.current.includes(el)) {
      slidesRef.current.push(el);
    }
  };

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    target.style.transform = 'scale(0.95)';
    setTimeout(() => {
      target.style.transform = '';
    }, 150);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-indigo-950 text-white overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-5 py-5">
        
        {/* Hero Slide */}
        <div 
          ref={addSlideRef}
          className="bg-gradient-to-br from-blue-500/8 to-indigo-600/8 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-8 sm:p-12 md:p-16 mb-6 sm:mb-10 
                     shadow-2xl border border-blue-500/20 transition-all duration-500 ease-out
                     hover:transform hover:-translate-y-2 hover:shadow-3xl hover:border-blue-500/30 text-center"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 sm:mb-8 tracking-tight leading-tight">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              중요한 투자결정,
            </span>
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent 
                           drop-shadow-lg hover:drop-shadow-2xl transition-all duration-300 
                           hover:scale-105 inline-block cursor-default">
              {' '}어떻게
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent 
                           drop-shadow-lg hover:drop-shadow-2xl transition-all duration-300 
                           hover:scale-105 inline-block cursor-default">
              하고 계시나요?
            </span>
          </h1>
          {/* 삭제된 문구: 수많은 증권 리포트와 뉴스 속 파편화된 지식. 이제 당신의 밑줄 하나가 온톨로지 AI를 만나, 투자 결정을 위한 '깊고 넓은 지식 그래프'로 진화합니다. */}
          <div className="bg-gradient-to-r from-indigo-600/12 to-pink-600/12 border-l-4 border-indigo-600 
                          p-6 sm:p-8 rounded-xl sm:rounded-2xl border border-indigo-600/20">
            <strong className="text-lg sm:text-xl font-semibold">
              당신의 투자 특징을 완벽히 이해하는 AI가 있다면, 얼마나 좋을까요?
            </strong>
          </div>
        </div>

        {/* Problem Slide */}
        <div 
          ref={addSlideRef}
          className="bg-gray-900/85 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-8 sm:p-12 md:p-16 mb-6 sm:mb-10 
                     shadow-2xl border border-white/10 transition-all duration-500 ease-out
                     hover:transform hover:-translate-y-2 hover:shadow-3xl hover:border-white/20"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 sm:mb-8 relative inline-block tracking-tight">
            기존 투자상담 AI의 한계
            <div className="absolute bottom-[-10px] left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
          </h2>
          <div className="bg-gradient-to-r from-green-500/12 to-cyan-500/12 border-l-4 border-green-500 
                          p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-lg border border-green-500/20 text-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-8">
              <div 
                onClick={handleCardClick}
                className="bg-white/5 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center transition-all duration-300 ease-out cursor-pointer
                           border border-white/10 hover:bg-white/10 hover:transform hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="text-4xl sm:text-5xl mb-4 sm:mb-6">🚫</div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">거짓 정보 생성</h3>
                <p className="text-sm sm:text-base text-gray-300 leading-relaxed">AI가 생성하는 부정확하거나 잘못된 정보는 오히려 투자 판단을 흐리게 만듭니다.</p>
              </div>
              <div 
                onClick={handleCardClick}
                className="bg-white/5 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center transition-all duration-300 ease-out cursor-pointer
                           border border-white/10 hover:bg-white/10 hover:transform hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="text-4xl sm:text-5xl mb-4 sm:mb-6">💡</div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">'뻔한' 조언</h3>
                <p className="text-sm sm:text-base text-gray-300 leading-relaxed">개인화되지 않은 일반적인 투자 조언은 실제 투자에 큰 도움이 되지 않습니다.</p>
              </div>
              <div 
                onClick={handleCardClick}
                className="bg-white/5 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center transition-all duration-300 ease-out cursor-pointer
                           border border-white/10 hover:bg-white/10 hover:transform hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="text-4xl sm:text-5xl mb-4 sm:mb-6">❓</div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">근거 불명확한 종목 추천</h3>
                <p className="text-sm sm:text-base text-gray-300 leading-relaxed">왜 특정 종목을 추천하는지 명확한 근거 없이 제시되는 AI 추천은 신뢰하기 어렵습니다.</p>
              </div>
            </div>
            <div className="text-center">
              <strong className="text-white font-semibold">투자상담 AI가 손실을 더 키우고 있진 않으신가요?</strong>
            </div>
          </div>
        </div>

        {/* Your Role Slide */}
        <div 
          ref={addSlideRef}
          className="bg-gray-900/85 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-8 sm:p-12 md:p-16 mb-6 sm:mb-10 
                     shadow-2xl border border-white/10 transition-all duration-500 ease-out
                     hover:transform hover:-translate-y-2 hover:shadow-3xl hover:border-white/20"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 sm:mb-8 relative inline-block tracking-tight">
            내가 작성한 투자 메모, <span className="text-blue-400">'투자 지도'</span>로 재탄생
            <div className="absolute bottom-[-10px] left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-10">
            <div 
              onClick={handleCardClick}
              className="bg-gradient-to-br from-indigo-600/8 to-pink-600/8 border border-indigo-600/20 
                         rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center transition-all duration-500 ease-out cursor-pointer
                         hover:transform hover:-translate-y-3 hover:scale-105 hover:shadow-2xl hover:border-indigo-600/30
                         relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/3 to-pink-600/3 -z-10"></div>
              <div className="text-3xl sm:text-4xl font-bold text-indigo-500 mb-3 sm:mb-4">1</div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">방대한 투자 정보, 메모와 관련된 정보만 검색</h3>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">수많은 투자 리포트, 뉴스, 데이터, AI가 당신의 고유한 투자 관점과 목표에 맞춰 필요한 정보만 선별적으로 가져다줍니다. 딱 필요한 것만 보세요.</p>
            </div>
            <div 
              onClick={handleCardClick}
              className="bg-gradient-to-br from-indigo-600/8 to-pink-600/8 border border-indigo-600/20 
                         rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center transition-all duration-500 ease-out cursor-pointer
                         hover:transform hover:-translate-y-3 hover:scale-105 hover:shadow-2xl hover:border-indigo-600/30
                         relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/3 to-pink-600/3 -z-10"></div>
              <div className="text-3xl sm:text-4xl font-bold text-indigo-500 mb-3 sm:mb-4">2</div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">파편화된 투자 메모, AI가 자동 연결</h3>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">당신이 어딘가 적어둔 투자 기록(메모, 스크랩)을 AI가 온톨로지 기반의 지식 그래프로 일일이 연결하여 복잡한 맥락을 추론합니다. 관련된 정보들을 연결해 당신만의 '투자 인사이트 그래프'를 만듭니다.</p>
            </div>
          </div>
          <div className="bg-gradient-to-r from-indigo-600/12 to-pink-600/12 p-5 sm:p-6 rounded-lg sm:rounded-xl 
                          border-l-3 border-indigo-600 font-semibold text-white border border-indigo-600/20 text-center">
            <strong>'기록'하고 '추가'하세요. 나머진 AI가 알아서 해줍니다</strong>
          </div>
        </div>

        {/* AI Features Slide */}
        <div 
          ref={addSlideRef}
          className="bg-gray-900/85 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-8 sm:p-12 md:p-16 mb-6 sm:mb-10 
                     shadow-2xl border border-white/10 transition-all duration-500 ease-out
                     hover:transform hover:-translate-y-2 hover:shadow-3xl hover:border-white/20"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 sm:mb-8 relative inline-block tracking-tight">
            AI-Link: 메모를 지도로 바꾸는 기술
            <div className="absolute bottom-[-10px] left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
          </h2>
          <div className="text-base sm:text-lg text-gray-300 mb-6 sm:mb-8 leading-relaxed">
            온톨로지 기반의 '지식 그래프'를 통해, 신뢰가능한 투자결정 프로세스를 구축하세요.
          </div>
          
          <div className="bg-gradient-to-br from-blue-500/8 to-indigo-600/8 border border-blue-500/20 
                          rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-10 space-y-4 sm:space-y-6">
            <div 
              onClick={handleCardClick}
              className="flex items-start p-4 sm:p-6 bg-white/3 rounded-xl sm:rounded-2xl transition-all duration-300 ease-out
                         border border-white/5 cursor-pointer hover:bg-white/6 hover:transform hover:translate-x-2 
                         hover:border-white/10"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl 
                              flex items-center justify-center mr-4 sm:mr-5 flex-shrink-0 text-xl sm:text-2xl">
                🏷️
              </div>
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">AI '블랙박스' 해소</h3>
                <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                  당신의 모든 투자 관련 기록(메모, 리포트)에 AI가 출처와 맥락을 자동 부착합니다. AI는 이 투명한 구조 위에서 추론하므로, '왜' 이런 분석을 추천하는지 명확한 근거를 제시합니다.
                </p>
              </div>
            </div>
            
            <div 
              onClick={handleCardClick}
              className="flex items-start p-4 sm:p-6 bg-white/3 rounded-xl sm:rounded-2xl transition-all duration-300 ease-out
                         border border-white/5 cursor-pointer hover:bg-white/6 hover:transform hover:translate-x-2 
                         hover:border-white/10"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl 
                              flex items-center justify-center mr-4 sm:mr-5 flex-shrink-0 text-xl sm:text-2xl">
                📦
              </div>
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">'정보 홍수' 극복</h3>
                <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                  산재된 투자 지식이 AI-Link를 통해 하나의 유기적인 '초개인화된 지식 그래프'로 통합됩니다. AI는 전체 맥락을 이해하며, 필요한 정보만을 정확하게 찾아내 당신의 의사결정을 돕습니다.
                </p>
              </div>
            </div>
            
            <div 
              onClick={handleCardClick}
              className="flex items-start p-4 sm:p-6 bg-white/3 rounded-xl sm:rounded-2xl transition-all duration-300 ease-out
                         border border-white/5 cursor-pointer hover:bg-white/6 hover:transform hover:translate-x-2 
                         hover:border-white/10"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl 
                              flex items-center justify-center mr-4 sm:mr-5 flex-shrink-0 text-xl sm:text-2xl">
                🎧
              </div>
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">'숨겨진 투자 기회' 포착</h3>
                <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                  당신만의 지식 그래프를 기반으로, AI는 일반적인 조언을 넘어 당신의 투자 성향과 목표에 최적화된 심층 분석과 인사이트를 제공합니다. 경쟁자들이 놓치는 '숨겨진 투자 기회'를 찾아냅니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Slide */}
        <div 
          ref={addSlideRef}
          className="bg-gray-900/85 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-8 sm:p-12 md:p-16 mb-6 sm:mb-10 
                     shadow-2xl border border-white/10 transition-all duration-500 ease-out
                     hover:transform hover:-translate-y-2 hover:shadow-3xl hover:border-white/20"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 sm:mb-8 relative inline-block tracking-tight">
            타인에 의존하는 투자 결정, 이제 그만!
            <div className="absolute bottom-[-10px] left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10">
            <div
              onClick={handleCardClick}
              className="bg-gradient-to-br from-purple-600/8 to-pink-600/8 border border-purple-600/20 
                         rounded-xl sm:rounded-2xl p-4 sm:p-5 text-center transition-all duration-500 ease-out cursor-pointer
                         hover:transform hover:-translate-y-3 hover:scale-105 hover:shadow-2xl hover:border-purple-600/30
                         relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/3 to-pink-600/3 -z-10"></div>
              <div className="text-3xl sm:text-4xl font-bold text-purple-500 mb-3 sm:mb-4">🔍</div>
              <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">빈틈없는 의사결정</h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">AI-Link는 당신의 지식 그래프를 LLM에 직접 연결, 모든 투자 결정의 근거를 투명하게 제시하고 '맹점'을 제거합니다. 투자자는 AI 추천을 맹목적으로 따르지 않고 스스로 검증하며 확신을 가집니다.</p>
            </div>
            <div
              onClick={handleCardClick}
              className="bg-gradient-to-br from-purple-600/8 to-pink-600/8 border border-purple-600/20 
                         rounded-xl sm:rounded-2xl p-4 sm:p-5 text-center transition-all duration-500 ease-out cursor-pointer
                         hover:transform hover:-translate-y-3 hover:scale-105 hover:shadow-2xl hover:border-purple-600/30
                         relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/3 to-pink-600/3 -z-10"></div>
              <div className="text-3xl sm:text-4xl font-bold text-purple-500 mb-3 sm:mb-4">✨</div>
              <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">초개인화된 인사이트</h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">당신의 독점적인 지식(메모, 분석)이 AI 학습 데이터가 되어, 시장 정보와 결합됩니다. 다른 투자자들이 놓치는 '숨겨진 기회'와 리스크를 발견합니다.</p>
            </div>
            <div
              onClick={handleCardClick}
              className="bg-gradient-to-br from-purple-600/8 to-pink-600/8 border border-purple-600/20 
                         rounded-xl sm:rounded-2xl p-4 sm:p-5 text-center transition-all duration-500 ease-out cursor-pointer
                         hover:transform hover:-translate-y-3 hover:scale-105 hover:shadow-2xl hover:border-purple-600/30
                         relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/3 to-pink-600/3 -z-10"></div>
              <div className="text-3xl sm:text-4xl font-bold text-purple-500 mb-3 sm:mb-4">⏱️</div>
              <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">시간과 비용 절약</h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">정보 과부하와 파편화된 지식 통합에 드는 막대한 시간과 노력을 AI가 대신합니다. 당신은 본질적인 사유와 전략 수립에만 집중하세요.</p>
            </div>
            <div
              onClick={handleCardClick}
              className="bg-gradient-to-br from-purple-600/8 to-pink-600/8 border border-purple-600/20 
                         rounded-xl sm:rounded-2xl p-4 sm:p-5 text-center transition-all duration-500 ease-out cursor-pointer
                         hover:transform hover:-translate-y-3 hover:scale-105 hover:shadow-2xl hover:border-purple-600/30
                         relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/3 to-pink-600/3 -z-10"></div>
              <div className="text-3xl sm:text-4xl font-bold text-purple-500 mb-3 sm:mb-4">🌱</div>
              <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">지속 가능한 성장 모멘텀</h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">당신의 지적 자산이 쌓이고 진화할수록, Habitus33 AI는 더욱 정교하고 개인화된 통찰력을 제공합니다. 이는 시장 변화 속에서 당신이 앞서 나갈 독점적 우위가 됩니다.</p>
            </div>
          </div>
        </div>

        {/* Conclusion Slide */}
        <div 
          ref={addSlideRef}
          className="bg-gradient-to-br from-green-500/8 to-cyan-500/8 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-8 sm:p-12 md:p-16 mb-6 sm:mb-10 
                     shadow-2xl border border-green-500/30 transition-all duration-500 ease-out
                     hover:transform hover:-translate-y-2 hover:shadow-3xl hover:border-green-500/40 text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 sm:mb-8 relative inline-block tracking-tight">
            아무도 보지 못한 연결이 보인다면?
            <div className="absolute bottom-[-10px] left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
          </h2>
          <div className="text-center mb-10 sm:mb-12 text-lg sm:text-xl text-gray-300 leading-relaxed">
            당신만의 투자 철학을 완성하세요
          </div>
          <Link 
            href="/auth/register"
            className="inline-block bg-gradient-to-r from-green-500 to-cyan-500 text-white 
                       px-8 sm:px-9 py-4 sm:py-5 rounded-lg sm:rounded-xl text-base sm:text-lg font-semibold transition-all duration-300 ease-out
                       shadow-lg hover:transform hover:-translate-y-1 hover:shadow-2xl 
                       hover:from-green-400 hover:to-cyan-400 tracking-tight"
          >
            지금 바로, 숨은 기회 포착하기
          </Link>
        </div>
      </div>
    </div>
  );
} 