"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { FiZoomIn, FiZoomOut, FiRotateCw, FiChevronLeft, FiChevronRight, FiLoader, FiEdit3 } from 'react-icons/fi';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { PdfHighlight, HIGHLIGHT_COLORS } from '@/types/pdf';
import { 
  domRectToPdfCoordinates,
  createHighlightWithPdfCoords,
  createHighlight
} from '@/lib/pdfHighlightUtils';
import PdfHighlightOverlay from './PdfHighlightOverlay';
import { loadPdfFromLocal } from '../../lib/localPdfStorage';

// PDF.js worker 설정 - static asset 사용
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface PdfViewerProps {
  bookId: string;
  onTextSelect?: (selectedText: string, coordinates: DOMRect, pageNumber: number) => void;
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
  /**
   * 부모 레이아웃에 맞춘 문서 컨테이너 높이. 기본값은 90vh.
   * 모달 내부에서는 '100%'를 권장합니다.
   */
  containerHeight?: string;
}

interface PdfViewerState {
  numPages: number | null;
  pageNumber: number;
  scale: number;
  rotation: number;
  isLoading: boolean;
  error: string | null;
  highlightMode: boolean;
  pdfData: ArrayBuffer | null;
  visiblePages: Set<number>;
  pageHeights: Map<number, number>; // 실제 페이지 높이 저장
}

