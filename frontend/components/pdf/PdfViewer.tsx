"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { FiZoomIn, FiZoomOut, FiRotateCw, FiChevronLeft, FiChevronRight, FiLoader, FiEdit3 } from 'react-icons/fi';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { PdfHighlight, HIGHLIGHT_COLORS } from '@/types/pdf';
import { createHighlight } from '@/lib/pdfHighlightUtils';
import PdfHighlightOverlay from './PdfHighlightOverlay';

// PDF.js worker 설정 - 더 안정적인 CDN 사용
if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
  // 여러 CDN을 시도하는 fallback 로직
  const tryWorkerSources = [
    `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`,
    `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`,
    `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`
  ];
  
  // 첫 번째 CDN을 기본으로 설정
  pdfjs.GlobalWorkerOptions.workerSrc = tryWorkerSources[0];
}

interface PdfViewerProps {
  pdfUrl: string;
  onTextSelect?: (selectedText: string, coordinates: DOMRect) => void;
  onError?: (error: string) => void;
  className?: string;
  enableTextSelection?: boolean;
  currentPage?: number;
  onPageChange?: (pageNumber: number) => void;
  // 하이라이트 관련 props
  highlights?: PdfHighlight[];
  onHighlightCreate?: (highlight: PdfHighlight) => void;
  onHighlightClick?: (highlight: PdfHighlight) => void;
  onHighlightEdit?: (highlight: PdfHighlight) => void;
  onHighlightDelete?: (highlightId: string) => void;
  enableHighlighting?: boolean;
}

interface PdfViewerState {
  numPages: number | null;
  pageNumber: number;
  scale: number;
  rotation: number;
  isLoading: boolean;
  error: string | null;
  highlightMode: boolean;
}

