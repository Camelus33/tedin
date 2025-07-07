'use client';

import React, { useState, useEffect } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import Button from '@/components/common/Button';
import { PdfMemoData } from '../pdf';
import { notes } from '@/lib/api';

// Cyber Theme Definition (TSReviewPage와 동일)
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

interface PdfMemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (memoData: PdfMemoData) => void;
  selectedText: string;
  pageNumber: number;
  bookId: string;
}

export default function PdfMemoModal({
  isOpen,
  onClose,
  onSave,
  selectedText,
  pageNumber,
  bookId
}: PdfMemoModalProps) {
  const [memoType, setMemoType] = useState<'quote' | 'thought' | 'question'>('quote');
  const [memoText, setMemoText] = useState('');
  const [keywords, setKeywords] = useState('');
  const [selfRating, setSelfRating] = useState<number>(3);
  const [maxRating, setMaxRating] = useState<number>(5);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 모달이 열릴 때 선택된 텍스트를 메모 필드에 자동 입력
  useEffect(() => {
    if (isOpen && selectedText) {
      setMemoText(selectedText);
    }
  }, [isOpen, selectedText]);

  // maxRating이 변경될 때 selfRating 조정
  useEffect(() => {
    if (selfRating > maxRating) {
      setSelfRating(Math.ceil(maxRating / 2));
    }
  }, [maxRating, selfRating]);

  // 모달 닫을 때 상태 초기화
  const handleClose = () => {
    setMemoType('quote');
    setMemoText('');
    setKeywords('');
    setSelfRating(3);
    setMaxRating(5);
    setError(null);
    onClose();
  };

  // 취소 버튼 전용 핸들러
  const handleCancel = () => {
    console.log('[PDF 메모] 취소 버튼 클릭');
    // 상태 즉시 초기화
    setMemoType('quote');
    setMemoText('');
    setKeywords('');
    setSelfRating(3);
    setMaxRating(5);
    setError(null);
    setIsLoading(false);
    // 모달 닫기
    onClose();
  };

  // 취소 버튼 이벤트 핸들러 (더 강력한 버전)
  const handleCancelClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('[PDF 메모] 취소 버튼 클릭 - 이벤트 핸들러');
    console.log('[PDF 메모] isLoading 상태:', isLoading);
    handleCancel();
  };

  // 백드롭 클릭 핸들러
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      console.log('[PDF 메모] 백드롭 클릭으로 모달 닫기');
      handleCancel();
    }
  };

  const handleSave = async () => {
    if (!memoText.trim()) {
      setError('메모 내용을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // PDF 메모 데이터 구성
      const pdfNoteData = {
        bookId,
        type: memoType,
        content: memoText.trim(),
        tags: keywords.split(',').map(tag => tag.trim()).filter(tag => tag),
        pageNumber,
        highlightedText: selectedText,
        selfRating,
        // highlightData는 나중에 하이라이트 좌표 정보가 필요할 때 추가
      };

      // API 호출
      const response = await notes.createPdf(pdfNoteData);
      
      console.log('[PDF 메모 저장] 성공:', response);

      // 성공 시 onSave 콜백 호출
      const memoData: PdfMemoData = {
        type: memoType,
        content: memoText.trim(),
        keywords: keywords.split(',').map(tag => tag.trim()).filter(tag => tag),
        selfRating,
        pageNumber,
        highlightedText: selectedText,
      };

      onSave(memoData);
      handleClose();
    } catch (error: any) {
      console.error('[PDF 메모 저장] 실패:', error);
      
      // 에러 메시지 처리
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.response?.data?.errors) {
        // validation 에러 처리
        const validationErrors = error.response.data.errors;
        setError(validationErrors.join(', '));
      } else {
        setError('메모 저장 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-slate-900 border border-purple-500/30 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-purple-300">PDF 메모 작성</h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        {/* 페이지 정보 */}
        <div className="mb-3 p-2 bg-slate-800 rounded-lg border border-purple-500/20">
          <p className="text-sm text-purple-300">페이지 {pageNumber}</p>
          <p className="text-xs text-gray-400 mt-1">하이라이트: "{selectedText.slice(0, 50)}..."</p>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-3 p-2 bg-red-900/30 border border-red-500/50 rounded-lg">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* 메모 성격 선택 */}
        <div className="mb-2">
          <label className="block text-sm font-medium text-purple-300 mb-2">
            메모 성격
          </label>
          <div className="flex gap-2">
            {[
              { value: 'quote', label: '인용', icon: '📖' },
              { value: 'thought', label: '생각', icon: '💭' },
              { value: 'question', label: '질문', icon: '❓' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setMemoType(option.value as any)}
                disabled={isLoading}
                className={`flex-1 p-2 rounded-lg border transition-all disabled:opacity-50 ${
                  memoType === option.value
                    ? 'bg-purple-600 border-purple-400 text-white'
                    : 'bg-slate-800 border-purple-500/30 text-gray-300 hover:border-purple-400'
                }`}
              >
                <div className="text-lg mb-1">{option.icon}</div>
                <div className="text-sm">{option.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 메모 내용 */}
        <div className="mb-2">
          <label className="block text-sm font-medium text-purple-300 mb-2">
            메모 내용
          </label>
          <textarea
            value={memoText}
            onChange={(e) => setMemoText(e.target.value)}
            disabled={isLoading}
            placeholder="하이라이트한 내용에 대한 메모를 작성해주세요..."
            className="w-full h-24 p-2 bg-slate-800 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none resize-none disabled:opacity-50"
          />
        </div>

        {/* 키워드 */}
        <div className="mb-2">
          <label className="block text-sm font-medium text-purple-300 mb-2">
            키워드 (쉼표로 구분)
          </label>
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            disabled={isLoading}
            placeholder="예: 개념, 중요, 핵심"
            className="w-full p-2 bg-slate-800 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none disabled:opacity-50"
          />
        </div>

        {/* 셀프 평가 */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-purple-300 mb-2">
            중요도 평가
          </label>

          {/* 별점 스케일 선택 */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-gray-400">별점 개수:</span>
            {[3, 5, 7, 10].map((scale) => (
              <button
                key={scale}
                onClick={() => setMaxRating(scale)}
                disabled={isLoading}
                className={`px-2 py-1 text-xs rounded transition-all disabled:opacity-50 ${
                  maxRating === scale
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                {scale}개
              </button>
            ))}
          </div>
          
          {/* 별점 선택 */}
          <div className="flex gap-1">
            {Array.from({ length: maxRating }, (_, i) => i + 1).map((rating) => (
              <button
                key={rating}
                onClick={() => setSelfRating(rating)}
                disabled={isLoading}
                className={`w-8 h-8 rounded transition-all disabled:opacity-50 ${
                  rating <= selfRating
                    ? 'text-yellow-400'
                    : 'text-gray-600 hover:text-yellow-400'
                }`}
              >
                ⭐
              </button>
            ))}
            <span className="ml-2 text-sm text-gray-400 self-center">
              {selfRating}/{maxRating}
            </span>
          </div>
        </div>

        {/* 버튼들 */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 bg-slate-700 text-gray-300 rounded-lg hover:bg-slate-600 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || !memoText.trim()}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                저장 중...
              </>
            ) : (
              '저장'
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 