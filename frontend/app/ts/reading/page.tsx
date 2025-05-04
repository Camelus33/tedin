'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/common/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { PauseIcon, PlayIcon, StopIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import Spinner from '@/components/ui/Spinner';

type SessionData = {
  _id: string;
  bookId: {
    _id: string;
    title: string;
    author: string;
  };
  startPage: number;
  endPage: number;
  durationSec: number;
};

// 테마 색상 정의 (일관성 유지)
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
  progressBarBg: 'bg-gray-700', // 진행률 바 배경
  progressGradientStart: '#06b6d4', // cyan-500
  progressGradientMid: '#8b5cf6', // purple-500
  progressGradientEnd: '#ec4899', // pink-500 (경고)
};

export default function TSReadingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Format seconds into MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const progressPercentage = sessionData 
    ? ((sessionData.durationSec - timeRemaining) / sessionData.durationSec) * 100 
    : 0;

  // Fetch session data
  useEffect(() => {
    const fetchSessionData = async () => {
      if (!sessionId) {
        setError('세션 ID가 유효하지 않습니다.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/sessions/${sessionId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error('세션 정보를 불러오는 데 실패했습니다.');
        }

        const data = await response.json();
        console.log('세션 데이터 로드:', data);
        
        // durationSec이 없거나 0인 경우 기본값(10분) 사용
        if (!data) {
          throw new Error('유효한 세션 데이터가 없습니다.');
        }
        
        // 기본 시간 설정 (10분 = 600초)
        const defaultDuration = 600;
        const sessionData = {
          ...data,
          durationSec: data.durationSec || defaultDuration
        };
        
        setSessionData(sessionData);
        setTimeRemaining(sessionData.durationSec);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessionData();
  }, [sessionId]);

  // Timer logic
  useEffect(() => {
    // Don't start timer if loading, paused, or no time remaining
    if (isLoading || isPaused || timeRemaining <= 0 || !sessionData) {
      return;
    }

    const timerId = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerId);
          // Automatically go to review page when timer ends
          router.push(`/ts/review?sessionId=${sessionId}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [isLoading, isPaused, timeRemaining, sessionData, sessionId, router]);

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  const handleFinishEarly = () => {
    router.push(`/ts/review?sessionId=${sessionId}`);
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${cyberTheme.gradient} p-4`}>
        <Spinner size="lg" color="cyan" />
        <p className={`mt-4 ${cyberTheme.textMuted}`}>피드백 루프 실행 준비 중...</p>
      </div>
    );
  }

  if (error || !sessionData) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${cyberTheme.gradient} p-4`}>
        <div className={`bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full border border-red-500/50`}>
          <h1 className="text-xl font-bold text-red-400 mb-4 flex items-center">
            <ExclamationTriangleIcon className="h-6 w-6 mr-2" /> 오류 발생
          </h1>
          <p className={`mb-6 ${cyberTheme.textMuted}`}>{error || '세션 정보를 찾을 수 없습니다.'}</p>
          <Button
            href="/ts"
            variant="outline"
            className={`w-full !border-red-500/50 !text-red-400 hover:!bg-red-900/30`}
          >
            루프 설정으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${cyberTheme.gradient} p-4 flex flex-col text-gray-200`}>
      <div className="container mx-auto max-w-xl flex-1 flex flex-col">
        {/* Reading header - modern design with subtle shadow */}
        <div className={`${cyberTheme.cardBg} rounded-xl shadow-lg p-6 mb-8 border ${cyberTheme.inputBorder}`}>
          <div className="flex justify-between items-start gap-4">
            <div>
              <h1 className={`font-bold text-xl ${cyberTheme.textLight}`}>{sessionData.bookId.title}</h1>
              <p className={`text-sm ${cyberTheme.textMuted} mt-1`}>({sessionData.startPage} - {sessionData.endPage} 페이지)</p>
              <p className={`text-xs mt-2 ${cyberTheme.textMuted}`}>작업 기억 처리 중...</p>
            </div>
            
            <div className={`text-center p-3 rounded-lg border ${cyberTheme.inputBorder} bg-gray-900/50 shadow-inner min-w-[120px]`}>
              <div 
                className={`text-3xl font-mono font-bold transition-colors ${ 
                  progressPercentage < 80 ? cyberTheme.textLight : 'text-red-400 animate-pulse' 
                }`}
              >
                {formatTime(timeRemaining)}
              </div>
              <div className={`text-xs mt-1 ${cyberTheme.textMuted}`}>루프 잔여 시간</div>
              
              <div className={`w-full ${cyberTheme.progressBarBg} rounded-full h-1.5 mt-2 overflow-hidden`}>
                <div 
                  className={`h-1.5 rounded-full transition-all duration-500 bg-gradient-to-r`}
                  style={{ 
                    width: `${progressPercentage}%`,
                    backgroundImage: `linear-gradient(to right, ${cyberTheme.progressGradientStart}, ${progressPercentage > 50 ? cyberTheme.progressGradientMid : cyberTheme.progressGradientStart}, ${progressPercentage > 80 ? cyberTheme.progressGradientEnd : cyberTheme.progressGradientMid})`
                  }}
                ></div>
              </div>
              <div className={`text-xs mt-1 ${cyberTheme.textMuted}`}>처리 진행률: {Math.round(progressPercentage)}%</div>
            </div>
          </div>
        </div>

        {/* Main reading area - stylish and minimal */}
        <div className="flex-1 flex flex-col justify-center items-center mb-10">
          <BreathingText />
        </div>

        {/* Controls - styled buttons */}
        <div className="flex justify-center space-x-6 mb-6">
          <Button
            type="button"
            onClick={handlePauseResume}
            variant="outline"
            className={`!px-6 !py-3 !rounded-xl !font-medium flex items-center transition-all !border-gray-600 ${ 
              isPaused 
                ? `!bg-emerald-600/80 !text-white !border-emerald-500 hover:!bg-emerald-700/80` 
                : `${cyberTheme.cardBg} ${cyberTheme.textLight} hover:!border-gray-500 hover:!text-white` 
            }`}
          >
            {isPaused ? <PlayIcon className="h-5 w-5 mr-2" /> : <PauseIcon className="h-5 w-5 mr-2" />}
            {isPaused ? '루프 재개' : '루프 일시정지'}
          </Button>
          <Button
            type="button"
            onClick={handleFinishEarly}
            variant="outline"
            className={`!px-6 !py-3 !rounded-xl !font-medium flex items-center transition-all !border-red-500/50 ${cyberTheme.cardBg} !text-red-400 hover:!bg-red-900/30 hover:!border-red-600/50`}
          >
            <StopIcon className="h-5 w-5 mr-2" />
            처리 완료 (수동 종료)
          </Button>
        </div>
      </div>
    </div>
  );
}

function BreathingText() {
  return (
    <motion.div
      className={`text-5xl font-bold mb-10 ${cyberTheme.textMuted}`}
      initial={{ opacity: 0.3 }}
      animate={{
        opacity: [0.3, 0.8, 0.3], // 숨쉬는 효과
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      코로 깊게 호흡하세요.
    </motion.div>
  );
}

// Copyright notice at bottom left
function CopyrightNotice() {
  return (
    <div
      style={{ position: 'fixed', left: 8, bottom: 8, zIndex: 30, pointerEvents: 'none' }}
      className="text-[10px] text-gray-300 select-none opacity-70"
    >
      본 페이지의 모든 콘텐츠는 저작권법에 의해 보호되며  무단 복제, 배포를 원칙적으로 금합니다
    </div>
  );
} 