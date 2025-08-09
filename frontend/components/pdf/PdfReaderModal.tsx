'use client';

import React, { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';

// Avoid loading PdfViewer on the server (DOM APIs like DOMMatrix are not available)
const PdfViewer = dynamic(() => import('./PdfViewer'), { ssr: false });

interface PdfReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookId: string;
  initialPage?: number;
  title?: string;
}

export default function PdfReaderModal({
  isOpen,
  onClose,
  bookId,
  initialPage = 1,
  title,
}: PdfReaderModalProps) {
  const [currentPage, setCurrentPage] = useState<number>(initialPage);

  useEffect(() => {
    if (isOpen) {
      setCurrentPage(initialPage);
    }
  }, [isOpen, initialPage]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdf-reader-modal-title"
      tabIndex={-1}
    >
      <div className="w-full max-w-5xl max-h-[100dvh] bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-y-auto flex flex-col">
        <div className="flex items-center justify-between p-3 border-b border-gray-700 bg-gray-800/70 sticky top-0 z-10">
          <div className="flex flex-col">
            <h2 id="pdf-reader-modal-title" className="text-sm font-semibold text-gray-200">
              {title ? `${title}` : 'PDF 미리보기'}
            </h2>
            <p className="text-xs text-gray-400">페이지 {currentPage}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-gray-700/60 hover:bg-gray-600 transition-colors text-gray-200"
            aria-label="닫기"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 min-h-0">
          <PdfViewer
            bookId={bookId}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            enableTextSelection={false}
            containerHeight="100%"
            className="mx-auto"
          />
        </div>
      </div>
    </div>
  );
}


