"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppLogo from '@/components/common/AppLogo';
import EvidenceSection from '@/components/common/EvidenceSection';
import MemoryTest from '@/components/onboarding/MemoryTest';
import AttentionTest from '@/components/onboarding/AttentionTest';
import { apiClient } from '@/lib/apiClient';
import { ArrowPathIcon, ArrowRightIcon } from '@heroicons/react/20/solid';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

type Prefs = {
  memorySpanScore: number;
  attentionScore: number;
  recommendedZenGoLevels: string[];
  recommendedTsDuration: number;
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [goals, setGoals] = useState<string[]>([]);
  const [memorySpanScore, setMemorySpanScore] = useState<number>(-1);
  const [attentionScore, setAttentionScore] = useState<number>(-1);
  const [notificationTime, setNotificationTime] = useState<string>("");
  const [communityInterest, setCommunityInterest] = useState<boolean>(false);
  const [prefs, setPrefs] = useState<Prefs | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const goalOptions = [
    { id: "focus", label: "깊이 있는 집중" },
    { id: "memory", label: "오래 가는 기억" },
    { id: "exam", label: "효율적인 시험 준비" },
  ];

  const handleNext = async () => {
    if (step < 4) {
      setStep(step + 1);
    } else if (step === 4) {
      setLoading(true);
      try {
        const payload = { goals, memorySpanScore, attentionScore, notificationTime, communityInterest };
        const data = await apiClient.put('/users/settings', payload);

        setPrefs(data.preferences);
        setStep(5);
      } catch (e: any) {
        console.error(e);
        alert('설정 저장 중 오류가 발생했습니다: ' + (e.message || '알 수 없는 오류'));
      } finally {
        setLoading(false);
      }
    } else if (step === 5) {
      router.push("/dashboard");
    }
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const isNextDisabled = loading
    || (step === 1 && goals.length === 0)
    || (step === 2 && (memorySpanScore < 0 || memorySpanScore > 100))
    || (step === 3 && (attentionScore < 0 || attentionScore > 100));

  const progressPercent = Math.min((step / 5) * 100, 100);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-secondary p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 text-gray-800">
        <div className="mb-8">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-brand-primary transition-all duration-500 ease-out" style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="text-sm text-center text-gray-600 mt-2">{step} / 5단계</div>
        </div>

        {step === 1 && (
          <div className="mb-8 text-center">
            <AppLogo className="w-16 h-16 mx-auto mb-4 text-brand-primary" />
            <h1 className="text-3xl font-bold font-serif text-brand-primary mb-3">
              성장을 위한 첫걸음
            </h1>
            <p className="text-lg text-gray-700 mb-3">
              당신의 학습 리듬을 찾아, 꾸준함의 즐거움을 발견하세요.
            </p>
            <p className="text-base text-gray-700">
              꾸준한 <strong className="font-semibold text-brand-primary">33일</strong>, 의미 있는 변화가 시작될 거예요.
            </p>
          </div>
        )}

        {step > 1 && (
          <div className="flex justify-center mb-6">
            <AppLogo className="w-12 h-12 text-brand-primary" />
          </div>
        )}
        
        {step === 1 && (
          <div key={step} className="space-y-4 animate-in fade-in duration-500">
            <h2 className="text-xl font-semibold font-serif text-brand-primary mb-4 text-center">어떤 목표를 향해 가고 싶나요?</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {goalOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() =>
                    setGoals(goals.includes(opt.id) ? goals.filter((g) => g !== opt.id) : [...goals, opt.id])
                  }
                  className={`px-3.5 py-2 border rounded-lg text-sm font-medium transition-colors duration-150 ${goals.includes(opt.id) ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
        {step === 2 && (
          <div key={step} className="space-y-4 animate-in fade-in duration-500">
            <h2 className="text-xl font-semibold font-serif text-brand-primary mb-1">현재 나의 모습을 확인해보세요:</h2>
            <h3 className="text-lg font-medium mb-3 text-brand-primary">워킹 메모리 테스트</h3>
            <EvidenceSection
              description="워킹 메모리(작업 기억)는 학습 능력의 핵심입니다. 간단한 테스트로 현재 상태를 확인해보세요."
            />
            {! (memorySpanScore >= 0) ? (
              <MemoryTest sequenceLength={9} displayDuration={500} onComplete={(score) => setMemorySpanScore(score)} />
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-3">
                <CheckCircleIcon className="w-12 h-12 text-brand-accent-sage mb-2" />
                <p className="text-gray-800 font-semibold">
                  멋져요! 테스트가 완료되었습니다.<br/>이 결과를 바탕으로 꼭 맞는 훈련을 제안해 드릴게요.
                </p>
              </div>
            )}
          </div>
        )}
        {step === 3 && (
          <div key={step} className="space-y-4 animate-in fade-in duration-500">
            <h2 className="text-xl font-semibold font-serif text-brand-primary mb-1">깊은 집중을 위한 준비:</h2>
            <h3 className="text-lg font-medium mb-3 text-brand-primary">지속 주의력 테스트</h3>
            <EvidenceSection
              description="집중력은 학습 효율을 좌우합니다. 현재 주의력 수준을 측정하고 향상시켜 보세요."
            />
            {! (attentionScore >= 0) ? (
              <AttentionTest onComplete={(score) => setAttentionScore(score)} />
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-3">
                <CheckCircleIcon className="w-12 h-12 text-brand-accent-sage mb-2" />
                <p className="text-gray-800 font-semibold">
                  좋아요! 테스트가 끝났습니다.<br/>Habitus33과 함께 집중력을 더 단단하게 만들어가요.
                </p>
              </div>
            )}
          </div>
        )}
        {step === 4 && (
          <div key={step} className="space-y-6 animate-in fade-in duration-500">
            <h2 className="text-xl font-semibold font-serif text-brand-primary mb-4">더 나은 경험을 위해 알려주세요</h2>
            
            <div>
              <label htmlFor="notificationTimeInput" className="block font-medium mb-1.5 text-gray-800">
                알림 시간
              </label>
              <input
                id="notificationTimeInput"
                type="time"
                value={notificationTime}
                onChange={(e) => setNotificationTime(e.target.value)}
                className="w-full p-2.5 border rounded-md bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-400 focus:ring-brand-primary focus:border-brand-primary"
              />
              <p className="text-xs text-gray-600 mt-1.5">꾸준한 훈련을 위한 리마인더예요.</p>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={communityInterest}
                onChange={(e) => setCommunityInterest(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary bg-gray-50"
              />
              <span className="font-medium text-gray-800">커뮤니티 참여</span>
              <span className="text-sm text-gray-600">(함께 성장하는 즐거움을 경험하세요!)</span>
            </label>
          </div>
        )}
        {step === 5 && prefs && (
          <div key={step} className="space-y-6 text-center animate-in fade-in duration-500">
            <h2 className="text-3xl font-bold font-serif text-brand-primary">
              당신을 위한 준비가 끝났습니다
            </h2>
            
            <div className="p-5 rounded-lg bg-brand-secondary border border-gray-200 space-y-4">
              <p className="text-gray-800 text-base leading-relaxed">
                측정 결과와 <strong className="font-semibold text-brand-primary"> [ {goals.map(g => goalOptions.find(opt => opt.id === g)?.label || g).join(', ')} ] </strong> 목표에 맞춰,
                당신만을 위한 학습 리듬을 제안해 드립니다.
              </p>
              
              <div className="text-left p-4 bg-white rounded-md border border-gray-200">
                <h3 className="font-semibold text-brand-primary mb-1">ZenGo 훈련 (추천 레벨: {prefs.recommendedZenGoLevels.join(", ")})</h3>
                <p className="text-gray-700 text-sm">즐거운 게임을 통해, 핵심 정보를 붙잡는 힘을 길러보세요.</p>
              </div>

              <div className="text-left p-4 bg-white rounded-md border border-gray-200">
                <h3 className="font-semibold text-brand-primary mb-1">Atomic Reading ({prefs.recommendedTsDuration}분/일)</h3>
                <p className="text-gray-700 text-sm">짧고 깊게 읽는 습관으로, 뇌의 부담을 줄이고 이해도를 높입니다.</p>
              </div>
              
              <p className="text-gray-800 font-semibold text-base mt-3 leading-relaxed">
                이 두 가지 훈련의 리듬이, 당신의 노력을 온전한 성장으로 이끌어 줄 거예요.
              </p>
            </div>

            <p className="font-semibold mt-6 text-base text-gray-700 leading-relaxed"> 
              매일 작은 성공이 모여, 지치지 않는 꾸준함을 만듭니다.<br/>
              Habitus33과 함께 당신의 새로운 여정을 시작해보세요.
            </p>
          </div>
        )}

        <div className="mt-10 flex justify-between items-center">
          <button
            onClick={handlePrev}
            disabled={step === 1}
            className="px-5 py-2.5 border border-gray-300 bg-white text-gray-800 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-gray-50"
          >
            {step === 5 ? "다시 살펴보기" : "이전"}
          </button>
          <button
            onClick={handleNext}
            disabled={isNextDisabled}
            className="px-8 py-3 bg-brand-primary text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:opacity-90 font-bold text-lg shadow-md hover:shadow-brand-primary/30 flex items-center justify-center"
          >
            {loading && step === 4 ? (
              <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />
            ) : null}
            {step === 5 ? "나의 학습 여정 시작하기" : (loading && step === 4 ? "설정 저장 중..." : "다음")} 
            {step === 5 && <ArrowRightIcon className="w-5 h-5 ml-2" />}
          </button>
        </div>
      </div>
    </div>
  );
} 