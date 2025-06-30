'use client';

import React, { useState } from 'react';
import Footer from '@/components/common/Footer';
import { UserCircleIcon, ScaleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const UniversityMarketingPageKO = () => {
  const [activeTab, setActiveTab] = useState('faculty');

  return (
    <div className="bg-white text-slate-800 font-sans">
      
      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight leading-snug">
            학습 과정이 입증되면,<br/>진짜 배움이 시작됩니다.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-slate-600 max-w-3xl mx-auto">
            Habitus33은 표절 검사 대신 학습 여정을 조명합니다. 모든 학생의 노력을 눈에 보이고 검증 가능하게 만드세요.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <a href="https://habitus33.vercel.app/" className="bg-blue-600 text-white font-semibold py-3 px-8 rounded-md hover:bg-blue-700 transition-colors">
              지금 체험하기
            </a>
            <a href="mailto:habitus33.tedin@gmail.com" className="bg-white text-slate-700 font-semibold py-3 px-8 rounded-md border border-slate-300 hover:bg-slate-50 transition-colors">
              도입 문의
            </a>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 md:py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">강의실에 찾아온 신뢰의 위기</h2>
            <p className="mt-4 text-lg text-slate-600">AI가 교육 현장의 모두에게 새로운 불확실성을 만들고 있습니다.</p>
          </div>
          <div className="mt-16 grid md:grid-cols-3 gap-8 text-center">
            <div className="p-8">
              <UserCircleIcon className="w-12 h-12 text-blue-600 mx-auto" />
              <h3 className="text-xl font-semibold text-slate-900 mt-6">학생의 불안</h3>
              <p className="mt-2 text-slate-600">
                AI 활용이 오해를 낳지 않을까, 나의 노력을 온전히 인정받지 못할까 걱정됩니다.
              </p>
            </div>
            <div className="p-8">
              <ScaleIcon className="w-12 h-12 text-blue-600 mx-auto" />
              <h3 className="text-xl font-semibold text-slate-900 mt-6">교수의 고민</h3>
              <p className="mt-2 text-slate-600">
                무엇이 학생의 진짜 생각인지, 어떻게 공정하게 평가할지 막막합니다.
              </p>
            </div>
            <div className="p-8">
              <ShieldCheckIcon className="w-12 h-12 text-blue-600 mx-auto" />
              <h3 className="text-xl font-semibold text-slate-900 mt-6">교육의 본질</h3>
              <p className="mt-2 text-slate-600">
                기술이 만든 불신 속에서, 가르치고 배우는 교육의 가치가 흔들리고 있습니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">학습에만 집중하세요. 증명은 Habitus33이 합니다.</h2>
            <p className="mt-4 text-lg text-slate-600">세 단계로 학습 과정에 대한 확실한 증거를 제공합니다.</p>
          </div>
          <div className="mt-20 grid md:grid-cols-3 gap-x-8 gap-y-12">
            <div className="text-center md:text-left">
              <div className="font-bold text-blue-600">1단계</div>
              <h3 className="text-xl font-semibold text-slate-900 mt-2">기록</h3>
              <p className="mt-2 text-slate-600">
                아이디어 구상부터 최종 수정까지, 학습의 모든 주요 순간이 백그라운드에서 자동으로 기록됩니다.
              </p>
            </div>
            <div className="text-center md:text-left">
              <div className="font-bold text-blue-600">2단계</div>
              <h3 className="text-xl font-semibold text-slate-900 mt-2">연결</h3>
              <p className="mt-2 text-slate-600">
                AI-Link™ 기술이 데이터 조각들을 연결하여, 학생의 생각이 발전해온 과정을 보여주는 '사고의 지도'를 만듭니다.
              </p>
            </div>
            <div className="text-center md:text-left">
              <div className="font-bold text-blue-600">3단계</div>
              <h3 className="text-xl font-semibold text-slate-900 mt-2">증명</h3>
              <p className="mt-2 text-slate-600">
                과제 제출 시 '학습 과정 보고서'가 함께 생성되어, 학생의 노력에 대한 명백한 증거를 제공합니다.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Benefits Section */}
      <section className="py-20 md:py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">신뢰를 넘어 교육의 질을 높입니다.</h2>
            <p className="mt-4 text-lg text-slate-600">교육 현장의 모두가 긍정적인 변화를 경험합니다.</p>
          </div>
          <div className="mt-12">
            <div className="flex justify-center border-b border-slate-200">
              <button onClick={() => setActiveTab('faculty')} className={`py-3 px-6 text-lg font-semibold transition-colors ${activeTab === 'faculty' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-800'}`}>
                교직원 및 기관
              </button>
              <button onClick={() => setActiveTab('students')} className={`py-3 px-6 text-lg font-semibold transition-colors ${activeTab === 'students' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-800'}`}>
                학습자
              </button>
            </div>
          </div>
          <div className="mt-12">
            {activeTab === 'faculty' && (
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <h3 className="font-semibold text-slate-900">교육 본질에 집중</h3>
                  <p className="mt-1 text-slate-600">표절 검사의 부담을 덜고, 학생 성장 지원이라는 본질에 집중할 수 있습니다.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">객관적 평가 근거 확보</h3>
                  <p className="mt-1 text-slate-600">데이터 기반의 공정한 평가로 교육의 신뢰도를 높입니다.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">기관의 명성 제고</h3>
                  <p className="mt-1 text-slate-600">AI 시대 교육 혁신을 선도하며 기관의 경쟁력을 강화합니다.</p>
                </div>
              </div>
            )}
            {activeTab === 'students' && (
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <h3 className="font-semibold text-slate-900">노력의 정당한 인정</h3>
                  <p className="mt-1 text-slate-600">AI 활용에 대한 오해 없이, 나의 노력을 투명하게 증명하고 정당하게 평가받습니다.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">진짜 실력의 성장</h3>
                  <p className="mt-1 text-slate-600">과정 중심의 깊이 있는 학습을 통해 문제 해결 능력과 비판적 사고력을 기릅니다.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">미래 역량 준비</h3>
                  <p className="mt-1 text-slate-600">AI를 윤리적으로 활용하는 경험은 미래 사회의 핵심 경쟁력이 됩니다.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">이제, 진짜 교육을 시작할 시간입니다.</h2>
          <p className="mt-4 text-lg text-slate-600">
            Habitus33과 함께 신뢰의 교육 환경을 만들어갈 파트너를 찾습니다.
          </p>
          <div className="mt-8 flex justify-center">
            <a href="https://habitus33.vercel.app/" className="bg-blue-600 text-white font-semibold py-3 px-8 rounded-md hover:bg-blue-700 transition-colors">
              지금 체험하기
            </a>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default UniversityMarketingPageKO; 