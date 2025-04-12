'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/common/Button';

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
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <p>세션 정보 로딩 중...</p>
      </div>
    );
  }

  if (error || !sessionData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50 p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
          <h1 className="text-xl font-bold text-red-600 mb-4">오류 발생</h1>
          <p className="mb-6">{error || '세션 정보를 찾을 수 없습니다.'}</p>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 flex flex-col">
      <div className="container mx-auto max-w-md flex-1 flex flex-col">
        {/* Reading header - modern design with subtle shadow */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-6 border border-white/50 transition-all">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="font-bold text-xl text-slate-800">{sessionData.bookId.title}</h1>
              <p className="text-sm text-slate-500 mt-1">{sessionData.startPage} - {sessionData.endPage} 페이지</p>
            </div>
            {/* Timer with dynamic color based on time remaining */}
            <div className={`text-center p-3 rounded-xl border shadow-inner transition-all ${
              progressPercentage < 33
                ? "bg-gradient-to-r from-indigo-100 to-blue-100 border-indigo-200/50"
                : progressPercentage < 66
                  ? "bg-gradient-to-r from-blue-100 to-amber-100 border-blue-200/50"
                  : progressPercentage < 80
                    ? "bg-gradient-to-r from-amber-100 to-orange-100 border-amber-200/50"
                    : "bg-gradient-to-r from-orange-100 to-red-100 border-orange-200/50"
            } ${
              // Pulse animation when time is running low (less than 20% remaining)
              progressPercentage > 80 ? "animate-pulse" : ""
            }`}>
              <div 
                className={`text-3xl font-mono font-bold transition-colors ${
                  progressPercentage < 33
                    ? "bg-gradient-to-br from-indigo-700 to-blue-700 bg-clip-text text-transparent"
                    : progressPercentage < 66
                      ? "bg-gradient-to-br from-blue-700 to-amber-600 bg-clip-text text-transparent"
                      : progressPercentage < 80
                        ? "bg-gradient-to-br from-amber-600 to-orange-600 bg-clip-text text-transparent"
                        : "bg-gradient-to-br from-orange-600 to-red-600 bg-clip-text text-transparent"
                }`}
              >
                {formatTime(timeRemaining)}
                {/* Add warning indicators when time is running low */}
                {progressPercentage > 80 && (
                  <span className="ml-2 inline-flex items-center text-sm animate-bounce text-red-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500 mt-1">남은 시간</div>
            </div>
          </div>
        </div>

        {/* Main reading area - stylish and minimal */}
        <div className="flex-1 flex flex-col justify-center items-center mb-8">
          <div className="text-center mb-16">
            <p className="text-lg text-slate-500 font-light italic">집중해서 읽으세요...</p>
          </div>
          
          {/* Progress bar - animated gradient with changing color based on progress */}
          <div className="w-full bg-gray-100 rounded-full h-3 mb-4 shadow-inner overflow-hidden">
            {/* Dynamic color based on progress */}
            <div 
              className={`h-3 rounded-full transition-all duration-500 relative`}
              style={{ 
                width: `${progressPercentage}%`,
                background: progressPercentage < 33 
                  ? 'linear-gradient(to right, #3b82f6, #4f46e5)' // Blue to indigo (start)
                  : progressPercentage < 66 
                    ? 'linear-gradient(to right, #4f46e5, #f59e0b)' // Indigo to amber (middle)
                    : 'linear-gradient(to right, #f59e0b, #ef4444)' // Amber to red (end)
              }}
            >
              {progressPercentage > 5 && (
                <div className={`absolute inset-0 ${
                  progressPercentage > 80 
                    ? "bg-white/30 animate-pulse" 
                    : "bg-white/20 animate-pulse"
                }`}></div>
              )}
            </div>
          </div>
          <p className={`text-sm font-medium mb-16 ${
            progressPercentage < 80 
              ? "text-slate-500" 
              : "text-red-500 font-bold"
          }`}>
            진행률: {Math.round(progressPercentage)}%
            {progressPercentage > 80 && (
              <span className="ml-2 text-red-500 animate-pulse">마무리할 시간입니다!</span>
            )}
          </p>
          
          {/* Controls - styled buttons */}
          <div className="flex space-x-6">
            <button
              type="button"
              onClick={handlePauseResume}
              className={`px-5 py-3 rounded-xl font-medium transition-all duration-300 flex items-center ${
                isPaused 
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-200 hover:shadow-emerald-300 hover:-translate-y-0.5"
                  : "bg-white text-slate-600 border border-slate-200 shadow hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5"
              }`}
            >
              {isPaused ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  </svg>
                  재개하기
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  일시정지
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleFinishEarly}
              className="px-5 py-3 bg-white/80 text-slate-500 rounded-xl border border-slate-200 font-medium transition-all hover:bg-white hover:text-slate-700 hover:shadow-md hover:-translate-y-0.5 duration-300 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              독서 종료
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 