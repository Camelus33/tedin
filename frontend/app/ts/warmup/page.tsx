'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/common/Button';

// Types for warmup exercises
type Exercise = {
  type: string;  // 'technique', 'subvocalization', 'metaguiding', 'skimming', 'comprehension' 등 새로운 타입 허용
  title: string;
  description: string;
  content: string;
  question: string;
  options?: string[];
  correctAnswer?: string | string[];
  tip?: string;  // 학습 팁 추가
};

export default function TSWarmupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  
  const [timeLeft, setTimeLeft] = useState<number>(120); // 2 minutes
  const [currentExercise, setCurrentExercise] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string | string[]>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [showTip, setShowTip] = useState(false);

  // Format seconds into MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Sample warmup exercises
  const exercises: Exercise[] = [
    {
      type: 'technique',
      title: '시선 확장법 훈련',
      description: '한 번에 더 넓은 영역을 인식하는 능력을 키우는 훈련입니다. 이 기술은 독서 속도를 2-3배 높여줍니다.',
      content: '아래 텍스트를 한 눈에 빠르게 인식해보세요. 텍스트를 단어 단위로 읽지 말고, 3-4개 단어를 한 덩어리로 보는 연습을 합니다.\n\n인간의 뇌는 | 놀라운 능력을 가지고 있어 | 여러 단어를 | 동시에 처리할 수 있습니다. | 시선 확장법을 | 꾸준히 연습하면 | 독서 속도와 | 이해력이 함께 | 높아질 수 있습니다.',
      question: '위 텍스트에서 총 몇 개의 단어 그룹이 있나요?',
      options: ['7개', '8개', '9개', '10개'],
      correctAnswer: '9개',
      tip: '글을 읽을 때 한 단어씩 읽지 말고 의미 단위로 묶어 읽으세요. 이는 전두엽이 정보를 더 효율적으로 처리하게 합니다.'
    },
    {
      type: 'subvocalization',
      title: '내적 발성 줄이기',
      description: '머릿속으로 소리내어 읽는 습관(내적 발성)을 줄이면 읽기 속도가 크게 향상됩니다.',
      content: '다음 문장을 읽되, 머릿속에서 소리내어 읽지 말고 시각적으로만 이해해보세요.\n\n텍스트를 읽을 때 내적 발성을 사용하면 말하는 속도(분당 150-200단어)로 제한됩니다. 하지만 뇌는 분당 400-700단어까지 처리할 수 있는 능력이 있습니다. 내적 발성을 줄이면 독서 속도가 2-3배 향상될 수 있습니다.',
      question: '내적 발성 없이 읽을 때 처리 가능한 최대 단어 수(분당)는?',
      options: ['200-300단어', '400-700단어', '800-1000단어', '1000단어 이상'],
      correctAnswer: '400-700단어',
      tip: '텍스트를 정보의 흐름으로 바라보고, 단어의 모양과 패턴을 시각적으로 인식하세요. 이것은 해마를 더 효과적으로 활성화시킵니다.'
    },
    {
      type: 'metaguiding',
      title: '시선 유도법',
      description: '효과적인 시선 이동을 통해 읽기 효율성을 높이는 기술입니다.',
      content: '아래 텍스트를 읽을 때 손가락이나 포인터로 텍스트를 따라가며 읽어보세요. 이 때 포인터를 일정한 속도로 움직이며, 시선이 포인터를 따라가도록 합니다.\n\n→ 시선 유도법은 독서 중 집중력을 높이고 시선이 되돌아가는 것을 방지합니다.\n→ 이 방법은 속독 전문가들이 가장 추천하는 기본 기술입니다.\n→ 처음에는 익숙하지 않을 수 있지만, 연습하면 자연스러워집니다.\n→ 디지털 기기에서는 마우스 커서나 키보드 화살표를 활용할 수 있습니다.',
      question: '시선 유도법의 주요 효과는 무엇인가요?',
      options: ['어려운 단어 이해 능력 향상', '문법 구조 파악 능력 향상', '집중력 강화와 시선 회귀 방지', '장시간 독서 시 눈의 피로 감소'],
      correctAnswer: '집중력 강화와 시선 회귀 방지',
      tip: '시선 유도는 전두엽의 집중 영역을 자극하여 정보 처리 효율을 높입니다. 규칙적인 움직임이 뇌의 리듬을 최적화합니다.'
    },
    {
      type: 'skimming',
      title: '스키밍(훑어읽기) 기술',
      description: '많은 정보에서 핵심만 빠르게 파악하는 기술을 익혀보세요.',
      content: '다음 문단을 15초 안에 훑어읽고 핵심 정보를 파악해보세요.\n\n인공지능(AI)은 21세기 기술 혁명의 중심입니다. 머신러닝 알고리즘의 발전으로 데이터 분석, 패턴 인식, 자연어 처리 능력이 비약적으로 향상되었습니다. 딥러닝은 특히 이미지 인식과 음성 인식 분야에서 혁신적인 성과를 이루었으며, 이는 자율주행 자동차, 의료 진단, 번역 서비스 등 다양한 산업에 응용되고 있습니다. 그러나 AI의 급속한 발전은 윤리적, 사회적 문제도 제기하고 있어 규제와 윤리 지침의 중요성이 강조되고 있습니다.',
      question: '이 문단의 핵심 주제는 무엇인가요?',
      options: ['자율주행 기술의 발전', 'AI의 발전과 그 영향', '딥러닝의 기술적 원리', 'AI 규제의 필요성'],
      correctAnswer: 'AI의 발전과 그 영향',
      tip: '스키밍은 첫 문장, 마지막 문장, 강조된 키워드에 집중하는 방식입니다. 이 방법은 대뇌피질의 패턴 인식 능력을 활용합니다.'
    },
    {
      type: 'comprehension',
      title: '이해력 유지 기술',
      description: '속독하면서도 이해력을 유지하는 방법을 배워봅시다.',
      content: '다음 문단을 빠르게 읽으면서 내용을 정확히 이해해보세요.\n\n효과적인 독서는 단순히 빠르게 읽는 것이 아니라, 내용을 효율적으로 이해하고 기억하는 것입니다. 속독 시 이해력을 유지하기 위한 핵심 전략은 다음과 같습니다. 첫째, 사전 스캐닝으로 전체 구조를 파악합니다. 둘째, 질문을 미리 생성하여 목적을 가지고 읽습니다. 셋째, 중요 정보를 시각화하여 기억에 정착시킵니다. 넷째, 정기적으로 짧게 내용을 요약합니다. 이 네 가지 전략을 함께 사용하면 읽기 속도를 높이면서도 이해도를 유지할 수 있습니다.',
      question: '속독 시 이해력 유지를 위한 전략으로 언급되지 않은 것은?',
      options: ['사전 스캐닝', '질문 생성', '정보 시각화', '반복 읽기'],
      correctAnswer: '반복 읽기',
      tip: '독서 후 핵심 내용을 자신의 말로 정리해보세요. 이 과정은 해마의 장기 기억 전환 과정을 촉진시킵니다.'
    }
  ];

  // Timer logic
  useEffect(() => {
    if (isLoading || timeLeft <= 0) {
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerId);
          // Automatically go to reading page when timer ends
          handleFinishWarmup();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [isLoading, timeLeft]);

  useEffect(() => {
    // Simulate loading exercise data
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearInterval(loadingTimer);
  }, []);

  const handleAnswerSelect = (answer: string | string[]) => {
    setUserAnswers(prev => ({
      ...prev,
      [currentExercise]: answer
    }));
  };

  const handleNext = () => {
    if (currentExercise < exercises.length - 1) {
      setCurrentExercise(currentExercise + 1);
    } else {
      handleFinishWarmup();
    }
  };

  const handleFinishWarmup = useCallback(() => {
    if (!sessionId) return;
    // Navigate to reading page with session ID
    router.push(`/ts/reading?sessionId=${sessionId}`);
  }, [sessionId, router]);

  const handleToggleTip = () => {
    setShowTip(prev => !prev);
  };

  const exercise = exercises[currentExercise];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <p>예열 훈련 준비 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50 p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
          <h1 className="text-xl font-bold text-red-600 mb-4">오류 발생</h1>
          <p className="mb-6">{error}</p>
          <Button
            href="/ts"
            variant="default"
          >
            돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-white p-4 sm:p-6">
      <div className="container mx-auto max-w-xl">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-bold text-gray-800">예열 훈련</h1>
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <div>
                <div className="text-lg font-mono font-bold text-blue-700">{formatTime(timeLeft)}</div>
                <div className="text-xs text-blue-500">남은 시간</div>
              </div>
            </div>
          </div>

          <div className="relative mb-2">
            <div className="h-2 bg-gray-200 rounded-full">
              <div 
                className="h-2 bg-blue-500 rounded-full" 
                style={{ width: `${((currentExercise + 1) / exercises.length) * 100}%` }}
              ></div>
            </div>
            <div className="mt-1 text-xs text-right text-gray-500">
              {currentExercise + 1} / {exercises.length}
            </div>
          </div>

          <div className="bg-indigo-50 rounded-xl p-5 mb-6 border border-indigo-100">
            <h2 className="font-bold text-lg text-indigo-800 mb-2">{exercise.title}</h2>
            <p className="text-sm text-indigo-700 mb-5 leading-relaxed">{exercise.description}</p>
            <div className="bg-white p-4 rounded-xl border border-indigo-100 mb-4 shadow-sm overflow-auto max-h-60">
              <p className="text-gray-800 whitespace-pre-wrap break-words">{exercise.content}</p>
            </div>
            <p className="font-medium text-gray-800">{exercise.question}</p>
            {exercise.tip && (
              <div className="mt-4">
                <button 
                  onClick={handleToggleTip}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{showTip ? '팁 숨기기' : '팁 보기'}</span>
                </button>
                {showTip && (
                  <div className="mt-2 p-3 bg-yellow-50 border border-yellow-100 rounded-lg">
                    <p className="text-sm text-yellow-800">{exercise.tip}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {exercise.type === 'wordSpotting' || exercise.type === 'wordCounting' ? (
            <div className="space-y-3 mb-6">
              {exercise.options?.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  className={`w-full p-4 rounded-xl text-left transition-all ${
                    userAnswers[currentExercise] === option
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          ) : (
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {exercise.options?.map((option, index) => {
                  const isSelected = Array.isArray(userAnswers[currentExercise]) 
                    ? (userAnswers[currentExercise] as string[]).includes(option)
                    : false;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        // Toggle selection for multiselect
                        const currentSelections = Array.isArray(userAnswers[currentExercise])
                          ? [...userAnswers[currentExercise] as string[]]
                          : [];
                          
                        if (isSelected) {
                          handleAnswerSelect(currentSelections.filter(item => item !== option));
                        } else {
                          handleAnswerSelect([...currentSelections, option]);
                        }
                      }}
                      className={`px-4 py-3 rounded-xl transition-all ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200'
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-2 italic">여러 개 선택 가능합니다</p>
            </div>
          )}

          <div className="flex justify-between pt-2">
            <button
              onClick={handleFinishWarmup}
              className="text-gray-500 hover:text-gray-700 text-sm font-medium flex items-center transition-colors"
            >
              <span>건너뛰기</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
            <button
              onClick={handleNext}
              disabled={!userAnswers[currentExercise]}
              className={`px-6 py-2.5 rounded-xl font-medium flex items-center ${
                userAnswers[currentExercise]
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              } transition-colors`}
            >
              <span>{currentExercise < exercises.length - 1 ? '다음' : '완료'}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 