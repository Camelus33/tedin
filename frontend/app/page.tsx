'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [openFaqId, setOpenFaqId] = useState<number | null>(null);

  const toggleFaq = (id: number) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  useEffect(() => {
    // 로그인 상태 확인
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      // 로그인 되어 있으면 대시보드 페이지로 리디렉션
      router.push("/dashboard");
    }

    // 해시 링크 처리 (스크롤 이동)
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash) {
        const element = document.querySelector(hash);
        if (element) {
          // 헤더 높이를 고려한 오프셋 계산 (대략 100px)
          const offset = 100;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }
    };

    // 페이지 로드 시 처리
    handleHashChange();

    // 해시 변경 이벤트 리스너 추가
    window.addEventListener('hashchange', handleHashChange);

    // 클린업 함수
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [router]);

  // 이미 로그인 상태면 빈 화면 표시 (리디렉션 중)
  if (isLoggedIn) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 overflow-hidden">
      {/* 헤더 */}
      <header className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Image
                src="/images/logo.svg"
                alt="habitus33 로고"
                width={40}
                height={40}
                className="mr-3"
              />
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500">
                habitus33
              </span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
                주요 기능
              </Link>
              <Link href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
                요금제
              </Link>
              <Link href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">
                사용 후기
              </Link>
              <Link href="#faq" className="text-gray-600 hover:text-gray-900 transition-colors">
                자주 묻는 질문
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/login"
                className="hidden md:inline-block text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                로그인
              </Link>
            <Link 
              href="/auth/register" 
                className="bg-white/30 backdrop-blur-md border border-white/50 shadow-sm text-indigo-700 hover:text-indigo-800 hover:bg-white/40 font-medium rounded-full px-4 py-2 transition-all"
              >
                무료로 시작하기
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* 히어로 섹션 */}
      <section className="relative pt-16 pb-32">
        {/* 배경 장식 요소 */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-br from-indigo-300/10 to-blue-300/20 rounded-full blur-3xl transform translate-x-1/4 -translate-y-1/4"></div>
          <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-gradient-to-tr from-purple-300/20 to-pink-300/10 rounded-full blur-3xl transform -translate-x-1/4 translate-y-1/4"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center">
            {/* 좌측 텍스트 */}
            <motion.div
              className="w-full lg:w-1/2 text-center lg:text-left mb-12 lg:mb-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                독서의 <span className="text-indigo-600">새로운 차원</span>을 경험하세요
              </h1>
              <p className="mt-6 text-xl text-gray-600 max-w-2xl">
                habitus33은 독서 속도 향상과 메타인지 훈련을 위한 최적의 플랫폼입니다. 
                집중력 향상, 이해도 증진, 기억력 강화를 통해 당신의 독서 습관을 혁신적으로 변화시켜 보세요.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                  href="/auth/register"
                  className="bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white font-medium rounded-xl px-8 py-4 text-lg shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1"
            >
              지금 시작하기
            </Link>
            <Link 
                  href="#features"
                  className="bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 hover:text-gray-900 font-medium rounded-xl px-8 py-4 text-lg shadow-sm hover:shadow transition-all"
                >
                  더 알아보기
                </Link>
              </div>
            </motion.div>

            {/* 우측 이미지/일러스트 */}
            <motion.div
              className="w-full lg:w-1/2 pl-0 lg:pl-12"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl blur-xl opacity-20"></div>
                <div className="relative bg-white/80 backdrop-blur-md border border-white/50 rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src="/images/hero-image.svg"
                    alt="habitus33 앱 화면"
                    width={600}
                    height={450}
                    className="w-full h-auto"
                  />
                </div>
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-gradient-to-br from-indigo-600 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  NEW
                </div>
              </div>
            </motion.div>
          </div>

          {/* 트러스트 배지 */}
          <div className="mt-20">
            <p className="text-center text-gray-500 mb-6">수천 명의 사용자가 신뢰하는</p>
            <div className="flex flex-wrap justify-center gap-8 opacity-70">
              <Image
                src="/images/trust-badge-1.svg"
                alt="트러스트 배지 1"
                width={120}
                height={40}
                className="h-8 w-auto"
              />
              <Image
                src="/images/trust-badge-2.svg"
                alt="트러스트 배지 2"
                width={120}
                height={40}
                className="h-8 w-auto"
              />
              <Image
                src="/images/trust-badge-3.svg"
                alt="트러스트 배지 3"
                width={120}
                height={40}
                className="h-8 w-auto"
              />
              <Image
                src="/images/trust-badge-4.svg"
                alt="트러스트 배지 4"
                width={120}
                height={40}
                className="h-8 w-auto"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* 기능 소개 섹션 */}
      <section id="features" className="py-20 bg-white/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              독서를 새로운 차원으로 업그레이드
          </h2>
            <p className="mt-4 text-xl text-gray-600">
              habitus33의 혁신적인 기능으로 독서 습관과 효율성을 극대화하세요
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* TS 모드 */}
            <motion.div
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-100"
              whileHover={{ y: -5, boxShadow: "0 10px 40px rgba(0,0,0,0.08)" }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">TS 모드</h3>
              <p className="text-gray-600">
                자신의 읽기 속도를 객관적으로 측정하고 개선하는 타이머 기반 훈련 시스템. 다른 사용자들과 독서 속도를 비교하여 자신의 위치를 파악할 수 있습니다.
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  객관적인 독서 속도(PPM) 측정 및 기록
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  다른 독자들과의 속도 비교 분석
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  개인화된 속도 향상 전략 제공
                </li>
              </ul>
            </motion.div>

            {/* Zengo 모드 */}
            <motion.div
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-100"
              whileHover={{ y: -5, boxShadow: "0 10px 40px rgba(0,0,0,0.08)" }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                </svg>
            </div>
              <h3 className="text-xl font-semibold mb-3">Zengo 모드</h3>
              <p className="text-gray-600">
                프로 바둑기사들의 유명한 포석, 행마, 수읽기 등에서 영감을 얻은 인지게임. 남녀노소 누구나 기억력과 문해력을 향상시킬 수 있습니다.
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  바둑처럼 전략적 사고력 향상 훈련
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  남녀노소 모두에게 적합한 문해력 게임
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  단계적으로 증가하는 난이도로 지속적 성장
                </li>
              </ul>
            </motion.div>

            {/* 데이터 기반 분석 */}
            <motion.div
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-100"
              whileHover={{ y: -5, boxShadow: "0 10px 40px rgba(0,0,0,0.08)" }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">데이터 기반 분석</h3>
              <p className="text-gray-600">
                개인 맞춤형 독서 분석과 통계를 통해 독서 습관을 객관적으로 파악하고 효율적으로 개선할 수 있습니다.
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  시간대별, 일간, 월간 독서 패턴 분석
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  장르별 독서 분포 및 선호도 파악
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  개인화된 향상 제안 및 목표 설정
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 요금제 섹션 */}
      <section id="pricing" className="py-20 bg-white/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              당신에게 맞는 요금제를 선택하세요
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              합리적인 가격으로 더 많은 기능을 경험해보세요
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10 max-w-5xl mx-auto">
            {/* 무료 요금제 */}
            <motion.div
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
              whileHover={{ y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">무료 체험</h3>
                <div className="mb-4">
                  <span className="text-5xl font-bold text-gray-900">₩0</span>
                  <span className="text-gray-500 ml-2">/ 평생</span>
                </div>
                <p className="text-gray-600 mb-6">
                  독서 습관을 시작하기 위한 기본 기능들을 무료로 사용해보세요.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-gray-600">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    기본 TS 모드 사용
                  </li>
                  <li className="flex items-center text-gray-600">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    매일 5권 도서 추가 가능
                  </li>
                  <li className="flex items-center text-gray-600">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    기본 독서 통계
                  </li>
                  <li className="flex items-center text-gray-400">
                    <svg className="h-5 w-5 text-gray-300 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Zengo 모드 제한 사용
                  </li>
                  <li className="flex items-center text-gray-400">
                    <svg className="h-5 w-5 text-gray-300 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    고급 분석 및 인사이트
                  </li>
                </ul>
                <button className="w-full py-3 px-4 border border-gray-300 rounded-xl text-indigo-600 font-medium bg-white hover:bg-gray-50 transition-colors">
                  무료로 시작하기
                </button>
              </div>
            </motion.div>

            {/* 프리미엄 요금제 */}
            <motion.div
              className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl shadow-xl border border-indigo-100 overflow-hidden relative"
              whileHover={{ y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="absolute top-0 right-0 bg-gradient-to-r from-indigo-600 to-blue-500 text-white px-6 py-1 rounded-bl-lg font-medium text-sm">
                인기 요금제
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">프리미엄</h3>
                <div className="mb-4">
                  <span className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500">
                    ₩9,900
                  </span>
                  <span className="text-gray-500 ml-2">/ 월</span>
                </div>
                <p className="text-gray-600 mb-6">
                  모든 프리미엄 기능과 혜택을 이용하여 독서 습관을 혁신적으로 변화시키세요.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-gray-600">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    모든 무료 체험 기능 포함
                  </li>
                  <li className="flex items-center text-gray-600">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    무제한 도서 추가
                  </li>
                  <li className="flex items-center text-gray-600">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Zengo 모드 완전 이용
                  </li>
                  <li className="flex items-center text-gray-600">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    고급 분석 및 인사이트
                  </li>
                  <li className="flex items-center text-gray-600">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    맞춤형 독서 계획 추천
                  </li>
                </ul>
                <Link href="/profile/upgrade" className="block w-full py-3 px-4 rounded-xl text-white font-medium bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 shadow-md hover:shadow-lg transition-all text-center">
                  프리미엄 시작하기
                </Link>
                <p className="text-center text-xs text-gray-500 mt-4">
                  첫 달 50% 할인! 지금 가입하면 연 요금제 추가 할인
                </p>
            </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* 사용 후기 섹션 */}
      <section id="testimonials" className="py-20 bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            사용자들의 이야기
          </h2>
            <p className="mt-4 text-xl text-gray-600">
              habitus33으로 독서 습관과 집중력이 어떻게 변화했는지 확인해보세요
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* 후기 1 */}
            <motion.div
              className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-100"
              whileHover={{ y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center mb-4">
                <div className="rounded-full bg-indigo-100 w-12 h-12 flex items-center justify-center mr-4">
                  <span className="text-xl font-semibold text-indigo-600">JK</span>
                </div>
                <div>
                  <h4 className="font-semibold">김지현</h4>
                  <p className="text-gray-500 text-sm">대학생</p>
                </div>
              </div>
              <div className="flex text-yellow-400 mb-4">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
              </div>
              <p className="text-gray-600 mb-4">
                "인지능력 향상에 실질적인 효과를 느꼈어요. TS 모드를 통해 독서 속도가 2주 만에 30% 증가했고, 이제는 책을 더 빨리 읽으면서도 내용을 더 잘 이해할 수 있게 되었습니다."
              </p>
              <p className="text-gray-500 text-sm">2023년 10월 이용</p>
            </motion.div>

            {/* 후기 2 */}
            <motion.div
              className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-100"
              whileHover={{ y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center mb-4">
                <div className="rounded-full bg-purple-100 w-12 h-12 flex items-center justify-center mr-4">
                  <span className="text-xl font-semibold text-purple-600">SJ</span>
                </div>
                <div>
                  <h4 className="font-semibold">박성준</h4>
                  <p className="text-gray-500 text-sm">직장인</p>
                </div>
              </div>
              <div className="flex text-yellow-400 mb-4">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
              </div>
              <p className="text-gray-600 mb-4">
                "Zengo 모드는 정말 혁신적이에요! 바둑에서 영감을 받은 방식으로 문해력이 놀랍게 향상되었고, 평소 읽기 어려웠던 전문 서적도 더 쉽게 이해할 수 있게 되었습니다."
              </p>
              <p className="text-gray-500 text-sm">2023년 11월 이용</p>
            </motion.div>

            {/* 후기 3 */}
            <motion.div
              className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-100"
              whileHover={{ y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center mb-4">
                <div className="rounded-full bg-blue-100 w-12 h-12 flex items-center justify-center mr-4">
                  <span className="text-xl font-semibold text-blue-600">MJ</span>
                </div>
                <div>
                  <h4 className="font-semibold">이민정</h4>
                  <p className="text-gray-500 text-sm">초등학생 학부모</p>
                </div>
              </div>
              <div className="flex text-yellow-400 mb-4">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
              </div>
              <p className="text-gray-600 mb-4">
                "아이가 habitus33을 통해 독서에 흥미를 갖게 되었어요. 특히 Zengo 모드는 게임처럼 재미있으면서도 문해력을 크게 향상시켜 학교 성적도 올랐습니다. 모든 학부모님께 추천합니다!"
              </p>
              <p className="text-gray-500 text-sm">2023년 12월 이용</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 자주 묻는 질문 섹션 */}
      <section id="faq" className="py-20 bg-white/60 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              자주 묻는 질문
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              habitus33에 대한 궁금증을 해결해 드립니다
            </p>
          </div>

          <div className="space-y-6">
            {/* FAQ 아이템 1 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <button
                className="flex justify-between items-center w-full px-6 py-5 text-left"
                onClick={() => toggleFaq(1)}
              >
                <span className="font-semibold text-gray-900">habitus33은 어떤 서비스인가요?</span>
                <svg className={`h-6 w-6 text-gray-500 transform transition-transform duration-200 ${openFaqId === 1 ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className={`px-6 pb-5 ${openFaqId === 1 ? 'block' : 'hidden'}`}>
                <p className="text-gray-600">
                  habitus33은 독서 속도 향상과 메타인지 훈련을 위한 혁신적인 플랫폼입니다. TS 모드를 통해 독서 속도를 객관적으로 측정하고 향상시킬 수 있으며, Zengo 모드에서는 바둑 기사들의 사고방식에서 영감을 받은 문해력 향상 훈련을 제공합니다. 독서 시간을 더 효율적이고 효과적으로 만들어 드립니다.
                </p>
              </div>
            </div>

            {/* FAQ 아이템 2 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <button
                className="flex justify-between items-center w-full px-6 py-5 text-left"
                onClick={() => toggleFaq(2)}
              >
                <span className="font-semibold text-gray-900">무료 버전과 프리미엄 버전의 차이점은 무엇인가요?</span>
                <svg className={`h-6 w-6 text-gray-500 transform transition-transform duration-200 ${openFaqId === 2 ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className={`px-6 pb-5 ${openFaqId === 2 ? 'block' : 'hidden'}`}>
                <p className="text-gray-600">
                  무료 버전에서는 기본적인 TS 모드 기능과 매일 5권의 도서 추가, 기본 독서 통계 기능을 이용할 수 있습니다. 프리미엄 버전에서는 무제한 도서 추가, Zengo 모드의 모든 기능, 고급 분석 및 인사이트, 맞춤형 독서 계획 추천 등 더 많은 고급 기능을 이용할 수 있습니다.
                </p>
              </div>
            </div>

            {/* FAQ 아이템 3 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <button
                className="flex justify-between items-center w-full px-6 py-5 text-left"
                onClick={() => toggleFaq(3)}
              >
                <span className="font-semibold text-gray-900">TS 모드는 무엇인가요?</span>
                <svg className={`h-6 w-6 text-gray-500 transform transition-transform duration-200 ${openFaqId === 3 ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className={`px-6 pb-5 ${openFaqId === 3 ? 'block' : 'hidden'}`}>
                <p className="text-gray-600">
                  TS 모드는 자신의 독서 속도를 객관적으로 측정하고 개선하기 위한 타이머 기반 훈련 시스템입니다. 분당 단어 수(PPM)를 측정하여 다른 독자들과 비교할 수 있고, 자신의 독서 속도 향상을 추적할 수 있습니다. 또한 객관적인 데이터를 기반으로 맞춤형 개선 전략을 제공합니다.
                </p>
              </div>
            </div>

            {/* FAQ 아이템 4 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <button
                className="flex justify-between items-center w-full px-6 py-5 text-left"
                onClick={() => toggleFaq(4)}
              >
                <span className="font-semibold text-gray-900">Zengo 모드는 어떻게 작동하나요?</span>
                <svg className={`h-6 w-6 text-gray-500 transform transition-transform duration-200 ${openFaqId === 4 ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className={`px-6 pb-5 ${openFaqId === 4 ? 'block' : 'hidden'}`}>
                <p className="text-gray-600">
                  Zengo 모드는 프로 바둑기사들의 유명한 포석, 행마, 수읽기 등에서 영감을 받은 인지게임입니다. 패턴 인식, 전략적 사고, 기억력 등을 향상시키는 다양한 훈련을 통해 문해력을 개선합니다. 남녀노소 누구나 쉽게 시작할 수 있으며, 난이도가 점진적으로 증가하여 지속적인 성장을 돕습니다.
                </p>
              </div>
            </div>

            {/* FAQ 아이템 5 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <button
                className="flex justify-between items-center w-full px-6 py-5 text-left"
                onClick={() => toggleFaq(5)}
              >
                <span className="font-semibold text-gray-900">구독을 언제든지 취소할 수 있나요?</span>
                <svg className={`h-6 w-6 text-gray-500 transform transition-transform duration-200 ${openFaqId === 5 ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className={`px-6 pb-5 ${openFaqId === 5 ? 'block' : 'hidden'}`}>
                <p className="text-gray-600">
                  네, 언제든지 쉽게 구독을 취소할 수 있습니다. 취소 후에도 구독 기간이 끝날 때까지 프리미엄 기능을 계속 이용할 수 있으며, 그 이후에는 무료 계정으로 전환됩니다. 구독 취소 시 별도의 위약금이나 추가 비용은 없습니다.
                </p>
              </div>
            </div>

            {/* FAQ 아이템 6 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <button
                className="flex justify-between items-center w-full px-6 py-5 text-left"
                onClick={() => toggleFaq(6)}
              >
                <span className="font-semibold text-gray-900">어떤 기기에서 사용할 수 있나요?</span>
                <svg className={`h-6 w-6 text-gray-500 transform transition-transform duration-200 ${openFaqId === 6 ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className={`px-6 pb-5 ${openFaqId === 6 ? 'block' : 'hidden'}`}>
                <p className="text-gray-600">
                  habitus33은 웹 기반 서비스로, 데스크톱, 노트북, 태블릿, 스마트폰 등 인터넷에 연결된 모든 기기에서 이용 가능합니다. 최신 버전의 Chrome, Firefox, Safari, Edge 브라우저를 지원합니다. 앱 다운로드 없이 브라우저에서 바로 사용할 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA 섹션 */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 opacity-90"></div>
        <div className="absolute inset-0 bg-pattern opacity-10"></div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            독서의 새로운 경험을 지금 시작하세요
          </h2>
          <p className="text-xl text-indigo-100 mb-10 max-w-3xl mx-auto">
            첫 독서 세션을 무료로 시작하고, 독서 습관을 혁신적으로 변화시켜 보세요.
            지금 가입하면 7일 무료 프리미엄 혜택이 제공됩니다.
          </p>
          <Link 
            href="/auth/register" 
            className="bg-white text-indigo-600 hover:bg-gray-100 font-medium rounded-xl px-8 py-4 text-lg shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 inline-block"
          >
            지금 바로 시작하기
          </Link>
        </div>
      </section>
      
      {/* 푸터 */}
      <footer className="bg-white/50 backdrop-blur-md py-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-gray-900 font-semibold mb-4">제품</h3>
              <ul className="space-y-2">
                <li><Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">기능</Link></li>
                <li><Link href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">요금제</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-gray-900 transition-colors">다운로드</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-gray-900 transition-colors">로드맵</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-gray-900 font-semibold mb-4">회사</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-600 hover:text-gray-900 transition-colors">소개</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-gray-900 transition-colors">블로그</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-gray-900 transition-colors">채용</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-gray-900 transition-colors">연락처</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-gray-900 font-semibold mb-4">리소스</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-600 hover:text-gray-900 transition-colors">독서 가이드</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-gray-900 transition-colors">연구 자료</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-gray-900 transition-colors">커뮤니티</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-gray-900 transition-colors">지원</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-gray-900 font-semibold mb-4">법적 고지</h3>
              <ul className="space-y-2">
                <li><Link href="/legal/terms" className="text-gray-600 hover:text-gray-900 transition-colors">이용약관</Link></li>
                <li><Link href="/legal/privacy" className="text-gray-600 hover:text-gray-900 transition-colors">개인정보처리방침</Link></li>
                <li><Link href="/legal/cookies" className="text-gray-600 hover:text-gray-900 transition-colors">쿠키 정책</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 mb-4 md:mb-0">© 2023 habitus33. All rights reserved.</p>
            <div className="flex space-x-6">
              <Link href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </Link>
              <Link href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                <span className="sr-only">GitHub</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 