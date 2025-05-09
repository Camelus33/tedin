"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppLogo from '@/components/common/AppLogo';
import EvidenceSection from '@/components/common/EvidenceSection';
import MemoryTest from '@/components/onboarding/MemoryTest';
import AttentionTest from '@/components/onboarding/AttentionTest';

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
    { id: "focus", label: "집중력 향상" },
    { id: "memory", label: "기억력 강화" },
    { id: "exam", label: "시험 대비" },
  ];

  const handleNext = async () => {
    if (step < 4) {
      setStep(step + 1);
    } else if (step === 4) {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/auth/login");
          return;
        }
        const res = await fetch("/api/users/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ goals, memorySpanScore, attentionScore, notificationTime, communityInterest }),
        });
        if (!res.ok) throw new Error("설정 저장 실패");
        const data = await res.json();
        setPrefs(data.preferences);
        setStep(5);
      } catch (e) {
        console.error(e);
        router.push("/");
      } finally {
        setLoading(false);
      }
    } else if (step === 5) {
      // 온보딩 완료 시 대시보드로 이동
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        {/* Debug: show internal state */}
        {/* <pre className="text-xs text-red-500 mb-2">{JSON.stringify({ step, memorySpanScore, attentionScore })}</pre> */}
        <div className="flex justify-center mb-4">
          <AppLogo className="w-9 h-9" />
        </div>
        <div className="mb-4">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500" style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="text-xs text-center text-gray-600 mt-1">{step} / 5</div>
        </div>

        {/* Step Contents */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">훈련 목표 선택</h2>
            <div className="flex flex-wrap gap-2">
              {goalOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() =>
                    setGoals(goals.includes(opt.id) ? goals.filter((g) => g !== opt.id) : [...goals, opt.id])
                  }
                  className={`px-4 py-2 border rounded ${
                    goals.includes(opt.id) ? "bg-indigo-500 text-white" : "bg-white text-gray-800"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">워킹 메모리 테스트</h2>
            <EvidenceSection
              description="워킹 메모리(작업 기억)는 학습에서 중요한 역할을 합니다."
              citations={[
                { author: "Alan D. Baddeley", title: "The episodic buffer: a new component of working memory", year: 2000, url: "https://doi.org/10.1016/S1364-6613(00)01446-1" },
                { author: "Nelson Cowan", title: "The magical number 4 in short-term memory", year: 2001, url: "https://doi.org/10.1037/0033-295X.108.2.205" },
              ]}
            />
            {! (memorySpanScore >= 0) ? (
              <MemoryTest sequenceLength={9} displayDuration={500} onComplete={(score) => setMemorySpanScore(score)} />
            ) : (
              <p>테스트 완료! 점수: {memorySpanScore}</p>
            )}
          </div>
        )}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">지속 주의력 테스트</h2>
            <EvidenceSection
              description="지속 주의력은 학습 유지와 수행에 필수적입니다."
              citations={[
                { author: "Michael I. Posner", title: "The attention system of the human brain", year: 1990, url: "https://doi.org/10.1146/annurev.ne.13.030190.001325" },
                { author: "Edward R. Robertson", title: "Sustained Attention to Response Task", year: 1997, url: "https://doi.org/10.1016/S0010-0277(97)00113-4" },
              ]}
            />
            {! (attentionScore >= 0) ? (
              <AttentionTest onComplete={(score) => setAttentionScore(score)} />
            ) : (
              <p>테스트 완료! 점수: {attentionScore}</p>
            )}
          </div>
        )}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">환경 설정</h2>
            <label className="block">
              알림 시간:
              <input
                type="time"
                value={notificationTime}
                onChange={(e) => setNotificationTime(e.target.value)}
                className="ml-2 border p-1 rounded"
              />
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={communityInterest}
                onChange={(e) => setCommunityInterest(e.target.checked)}
              />
              <span>커뮤니티 참여</span>
            </label>
          </div>
        )}
        {step === 5 && prefs && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">추천 훈련</h2>
            <p>워킹 메모리: {prefs.memorySpanScore}</p>
            <p>주의력: {prefs.attentionScore}</p>
            <p>추천 ZenGo: {prefs.recommendedZenGoLevels.join(", ")}</p>
            <p>추천 TS 루틴: {prefs.recommendedTsDuration}분</p>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-6 flex justify-between">
          <button
            onClick={handlePrev}
            disabled={step === 1}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >이전</button>
          <button
            onClick={handleNext}
            disabled={isNextDisabled}
            className="px-6 py-2 bg-indigo-500 text-white rounded disabled:opacity-50"
          >{step === 5 ? (loading ? "완료 중..." : "완료") : "다음"}</button>
        </div>
      </div>
    </div>
  );
} 