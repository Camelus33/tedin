'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ImmersionTimerAnimation,
  GrowthGraphAnimation,
  CompleteSelfAnimation
} from '../components/animations';
import { Brain3D } from '../components/Brain3D';
import BenefitComparisonChart from '../components/BenefitComparisonChart';
import AppLogo from '@/components/common/AppLogo';

export default function LandingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // 로그인 상태 확인
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      // 로그인 되어 있으면 대시보드 페이지로 리디렉션
      router.push("/dashboard");
    }
  }, [router]);

  // 이미 로그인 상태면 빈 화면 표시 (리디렉션 중)
  if (isLoggedIn) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 overflow-hidden">
      {/* 헤더 - Sticky CTA */}
      <header className="fixed w-full top-0 left-0 z-50 bg-white/90 backdrop-blur-md shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full opacity-0 group-hover:opacity-100 blur-sm transition duration-500"></div>
                {/* 개선된 H33+뇌 실루엣 SVG 로고 */}
                <AppLogo className="mr-3 w-[42px] h-[42px] relative transition-transform duration-300 group-hover:scale-105" />
              </div>
              <span className="text-xl font-bold relative">
                <span className="logo-text bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-size-200 animate-gradient-x">
                habitus33
                </span>
                <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-70"></span>
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/login"
                className="text-indigo-700 hover:text-indigo-900 font-medium border border-indigo-300 hover:border-indigo-500 rounded-full px-5 py-2 text-sm transition-all hover:shadow-md"
              >
                로그인
              </Link>
            <Link 
              href="/auth/register" 
                className="bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white font-medium rounded-full px-5 py-2 text-sm shadow-md transition-all relative overflow-hidden group"
              >
                <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full group-hover:w-56 group-hover:h-56 opacity-10"></span>
                <span className="relative">📲 16분 뇌 최적화 세션 시작하기</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-20">
        {/* SECTION 0: Cognitive Surge */}
        <section className="py-16 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-50">
            <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-br from-indigo-400/15 to-blue-400/25 rounded-full blur-3xl transform translate-x-1/4 -translate-y-1/4 animate-pulse-slow"></div>
            <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-gradient-to-tr from-purple-400/25 to-pink-400/15 rounded-full blur-3xl transform -translate-x-1/4 translate-y-1/4 animate-pulse-slow animation-delay-2000"></div>
            <svg className="absolute inset-0 w-full h-full opacity-5" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path fill="currentColor" d="M37,-65.9C46.9,-56.9,53.5,-44.1,60.8,-31.3C68,-18.6,76,-5.8,76.3,7.3C76.7,20.5,69.4,34.1,58.4,41.6C47.4,49.2,32.7,50.8,19.8,57.6C6.9,64.4,-5.2,76.4,-18.8,78.8C-32.5,81.2,-47.7,74,-58.4,62.5C-69.1,51,-75.3,35.1,-79.4,18.6C-83.4,2.1,-85.3,-15,-78.9,-28.1C-72.5,-41.2,-57.8,-50.4,-43.7,-58.6C-29.6,-66.7,-16,-73.7,-1.2,-71.8C13.7,-69.9,27.1,-59.2,37,-65.9Z" transform="translate(100 100)" />
            </svg>
        </div>

          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="relative">
              <h1 className="text-3xl md:text-4xl font-bold text-indigo-800 mb-2 relative z-10">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-700 bg-size-200 animate-gradient-x">
                  Brain Optimizer
                </span>
              </h1>
              <div className="absolute -inset-1 bg-indigo-100/30 blur-sm rounded-lg -z-10"></div>
            </div>
            <motion.h2
              className="text-2xl md:text-3xl font-semibold text-indigo-600 mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.7,
                type: "spring",
                stiffness: 100 
              }}
            >
              '자연스럽게 뇌를 다시 깨우는 습관을 만드세요'
            </motion.h2>
            <hr className="border-t border-gray-200 my-8 max-w-xs mx-auto" />
            <motion.div
              className="space-y-4 text-xl text-gray-600 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <p>'책상에 앉아도 집중이 안돼요.'</p>
              <p>'읽는 도중에 딴 생각이 많이나요'</p>
              <p>'방금 읽었는데 기억이 안나요'</p>
            </motion.div>
            <motion.p
              className="text-2xl font-medium text-purple-700 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              이제, 뇌를 다시 깨울 시간입니다.
            </motion.p>
            <motion.p
              className="text-lg text-gray-800 font-semibold"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              단 <span className="text-indigo-600 font-bold">16분</span>, 집중력, 기억력을 회복하세요.
            </motion.p>
          </div>
          <hr className="border-t border-gray-200 my-16 max-w-4xl mx-auto" />
        </section>

        {/* SECTION 1: Hook */}
        <section className="py-16 bg-white/60 backdrop-blur-md">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h1
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-indigo-900 leading-loose mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              읽어도 머리에서 계속 사라진다면,<br />
              뇌가 무언가에 <span className="text-indigo-600">'차단'</span>당한 상태입니다
            </motion.h1>
            
            {/* 뇌 회로 활성화 애니메이션 */}
            <motion.div
              className="w-full max-w-md mx-auto my-10"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Brain3D />
            </motion.div>
            <motion.p
              className="mt-6 text-xl text-center text-gray-600 max-w-3xl mx-auto mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              최상위 1%들이 활용하는 비밀: 전두엽과 해마를 동시에 활성화시키는 16분 집중 사이클이 비효율적 공부를 대체합니다. habitus33는 신경과학 기반의 인지 회로 최적화 학습법을 실현합니다.
            </motion.p>
            <div className="flex justify-center mt-10">
              <Link 
                href="/auth/register" 
                className="bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white font-medium rounded-xl px-8 py-4 text-lg shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1"
              >
                📲 16분 뇌 최적화 세션 시작하기
              </Link>
            </div>
            <p className="text-sm text-gray-500 mt-2">무료로 시작 가능</p>
          </div>
          <hr className="border-t border-gray-200 my-16 max-w-4xl mx-auto" />
      </section>
      
        {/* SECTION 2: 문제 증폭 */}
        <section className="py-16 bg-gradient-to-br from-indigo-50 via-white to-indigo-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-indigo-800 mb-12">
              이럴 때 어떻게 하고 계시나요?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 문제 상황 1 */}
              <motion.div 
                className="bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="h-2 bg-gradient-to-r from-red-400 to-red-600"></div>
                <div className="p-6">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-red-500 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">읽은 게 금방 잊혀질 때</h3>
                  <div className="bg-gray-50 rounded-lg p-3 mb-3 italic text-gray-600 group-hover:bg-gray-100 transition-colors duration-300">
                    "방금 읽었는데, 뭐였지?"
                  </div>
                  <div className="flex items-center flex-wrap">
                    <span className="text-sm font-medium text-gray-500">심리적 영향:</span>
                    <span className="ml-2 text-sm bg-red-50 text-red-600 px-2 py-1 rounded-full group-hover:bg-red-100 transition-colors duration-300">자신감이 떨어져요</span>
                    <span className="ml-1 text-sm bg-red-50 text-red-600 px-2 py-1 rounded-full group-hover:bg-red-100 transition-colors duration-300">할 수 있다는 믿음이 약해져요</span>
                  </div>
                </div>
              </motion.div>

              {/* 문제 상황 2 */}
              <motion.div 
                className="bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="h-2 bg-gradient-to-r from-amber-400 to-amber-600"></div>
                <div className="p-6">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-amber-500 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">오래 앉아도 진전이 없을 때</h3>
                  <div className="bg-gray-50 rounded-lg p-3 mb-3 italic text-gray-600 group-hover:bg-gray-100 transition-colors duration-300">
                    "이렇게 오래 있었는데, 남는 게 없네?"
                  </div>
                  <div className="flex items-center flex-wrap">
                    <span className="text-sm font-medium text-gray-500">심리적 영향:</span>
                    <span className="ml-2 text-sm bg-amber-50 text-amber-600 px-2 py-1 rounded-full group-hover:bg-amber-100 transition-colors duration-300">나를 탓하게 돼요</span>
                    <span className="ml-1 text-sm bg-amber-50 text-amber-600 px-2 py-1 rounded-full group-hover:bg-amber-100 transition-colors duration-300">의욕이 사라져요</span>
                  </div>
                </div>
              </motion.div>

              {/* 문제 상황 3 */}
              <motion.div 
                className="bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="h-2 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                <div className="p-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-blue-500 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">중요한 순간, 떠오르지 않을 때</h3>
                  <div className="bg-gray-50 rounded-lg p-3 mb-3 italic text-gray-600 group-hover:bg-gray-100 transition-colors duration-300">
                    "또 이러네…"
                  </div>
                  <div className="flex items-center flex-wrap">
                    <span className="text-sm font-medium text-gray-500">심리적 영향:</span>
                    <span className="ml-2 text-sm bg-blue-50 text-blue-600 px-2 py-1 rounded-full group-hover:bg-blue-100 transition-colors duration-300">불안이 커져요</span>
                    <span className="ml-1 text-sm bg-blue-50 text-blue-600 px-2 py-1 rounded-full group-hover:bg-blue-100 transition-colors duration-300">생각이 잘 안 나요</span>
                  </div>
                </div>
              </motion.div>
            </div>
            
            <p className="text-center text-xl text-gray-600 mt-10 italic">
              "이런 경험, 나만 겪는 줄 알았어요."
            </p>
          </div>
          <hr className="border-t border-gray-200 my-16 max-w-4xl mx-auto" />
        </section>

        {/* SECTION 3: 전환형 스토리 */}
        <section className="py-16 bg-white/80 backdrop-blur-md">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-indigo-900 mb-10">
              매일 0.1%씩 차오르는 자신감
            </h2>
            
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-8 shadow-md max-w-3xl mx-auto">
              <div className="flex items-start">
                <div className="bg-indigo-100 rounded-full p-3 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
            </div>
                <div>
                  <p className="text-xl font-medium text-gray-800 mb-4">
                    "전에는 집중을 못했어요. 근데 Habitus33를 쓰고 나선, '11분'만 정해놓고 따라하기만 했어요."
                  </p>
                  
                  <ul className="mt-6 space-y-2 text-gray-700">
                    <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                      TS 시작 후 하루 PPM 1.4 → 2.9
                </li>
                    <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                      3일 연속 후: "문장이 기억되기 시작했다"
                </li>
                    <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                      3주 후: "이젠 공부가 가능해진 느낌"
                </li>
              </ul>
                </div>
              </div>
            </div>
            
            <div className="text-center mt-12 bg-indigo-100 p-8 rounded-xl max-w-3xl mx-auto shadow-sm">
              <p className="text-xl text-indigo-900 font-medium leading-relaxed">
                <span className="line-through mr-2">나는 학습할 수 없는 사람이었다</span>
                <span className="text-2xl">→</span>
                <span className="font-bold text-indigo-800 ml-2">"나는 학습할 수 있는 뇌를 갖게 됐다."</span>
              </p>
              <p className="text-sm text-indigo-700 mt-3 font-medium">정체성의 변화까지 설계</p>
            </div>
          </div>
          <hr className="border-t border-gray-200 my-16 max-w-4xl mx-auto" />
      </section>

        {/* SECTION 4: 과학적 확신 */}
        <section className="py-16 bg-gradient-to-br from-indigo-50 via-white to-blue-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-purple-800 mb-4">
              "베타 테스트 결과, 94%가 만족하는 방법론"
            </h2>
            <p className="text-center text-xl text-indigo-600 mb-12">
              과학 기반 설계 원리
            </p>

            <div className="flex flex-col md:flex-row items-start justify-between gap-8 mt-12">
              {/* 카드 1: 16분 몰입 루틴 */}
            <motion.div
                className="bg-white rounded-xl shadow-lg border border-indigo-100 min-h-[400px] flex flex-col justify-between w-full md:w-1/2 p-8"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <h3 className="text-xl font-bold text-indigo-800 text-center mb-4 mt-2">과학적으로 설계된 16분 몰입 루틴</h3>
                <p className="text-gray-600 text-center mb-6">연구 결과, 최적의 집중력 발휘는 16분 주기로 나타납니다. 이 생체리듬에 맞춘 학습 사이클로 지루함 없이 최고의 집중력을 경험하세요.</p>
                <div className="flex-1 flex items-center justify-center">
                  <ImmersionTimerAnimation />
                </div>
              </motion.div>

              {/* 카드 2: 성장 그래프 */}
              <motion.div
                className="bg-white rounded-xl shadow-lg border border-indigo-100 min-h-[400px] flex flex-col justify-between w-full md:w-1/2 p-8"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <h3 className="text-xl font-bold text-indigo-800 text-center mb-4 mt-2">검증된 결과, 놀라운 변화</h3>
                <p className="text-gray-600 text-center mb-6">74% 집중시간 증가, 42% 암기력 향상</p>
                <div className="flex-1 flex items-center justify-center">
                  <GrowthGraphAnimation />
              </div>
            </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
              {/* 카드 3: ZenGo 인지증강 바둑게임 */}
              <motion.div className="bg-white rounded-xl shadow-lg border border-indigo-100 min-h-[340px] flex flex-col justify-between">
                <div className="p-6 md:p-8 flex flex-col md:flex-row items-center flex-1 gap-6 md:gap-8">
                  {/* 그래픽 */}
                  <div className="flex-shrink-0 flex items-center justify-center w-full md:w-[160px] min-w-[120px]">
                    <svg width="120" height="48" viewBox="0 0 120 48">
                      <defs>
                        <radialGradient id="blackStoneGrad" cx="35%" cy="35%" r="70%">
                          <stop offset="0%" stopColor="#444" />
                          <stop offset="60%" stopColor="#18181b" />
                          <stop offset="100%" stopColor="#000" />
                        </radialGradient>
                        <radialGradient id="whiteStoneGrad" cx="35%" cy="35%" r="70%">
                          <stop offset="0%" stopColor="#fff" />
                          <stop offset="60%" stopColor="#e5e7eb" />
                          <stop offset="100%" stopColor="#bbb" />
                        </radialGradient>
                        <filter id="stoneShadow" x="-30%" y="-30%" width="160%" height="160%">
                          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.18" />
                        </filter>
                      </defs>
                      {/* 좌: 검은돌 */}
                      <g>
                        <circle cx="28" cy="24" r="18" fill="url(#blackStoneGrad)" stroke="#fff" strokeWidth="1.5" filter="url(#stoneShadow)" />
                        <ellipse cx="22" cy="18" rx="7" ry="4" fill="white" opacity="0.18" />
                        <text x="28" y="29" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#fff" style={{paintOrder:'stroke'}}>단어</text>
                      </g>
                      {/* 중앙: 흰돌 */}
                      <g>
                        <circle cx="60" cy="24" r="18" fill="url(#whiteStoneGrad)" stroke="#bbb" strokeWidth="2" filter="url(#stoneShadow)" />
                        <ellipse cx="54" cy="18" rx="7" ry="4" fill="white" opacity="0.22" />
                        <text x="60" y="29" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#222" stroke="#fff" strokeWidth="0.5" style={{paintOrder:'stroke'}}>문장</text>
                      </g>
                      {/* 우: 검은돌 */}
                      <g>
                        <circle cx="92" cy="24" r="18" fill="url(#blackStoneGrad)" stroke="#fff" strokeWidth="1.5" filter="url(#stoneShadow)" />
                        <ellipse cx="86" cy="18" rx="7" ry="4" fill="white" opacity="0.18" />
                        <text x="92" y="29" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#fff" style={{paintOrder:'stroke'}}>위치</text>
                      </g>
                          </svg>
                        </div>
                  {/* 설명 */}
                  <div className="flex-1 flex flex-col justify-center items-center md:items-start text-center md:text-left">
                    <h3 className="text-xl font-bold text-indigo-800 mb-2 mt-2 md:mt-0">ZenGo 기억 착수</h3>
                    <div className="text-base font-semibold text-indigo-600 mb-3">작업기억, 문해력, 공간지각, 순서추론 등 다양한 인지 능력을 동시에 강화합니다.</div>
                    <div className="text-indigo-700 font-semibold mb-2 text-base">제한 시간 내 단어와 위치를 기억하고<br className='md:hidden'/>순서대로 클릭하는 게임!</div>
                    <div className="text-gray-500 text-sm">예시: [단어] → [문장] → [위치] 기억, 순서대로 클릭!</div>
              </div>
                </div>
              </motion.div>

              {/* 카드 4: 만다라트 지표분석 제공 */}
              <motion.div className="bg-white rounded-xl shadow-lg border border-indigo-100 min-h-[340px] flex flex-col justify-between">
                <div className="p-6 md:p-8 flex flex-col md:flex-row items-center flex-1 gap-6 md:gap-8">
                  {/* 그래픽 */}
                  <div className="flex-shrink-0 flex items-center justify-center w-full md:w-[160px] min-w-[120px]">
                    <CompleteSelfAnimation />
                  </div>
                  {/* 설명 */}
                  <div className="flex-1 flex flex-col justify-center items-center md:items-start text-center md:text-left">
                    <h3 className="text-xl font-bold text-indigo-800 mb-2 mt-2 md:mt-0">만다라트식 목표 완수</h3>
                    <div className="text-base font-semibold text-indigo-600 mb-3">33일간 8가지 인지 능력을 모두 향상시킬 수 있습니다.</div>
                  </div>
            </div>
            </motion.div>
          </div>
        </div>
          <hr className="border-t border-gray-200 my-16 max-w-4xl mx-auto" />
      </section>
      
        {/* SECTION 5: 증거 기반 전환 */}
        <section className="py-16 bg-white/80 backdrop-blur-md">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-lg flex flex-col md:flex-row items-center overflow-hidden">
              {/* Custom MRI Brain Image */}
              <div className="flex-1 flex justify-center items-center bg-gradient-to-br from-indigo-100 via-purple-100 to-blue-100 md:min-h-[340px]">
                <Image
                  src="/images/brain-mri.jpg"
                  alt="뇌속임 학습법 뇌 MRI"
                  width={220}
                  height={220}
                  className="rounded-2xl shadow-xl object-cover"
                  priority
                />
              </div>
              {/* 설명 영역 */}
              <div className="flex-1 p-8 md:p-12">
                <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 via-purple-700 to-blue-700 mb-6">
                  뇌 최적화 학습법은 왜 인기일까요?
                </h2>
                <p className="text-lg text-gray-700 mb-4 leading-relaxed">
                  <span className="font-semibold text-indigo-600">뇌 최적화 학습법</span>은 신경과학 기반의 루틴 설계로, 짧은 시간에 작업기억을 극대화합니다.<br />
                  33일간 반복되는 습관화 과정을 통해 누구나 쉽게 몰입과 성취를 경험할 수 있습니다.
                </p>
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5 mb-4">
                  <h3 className="text-xl font-bold text-indigo-700 mb-2">뇌 최적화 루틴 적용 서비스 예시</h3>
                  <ul className="list-disc pl-5 text-gray-700 space-y-1">
                    <li><span className="font-semibold text-purple-600">TS</span> – 16분 집중 독서 & 반추 독서 메모</li>
                    <li><span className="font-semibold text-blue-600">ZenGo</span> – 바둑기반 기억 착수</li>
                    <li><span className="font-semibold text-indigo-600">33일 루틴 트래커</span> – 습관화와 성장 시각화</li>
                  </ul>
                </div>
                <Link
                  href="/brain-hack-routine"
                  className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-full px-6 py-3 shadow hover:from-indigo-700 hover:to-purple-700 transition"
                >
                  뇌 최적화 루틴 더 알아보기
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 6: 제품 설명 */}
        <section className="py-16 bg-gradient-to-br from-indigo-50 via-white to-blue-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
              이 앱은 다릅니다
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">TS – 집중 독서 루틴</h3>
          </div>

                <ol className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full mr-2 font-bold">1</span>
                    <span className="text-gray-700">도서 등록</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full mr-2 font-bold">2</span>
                    <span className="text-gray-700">예열 훈련 팁</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full mr-2 font-bold">3</span>
                    <span className="text-gray-700">11분 집중 독서</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full mr-2 font-bold">4</span>
                    <span className="text-gray-700">반추 + 1줄 메모 요약</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full mr-2 font-bold">5</span>
                    <span className="text-gray-700">자동 성과 피드백 + PPM 시각화</span>
                  </li>
                </ol>
                
                <div className="bg-green-50 p-6 rounded-lg flex items-center text-green-800 border border-green-100 shadow-sm">
                  <svg className="h-6 w-6 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                  <p className="font-medium text-base">즉시 집중 → 즉시 피드백 → 즉시 성취감</p>
              </div>
            </div>

              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                </svg>
              </div>
                  <h3 className="text-xl font-bold text-gray-900">Zengo – 바둑판 기억 착수</h3>
            </div>

                <ol className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full mr-2 font-bold">1</span>
                    <span className="text-gray-700">3×3/5×5 바둑판</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full mr-2 font-bold">2</span>
                    <span className="text-gray-700">제한 시간 내 단어 학습</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full mr-2 font-bold">3</span>
                    <span className="text-gray-700">위치+순서 기억 복기</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full mr-2 font-bold">4</span>
                    <span className="text-gray-700">정확도 + 반응속도 점수 제공</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full mr-2 font-bold">5</span>
                    <span className="text-gray-700">뱃지·레벨업 구조</span>
                  </li>
                </ol>
                
                <div className="bg-green-50 p-6 rounded-lg flex items-center text-green-800 border border-green-100 shadow-sm">
                  <svg className="h-6 w-6 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                  <p className="font-medium text-base">작업 기억 → 판단력 향상 → 즉각 피드백 → 루틴화</p>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <Link 
                href="/auth/register" 
                className="bg-gradient-to-r from-indigo-700 to-purple-700 hover:from-indigo-800 hover:to-purple-800 text-white font-medium rounded-xl px-8 py-4 text-lg shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1"
              >
                📲 16분 뇌 최적화 세션 시작하기
              </Link>
            </div>
            <p className="text-center text-sm text-gray-500 mt-2">첫 1,000명 사용자에게만 제공되는 무료 업그레이드 기회</p>
          </div>
          <hr className="border-t border-gray-200 my-16 max-w-4xl mx-auto" />
        </section>

        {/* SECTION 7: Offer */}
        <section className="py-16 bg-white/80 backdrop-blur-md">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
              지금 성장하세요.
            </h2>
            
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="overflow-auto">
                <table className="min-w-full">
                  <tbody>
                    <tr className="border-b hover:bg-gray-50 transition-colors">
                      <td className="py-6 px-8 text-lg font-semibold text-gray-900">33일간 모든 기능을 무료로 체험하세요.</td>
                    </tr>
                    <tr className="border-b hover:bg-gray-50 transition-colors">
                      <td className="py-6 px-8 text-lg font-semibold text-gray-900">33일간 매일 1회이상 TS모드 및 ZenGo 트레이닝을 수행시,<br className='hidden sm:block'/> 33일간 유료기능 초대코드 1장 드립니다.</td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="py-6 px-8 text-lg font-semibold text-gray-900">33일간 매일 1시간 이상 사용한 분은 추첨을 통해<br className='hidden sm:block'/> 로고각인 한정판 라미 만년필을 경품으로 드립니다. (선착순 신청)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-center mt-12">
              <Link 
                href="/auth/register" 
                className="bg-gradient-to-r from-indigo-700 to-purple-700 hover:from-indigo-800 hover:to-purple-800 text-white font-medium rounded-xl px-8 py-4 text-lg shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1"
              >
                📲 16분 뇌 최적화 세션 시작하기
              </Link>
            </div>
          </div>
          <hr className="border-t border-gray-200 my-16 max-w-4xl mx-auto" />
      </section>
      
        {/* SECTION 8: 최종 확신 장치 */}
        <section className="py-20 bg-gradient-to-br from-indigo-600 to-blue-700 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 w-full h-full overflow-hidden opacity-20">
            <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-white/10 rounded-full blur-3xl transform translate-x-1/4 -translate-y-1/4 animate-pulse-slow"></div>
            <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-white/10 rounded-full blur-3xl transform -translate-x-1/4 translate-y-1/4 animate-pulse-slow animation-delay-2000"></div>
            <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path fill="#FFF" d="M37,-65.9C46.9,-56.9,53.5,-44.1,60.8,-31.3C68,-18.6,76,-5.8,76.3,7.3C76.7,20.5,69.4,34.1,58.4,41.6C47.4,49.2,32.7,50.8,19.8,57.6C6.9,64.4,-5.2,76.4,-18.8,78.8C-32.5,81.2,-47.7,74,-58.4,62.5C-69.1,51,-75.3,35.1,-79.4,18.6C-83.4,2.1,-85.3,-15,-78.9,-28.1C-72.5,-41.2,-57.8,-50.4,-43.7,-58.6C-29.6,-66.7,-16,-73.7,-1.2,-71.8C13.7,-69.9,27.1,-59.2,37,-65.9Z" transform="translate(100 100)" />
            </svg>
          </div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.h2 
              className="text-4xl md:text-5xl font-bold mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              변화는 생각보다 쉽습니다.
            </motion.h2>
            <motion.p 
              className="text-2xl font-semibold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              이제 의지력이 아닌, 시스템으로 학습하세요.
            </motion.p>
            <motion.p 
              className="text-lg text-gray-300 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              뇌는 패턴을 인식하고, 성취의 기쁨에 기억합니다.
            </motion.p>
            <motion.p 
              className="text-xl font-medium text-white mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              지금 당신의 뇌 학습 회로를 빌드업할 시간입니다.
            </motion.p>
            <motion.p 
              className="text-lg text-gray-400 mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              <span className="font-bold text-white">단 16분</span>, 당신의 몰입은 이미 시작되었습니다.
            </motion.p>
            {/* 최종 CTA 버튼 */}
          <Link 
            href="/auth/register" 
              className="relative inline-block bg-white text-indigo-700 font-bold rounded-xl px-10 py-4 text-xl shadow-lg hover:bg-gray-100 transition-colors transform hover:scale-105 group"
          >
              <span className="relative z-10">지금 바로 시작하기</span>
              <span className="absolute inset-0 rounded-xl bg-white blur-sm opacity-0 group-hover:opacity-70 transition-opacity -z-10"></span>
          </Link>
            
            {/* 성공 사례 아이콘 */}
            <div className="flex justify-center space-x-4 mt-16">
              <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      {/* 고정 미니 CTA 버튼 */}
      <div className="fixed bottom-8 right-8 z-50 opacity-0 translate-y-10 transition-all duration-500" id="scrollCTA">
        <Link
          href="/auth/register"
          className="flex items-center justify-center bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-full w-14 h-14 shadow-xl hover:shadow-2xl transition-all transform hover:scale-110"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
        </Link>
        </div>

      <footer className="bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 border-t mt-16 py-10 text-gray-700 text-sm">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row md:justify-between md:items-center gap-8">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center mb-2">
              <span className="font-extrabold text-xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 via-purple-700 to-blue-700 mr-2">Habitus33</span>
              <span className="text-xs text-gray-400 ml-2">by Tedin Inc.</span>
            </div>
            <div className="text-xs text-gray-500">
              사업자등록번호: 34888-02077 | 대표자: 서봉진
            </div>
            <div className="text-xs text-gray-400 mt-1">© 2025 Habitus33. All rights reserved.</div>
          </div>
          <div className="flex flex-col gap-2 md:gap-1">
            <div className="flex gap-4 mb-1">
              <a href="/legal/terms" className="hover:underline font-medium text-indigo-700">이용약관</a>
              <a href="/legal/privacy" className="hover:underline font-medium text-indigo-700">개인정보처리방침</a>
            </div>
            <div>
              <span className="font-medium text-gray-700">고객지원:</span> <a href="mailto:camelus.tedin@gmail.com" className="hover:underline text-indigo-600">camelus.tedin@gmail.com</a>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="font-semibold text-indigo-700 mb-1">인증 / 수상</div>
            <div className="text-xs text-gray-600">창업진흥원 재도전성공패키지 지원과제 선정기업</div>
            <div className="text-xs text-gray-600">한국관광공사 관광스타트업 공모전 선정기업</div>
          </div>
        </div>
      </footer>
    </div>
  );
} 

// 스크롤 시 고정 CTA 버튼 표시 스크립트
// 페이지 로드 시 실행
typeof window !== 'undefined' && (function() {
  window.addEventListener('scroll', function() {
    const scrollCTA = document.getElementById('scrollCTA');
    if (scrollCTA) {
      if (window.scrollY > 300) {
        scrollCTA.classList.remove('opacity-0', 'translate-y-10');
        scrollCTA.classList.add('opacity-100', 'translate-y-0');
      } else {
        scrollCTA.classList.remove('opacity-100', 'translate-y-0');
        scrollCTA.classList.add('opacity-0', 'translate-y-10');
      }
    }
  });
})(); 