'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';

export default function LawSchoolStudentsPage() {
  const slidesRef = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
          }
        });
      },
      {
        threshold: 0.1,
      }
    );

    slidesRef.current.forEach((slide) => {
      if (slide) {
        observer.observe(slide);
      }
    });

    return () => {
      slidesRef.current.forEach((slide) => {
        if (slide) {
          observer.unobserve(slide);
        }
      });
    };
  }, []);

  const addSlideRef = (el: HTMLDivElement | null) => {
    if (el && !slidesRef.current.includes(el)) {
      slidesRef.current.push(el);
    }
  };

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'scale(0.95)';
    setTimeout(() => {
      e.currentTarget.style.transform = '';
    }, 150);
  };

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'scale(0.95)';
    setTimeout(() => {
      e.currentTarget.style.transform = '';
    }, 150);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white font-sans overflow-x-hidden">
      <style jsx global>{`
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-4xl">
        {/* Hero Slide */}
        <div 
          ref={addSlideRef}
          className="text-center mb-8 sm:mb-12 md:mb-16 py-8 sm:py-12 md:py-16"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8 tracking-tight leading-tight">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent 
                           drop-shadow-lg hover:drop-shadow-2xl transition-all duration-300 
                           hover:scale-105 inline-block cursor-default">
              상위 10% 합격자는
            </span>
            <br />
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              모두 아는{' '}
            </span>
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent 
                           drop-shadow-lg hover:drop-shadow-2xl transition-all duration-300 
                           hover:scale-105 inline-block cursor-default">
              학습 비법
            </span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-400 mb-8 sm:mb-10 font-medium">
            3개월 만에 점수를 30점 올린 로스쿨생들의 실제 학습법
          </p>
          <div className="bg-gradient-to-r from-indigo-600/12 to-pink-600/12 border-l-4 border-indigo-600 
                          p-6 sm:p-8 rounded-xl sm:rounded-2xl border border-indigo-600/20">
            <strong className="text-lg sm:text-xl font-semibold">
              경고: 이 방법을 모르면 같은 시간 투자로도 30점 차이 납니다
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
            90%가 실패하는 이유
            <div className="absolute bottom-[-10px] left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
          </h2>
          <div className="bg-gradient-to-r from-red-500/12 to-orange-500/12 border-l-4 border-red-500 
                          p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-lg border border-red-500/20">
            <div className="text-base sm:text-lg text-gray-300 leading-relaxed">
              <strong className="text-white font-semibold">"판례 200개 외웠는데 왜 60점?"</strong><br />
              시험장에서 머리가 하얘지는 진짜 이유는...<br /><br />
              <strong className="text-red-400 font-semibold">암기한 지식들이 서로 연결되지 않았기 때문입니다</strong>
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
            상위 10%만 아는 공부법
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
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">번뜩이는 순간 포착</h3>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">"어? 이 판례가 저거랑 연결되네!" 이 순간을 바로 1줄 메모로 남기세요.</p>
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
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">지식 거미줄 만들기</h3>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">줄줄이 연결되는 지식을 계속 보태, '지식 네트워크'를 구축합니다.</p>
            </div>
          </div>
          <div className="bg-gradient-to-r from-yellow-500/12 to-orange-500/12 border-l-4 border-yellow-500 
                          p-5 sm:p-6 rounded-lg sm:rounded-xl font-semibold text-white border border-yellow-500/20">
            <strong>문제: 혼자서는 이런 연결망을 만들기가 거의 불가능합니다.</strong> 그래서 AI의 도움이 필요하죠.
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
            AI가 만드는 지식 연결망
            <div className="absolute bottom-[-10px] left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
          </h2>
          <div className="text-base sm:text-lg text-gray-300 mb-6 sm:mb-8 leading-relaxed">
            당신의 학습 여정을 구조화하여 '슈퍼 지식 캡슐'을 만듭니다.
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
                🧠
              </div>
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">1초 만에 연결망 완성</h3>
                <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                  관련된 모든 판례, 조문, 학설이 모두 연결되어 있습니다. 시험장에서 "아! 맞다!" 하며 줄줄이 떠올라요.
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
                💊
              </div>
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">나만의 지식 캡슐 생성</h3>
                <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                  복잡한 법학 지식을 '한 알의 캡슐'처럼 입력, 나를 이해하는 진짜 AI 조수가 됩니다.
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
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">실전 활용법</h3>
                <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                  NotebookLM으로 음성 복습, ChatGPT로 나만의 약점 진단, 점수 상승 확인!
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
            실제 사용자들의 놀라운 변화
            <div className="absolute bottom-[-10px] left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
          </h2>
          <div className="text-base sm:text-lg text-gray-300 leading-relaxed">
            <p className="mb-5 sm:mb-6">
              <strong className="text-green-400 font-semibold">"문제를 읽는데 풀었던 문제가 바로 떠올랐어요!"</strong><br />
              단순 암기가 아닌 연결된 지식이라 응용 문제도 술술 풀려요. (실제 후기: 평균 25점 상승)
            </p>
            <p className="mb-5 sm:mb-6">
              <strong className="text-green-400 font-semibold">"불필요한 시간낭비가 줄어 스트레스도 줄었어요!"</strong><br />
              같은 내용을 반복 공부할 필요가 없어져서 시간 효율이 3배 향상됩니다.
            </p>
            <div className="bg-gradient-to-r from-green-500/12 to-cyan-500/12 border-l-4 border-green-500 
                            p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-lg border border-green-500/20">
              <strong className="text-white font-semibold">
                "아, 이래서 합격자들이 다르구나!" - 실제 후기 中
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
            내년에도 같은 고민을 반복하게 됩니다<br />
            <strong className="text-green-400">지금 시작하면 무료</strong>
          </div>
          <Link 
            href="/auth/register"
            className="inline-block bg-gradient-to-r from-green-500 to-cyan-500 text-white font-bold py-4 sm:py-5 px-8 sm:px-12 
                       rounded-full text-lg sm:text-xl shadow-2xl transition-all duration-300 ease-out
                       hover:transform hover:scale-105 hover:shadow-3xl hover:from-green-400 hover:to-cyan-400
                       focus:outline-none focus:ring-4 focus:ring-green-500/50"
          >
            합격 비밀 체험하기
          </Link>
        </div>
      </div>
    </div>
  );
} 