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

// AMFA 4단계 데이터 - 학습 가속 중심의 메시지
const steps: AMFAStep[] = [
  {
    id: 'atomic',
    title: 'Atomic Memo',
    subtitle: "3분 집중으로 핵심 추출",
    description: "과학적으로 검증된 3분 집중 독서로 학습 가속의 시작",
    detailedDescription: "단 3분의 집중 독서가 학습 가속의 첫 단계입니다. 과학적으로 검증된 3분 타이머로 최적의 집중력을 유지하며, 핵심 내용을 빠르게 추출합니다. 이 작은 습관이 학습 시간을 25% 단축하는 여정의 시작입니다.",
    icon: BookOpenIcon,
    color: 'from-cyan-400 to-blue-500',
    bgGradient: 'from-cyan-50 to-blue-50',
    features: [
      "3분, 과학적 집중 시간",
      "핵심 내용 빠른 추출",
      "집중력 최적화 시스템",
      "학습 효율성 극대화"
    ],
    benefits: [
      "학습 시간 25% 단축",
      "집중력 향상으로 깊이 있는 이해",
      "부담 없는 학습 시작",
      "지속 가능한 학습 습관 형성"
    ]
  },
  {
    id: 'memo',
    title: 'Memo Evolve',
    subtitle: "1줄 메모를 진화된 지식으로",
    description: "단순한 메모를 4단계 진화로 깊이 있는 지식으로 발전",
    detailedDescription: "단순한 메모가 아닙니다. 4단계 진화 과정을 통해 1줄 메모를 깊이 있는 지식으로 발전시킵니다. 생각추가, 메모진화, 지식연결, 플래시카드를 통해 기억 보존률을 4배 향상시킵니다.",
    icon: LightBulbIcon,
    color: 'from-blue-400 to-purple-500',
    bgGradient: 'from-blue-50 to-purple-50',
    features: [
      "4단계 체계적 진화",
      "생각추가로 깊이 있는 사고",
      "지식연결로 네트워크 구축",
      "플래시카드로 장기 기억 형성"
    ],
    benefits: [
      "기억 보존률 4배 향상",
      "깊이 있는 개념 이해",
      "지식 연결성 5배 향상",
      "체계적인 학습 구조화"
    ]
  },
  {
    id: 'furnace',
    title: 'Furnace Knowledge',
    subtitle: "지식의 용광로를 통한 재구성",
    description: "여러 메모를 통합된 지식 체계로 재구성하여 학습 가속",
    detailedDescription: "여러 개의 1줄 메모를 하나의 완성된 지식 체계로 통합합니다. 지식 카트에 담고 논리적 순서로 정렬하여, 분산된 지식을 통합된 학습 체계로 재구성합니다. 이를 통해 지식 연결성을 5배 향상시킵니다.",
    icon: FireIcon,
    color: 'from-purple-400 to-pink-500',
    bgGradient: 'from-purple-50 to-pink-50',
    features: [
      "지식 카트로 수집",
      "논리적 순서 정렬",
      "통합된 지식 체계 구축",
      "학습 가속을 위한 구조화"
    ],
    benefits: [
      "지식 연결성 5배 향상",
      "체계적인 학습 구조",
      "복잡한 개념의 명확한 이해",
      "효율적인 지식 관리"
    ]
  },
  {
    id: 'ai',
    title: 'AI Link',
    subtitle: "개인화된 AI 파트너",
    description: "프롬프트 없이 AI와 소통하는 개인화된 학습 파트너",
    detailedDescription: "당신의 모든 지적 여정이 압축된 'AI-Link'는 학습 가속의 핵심입니다. 온톨로지 구조화를 통해 AI가 당신의 맥락을 완벽하게 이해하게 만들고, 프롬프트 없이도 개인화된 학습 가이드를 제공합니다.",
    icon: CpuChipIcon,
    color: 'from-pink-400 to-violet-500',
    bgGradient: 'from-pink-50 to-violet-50',
    features: [
      "온톨로지 구조화",
      "프롬프트 없는 소통",
      "개인화된 학습 가이드",
      "학습 가속의 핵심 도구"
    ],
    benefits: [
      "AI에게 매번 설명할 필요 없음",
      "개인화된 학습 추천",
      "효율적인 학습 가이드",
      "지속적인 학습 가속"
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