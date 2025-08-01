"use client";
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import WaveAnimation from './WaveAnimation';
import { AMFACards } from './AMFACards';
import InteractiveOnboardingGuide from './InteractiveOnboardingGuide';
import { 
  BookOpenIcon, 
  LightBulbIcon, 
  FireIcon, 
  CpuChipIcon,
  BoltIcon,
  SparklesIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function AMFADeepDive() {
  const router = useRouter();
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // 각 섹션에 대한 ref
  const introSectionRef = useRef<HTMLDivElement>(null);
  const cardsSectionRef = useRef<HTMLDivElement>(null);
  const detailSectionRef = useRef<HTMLDivElement>(null);

  // 부드러운 스크롤 함수
  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  // AMFA 여정 시작하기 버튼 클릭 (DIVE 버튼)
  const handleStartJourney = () => {
    setShowOnboarding(true);
  };

  // 카드 선택 핸들러
  const handleStepSelect = (stepId: string) => {
    setSelectedStep(stepId);
    setTimeout(() => scrollToSection(detailSectionRef), 100);
  };

  // 온보딩 가이드 완료 핸들러
  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    scrollToSection(cardsSectionRef);
  };

  // 각 단계별 시작하기 버튼 클릭 핸들러
  const handleStepStart = (title: string) => {
    console.log(`${title} 시작하기 버튼 클릭`);
    // 모든 단계에서 내 서재로 이동
    router.push('/books');
  };

  // 각 단계별 상세 정보 - 학습 가속 중심
  const stepDetails = {
    'atomic': {
      title: 'Atomic Memo',
      subtitle: '3분 집중으로 핵심 추출',
      icon: BookOpenIcon,
      color: 'text-cyan-400',
      description: '과학적으로 검증된 3분 집중 독서로 학습 가속의 시작',
      detailedDescription: '3분이라는 과학적으로 검증된 시간으로 최적의 집중력을 유지하며 핵심 내용을 빠르게 추출합니다. 이 작은 습관이 학습 시간을 25% 단축하는 여정의 시작입니다.',
      features: [
        '3분 과학적 집중 시간',
        '핵심 내용 빠른 추출',
        '집중력 최적화 시스템',
        '학습 효율성 극대화'
      ],
      benefits: [
        '학습 시간 25% 단축',
        '집중력 향상으로 깊이 있는 이해',
        '부담 없는 학습 시작',
        '지속 가능한 학습 습관 형성'
      ]
    },
    'memo': {
      title: 'Memo Evolve',
      subtitle: '1줄 메모를 진화된 지식으로',
      icon: LightBulbIcon,
      color: 'text-blue-400',
      description: '4단계 진화로 깊이 있는 지식으로 발전',
      detailedDescription: '단순한 1줄 메모를 4단계 진화 과정을 통해 깊이 있는 지식으로 발전시킵니다. 생각추가, 메모진화, 지식연결, 복습 카드를 통해 기억 보존률을 4배 향상시킵니다.',
      features: [
        '4단계 체계적 진화',
        '생각추가로 깊이 있는 사고',
        '지식연결로 네트워크 구축',
        '복습 카드로 장기 기억 형성'
      ],
      benefits: [
        '기억 보존률 4배 향상',
        '깊이 있는 개념 이해',
        '지식 연결성 5배 향상',
        '체계적인 학습 구조화'
      ]
    },
    'furnace': {
      title: 'Furnace Knowledge',
      subtitle: '지식의 용광로를 통한 재구성',
      icon: FireIcon,
      color: 'text-purple-400',
      description: '여러 메모를 통합된 지식 체계로 재구성',
      detailedDescription: '여러 개의 1줄 메모를 하나의 완성된 지식 체계로 통합합니다. 지식 카트에 담고 논리적 순서로 정렬하여, 분산된 지식을 통합된 학습 체계로 재구성합니다.',
      features: [
        '지식 카트로 수집',
        '논리적 순서 정렬',
        '통합된 지식 체계 구축',
        '학습 가속을 위한 구조화'
      ],
      benefits: [
        '지식 연결성 5배 향상',
        '체계적인 학습 구조',
        '복잡한 개념의 명확한 이해',
        '효율적인 지식 관리'
      ]
    },
    'ai': {
      title: 'AI Link',
      subtitle: '개인화된 AI 파트너',
      icon: CpuChipIcon,
      color: 'text-violet-400',
      description: '프롬프트 없이 AI와 소통하는 개인화된 학습 파트너',
      detailedDescription: '온톨로지 구조화를 통해 AI가 당신의 맥락을 완벽하게 이해하게 만들고, 프롬프트 없이도 개인화된 학습 가이드를 제공합니다. 복잡한 설명 없이도 AI가 당신의 학습 맥락을 파악합니다.',
      features: [
        '온톨로지 구조화',
        '프롬프트 없는 소통',
        '개인화된 학습 가이드',
        '학습 가속의 핵심 도구'
      ],
      benefits: [
        'AI에게 매번 설명할 필요 없음',
        '개인화된 학습 추천',
        '효율적인 학습 가이드',
        '지속적인 학습 가속'
      ]
    }
  };

  // 온보딩 가이드가 활성화된 경우
  if (showOnboarding) {
    return (
      <InteractiveOnboardingGuide 
        onComplete={handleOnboardingComplete}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-200">
      {/* 1. 인트로 섹션 - 웨이브 애니메이션 */}
      <section ref={introSectionRef} className="min-h-screen relative">
        <WaveAnimation 
          className="min-h-screen" 
          onStartJourney={handleStartJourney}
        />
      </section>

      {/* 2. AMFA 카드 섹션 */}
      <section ref={cardsSectionRef} className="min-h-screen bg-gray-900 relative">
        <div className="container mx-auto px-6 py-16">
          {/* 섹션 헤더 */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-cyan-400 mb-6">
              학습 가속을 위한 AMFA 4단계
            </h2>
            <p className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-8">
              과학적으로 검증된 방법으로 학습 시간을 25% 단축하고 기억 보존률을 4배 향상시키는 여정을 시작하세요
            </p>
            
            {/* 진행 표시 */}
            <div className="flex items-center justify-center space-x-2">
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
              <span className="text-sm text-purple-400 font-medium tracking-wider">
                3분 집중 → 메모 진화 → 지식 통합 → AI 파트너
              </span>
              <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
            </div>
          </div>

          {/* AMFA Cards */}
          <AMFACards 
            className="mb-16"
            onStepSelect={handleStepSelect}
          />

          {/* 추가 정보 섹션 */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-2xl p-8 backdrop-blur-sm border border-gray-600">
              <h3 className="text-2xl font-bold text-cyan-400 mb-6">
                왜 AMFA일까요?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-gray-300">
                <div className="space-y-3">
                  <div className="flex justify-center">
                    <BoltIcon className="h-12 w-12 text-yellow-400" />
                  </div>
                  <h4 className="font-semibold text-cyan-400 text-lg">학습 시간 25% 단축</h4>
                  <p className="text-base">과학적으로 검증된 3분 집중으로 효율적인 학습을 시작하세요</p>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-center">
                    <SparklesIcon className="h-12 w-12 text-green-400" />
                  </div>
                  <h4 className="font-semibold text-purple-400 text-lg">기억 보존률 4배 향상</h4>
                  <p className="text-base">인지과학 기반의 체계적 방법으로 장기 기억을 형성합니다</p>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-center">
                    <CheckCircleIcon className="h-12 w-12 text-blue-400" />
                  </div>
                  <h4 className="font-semibold text-blue-400 text-lg">지식 연결성 5배 향상</h4>
                  <p className="text-base">체계적인 지식 구조화로 깊이 있는 이해를 달성합니다</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 선택된 카드 상세 섹션 */}
      {selectedStep && (
        <section ref={detailSectionRef} className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 relative">
          <div className="container mx-auto px-6 py-16">
            {(() => {
              const details = stepDetails[selectedStep as keyof typeof stepDetails];
              if (!details) return null;
              
              return (
                <div className="max-w-4xl mx-auto">
                  {/* 뒤로 가기 버튼 */}
                  <button 
                    onClick={() => scrollToSection(cardsSectionRef)}
                    className="mb-8 flex items-center space-x-2 text-gray-400 hover:text-cyan-400 transition-colors"
                  >
                    <span>←</span>
                    <span>다른 단계도 둘러보기</span>
                  </button>

                  {/* 상세 헤더 */}
                  <div className="text-center mb-12">
                    <div className="flex justify-center mb-4">
                      <details.icon className={`h-16 w-16 ${details.color}`} />
                    </div>
                    <h2 className={`text-4xl md:text-5xl font-bold ${details.color} mb-4`}>
                      {details.title}
                    </h2>
                    <h3 className="text-2xl text-gray-300 mb-6">{details.subtitle}</h3>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
                      {details.description}
                    </p>
                  </div>

                  {/* 상세 내용 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* 주요 기능 */}
                    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                      <h4 className={`text-xl font-bold ${details.color} mb-4`}>이런 것들을 경험해요</h4>
                      <ul className="space-y-3">
                        {details.features.map((feature, index) => (
                          <li key={index} className="flex items-start space-x-3">
                            <span className={`${details.color} mt-1`}>•</span>
                            <span className="text-gray-300">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* 기대 효과 */}
                    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                      <h4 className={`text-xl font-bold ${details.color} mb-4`}>이런 변화가 생겨요</h4>
                      <ul className="space-y-3">
                        {details.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-start space-x-3">
                            <span className={`${details.color} mt-1`}>✓</span>
                            <span className="text-gray-300">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="text-center mt-12">
                    <button 
                      onClick={() => handleStepStart(details.title)}
                      className={`
                        px-8 py-4 rounded-xl font-bold text-lg
                        bg-gradient-to-r from-cyan-500 to-purple-500
                        text-white transition-all duration-300
                        hover:shadow-lg hover:shadow-cyan-500/25
                        transform hover:scale-105
                        border border-cyan-400/30
                      `}>
                      {details.title} 시작하기
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </section>
      )}
    </div>
  );
} 