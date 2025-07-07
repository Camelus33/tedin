'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/common/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { PauseIcon, PlayIcon, StopIcon, ExclamationTriangleIcon, DocumentIcon, XMarkIcon } from '@heroicons/react/24/solid';
import Spinner from '@/components/ui/Spinner';
import { cyberTheme } from '@/src/styles/theme';
import api from '@/lib/api';
import dynamic from 'next/dynamic';

// PDF 컴포넌트들을 동적 import로 변경 (SSR 방지)
const PdfViewer = dynamic(
  () => import('@/components/pdf').then(mod => ({ default: mod.PdfViewer })),
  { 
    ssr: false,
    loading: () => (
      <div className="bg-black/40 backdrop-blur-sm border border-purple-500/30 rounded-lg p-4">
        <div className="text-purple-400">PDF 뷰어 로딩 중...</div>
      </div>
    )
  }
);

const PdfMemoModal = dynamic(
  () => import('@/components/pdf').then(mod => ({ default: mod.PdfMemoModal })),
  { 
    ssr: false,
    loading: () => null
  }
);

// 타입 import는 런타임에 영향을 주지 않으므로 그대로 유지
import type { PdfMemoData } from '@/components/pdf';

type SessionData = {
  _id: string;
  bookId: {
    _id: string;
    title: string;
    author: string;
    hasLocalPdf?: boolean;
    pdfFileName?: string;
    pdfFileSize?: number;
  };
  startPage: number;
  endPage: number;
  durationSec: number;
  progressGradientStart: '#06b6d4';
  progressGradientMid: '#8b5cf6';
  progressGradientEnd: '#ec4899';
  isActive: boolean;
  isPaused: boolean;
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
  const [startTime, setStartTime] = useState<number | null>(null);
  
  // PDF 뷰어 상태
  const [showPdfViewer, setShowPdfViewer] = useState<boolean>(false);
  const [currentPdfPage, setCurrentPdfPage] = useState<number>(1);
  const [pdfError, setPdfError] = useState<string>('');

  // PDF 메모 모달 상태
  const [isMemoModalOpen, setIsMemoModalOpen] = useState<boolean>(false);
  const [selectedText, setSelectedText] = useState<string>('');
  const [selectedPageNumber, setSelectedPageNumber] = useState<number>(1);
  const [isPausedForMemo, setIsPausedForMemo] = useState<boolean>(false); // 메모 작성으로 인한 일시정지 구분

  // PDF 하이라이트 상태
  const [highlights, setHighlights] = useState<any[]>([]);
  const [selectedCoordinates, setSelectedCoordinates] = useState<DOMRect | null>(null);

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

  // Get timer status text
  const getTimerStatusText = () => {
    if (isPausedForMemo) {
      return '메모 작성 중...';
    }
    if (isPaused) {
      return '일시정지됨';
    }
    return '몰입하는 중...';
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
        console.log('Book 데이터:', data.bookId);
        console.log('hasLocalPdf 값:', data.bookId?.hasLocalPdf);
        
        // Validate session data exists
        if (!data) {
          throw new Error('유효한 세션 데이터가 없습니다.');
        }
        
        // 기본 시간 설정 (10분 = 600초)
        const defaultDuration = 600;
        // Adjust for legacy minutes values: if durationSec < 60, assume it's in minutes
        let incomingDuration = data.durationSec || defaultDuration;
        if (incomingDuration > 0 && incomingDuration < 60) {
          console.warn(`Adjusting legacy durationSec (${incomingDuration}) from minutes to seconds.`);
          incomingDuration = incomingDuration * 60;
        }
        const adjustedData = {
          ...data,
          durationSec: incomingDuration
        };
        
        setSessionData(adjustedData);
        setTimeRemaining(incomingDuration);
        setStartTime(Date.now());
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
    if (isLoading || isPaused || isPausedForMemo || timeRemaining <= 0 || !sessionData) {
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
  }, [isLoading, isPaused, isPausedForMemo, timeRemaining, sessionData, sessionId, router]);

  const handlePauseResume = () => {
    if (isMemoModalOpen) {
      // 메모 모달이 열려있을 때는 수동 일시정지/재개 비활성화
      return;
    }
    
    // 메모 작성 중이 아닌 경우에만 수동 일시정지/재개 허용
    if (!isPausedForMemo) {
      setIsPaused(!isPaused);
    }
  };

  const handleFinishEarly = () => {
    let elapsedSeconds = sessionData ? sessionData.durationSec - timeRemaining : 0;
    if (startTime) {
      const currentTime = Date.now();
      elapsedSeconds = Math.round((currentTime - startTime) / 1000);
    }
    const finalElapsedSeconds = Math.max(1, elapsedSeconds);
    router.push(`/ts/review?sessionId=${sessionId}&elapsed=${finalElapsedSeconds}`);
  };

  // PDF 뷰어 핸들러
  const handleTogglePdfViewer = () => {
    setShowPdfViewer(!showPdfViewer);
  };

  const handlePdfTextSelect = (selectedText: string, coordinates: DOMRect) => {
    console.log('[PDF 텍스트 선택]', selectedText, coordinates);
    
    setSelectedText(selectedText);
    setSelectedCoordinates(coordinates);
    setSelectedPageNumber(currentPdfPage);
    setIsMemoModalOpen(true);
    
    // 메모 작성 중 타이머 일시정지
    setIsPausedForMemo(true);
    if (sessionData?.isActive && !sessionData?.isPaused) {
      setSessionData(prev => prev ? { ...prev, isPaused: true } : null);
    }
  };

  const handlePdfError = (error: string) => {
    console.error('[PDF 에러]', error);
    setPdfError(error);
  };

  const handlePdfPageChange = (pageNumber: number) => {
    setCurrentPdfPage(pageNumber);
  };

  // PDF 메모 모달 핸들러
  const handleMemoModalClose = () => {
    setIsMemoModalOpen(false);
    setSelectedText('');
    setSelectedCoordinates(null);
    setIsPausedForMemo(false);
    
    // 메모 작성 완료 후 타이머 재개
    if (sessionData?.isActive) {
      setSessionData(prev => prev ? { ...prev, isPaused: false } : null);
    }
  };

  const handleMemoSave = (memoData: PdfMemoData) => {
    console.log('[PDF 메모 저장 완료]', memoData);
    
    // 하이라이트 생성
    if (selectedCoordinates && selectedText) {
      const newHighlight = {
        id: Date.now().toString(),
        text: selectedText,
        pageNumber: selectedPageNumber,
        boundingRect: selectedCoordinates,
        color: '#ffeb3b',
        opacity: 0.3,
        note: memoData.content,
        createdAt: new Date().toISOString(),
      };
      
      setHighlights(prev => [...prev, newHighlight]);
    }
    
    // 메모 작성 완료 - 모달 닫기 (handleMemoModalClose에서 타이머 재개 처리)
    handleMemoModalClose();
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${cyberTheme.gradient} p-4`}>
        <Spinner size="lg" color="cyan" />
        <p className={`mt-4 ${cyberTheme.textMuted}`}>준비 중입니다. 잠시만 기다려 주시겠어요?</p>
      </div>
    );
  }

  if (error || !sessionData) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${cyberTheme.gradient} p-4`}>
        <div className={`bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full border border-red-500/50`}>
          <h1 className="text-xl font-bold text-red-400 mb-4 flex items-center">
            <ExclamationTriangleIcon className="h-6 w-6 mr-2" /> 문제를 해결하고 있습니다.
          </h1>
          <p className={`mb-6 ${cyberTheme.textMuted}`}>{error || '세션 정보를 열심히 찾고 있습니다'}</p>
          <Button
            href="/ts"
            variant="outline"
            className={`w-full !border-red-500/50 !text-red-400 hover:!bg-red-900/30`}
          >
            TS 설정으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${cyberTheme.gradient} p-4 flex flex-col text-gray-200`}>
      <div className="container mx-auto max-w-2xl flex-1 flex flex-col">
        {/* Reading header - modern design with subtle shadow */}
        <div className={`${cyberTheme.cardBg} rounded-xl shadow-lg p-4 sm:p-6 mb-8 border ${cyberTheme.inputBorder}`}>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 overflow-hidden">
            <div className="flex-grow text-center sm:text-left min-w-0">
              <h1 className={`font-bold text-lg sm:text-xl ${cyberTheme.textLight} truncate`}>{sessionData.bookId.title}</h1>
              <p className={`text-sm ${cyberTheme.textMuted} mt-1 truncate`}>({sessionData.startPage} - {sessionData.endPage} 페이지)</p>
              <p className={`text-xs mt-2 ${cyberTheme.textMuted}`}>{getTimerStatusText()}</p>
            </div>
            
            <div className={`text-center p-3 rounded-lg border ${cyberTheme.inputBorder} bg-gray-900/50 shadow-inner min-w-[100px] sm:min-w-[140px] flex-shrink-0`}>
              <div 
                className={`text-3xl sm:text-4xl font-mono font-bold transition-colors ${ 
                  progressPercentage < 80 ? cyberTheme.textLight : 'text-red-400 animate-pulse' 
                }`}
              >
                {formatTime(timeRemaining)}
              </div>
              <div className={`text-xs mt-1 ${cyberTheme.textMuted}`}>남은 시간</div>
              
              <div className={`w-full ${cyberTheme.progressBarBg} rounded-full h-1.5 mt-2 overflow-hidden`}>
                <div 
                  className={`h-1.5 rounded-full transition-all duration-500 bg-gradient-to-r`}
                  style={{ 
                    width: `${progressPercentage}%`,
                    backgroundImage: `linear-gradient(to right, ${cyberTheme.progressGradientStart}, ${progressPercentage > 50 ? cyberTheme.progressGradientMid : cyberTheme.progressGradientStart}, ${progressPercentage > 80 ? cyberTheme.progressGradientEnd : cyberTheme.progressGradientMid})`
                  }}
                ></div>
              </div>
              <div className={`text-xs mt-1 ${cyberTheme.textMuted}`}>진행률: {Math.round(progressPercentage)}%</div>
            </div>
          </div>
        </div>

        {/* Main reading area - PDF viewer or breathing text */}
        <div className="flex-1 flex flex-col mb-10">
          {sessionData.bookId.hasLocalPdf ? (
            <div className="flex-1">
              {/* PDF 뷰어 토글 버튼 - PDF 뷰어가 활성화되지 않았을 때만 표시 */}
              {!showPdfViewer && (
                <div className="flex justify-center mb-4">
                  <button
                    onClick={handleTogglePdfViewer}
                    className="px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-all bg-gray-800/80 text-cyan-300 border border-cyan-500/40 hover:border-cyan-500/60 hover:bg-gray-700/80"
                  >
                    <DocumentIcon className="h-4 w-4" />
                    <span>PDF 보기</span>
                  </button>
                </div>
              )}

              {/* PDF 뷰어 또는 호흡 텍스트 */}
              {showPdfViewer ? (
                <div className="pdf-viewer-container relative">
                  {/* PDF 뷰어 닫기 버튼 */}
                  <div className="absolute -top-12 right-0 z-20">
                    <button
                      onClick={handleTogglePdfViewer}
                      className="px-3 py-1 rounded-lg bg-gray-900/90 text-gray-300 border border-gray-600 hover:bg-gray-800 hover:text-white transition-all text-sm"
                      title="PDF 닫기"
                    >
                      <XMarkIcon className="h-4 w-4 inline mr-1" />
                      <span>닫기</span>
                    </button>
                  </div>
                  
                  {pdfError ? (
                    <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6 text-center">
                      <p className="text-red-400 font-semibold mb-2">PDF 로드 오류</p>
                      <p className="text-red-300 text-sm">{pdfError}</p>
                    </div>
                  ) : (
                    <PdfViewer
                      bookId={sessionData.bookId._id}
                      onTextSelect={handlePdfTextSelect}
                      onError={handlePdfError}
                      currentPage={currentPdfPage}
                      onPageChange={handlePdfPageChange}
                      enableTextSelection={true}
                      highlights={highlights}
                      className="mx-auto max-w-4xl"
                    />
                  )}
                </div>
              ) : (
                <div className="flex-1 flex flex-col justify-center items-center">
                  <BreathingText />
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center items-center">
              <BreathingText />
            </div>
          )}
        </div>

        {/* Controls - styled buttons */}
        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-6 mb-6">
          <Button
            type="button"
            onClick={handlePauseResume}
            disabled={isMemoModalOpen || isPausedForMemo}
            variant="outline"
            className={`w-full sm:w-auto !px-6 !py-3 !rounded-xl !font-medium flex items-center justify-center transition-all !border-gray-600 ${ 
              isPaused 
                ? `!bg-emerald-600/80 !text-white !border-emerald-500 hover:!bg-emerald-700/80` 
                : `${cyberTheme.cardBg} ${cyberTheme.textLight} hover:!border-gray-500 hover:!text-white` 
            } ${(isMemoModalOpen || isPausedForMemo) ? '!opacity-50 !cursor-not-allowed' : ''}`}
          >
            {isPaused ? <PlayIcon className="h-5 w-5 mr-2" /> : <PauseIcon className="h-5 w-5 mr-2" />}
            {isPausedForMemo ? '메모 작성 중' : (isPaused ? '다시 시작' : '잠시 멈춤')}
          </Button>
          <Button
            type="button"
            onClick={handleFinishEarly}
            disabled={isMemoModalOpen}
            variant="outline"
            className={`w-full sm:w-auto !px-6 !py-3 !rounded-xl !font-medium flex items-center justify-center transition-all !border-red-500/50 ${cyberTheme.cardBg} !text-red-400 hover:!bg-red-900/30 hover:!border-red-600/50 ${isMemoModalOpen ? '!opacity-50 !cursor-not-allowed' : ''}`}
          >
            <StopIcon className="h-5 w-5 mr-2" />
            끝 (수동 종료)
          </Button>
        </div>
      </div>

      {/* PDF 메모 작성 모달 */}
      <PdfMemoModal
        isOpen={isMemoModalOpen}
        onClose={handleMemoModalClose}
        onSave={handleMemoSave}
        selectedText={selectedText}
        pageNumber={selectedPageNumber}
        bookId={sessionData?.bookId._id || ''}
      />
    </div>
  );
}

function BreathingText() {
  return (
    <motion.div
      className={`text-center mb-10 ${cyberTheme.textMuted}`}
      initial={{ opacity: 0.2, scale: 0.9 }}
      animate={{
        opacity: [0.2, 1, 0.2], // 흐려졌다가 뚜렷해지는 효과
        scale: [0.9, 1.05, 0.9], // 작아졌다가 커지는 효과
      }}
      transition={{
        duration: 4.5, // 더 천천히
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <div className="text-3xl sm:text-4xl font-bold leading-relaxed">
        코로 깊게 호흡하세요.
      </div>
      <div className="text-2xl sm:text-3xl font-medium mt-2">
        기억도 깊어집니다.
      </div>
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