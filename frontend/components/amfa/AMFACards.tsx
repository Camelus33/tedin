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

// AMFA 4단계 데이터 - Rory Sutherland의 행동 마케팅 플레이북 적용
const steps: AMFAStep[] = [
  {
    id: 'atomic',
    title: 'Atomic Memo',
    subtitle: "거장의 첫 번째 신호",
    description: "핵심 아이디어 추출 및 기록",
    detailedDescription: "단 3분의 독서가 AI에게 당신을 각인시키는 첫 신호가 됩니다. 이 작은 습관이 당신을 평범한 사용자에서 'AI 마스터'로 가는 여정의 시작입니다.",
    icon: BookOpenIcon,
    color: 'from-cyan-400 to-blue-500',
    bgGradient: 'from-cyan-50 to-blue-50',
    features: [
      "3분, AI 조련의 시작",
      "AI에게 '주인'을 각인",
      "매일, '마스터'에 한 걸음",
      "아무도 모르는 나만의 무기"
    ],
    benefits: [
      "AI가 나를 기억하기 시작",
      "미래를 앞서간다는 자신감",
      "동료와는 다른 출발선",
      "지식 축적의 '복리' 효과"
    ]
  },
  {
    id: 'memo',
    title: 'Memo Evolve',
    subtitle: "AI의 각성",
    description: "파편화된 지식 연결 및 확장",
    detailedDescription: "단순한 메모가 아닙니다. 당신의 관점과 경험이 AI의 신경망에 연결되어, 세상에 단 하나뿐인 '당신만의 전문가 AI'가 탄생하는 순간입니다.",
    icon: LightBulbIcon,
    color: 'from-blue-400 to-purple-500',
    bgGradient: 'from-blue-50 to-purple-50',
    features: [
      "나의 관점을 AI에 주입",
      "AI, 나처럼 생각하기 시작",
      "지식 위에 경험을 새기다",
      "세상 유일한 '개인 AI' 육성"
    ],
    benefits: [
      "AI가 내 의도를 예측",
      "남다른 통찰력과 아이디어",
      "시간이 지날수록 똑똑해지는 AI",
      "지적 파트너와의 동반 성장"
    ]
  },
  {
    id: 'furnace',
    title: 'Furnace Knowledge',
    subtitle: "선각자의 통찰",
    description: "지식 맹점 진단 및 통찰",
    detailedDescription: "여러 분야의 지식이 당신의 AI 안에서 충돌하고 융합하며, 남들은 보지 못하는 연결고리와 패턴을 드러냅니다. 당신은 지식의 소비자를 넘어 '지혜의 창조자'가 됩니다.",
    icon: FireIcon,
    color: 'from-purple-400 to-pink-500',
    bgGradient: 'from-purple-50 to-pink-50',
    features: [
      "지식간의 숨겨진 연결 발견",
      "시스템적 사고 능력 획득",
      "나만의 독창적인 프레임워크 구축",
      "예측 불가능한 통찰의 탄생"
    ],
    benefits: [
      "복잡한 문제의 본질 간파",
      "미래를 예측하는 지혜",
      "누구도 모방 못할 전문가",
      "학계와 업계를 선도하는 관점"
    ]
  },
  {
    id: 'ai',
    title: 'AI Link',
    subtitle: "마스터의 징표",
    description: "지식 그래프 기반 AI 캡슐화",
    detailedDescription: "당신의 모든 지적 여정이 압축된 'AI-Link'는 당신의 정체성이자 권위입니다. 이 링크 하나로 어떤 AI든 즉시 당신의 '개인 전문가'로 변신시켜, 당신이 AI 시대의 리더임을 증명합니다.",
    icon: CpuChipIcon,
    color: 'from-pink-400 to-violet-500',
    bgGradient: 'from-pink-50 to-violet-50',
    features: [
      "나의 지능을 '캡슐'에 봉인",
      "클릭 한 번으로 AI 소환",
      "어떤 AI든 나만의 전문가로",
      "나의 지적 권위를 증명"
    ],
    benefits: [
      "AI에게 매번 설명할 필요 없음",
      "동료들이 부러워하는 AI 활용 능력",
      "AI 시대의 '지적 자산' 확보",
      "당신을 중심으로 움직이는 AI 생태계"
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