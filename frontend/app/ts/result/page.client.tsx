'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/common/Button';
import api from '@/lib/api';
import { ClientDateDisplay } from '@/components/share/ClientTimeDisplay';

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
        console.log('세션 결과 데이터:', sessionData); // 디버깅용 로그 추가
        
        // 백엔드에서 직접 세션 데이터를 반환하는 것으로 수정
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

  // Handle share action
  const handleShare = async () => {
    try {
      // Create share link and copy to clipboard
      const shareUrl = `${window.location.origin}/share/${sessionId}`;
      await navigator.clipboard.writeText(shareUrl);
      alert('공유 링크가 클립보드에 복사되었습니다!');
    } catch (err) {
      alert('링크 복사에 실패했습니다. 수동으로 URL을 복사해주세요.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <p>결과를 불러오는 중...</p>
      </div>
    );
  }

  if (error || !sessionResult) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50 p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
          <h1 className="text-xl font-bold text-red-600 mb-4">고치는 중</h1>
          <p className="mb-6">{error || '세션 결과를 찾고 있습니다.'}</p>
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

  // Calculate various metrics
  const totalPagesRead = sessionResult.actualEndPage - sessionResult.startPage;
  const readingTimeMinutes = Math.round(sessionResult.durationSec / 60);

  // sessionResult.bookId가 없는 경우 대비
  if (!sessionResult.bookId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50 p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
          <h1 className="text-xl font-bold text-red-600 mb-4">앗! 실수를 했어요!</h1>
          <p className="mb-6">세션 결과 데이터가 올바르지 않다고 나오네요.</p>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white sm:p-6">
      <div className="container mx-auto max-w-md">
        {/* Achievement Card */}
        <div className="bg-white sm:rounded-2xl shadow-xl overflow-hidden sm:mb-6 border-x-0 sm:border-x border-y border-gray-200 relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <pattern id="diagonalHatch" patternUnits="userSpaceOnUse" width="10" height="10" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="10" stroke="#000" strokeWidth="1" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#diagonalHatch)" />
            </svg>
          </div>
          
          {/* Achievement Border with Corners */}
          <div className="absolute inset-2 sm:inset-4 border-2 border-gray-200 sm:rounded-xl pointer-events-none"></div>
          <div className="absolute top-2 left-2 sm:top-4 sm:left-4 w-3 h-3 sm:w-4 sm:h-4 border-t-2 border-l-2 border-gray-300"></div>
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4 w-3 h-3 sm:w-4 sm:h-4 border-t-2 border-r-2 border-gray-300"></div>
          <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 w-3 h-3 sm:w-4 sm:h-4 border-b-2 border-l-2 border-gray-300"></div>
          <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 w-3 h-3 sm:w-4 sm:h-4 border-b-2 border-r-2 border-gray-300"></div>
          
          {/* Main content container */}
          <div className="relative z-10 p-1 sm:p-8 pt-6 sm:pt-12">
            {/* App Logo in top center */}
            <div className="absolute top-1 right-0 left-0 flex justify-center">
              <div className="px-2 py-0.5 sm:px-4 sm:py-1.5 bg-gradient-to-r from-gray-800 to-gray-700 rounded-full shadow-md">
                <span className="text-[10px] sm:text-sm font-semibold tracking-wider text-white">Habitus33</span>
              </div>
            </div>
            
            {/* Achievement Title */}
            <div className="text-center mb-1 mt-4 sm:mt-4">
              <h1 className="text-lg sm:text-2xl tracking-wider font-bold text-gray-800 uppercase">SPEED</h1>
            </div>
            
            {/* Achievement Label based on performance */}
            <div className="text-center mb-2 sm:mb-6 mt-3 sm:mt-4">
              <div className="inline-block px-2 py-0.5 sm:px-3 sm:py-1 bg-gradient-to-r from-amber-100 to-amber-50 rounded-full border border-amber-200">
                <span className="text-[10px] sm:text-sm font-semibold text-amber-800 uppercase tracking-wider">
                  {sessionResult.ppm > 2 ? 'Elite' : sessionResult.ppm > 1.5 ? 'Advanced' : 'Reader'}
                </span>
              </div>
            </div>
            
            {/* PPM Display - Featured Section */}
            <div className="relative mb-2 sm:mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl -z-10"></div>
              <div className="text-center py-2 sm:py-7 px-2 sm:px-4 border border-gray-200 rounded-xl">
                <div className="flex items-center justify-center overflow-hidden">
                  <span className="text-3xl sm:text-6xl lg:text-8xl font-extralight text-gray-800 leading-none">{sessionResult.ppm.toFixed(1)}</span>
                  <div className="flex flex-col items-start ml-1 sm:ml-2 mt-1 sm:mt-4 lg:mt-6 flex-shrink-0">
                    <span className="text-xs sm:text-sm text-gray-500 font-medium">PPM</span>
                  </div>
                </div>
                <div className="mt-1 sm:mt-2">
                  <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-300" 
                      style={{ width: `${Math.min((sessionResult.ppm / 5) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Book Info Section with Stylized Layout */}
            <div className="flex items-center gap-2 sm:gap-4 mb-2 sm:mb-8">
              {/* Book Cover with Enhanced Styling */}
              <div className="w-12 h-16 sm:w-16 sm:h-24 bg-gray-100 rounded-md flex-shrink-0 border border-gray-200 overflow-hidden shadow-sm transform -rotate-3">
                {sessionResult.bookId && typeof sessionResult.bookId === 'object' && sessionResult.bookId.coverImage ? (
                  <img 
                    src={sessionResult.bookId.coverImage} 
                    alt={sessionResult.bookId.title} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 sm:h-8 w-5 sm:w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                )}
              </div>
              
              {/* Book Details with Achievement Styling */}
              <div className="flex-1 border-b border-gray-200 pb-1 sm:pb-2 min-w-0">
                <h2 className="text-sm sm:text-lg font-semibold text-gray-800 break-words line-clamp-3 sm:line-clamp-2">
                  {sessionResult.bookId && typeof sessionResult.bookId === 'object' 
                    ? sessionResult.bookId.title 
                    : '알 수 없는 책'}
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1 truncate">
                  {sessionResult.bookId && typeof sessionResult.bookId === 'object' 
                    ? sessionResult.bookId.author 
                    : '작가미상'}
                </p>
              </div>
            </div>
            
            {/* Reading Stats in Trophy Style */}
            <div className="grid grid-cols-3 gap-1 sm:gap-4 mb-2 sm:mb-8">
              <div className="text-center border border-gray-200 rounded-lg py-1.5 px-0.5 sm:py-3 sm:px-2 bg-gray-50">
                <p className="text-base sm:text-xl font-semibold text-gray-800">{sessionResult.actualEndPage - sessionResult.startPage}</p>
                <p className="text-[10px] sm:text-xs text-gray-500">pages</p>
              </div>
              <div className="text-center border border-gray-200 rounded-lg py-1.5 px-0.5 sm:py-3 sm:px-2 bg-gray-50">
                <p className="text-base sm:text-xl font-semibold text-gray-800">{Math.floor(sessionResult.durationSec / 60)}:{(sessionResult.durationSec % 60).toString().padStart(2, '0')}</p>
                <p className="text-[10px] sm:text-xs text-gray-500">min</p>
              </div>
              <div className="text-center border border-gray-200 rounded-lg py-1.5 px-0.5 sm:py-3 sm:px-2 bg-gray-50">
                <p className="text-base sm:text-xl font-semibold text-gray-800">
                  <ClientDateDisplay createdAt={sessionResult?.createdAt} fallbackText="--/--" />
                </p>
                <p className="text-[10px] sm:text-xs text-gray-500">date</p>
              </div>
            </div>
            
            {/* Achievement Statement with Icon */}
            <div className="text-center mb-2 sm:mb-8">
              <div className="inline-flex items-center justify-center">
                <svg className="w-3 h-3 sm:w-5 sm:h-5 text-amber-500 mr-1 sm:mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                </svg>
                <span className="font-medium text-xs sm:text-sm text-gray-700">
                  {getPerformanceMessage(sessionResult.ppm)}
                </span>
              </div>
              {sessionResult.memo && (
                <div className="mt-1 sm:mt-3 bg-gray-50 p-2 sm:p-3 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600 italic line-clamp-3">"{sessionResult.memo}"</p>
                </div>
              )}
            </div>
            
            {/* Certificate Footer */}
            <div className="flex justify-between items-end pt-1 sm:pt-4">
              <div className="text-xs text-gray-500">
                <ClientDateDisplay createdAt={sessionResult?.createdAt} />
              </div>
              <div className="text-right">
                <div className="w-16 sm:w-24 h-0 border-b border-gray-400 mb-1"></div>
                <div className="text-right">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 inline-block text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Share Button - Instagram Style with Badge Icon */}
            <div className="mt-2 sm:mt-8">
              <button 
                onClick={handleShare}
                className="w-full flex items-center justify-center gap-1 sm:gap-2 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-medium py-2 sm:py-3.5 px-4 rounded-xl shadow-md transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 sm:h-5 w-4 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs sm:text-sm">Share</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-8">
          <Button 
            href="/dashboard" 
            variant="outline" 
            fullWidth
            className="text-xs"
          >
            대시보드
          </Button>
          <Button 
            href={sessionResult.bookId && typeof sessionResult.bookId === 'object' && sessionResult.bookId._id 
              ? `/books/${sessionResult.bookId._id}` 
              : '/books'}
            variant="outline" 
            fullWidth
            className="text-xs"
          >
            책 페이지로
          </Button>
          <Button 
            href={
              sessionResult && sessionResult.bookId && typeof sessionResult.bookId === 'object' && sessionResult.bookId._id
                ? `/ts?lastReadBookId=${sessionResult.bookId._id}`
                : "/ts"
            } 
            variant="outline" 
            fullWidth
            className="col-span-2 text-sm"
          >
            새 세션 시작
          </Button>
        </div>
      </div>
    </div>
  );
} 