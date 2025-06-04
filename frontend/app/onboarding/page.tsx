"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppLogo from '@/components/common/AppLogo';
import EvidenceSection from '@/components/common/EvidenceSection';
import MemoryTest from '@/components/onboarding/MemoryTest';
import AttentionTest from '@/components/onboarding/AttentionTest';
import { apiClient } from '@/lib/apiClient';
import { ArrowPathIcon } from '@heroicons/react/20/solid';
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

  const neutralBgColor = "bg-neutral-900";
  const cardBgColor = "bg-neutral-800";
  const textColor = "text-neutral-100";
  const mutedTextColor = "text-neutral-400";
  const progressBarBgColor = "bg-neutral-700";
  const progressBarFillColor = "bg-cyan-500";
  const primaryButtonBgColor = "bg-cyan-500 hover:bg-cyan-600";
  const primaryButtonTextColor = "text-white";
  const secondaryButtonBgColor = "bg-neutral-700 hover:bg-neutral-600";
  const secondaryButtonTextColor = "text-neutral-200";

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${neutralBgColor} p-6`}>
      <div className={`w-full max-w-md ${cardBgColor} rounded-lg shadow-xl p-8 ${textColor}`}>
        {/* 진행 표시 (카드의 가장 상단으로 이동) */}
        <div className="mb-8"> {/* 진행 바와 다음 내용 사이의 여백 */}
          <div className={`h-3 ${progressBarBgColor} rounded-full overflow-hidden`}>
            <div className={`h-full ${progressBarFillColor} transition-all duration-500 ease-out`} style={{ width: `${progressPercent}%` }} />
          </div>
          <div className={`text-sm text-center ${mutedTextColor} mt-2`}>{step} / 5단계</div>
        </div>

        {/* 환영 메시지 및 슬로건 (1단계에만 표시) */}
        {step === 1 && (
          <div className="mb-8 text-center">
            <AppLogo className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
              환영합니다!
            </h1>
            <p className="text-xl font-semibold mb-3">
              "이제, 쭉쭉 읽고 바로 이해하세요!"
            </p>
            <p className={`text-lg ${textColor}`}>
              단 <strong className="font-bold text-cyan-400">33일</strong>, 당신의 놀라운 변화가 시작됩니다.
            </p>
          </div>
        )}

        {/* 로고 (1단계 이후 상단 중앙) */}
        {step > 1 && (
          <div className="flex justify-center mb-6">
            <AppLogo className="w-12 h-12" />
          </div>
        )}
        
        {/* Step Contents */}
        {step === 1 && (
          <div key={step} className="space-y-4 animate-in fade-in duration-500">
            <h2 className="text-xl font-semibold mb-4">목표가 무엇인가요?</h2>
            <div className="flex flex-wrap justify-center gap-2">
              {goalOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() =>
                    setGoals(goals.includes(opt.id) ? goals.filter((g) => g !== opt.id) : [...goals, opt.id])
                  }
                  className={`px-3.5 py-2 border rounded-lg text-sm font-medium transition-colors duration-150 ${goals.includes(opt.id) ? `${primaryButtonBgColor} ${primaryButtonTextColor} border-transparent` : `${secondaryButtonBgColor} ${secondaryButtonTextColor} border-neutral-600 hover:bg-neutral-700`}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
        {step === 2 && (
          <div key={step} className="space-y-4 animate-in fade-in duration-500">
            <h2 className="text-xl font-semibold mb-1">당신의 숨겨진 인지 능력을 발견해보세요:</h2>
            <h3 className="text-lg font-medium mb-3 text-cyan-400">워킹 메모리 테스트</h3>
            <EvidenceSection
              description="워킹 메모리(작업 기억)는 학습 능력의 핵심입니다. 간단한 테스트로 현재 상태를 확인해보세요."
            />
            {! (memorySpanScore >= 0) ? (
              <MemoryTest sequenceLength={9} displayDuration={500} onComplete={(score) => setMemorySpanScore(score)} />
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-3">
                <CheckCircleIcon className="w-12 h-12 text-cyan-400 mb-2" />
                <p className="text-cyan-400 font-semibold">
                  훌륭해요! 워킹 메모리 테스트 완료 (점수: {memorySpanScore}).<br/>이 점수를 바탕으로 맞춤 훈련이 제공됩니다!
                </p>
              </div>
            )}
          </div>
        )}
        {step === 3 && (
          <div key={step} className="space-y-4 animate-in fade-in duration-500">
            <h2 className="text-xl font-semibold mb-1">놀라운 집중력의 시작:</h2>
            <h3 className="text-lg font-medium mb-3 text-cyan-400">지속 주의력 테스트</h3>
            <EvidenceSection
              description="집중력은 학습 효율을 좌우합니다. 현재 주의력 수준을 측정하고 향상시켜 보세요."
            />
            {! (attentionScore >= 0) ? (
              <AttentionTest onComplete={(score) => setAttentionScore(score)} />
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-3">
                <CheckCircleIcon className="w-12 h-12 text-cyan-400 mb-2" />
                <p className="text-cyan-400 font-semibold">
                  집중력이 대단하시네요! 지속 주의력 테스트 완료 (점수: {attentionScore}).<br/>Habitus33가 더 발전시켜 드려요!
                </p>
              </div>
            )}
          </div>
        )}
        {step === 4 && (
          <div key={step} className="space-y-4 animate-in fade-in duration-500">
            <h2 className="text-xl font-semibold mb-4">Habitus33를 당신에게 맞게 설정하세요</h2>
            
            {/* 알림 시간 설정 영역 */}
            <div className="mb-5"> {/* 이전 mb-3에서 mb-5로 늘려 커뮤니티 참여 영역과의 간격 확보 */}
              <label htmlFor="notificationTimeInput" className="block font-medium mb-1.5 text-neutral-100"> {/* textColor 적용 및 htmlFor 추가, mb 증가 */}
                알림 시간:
              </label>
              <input
                id="notificationTimeInput"
                type="time"
                value={notificationTime}
                onChange={(e) => setNotificationTime(e.target.value)}
                // 기본 스타일 개선 및 Webkit 브라우저 타겟 스타일 추가
                className={`w-full p-2.5 border rounded-md bg-neutral-700 border-neutral-600 text-neutral-100 placeholder-neutral-400 focus:ring-cyan-500 focus:border-cyan-500 
                          custom-time-input 
                          dark:[color-scheme:dark]`} // color-scheme 추가 및 패딩 조정
                // custom-time-input 클래스에 대한 CSS 정의는 styles/globals.css 등에 필요할 수 있습니다.
                // 예: input[type="time"]::-webkit-calendar-picker-indicator { filter: invert(1) brightness(0.8) sepia(0.5) saturate(5) hue-rotate(170deg); }
              />
              <p className={`text-xs ${mutedTextColor} mt-1.5`}>꾸준한 훈련을 위한 리마인더예요.</p> {/* mt 증가 */}
            </div>

            {/* 커뮤니티 참여 영역 */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={communityInterest}
                onChange={(e) => setCommunityInterest(e.target.checked)}
                className="h-4 w-4 rounded border-neutral-600 text-cyan-600 focus:ring-cyan-500 bg-neutral-700"
              />
              <span className="font-medium text-neutral-100">커뮤니티 참여</span> {/* textColor 적용 */}
              <span className={`text-xs ${mutedTextColor}`}> (함께 성장하는 즐거움을 경험하세요!)</span>
            </label>
          </div>
        )}
        {step === 5 && prefs && (
          <div key={step} className="space-y-6 text-center animate-in fade-in duration-500">
            {/* 1. 상단 아이콘 또는 로고 (개선안) */}
            {/* TODO: 여기에 서비스의 핵심 가치를 나타내는 일러스트나 아이콘 추가 (예: 뇌, 책, 성장 관련) */}
            {/* 예시: <BrainIcon className="w-16 h-16 mx-auto mb-4 text-cyan-400" /> */}
            
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
              읽기 능력의 놀라운 도약, <br/> 지금 시작하세요! {/* 부드러운 줄바꿈 추가 */}
            </h2>
            
            {/* 2. 핵심 프로그램 소개 (카드형 또는 섹션 구분 제안) */}
            <div className={`p-6 rounded-lg ${progressBarBgColor} border border-neutral-700 space-y-4`}>
              {/* TODO: 각 항목 옆에 작은 아이콘 추가 고려 */}
              <p className={`${textColor} text-lg leading-relaxed`}>
                당신의 측정 결과와 <strong className="text-cyan-400">[ {goals.map(g => goalOptions.find(opt => opt.id === g)?.label || g).join(', ')} ]</strong> 목표에 맞춰,
                Habitus33가 최적의 훈련을 제안합니다.
              </p>
              
              {/* ZenGo 훈련 */}
              <div className="text-left p-3 bg-neutral-700 rounded-md"> {/* 배경색 살짝 다르게 */}
                {/* TODO: ZenGo 아이콘 */}
                <h3 className="font-semibold text-cyan-400 mb-1">ZenGo 훈련 (레벨 {prefs.recommendedZenGoLevels.join(", ")})</h3>
                <p className={`${mutedTextColor} text-sm`}>뇌가소성 원리에 기반한 시지각 및 인지 능력 강화 훈련입니다.</p>
              </div>

              {/* TS 집중 루틴 */}
              <div className="text-left p-3 bg-neutral-700 rounded-md">
                {/* TODO: TS 루틴 아이콘 (시계/달력 등) */}
                <h3 className="font-semibold text-cyan-400 mb-1">TS 집중 루틴 ({prefs.recommendedTsDuration}분/일)</h3>
                <p className={`${mutedTextColor} text-sm`}>매일 꾸준한 집중 연습으로 독해 지구력을 향상시킵니다.</p>
              </div>
              
              <p className={`${textColor} font-semibold text-lg mt-3 leading-relaxed`}>
                이를 통해 집중력이 향상되어, 내용을 더 빠르고 정확하게 이해하며 오래 기억하게 됩니다.
                긴 글 부담은 줄고, 지식 습득의 즐거움은 커집니다.
              </p>
            </div>

            {/* 3. 변화 기간 및 효과 강조 (요청하신 텍스트 수정 반영) */}
            <p className={`font-semibold mt-6 text-xl ${textColor} leading-relaxed`}> 
              {/* TODO: "33일간" 부분에 달력 아이콘 또는 시각적 강조 요소 추가 */}
              단 <strong className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-2xl">3분 11페이지, 33일간의</strong> 변화! <br/> 
              Habitus33와 함께 놀라운 성장을 경험하세요.
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-10 flex justify-between items-center"> {/* mt 증가 및 items-center 추가 */}
          <button
            onClick={handlePrev}
            disabled={step === 1}
            // 이전 버튼 스타일은 유지하거나, step 5에서는 "다시 설정하기" 등으로 텍스트 변경 고려
            className={`px-5 py-2.5 border border-neutral-600 ${secondaryButtonBgColor} ${secondaryButtonTextColor} rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150`}
          >
            {step === 5 ? "설정 검토" : "이전"}
          </button>
          <button
            onClick={handleNext}
            disabled={isNextDisabled}
            // 주요 CTA 버튼 스타일 강조 (개선안)
            className={`px-8 py-3 ${primaryButtonBgColor} ${primaryButtonTextColor} rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 font-bold text-lg shadow-lg hover:shadow-cyan-500/50 flex items-center justify-center`}
          >
            {loading && step === 4 ? ( // step 4에서 로딩 아이콘 (기존 로직은 step 5였으나, API 호출은 step 4에서 발생)
              <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />
            ) : null}
            {step === 5 ? "Habitus33 시작하기!" : (loading && step === 4 ? "설정 저장 중..." : "다음")} 
            {/* TODO: step 5 버튼에 화살표 아이콘 추가 (예: <ArrowRightIcon className="w-5 h-5 ml-2" />) */}
          </button>
        </div>
      </div>
    </div>
  );
} 