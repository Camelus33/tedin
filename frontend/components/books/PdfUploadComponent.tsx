"use client";

import React, { useState, useRef, useCallback } from 'react';
import { FiUpload, FiFile, FiX, FiAlertCircle, FiCheck } from 'react-icons/fi';
import { extractPdfMetadata, validatePdfFile, formatFileSize, PdfMetadata } from '@/lib/pdfUtils';

interface PdfUploadComponentProps {
  onPdfSelected: (file: File, metadata: PdfMetadata) => void;
  onError: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

interface UploadState {
  isDragging: boolean;
  isProcessing: boolean;
  uploadedFile: File | null;
  metadata: PdfMetadata | null;
  error: string | null;
}

export default function PdfUploadComponent({
  onPdfSelected,
  onError,
  disabled = false,
  className = ""
}: PdfUploadComponentProps) {
  const [state, setState] = useState<UploadState>({
    isDragging: false,
    isProcessing: false,
    uploadedFile: null,
    metadata: null,
    error: null
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 파일 처리 함수
  const processFile = useCallback(async (file: File) => {
    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      // 파일 유효성 검사
      const validation = validatePdfFile(file);
      if (!validation.isValid) {
        setState(prev => ({ ...prev, isProcessing: false, error: validation.error || '파일이 유효하지 않습니다.' }));
        onError(validation.error || '파일이 유효하지 않습니다.');
        return;
      }

      // 메타데이터 추출
      const result = await extractPdfMetadata(file);
      
      if (result.success && result.metadata) {
        setState(prev => ({
          ...prev,
          isProcessing: false,
          uploadedFile: file,
          metadata: result.metadata!,
          error: null
        }));
        onPdfSelected(file, result.metadata);
      } else {
        setState(prev => ({
          ...prev,
          isProcessing: false,
          uploadedFile: file,
          metadata: result.metadata || null,
          error: result.error || 'PDF 처리 중 오류가 발생했습니다.'
        }));
        
        // 부분적 성공인 경우에도 콜백 호출 (기본 정보라도 제공)
        if (result.metadata) {
          onPdfSelected(file, result.metadata);
        } else {
          onError(result.error || 'PDF 처리 중 오류가 발생했습니다.');
        }
      }
    } catch (error) {
      console.error('PDF 처리 오류:', error);
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: '예상치 못한 오류가 발생했습니다.'
      }));
      onError('예상치 못한 오류가 발생했습니다.');
    }
  }, [onPdfSelected, onError]);

  // 드래그 이벤트 핸들러
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setState(prev => ({ ...prev, isDragging: true }));
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setState(prev => ({ ...prev, isDragging: false }));
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setState(prev => ({ ...prev, isDragging: false }));

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find(file => file.type === 'application/pdf');

    if (pdfFile) {
      processFile(pdfFile);
    } else {
      const error = 'PDF 파일만 업로드 가능합니다.';
      setState(prev => ({ ...prev, error }));
      onError(error);
    }
  }, [disabled, processFile, onError]);

  // 파일 선택 핸들러
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  // 파일 제거 핸들러
  const handleRemoveFile = useCallback(() => {
    setState({
      isDragging: false,
      isProcessing: false,
      uploadedFile: null,
      metadata: null,
      error: null
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // 업로드 영역 클릭 핸들러
  const handleUploadAreaClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  return (
    <div className={`pdf-upload-component ${className}`}>
      {/* 숨겨진 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {/* 업로드된 파일이 없을 때 */}
      {!state.uploadedFile && (
        <div
          onClick={handleUploadAreaClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200
            ${state.isDragging 
              ? 'border-cyan-400 bg-cyan-900/20' 
              : 'border-cyan-500/40 hover:border-cyan-400 bg-gray-900/60 hover:bg-gray-800/60'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${state.isProcessing ? 'pointer-events-none' : ''}
          `}
        >
          {state.isProcessing ? (
            <div className="flex flex-col items-center space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
              <p className="text-sm text-cyan-300">PDF 파일 분석 중...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-3">
              <div className="bg-cyan-500/20 rounded-full p-3">
                <FiUpload size={24} className="text-cyan-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-cyan-300 mb-1">
                  PDF 파일을 드래그하거나 클릭하여 업로드
                </p>
                <p className="text-xs text-gray-400">
                  최대 20MB, PDF 형식만 지원
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 업로드된 파일 정보 표시 */}
      {state.uploadedFile && (
        <div className="bg-gray-800/60 border border-cyan-500/30 rounded-xl p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <div className="bg-green-500/20 rounded-lg p-2 flex-shrink-0">
                <FiFile size={20} className="text-green-400" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="text-sm font-medium text-cyan-300 truncate">
                    {state.uploadedFile.name}
                  </h4>
                  {!state.error && (
                    <FiCheck size={16} className="text-green-400 flex-shrink-0" />
                  )}
                </div>
                
                <p className="text-xs text-gray-400 mb-2">
                  크기: {formatFileSize(state.uploadedFile.size)}
                </p>

                {/* 추출된 메타데이터 표시 */}
                {state.metadata && (
                  <div className="bg-gray-700/50 rounded-lg p-3 space-y-2">
                    <h5 className="text-xs font-medium text-purple-300">추출된 정보:</h5>
                    <div className="space-y-1 text-xs">
                      {state.metadata.title && (
                        <div>
                          <span className="text-gray-400">제목:</span>
                          <span className="text-gray-200 ml-2">{state.metadata.title}</span>
                        </div>
                      )}
                      {state.metadata.author && (
                        <div>
                          <span className="text-gray-400">저자:</span>
                          <span className="text-gray-200 ml-2">{state.metadata.author}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-400">페이지:</span>
                        <span className="text-gray-200 ml-2">
                          {state.metadata.totalPages > 0 ? `${state.metadata.totalPages}페이지` : '알 수 없음'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 에러 메시지 */}
                {state.error && (
                  <div className="flex items-start space-x-2 mt-2 p-2 bg-yellow-900/30 border border-yellow-500/30 rounded-lg">
                    <FiAlertCircle size={16} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-yellow-300">{state.error}</p>
                  </div>
                )}
              </div>
            </div>

            {/* 제거 버튼 */}
            <button
              onClick={handleRemoveFile}
              className="ml-2 p-1 text-gray-400 hover:text-red-400 transition-colors"
              title="파일 제거"
            >
              <FiX size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 