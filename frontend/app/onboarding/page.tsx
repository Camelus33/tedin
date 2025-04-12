"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

// 온보딩 단계 정의
type OnboardingStep = {
  id: number;
  title: string;
  description: string;
};

// 목표 옵션
type Goal = {
  id: string;
  title: string;
  description: string;
  icon: string;
};

// 장르 옵션
type Genre = {
  id: string;
  name: string;
};

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // 사용자 설정 상태
  const [selectedGoal, setSelectedGoal] = useState<string>("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [focusDuration, setFocusDuration] = useState<number>(11);
  const [warmupPreference, setWarmupPreference] = useState<boolean>(true);

  // 온보딩 단계
  const steps: OnboardingStep[] = [
    {
      id: 1,
      title: "왜 habitus33을 시작하셨나요?",
      description: "당신의 목표를 알려주세요. 맞춤형 경험을 제공해 드립니다."
    },
    {
      id: 2,
      title: "선호하는 장르는 무엇인가요?",
      description: "관심 있는 장르를 선택해 주세요. 최대 3개까지 선택 가능합니다."
    },
    {
      id: 3,
      title: "집중 지속 시간은 어느 정도가 적당한가요?",
      description: "TS 모드에서 사용될 기본 집중 시간을 설정합니다. 나중에 변경 가능합니다."
    },
    {
      id: 4,
      title: "예열 훈련을 선호하시나요?",
      description: "독서 전 짧은 인지 훈련으로 집중력과 이해도를 높일 수 있습니다."
    }
  ];

  // 목표 옵션
  const goals: Goal[] = [
    {
      id: "speed",
      title: "독서 속도 향상",
      description: "더 빠르게 읽고 정보를 효율적으로 습득하고 싶어요",
      icon: "⚡"
    },
    {
      id: "metacognition",
      title: "메타인지 훈련",
      description: "생각하는 방식을 개선하고 인지 능력을 향상시키고 싶어요",
      icon: "🧠"
    },
    {
      id: "exam",
      title: "시험 대비",
      description: "시험이나 학업을 위해 집중력과 이해도를 높이고 싶어요",
      icon: "📚"
    },
    {
      id: "habit",
      title: "독서 습관 형성",
      description: "꾸준한 독서 습관을 만들고 유지하고 싶어요",
      icon: "📅"
    }
  ];

  // 장르 옵션
  const genres: Genre[] = [
    { id: "fiction", name: "소설" },
    { id: "non-fiction", name: "비소설" },
    { id: "self-development", name: "자기계발" },
    { id: "business", name: "경영/경제" },
    { id: "science", name: "과학" },
    { id: "history", name: "역사" },
    { id: "philosophy", name: "철학" },
    { id: "psychology", name: "심리학" },
    { id: "art", name: "예술" },
    { id: "technology", name: "기술" },
    { id: "biography", name: "전기/회고록" },
    { id: "essay", name: "에세이" }
  ];

  // 장르 선택 토글
  const toggleGenre = (genreId: string) => {
    if (selectedGenres.includes(genreId)) {
      setSelectedGenres(selectedGenres.filter(id => id !== genreId));
    } else {
      if (selectedGenres.length < 3) {
        setSelectedGenres([...selectedGenres, genreId]);
      }
    }
  };

  // 다음 단계로 이동
  const goToNextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // 마지막 단계에서는 설정 저장 후 책 목록 페이지로 이동
      saveSettings();
    }
  };

  // 이전 단계로 이동
  const goToPrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // 현재 단계가 완료되었는지 확인
  const isCurrentStepCompleted = () => {
    switch (currentStep) {
      case 1:
        return !!selectedGoal;
      case 2:
        return selectedGenres.length > 0;
      case 3:
        return focusDuration >= 7 && focusDuration <= 25;
      case 4:
        return true; // 항상 완료 가능
      default:
        return false;
    }
  };

  // 설정 저장
  const saveSettings = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        router.push("/auth/login");
        return;
      }

      const response = await fetch("/api/user/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          goal: selectedGoal,
          preferredGenres: selectedGenres,
          focusDuration,
          warmupPreference
        })
      });

      if (!response.ok) {
        throw new Error("설정 저장에 실패했습니다");
      }

      // 설정 저장 성공 후 책 목록 페이지로 이동
      router.push("/books");
    } catch (error) {
      console.error("온보딩 설정 저장 오류:", error);
      // 오류가 발생해도 일단 책 목록 페이지로 이동
      router.push("/books");
    } finally {
      setIsLoading(false);
    }
  };

  // 각 단계에 맞는 컨텐츠 렌더링
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goals.map((goal) => (
                <motion.div
                  key={goal.id}
                  className={`
                    p-6 rounded-xl border cursor-pointer transition-all
                    ${selectedGoal === goal.id 
                      ? "border-indigo-500 bg-indigo-50 shadow-md" 
                      : "border-gray-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/30"
                    }
                  `}
                  onClick={() => setSelectedGoal(goal.id)}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex">
                    <div className="text-3xl mr-4">{goal.icon}</div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{goal.title}</h3>
                      <p className="text-gray-600 text-sm">{goal.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-3">
              {genres.map((genre) => (
                <motion.button
                  key={genre.id}
                  className={`
                    py-2 px-4 rounded-full text-sm font-medium transition-all
                    ${selectedGenres.includes(genre.id)
                      ? "bg-indigo-100 text-indigo-700 border-2 border-indigo-500"
                      : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                    }
                  `}
                  onClick={() => toggleGenre(genre.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={selectedGenres.length >= 3 && !selectedGenres.includes(genre.id)}
                >
                  {genre.name}
                </motion.button>
              ))}
            </div>
            {selectedGenres.length > 0 && (
              <div className="text-sm text-gray-600">
                선택한 장르: {selectedGenres.length}/3
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            <div className="flex justify-center">
              <div className="rounded-full bg-indigo-100 w-24 h-24 flex items-center justify-center">
                <span className="text-indigo-700 text-3xl font-bold">{focusDuration}</span>
                <span className="text-indigo-700 ml-1">분</span>
              </div>
            </div>
            
            <div>
              <input
                type="range"
                min="7"
                max="25"
                step="1"
                value={focusDuration}
                onChange={(e) => setFocusDuration(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>7분</span>
                <span>11분</span>
                <span>15분</span>
                <span>20분</span>
                <span>25분</span>
              </div>
            </div>
            
            <div className="bg-indigo-50 rounded-lg p-4 text-sm text-indigo-700">
              <p>💡 연구에 따르면 11분 간격의 집중 독서가 효율성과 이해도를 극대화합니다.</p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div
                className={`
                  p-6 rounded-xl border cursor-pointer transition-all
                  ${warmupPreference 
                    ? "border-indigo-500 bg-indigo-50 shadow-md" 
                    : "border-gray-200 bg-white hover:border-indigo-200"
                  }
                `}
                onClick={() => setWarmupPreference(true)}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-center">
                  <div className="text-3xl mb-4">🔥</div>
                  <h3 className="font-semibold text-lg mb-2">예열 훈련 사용</h3>
                  <p className="text-gray-600 text-sm">
                    독서 전 2분간의 짧은 인지 훈련으로 집중력과 패턴 인식 능력을 향상시킵니다.
                  </p>
                </div>
              </motion.div>
              
              <motion.div
                className={`
                  p-6 rounded-xl border cursor-pointer transition-all
                  ${!warmupPreference 
                    ? "border-indigo-500 bg-indigo-50 shadow-md" 
                    : "border-gray-200 bg-white hover:border-indigo-200"
                  }
                `}
                onClick={() => setWarmupPreference(false)}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-center">
                  <div className="text-3xl mb-4">📖</div>
                  <h3 className="font-semibold text-lg mb-2">바로 독서 시작</h3>
                  <p className="text-gray-600 text-sm">
                    예열 과정 없이 바로 독서를 시작합니다. 언제든지 설정에서 변경할 수 있습니다.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* 로고 */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center">
            <Image
              src="/images/logo.svg"
              alt="habitus33 로고"
              width={40}
              height={40}
              className="mr-2"
            />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500">
              habitus33
            </span>
          </div>
        </div>

        {/* 진행 상태 바 */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-xs font-medium text-gray-600">시작</span>
            <span className="text-xs font-medium text-gray-600">완료</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-300 ease-out"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            ></div>
          </div>
          <div className="mt-2 text-xs text-center text-gray-600">
            {currentStep} / {steps.length}
          </div>
        </div>

        {/* 메인 카드 */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/50 p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-3">{steps[currentStep - 1].title}</h2>
              <p className="text-gray-600 mb-8">{steps[currentStep - 1].description}</p>
              
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>

          {/* 버튼 */}
          <div className="mt-12 flex justify-between">
            <button
              onClick={goToPrevStep}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-xl font-medium transition-colors
                ${currentStep === 1 
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                }
              `}
            >
              이전
            </button>
            <button
              onClick={goToNextStep}
              disabled={!isCurrentStepCompleted() || isLoading}
              className={`px-6 py-3 rounded-xl font-medium transition-colors
                ${!isCurrentStepCompleted() 
                  ? "bg-indigo-300 text-white cursor-not-allowed" 
                  : "bg-gradient-to-r from-indigo-600 to-blue-500 text-white hover:from-indigo-700 hover:to-blue-600 shadow-md hover:shadow-lg"
                }
              `}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  <span>처리 중...</span>
                </div>
              ) : currentStep === steps.length ? "설정 완료" : "다음"}
            </button>
          </div>
        </div>

        {/* 건너뛰기 버튼 */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push("/books")}
            className="text-gray-500 text-sm hover:text-gray-700 transition-colors"
          >
            나중에 설정하기
          </button>
        </div>
      </div>
    </div>
  );
} 