export default function PdfViewer({
  pdfUrl,
  onTextSelect,
  onError,
  className = "",
  enableTextSelection = true,
  currentPage = 1,
  onPageChange,
  highlights = [],
  onHighlightCreate,
  onHighlightClick,
  onHighlightEdit,
  onHighlightDelete,
  enableHighlighting = true
}: PdfViewerProps) {
  const [state, setState] = useState<PdfViewerState>({
    numPages: null,
    pageNumber: currentPage,
    scale: 1.0,
    rotation: 0,
    isLoading: true,
    error: null,
    highlightMode: false
  });

  const pageRef = useRef<HTMLDivElement>(null);
  const documentRef = useRef<HTMLDivElement>(null);

  // PDF 문서 로드 성공 핸들러
  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setState(prev => ({
      ...prev,
      numPages,
      isLoading: false,
      error: null
    }));
  }, []);

  // PDF 문서 로드 실패 핸들러
  const onDocumentLoadError = useCallback((error: Error) => {
    const errorMessage = 'PDF 파일을 불러오는 데 실패했습니다.';
    setState(prev => ({
      ...prev,
      isLoading: false,
      error: errorMessage
    }));
    onError?.(errorMessage);
    console.error('PDF 로드 오류:', error);
  }, [onError]);

  // 페이지 변경 핸들러
  const changePage = useCallback((offset: number) => {
    setState(prev => {
      if (!prev.numPages) return prev;
      
      const newPageNumber = Math.max(1, Math.min(prev.numPages, prev.pageNumber + offset));
      onPageChange?.(newPageNumber);
      
      return {
        ...prev,
        pageNumber: newPageNumber
      };
    });
  }, [onPageChange]);

  // 줌 조정 핸들러
  const adjustScale = useCallback((scaleDelta: number) => {
    setState(prev => ({
      ...prev,
      scale: Math.max(0.5, Math.min(3.0, prev.scale + scaleDelta))
    }));
  }, []);

  // 회전 핸들러
  const rotate = useCallback(() => {
    setState(prev => ({
      ...prev,
      rotation: (prev.rotation + 90) % 360
    }));
  }, []);

  // 텍스트 선택 핸들러
  const handleTextSelection = useCallback(() => {
    if (!enableTextSelection || !pageRef.current) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const selectedText = selection.toString().trim();
    if (!selectedText) return;

    // 선택된 텍스트의 좌표 계산
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    // 하이라이트 모드가 활성화되어 있으면 하이라이트 생성
    if (state.highlightMode && enableHighlighting && onHighlightCreate) {
      const highlight = createHighlight(selectedText, state.pageNumber, rect);
      onHighlightCreate(highlight);
      
      // 선택 해제
      selection.removeAllRanges();
    } else {
      // 일반 텍스트 선택 콜백 호출
      onTextSelect?.(selectedText, rect);
    }
  }, [enableTextSelection, onTextSelect, state.highlightMode, state.pageNumber, enableHighlighting, onHighlightCreate]);

  // 하이라이트 모드 토글
  const toggleHighlightMode = useCallback(() => {
    setState(prev => ({
      ...prev,
      highlightMode: !prev.highlightMode
    }));
  }, []);

  // 하이라이트 클릭 핸들러
  const handleHighlightClick = useCallback((highlight: PdfHighlight) => {
    onHighlightClick?.(highlight);
  }, [onHighlightClick]);

  // 하이라이트 편집 핸들러
  const handleHighlightEdit = useCallback((highlight: PdfHighlight) => {
    onHighlightEdit?.(highlight);
  }, [onHighlightEdit]);

  // 하이라이트 삭제 핸들러
  const handleHighlightDelete = useCallback((highlightId: string) => {
    onHighlightDelete?.(highlightId);
  }, [onHighlightDelete]);

  // 외부에서 currentPage prop이 변경될 때 내부 상태 업데이트
  useEffect(() => {
    setState(prev => ({
      ...prev,
      pageNumber: currentPage
    }));
  }, [currentPage]);

  // 텍스트 선택 이벤트 리스너 등록
  useEffect(() => {
    if (!enableTextSelection) return;

    const handleMouseUp = () => {
      setTimeout(handleTextSelection, 10); // 선택이 완료된 후 실행
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchend', handleMouseUp);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [enableTextSelection, handleTextSelection]);

  if (state.error) {
    return (
      <div className={`pdf-viewer-error flex flex-col items-center justify-center p-8 bg-red-900/20 border border-red-500/30 rounded-xl ${className}`}>
        <div className="text-red-400 text-center">
          <p className="text-lg font-semibold mb-2">PDF 로드 오류</p>
          <p className="text-sm">{state.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`pdf-viewer ${className}`}>
      {/* PDF 뷰어 컨트롤 */}
      <div className="pdf-controls bg-gray-800/80 backdrop-blur-md border border-cyan-500/40 rounded-t-xl p-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* 페이지 네비게이션 */}
          <button
            onClick={() => changePage(-1)}
            disabled={state.pageNumber <= 1}
            className="p-2 bg-cyan-600/20 hover:bg-cyan-600/40 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            title="이전 페이지"
          >
            <FiChevronLeft size={16} className="text-cyan-300" />
          </button>
          
          <span className="text-cyan-300 text-sm font-mono px-2">
            {state.pageNumber} / {state.numPages || '?'}
          </span>
          
          <button
            onClick={() => changePage(1)}
            disabled={!state.numPages || state.pageNumber >= state.numPages}
            className="p-2 bg-cyan-600/20 hover:bg-cyan-600/40 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            title="다음 페이지"
          >
            <FiChevronRight size={16} className="text-cyan-300" />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {/* 줌 컨트롤 */}
          <button
            onClick={() => adjustScale(-0.2)}
            className="p-2 bg-purple-600/20 hover:bg-purple-600/40 rounded-lg transition-colors"
            title="축소"
          >
            <FiZoomOut size={16} className="text-purple-300" />
          </button>
          
          <span className="text-purple-300 text-sm font-mono px-2">
            {Math.round(state.scale * 100)}%
          </span>
          
          <button
            onClick={() => adjustScale(0.2)}
            className="p-2 bg-purple-600/20 hover:bg-purple-600/40 rounded-lg transition-colors"
            title="확대"
          >
            <FiZoomIn size={16} className="text-purple-300" />
          </button>

          {/* 회전 컨트롤 */}
          <button
            onClick={rotate}
            className="p-2 bg-emerald-600/20 hover:bg-emerald-600/40 rounded-lg transition-colors"
            title="90도 회전"
          >
            <FiRotateCw size={16} className="text-emerald-300" />
          </button>

          {/* 하이라이트 모드 토글 */}
          {enableHighlighting && (
            <button
              onClick={toggleHighlightMode}
              className={`p-2 rounded-lg transition-colors ${
                state.highlightMode
                  ? 'bg-yellow-600/40 hover:bg-yellow-600/60'
                  : 'bg-yellow-600/20 hover:bg-yellow-600/40'
              }`}
              title={state.highlightMode ? '하이라이트 모드 비활성화' : '하이라이트 모드 활성화'}
            >
              <FiEdit3 size={16} className={state.highlightMode ? 'text-yellow-200' : 'text-yellow-300'} />
            </button>
          )}
        </div>
      </div>

      {/* PDF 문서 영역 */}
      <div 
        ref={documentRef}
        className="pdf-document bg-gray-900/60 border-x border-b border-cyan-500/40 rounded-b-xl overflow-auto"
        style={{ height: '600px' }}
      >
        {state.isLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center space-y-3">
              <FiLoader className="animate-spin text-cyan-400" size={32} />
              <p className="text-cyan-300 text-sm">PDF 로딩 중...</p>
            </div>
          </div>
        )}

        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading=""
          className="flex justify-center p-4"
        >
          <div ref={pageRef} className="pdf-page-container relative">
            <Page
              pageNumber={state.pageNumber}
              scale={state.scale}
              rotate={state.rotation}
              renderTextLayer={enableTextSelection}
              renderAnnotationLayer={false}
              className="shadow-lg"
            />
            
            {/* 하이라이트 오버레이 */}
            {enableHighlighting && highlights.length > 0 && (
              <PdfHighlightOverlay
                highlights={highlights}
                pageNumber={state.pageNumber}
                scale={state.scale}
                containerRef={pageRef}
                onHighlightClick={handleHighlightClick}
                onHighlightEdit={handleHighlightEdit}
                onHighlightDelete={handleHighlightDelete}
              />
            )}
          </div>
        </Document>
      </div>

      {/* 텍스트 선택 안내 */}
      {enableTextSelection && (
        <div className="pdf-help bg-gray-800/60 border border-cyan-500/20 rounded-lg p-2 mt-2">
          <p className="text-xs text-cyan-400 text-center">
            {state.highlightMode 
              ? '🎨 하이라이트 모드: 텍스트를 선택하면 자동으로 하이라이트됩니다'
              : '💡 텍스트를 선택하여 하이라이트하고 메모를 추가할 수 있습니다'
            }
          </p>
        </div>
      )}
    </div>
  );
} 