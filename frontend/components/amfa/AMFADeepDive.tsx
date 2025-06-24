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

  // 각 단계별 상세 정보
  const stepDetails = {
    'atomic': {
      title: 'Atomic Memo',
      subtitle: 'The Drop Moment',
      icon: BookOpenIcon,
      color: 'text-cyan-400',
      description: '물 한방울이 만드는 첫 번째 기적',
      detailedDescription: '고요한 지식의 바다에 떨어지는 첫 번째 물방울. 1줄 메모로 작지만 완벽한 원형의 파문이 시작됩니다.',
      features: [
        '3분 집중 독서',
        '1줄 메모로 핵심 압축',
        '부담 없는 시작점',
        '매일 지속 가능한 루틴'
      ],
      benefits: [
        '완벽한 집중력 경험',
        '작은 성취감의 축적',
        '지속 가능한 학습 습관',
        '부담 없는 시작의 기쁨'
      ]
    },
    'memo': {
      title: 'Memo Evolve',
      subtitle: 'The First Ripple',
      icon: LightBulbIcon,
      color: 'text-blue-400',
      description: '생각이 젋은 지혜의 바다로 나아가는 여행',
      detailedDescription: '작은 파문이 동심원을 그리며 지식의 바다로 확산되는 과정. 5단계 질문을 통해 개인의 경험과 만나며 새로운 섬들을 발견합니다.',
      features: [
        '5단계 진화 질문',
        '개인 경험과의 연결',
        '생각의 자연스러운 확산',
        '통찰의 순간들 포착'
      ],
      benefits: [
        '깊이 있는 사고력 개발',
        '개인화된 지식 체계',
        '창의적 연결의 발견',
        '진정한 이해의 경험'
      ]
    },
    'furnace': {
      title: 'Furnace Knowledge',
      subtitle: 'The Deep Current',
      icon: FireIcon,
      color: 'text-purple-400',
      description: '생각을 연결하여 깊은 통찰로 단련되다',
      detailedDescription: '표면의 파도를 넘어 깊은 심해 해류로 잠수하는 여정. 압력과 어둠 속에서 지식이 단단한 보석으로 변화합니다.',
      features: [
        '지식의 체계적 융합',
        '개인만의 통찰 노트',
        '깊이 있는 내재화',
        '실용적 지혜로 변환'
      ],
      benefits: [
        '체화된 지식 획득',
        '실전 적용 가능한 통찰',
        '개인만의 지식 체계',
        '진짜 내 것이 된 학습'
      ]
    },
    'ai': {
      title: 'AI Link',
      subtitle: 'The Infinite Wave',
      icon: CpuChipIcon,
      color: 'text-violet-400',
      description: '자신만의 도메인 컨텍스트로 무한한 파도를 만드세요',
      detailedDescription: '개인의 한계를 넘어 광활한 지식 대양으로의 모험. 예상치 못한 해류를 타고 새로운 대륙을 발견하는 기쁨을 경험합니다.',
      features: [
        '고맥락 AI 답변',
        '예상치 못한 연결 발견',
        '무한한 지식 확장',
        '새로운 관점의 획득'
      ],
      benefits: [
        '개인 한계를 넘어선 학습',
        '창발적 통찰의 경험',
        '지식의 자유로운 항해',
        '경이로운 발견의 기쁨'
      ]
    }
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
              1줄 메모로 시작해 지식 캡슐을 완성하는 나만의 학습 여정을 시작하세요
            </p>
            
            {/* 진행 표시 */}
            <div className="flex items-center justify-center space-x-2">
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
              <span className="text-sm text-purple-400 font-medium tracking-wider">
                1줄 메모 → 메모 진화 → 맥락 완성 → 지식 캡슐
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
                  <h4 className="font-semibold text-cyan-400 text-lg">3분 1줄이면 충분</h4>
                  <p className="text-base">어떤 바쁜 일상에서도 찾을 수 있는 시간, 3분으로 시작하세요</p>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-center">
                    <SparklesIcon className="h-12 w-12 text-green-400" />
                  </div>
                  <h4 className="font-semibold text-purple-400 text-lg">나만의 속도로</h4>
                  <p className="text-base">다른 사람과 비교하지 않고, 나만의 파도를 만드세요</p>
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