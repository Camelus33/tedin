'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/common/Button';
import api from '@/lib/api';
import { ClientDateDisplay } from '@/components/share/ClientTimeDisplay';
import { cyberTheme } from '@/src/styles/theme';

type SessionResult = {
  _id: string;
  bookId: {
    _id: string;
    title: string;
    author: string;
    coverImage?: string;
  };
  startPage: number;
  endPage: number;
  actualEndPage: number;
  durationSec: number;
  memo: string;
  summary10words: string;
  selfRating: number;
  ppm: number;
  createdAt: string;
};

type Badge = {
  _id: string;
  type: string;
  title: string;
  description: string;
};

export default function TSResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  
  const [sessionResult, setSessionResult] = useState<SessionResult | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Fetch session result and earned badges
  useEffect(() => {
    const fetchResults = async () => {
      if (!sessionId) {
        setError('세션 ID가 유효하지 않습니다.');
        setIsLoading(false);
        return;
      }

      try {
        // Fetch session data with results
        const sessionRes = await api.get(`/sessions/${sessionId}`);
        const sessionData = sessionRes.data;
        console.log('세션 결과 데이터:', sessionData);
        
        setSessionResult(sessionData);

        // Fetch badges earned from this session
        try {
          const badgesRes = await api.get(`/badges?sessionId=${sessionId}`);
          setBadges(badgesRes.data.badges || []);
        } catch {
          console.log('뱃지 정보를 가져오는데 실패했습니다.');
          setBadges([]);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [sessionId]);

  // Get a performance message based on PPM
  const getPerformanceMessage = (ppm: number) => {
    if (ppm > 2) return '집중력이 대단하시군요!';
    if (ppm > 1.5) return '평소보다 좋은 성과예요!';
    if (ppm > 1) return '멋진 파도를 만드셨어요!';
    return '첫 작은 성공을 축하드려요!';
  };

  // Get achievement level based on PPM
  const getAchievementLevel = (ppm: number) => {
    if (ppm > 2) return { level: 'Elite', color: 'from-purple-500 to-pink-500' };
    if (ppm > 1.5) return { level: 'Advanced', color: 'from-blue-500 to-purple-500' };
    return { level: 'Reader', color: 'from-green-500 to-blue-500' };
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${cyberTheme.gradient} p-4`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className={`${cyberTheme.textMuted}`}>결과를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !sessionResult) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${cyberTheme.gradient} p-4`}>
        <div className={`${cyberTheme.cardBg} rounded-xl shadow-2xl p-6 max-w-md w-full border ${cyberTheme.errorBorder}`}>
          <h1 className={`text-xl font-bold ${cyberTheme.errorText} mb-4`}>고치는 중</h1>
          <p className={`mb-6 ${cyberTheme.textMuted}`}>{error || '세션 결과를 찾고 있습니다.'}</p>
          <Button
            href="/ts"
            variant="outline"
            className={`w-full !border-red-500/50 !text-red-400 hover:!bg-red-900/30`}
          >
            돌아가기
          </Button>
        </div>
      </div>
    );
  }

  // sessionResult.bookId가 없는 경우 대비
  if (!sessionResult.bookId) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${cyberTheme.gradient} p-4`}>
        <div className={`${cyberTheme.cardBg} rounded-xl shadow-2xl p-6 max-w-md w-full border ${cyberTheme.errorBorder}`}>
          <h1 className={`text-xl font-bold ${cyberTheme.errorText} mb-4`}>앗! 실수를 했어요!</h1>
          <p className={`mb-6 ${cyberTheme.textMuted}`}>세션 결과 데이터가 올바르지 않다고 나오네요.</p>
          <Button
            href="/ts"
            variant="outline"
            className={`w-full !border-red-500/50 !text-red-400 hover:!bg-red-900/30`}
          >
            돌아가기
          </Button>
        </div>
      </div>
    );
  }

  const achievement = getAchievementLevel(sessionResult.ppm);

  return (
    <div className={`min-h-screen ${cyberTheme.gradient} p-4 sm:p-6`}>
      <div className="container mx-auto max-w-md">
        {/* Achievement Card - Cyber Theme Design */}
        <div className={`${cyberTheme.cardBg} rounded-2xl shadow-xl overflow-hidden mb-6 relative border ${cyberTheme.borderSecondary}/30`}>
          {/* Gradient Background */}
          <div className={`absolute inset-0 bg-gradient-to-br ${achievement.color} opacity-10`}></div>
          
          {/* Main content container */}
          <div className="relative z-10 p-6 sm:p-8">
            {/* App Logo */}
            <div className="text-center mb-6">
              <div className="inline-block px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-700 rounded-full shadow-md border border-gray-600">
                <span className="text-sm font-semibold tracking-wider text-white">My Reading</span>
              </div>
            </div>
            
            {/* Achievement Title */}
            <div className="text-center mb-4">
              <h1 className={`text-2xl sm:text-3xl tracking-wider font-bold ${cyberTheme.textLight} uppercase`}>Speed</h1>
            </div>
            
            {/* Achievement Level Badge */}
            <div className="text-center mb-6">
              <div className={`inline-block px-4 py-2 bg-gradient-to-r ${achievement.color} rounded-full shadow-md border border-gray-600`}>
                <span className="text-sm font-semibold text-white uppercase tracking-wider">
                  {achievement.level}
                </span>
              </div>
            </div>
            
            {/* PPM Display - Enhanced for Mobile */}
            <div className="relative mb-8">
              <div className={`${cyberTheme.inputBg} rounded-2xl p-6 border ${cyberTheme.inputBorder}`}>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <span className={`text-5xl sm:text-7xl lg:text-8xl font-extralight ${cyberTheme.textLight} leading-none`}>
                      {sessionResult.ppm.toFixed(1)}
                    </span>
                    <div className="flex flex-col items-start ml-2 sm:ml-3 mt-2 sm:mt-4 flex-shrink-0">
                      <span className={`text-sm sm:text-base ${cyberTheme.textMuted} font-medium`}>PPM</span>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className={`w-full ${cyberTheme.progressBarBg} h-2 rounded-full overflow-hidden`}>
                    <div 
                      className={`h-full ${cyberTheme.progressFg}`}
                      style={{ width: `${Math.min((sessionResult.ppm / 5) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Book Info Section - Improved Layout */}
            <div className="flex items-center gap-4 mb-8">
              {/* Book Cover */}
              <div className={`w-16 h-20 sm:w-20 sm:h-28 ${cyberTheme.inputBg} rounded-lg flex-shrink-0 border ${cyberTheme.inputBorder} overflow-hidden shadow-sm`}>
                {sessionResult.bookId && typeof sessionResult.bookId === 'object' && sessionResult.bookId.coverImage ? (
                  <img 
                    src={sessionResult.bookId.coverImage} 
                    alt={sessionResult.bookId.title} 
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center ${cyberTheme.inputBg}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${cyberTheme.textMuted}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                )}
              </div>
              
              {/* Book Details */}
              <div className="flex-1 min-w-0">
                <h2 className={`text-lg sm:text-xl font-semibold ${cyberTheme.textLight} break-words line-clamp-2 mb-1`}>
                  {sessionResult.bookId && typeof sessionResult.bookId === 'object' 
                    ? sessionResult.bookId.title 
                    : '알 수 없는 책'}
                </h2>
                <p className={`text-sm sm:text-base ${cyberTheme.textMuted} truncate`}>
                  {sessionResult.bookId && typeof sessionResult.bookId === 'object' 
                    ? sessionResult.bookId.author 
                    : '작가미상'}
                </p>
              </div>
            </div>
            
            {/* Reading Stats - Simplified Grid */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className={`text-center ${cyberTheme.inputBg} rounded-xl py-4 px-2 border ${cyberTheme.inputBorder}`}>
                <p className={`text-xl sm:text-2xl font-bold ${cyberTheme.textLight} mb-1`}>
                  {sessionResult.actualEndPage - sessionResult.startPage}
                </p>
                <p className={`text-xs sm:text-sm ${cyberTheme.textMuted}`}>page</p>
              </div>
              <div className={`text-center ${cyberTheme.inputBg} rounded-xl py-4 px-2 border ${cyberTheme.inputBorder}`}>
                <p className={`text-xl sm:text-2xl font-bold ${cyberTheme.textLight} mb-1`}>
                  {Math.floor(sessionResult.durationSec / 60)}:{(sessionResult.durationSec % 60).toString().padStart(2, '0')}
                </p>
                <p className={`text-xs sm:text-sm ${cyberTheme.textMuted}`}>min</p>
              </div>
              <div className={`text-center ${cyberTheme.inputBg} rounded-xl py-4 px-2 border ${cyberTheme.inputBorder}`}>
                <p className={`text-lg sm:text-xl font-bold ${cyberTheme.textLight} mb-1`}>
                  <ClientDateDisplay createdAt={sessionResult?.createdAt} fallbackText="--/--" />
                </p>
                <p className={`text-xs sm:text-sm ${cyberTheme.textMuted}`}>date</p>
              </div>
            </div>
            
            {/* Achievement Message */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center mb-3">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                </svg>
                <span className={`font-semibold text-sm sm:text-base ${cyberTheme.textLight}`}>
                  {getPerformanceMessage(sessionResult.ppm)}
                </span>
              </div>
              {sessionResult.memo && (
                <div className={`${cyberTheme.inputBg} p-4 rounded-xl border ${cyberTheme.inputBorder}`}>
                  <p className={`text-sm ${cyberTheme.textMuted} italic line-clamp-3`}>"{sessionResult.memo}"</p>
                </div>
              )}
            </div>
            
            {/* Certificate Footer - Simplified */}
            <div className={`flex justify-between items-center pt-4 border-t ${cyberTheme.inputBorder}`}>
              <div className={`text-xs ${cyberTheme.textMuted}`}>
                <ClientDateDisplay createdAt={sessionResult?.createdAt} />
              </div>
              <div className="text-right">
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 inline-block ${cyberTheme.textMuted}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* Action Buttons - Improved Layout */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Button 
              href="/dashboard" 
              variant="outline" 
              fullWidth
              className={`text-sm font-medium ${cyberTheme.buttonOutlineBorder} ${cyberTheme.buttonOutlineText} ${cyberTheme.buttonOutlineHoverBg}`}
            >
              대시보드
            </Button>
            <Button 
              href={sessionResult.bookId && typeof sessionResult.bookId === 'object' && sessionResult.bookId._id 
                ? `/books/${sessionResult.bookId._id}` 
                : '/books'}
              variant="outline" 
              fullWidth
              className={`text-sm font-medium ${cyberTheme.buttonOutlineBorder} ${cyberTheme.buttonOutlineText} ${cyberTheme.buttonOutlineHoverBg}`}
            >
              책 페이지로
            </Button>
          </div>
          <Button 
            href={
              sessionResult && sessionResult.bookId && typeof sessionResult.bookId === 'object' && sessionResult.bookId._id
                ? `/ts?lastReadBookId=${sessionResult.bookId._id}`
                : "/ts"
            } 
            variant="default" 
            fullWidth
            className={`text-base font-semibold ${cyberTheme.buttonPrimaryBg} ${cyberTheme.buttonPrimaryHoverBg} text-white`}
          >
            새 세션 시작
          </Button>
        </div>
      </div>
    </div>
  );
} 