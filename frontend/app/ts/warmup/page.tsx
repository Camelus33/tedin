'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/common/Button';
import Spinner from '@/components/ui/Spinner';
import { InformationCircleIcon, CheckCircleIcon, XCircleIcon, LightBulbIcon, ClockIcon, ChevronRightIcon, ArrowRightOnRectangleIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/outline';

// Cyber Theme Definition (Consistent with other TS pages)
const cyberTheme = {
  primary: 'text-cyan-400',
  secondary: 'text-purple-400',
  bgPrimary: 'bg-gray-900',
  bgSecondary: 'bg-gray-800',
  cardBg: 'bg-gray-800/60',
  borderPrimary: 'border-cyan-500',
  borderSecondary: 'border-purple-500',
  gradient: 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900',
  textMuted: 'text-gray-400',
  textLight: 'text-gray-300',
  inputBg: 'bg-gray-700/50',
  inputBorder: 'border-gray-600',
  inputFocusBorder: 'focus:border-cyan-500',
  inputFocusRing: 'focus:ring-cyan-500/50',
  progressBarBg: 'bg-gray-700',
  progressFg: 'bg-cyan-500',
  buttonPrimaryBg: 'bg-cyan-600',
  buttonPrimaryHoverBg: 'hover:bg-cyan-700',
  buttonSecondaryBg: 'bg-gray-700/50',
  buttonSecondaryHoverBg: 'hover:bg-gray-600/50',
  buttonDisabledBg: 'bg-gray-600',
  tipBg: 'bg-gray-700/80',
  tipBorder: 'border-gray-500/50',
  tipIcon: 'text-yellow-400',
  errorText: 'text-red-400',
  errorBorder: 'border-red-500/50',
};

// Types for warmup exercises
type Exercise = {
  type: string;
  title: string;
  description: string;
  content: string | React.ReactNode; // Allow ReactNode for styled content
  question: string;
  options?: string[];
  correctAnswer?: string | string[];
  tip?: string;
};

// Stimuli for new Information Updating task
const updateStimuli = [5, 8, 2];

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
  const [showMemoryStimulus, setShowMemoryStimulus] = useState(true); // State for timed WM task
  const [stimulusStep, setStimulusStep] = useState<number>(0); // State for Information Updating steps

  // Format seconds into MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Exercises focusing on cognitive priming for reading speed - Engaging & Challenging
  const exercises: Exercise[] = [
    {
        type: 'input_calibration',
        title: '한눈에 보기', // Engaging Title
        description: '동물 친구들이 한 줄로 지나가요! 눈 한번 깜빡! 할 때 얼마나 많은 친구들을 볼 수 있는지 연습해요. 눈을 덜 움직이면 글도 빨리 읽을 수 있답니다!', // Simple Desc + Speed Link
        content: '토끼 원숭이 코끼리 | 사자 호랑이 기린 팬더 | 고양이 강아지 다람쥐 햄스터 곰', // Longer, Engaging Content
        question: '동물 이름 덩어리(| 기준)가 모두 몇 개 인가요?', // Challenging Q
        options: ['1개', '2개', '3개', '4개'], // Options
        correctAnswer: '3개', // Answer
        tip: '글자를 한 덩어리로 보는 연습! 눈이 멈추는 횟수가 줄면 읽는 속도가 쑥쑥 올라가요!' // Strict Speed Tip
      },
      {
        type: 'target_focus',
        title: '규칙 찾기', // Engaging Title
        description: '보물 지도에 숨겨진 X 표시를 빨리 찾아보세요! 중요한 표시만 콕 집어내는 연습을 하면 글 읽을 때도 핵심 내용을 놓치지 않아요.', // Simple Desc
        content: 'A B C D E F G H I J K L M N O P Q R S T U V W X Y Z A B C D E F G H I J K L M N O P Q R S T U V W Y Z A B C D E F G H I J K L M N O P Q R S T U V W Y Z A B C D E F G H I J K L M N O P Q R S T U V W X Y Z A T U K J H G F E D M Z P Q S V', // Longer, Challenging Content
        question: '보물 지도에서 X 표시는 모두 몇 개 찾았나요?', // Challenging Q
        options: ['1개', '2개', '3개', '4개'], // Options
        correctAnswer: '2개', // Answer
        tip: '다른 글자는 무시! 목표(X)만 찾는 연습이에요. 책 읽을 때도 중요한 단어만 빠르게 찾으면 속도가 올라가요.' // Strict Speed Tip
      },
      {
        type: 'info_update',
        title: '잔상 기억하기', // Engaging Title
        description: '과일 바구니에 과일이 계속 바뀌어요. 마지막에 남은 과일을 기억해야 해요! 변하는 내용을 따라가는 연습은 빠른 읽기에 꼭 필요해요.', // Simple Desc + Speed Link
        // JS Logic will need to handle displaying this sequence: [사과] -> [사과, 바나나] -> [바나나, 포도] -> [포도, 딸기]
        // For now, represent final state conceptually in content for structure
        content: (
            <div className="text-center p-4 min-h-[80px] flex items-center justify-center">
                {stimulusStep < 4 ? (
                     <p className="mb-2 text-sm ${cyberTheme.textMuted}">과일 바구니 변화 ({stimulusStep + 1}/4): [과일 표시 로직 필요]</p>
                 ) : (
                     <p className="text-sm ${cyberTheme.textMuted}">(과일 바구니 변화 완료)</p>
                 )}
             </div>
        ),
        question: '바구니에 마지막으로 남은 과일은 무엇과 무엇이었나요?', // Challenging Q
        options: ['사과, 바나나', '바나나, 포도', '포도, 딸기', '딸기, 사과'], // Options
        correctAnswer: '포도, 딸기', // Answer
        tip: '내용이 계속 바뀌어도 바로바로 따라가는 연습! 이렇게 하면 글 읽을 때 막히지 않고 빠르게 다음으로 넘어갈 수 있어요.' // Strict Speed Tip
      },
      {
        type: 'memory_capacity',
        title: '순서 기억하기', // Engaging Title
        description: '마법사가 알려주는 주문이에요! 아주 잠깐 보이니까 집중해서 순서대로 외워야 해요.', // Simple Desc
        // JS logic needs to show this longer string for 3 seconds
        content: showMemoryStimulus ? (
            <div className="text-center p-4">
                <p className="mb-2 text-sm ${cyberTheme.textMuted}">3초 후 사라집니다! 주문을 외우세요:</p>
                <p className="font-mono text-xl font-bold ${cyberTheme.primary}">아브라카다브라 알라카잠 수리수리 마수리</p> {/* Longer Stimulus */}
            </div>
        ) : (
            <div className="text-center p-4 text-sm ${cyberTheme.textMuted}">(주문이 사라졌어요!)</div>
        ),
        question: '마법사가 알려준 주문의 *마지막* 부분은 무엇이었나요?', // Challenging Q
        options: ['아브라카다브라', '알라카잠', '수리수리', '마수리'], // Options
        correctAnswer: '마수리', // Answer
        tip: '방금 본 걸 잘 기억하면, 읽던 곳으로 다시 돌아갈 필요가 없어져서 읽는 시간이 줄어들어요!' // Strict Speed Tip
      },
      {
        type: 'inhibition',
        title: '인지부조화 경험하기', // Engaging Title
        description: '오늘은 반대로 말하는 날! 글자의 뜻 말고, 글자가 쓰인 색깔을 말해야 해요. 헷갈려도 참고 색깔만! 빠르게!', // Simple Desc
        // JS logic needs to show word 노랑 in green color
        content: (
            <div className="text-center p-4">
                <p className="mb-2 text-sm ${cyberTheme.textMuted}">이 글자는 무슨 색깔로 쓰여 있나요?</p>
                <p className="text-3xl font-bold" style={{ color: 'green' }}>노랑</p> {/* Word 노랑(yellow) in green */}
            </div>
        ),
        question: '글자는 무슨 색깔로 쓰여 있었나요?', // Challenging Q
        options: ['노랑', '초록', '파랑', '빨강'], // Options
        correctAnswer: '초록', // Answer is the COLOR green
        tip: '느리게 읽는 습관을 꾹 참고! 목표(색깔 보기!)에만 집중하는 연습이에요. 이렇게 딴생각 스위치를 꺼야 읽는 속도가 빨라져요!' // Strict Speed Tip
      }
  ];

  // Timer logic
  useEffect(() => {
    if (isLoading || timeLeft <= 0) return;
    const timerId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerId);
          handleFinishWarmup();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerId);
  }, [isLoading, timeLeft]);

  // Loading simulation
  useEffect(() => {
    const loadingTimer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(loadingTimer);
  }, []);

  // Effect for timed memory stimulus
  useEffect(() => {
    if (exercises[currentExercise]?.type === 'memory_capacity' && showMemoryStimulus) {
      const memoryTimer = setTimeout(() => {
        setShowMemoryStimulus(false);
      }, 3000);
      return () => clearTimeout(memoryTimer);
    }
  }, [currentExercise, showMemoryStimulus]);

  // Effect for Information Updating Stimulus Steps
  useEffect(() => {
    let timerId: NodeJS.Timeout | undefined;
    const maxSteps = 4; // Corresponds to [사과] -> [사과, 바나나] -> [바나나, 포도] -> [포도, 딸기]
    if (exercises[currentExercise]?.type === 'info_update' && stimulusStep < maxSteps) {
       timerId = setTimeout(() => {
         setStimulusStep(prevStep => prevStep + 1);
       }, 1500);
    }
    return () => clearTimeout(timerId);
  }, [currentExercise, stimulusStep]);

  // Reset memory stimulus visibility when exercise changes
  useEffect(() => {
      setShowMemoryStimulus(true);
      setStimulusStep(0);
      setShowTip(false);
      // Reset answer for the new exercise if needed, depends on desired UX
      // setUserAnswers(prev => ({ ...prev, [currentExercise]: undefined }));
  }, [currentExercise]);


  const handleAnswerSelect = (answer: string | string[]) => {
    setUserAnswers(prev => ({ ...prev, [currentExercise]: answer }));
    setShowTip(false); // Hide tip when an answer is selected
  };

  const handleNext = () => {
    setShowTip(false); // Hide tip when moving to next exercise
    if (currentExercise < exercises.length - 1) {
      setCurrentExercise(currentExercise + 1);
    } else {
      handleFinishWarmup();
    }
  };

  const handleFinishWarmup = useCallback(() => {
    if (!sessionId) return;
    router.push(`/ts/reading?sessionId=${sessionId}`);
  }, [sessionId, router]);

  const handleToggleTip = () => {
    setShowTip(prev => !prev);
  };

  const exercise = exercises[currentExercise];

  // Loading State UI
  if (isLoading || !exercise) { // Added !exercise check
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${cyberTheme.gradient} p-4`}>
        <Spinner size="lg" color="cyan" />
        <p className={`mt-4 ${cyberTheme.textMuted}`}>인지 시스템 활성화 준비 중...</p>
      </div>
    );
  }

  // Error State UI
  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${cyberTheme.gradient} p-4`}>
        <div className={`${cyberTheme.cardBg} rounded-xl shadow-lg p-5 max-w-md w-full border ${cyberTheme.errorBorder}`}>
          <h1 className={`text-xl font-bold ${cyberTheme.errorText} mb-3 flex items-center`}>
            <XCircleIcon className="h-6 w-6 mr-2" /> 오류 발생
          </h1>
          <p className={`mb-4 text-sm ${cyberTheme.textMuted}`}>{error || '훈련 데이터를 불러오는 데 실패했습니다.'}</p>
          <Button
            href="/ts"
            variant="outline"
            className={`w-full !text-sm !py-2 !border-red-500/50 !text-red-400 hover:!bg-red-900/30`}
          >
            <ArrowUturnLeftIcon className="h-4 w-4 mr-2" />
            루프 설정으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  // Main Warmup UI - Compacted Layout
  return (
    <div className={`min-h-screen ${cyberTheme.gradient} py-4 px-2 sm:px-4 ${cyberTheme.textLight}`}>
      <div className="container mx-auto max-w-lg"> {/* Reduced max-width */}

        {/* Header Section - Compact */}
        <div className={`${cyberTheme.cardBg} rounded-lg shadow-md p-3 mb-3 border ${cyberTheme.inputBorder} flex justify-between items-center`}>
            <h1 className={`text-base sm:text-lg font-bold ${cyberTheme.textLight} truncate pr-2`}>활성화: {currentExercise + 1}. {exercise.title}</h1>
            {/* Timer & Progress Section - Compact */}
            <div className={`flex items-center gap-3 p-2 rounded ${cyberTheme.inputBg} border ${cyberTheme.inputBorder} shadow-inner`}>
                {/* Timer */}
                <div className="flex items-center gap-1 text-center">
                    <ClockIcon className={`h-4 w-4 ${cyberTheme.primary}`} />
                    <div>
                        <div className={`text-sm font-mono font-bold ${cyberTheme.textLight}`}>{formatTime(timeLeft)}</div>
                    </div>
                </div>
                {/* Progress Bar */}
                <div className="w-16 sm:w-20">
                    <div className={`h-1.5 ${cyberTheme.progressBarBg} rounded-full overflow-hidden`}>
                        <div
                            className={`h-1.5 ${cyberTheme.progressFg} rounded-full transition-all duration-300 ease-in-out`}
                            style={{ width: `${((currentExercise + 1) / exercises.length) * 100}%` }}
                        ></div>
                    </div>
                    <div className={`mt-0.5 text-[10px] text-right ${cyberTheme.textMuted}`}>
                        {currentExercise + 1}/{exercises.length}
                    </div>
                </div>
            </div>
        </div>

        {/* Exercise Section - Compact */}
        <div className={`${cyberTheme.cardBg} rounded-lg shadow-md p-4 mb-3 border ${cyberTheme.inputBorder}`}>
           {/* Description - Kept short */}
           <p className={`text-xs sm:text-sm ${cyberTheme.textMuted} mb-3 leading-relaxed`}>{exercise.description}</p>

           {/* Exercise Content Box */}
           {/* Needs adjustment to render fruit sequence based on stimulusStep */}
           <div className={`${cyberTheme.inputBg} p-3 rounded border ${cyberTheme.inputBorder} mb-3 shadow-sm overflow-auto min-h-[60px] max-h-48 flex items-center justify-center`}>
              {/* Conditional rendering for info_update based on stimulusStep */} 
              {exercise.type === 'info_update' && (
                 <div className="text-center p-4">
                 {stimulusStep === 0 && <p className="font-mono text-xl font-bold ${cyberTheme.primary}">[사과]</p>}
                 {stimulusStep === 1 && <p className="font-mono text-xl font-bold ${cyberTheme.primary}">[사과, 바나나]</p>}
                 {stimulusStep === 2 && <p className="font-mono text-xl font-bold ${cyberTheme.primary}">[바나나, 포도]</p>}
                 {stimulusStep === 3 && <p className="font-mono text-xl font-bold ${cyberTheme.primary}">[포도, 딸기]</p>}
                 {stimulusStep >= 4 && <p className="text-sm ${cyberTheme.textMuted}">(과일 바구니 변화 완료)</p>}
                 </div>
              )}
              {/* Render other exercise types */}
              {exercise.type !== 'info_update' && (
                typeof exercise.content === 'string' ? (
                  <p className={`${cyberTheme.textLight} text-sm whitespace-pre-wrap break-words font-mono tracking-widest`}>{exercise.content}</p>
                ) : (
                  <div className={`${cyberTheme.textLight} text-sm w-full`}>{exercise.content}</div>
                )
              )}
           </div>

           <p className={`font-medium text-sm ${cyberTheme.textLight} mb-3`}>{exercise.question}</p>

           {/* Tip Section - Reduced margin */}
           {exercise.tip && (
              <div className="mb-4">
                <button
                  onClick={handleToggleTip}
                  className={`${cyberTheme.primary} hover:text-cyan-300 text-xs font-medium flex items-center transition-colors`}
                >
                  <LightBulbIcon className={`h-3.5 w-3.5 mr-1 ${cyberTheme.tipIcon}`} />
                  <span>{showTip ? '원리 숨기기' : '어떻게 속도가 빨라지나요?'}</span>
                </button>
                {showTip && (
                  <div className={`mt-1.5 p-2 ${cyberTheme.tipBg} border ${cyberTheme.tipBorder} rounded`}>
                    <p className={`text-xs ${cyberTheme.textLight}`}>{exercise.tip}</p>
                  </div>
                )}
              </div>
           )}

           {/* Answer Options - Horizontal Layout */}
           <div className="flex flex-wrap gap-2 mb-4">
             {/* Options mapping - disable logic needs adjustment for info_update */}
            {exercise.options?.map((option, index) => {
              const isSelected = userAnswers[currentExercise] === option;
              // Determine if options should be disabled for info_update task
              const isInfoUpdateTask = exercise.type === 'info_update';
              const isInfoUpdateComplete = stimulusStep >= 4; // Step count should match maxSteps
              const disableOptions = isInfoUpdateTask && !isInfoUpdateComplete;

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  className={`p-2 px-3 rounded text-left transition-all border flex items-center justify-center text-xs sm:text-sm flex-grow sm:flex-grow-0 ${
                    isSelected
                      ? `${cyberTheme.buttonPrimaryBg} text-white ${cyberTheme.borderPrimary} shadow-sm`
                      : `${cyberTheme.buttonSecondaryBg} ${cyberTheme.buttonSecondaryHoverBg} ${cyberTheme.textLight} ${cyberTheme.inputBorder}`
                  } ${disableOptions ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={disableOptions}
                >
                  <span>{option}</span>
                  {isSelected && <CheckCircleIcon className="h-4 w-4 text-white ml-2" />}
                </button>
              );
            })}
           </div>
        </div>

        {/* Navigation Buttons - Compact */}
        <div className="flex justify-between items-center pt-1">
           <Button
              type="button"
              onClick={handleFinishWarmup}
              variant="ghost"
              className={`!text-gray-500 hover:!text-gray-400 !text-xs !px-2 !py-1`}
           >
              <ArrowRightOnRectangleIcon className="h-3.5 w-3.5 mr-0.5" />
              건너뛰기
           </Button>
           <Button
              type="button"
              onClick={handleNext}
              disabled={!userAnswers[currentExercise] || isLoading || (exercise.type === 'info_update' && stimulusStep < 4)} // Use maxSteps
              loading={isLoading}
              className={`!px-4 !py-2 !rounded !text-xs sm:text-sm !font-medium flex items-center justify-center transition-colors ${
                !userAnswers[currentExercise] || (exercise.type === 'info_update' && stimulusStep < 4) // Use maxSteps
                ? `${cyberTheme.buttonDisabledBg} !text-gray-400 cursor-not-allowed opacity-50`
                : `${cyberTheme.buttonPrimaryBg} ${cyberTheme.buttonPrimaryHoverBg} text-white shadow-sm`
              }`}
           >
              <span>{currentExercise < exercises.length - 1 ? '다음 단계' : '루프 시작'}</span>
              <ChevronRightIcon className="h-4 w-4 ml-1" />
           </Button>
        </div>
      </div>
    </div>
  );
} 