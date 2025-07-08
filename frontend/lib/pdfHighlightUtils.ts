import { PdfHighlight, PdfHighlightCoordinates, PdfNativeCoordinates, HIGHLIGHT_COLORS } from '@/types/pdf';

/**
 * DOM 좌표를 PDF 네이티브 좌표로 변환합니다 (스크롤 독립적)
 * @param domRect DOM 좌표
 * @param pageElement 페이지 DOM 요소
 * @param scale 현재 스케일
 * @returns PDF 네이티브 좌표
 */
export function domRectToPdfCoordinates(
  domRect: DOMRect,
  pageElement: HTMLElement,
  scale: number = 1
): PdfNativeCoordinates {
  const pageRect = pageElement.getBoundingClientRect();
  
  // 페이지 내 상대 좌표 계산 (스크롤 독립적)
  const relativeX = (domRect.left - pageRect.left) / scale;
  const relativeY = (domRect.top - pageRect.top) / scale;
  const width = domRect.width / scale;
  const height = domRect.height / scale;
  
  // 페이지 크기도 스케일 보정
  const pageWidth = pageRect.width / scale;
  const pageHeight = pageRect.height / scale;
  
  return {
    x: relativeX,
    y: relativeY,
    width,
    height,
    pageWidth,
    pageHeight
  };
}

/**
 * PDF 네이티브 좌표를 현재 화면 좌표로 변환합니다
 * @param pdfCoords PDF 네이티브 좌표
 * @param pageElement 페이지 DOM 요소
 * @param scale 현재 스케일
 * @returns 화면 표시용 좌표
 */
export function pdfCoordinatesToScreen(
  pdfCoords: PdfNativeCoordinates,
  pageElement: HTMLElement,
  scale: number = 1,
  containerRect?: DOMRect
): PdfHighlightCoordinates {
  const pageRect = pageElement.getBoundingClientRect();
  const offsetX = containerRect ? pageRect.left - containerRect.left : 0;
  const offsetY = containerRect ? pageRect.top - containerRect.top : 0;

  // PDF 좌표를 현재 스케일과 페이지 위치+컨테이너 오프셋에 맞게 변환
  return {
    x: offsetX + pdfCoords.x * scale,
    y: offsetY + pdfCoords.y * scale,
    width: pdfCoords.width * scale,
    height: pdfCoords.height * scale
  };
}

/**
 * DOM 좌표를 SVG 좌표로 변환합니다 (레거시 호환성)
 * @param rect DOM 좌표 (DOMRect)
 * @param containerRect 컨테이너 좌표 (DOMRect)
 * @param scale PDF 스케일
 * @returns SVG 좌표
 */
export function domRectToSvgCoordinates(
  rect: DOMRect,
  containerRect: DOMRect,
  scale: number = 1
): PdfHighlightCoordinates {
  return {
    x: (rect.left - containerRect.left) / scale,
    y: (rect.top - containerRect.top) / scale,
    width: rect.width / scale,
    height: rect.height / scale
  };
}

/**
 * 고유한 하이라이트 ID를 생성합니다
 * @returns 고유 ID 문자열
 */
