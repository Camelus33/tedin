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
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent 
                           drop-shadow-lg hover:drop-shadow-2xl transition-all duration-300 
                           hover:scale-105 inline-block cursor-default">
              학습량이 많은 수험생을 위한
            </span>
            <br />
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              학습 시간 단축 솔루션
            </span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-400 mb-8 sm:mb-10 font-medium">
            과도한 학습량으로 인한 효율 저하를 해결하는 AI 도우미
          </p>
          
          {/* 학습 가속 강조 섹션 추가 */}
          <div className="bg-gradient-to-r from-indigo-600/15 to-purple-600/15 border border-indigo-500/30 
                          p-6 sm:p-8 rounded-xl sm:rounded-2xl mb-6 sm:mb-8">
            <div className="text-center space-y-3 sm:space-y-4">
              <div className="text-2xl sm:text-3xl font-bold text-indigo-400">
                ⚡ 학습 시간 단축 극대화 ⚡
              </div>
              <div className="text-lg sm:text-xl font-semibold text-white">
                AI-Link + NotebookLM 조합으로
              </div>
              <div className="text-base sm:text-lg text-gray-300">
                학습 시간 <span className="text-green-400 font-bold">25% 단축</span> • 기억 보존률 <span className="text-green-400 font-bold">4배 향상</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-indigo-600/12 to-pink-600/12 border-l-4 border-indigo-600 
                          p-6 sm:p-8 rounded-xl sm:rounded-2xl border border-indigo-600/20">
            <strong className="text-lg sm:text-xl font-semibold">
              경고: 과도한 학습량으로 인한 효율 저하를 방치하면 같은 시간 투자로도 30점 차이 납니다
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
            학습량이 많은 수험생의 가장 큰 고민
            <div className="absolute bottom-[-10px] left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
          </h2>
          <div className="bg-gradient-to-r from-red-500/12 to-orange-500/12 border-l-4 border-red-500 
                          p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-lg border border-red-500/20">
            <div className="text-base sm:text-lg text-gray-300 leading-relaxed">
              <strong className="text-white font-semibold">"너무 많은 공부량 때문에 아무것도 기억이 안 나요!"</strong><br />
              시험장에서 머리가 하얘지는 진짜 이유는...<br /><br />
              <strong className="text-red-400 font-semibold">과도한 학습량으로 인한 효율 저하와 체계적 정리의 부재입니다</strong>
            </div>
          </div>
        </div>

        {/* 학습 가속 솔루션 섹션 추가 */}
        <div 
          ref={addSlideRef}
          className="bg-gradient-to-br from-green-500/8 to-cyan-500/8 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-8 sm:p-12 md:p-16 mb-6 sm:mb-10 
                     shadow-2xl border border-green-500/30 transition-all duration-500 ease-out
                     hover:transform hover:-translate-y-2 hover:shadow-3xl hover:border-green-500/40"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 sm:mb-8 relative inline-block tracking-tight">
            🚀 학습 시간 단축 솔루션
            <div className="absolute bottom-[-10px] left-0 w-full h-1 bg-gradient-to-r from-green-500 to-cyan-600 rounded-full"></div>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-10">
            <div 
              onClick={handleCardClick}
              className="bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center transition-all duration-500 ease-out cursor-pointer
                         hover:transform hover:-translate-y-3 hover:scale-105 hover:shadow-2xl hover:border-green-500/30
                         relative overflow-hidden"
            >
              <div className="text-3xl sm:text-4xl mb-4">⚡</div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-3">학습 시간 25% 단축</h3>
              <p className="text-sm sm:text-base text-gray-300">체계적 정리로 핵심만 빠르게 파악</p>
            </div>
            
            <div 
              onClick={handleCardClick}
              className="bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center transition-all duration-500 ease-out cursor-pointer
                         hover:transform hover:-translate-y-3 hover:scale-105 hover:shadow-2xl hover:border-green-500/30
                         relative overflow-hidden"
            >
              <div className="text-3xl sm:text-4xl mb-4">🧠</div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-3">기억 보존률 4배 향상</h3>
              <p className="text-sm sm:text-base text-gray-300">효율적 학습으로 장기 기억 증진</p>
            </div>
            
            <div 
              onClick={handleCardClick}
              className="bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center transition-all duration-500 ease-out cursor-pointer
                         hover:transform hover:-translate-y-3 hover:scale-105 hover:shadow-2xl hover:border-green-500/30
                         relative overflow-hidden"
            >
              <div className="text-3xl sm:text-4xl mb-4">🔗</div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-3">지식 연결성 5배 향상</h3>
              <p className="text-sm sm:text-base text-gray-300">관련 개념 자동 연결</p>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-indigo-500/15 to-purple-500/15 border border-indigo-500/30 
                          p-6 sm:p-8 rounded-xl sm:rounded-2xl">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-indigo-400 mb-3">
                AI-Link + NotebookLM 조합
              </div>
              <div className="text-lg sm:text-xl text-white font-semibold">
                학습 시간 단축 극대화
              </div>
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
            당신은 단 2가지만
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
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">핵심 1줄 메모 남기기</h3>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">공부 중 중요한 순간, 짧게 기록하세요.</p>
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
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">떠오른 생각 메모 확장</h3>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">질문, 나만의 암기법, 연결 개념 등 자유롭게 추가하여 메모를 발전시키세요.</p>
            </div>
          </div>
          <div className="bg-gradient-to-r from-yellow-500/12 to-orange-500/12 border-l-4 border-yellow-500 
                          p-5 sm:p-6 rounded-lg sm:rounded-xl font-semibold text-white border border-yellow-500/20">
            <strong>문제: 혼자서는 이런 체계적 정리를 하기가 거의 불가능합니다.</strong> 그래서 AI의 도움이 필요하죠.
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
            AI는 '초지능 사서'처럼 작동
            <div className="absolute bottom-[-10px] left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
          </h2>
          <div className="text-base sm:text-lg text-gray-300 mb-6 sm:mb-8 leading-relaxed">
            당신이 메모하는 매 순간, AI가 학습을 구조화합니다.
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
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">자동 메타데이터 부착</h3>
                <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                  1줄 메모에 AI는 책 페이지, 학습 시간, 오답 카드, 연결 개념 등 수많은 꼬리표를 계속 생성합니다. 신경 쓸 필요 없죠.
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
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">'도메인 컨텍스트 지식캡슐' 자동 응축</h3>
                <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                  꼬리표 붙은 메모들은 '도메인 컨텍스트 지식캡슐' 형태로, '학습 여정'에 완벽히 대응시킵니다. 학습 내용은 한눈에 파악!
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
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">NotebookLM 입력 & 음성 오버뷰</h3>
                <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                  구축된 '도메인 컨텍스트 지식캡슐'을 NotebookLM에 입력하고, '음성 오버뷰'로 재생해 보세요. 언제 어디서든 들으며 복습하세요.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* AI-Link + NotebookLM 조합 강조 섹션 추가 */}
        <div 
          ref={addSlideRef}
          className="bg-gradient-to-br from-indigo-500/8 to-purple-500/8 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-8 sm:p-12 md:p-16 mb-6 sm:mb-10 
                     shadow-2xl border border-indigo-500/30 transition-all duration-500 ease-out
                     hover:transform hover:-translate-y-2 hover:shadow-3xl hover:border-indigo-500/40 text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 sm:mb-8 relative inline-block tracking-tight">
            🚀 AI-Link + NotebookLM 조합
            <div className="absolute bottom-[-10px] left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"></div>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-10">
            <div className="bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-6 sm:p-8">
              <div className="text-3xl sm:text-4xl mb-4">🔗</div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-3">AI-Link</h3>
              <p className="text-sm sm:text-base text-gray-300">개인화된 지식캡슐로 AI가 당신을 완벽 이해</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-6 sm:p-8">
              <div className="text-3xl sm:text-4xl mb-4">📝</div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-3">NotebookLM</h3>
              <p className="text-sm sm:text-base text-gray-300">음성 복습으로 학습 시간 단축 극대화</p>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500/15 to-cyan-500/15 border border-green-500/30 
                          p-6 sm:p-8 rounded-xl sm:rounded-2xl">
            <div className="text-xl sm:text-2xl font-bold text-green-400 mb-3">
              학습 시간 단축 극대화
            </div>
            <div className="text-lg sm:text-xl text-white">
              짧고 굵게 여러 번 반복 학습
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
            실제 사용자들의 놀라운 변화
            <div className="absolute bottom-[-10px] left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
          </h2>
          <div className="text-base sm:text-lg text-gray-300 leading-relaxed">
            <p className="mb-5 sm:mb-6">
              <strong className="text-green-400 font-semibold">"학습량이 줄어들어서 공부가 재미있어졌어요!"</strong><br />
              체계적 정리로 학습 효율이 향상되어 과도한 학습량도 자연스럽게 줄어듭니다. (실제 후기: 평균 25점 상승)
            </p>
            <p className="mb-5 sm:mb-6">
              <strong className="text-green-400 font-semibold">"불필요한 시간낭비가 줄어 학습량도 줄었어요!"</strong><br />
              같은 내용을 반복 공부할 필요가 없어져서 시간 효율이 3배 향상됩니다.
            </p>
            <div className="bg-gradient-to-r from-green-500/12 to-cyan-500/12 border-l-4 border-green-500 
                            p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-lg border border-green-500/20">
              <strong className="text-white font-semibold">
                "이제 공부가 즐거워졌어요!" - 실제 후기 中
              </strong>
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
            지금 시작하지 않으면?
            <div className="absolute bottom-[-10px] left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
          </h2>
          <div className="text-xl sm:text-2xl text-white font-semibold leading-relaxed mb-8 sm:mb-10 tracking-tight">
            내년에도 같은 과도한 학습량을 반복하게 됩니다<br />
            <strong className="text-green-400">지금 시작하면 무료</strong>
          </div>
          <Link 
            href="/auth/register"
            className="inline-block bg-gradient-to-r from-green-500 to-cyan-500 text-white font-bold py-4 sm:py-5 px-8 sm:px-12 
                       rounded-full text-lg sm:text-xl shadow-2xl transition-all duration-300 ease-out
                       hover:transform hover:scale-105 hover:shadow-3xl hover:from-green-400 hover:to-cyan-400
                       focus:outline-none focus:ring-4 focus:ring-green-500/50"
          >
            학습 시간 단축 경험하기
          </Link>
        </div>
      </div>
    </div>
  );
} 