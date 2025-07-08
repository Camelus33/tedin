export interface PdfHighlight {
  id: string;
  text: string;
  pageNumber: number;
  boundingRect: DOMRect; // 레거시 호환성을 위해 유지
  pdfCoordinates: PdfNativeCoordinates; // 새로운 PDF 네이티브 좌표
  color: string;
  opacity: number;
  createdAt: Date;
  note?: string;
}

export interface PdfNativeCoordinates {
  x: number; // PDF 좌표계 기준 (72 DPI)
  y: number; // PDF 좌표계 기준 (72 DPI)
  width: number;
  height: number;
  pageWidth: number; // 해당 페이지의 전체 너비
  pageHeight: number; // 해당 페이지의 전체 높이
}

export interface PdfHighlightCoordinates {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PdfHighlightProps {
  highlight: PdfHighlight;
  coordinates: PdfHighlightCoordinates;
  onClick?: (highlight: PdfHighlight) => void;
  onEdit?: (highlight: PdfHighlight) => void;
  onDelete?: (highlightId: string) => void;
}

export interface PdfHighlightOverlayProps {
  highlights: PdfHighlight[];
  pageNumber: number;
  scale: number;
  containerRef: React.RefObject<HTMLDivElement>;
  onHighlightClick?: (highlight: PdfHighlight) => void;
  onHighlightEdit?: (highlight: PdfHighlight) => void;
  onHighlightDelete?: (highlightId: string) => void;
}

export const HIGHLIGHT_COLORS = {
  yellow: '#fbbf24',
  green: '#10b981',
  blue: '#3b82f6',
  purple: '#8b5cf6',
  pink: '#ec4899',
  orange: '#f97316'
} as const;

export type HighlightColor = keyof typeof HIGHLIGHT_COLORS; 