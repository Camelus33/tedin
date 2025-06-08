'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/common/Button';
import Spinner from '@/components/ui/Spinner';
import { StarIcon } from '@heroicons/react/24/solid';
import { ClockIcon, ExclamationTriangleIcon, ArrowUturnLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import api from '@/lib/api';

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
  errorText: 'text-red-400',
  errorBorder: 'border-red-500/50',
  ratingActive: 'text-yellow-400',
  ratingInactive: 'text-gray-600',
};

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
  const elapsedSecondsFromReading = searchParams.get('elapsed');
  
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [reviewData, setReviewData] = useState({
    actualEndPage: 0,
    memo: '',
    summary: '',
    selfRating: 3,
    memoType: 'thought'
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
        const res = await api.get(`/sessions/${sessionId}`);
        const data = res.data;
        console.log('세션 데이터 로드:', data);
        
        if (!data) {
          throw new Error('유효한 세션 데이터가 없습니다.');
        }
        
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
      const pagesRead = Math.max(1, reviewData.actualEndPage - sessionData.startPage);
      
      let actualDurationSec = sessionData.durationSec;
      if (elapsedSecondsFromReading) {
        const parsedElapsed = parseInt(elapsedSecondsFromReading, 10);
        if (!isNaN(parsedElapsed) && parsedElapsed > 0) {
          actualDurationSec = parsedElapsed;
        }
      }
      actualDurationSec = Math.max(1, actualDurationSec || 1);

      const minutesSpent = Math.max(0.5, actualDurationSec / 60);
      const rawPpm = pagesRead / minutesSpent;
      const ppm = isNaN(rawPpm) ? 1 : Math.min(1000, Math.max(1, rawPpm));

      console.log('세션 완료 요청 데이터:', {
        actualEndPage: reviewData.actualEndPage,
        memo: reviewData.memo,
        summary10words: reviewData.summary.split(/\s+/).slice(0, 10).join(' '),
        selfRating: reviewData.selfRating,
        durationSec: actualDurationSec,
        ppm,
        memoType: reviewData.memoType
      });
      await api.put(`/sessions/${sessionId}/complete`, {
          actualEndPage: reviewData.actualEndPage,
          memo: reviewData.memo,
          summary10words: reviewData.summary.split(/\s+/).slice(0, 10).join(' '),
          selfRating: reviewData.selfRating,
          durationSec: actualDurationSec,
          ppm,
          memoType: reviewData.memoType
      });

      // Navigate to results page
      router.push(`/ts/result?sessionId=${sessionId}`);
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${cyberTheme.gradient} p-4`}>
        <Spinner size="lg" color="cyan" />
        <p className={`mt-4 ${cyberTheme.textMuted}`}>읽은 기록을 불러오고 있어요...</p>
      </div>
    );
  }

  if (error || !sessionData) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${cyberTheme.gradient} p-4`}>
        <div className={`${cyberTheme.cardBg} rounded-xl shadow-2xl p-6 max-w-md w-full border ${cyberTheme.errorBorder}`}>
          <h1 className={`text-xl font-bold ${cyberTheme.errorText} mb-4 flex items-center`}>
            <ExclamationTriangleIcon className="h-6 w-6 mr-2" /> 오류 발생
          </h1>
          <p className={`mb-6 ${cyberTheme.textMuted}`}>{error || '세션 정보를 가져올 수 없습니다.'}</p>
          <Button
            href="/ts"
            variant="outline"
            className={`w-full !border-red-500/50 !text-red-400 hover:!bg-red-900/30`}
          >
            <ArrowUturnLeftIcon className="h-5 w-5 mr-2" />
            TS 설정으로
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${cyberTheme.gradient} p-6 md:p-10 ${cyberTheme.textLight}`}>
      <div className={`max-w-2xl mx-auto ${cyberTheme.bgSecondary} ${cyberTheme.cardBg} rounded-xl shadow-2xl p-6 md:p-8 border ${cyberTheme.inputBorder}`}>
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-xl md:text-2xl font-bold ${cyberTheme.textLight}`}>다시 떠올려 보세요</h1>
          <div className={`flex items-center gap-2 p-2 rounded-lg border ${cyberTheme.inputBorder} ${cyberTheme.inputBg} shadow-inner`}>
            <ClockIcon className={`h-5 w-5 ${cyberTheme.secondary}`} />
            <div>
              <div className={`text-lg font-mono font-bold ${timeLeft < 30 ? 'text-red-400 animate-pulse' : cyberTheme.textLight}`}>
                {formatTime(timeLeft)}
              </div>
              <div className={`text-xs ${cyberTheme.textMuted}`}>떠올리는 시간</div>
            </div>
          </div>
        </div>

        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSubmitReview(); }}>
          <div>
            <label htmlFor="actualEndPage" className={`block text-sm font-medium mb-1 ${cyberTheme.textMuted}`}>마지막 읽은 페이지 번호</label>
            <input
              type="number"
              id="actualEndPage"
              name="actualEndPage"
              value={reviewData.actualEndPage}
              onChange={handleChange}
              min={sessionData.startPage}
              max={sessionData.bookId.totalPages}
              className={`w-full p-3 rounded-lg border ${cyberTheme.inputBorder} ${cyberTheme.inputBg} ${cyberTheme.textLight} focus:outline-none ${cyberTheme.inputFocusRing} ${cyberTheme.inputFocusBorder}`}
              required
            />
            <p className={`text-xs mt-1 ${cyberTheme.textMuted}`}>목표: {sessionData.startPage}쪽 ~ {sessionData.endPage}쪽</p>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1.5 ${cyberTheme.textMuted}`}>1줄 메모 성격 선택</label>
            <div className="flex space-x-2">
              {[
                { id: 'thought', label: '생각' },
                { id: 'quote', label: '인용' },
                { id: 'question', label: '질문' },
              ].map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setReviewData(prev => ({ ...prev, memoType: type.id }))}
                  className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all border
                    ${reviewData.memoType === type.id
                      ? `${cyberTheme.borderPrimary} ${cyberTheme.buttonPrimaryBg} text-white shadow-md` 
                      : `${cyberTheme.inputBorder} ${cyberTheme.buttonSecondaryBg} ${cyberTheme.textLight} hover:border-cyan-400 hover:bg-gray-700`}
                  `}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="memo" className={`block text-sm font-medium mb-1 ${cyberTheme.textMuted}`}>1줄 메모</label>
            <textarea
              id="memo"
              name="memo"
              rows={3}
              value={reviewData.memo}
              onChange={handleChange}
              placeholder="인상깊은 문장 혹은 떠오른 생각을 있으셨나요?"
              className={`w-full p-3 rounded-lg border ${cyberTheme.inputBorder} ${cyberTheme.inputBg} ${cyberTheme.textLight} focus:outline-none ${cyberTheme.inputFocusRing} ${cyberTheme.inputFocusBorder} text-sm`}
            />
          </div>

          <div>
            <label htmlFor="summary" className={`block text-sm font-medium mb-1 ${cyberTheme.textMuted}`}>키워드를 부탁드려도 될까요?</label>
            <input
              type="text"
              id="summary"
              name="summary"
              value={reviewData.summary}
              onChange={handleChange}
              placeholder="10단어 이내로 부탁드려요"
              className={`w-full p-3 rounded-lg border ${cyberTheme.inputBorder} ${cyberTheme.inputBg} ${cyberTheme.textLight} focus:outline-none ${cyberTheme.inputFocusRing} ${cyberTheme.inputFocusBorder} text-sm`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${cyberTheme.textMuted}`}>셀프 칭찬</label>
            <p className={`text-xs mb-2 ${cyberTheme.textMuted}`}>스스로에게 후한 점수를 주세요.</p>
            <div className="flex space-x-1 justify-center">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => handleRatingChange(rating)}
                  className={`p-2 rounded-full transition-colors ${
                    reviewData.selfRating >= rating ? `${cyberTheme.ratingActive}` : `${cyberTheme.ratingInactive} hover:text-yellow-600`
                  }`}
                >
                  <StarIcon className="h-6 w-6" />
                </button>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t ${cyberTheme.inputBorder}">
            <Button
              type="submit"
              disabled={isLoading || isSubmitting}
              loading={isSubmitting}
              className="w-full !py-3 !text-base flex items-center justify-center !bg-gradient-to-r !from-cyan-500 !to-blue-600 hover:!from-cyan-600 hover:!to-blue-700 disabled:!opacity-50 disabled:!cursor-not-allowed text-white font-medium rounded-lg shadow-md transition-all"
            >
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              완료 & 결과 보기
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 