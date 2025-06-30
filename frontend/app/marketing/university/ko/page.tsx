'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

const UniversityMarketingPageKO = () => {
  const [activeTab, setActiveTab] = useState('faculty');
  const slidesRef = useRef<Array<HTMLElement | null>>([]);

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

  const addSlideRef = (el: HTMLElement | null) => {
    if (el && !slidesRef.current.includes(el)) {
      slidesRef.current.push(el);
    }
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
      
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-5xl">
        {/* Hero Section */}
        <section 
          ref={addSlideRef as (el: HTMLElement | null) => void}
          className="text-center mb-8 sm:mb-12 md:mb-16 py-8 sm:py-12 md:py-16"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8 tracking-tight leading-tight">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent 
                          drop-shadow-lg hover:drop-shadow-2xl transition-all duration-300 
                          hover:scale-105 inline-block cursor-default leading-snug md:leading-tight">
              학습 과정이 입증되면,<br/>진짜 배움이 시작됩니다.
            </span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">
            Habitus33은 표절 검사 대신 학습 여정을 조명합니다. 모든 학생의 노력을 눈에 보이고 검증 가능하게 만드세요.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <a href="https://habitus33.vercel.app/" 
              className="inline-block bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-3 px-8 
                        rounded-full text-lg shadow-lg transition-all duration-300 ease-out
                        hover:transform hover:scale-105 hover:shadow-2xl hover:from-blue-600 hover:to-indigo-700
                        focus:outline-none focus:ring-4 focus:ring-blue-500/50">
              지금 체험하기
            </a>
            <a href="mailto:habitus33.tedin@gmail.com" 
              className="inline-block bg-transparent border-2 border-gray-500 text-gray-300 font-bold py-3 px-8 
                        rounded-full text-lg shadow-lg transition-all duration-300 ease-out
                        hover:transform hover:scale-105 hover:shadow-2xl hover:bg-gray-800 hover:border-gray-400
                        focus:outline-none focus:ring-4 focus:ring-gray-500/50">
              도입 문의
            </a>
          </div>
        </section>

        {/* Problem Section */}
        <section 
          ref={addSlideRef as (el: HTMLElement | null) => void}
          className="bg-gray-900/85 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-8 sm:p-12 md:p-16 mb-6 sm:mb-10 
                    shadow-2xl border border-white/10 transition-all duration-500 ease-out
                    hover:transform hover:-translate-y-2 hover:shadow-3xl hover:border-white/20"
        >
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 relative inline-block tracking-tight">
              강의실에 찾아온 신뢰의 위기
              <div className="absolute bottom-[-10px] left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
            </h2>
            <p className="mt-8 text-lg text-gray-400">AI가 교육 현장의 모두에게 새로운 불확실성을 만들고 있습니다.</p>
          </div>
          <div className="mt-16 grid md:grid-cols-3 gap-8 text-center">
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-8 rounded-2xl border border-white/10 transition-transform duration-300 hover:scale-105 hover:border-white/20">
              <h3 className="text-xl font-semibold text-purple-400 mt-6">학생의 불안</h3>
              <p className="mt-2 text-gray-300">
                AI 활용이 오해를 낳지 않을까, <span className="text-red-400 font-semibold">나의 노력을 온전히 인정받지 못할까</span> 걱정됩니다.
              </p>
            </div>
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-8 rounded-2xl border border-white/10 transition-transform duration-300 hover:scale-105 hover:border-white/20">
              <h3 className="text-xl font-semibold text-blue-400 mt-6">교수의 고민</h3>
              <p className="mt-2 text-gray-300">
                무엇이 학생의 진짜 생각인지, <span className="text-red-400 font-semibold">어떻게 공정하게 평가할지 막막합니다.</span>
              </p>
            </div>
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-8 rounded-2xl border border-white/10 transition-transform duration-300 hover:scale-105 hover:border-white/20">
              <h3 className="text-xl font-semibold text-green-400 mt-6">교육의 본질</h3>
              <p className="mt-2 text-gray-300">
                기술이 만든 불신 속에서, 가르치고 배우는 <span className="text-red-400 font-semibold">교육의 가치가 흔들리고 있습니다.</span>
              </p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section 
          ref={addSlideRef as (el: HTMLElement | null) => void}
          className="bg-gray-900/85 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-8 sm:p-12 md:p-16 mb-6 sm:mb-10 
                    shadow-2xl border border-white/10 transition-all duration-500 ease-out
                    hover:transform hover:-translate-y-2 hover:shadow-3xl hover:border-white/20"
        >
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 relative inline-block tracking-tight">
              학습에만 집중하세요. 증명은 Habitus33이 합니다.
              <div className="absolute bottom-[-10px] left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
            </h2>
            <p className="mt-8 text-lg text-gray-400">세 단계로 학습 과정에 대한 확실한 증거를 제공합니다.</p>
          </div>
          <div className="mt-20 grid md:grid-cols-3 gap-8">
            <div className="bg-gray-800/50 p-8 rounded-xl border border-white/10 text-center">
              <div className="text-4xl font-bold text-blue-500 mb-4">1</div>
              <h3 className="text-xl font-semibold text-white mt-2">기록</h3>
              <p className="mt-2 text-gray-400">
                아이디어 구상부터 최종 수정까지, 학습의 모든 주요 순간이 백그라운드에서 자동으로 기록됩니다.
              </p>
            </div>
            <div className="bg-gray-800/50 p-8 rounded-xl border border-white/10 text-center">
              <div className="text-4xl font-bold text-blue-500 mb-4">2</div>
              <h3 className="text-xl font-semibold text-white mt-2">연결</h3>
              <p className="mt-2 text-gray-400">
                <span className="text-cyan-400 font-semibold">AI-Link™ 기술</span>이 데이터 조각들을 연결하여, 학생의 생각이 발전해온 과정을 보여주는 &apos;사고의 지도&apos;를 만듭니다.
              </p>
            </div>
            <div className="bg-gray-800/50 p-8 rounded-xl border border-white/10 text-center">
              <div className="text-4xl font-bold text-blue-500 mb-4">3</div>
              <h3 className="text-xl font-semibold text-white mt-2">증명</h3>
              <p className="mt-2 text-gray-400">
                과제 제출 시 '학습 과정 보고서'가 함께 생성되어, 학생의 노력에 대한 명백한 증거를 제공합니다.
              </p>
            </div>
          </div>
          <div className="mt-16 md:mt-20">
            <Image
              src="/images/memo-evolution-note.png"
              alt="메모 진화가 단권화 노트로 통합되는 과정을 보여주는 스크린샷"
              width={1200}
              height={750}
              className="rounded-2xl shadow-2xl border border-white/10"
            />
          </div>
        </section>
        
        {/* Benefits Section */}
        <section 
          ref={addSlideRef as (el: HTMLElement | null) => void}
          className="bg-gray-900/85 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-8 sm:p-12 md:p-16 mb-6 sm:mb-10 
                    shadow-2xl border border-white/10 transition-all duration-500 ease-out
                    hover:transform hover:-translate-y-2 hover:shadow-3xl hover:border-white/20"
        >
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 relative inline-block tracking-tight">
              신뢰를 넘어 교육의 질을 높입니다.
              <div className="absolute bottom-[-10px] left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
            </h2>
            <p className="mt-8 text-lg text-gray-400">교육 현장의 모두가 긍정적인 변화를 경험합니다.</p>
          </div>
          <div className="mt-12">
            <div className="flex justify-center border-b border-gray-700">
              <button onClick={() => setActiveTab('faculty')} className={`py-3 px-6 text-lg font-semibold transition-colors ${activeTab === 'faculty' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-500 hover:text-gray-200'}`}>
                교직원 및 기관
              </button>
              <button onClick={() => setActiveTab('students')} className={`py-3 px-6 text-lg font-semibold transition-colors ${activeTab === 'students' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-500 hover:text-gray-200'}`}>
                학습자
              </button>
            </div>
          </div>
          <div className="mt-12">
            {activeTab === 'faculty' && (
              <div className="grid md:grid-cols-3 gap-8 text-left">
                <div>
                  <h3 className="font-semibold text-lg text-white">교육 본질에 집중</h3>
                  <p className="mt-1 text-gray-400">표절 검사의 부담을 덜고, <span className="text-green-400">학생 성장 지원이라는 본질에 집중</span>할 수 있습니다.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-white">객관적 평가 근거 확보</h3>
                  <p className="mt-1 text-gray-400"><span className="text-green-400">데이터 기반의 공정한 평가</span>로 교육의 신뢰도를 높입니다.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-white">기관의 명성 제고</h3>
                  <p className="mt-1 text-gray-400">AI 시대 교육 혁신을 선도하며 <span className="text-green-400">기관의 경쟁력을 강화</span>합니다.</p>
                </div>
              </div>
            )}
            {activeTab === 'students' && (
              <div className="grid md:grid-cols-3 gap-8 text-left">
                <div>
                  <h3 className="font-semibold text-lg text-white">노력의 정당한 인정</h3>
                  <p className="mt-1 text-gray-400">AI 활용에 대한 오해 없이, <span className="text-green-400">나의 노력을 투명하게 증명</span>하고 정당하게 평가받습니다.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-white">진짜 실력의 성장</h3>
                  <p className="mt-1 text-gray-400">과정 중심의 깊이 있는 학습을 통해 <span className="text-green-400">문제 해결 능력과 비판적 사고력</span>을 기릅니다.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-white">미래 역량 준비</h3>
                  <p className="mt-1 text-gray-400">AI를 윤리적으로 활용하는 경험은 <span className="text-green-400">미래 사회의 핵심 경쟁력</span>이 됩니다.</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section 
          ref={addSlideRef as (el: HTMLElement | null) => void}
          className="bg-gradient-to-br from-blue-500/10 to-indigo-600/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-8 sm:p-12 md:p-16 
                    shadow-2xl border border-blue-500/30 transition-all duration-500 ease-out
                    hover:transform hover:-translate-y-2 hover:shadow-3xl hover:border-blue-500/40 text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 sm:mb-8 tracking-tight">이제, 진짜 교육을 시작할 시간입니다.</h2>
          <p className="mt-4 text-lg text-gray-400 max-w-3xl mx-auto">
            Habitus33과 함께 신뢰의 교육 환경을 만들어갈 파트너를 찾습니다.
          </p>
          <div className="mt-8 flex justify-center">
            <a href="https://habitus33.vercel.app/" 
              className="inline-block bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-4 px-10 
                        rounded-full text-xl shadow-2xl transition-all duration-300 ease-out
                        hover:transform hover:scale-105 hover:shadow-3xl hover:from-blue-400 hover:to-indigo-500
                        focus:outline-none focus:ring-4 focus:ring-blue-500/50">
              지금 체험하기
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default UniversityMarketingPageKO; 