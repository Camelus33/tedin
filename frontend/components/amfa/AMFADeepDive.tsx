"use client";
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import WaveAnimation from './WaveAnimation';
import { AMFACards } from './AMFACards';
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

  // AMFA 여정 시작하기 버튼 클릭
  const handleStartJourney = () => {
    scrollToSection(cardsSectionRef);
  };

  // 카드 선택 핸들러
  const handleStepSelect = (stepId: string) => {
    setSelectedStep(stepId);
    setTimeout(() => scrollToSection(detailSectionRef), 100);
  };

  // 각 단계별 시작하기 버튼 클릭 핸들러
  const handleStepStart = (title: string) => {
    console.log(`${title} 시작하기 버튼 클릭`);
    // 모든 단계에서 내 서재로 이동
    router.push('/books');
  };

  const getStepDetails = (stepId: string) => {
    const details = {
      'atomic-reading': {
        title: 'Atomic Reading',
        subtitle: '3분 독서',
        icon: BookOpenIcon,
        color: 'text-cyan-400',
        description: '3분 11페이지로 시작하는 작은 독서 습관',
        features: [
          '3분만 투자하면 충분',
          '11페이지씩 작게 나누기',
          '매일 작은 성취감 경험',
          '부담 없이 시작 가능'
        ],
        benefits: [
          '독서가 어렵지 않다는 경험',
          '나만의 독서 리듬 발견',
          '집중력이 자연스럽게 향상',
          '"나도 할 수 있다" 자신감'
        ]
      },
      'memo-evolve': {
        title: 'Memo Evolve',
        subtitle: '메모 성장',
        icon: LightBulbIcon,
        color: 'text-purple-400',
        description: '단순한 기록이 나만의 지식으로 자라나는 과정',
        features: [
          '메모가 단계별로 발전',
          '내 생각과 책 내용 연결',
          '중요한 부분 자동 정리',
          '깨달음의 순간 포착'
        ],
        benefits: [
          '읽은 내용이 오래 기억됨',
          '내 방식으로 지식 정리',
          '새로운 아이디어 발견',
          '깊이 있는 이해 경험'
        ]
      },
      'furnace-knowledge': {
        title: 'Furnace Knowledge',
        subtitle: '지식 융합',
        icon: FireIcon,
        color: 'text-orange-400',
        description: '흩어진 지식들이 하나로 연결되어 새로운 통찰 탄생',
        features: [
          '여러 책의 내용이 연결됨',
          '숨겨진 패턴 자동 발견',
          '나만의 통찰 생성',
          '지혜로 축적되는 경험'
        ],
        benefits: [
          '창의적 사고력 개발',
          '복잡한 문제 해결 능력',
          '전체적인 관점 형성',
          '혁신적 아이디어 창출'
        ]
      },
      'ai-link': {
        title: 'AI Link',
        subtitle: 'AI 동반자',
        icon: CpuChipIcon,
        color: 'text-blue-400',
        description: 'AI와 함께 무한히 확장되는 학습 여정의 시작',
        features: [
          '나에게 맞는 책 추천',
          '개인 맞춤 학습 가이드',
          '학습 패턴 지능형 분석',
          '끝없이 확장되는 가능성'
        ],
        benefits: [
          '나만을 위한 성장 경험',
          '효율적인 학습 방법 발견',
          '미래를 준비하는 학습',
          '무한한 성장 가능성 실현'
        ]
      }
    };
    return details[stepId as keyof typeof details];
  };

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
              AMFA 4단계 여정
            </h2>
            <p className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-8">
              작게 시작해서 크게 성장하는 나만의 학습 여정을 시작하세요
            </p>
            
            {/* 진행 표시 */}
            <div className="flex items-center justify-center space-x-2">
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
              <span className="text-sm text-purple-400 font-medium tracking-wider">
                3분 독서 → 메모 성장 → 지식 융합 → AI 동반자
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
                  <h4 className="font-semibold text-cyan-400 text-lg">3분이면 충분</h4>
                  <p className="text-base">어떤 바쁜 일상에서도 찾을 수 있는 시간, 3분으로 시작하세요</p>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-center">
                    <SparklesIcon className="h-12 w-12 text-green-400" />
                  </div>
                  <h4 className="font-semibold text-purple-400 text-lg">나만의 속도로</h4>
                  <p className="text-base">다른 사람과 비교하지 않고, 나만의 리듬으로 성장해요</p>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-center">
                    <CheckCircleIcon className="h-12 w-12 text-blue-400" />
                  </div>
                  <h4 className="font-semibold text-blue-400 text-lg">작은 성공의 경험</h4>
                  <p className="text-base">매일 작은 성취를 쌓아가며 "나도 할 수 있다"는 자신감을 키워요</p>
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
              const details = getStepDetails(selectedStep);
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