import * as pdfjsLib from 'pdfjs-dist';

// PDF.js worker 설정 - 외부 CDN 사용 (안정적인 방법)
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
}

export interface PdfMetadata {
  title?: string;
  author?: string;
  totalPages: number;
  fileSize: number;
  fileName: string;
}

export interface PdfExtractionResult {
  success: boolean;
  metadata?: PdfMetadata;
  error?: string;
}

/**
 * PDF 파일에서 메타데이터를 추출합니다
 * @param file PDF 파일 객체
 * @returns PDF 메타데이터 추출 결과
 */
export async function extractPdfMetadata(file: File): Promise<PdfExtractionResult> {
  try {
    // 파일 타입 검증
    if (file.type !== 'application/pdf') {
      return {
        success: false,
        error: 'PDF 파일만 업로드 가능합니다.'
      };
    }

    // 파일 크기 검증 (20MB 제한)
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'PDF 파일 크기는 20MB 이하여야 합니다.'
      };
    }

    // 파일을 ArrayBuffer로 변환
    const arrayBuffer = await file.arrayBuffer();
    
    // PDF 문서 로드
    const loadingTask = pdfjsLib.getDocument(arrayBuffer);
    const pdf = await loadingTask.promise;
    
    // 메타데이터 추출
    const metadata = await pdf.getMetadata();
    const info = metadata.info as any; // PDF.js 타입 정의 이슈로 any 사용
    
    // 기본 정보 추출
    const extractedMetadata: PdfMetadata = {
      totalPages: pdf.numPages,
      fileSize: file.size,
      fileName: file.name
    };

    // 제목 추출 (여러 소스에서 시도)
    if (info?.Title && typeof info.Title === 'string' && info.Title.trim()) {
      extractedMetadata.title = info.Title.trim();
    } else {
      // 파일명에서 확장자 제거하여 제목으로 사용
      const nameWithoutExt = file.name.replace(/\.pdf$/i, '');
      extractedMetadata.title = nameWithoutExt;
    }

    // 저자 추출
    if (info?.Author && typeof info.Author === 'string' && info.Author.trim()) {
      extractedMetadata.author = info.Author.trim();
    } else if (info?.Creator && typeof info.Creator === 'string' && info.Creator.trim()) {
      extractedMetadata.author = info.Creator.trim();
    }

    // PDF 문서 정리
    pdf.destroy();

    return {
      success: true,
      metadata: extractedMetadata
    };

  } catch (error) {
    console.error('PDF 메타데이터 추출 오류:', error);
    
    // 기본 정보라도 제공
    const fallbackMetadata: PdfMetadata = {
      title: file.name.replace(/\.pdf$/i, ''),
      totalPages: 0, // 알 수 없음
      fileSize: file.size,
      fileName: file.name
    };

    return {
      success: false,
      metadata: fallbackMetadata,
      error: 'PDF 파일을 읽는 중 오류가 발생했습니다. 수동으로 정보를 입력해주세요.'
    };
  }
}

/**
 * PDF 파일 유효성을 검사합니다
 * @param file 검사할 파일
 * @returns 유효성 검사 결과
 */
export function validatePdfFile(file: File): { isValid: boolean; error?: string } {
  // 파일 타입 검증
  if (file.type !== 'application/pdf') {
    return {
      isValid: false,
      error: 'PDF 파일만 업로드 가능합니다.'
    };
  }

  // 파일 확장자 검증
  if (!file.name.toLowerCase().endsWith('.pdf')) {
    return {
      isValid: false,
      error: 'PDF 파일 확장자가 올바르지 않습니다.'
    };
  }

  // 파일 크기 검증 (20MB 제한)
  const maxSize = 20 * 1024 * 1024; // 20MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'PDF 파일 크기는 20MB 이하여야 합니다.'
    };
  }

  // 최소 크기 검증 (1KB)
  if (file.size < 1024) {
    return {
      isValid: false,
      error: 'PDF 파일이 너무 작습니다.'
    };
  }

  return { isValid: true };
}

/**
 * 파일 크기를 읽기 쉬운 형태로 포맷합니다
 * @param bytes 바이트 크기
 * @returns 포맷된 크기 문자열
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
} 