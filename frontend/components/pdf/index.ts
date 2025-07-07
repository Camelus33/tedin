export { default as PdfViewer } from './PdfViewer';
export { default as PdfHighlightOverlay } from './PdfHighlightOverlay';
export { default as PdfMemoModal } from './PdfMemoModal';

export interface PdfHighlight {
  id: string;
  text: string;
  rects: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
  pageNumber: number;
  color?: string;
}

export interface PdfMemoData {
  type: 'quote' | 'thought' | 'question';
  content: string;
  keywords: string[];
  selfRating: number;
  pageNumber: number;
  highlightedText: string;
} 