export function generateHighlightId(): string {
  return `highlight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 새로운 하이라이트 객체를 생성합니다 (개선된 버전)
 * @param text 선택된 텍스트
 * @param pageNumber 페이지 번호
 * @param boundingRect DOM 좌표 (레거시)
 * @param pdfCoordinates PDF 네이티브 좌표
 * @param color 하이라이트 색상 (기본값: yellow)
 * @param opacity 투명도 (기본값: 0.3)
 * @returns 새로운 하이라이트 객체
 */
export function createHighlightWithPdfCoords(
  text: string,
  pageNumber: number,
  boundingRect: DOMRect,
  pdfCoordinates: PdfNativeCoordinates,
  color: keyof typeof HIGHLIGHT_COLORS = 'yellow',
  opacity: number = 0.3
): PdfHighlight {
  return {
    id: generateHighlightId(),
    text: text.trim(),
    pageNumber,
    boundingRect, // 레거시 호환성
    pdfCoordinates, // 새로운 네이티브 좌표
    color: HIGHLIGHT_COLORS[color],
    opacity,
    createdAt: new Date(),
  };
}

/**
 * 새로운 하이라이트 객체를 생성합니다
 * @param text 선택된 텍스트
 * @param pageNumber 페이지 번호
 * @param boundingRect DOM 좌표
 * @param color 하이라이트 색상 (기본값: yellow)
 * @param opacity 투명도 (기본값: 0.3)
 * @returns 새로운 하이라이트 객체
 */
export function createHighlight(
  text: string,
  pageNumber: number,
  boundingRect: DOMRect,
  color: keyof typeof HIGHLIGHT_COLORS = 'yellow',
  opacity: number = 0.3
): PdfHighlight {
  // 임시로 pdfCoordinates를 boundingRect 기반으로 생성 (마이그레이션 용도)
  const pdfCoordinates: PdfNativeCoordinates = {
    x: boundingRect.x,
    y: boundingRect.y,
    width: boundingRect.width,
    height: boundingRect.height,
    pageWidth: 595, // A4 기본값
    pageHeight: 842 // A4 기본값
  };
  
  return createHighlightWithPdfCoords(text, pageNumber, boundingRect, pdfCoordinates, color, opacity);
}

/**
 * 하이라이트가 현재 페이지에 속하는지 확인합니다
 * @param highlight 하이라이트 객체
 * @param currentPage 현재 페이지 번호
 * @returns 현재 페이지에 속하는지 여부
 */
export function isHighlightOnCurrentPage(highlight: PdfHighlight, currentPage: number): boolean {
  return highlight.pageNumber === currentPage;
}

/**
 * 특정 페이지의 하이라이트들을 필터링합니다
 * @param highlights 모든 하이라이트 배열
 * @param pageNumber 페이지 번호
 * @returns 해당 페이지의 하이라이트 배열
 */
export function getHighlightsForPage(highlights: PdfHighlight[], pageNumber: number): PdfHighlight[] {
  return highlights.filter(highlight => isHighlightOnCurrentPage(highlight, pageNumber));
}

/**
 * 하이라이트 색상을 변경합니다
 * @param highlight 하이라이트 객체
 * @param newColor 새로운 색상
 * @returns 업데이트된 하이라이트 객체
 */
export function updateHighlightColor(
  highlight: PdfHighlight,
  newColor: keyof typeof HIGHLIGHT_COLORS
): PdfHighlight {
  return {
    ...highlight,
    color: HIGHLIGHT_COLORS[newColor]
  };
}

/**
 * 하이라이트에 메모를 추가하거나 업데이트합니다
 * @param highlight 하이라이트 객체
 * @param note 메모 내용
 * @returns 업데이트된 하이라이트 객체
 */
export function updateHighlightNote(highlight: PdfHighlight, note: string): PdfHighlight {
  return {
    ...highlight,
    note: note.trim() || undefined
  };
}

/**
 * 좌표가 유효한지 검증합니다
 * @param coordinates 좌표 객체
 * @returns 유효성 여부
 */
export function validateCoordinates(coordinates: PdfHighlightCoordinates): boolean {
  return (
    coordinates.x >= 0 &&
    coordinates.y >= 0 &&
    coordinates.width > 0 &&
    coordinates.height > 0
  );
}

/**
 * 하이라이트 데이터를 JSON으로 직렬화합니다
 * @param highlight 하이라이트 객체
 * @returns JSON 문자열
 */
export function serializeHighlight(highlight: PdfHighlight): string {
  return JSON.stringify({
    ...highlight,
    createdAt: highlight.createdAt.toISOString(),
    boundingRect: {
      x: highlight.boundingRect.x,
      y: highlight.boundingRect.y,
      width: highlight.boundingRect.width,
      height: highlight.boundingRect.height,
      top: highlight.boundingRect.top,
      left: highlight.boundingRect.left,
      right: highlight.boundingRect.right,
      bottom: highlight.boundingRect.bottom
    }
  });
}

/**
 * JSON에서 하이라이트 데이터를 역직렬화합니다
 * @param json JSON 문자열
 * @returns 하이라이트 객체
 */
export function deserializeHighlight(json: string): PdfHighlight {
  const data = JSON.parse(json);
  return {
    ...data,
    createdAt: new Date(data.createdAt),
    boundingRect: new DOMRect(
      data.boundingRect.x,
      data.boundingRect.y,
      data.boundingRect.width,
      data.boundingRect.height
    )
  };
} 