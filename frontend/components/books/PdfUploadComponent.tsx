"use client";

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { getDocument } from 'pdfjs-dist';
import { FiUpload, FiFile, FiX, FiCheck, FiLoader } from 'react-icons/fi';
import { storePdfLocally } from '../../lib/localPdfStorage';

interface PdfUploadComponentProps {
  onPdfSelect: (pdfInfo: {
    bookId: string;
    fileName: string;
    title: string;
    author: string;
    totalPages: number;
    fileSize: number;
  }) => void;
  className?: string;
}

interface PdfInfo {
  bookId: string;
  fileName: string;
  title: string;
  author: string;
  totalPages: number;
  fileSize: number;
}

export default function PdfUploadComponent({ onPdfSelect, className = "" }: PdfUploadComponentProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [pdfInfo, setPdfInfo] = useState<PdfInfo | null>(null);

  // 임시 bookId 생성 함수
  const generateBookId = (): string => {
    return `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // PDF 메타데이터 추출
  const extractPdfMetadata = async (file: File): Promise<{
    title: string;
    author: string;
    totalPages: number;
  }> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await getDocument(arrayBuffer).promise;
      const metadata = await pdf.getMetadata();
      
      // 메타데이터에서 정보 추출 (타입 안전성 확보)
      const info = metadata.info as any;
      const title = info?.Title || file.name.replace(/\.pdf$/i, '');
      const author = info?.Author || '알 수 없는 저자';
      const totalPages = pdf.numPages;

      return { title, author, totalPages };
    } catch (error) {
      console.warn('PDF 메타데이터 추출 실패, 기본값 사용:', error);
      return {
        title: file.name.replace(/\.pdf$/i, ''),
        author: '알 수 없는 저자',
        totalPages: 1
      };
    }
  };

  // 파일 처리 함수
  const handleFileUpload = useCallback(async (files: File[]) => {
    if (files.length === 0) return;
    
    const file = files[0];
    
    // PDF 파일 검증
    if (!file.type.includes('pdf')) {
      setErrorMessage('PDF 파일만 업로드 가능합니다.');
      setUploadStatus('error');
      return;
    }

    // 파일 크기 제한 (50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrorMessage('파일 크기는 50MB 이하여야 합니다.');
      setUploadStatus('error');
      return;
    }

    setIsProcessing(true);
    setUploadStatus('processing');
    setErrorMessage('');

    try {
      // 1. PDF 메타데이터 추출
      console.log('PDF 메타데이터 추출 중...');
      const metadata = await extractPdfMetadata(file);
      
      // 2. 고유 bookId 생성
      const bookId = generateBookId();
      
      // 3. 로컬 IndexedDB에 PDF 저장
      console.log('PDF 로컬 저장 중...');
      await storePdfLocally(bookId, file, {
        title: metadata.title,
        author: metadata.author,
        totalPages: metadata.totalPages,
        fingerprint: `${file.name}_${file.size}_${file.lastModified}` // 파일 무결성 체크용
      });

      // 4. PDF 정보 설정
      const pdfData: PdfInfo = {
        bookId,
        fileName: file.name,
        title: metadata.title,
        author: metadata.author,
        totalPages: metadata.totalPages,
        fileSize: file.size,
      };

      setPdfInfo(pdfData);
      setUploadStatus('success');
      
      // 5. 부모 컴포넌트에 정보 전달
      onPdfSelect(pdfData);
      
      console.log('PDF 로컬 저장 완료:', pdfData);
      
    } catch (error) {
      console.error('PDF 처리 실패:', error);
      setErrorMessage(error instanceof Error ? error.message : 'PDF 처리 중 오류가 발생했습니다.');
      setUploadStatus('error');
    } finally {
      setIsProcessing(false);
    }
  }, [onPdfSelect]);

  // 드래그앤드롭 설정
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileUpload,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false,
    disabled: isProcessing
  });

  // 초기화
  const resetUpload = () => {
    setPdfInfo(null);
    setUploadStatus('idle');
    setErrorMessage('');
  };

  return (
    <div className={`pdf-upload-component ${className}`}>
      {uploadStatus === 'idle' && (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
            ${isDragActive 
              ? 'border-cyan-400 bg-cyan-900/20' 
              : 'border-gray-600 hover:border-cyan-500 hover:bg-cyan-900/10'
            }
            ${isProcessing ? 'pointer-events-none opacity-50' : ''}
          `}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center space-y-4">
            <FiUpload size={48} className="text-cyan-400" />
            <div>
              <p className="text-lg font-semibold text-cyan-300 mb-2">
                {isDragActive ? 'PDF 파일을 여기에 놓으세요' : 'PDF 파일을 업로드하세요'}
              </p>
              <p className="text-sm text-gray-400">
                드래그 앤 드롭하거나 클릭하여 파일을 선택하세요
              </p>
              <p className="text-xs text-gray-500 mt-1">
                최대 50MB, PDF 파일만 지원
              </p>
            </div>
          </div>
        </div>
      )}

      {uploadStatus === 'processing' && (
        <div className="border-2 border-cyan-500 bg-cyan-900/20 rounded-xl p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <FiLoader size={48} className="text-cyan-400 animate-spin" />
            <div>
              <p className="text-lg font-semibold text-cyan-300 mb-2">PDF 처리 중...</p>
              <p className="text-sm text-gray-400">
                메타데이터를 추출하고 로컬에 저장하고 있습니다
              </p>
            </div>
          </div>
        </div>
      )}

      {uploadStatus === 'success' && pdfInfo && (
        <div className="border-2 border-emerald-500 bg-emerald-900/20 rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <FiCheck size={24} className="text-emerald-400 mt-1" />
              <div className="flex-1">
                <p className="text-lg font-semibold text-emerald-300 mb-2">PDF 업로드 완료</p>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-400">파일명:</span> <span className="text-white">{pdfInfo.fileName}</span></p>
                  <p><span className="text-gray-400">제목:</span> <span className="text-white">{pdfInfo.title}</span></p>
                  <p><span className="text-gray-400">저자:</span> <span className="text-white">{pdfInfo.author}</span></p>
                  <p><span className="text-gray-400">페이지:</span> <span className="text-white">{pdfInfo.totalPages}페이지</span></p>
                  <p><span className="text-gray-400">크기:</span> <span className="text-white">{(pdfInfo.fileSize / 1024 / 1024).toFixed(2)}MB</span></p>
                  <p className="text-xs text-cyan-400 mt-2">✓ 로컬 저장소에 안전하게 보관됨</p>
                </div>
              </div>
            </div>
            <button
              onClick={resetUpload}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="다시 업로드"
            >
              <FiX size={20} />
            </button>
          </div>
        </div>
      )}

      {uploadStatus === 'error' && (
        <div className="border-2 border-red-500 bg-red-900/20 rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <FiX size={24} className="text-red-400 mt-1" />
              <div className="flex-1">
                <p className="text-lg font-semibold text-red-300 mb-2">업로드 실패</p>
                <p className="text-sm text-gray-300">{errorMessage}</p>
              </div>
            </div>
            <button
              onClick={resetUpload}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="다시 시도"
            >
              <FiX size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 