function PdfViewerComponent({
  bookId,
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
  enableHighlighting = true,
  containerHeight = '90vh'
}: PdfViewerProps) {
  const [state, setState] = useState<PdfViewerState>({
    numPages: null,
    pageNumber: currentPage,
    scale: 1.2,
    rotation: 0,
    isLoading: true,
    error: null,
    highlightMode: false,
    pdfData: null,
    visiblePages: new Set([1]),
    pageHeights: new Map()
  });

  const pageRef = useRef<HTMLDivElement>(null);
  const documentRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  // === 가로 리사이즈 상태 및 핸들러 ===
  const MIN_WIDTH = 400;
  const DEFAULT_WIDTH = typeof window !== 'undefined' ? Math.min(window.innerWidth * 0.6, 800) : 600;
  const [viewerWidth, setViewerWidth] = useState<number>(DEFAULT_WIDTH);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(DEFAULT_WIDTH);

  // 윈도우 리사이즈 시 최대 폭 재검증
  useEffect(() => {
    const handleResize = () => {
      setViewerWidth(prev => Math.min(prev, window.innerWidth - 100));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const onDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    startXRef.current = e.clientX;
    startWidthRef.current = viewerWidth;
    document.addEventListener('mousemove', onDragging);
    document.addEventListener('mouseup', onDragEnd);
  };

  const onDragging = (e: MouseEvent) => {
    const delta = e.clientX - startXRef.current;
    let newWidth = startWidthRef.current + delta;
    const max = window.innerWidth - 100;
    if (newWidth < MIN_WIDTH) newWidth = MIN_WIDTH;
    if (newWidth > max) newWidth = max;
    setViewerWidth(newWidth);
  };

  const onDragEnd = () => {
    document.removeEventListener('mousemove', onDragging);
    document.removeEventListener('mouseup', onDragEnd);
  };

  // 로컬에서 PDF 로드
  useEffect(() => {
    const loadPdf = async () => {
      if (!bookId) {
        console.error('PDF 뷰어: bookId가 제공되지 않았습니다.');
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Book ID가 제공되지 않았습니다.'
        }));
        return;
      }

      console.log('PDF 뷰어: 로딩 시작 - bookId:', bookId);
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        console.log('PDF 뷰어: 로컬에서 PDF 로드 시작:', bookId);
        const pdfData = await loadPdfFromLocal(bookId);
        
        if (!pdfData) {
          console.error('PDF 뷰어: 로컬에서 PDF 파일을 찾을 수 없습니다:', bookId);
          throw new Error('로컬에서 PDF 파일을 찾을 수 없습니다. PDF를 다시 업로드해주세요.');
        }

        console.log('PDF 뷰어: PDF 데이터 로드 완료, 크기:', pdfData.byteLength, 'bytes');
        setState(prev => ({
          ...prev,
          pdfData,
          isLoading: false,
          error: null
        }));

        console.log('PDF 뷰어: PDF 로컬 로드 완료');
      } catch (error) {
        console.error('PDF 뷰어: PDF 로컬 로드 실패:', error);
        const errorMessage = error instanceof Error ? error.message : 'PDF를 로드하는데 실패했습니다.';
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
          pdfData: null
        }));
        onError?.(errorMessage);
      }
    };

    loadPdf();
  }, [bookId]);

  // PDF 문서 로드 성공 핸들러
  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    console.log('PDF 뷰어: 문서 로드 성공, 총 페이지 수:', numPages);
    setState(prev => ({
      ...prev,
      numPages,
      isLoading: false,
      error: null,
      // 연속 스크롤에서는 처음 몇 페이지를 초기에 로드
      visiblePages: new Set(Array.from({ length: Math.min(3, numPages) }, (_, i) => i + 1)),
      pageHeights: new Map() // 페이지 높이 맵 초기화
    }));
  }, []);

  // 페이지 렌더링 완료 후 높이 측정
  const onPageLoadSuccess = useCallback((pageNumber: number) => {
    // 페이지 렌더링 완료 후 실제 높이 측정
    setTimeout(() => {
      const pageElement = pageRefs.current[pageNumber - 1];
      if (pageElement) {
        const actualHeight = pageElement.getBoundingClientRect().height;
        setState(prev => ({
          ...prev,
          pageHeights: new Map(prev.pageHeights).set(pageNumber, actualHeight)
        }));
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`PDF 뷰어: 페이지 ${pageNumber} 높이 측정 완료: ${actualHeight}px`);
        }
      }
    }, 100); // 렌더링 완료를 위한 짧은 지연
  }, []);

  // PDF 문서 로드 실패 핸들러
  const onDocumentLoadError = useCallback((error: Error) => {
    console.error('PDF 뷰어: 문서 로드 실패:', error);
    const errorMessage = `PDF 파일을 불러오는 데 실패했습니다: ${error.message}`;
    setState(prev => ({
      ...prev,
      isLoading: false,
      error: errorMessage
    }));
    onError?.(errorMessage);
  }, [onError]);

  // 페이지 변경 핸들러 (연속 스크롤에서는 사용하지 않지만 호환성을 위해 유지)
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
    setState(prev => {
      const newScale = Math.max(0.5, Math.min(3.0, prev.scale + scaleDelta));
      
      // 개발 환경에서 줌 변경 로깅
      if (process.env.NODE_ENV === 'development') {
        console.log(`PDF 뷰어: 줌 변경 ${prev.scale.toFixed(1)} → ${newScale.toFixed(1)}`);
      }
      
      return {
        ...prev,
        scale: newScale
      };
    });
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
    if (!enableTextSelection) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const selectedText = selection.toString().trim();
    if (!selectedText) return;

    // 선택된 텍스트의 좌표 계산
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    // 선택된 텍스트가 어느 페이지에 있는지 확인
    let selectedPageNumber = state.pageNumber; // 기본값은 현재 페이지
    
    // 선택 영역이 포함된 페이지 컨테이너 찾기
    const commonAncestor = range.commonAncestorContainer;
    let pageContainer = commonAncestor.nodeType === Node.ELEMENT_NODE 
      ? commonAncestor as Element 
      : commonAncestor.parentElement;
    
    while (pageContainer && !pageContainer.hasAttribute('data-page-number')) {
      pageContainer = pageContainer.parentElement;
    }
    
    if (pageContainer) {
      const pageNum = parseInt(pageContainer.getAttribute('data-page-number') || '1');
      selectedPageNumber = pageNum;
    }
    
    // 하이라이트 모드가 활성화되어 있으면 하이라이트 생성
    if (state.highlightMode && enableHighlighting && onHighlightCreate) {
      // 페이지 요소가 존재하면 PDF 네이티브 좌표 계산
      let highlight;
      if (pageContainer instanceof HTMLElement) {
        const pdfCoords = domRectToPdfCoordinates(rect, pageContainer, state.scale);
        highlight = createHighlightWithPdfCoords(
          selectedText,
          selectedPageNumber,
          rect,
          pdfCoords
        );
      } else {
        // Fallback (레거시)
        highlight = createHighlight(selectedText, selectedPageNumber, rect);
      }
      onHighlightCreate(highlight);
      
      // 선택 해제
      selection.removeAllRanges();
    } else {
      // 일반 텍스트 선택 콜백 호출
      onTextSelect?.(selectedText, rect, selectedPageNumber);
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

  // IntersectionObserver를 사용한 페이지 가시성 추적
  useEffect(() => {
    if (!state.numPages) return;

    // throttled observer 콜백으로 성능 최적화
    const handleIntersection = throttle((entries: IntersectionObserverEntry[]) => {
      const visiblePageNumbers = new Set<number>();
      let mostVisiblePage = state.pageNumber;
      let maxIntersectionRatio = 0;

      entries.forEach((entry) => {
        const pageNumber = parseInt(entry.target.getAttribute('data-page-number') || '1');
        
        // 50% 이상 보이는 경우에만 가시 페이지로 간주 (안정성 향상)
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          visiblePageNumbers.add(pageNumber);
          
          // 가장 많이 보이는 페이지를 현재 페이지로 설정
          if (entry.intersectionRatio > maxIntersectionRatio) {
            maxIntersectionRatio = entry.intersectionRatio;
            mostVisiblePage = pageNumber;
          }
        }
        
        // 조금이라도 보이는 페이지는 미리 로딩 (성능 최적화)
        if (entry.isIntersecting && entry.intersectionRatio > 0.1) {
          const preloadRange = 1; // 앞뒤 1페이지씩만 미리 로딩 (메모리 절약)
          for (let i = Math.max(1, pageNumber - preloadRange); 
               i <= Math.min(state.numPages || pageNumber, pageNumber + preloadRange); 
               i++) {
            visiblePageNumbers.add(i);
          }
        }
      });

      // 현재 페이지가 실제로 변경된 경우에만 상태 업데이트
      setState(prev => {
        if (prev.pageNumber !== mostVisiblePage || 
            prev.visiblePages.size !== visiblePageNumbers.size ||
            ![...prev.visiblePages].every(page => visiblePageNumbers.has(page))) {
          return {
            ...prev,
            visiblePages: visiblePageNumbers,
            pageNumber: mostVisiblePage
          };
        }
        return prev;
      });

      // 성능 모니터링 로깅 (개발 환경에서만)
      if (process.env.NODE_ENV === 'development') {
        console.log(`PDF 뷰어: 로드된 페이지 수: ${visiblePageNumbers.size}, 현재 페이지: ${mostVisiblePage}, 보이는 페이지: [${Array.from(visiblePageNumbers).sort().join(', ')}]`);
      }

      // 현재 페이지 변경 콜백 호출 (실제 변경된 경우에만)
      if (mostVisiblePage !== state.pageNumber) {
        onPageChange?.(mostVisiblePage);
      }
    }, 150); // 150ms throttle로 성능 최적화

    const observer = new IntersectionObserver(
      handleIntersection,
      {
        root: documentRef.current,
        rootMargin: '100px 0px', // 위아래 100px로 줄여서 정확성 향상
        threshold: [0.1, 0.5, 0.9] // threshold 단순화로 계산 부하 감소
      }
    );

    // 모든 페이지 요소를 관찰
    pageRefs.current.forEach((pageElement) => {
      if (pageElement) {
        observer.observe(pageElement);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [state.numPages, onPageChange]);

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

  // 키보드 단축키 등록
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // PDF 문서 영역에 포커스가 있을 때만 작동
      if (!documentRef.current?.contains(document.activeElement)) return;
      
      switch (e.key) {
        case '+':
        case '=':
          e.preventDefault();
          adjustScale(0.2);
          break;
        case '-':
          e.preventDefault();
          adjustScale(-0.2);
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          rotate();
          break;
        case 'h':
        case 'H':
          if (enableHighlighting) {
            e.preventDefault();
            toggleHighlightMode();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [adjustScale, rotate, toggleHighlightMode, enableHighlighting]);

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
      <div className="w-full">
        <div className={`pdf-viewer ${className}`}>
        {/* PDF 뷰어 컨트롤 */}
         <div
           className="pdf-controls bg-gray-800/80 backdrop-blur-md border border-cyan-500/40 rounded-t-xl p-3 flex items-center justify-between mx-auto"
           style={{ width: `${viewerWidth}px` }}
         >
          <div className="flex items-center space-x-2">
            {/* 현재 페이지 정보 (네비게이션 버튼 제거) */}
            <span className="text-cyan-300 text-sm font-mono px-2">
              {state.pageNumber} / {state.numPages || '?'}
            </span>
            <span className="text-cyan-400/60 text-xs">
              연속 스크롤 모드
            </span>
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

        {/* PDF 문서 영역 - 오른쪽 경계선 드래그로 폭 조절 가능 */}
        <div 
          ref={documentRef}
          className="pdf-document bg-gray-900/60 border-x border-b border-cyan-500/40 rounded-b-xl overflow-auto resize-x mx-auto"
          style={{ 
            height: containerHeight,
            maxHeight: '1200px', 
            width: `${viewerWidth}px`,
            minWidth: `${MIN_WIDTH}px`,
            maxWidth: 'calc(100vw - 50px)', // 화면 너비에서 여백 제외
            scrollBehavior: 'smooth', // 부드러운 스크롤 추가
            // 스크롤 성능 최적화
            overflowAnchor: 'none', // 스크롤 앵커링 비활성화로 점프 방지
            scrollbarGutter: 'stable' // 스크롤바 공간 안정화
          }}
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
            file={state.pdfData}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading=""
            className="flex flex-col items-center justify-center p-4 gap-4 w-full"
          >
            {/* 모든 페이지를 세로로 렌더링 */}
            {state.numPages && Array.from({ length: state.numPages }, (_, index) => {
              const pageNumber = index + 1;
              const isVisible = state.visiblePages.has(pageNumber);
              
              return (
                <div
                  key={pageNumber}
                  ref={(el) => {
                    pageRefs.current[index] = el;
                  }}
                  data-page-number={pageNumber}
                  className="pdf-page-container relative"
                >
                  {/* 성능 최적화: 보이는 페이지만 렌더링, 나머지는 placeholder */}
                  {isVisible ? (
                    <>
                      <Page
                        pageNumber={pageNumber}
                        scale={state.scale}
                        rotate={state.rotation}
                        renderTextLayer={enableTextSelection}
                        renderAnnotationLayer={false}
                        className="shadow-lg"
                        onLoadSuccess={() => onPageLoadSuccess(pageNumber)}
                      />
                      
                      {/* 하이라이트 오버레이 */}
                      {enableHighlighting && highlights.length > 0 && pageRefs.current[index] && (
                        <PdfHighlightOverlay
                          highlights={highlights}
                          pageNumber={pageNumber}
                          scale={state.scale}
                          containerRef={{ current: pageRefs.current[index]! }}
                          onHighlightClick={handleHighlightClick}
                          onHighlightEdit={handleHighlightEdit}
                          onHighlightDelete={handleHighlightDelete}
                        />
                      )}
                    </>
                  ) : (
                    /* 페이지 placeholder - 실제 PDF 페이지 크기 근사치 */
                    <div 
                      className="bg-gray-800/40 border border-gray-600/30 rounded flex items-center justify-center shadow-lg transition-opacity duration-300"
                      style={{ 
                        width: `${595 * state.scale}px`, // PDF 기본 width (A4: 595pt)
                        height: state.pageHeights.has(pageNumber) 
                          ? `${state.pageHeights.get(pageNumber)}px` // 실제 측정된 높이 사용
                          : `${842 * state.scale}px`, // 기본 높이 (A4: 842pt)
                        minHeight: '400px' // 최소 높이 보장
                      }}
                    >
                      <div className="text-gray-500 text-center">
                        <FiLoader className="animate-pulse mx-auto mb-2" size={24} />
                        <p className="text-sm font-mono">페이지 {pageNumber}</p>
                        <p className="text-xs text-gray-600 mt-1">스크롤하여 로드</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </Document>
        </div>

        {/* 텍스트 선택 안내 */}
        {enableTextSelection && (
          <div className="pdf-help bg-gray-800/60 border border-cyan-500/20 rounded-lg p-2 mt-2">
            <p className="text-xs text-cyan-400 text-center mb-1">
              {state.highlightMode 
                ? '🎨 하이라이트 모드: 텍스트를 선택하면 자동으로 하이라이트됩니다'
                : '�� 마우스 휠로 스크롤하여 모든 페이지를 연속으로 볼 수 있습니다. 오른쪽 하단 모서리를 드래그하여 뷰어 폭을 조절할 수 있습니다.'
              }
            </p>
            <p className="text-xs text-gray-500 text-center">
              키보드 단축키: +/- (줌), R (회전), H (하이라이트 모드)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// React.memo로 래핑하여 상위 컴포넌트 재렌더(타이머 등)가 있을 때도
// PdfViewer가 불필요하게 언마운트‧리마운트되지 않도록 함
const MemoizedPdfViewer = React.memo(PdfViewerComponent);

export default MemoizedPdfViewer; 

// 간단한 throttle 유틸 (lodash 대체) 
function throttle<Func extends (...args: any[]) => void>(func: Func, limit: number): Func {
  let inThrottle: boolean;
  let lastArgs: any;
  return function(this: any, ...args: any[]) {
    lastArgs = args;
    if (!inThrottle) {
      func.apply(this, lastArgs);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  } as Func;
} 