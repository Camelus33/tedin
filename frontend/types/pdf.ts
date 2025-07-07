export interface PdfHighlight {
  id: string;
  text: string;
  pageNumber: number;
  boundingRect: DOMRect;
  color: string;
  opacity: number;
  createdAt: Date;
  note?: string;
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