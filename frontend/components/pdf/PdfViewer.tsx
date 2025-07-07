"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { FiZoomIn, FiZoomOut, FiRotateCw, FiChevronLeft, FiChevronRight, FiLoader, FiEdit3, FiSidebar } from 'react-icons/fi';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { PdfHighlight, HIGHLIGHT_COLORS } from '@/types/pdf';
import { createHighlight } from '@/lib/pdfHighlightUtils';
import PdfHighlightOverlay from './PdfHighlightOverlay';
import { loadPdfFromLocal } from '../../lib/localPdfStorage';

// PDF.js worker 설정 - static asset 사용
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface PdfViewerProps {
  bookId: string;
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
  pdfData: string | ArrayBuffer | null;
  numPages: number | null;
  pageNumber: number;
  scale: number;
  rotation: number;
  isLoading: boolean;
  error: string | null;
  highlightMode: boolean;
  visiblePages: Set<number>;
  renderedPages: Set<number>;
}

// === 썸네일 페이지 컴포넌트 ===
interface ThumbnailPageProps {
  pageNumber: number;
  currentPage: number;
  scale: number;
  pdfFile: string | ArrayBuffer | null;
  onPageClick: (pageNum: number) => void;
}

const ThumbnailPage: React.FC<ThumbnailPageProps> = React.memo(({ 
  pageNumber, 
  currentPage, 
  scale, 
  pdfFile, 
  onPageClick 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // IntersectionObserver로 lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  const isCurrentPage = pageNumber === currentPage;

  return (
    <div
      ref={ref}
      className={`relative cursor-pointer rounded border-2 transition-all duration-200 ${
        isCurrentPage 
          ? 'border-blue-500 bg-blue-500/20' 
          : 'border-gray-600 hover:border-gray-500'
      }`}
      onClick={() => onPageClick(pageNumber)}
      title={`페이지 ${pageNumber}로 이동`}
    >
      {isInView && pdfFile ? (
        <Document file={pdfFile} onLoadSuccess={() => setIsLoaded(true)}>
          <Page
            pageNumber={pageNumber}
            scale={scale}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            loading={
              <div className="flex items-center justify-center h-24 bg-gray-800">
                <FiLoader className="animate-spin text-gray-400" size={16} />
              </div>
            }
          />
        </Document>
      ) : (
        <div className="flex items-center justify-center h-24 bg-gray-800">
          <span className="text-xs text-gray-500">{pageNumber}</span>
        </div>
      )}
      
      {/* 페이지 번호 오버레이 */}
      <div className="absolute bottom-1 left-1 right-1 text-center">
        <span className="text-xs bg-black/70 text-white px-1 rounded">
          {pageNumber}
        </span>
      </div>
    </div>
  );
});

ThumbnailPage.displayName = 'ThumbnailPage';

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
  enableHighlighting = true
}: PdfViewerProps) {
  const [state, setState] = useState<PdfViewerState>({
    pdfData: null,
    numPages: null,
    pageNumber: currentPage,
    scale: 1.2,
    rotation: 0,
    isLoading: true,
    error: null,
    highlightMode: false,
    visiblePages: new Set([1]),
    renderedPages: new Set()
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

  // === 썸네일 패널 상태 관리 ===
  const [thumbnailPanel, setThumbnailPanel] = useState({
    isVisible: false,
    width: 200,
    thumbnailScale: 0.15
  });
  const thumbnailStartXRef = useRef<number>(0);
  const thumbnailStartWidthRef = useRef<number>(200);

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
      visiblePages: new Set(Array.from({ length: Math.min(3, numPages) }, (_, i) => i + 1))
    }));
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
  const handlePageChange = useCallback((offset: number) => {
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
      const highlight = createHighlight(selectedText, selectedPageNumber, rect);
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

  // IntersectionObserver를 사용한 페이지 가시성 추적
  useEffect(() => {
    if (!state.numPages) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visiblePageNumbers = new Set<number>();
        let mostVisiblePage = state.pageNumber;
        let maxIntersectionRatio = 0;

        entries.forEach((entry) => {
          const pageNumber = parseInt(entry.target.getAttribute('data-page-number') || '1');
          
          if (entry.isIntersecting) {
            visiblePageNumbers.add(pageNumber);
            
            // 가장 많이 보이는 페이지를 현재 페이지로 설정
            if (entry.intersectionRatio > maxIntersectionRatio) {
              maxIntersectionRatio = entry.intersectionRatio;
              mostVisiblePage = pageNumber;
            }
            
            // 현재 페이지 근처의 페이지도 미리 로딩 (성능 최적화)
            const preloadRange = 2; // 앞뒤 2페이지씩 미리 로딩
            for (let i = Math.max(1, pageNumber - preloadRange); 
                 i <= Math.min(state.numPages || pageNumber, pageNumber + preloadRange); 
                 i++) {
              visiblePageNumbers.add(i);
            }
          }
        });

        setState(prev => ({
          ...prev,
          visiblePages: visiblePageNumbers,
          pageNumber: mostVisiblePage
        }));

        // 성능 모니터링 로깅 (개발 환경에서만)
        if (process.env.NODE_ENV === 'development') {
          console.log(`PDF 뷰어: 로드된 페이지 수: ${visiblePageNumbers.size}, 현재 페이지: ${mostVisiblePage}, 보이는 페이지: [${Array.from(visiblePageNumbers).sort().join(', ')}]`);
        }

        // 현재 페이지 변경 콜백 호출
        if (mostVisiblePage !== state.pageNumber) {
          onPageChange?.(mostVisiblePage);
        }
      },
      {
        root: documentRef.current,
        rootMargin: '200px 0px', // 위아래 200px 미리 로딩
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 0.9] // 더 세밀한 교차 비율 감지
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

  // === 썸네일 패널 드래그 핸들러 ===
  const onThumbnailDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    thumbnailStartXRef.current = e.clientX;
    thumbnailStartWidthRef.current = thumbnailPanel.width;
    
    document.addEventListener('mousemove', onThumbnailDragging);
    document.addEventListener('mouseup', onThumbnailDragEnd);
  };

  const onThumbnailDragging = throttle((e: MouseEvent) => {
    const deltaX = e.clientX - thumbnailStartXRef.current;
    const newWidth = Math.max(150, Math.min(400, thumbnailStartWidthRef.current + deltaX));
    
    setThumbnailPanel(prev => ({
      ...prev,
      width: newWidth
    }));
  }, 16);

  const onThumbnailDragEnd = () => {
    document.removeEventListener('mousemove', onThumbnailDragging);
    document.removeEventListener('mouseup', onThumbnailDragEnd);
  };

  // === 썸네일 패널 토글 ===
  const toggleThumbnailPanel = () => {
    setThumbnailPanel(prev => ({
      ...prev,
      isVisible: !prev.isVisible
    }));
  };

  // === 썸네일 크기 조절 ===
  const handleThumbnailScaleChange = (scale: number) => {
    setThumbnailPanel(prev => ({
      ...prev,
      thumbnailScale: scale
    }));
  };

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
    <div className="flex w-full h-full">
      {/* 썸네일 패널 */}
      {thumbnailPanel.isVisible && (
        <div 
          className="bg-gray-900/95 border-r border-gray-700 flex flex-col relative"
          style={{ width: `${thumbnailPanel.width}px` }}
        >
          {/* 썸네일 패널 헤더 */}
          <div className="p-3 border-b border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-300">페이지 썸네일</h3>
              <span className="text-xs text-gray-500">{state.numPages}페이지</span>
            </div>
            
            {/* 썸네일 크기 조절 슬라이더 */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-400">크기</span>
              <input
                type="range"
                min="0.1"
                max="0.3"
                step="0.05"
                value={thumbnailPanel.thumbnailScale}
                onChange={(e) => handleThumbnailScaleChange(parseFloat(e.target.value))}
                className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* 썸네일 리스트 */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {state.numPages && Array.from({ length: state.numPages }, (_, index) => (
              <ThumbnailPage
                key={index + 1}
                pageNumber={index + 1}
                currentPage={state.pageNumber}
                scale={thumbnailPanel.thumbnailScale}
                pdfFile={state.pdfData}
                onPageClick={(pageNum: number) => {
                  const pageElement = document.getElementById(`pdf-page-${pageNum}`);
                  if (pageElement) {
                    pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
              />
            ))}
          </div>

          {/* 드래그 핸들 */}
          <div
            className="absolute top-0 right-0 w-1 h-full bg-transparent hover:bg-blue-500/50 cursor-col-resize transition-colors"
            onMouseDown={onThumbnailDragStart}
            title="드래그하여 패널 크기 조절"
          />
        </div>
      )}

      {/* PDF 뷰어 영역 */}
      <div className="flex justify-center w-full">
        <div 
          className="relative bg-gray-800 border border-gray-600 rounded-lg overflow-hidden"
          style={{ 
            width: `${viewerWidth}px`,
            resize: 'horizontal',
            minWidth: `${MIN_WIDTH}px`,
            maxWidth: `${typeof window !== 'undefined' ? window.innerWidth - 50 : 800}px`
          }}
        >
          {/* PDF 뷰어 컨트롤 */}
          <div className="pdf-controls bg-gray-800/80 backdrop-blur-md border border-cyan-500/40 rounded-t-xl p-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {/* 썸네일 패널 토글 */}
              <button
                onClick={toggleThumbnailPanel}
                className={`p-2 rounded-lg transition-colors ${
                  thumbnailPanel.isVisible
                    ? 'bg-blue-600/40 hover:bg-blue-600/60'
                    : 'bg-blue-600/20 hover:bg-blue-600/40'
                }`}
                title={thumbnailPanel.isVisible ? '썸네일 패널 숨기기' : '썸네일 패널 보기'}
              >
                <FiSidebar size={16} className={thumbnailPanel.isVisible ? 'text-blue-200' : 'text-blue-300'} />
              </button>

              {/* 줌 컨트롤 */}
              <button
                onClick={() => adjustScale(-0.2)}
                className="p-2 bg-blue-600/20 hover:bg-blue-600/40 rounded-lg transition-colors"
                title="축소 (Ctrl + -)"
              >
                <FiZoomOut size={16} className="text-blue-300" />
              </button>
              
              <span className="text-blue-200 text-sm font-medium min-w-[60px] text-center">
                {Math.round(state.scale * 100)}%
              </span>
              
              <button
                onClick={() => adjustScale(0.2)}
                className="p-2 bg-blue-600/20 hover:bg-blue-600/40 rounded-lg transition-colors"
                title="확대 (Ctrl + +)"
              >
                <FiZoomIn size={16} className="text-blue-300" />
              </button>
              
              <button
                onClick={() => rotate()}
                className="p-2 bg-blue-600/20 hover:bg-blue-600/40 rounded-lg transition-colors"
                title="회전 (R)"
              >
                <FiRotateCw size={16} className="text-blue-300" />
              </button>
            </div>

            <div className="flex items-center space-x-2">
              {/* 페이지 네비게이션 */}
              <button
                onClick={() => handlePageChange(state.pageNumber - 1)}
                disabled={state.pageNumber <= 1}
                className="p-2 bg-blue-600/20 hover:bg-blue-600/40 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                title="이전 페이지 (←)"
              >
                <FiChevronLeft size={16} className="text-blue-300" />
              </button>
              
              <span className="text-blue-200 text-sm font-medium">
                {state.pageNumber} / {state.numPages || 0}
              </span>
              
              <button
                onClick={() => handlePageChange(state.pageNumber + 1)}
                disabled={state.pageNumber >= (state.numPages || 0)}
                className="p-2 bg-blue-600/20 hover:bg-blue-600/40 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                title="다음 페이지 (→)"
              >
                <FiChevronRight size={16} className="text-blue-300" />
              </button>
              
              {/* 하이라이트 토글 */}
              <button
                onClick={toggleHighlightMode}
                className={`p-2 rounded-lg transition-colors ${
                  state.highlightMode 
                    ? 'bg-yellow-600/40 hover:bg-yellow-600/60' 
                    : 'bg-blue-600/20 hover:bg-blue-600/40'
                }`}
                title={state.highlightMode ? '하이라이트 모드 끄기' : '하이라이트 모드 켜기'}
              >
                <FiEdit3 size={16} className={state.highlightMode ? 'text-yellow-200' : 'text-blue-300'} />
              </button>
            </div>
          </div>

          {/* 도움말 텍스트 */}
          <div className="bg-blue-600/10 border-l-4 border-blue-500 p-3">
            <p className="text-blue-200 text-sm">
              {state.highlightMode 
                ? '🎨 하이라이트 모드: 텍스트를 선택하면 자동으로 하이라이트됩니다'
                : '마우스 휠로 스크롤하여 모든 페이지를 연속으로 볼 수 있습니다. 오른쪽 하단 모서리를 드래그하여 뷰어 폭을 조절할 수 있습니다.'
              }
            </p>
          </div>

          {/* PDF 문서 영역 */}
          <div 
            className="pdf-document-container flex-1 overflow-y-auto bg-gray-900 p-4"
            style={{ scrollBehavior: 'smooth' }}
          >
            {state.pdfData && (
              <Document
                file={state.pdfData}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={(error) => {
                  console.error('PDF 로드 에러:', error);
                  setState(prev => ({
                    ...prev,
                    error: 'PDF 파일을 로드할 수 없습니다. 파일이 손상되었거나 지원되지 않는 형식일 수 있습니다.'
                  }));
                }}
                loading={
                  <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <FiLoader className="animate-spin text-blue-400" size={32} />
                    <p className="text-blue-200">PDF 문서를 로드하는 중...</p>
                  </div>
                }
              >
                <div className="space-y-6">
                  {state.numPages && Array.from({ length: state.numPages }, (_, index) => (
                    <div key={index + 1} className="flex justify-center">
                      <div
                        id={`pdf-page-${index + 1}`}
                        className="relative border border-gray-600 rounded-lg overflow-hidden shadow-lg"
                      >
                        {state.visiblePages.has(index + 1) ? (
                          <Page
                            pageNumber={index + 1}
                            scale={state.scale}
                            rotate={state.rotation}
                            onRenderSuccess={() => {
                              setState(prev => ({
                                ...prev,
                                renderedPages: new Set([...prev.renderedPages, index + 1])
                              }));
                            }}
                            onGetTextSuccess={(textItems) => {
                              if (state.highlightMode && enableHighlighting) {
                                // enableHighlighting이 활성화되어 있을 때의 처리
                                // 여기서 실제 하이라이트 활성화 로직을 구현할 수 있습니다
                              }
                            }}
                            loading={
                              <div className="flex items-center justify-center h-96 bg-gray-800">
                                <FiLoader className="animate-spin text-blue-400" size={24} />
                              </div>
                            }
                          />
                        ) : (
                          <div className="flex items-center justify-center h-96 bg-gray-800">
                            <span className="text-gray-400">페이지 {index + 1}</span>
                          </div>
                        )}
                        
                        {/* 페이지 번호 표시 */}
                        <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                          {index + 1}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Document>
            )}
          </div>

          {/* 리사이즈 핸들 */}
          <div
            className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500/30 hover:bg-blue-500/60 cursor-nw-resize transition-colors"
            onMouseDown={onDragStart}
            title="드래그하여 뷰어 크기 조절"
          />
        </div>
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