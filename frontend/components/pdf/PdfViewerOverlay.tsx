'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';

// Avoid SSR for PdfViewer (uses DOM APIs internally)
const PdfViewer = dynamic(() => import('./PdfViewer'), { ssr: false });

interface PdfViewerOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  bookId: string;
  initialPage?: number;
  title?: string;
}

export default function PdfViewerOverlay({
  isOpen,
  onClose,
  bookId,
  initialPage = 1,
  title,
}: PdfViewerOverlayProps) {
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setCurrentPage(initialPage);

    // lock body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, initialPage]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose();
    }
  };

  if (!mounted || !isOpen) return null;

  const overlay = (
    <div
      className="fixed inset-0 z-[10000] bg-black/70 flex flex-col"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdf-viewer-overlay-title"
      tabIndex={-1}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900/90 border-b border-gray-700">
        <div className="flex items-baseline gap-2">
          <h2 id="pdf-viewer-overlay-title" className="text-sm font-semibold text-gray-200">
            {title || 'PDF'}
          </h2>
          <span className="text-xs text-gray-400">p.{currentPage}</span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors text-gray-200"
          aria-label="닫기"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Content area */}
      <div className="flex-1 min-h-0">
        <div className="h-full w-full overflow-auto p-3">
          <PdfViewer
            bookId={bookId}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            enableTextSelection={false}
            containerHeight="100%"
            className="mx-auto max-w-6xl w-full h-full"
          />
        </div>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}


