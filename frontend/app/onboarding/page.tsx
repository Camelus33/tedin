"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import useAuth from '@/hooks/useAuth';

// Import existing components
import ArticleToCapsuleAnimation from '@/components/onboarding/ArticleToCapsuleAnimation';
import { AMFACards } from '@/components/amfa/AMFACards';

// Import icons
import { 
  UserIcon, 
  AcademicCapIcon, 
  BeakerIcon, 
  BriefcaseIcon,
  SparklesIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  PlayIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

// Types
type UserPersona = 'learner' | 'researcher' | 'professional' | null;

interface OnboardingState {
  currentStep: number;
  selectedPersona: UserPersona;
  completedSteps: number[];
  personalizationSettings: {
    preferredLanguage: string;
    notificationFrequency: string;
    learningGoals: string[];
  };
  demoProgress: {
    hasTriedAMFA: boolean;
    hasCreatedAILink: boolean;
  };
}

// Persona configurations
const PERSONAS = {
  learner: {
    id: 'learner',
    title: 'Your Personal AI Tutor',
    subtitle: '학습자 / 수험생',
    description: '프롬프트 없이 당신의 학습 스타일과 약점을 아는 개인 튜터',
    icon: AcademicCapIcon,
    color: 'from-blue-400 to-cyan-500',
    bgGradient: 'from-blue-50 to-cyan-50',
    sampleContent: {
      title: 'TOEFL Reading Practice',
      description: '영어 지문을 읽고 AI 튜터의 맞춤 조언을 받아보세요',
      content: 'The Industrial Revolution marked a major turning point in history...'
    }
  },
  researcher: {
    id: 'researcher',
    title: 'Your Research Co-Pilot',
    subtitle: '연구자',
    description: '연구 도메인과 방법론을 이해하는 지능형 연구 파트너',
    icon: BeakerIcon,
    color: 'from-purple-400 to-pink-500',
    bgGradient: 'from-purple-50 to-pink-50',
    sampleContent: {
      title: 'AI Research Paper Analysis',
      description: 'AI 논문을 분석하고 연구 방향 제안을 받아보세요',
      content: 'Large Language Models have shown remarkable capabilities...'
    }
  },
  professional: {
    id: 'professional',
    title: 'Your Intelligent Work Partner',
    subtitle: '직장인',
    description: '프로젝트와 업무 스타일을 아는 지능형 업무 파트너',
    icon: BriefcaseIcon,
    color: 'from-green-400 to-teal-500',
    bgGradient: 'from-green-50 to-teal-50',
    sampleContent: {
      title: 'Market Analysis Report',
      description: '시장 리포트를 분석하고 비즈니스 전략을 제안받아보세요',
      content: 'Q4 market trends show significant growth in AI adoption...'
    }
  }
};

// Constants
const TOTAL_STEPS = 6;

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [onboardingState, setOnboardingState] = useState<OnboardingState>({
    currentStep: 1,
    selectedPersona: null,
    completedSteps: [],
    personalizationSettings: {
      preferredLanguage: 'ko',
      notificationFrequency: 'daily',
      learningGoals: []
    },
    demoProgress: {
      hasTriedAMFA: false,
      hasCreatedAILink: false
    }
  });

  // 스텝 전환 시 화면 상단으로 스크롤 리셋
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [onboardingState.currentStep]);

  // Auto-advance to dashboard if user is already onboarded
  // TODO: Add isOnboarded field to user state or implement onboarding check
  // useEffect(() => {
  //   if (user?.isOnboarded) {
  //     router.push('/dashboard');
  //   }
  // }, [user, router]);

  // Step navigation functions
  const nextStep = () => {
    setOnboardingState(prev => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, TOTAL_STEPS),
      completedSteps: [...new Set([...prev.completedSteps, prev.currentStep])]
    }));
  };

  const prevStep = () => {
    setOnboardingState(prev => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 1)
    }));
  };

  const goToStep = (step: number) => {
    // 페르소나 미선택 상태에서는 2단계 이상 이동 금지
    setOnboardingState(prev => {
      if (step > 1 && !prev.selectedPersona) {
        return prev;
      }
      return { ...prev, currentStep: step };
    });
  };

  // Persona selection handler
  const selectPersona = (persona: UserPersona) => {
    setOnboardingState(prev => ({
      ...prev,
      selectedPersona: persona
    }));
    setTimeout(() => nextStep(), 500);
  };

  // Complete onboarding
  const completeOnboarding = async () => {
    try {
      // TODO: API call to mark user as onboarded
      // await updateUserOnboardingStatus(true);
      
      // 모든 사용자가 대시보드로 이동
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    }
  };

  // Progress calculation
  const progressPercentage = (onboardingState.currentStep / TOTAL_STEPS) * 100;

  // Step components
  const renderStep = () => {
    switch (onboardingState.currentStep) {
      case 1:
        return <WelcomeStep onPersonaSelect={selectPersona} />;
      case 2:
        return <PersonaValueStep persona={onboardingState.selectedPersona} onNext={nextStep} />;
      case 3:
        return <AMFAIntroStep onNext={nextStep} />;
      case 4:
        return <InteractiveDemoStep 
          persona={onboardingState.selectedPersona} 
          onNext={nextStep}
          onDemoComplete={(progress) => setOnboardingState(prev => ({
            ...prev,
            demoProgress: { ...prev.demoProgress, ...progress }
          }))}
        />;
      case 5:
        return <BeforeAfterComparisonStep persona={onboardingState.selectedPersona} onNext={nextStep} />;
      case 6:
        return <AILinkUsageStep persona={onboardingState.selectedPersona} onNext={completeOnboarding} />;
      default:
        return <WelcomeStep onPersonaSelect={selectPersona} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full z-50">
        <div className="h-1 bg-gray-700">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-400 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Navigation Header */}
      <header className="fixed top-1 left-0 right-0 z-40 p-4">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          {/* Step indicator */}
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <span>단계 {onboardingState.currentStep}</span>
            <span>/</span>
            <span>{TOTAL_STEPS}</span>
          </div>

          {/* Skip button */}
          {onboardingState.currentStep < TOTAL_STEPS && (
            <button
              onClick={() => goToStep(TOTAL_STEPS)}
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              건너뛰기
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 pb-8">
        <div className="max-w-6xl mx-auto px-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={onboardingState.currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Navigation Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          {/* Back button */}
          <button
            onClick={prevStep}
            disabled={onboardingState.currentStep === 1}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-lg transition-all
              ${onboardingState.currentStep === 1
                ? 'text-gray-500 cursor-not-allowed'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }
            `}
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>이전</span>
          </button>

          {/* Step dots */}
          <div className="flex items-center space-x-2">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => {
              const step = i + 1;
              const isCompleted = onboardingState.completedSteps.includes(step);
              const isCurrent = onboardingState.currentStep === step;
              
              return (
                <button
                  key={step}
                  onClick={() => goToStep(step)}
                  className={`
                    w-3 h-3 rounded-full transition-all
                    ${isCurrent 
                      ? 'bg-cyan-400 scale-125' 
                      : isCompleted 
                        ? 'bg-purple-400' 
                        : 'bg-gray-600'
                    }
                  `}
                />
              );
            })}
          </div>

          {/* Next/Complete button */}
          <div className="w-24 flex justify-end">
            {onboardingState.currentStep < TOTAL_STEPS ? (
              <button
                onClick={
                  onboardingState.currentStep === 1 && !onboardingState.selectedPersona
                    ? undefined
                    : nextStep
                }
                disabled={onboardingState.currentStep === 1 && !onboardingState.selectedPersona}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  onboardingState.currentStep === 1 && !onboardingState.selectedPersona
                    ? 'bg-gray-600 cursor-not-allowed text-gray-300'
                    : 'bg-cyan-500 hover:bg-cyan-600 text-white'
                }`}
              >
                <span>다음</span>
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={completeOnboarding}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg transition-all"
              >
                <span>시작하기</span>
                <PlayIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

// Step 1: Welcome and Persona Selection
function WelcomeStep({ onPersonaSelect }: { onPersonaSelect: (persona: UserPersona) => void }) {
  return (
    <div className="text-center py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            Thought Pattern Mapping
          </span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-8">
          당신의 메모 속 반복되는 생각의 패턴을 분석해,
          과거 실수를 줄이고 더 현명한 결정을 돕습니다.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-semibold mb-8 text-gray-200">
          당신은 어떤 분야에서 AI의 도움이 필요하신가요?
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {Object.values(PERSONAS).map((persona, index) => (
            <motion.button
              key={persona.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              onClick={() => onPersonaSelect(persona.id as UserPersona)}
              className={`
                group p-6 rounded-xl border-2 border-gray-700 
                hover:border-cyan-400 transition-all duration-300
                bg-gray-800/50 hover:bg-gray-700/50
                transform hover:scale-105
              `}
            >
              <div className="mb-4">
                <persona.icon className={`h-12 w-12 mx-auto bg-gradient-to-r ${persona.color} bg-clip-text text-transparent`} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {persona.subtitle}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {persona.description}
              </p>
              <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-cyan-400 text-sm font-medium">
                  선택하기 →
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// Step 2: Persona-specific Value Proposition
function PersonaValueStep({ persona, onNext }: { persona: UserPersona; onNext: () => void }) {
  if (!persona) return null;
  
  const personaConfig = PERSONAS[persona];
  
  return (
    <div className="text-center py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <div className="mb-6">
          <personaConfig.icon className={`h-20 w-20 mx-auto bg-gradient-to-r ${personaConfig.color} bg-clip-text text-transparent`} />
        </div>
        <h1 className="text-3xl md:text-5xl font-bold mb-4">
          <span className={`bg-gradient-to-r ${personaConfig.color} bg-clip-text text-transparent`}>
            {personaConfig.title}
          </span>
        </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            {personaConfig.description}
          </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-800/50 rounded-2xl p-8 max-w-4xl mx-auto mb-12"
      >
        <h2 className="text-2xl font-semibold mb-6 text-white">
          이런 경험을 하게 됩니다
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold bg-gradient-to-r ${personaConfig.color} bg-clip-text text-transparent`}>
              Before: 기존 AI 사용
            </h3>
            <div className="space-y-2 text-gray-400">
              <p>• 매번 긴 프롬프트 작성</p>
              <p>• 맥락 설명에 시간 소모</p>
              <p>• 일반적인 답변만 제공</p>
              <p>• 개인화된 조언 부족</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold bg-gradient-to-r ${personaConfig.color} bg-clip-text text-transparent`}>
              After: Habitus33 AI-Link
            </h3>
            <div className="space-y-2 text-gray-300">
              <p>• 생각/학습 패턴 기반 맞춤 조언</p>
              <p>• 당신의 맥락과 습관을 반영</p>
              <p>• 개인화된 전문가 수준 조언</p>
              <p>• 학습/연구/업무 스타일 반영</p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        onClick={onNext}
        className={`
          px-8 py-4 rounded-xl font-semibold text-white
          bg-gradient-to-r ${personaConfig.color}
          hover:scale-105 transition-transform
          shadow-lg hover:shadow-xl
        `}
      >
        AMFA 프로세스 체험해보기
      </motion.button>
    </div>
  );
}

// Step 3: AMFA Introduction
function AMFAIntroStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-5xl font-bold mb-6">
          <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            AMFA 프로세스
          </span>
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          4단계로 당신만의 지식 캡슐을 만드는 여정을 시작합니다
        </p>
      </div>

      <div className="mb-12">
        <AMFACards onStepSelect={() => {}} />
      </div>

      <div className="text-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onNext}
          className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all"
        >
          직접 체험해보기
        </motion.button>
      </div>
    </div>
  );
}

// Step 4: Interactive Demo
function InteractiveDemoStep({ 
  persona, 
  onNext, 
  onDemoComplete 
}: { 
  persona: UserPersona; 
  onNext: () => void;
  onDemoComplete: (progress: Partial<OnboardingState['demoProgress']>) => void;
}) {
  const [demoStep, setDemoStep] = useState(1);
  const [generatedContent, setGeneratedContent] = useState('');
  
  if (!persona) return null;
  
  const personaConfig = PERSONAS[persona];
  
  const handleDemoComplete = () => {
    onDemoComplete({ hasTriedAMFA: true, hasCreatedAILink: true });
    onNext();
  };
  
  return (
    <div className="py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">
          <span className={`bg-gradient-to-r ${personaConfig.color} bg-clip-text text-transparent`}>
            {personaConfig.sampleContent.title}
          </span>
        </h1>
        <p className="text-gray-300">
          {personaConfig.sampleContent.description}
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Demo content area */}
        <div className="bg-gray-800/50 rounded-2xl p-6 mb-8">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 text-white">샘플 콘텐츠</h3>
            <div className="bg-gray-700/50 rounded-lg p-4 text-gray-300">
              {personaConfig.sampleContent.content}
            </div>
          </div>
          
          {/* AMFA process simulation */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-cyan-400 rounded-full flex items-center justify-center text-gray-900 font-bold">
                1
              </div>
              <span className="text-white">Atomic Memo 생성 중...</span>
            </div>
            
            {demoStep >= 2 && (
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-purple-400 rounded-full flex items-center justify-center text-white font-bold">
                  2
                </div>
                <span className="text-white">Memo Evolution 진행 중...</span>
              </div>
            )}
            
            {demoStep >= 3 && (
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                  3
                </div>
                <span className="text-white">Focused Note 완성 중...</span>
              </div>
            )}
            
            {demoStep >= 4 && (
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-violet-400 rounded-full flex items-center justify-center text-white font-bold">
                  4
                </div>
                <span className="text-white">AI-Link 생성 완료!</span>
              </div>
            )}
          </div>
        </div>

        {/* Demo controls */}
        <div className="text-center">
          {demoStep < 4 ? (
            <button
              onClick={() => setDemoStep(prev => prev + 1)}
              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 rounded-lg font-semibold text-white transition-colors"
            >
              다음 단계 진행
            </button>
          ) : (
            <button
              onClick={handleDemoComplete}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all"
            >
              AI-Link 생성 완료! 다음으로
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Step 5: Before/After Comparison
function BeforeAfterComparisonStep({ persona, onNext }: { persona: UserPersona; onNext: () => void }) {
  const [showAfter, setShowAfter] = useState(false);
  
  if (!persona) return null;
  
  // 페르소나별 비교 예시 데이터
  const comparisonData = {
    learner: {
      question: "TOEFL Reading 점수를 향상시키고 싶어요",
      generalAI: {
        response: "영어 학습을 위해서는 다음과 같은 일반적인 방법들을 추천드립니다: 1) 매일 영어 기사 읽기, 2) 영어 드라마 시청, 3) 영어 회화 연습, 4) 단어장 암기...",
        issues: ["일반적인 조언", "개인 맥락 반영 없음", "프롬프트 재작성 필요", "구체적 목표 무시"]
      },
      aiLink: {
        response: "당신의 TOEFL 목표 점수 100점과 현재 Reading 섹션 약점을 고려할 때, 지난주 분석한 학습 패턴에서 보면 오후 2-4시가 집중력이 가장 높으니 이 시간에 Academic 지문 위주로 연습하세요. 특히 Inference 문제에서 자주 틀리는 패턴이 보이니...",
        benefits: ["개인 목표 반영", "학습 패턴 분석 기반", "프롬프트 불필요", "약점 맞춤 조언"]
      }
    },
    researcher: {
      question: "AI 연구 논문의 방법론을 분석하고 싶어요",
      generalAI: {
        response: "AI 논문 분석을 위해서는 다음 단계를 따르세요: 1) Abstract 읽기, 2) Introduction 검토, 3) Methodology 분석, 4) Results 확인, 5) Discussion 검토...",
        issues: ["일반적인 절차", "연구 분야 특성 무시", "개인 연구 맥락 부재", "표면적 분석"]
      },
      aiLink: {
        response: "당신이 진행 중인 멀티모달 AI 연구와 연관하여, 이 논문의 attention mechanism이 당신의 vision-language 모델에 적용 가능할 것 같습니다. 특히 3.2절의 cross-modal attention 방식은 당신이 지난달 언급했던 alignment 문제 해결에 도움이 될 수 있어요...",
        benefits: ["연구 분야 맞춤", "진행 중인 연구 연계", "구체적 적용 방안", "개인 연구 히스토리 반영"]
      }
    },
    professional: {
      question: "시장 분석 리포트를 요약해주세요",
      generalAI: {
        response: "시장 분석 리포트 요약 방법: 1) 핵심 지표 추출, 2) 트렌드 분석, 3) 경쟁사 현황 정리, 4) 기회 요인 식별, 5) 위험 요소 파악...",
        issues: ["일반적인 방법론", "업종별 특성 무시", "회사 상황 미반영", "실행 가능성 부족"]
      },
      aiLink: {
        response: "Q4 AI 도입 증가 트렌드가 당신 회사의 SaaS 전략에 직접적 영향을 미칠 것 같습니다. 특히 Enterprise 고객들의 AI 통합 요구가 30% 증가한 점을 고려하면, 다음 분기 로드맵에서 논의했던 AI 기능 우선순위를 재조정하는 것이 좋겠어요. 경쟁사 대비 6개월 앞서갈 기회입니다...",
        benefits: ["회사 상황 맞춤", "기존 전략 연계", "구체적 액션 플랜", "경쟁 우위 관점"]
      }
    }
  };
  
  const data = comparisonData[persona];
  const personaConfig = PERSONAS[persona];
  
  return (
    <div className="py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-6">
          <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            차이를 직접 확인하세요
          </span>
        </h1>
        <p className="text-xl text-gray-300">
          일반 AI와 AI-Link의 차이점을 비교해보세요
        </p>
        <div className="mt-4 p-3 bg-gray-800/30 rounded-lg inline-block">
          <p className="text-gray-400 text-sm">질문 예시:</p>
          <p className="text-white font-medium">"{data.question}"</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Before: General AI */}
          <div className="bg-gray-800/50 rounded-2xl p-6 border border-red-400/30">
            <h3 className="text-xl font-semibold mb-4 text-red-400">일반 AI 응답</h3>
            <div className="space-y-4 text-gray-300">
              <p className="text-sm bg-gray-700/50 p-4 rounded-lg leading-relaxed">
                "{data.generalAI.response}"
              </p>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-red-300 mb-2">한계점:</p>
                {data.generalAI.issues.map((issue, index) => (
                  <div key={index} className="flex items-center space-x-2 text-xs text-gray-400">
                    <span className="text-red-400">×</span>
                    <span>{issue}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* After: AI-Link */}
          <div className="bg-gray-800/50 rounded-2xl p-6 border border-cyan-400/50">
            <h3 className="text-xl font-semibold mb-4 text-cyan-400">
              {personaConfig.title} 응답
            </h3>
            <div className="space-y-4 text-gray-300">
              <p className="text-sm bg-cyan-900/20 p-4 rounded-lg leading-relaxed border border-cyan-500/20">
                "{data.aiLink.response}"
              </p>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-cyan-300 mb-2">강점:</p>
                {data.aiLink.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-2 text-xs text-gray-300">
                    <span className="text-cyan-400">✓</span>
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 추가 설명 */}
      <div className="max-w-4xl mx-auto mb-12">
        <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-2xl p-6 border border-cyan-400/30">
          <h3 className="text-lg font-semibold mb-4 text-center">
            <span className={`bg-gradient-to-r ${personaConfig.color} bg-clip-text text-transparent`}>
              {personaConfig.subtitle}를 위한 AI-Link의 차별점
            </span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold text-cyan-400 mb-2">맥락 이해</h4>
              <p className="text-gray-300 leading-relaxed">
                당신의 {persona === 'learner' ? '학습 목표와 진도' : persona === 'researcher' ? '연구 분야와 진행 상황' : '업무 환경과 프로젝트'}를 완벽히 기억하고 반영합니다.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-purple-400 mb-2">개인화 조언</h4>
              <p className="text-gray-300 leading-relaxed">
                일반적인 답변이 아닌, 당신만을 위한 구체적이고 실행 가능한 조언을 제공합니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={onNext}
          className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all"
        >
          개인화 설정하기
        </button>
      </div>
    </div>
  );
}

// Step 6: AI-Link Usage Guide (개선된 버전)
function AILinkUsageStep({ 
  persona, 
  onNext 
}: { 
  persona: UserPersona; 
  onNext: () => void;
}) {
  if (!persona) return null;
  
  return (
    <div className="py-16">
      {/* Zone 1: 제목 (간소화) */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-6">
          <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            AI-Link 사용법
          </span>
        </h1>
      </div>

      {/* Zone 2: 스크린샷 + 인터랙티브 (메인 콘텐츠) */}
      <div className="max-w-3xl mx-auto mb-12">
        <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50">
          {/* 스크린샷 이미지 + 개인정보 보호 뱃지 */}
          <div className="relative rounded-lg overflow-hidden mb-4 max-w-2xl mx-auto">
            <img 
              src="/images/how-it-works-ai-link.png" 
              alt="AI-Link 사용법 실제 화면"
              className="w-full h-auto hover:scale-105 transition-transform duration-300"
              style={{ maxHeight: '400px', objectFit: 'contain' }}
            />
            
            {/* 개인정보 보호 뱃지 */}
            <div className="absolute top-4 right-4 bg-gray-900/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-cyan-400/30">
              <div className="flex items-center space-x-2">
                <svg className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-xs text-white font-medium">당신이 선택한 것만 AI-Link에 포함됩니다</span>
              </div>
            </div>
          </div>
          
          {/* 간단한 설명 */}
          <div className="text-center">
            <p className="text-lg text-gray-300 mb-8">
              화면 하단의 <span className="text-cyan-400 font-semibold">"공유 링크 생성"</span> 버튼을 누르면<br />
              선택한 메모들로 AI-Link가 생성되어 다른 AI 서비스에서 바로 사용할 수 있습니다
            </p>
          </div>
        </div>
      </div>

      {/* CTA 버튼 */}
      <div className="text-center">
        <motion.button
          onClick={onNext}
          className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-12 py-4 rounded-xl text-lg font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          첫 메모 작성하고 AI-Link 만들기
        </motion.button>
      </div>
    </div>
  );
} 