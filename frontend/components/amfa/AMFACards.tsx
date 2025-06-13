"use client";

import React, { useState, useRef, useEffect } from 'react';
import { amfaTheme } from './theme';
import { 
  BookOpenIcon, 
  LightBulbIcon, 
  FireIcon, 
  CpuChipIcon 
} from '@heroicons/react/24/outline';

interface AMFAStep {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  detailedDescription: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgGradient: string;
  features: string[];
  benefits: string[];
}

interface AMFACardsProps {
  className?: string;
  onStepSelect?: (stepId: string) => void;
}

// AMFA 4단계 데이터 - 브랜드 가이드라인 적용
const steps: AMFAStep[] = [
  {
    id: 'atomic',
    title: 'Atomic Reading',
    subtitle: 'The Drop Moment',
    description: '물 한방울이 만드는 첫 번째 기적',
    detailedDescription: '고요한 지식의 바다에 떨어지는 첫 번째 물방울. 3분 읽고 1줄 메모로 작지만 완벽한 원형의 파문이 시작됩니다.',
    icon: BookOpenIcon,
    color: 'from-cyan-400 to-blue-500',
    bgGradient: 'from-cyan-50 to-blue-50',
    features: [
      '3분씩만 투자하면 충분',
      '작게 나눠 읽기',
      '매번 작은 성취감',
      '부담 없는 읽기'
    ],
    benefits: [
      '읽기가 쉬워지는 경험',
      '나만의 독서 리듬 발견',
      '자연스런 몰입',
      '"나도 할 수 있다" 자신감'
    ]
  },
  {
    id: 'memo',
    title: 'Memo Evolve',
    subtitle: 'The First Ripple',
    description: '생각이 바다로 퍼져나가는 여행',
    detailedDescription: '작은 파문이 동심원을 그리며 지식의 바다로 확산되는 과정. 5단계 질문을 통해 개인의 경험과 만나며 새로운 섬들을 발견합니다.',
    icon: LightBulbIcon,
    color: 'from-blue-400 to-purple-500',
    bgGradient: 'from-blue-50 to-purple-50',
    features: [
      '지식이 점점 더 불어남',
      '가속화된 지식 축적',
      '생각과 보태져 기억이 강화됨',
      '지식의 중심에 다가선 느낌'
    ],
    benefits: [
      '읽은 내용이 오래 기억됨',
      '내 방식으로 지식 연결',
      '새로운 아이디어 발견',
      '더 넓은 이해의 폭'
    ]
  },
  {
    id: 'furnace',
    title: 'Furnace Knowledge',
    subtitle: 'The Deep Current',
    description: '심해 속 지식의 용광로에서 단련되다',
    detailedDescription: '표면의 파도를 넘어 깊은 심해 해류로 잠수하는 여정. 압력과 어둠 속에서 지식이 단단한 보석으로 변화합니다.',
    icon: FireIcon,
    color: 'from-purple-400 to-pink-500',
    bgGradient: 'from-purple-50 to-pink-50',
    features: [
      '여러 책의 내용이 연결됨',
      '숨겨진 패턴 자동 발견',
      '나만의 관점과 요점 생성',
      '지혜로 축적되는 경험'
    ],
    benefits: [
      '창의적 사고력 개발',
      '복잡한 문제 해결 능력',
      '숲을 보는 관점 형성',
      '남다른 지식체계 확립'
    ]
  },
  {
    id: 'ai',
    title: 'AI Link',
    subtitle: 'The Infinite Wave',
    description: '무한한 지식 바다에서의 자유로운 항해',
    detailedDescription: '개인의 한계를 넘어 광활한 지식 대양으로의 모험. 예상치 못한 해류를 타고 새로운 대륙을 발견하는 기쁨을 경험합니다.',
    icon: CpuChipIcon,
    color: 'from-pink-400 to-violet-500',
    bgGradient: 'from-pink-50 to-violet-50',
    features: [
      '나에게 맞는 책/자료 추천',
      '맞춤형 학습플랜 가이드',
      '학습 패턴 지능형 분석',
      '맥락축적에 따른 확장성'
    ],
    benefits: [
      '나만을 위한 지적 성장',
      '나에게 맞는 학습 방법',
      '내 미래에 맞는 학습',
      '점점 더 정교한 AI코칭'
    ]
  }
];

