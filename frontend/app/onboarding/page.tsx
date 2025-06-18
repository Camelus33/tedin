"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppLogo from '@/components/common/AppLogo';
import {
  ArrowRightIcon,
  PencilSquareIcon,
  LinkIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import ArticleToCapsuleAnimation from '@/components/onboarding/ArticleToCapsuleAnimation';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  const totalSteps = 3; // 1: 비전 제시, 2: 핵심 원리, 3: 시작하기

  const handleNext = async () => {
    if (loading) return;
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      router.push("/dashboard");
    }
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const isNextDisabled = loading;

  const progressPercent = Math.min((step / totalSteps) * 100, 100);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 sm:p-6 font-sans">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-8 sm:p-12 transition-all duration-500 ease-in-out">
        <div className="mb-10">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 transition-all duration-500 ease-out" style={{ width: `${progressPercent}%` }} />
          </div>
          <p className="text-sm text-right text-gray-500 mt-2 font-medium">{step} / {totalSteps}</p>
        </div>

        {step === 1 && (
          <div key={step} className="text-center animate-in fade-in duration-700">
            <AppLogo className="w-16 h-16 mx-auto mb-6 text-indigo-600" />
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-8 tracking-tight">
              AI, Prompt Free
            </h1>
            <div className="text-base sm:text-lg text-gray-700 leading-loose max-w-lg mx-auto space-y-5">
              <p>
                당신의 흩어진 생각을 <strong className="font-semibold text-indigo-700">'지식 캡슐'</strong>로 압축합니다.
              </p>
              <p>
                이제 새로운 경험이 시작됩니다.
              </p>
            </div>
          </div>
        )}

        {/* 2단계와 3단계는 다음 작업을 위해 비워둡니다. */}
        {step === 2 && (
          <div key={step} className="animate-in fade-in duration-700">
            <h1 className="text-center text-3xl sm:text-4xl font-bold text-gray-800 mb-8 tracking-tight">
              나만의 캡슐 만들기
            </h1>
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
              <div className="space-y-8">
                
                <div className="flex items-start space-x-4">
                  <PencilSquareIcon className="w-8 h-8 text-indigo-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">1. 수집</h3>
                    <p className="text-gray-600 mt-1">책, 아티클, 아이디어를 한 줄 메모로 가볍게 모으세요.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <LinkIcon className="w-8 h-8 text-indigo-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">2. 연결</h3>
                    <p className="text-gray-600 mt-1">AI가 메모들의 맥락을 파악해 하나의 지도로 연결합니다.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <SparklesIcon className="w-8 h-8 text-indigo-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">3. 생성</h3>
                    <p className="text-gray-600 mt-1">연결된 지도는 AI가 즉시 이해하는 '지식 캡슐'로 완성됩니다.</p>
                  </div>
                </div>

              </div>
              <div className="hidden md:flex relative items-center justify-center bg-slate-100 rounded-2xl h-80 overflow-hidden p-4 group">
                <ArticleToCapsuleAnimation />
              </div>
            </div>
          </div>
        )}
        {step === 3 && (
          <div key={step} className="text-center animate-in fade-in duration-700">
            <CheckCircleIcon className="w-20 h-20 mx-auto mb-6 text-indigo-600" />
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6 tracking-tight">
              모든 준비가 끝났습니다
            </h1>
            <div className="text-base sm:text-lg text-gray-700 leading-loose max-w-lg mx-auto space-y-4">
              <p>
                3분 읽고 한 줄 메모
              </p>
              <p>
                당신의 소중한 캡슐의 시작입니다.
              </p>
            </div>
          </div>
        )}

        <div className="mt-12 flex justify-between items-center">
          <button
            onClick={handlePrev}
            disabled={step === 1}
            className="px-5 py-2.5 border border-gray-300 bg-white text-gray-700 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors hover:bg-gray-100 font-medium"
          >
            이전
          </button>
          <button
            onClick={handleNext}
            disabled={isNextDisabled}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-indigo-700 font-bold text-lg shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 flex items-center justify-center"
          >
            {step === totalSteps ? "여정 시작하기" : (step === 2 ? "이해가 되었어요" : "핵심 원리 알아보기")}
            {step < totalSteps && <ArrowRightIcon className="w-5 h-5 ml-2" />}
          </button>
        </div>
      </div>
    </div>
  );
} 