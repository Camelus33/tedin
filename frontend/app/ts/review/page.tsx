'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/common/Button';

type SessionData = {
  _id: string;
  bookId: {
    _id: string;
    title: string;
    author: string;
    totalPages: number;
  };
  startPage: number;
  endPage: number;
  durationSec: number;
};

export default function TSReviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [reviewData, setReviewData] = useState({
    actualEndPage: 0,
    memo: '',
    summary: '',
    selfRating: 3,
  });
  
  const [timeLeft, setTimeLeft] = useState<number>(180); // 3 minutes for review
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Format seconds into MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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
        
        if (!data) {
          throw new Error('유효한 세션 데이터가 없습니다.');
        }
        
        // 백엔드에서 반환하는 구조에 맞게 사용
        setSessionData(data);
        setReviewData(prev => ({
          ...prev,
          actualEndPage: data.endPage || data.startPage || prev.actualEndPage,
        }));
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
    if (isLoading || timeLeft <= 0) {
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerId);
          // Auto-submit if time runs out
          handleSubmitReview();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [isLoading, timeLeft]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setReviewData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRatingChange = (rating: number) => {
    setReviewData(prev => ({
      ...prev,
      selfRating: rating,
    }));
  };

  const handleSubmitReview = async () => {
    if (isSubmitting || !sessionData) return;
    
    setIsSubmitting(true);

    try {
      // Calculate PPM (Pages Per Minute) with safety checks
      const pagesRead = Math.max(1, reviewData.actualEndPage - sessionData.startPage);
      const minutesSpent = Math.max(0.5, sessionData.durationSec / 60); // 최소 0.5분(30초)으로 설정
      const rawPpm = pagesRead / minutesSpent;
      
      // Ensure PPM is a valid number between 1-1000
      const ppm = isNaN(rawPpm) ? 1 : Math.min(1000, Math.max(1, rawPpm));

      // durationSec이 유효한 값인지 확인하고 최소 1초로 설정
      const validDurationSec = Math.max(1, sessionData.durationSec || 1);

      console.log('세션 완료 요청 데이터:', {
        actualEndPage: reviewData.actualEndPage,
        memo: reviewData.memo,
        summary10words: reviewData.summary.split(/\s+/).slice(0, 10).join(' '),
        selfRating: reviewData.selfRating,
        durationSec: validDurationSec,
        ppm,
      });

      const response = await fetch(`/api/sessions/${sessionId}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          actualEndPage: reviewData.actualEndPage,
          memo: reviewData.memo,
          summary10words: reviewData.summary.split(/\s+/).slice(0, 10).join(' '),
          selfRating: reviewData.selfRating,
          durationSec: validDurationSec,
          ppm,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('서버 응답 오류:', errorData);
        throw new Error(errorData.message || '리뷰 제출에 실패했습니다.');
      }

      // Navigate to results page
      router.push(`/ts/result?sessionId=${sessionId}`);
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto max-w-md">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-bold">독서 반추</h1>
            <div className="text-center">
              <div className="text-xl font-mono font-bold">{formatTime(timeLeft)}</div>
              <div className="text-xs text-gray-500">남은 시간</div>
            </div>
          </div>

          <div className="mb-4">
            <p className="font-medium">{sessionData.bookId.title}</p>
            <p className="text-sm text-gray-600">{sessionData.bookId.author}</p>
          </div>

          {/* Review Form */}
          <form className="space-y-4">
            <div>
              <label htmlFor="actualEndPage" className="block text-sm font-medium text-gray-700 mb-1">
                도달한 페이지
              </label>
              <input
                type="number"
                id="actualEndPage"
                name="actualEndPage"
                min={sessionData.startPage}
                max={sessionData.bookId.totalPages}
                value={reviewData.actualEndPage}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-gray-500 mt-1">실제로 읽은 마지막 페이지 번호를 입력하세요</p>
            </div>

            <div>
              <label htmlFor="memo" className="block text-sm font-medium text-gray-700 mb-1">
                한 줄 메모
              </label>
              <input
                type="text"
                id="memo"
                name="memo"
                value={reviewData.memo}
                onChange={handleChange}
                placeholder="가장 기억에 남는 내용이나 느낌을 한 줄로 적어보세요"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-1">
                10단어 요약
              </label>
              <textarea
                id="summary"
                name="summary"
                value={reviewData.summary}
                onChange={handleChange}
                placeholder="읽은 페이지를 다시 넘기며 10단어로 요약하세요."
                rows={2}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이해도 자가평가
              </label>
              <div className="flex justify-between">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => handleRatingChange(rating)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-lg transition-all ${
                      reviewData.selfRating === rating
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-indigo-100'
                    }`}
                  >
                    {rating}
                  </button>
                ))}
              </div>
              <div className="flex justify-between px-2 text-xs text-gray-500 mt-1">
                <span>낮음</span>
                <span>높음</span>
              </div>
            </div>

            <Button
              type="button"
              variant="default"
              fullWidth
              onClick={handleSubmitReview}
              disabled={isSubmitting}
            >
              {isSubmitting ? '제출 중...' : '반추 완료하기'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
} 