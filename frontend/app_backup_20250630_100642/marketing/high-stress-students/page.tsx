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
              공부는{' '}
            </span>
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent 
                           drop-shadow-lg hover:drop-shadow-2xl transition-all duration-300 
                           hover:scale-105 inline-block cursor-default">
              당신이
            </span>
            <br />
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              정리는{' '}
            </span>
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent 
                           drop-shadow-lg hover:drop-shadow-2xl transition-all duration-300 
                           hover:scale-105 inline-block cursor-default">
              AI가
            </span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-400 mb-8 sm:mb-10 font-medium">
            수험생을 위한 혁신적인 AI Agent
          </p>
          <div className="bg-gradient-to-r from-indigo-600/12 to-pink-600/12 border-l-4 border-indigo-600 
                          p-6 sm:p-8 rounded-xl sm:rounded-2xl border border-indigo-600/20">
            <strong className="text-lg sm:text-xl font-semibold">
              당신은 '공부'만 하세요. '정리'는 AI가 합니다.
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
            수험생의 가장 큰 고민
            <div className="absolute bottom-[-10px] left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
          </h2>
          <div className="bg-gradient-to-r from-green-500/12 to-cyan-500/12 border-l-4 border-green-500 
                          p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-lg border border-green-500/20">
            <div className="text-base sm:text-lg text-gray-300 leading-relaxed">
              수험생 여러분, 공부의 가장 큰 어려움은 <strong className="text-white font-semibold">'정리'</strong>입니다.<br />
              이제 그 고민, AI에게 맡기세요.<br /><br />
              <strong className="text-white font-semibold">"어디서 봤지?" 걱정 끝! '정리'는 AI 담당!</strong>
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
          <div className="bg-gradient-to-r from-indigo-600/12 to-pink-600/12 p-5 sm:p-6 rounded-lg sm:rounded-xl 
                          border-l-3 border-indigo-600 font-semibold text-white border border-indigo-600/20">
            <strong>당신 역할은 끝.</strong> AI는 무엇을 할까요?
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
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">'도메인 컨텍스트 캡슐' 자동 응축</h3>
                <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                  꼬리표 붙은 메모들은 '도메인 컨텍스트 캡슐' 형태로, '학습 여정'에 완벽히 대응시킵니다. 학습 내용은 한눈에 파악!
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
                  구축된 '도메인 컨텍스트 캡슐'을 NotebookLM에 입력하고, '음성 오버뷰'로 재생해 보세요. 언제 어디서든 들으며 복습하세요.
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
            Habitus33, 왜 게임체인저일까요?
            <div className="absolute bottom-[-10px] left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
          </h2>
          <div className="text-base sm:text-lg text-gray-300 leading-relaxed">
            <p className="mb-5 sm:mb-6">
              이제 당신은 <strong className="text-white font-semibold">'생각'과 '이해'</strong>라는 학습 본질에만 100% 집중하세요. 번거로운 기록과 정리는 AI가 다 처리합니다.
            </p>
            <p className="mb-5 sm:mb-6">
              AI는 캡슐을 분석해 약점을 파악하고, 최적의 요약본과 보완 전략을 계속 제시합니다.
            </p>
            <div className="bg-gradient-to-r from-green-500/12 to-cyan-500/12 border-l-4 border-green-500 
                            p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-lg border border-green-500/20">
              <strong className="text-white font-semibold">
                이로써 '수시 복습 시퀀스'가 자동화되어, 스스로 찾지 못하던 약점을 계속 찾아냅니다.
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
            Habitus33
            <div className="absolute bottom-[-10px] left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
          </h2>
          <div className="text-xl sm:text-2xl text-white font-semibold leading-relaxed mb-8 sm:mb-10 tracking-tight">
            이제 천재처럼 공부하세요.<br />
            지금 가입하면, <strong>평생 무료!</strong>
          </div>
          <Link 
            href="/auth/register"
            className="inline-block bg-gradient-to-r from-green-500 to-cyan-500 text-white 
                       px-8 sm:px-9 py-4 sm:py-5 rounded-lg sm:rounded-xl text-base sm:text-lg font-semibold transition-all duration-300 ease-out
                       shadow-lg hover:transform hover:-translate-y-1 hover:shadow-2xl 
                       hover:from-green-400 hover:to-cyan-400 tracking-tight"
          >
            바로 공부 시작하기
          </Link>
        </div>
      </div>
    </div>
  );
} 