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
                     <p className={`mb-2 text-sm ${cyberTheme.textMuted}`}>과일 바구니 변화 ({stimulusStep + 1}/4): [과일 표시 로직 필요]</p>
                 ) : (
                     <p className={`text-sm ${cyberTheme.textMuted}`}>(과일 바구니 변화 완료)</p>
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
                <p className={`mb-2 text-sm ${cyberTheme.textMuted}`}>3초 후 사라집니다! 주문을 외우세요:</p>
                <p className={`font-mono text-xl font-bold ${cyberTheme.primary}`}>아브라카다브라 알라카잠 수리수리 마수리</p> {/* Longer Stimulus */}
            </div>
        ) : (
            <div className={`text-center p-4 text-sm ${cyberTheme.textMuted}`}>(주문이 사라졌어요!)</div>
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
                <p className={`mb-2 text-sm ${cyberTheme.textMuted}`}>이 글자는 무슨 색깔로 쓰여 있나요?</p>
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
    // TODO: Send warmup results to backend
    // Example: await fetch('/api/ts/warmup-complete', { method: 'POST', body: JSON.stringify({ sessionId, answers: userAnswers, timeLeft }) });
    router.push(`/ts/reading?sessionId=${sessionId}`);
  }, [sessionId, router, userAnswers, timeLeft]); // Added userAnswers and timeLeft to dependencies

  const handleToggleTip = () => {
    setShowTip(prev => !prev);
  };

  const handleQuitWarmup = () => {
    // Consider adding a confirmation modal here
    router.push('/dashboard'); // Or a more appropriate exit point
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
            onClick={() => router.push('/dashboard')}
            variant="secondary"
            className={`w-full ${cyberTheme.buttonSecondaryBg} ${cyberTheme.buttonSecondaryHoverBg}`}
          >
            대시보드로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  // Main Exercise UI
  return (
    <div className={`min-h-screen flex flex-col ${cyberTheme.gradient} text-gray-100`}>
      {/* Header */}
      <header className={`p-4 ${cyberTheme.bgSecondary} shadow-md flex justify-between items-center`}>
        <h1 className={`text-xl font-bold ${cyberTheme.primary}`}>집중력 예열 ({currentExercise + 1}/{exercises.length})</h1>
        <div className="flex items-center">
          <ClockIcon className={`h-5 w-5 mr-2 ${cyberTheme.secondary}`} />
          <span className={`text-lg font-mono ${cyberTheme.textLight}`}>{formatTime(timeLeft)}</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className={`${cyberTheme.cardBg} rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-2xl border ${cyberTheme.borderPrimary}`}>
          
          {/* Progress Bar */}
          <div className={`w-full ${cyberTheme.progressBarBg} rounded-full h-2.5 mb-6`}>
            <div 
              className={`${cyberTheme.progressFg} h-2.5 rounded-full transition-all duration-300 ease-out`}
              style={{ width: `${((currentExercise + 1) / exercises.length) * 100}%` }}
            ></div>
          </div>

          <h2 className={`text-2xl font-semibold mb-3 ${cyberTheme.secondary}`}>{exercise.title}</h2>
          <p className={`${cyberTheme.textLight} mb-5 text-sm leading-relaxed`}>{exercise.description}</p>

          {/* Exercise Content */}
          <div className={`${cyberTheme.inputBg} p-4 rounded-lg mb-6 border ${cyberTheme.inputBorder} min-h-[120px] flex items-center justify-center`}>
            {typeof exercise.content === 'string' ? (
              <p className="text-center text-lg">{exercise.content}</p>
            ) : (
              exercise.content // Render ReactNode directly if it's not a string
            )}
          </div>
          
          <p className={`font-medium mb-3 ${cyberTheme.textLight}`}>{exercise.question}</p>

          {/* Options / Input */}
          <div className="space-y-3 mb-6">
            {exercise.options?.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                className={`w-full text-left p-3 rounded-md transition-colors duration-150
                  ${userAnswers[currentExercise] === option 
                    ? `${cyberTheme.buttonPrimaryBg} ${cyberTheme.textLight}` 
                    : `${cyberTheme.buttonSecondaryBg} ${cyberTheme.buttonSecondaryHoverBg} ${cyberTheme.textMuted}`
                  } 
                  border ${userAnswers[currentExercise] === option ? cyberTheme.borderPrimary : cyberTheme.inputBorder}
                  focus:outline-none focus:ring-2 ${cyberTheme.inputFocusRing}`}
              >
                {option}
              </button>
            ))}
            {/* Add input field for exercises requiring text input if needed */}
          </div>

          {/* Tip Section */}
          {exercise.tip && (
            <div className="mb-6">
              <button 
                onClick={handleToggleTip}
                className={`flex items-center text-sm ${cyberTheme.textMuted} ${cyberTheme.buttonSecondaryHoverBg} p-2 rounded-md`}
              >
                <LightBulbIcon className={`h-5 w-5 mr-2 ${showTip ? cyberTheme.tipIcon : cyberTheme.textMuted}`} />
                {showTip ? '도움말 숨기기' : '도움말 보기'}
              </button>
              {showTip && (
                <div className={`mt-2 p-3 rounded-md ${cyberTheme.tipBg} border ${cyberTheme.tipBorder}`}>
                  <p className={`text-xs ${cyberTheme.textLight}`}>{exercise.tip}</p>
                </div>
              )}
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleQuitWarmup}
              variant="secondary"
              className={`w-full sm:w-auto ${cyberTheme.buttonSecondaryBg} ${cyberTheme.buttonSecondaryHoverBg} ${cyberTheme.textMuted}`}
            >
              <ArrowUturnLeftIcon className="h-5 w-5 mr-2" />
              예열 중단
            </Button>
            <Button 
              onClick={handleNext}
              disabled={!userAnswers[currentExercise] && exercise.options && exercise.options.length > 0} // Disable if no answer for MCQs
              className={`w-full flex-grow ${!userAnswers[currentExercise] && exercise.options && exercise.options.length > 0 ? cyberTheme.buttonDisabledBg : cyberTheme.buttonPrimaryBg} ${cyberTheme.buttonPrimaryHoverBg}`}
            >
              {currentExercise === exercises.length - 1 ? '집중 독서 시작' : '다음 문제'}
              <ChevronRightIcon className="h-5 w-5 ml-2" />
            </Button>
          </div>

        </div>
      </main>

      {/* Footer (Optional - can be minimal) */}
      <footer className={`text-center p-3 text-xs ${cyberTheme.textMuted} ${cyberTheme.bgSecondary}/50`}>
        Habitus33 - 뇌 기능 최적화 시스템
      </footer>
    </div>
  );
} 