export function AMFACards({ className = '', onStepSelect }: AMFACardsProps) {
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [hoveredStep, setHoveredStep] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleStepClick = (stepId: string) => {
    setSelectedStep(stepId);
    onStepSelect?.(stepId);
  };

  const handleMouseEnter = (stepId: string) => {
    setHoveredStep(stepId);
  };

  const handleMouseLeave = () => {
    setHoveredStep(null);
  };

  if (!isClient) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 ${className}`}>
        {steps.map((step) => (
          <div key={step.id} className="bg-gray-800 rounded-xl p-6 h-80">
            <div className="text-4xl mb-4">
              <step.icon className={`h-12 w-12 ${step.color}`} />
            </div>
            <h3 className="text-xl font-bold text-cyan-400 mb-2">{step.title}</h3>
            <p className="text-gray-300 text-sm">{step.description}</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* AMFA 카드 그리드 - 4개 균등 배치 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {steps.map((step, index) => {
          const isSelected = selectedStep === step.id;
          const isHovered = hoveredStep === step.id;
          const isActive = isSelected || isHovered;

          return (
            <div
              key={step.id}
              className={`
                relative group cursor-pointer
                transform transition-all duration-300 ease-out
                ${isActive ? 'scale-105 z-10' : 'scale-100 z-0'}
              `}
              onClick={() => handleStepClick(step.id)}
              onMouseEnter={() => handleMouseEnter(step.id)}
              onMouseLeave={handleMouseLeave}
            >
              {/* 카드 배경 - 고정 크기 */}
              <div
                className={`
                  relative overflow-hidden rounded-xl h-80
                  bg-gradient-to-br from-gray-800 to-gray-900
                  border-2 transition-all duration-300
                  ${isSelected 
                    ? 'border-cyan-400 shadow-xl shadow-cyan-500/30' 
                    : isHovered 
                      ? 'border-purple-400 shadow-lg shadow-purple-500/20' 
                      : 'border-gray-700'
                  }
                `}
              >
                {/* 선택된 카드 글로우 효과 */}
                {isSelected && (
                  <div
                    className={`
                      absolute inset-0 opacity-20
                      bg-gradient-to-br ${step.bgGradient}
                      animate-pulse
                    `}
                  />
                )}

                {/* 호버 효과 */}
                {isHovered && !isSelected && (
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10" />
                )}

                {/* 카드 내용 */}
                <div className="relative z-10 p-6 h-full flex flex-col">
                  {/* 헤더 - 아이콘과 단계 번호 */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-5xl transform transition-transform duration-300 group-hover:scale-110">
                      <step.icon className={`h-8 w-8 ${step.color}`} />
                    </div>
                    {/* 단계 번호 원형 표시 */}
                    <div className={`
                      w-8 h-8 rounded-full border-2 transition-all duration-300 flex items-center justify-center
                      ${isSelected 
                        ? 'border-cyan-400 bg-cyan-400 text-gray-900' 
                        : 'border-gray-500 bg-transparent text-gray-400'
                      }
                    `}>
                      <span className="text-sm font-bold">
                        {index + 1}
                      </span>
                    </div>
                  </div>

                  {/* 제목과 부제목 */}
                  <div className="mb-4">
                    <h3 className={`text-xl font-bold ${step.color} mb-2 transition-colors duration-300`}>
                      {step.title}
                    </h3>
                    <p className="text-gray-400 text-sm font-medium mb-3">
                      {step.subtitle}
                    </p>
                  </div>

                  {/* 설명 */}
                  <p className="text-gray-300 text-sm leading-relaxed flex-grow">
                    {step.description}
                  </p>

                  {/* 하단 액션 영역 */}
                  <div className="mt-6 pt-4 border-t border-gray-700">
                    <div className={`
                      text-center py-2 px-4 rounded-lg font-medium text-sm
                      transition-all duration-300
                      ${isSelected 
                        ? `bg-gradient-to-r ${step.bgGradient} text-white` 
                        : 'bg-gray-700 text-gray-300 group-hover:bg-gray-600'
                      }
                    `}>
                      {isSelected ? '선택됨' : '클릭해서 자세히 보기'}
                    </div>
                  </div>
                </div>
              </div>

              {/* 연결선 (다음 단계로) */}
              {index < steps.length - 1 && (
                <div className="hidden xl:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-20">
                  <div className="w-6 h-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 opacity-60" />
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 진행 표시기 */}
      <div className="mt-12 flex justify-center">
        <div className="flex items-center space-x-4">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div
                className={`
                  relative w-8 h-8 rounded-full transition-all duration-300 cursor-pointer flex items-center justify-center
                  ${selectedStep === step.id 
                    ? 'bg-cyan-400 scale-125 shadow-lg shadow-cyan-400/50 text-gray-900' 
                    : hoveredStep === step.id 
                      ? 'bg-purple-400 scale-110 text-white' 
                      : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                  }
                `}
                onClick={() => handleStepClick(step.id)}
              >
                <span className="text-xs font-bold">{index + 1}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={`
                  w-8 h-0.5 transition-colors duration-300
                  ${selectedStep === step.id || selectedStep === steps[index + 1]?.id
                    ? 'bg-cyan-400' 
                    : 'bg-gray-600'
                  }
                `} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* 선택된 카드 안내 메시지 - 브랜드 톤앤보이스 적용 */}
      {selectedStep && (
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            <span className="text-cyan-400 font-medium">
              {steps.find(step => step.id === selectedStep)?.subtitle}
            </span>
            에 대해 더 자세히 알아보세요
          </p>
          <p className="text-gray-500 text-xs mt-1">
            아래로 스크롤하면 상세한 내용을 확인할 수 있습니다
          </p>
          <div className="mt-3 animate-bounce">
            <span className="text-cyan-400 text-lg">↓</span>
          </div>
        </div>
      )}
    </div>
  );
}

// 개별 AMFA 카드 컴포넌트 (재사용 가능)
export function AMFACard({ 
  step, 
  isSelected = false, 
  isHovered = false,
  onClick,
  onMouseEnter,
  onMouseLeave 
}: {
  step: AMFAStep;
  isSelected?: boolean;
  isHovered?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  const isActive = isSelected || isHovered;

  return (
    <div
      className={`
        relative group cursor-pointer
        transform transition-all duration-500 ease-out
        ${isActive ? 'scale-105 z-10' : 'scale-100 z-0'}
      `}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div
        className={`
          relative overflow-hidden rounded-xl
          bg-gradient-to-br from-gray-800 to-gray-900
          border border-gray-700
          transition-all duration-500
          ${isActive ? 'border-cyan-500 shadow-lg shadow-cyan-500/20' : ''}
          h-64 p-6
        `}
      >
        {/* 글로우 효과 */}
        {isActive && (
          <div
            className={`
              absolute inset-0 opacity-20
              bg-gradient-to-br ${step.bgGradient}
              animate-pulse
            `}
          />
        )}

        {/* 카드 내용 */}
        <div className="relative z-10 h-full flex flex-col">
          <div className="text-4xl mb-4 transform transition-transform duration-300 group-hover:scale-110">
            <step.icon className={`h-8 w-8 ${step.color}`} />
          </div>
          <h3 className={`text-xl font-bold ${step.color} mb-2`}>
            {step.title}
          </h3>
          <p className="text-gray-400 text-sm font-medium mb-3">
            {step.subtitle}
          </p>
          <p className="text-gray-300 text-sm leading-relaxed flex-grow">
            {step.description}
          </p>
        </div>

        {/* 호버 효과 */}
        {isHovered && (
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 pointer-events-none" />
        )}
      </div>
    </div>
  );
} 