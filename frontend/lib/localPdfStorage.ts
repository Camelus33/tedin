import { openDB, DBSchema, IDBPDatabase } from 'idb';

// IndexedDB 스키마 정의
interface HabitusDBSchema extends DBSchema {
  pdfs: {
    key: string; // bookId
    value: {
      id: string;
      fileName: string;
      fileData: ArrayBuffer;
      fileSize: number;
      uploadDate: Date;
      lastAccessed: Date;
      metadata?: {
        title?: string;
        author?: string;
        totalPages?: number;
        fingerprint?: string;
      };
    };
    indexes: {
      'fileName': string;
      'uploadDate': Date;
      'lastAccessed': Date;
    };
  };
}

// 데이터베이스 연결
let dbPromise: Promise<IDBPDatabase<HabitusDBSchema>> | null = null;

const getDB = async (): Promise<IDBPDatabase<HabitusDBSchema>> => {
  if (!dbPromise) {
    dbPromise = openDB<HabitusDBSchema>('HabitusDB', 1, {
      upgrade(db) {
        // PDF 저장소 생성
        if (!db.objectStoreNames.contains('pdfs')) {
          const pdfStore = db.createObjectStore('pdfs', { keyPath: 'id' });
          pdfStore.createIndex('fileName', 'fileName');
          pdfStore.createIndex('uploadDate', 'uploadDate');
          pdfStore.createIndex('lastAccessed', 'lastAccessed');
        }
      },
    });
  }
  return dbPromise;
};

// PDF 파일 저장
export const storePdfLocally = async (
  bookId: string,
  file: File,
  metadata?: {
    title?: string;
    author?: string;
    totalPages?: number;
    fingerprint?: string;
  }
): Promise<void> => {
  try {
    const db = await getDB();
    const fileData = await file.arrayBuffer();
    
    const pdfData = {
      id: bookId,
      fileName: file.name,
      fileData,
      fileSize: file.size,
      uploadDate: new Date(),
      lastAccessed: new Date(),
      metadata,
    };

    await db.put('pdfs', pdfData);
    console.log(`PDF 로컬 저장 완료: ${file.name} (${bookId})`);
  } catch (error) {
    console.error('PDF 로컬 저장 실패:', error);
    throw new Error('PDF 파일을 로컬에 저장하는데 실패했습니다.');
  }
};

// PDF 파일 로드
export const loadPdfFromLocal = async (bookId: string): Promise<ArrayBuffer | null> => {
  try {
    const db = await getDB();
    const pdfData = await db.get('pdfs', bookId);
    
    if (!pdfData) {
      console.warn(`로컬에서 PDF를 찾을 수 없습니다: ${bookId}`);
      return null;
    }

    // 마지막 접근 시간 업데이트
    await db.put('pdfs', {
      ...pdfData,
      lastAccessed: new Date(),
    });

    console.log(`PDF 로컬 로드 완료: ${pdfData.fileName}`);
    return pdfData.fileData;
  } catch (error) {
    console.error('PDF 로컬 로드 실패:', error);
    return null;
  }
};

// PDF 파일 존재 확인
export const checkPdfExists = async (bookId: string): Promise<boolean> => {
  try {
    const db = await getDB();
    const pdfData = await db.get('pdfs', bookId);
    return !!pdfData;
  } catch (error) {
    console.error('PDF 존재 확인 실패:', error);
    return false;
  }
};

// PDF 파일 삭제
export const deletePdfFromLocal = async (bookId: string): Promise<void> => {
  try {
    const db = await getDB();
    await db.delete('pdfs', bookId);
    console.log(`PDF 로컬 삭제 완료: ${bookId}`);
  } catch (error) {
    console.error('PDF 로컬 삭제 실패:', error);
    throw new Error('PDF 파일을 삭제하는데 실패했습니다.');
  }
};

// 저장된 PDF 목록 조회
export const getStoredPdfList = async (): Promise<Array<{
  id: string;
  fileName: string;
  fileSize: number;
  uploadDate: Date;
  lastAccessed: Date;
  metadata?: any;
}>> => {
  try {
    const db = await getDB();
    const allPdfs = await db.getAll('pdfs');
    
    return allPdfs.map(pdf => ({
      id: pdf.id,
      fileName: pdf.fileName,
      fileSize: pdf.fileSize,
      uploadDate: pdf.uploadDate,
      lastAccessed: pdf.lastAccessed,
      metadata: pdf.metadata,
    }));
  } catch (error) {
    console.error('PDF 목록 조회 실패:', error);
    return [];
  }
};

// 스토리지 사용량 조회
export const getStorageUsage = async (): Promise<{
  totalSize: number;
  fileCount: number;
  formattedSize: string;
}> => {
  try {
    const pdfList = await getStoredPdfList();
    const totalSize = pdfList.reduce((sum, pdf) => sum + pdf.fileSize, 0);
    
    const formatBytes = (bytes: number): string => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return {
      totalSize,
      fileCount: pdfList.length,
      formattedSize: formatBytes(totalSize),
    };
  } catch (error) {
    console.error('스토리지 사용량 조회 실패:', error);
    return { totalSize: 0, fileCount: 0, formattedSize: '0 Bytes' };
  }
};

// 오래된 PDF 정리 (선택사항)
export const cleanupOldPdfs = async (daysOld: number = 30): Promise<number> => {
  try {
    const db = await getDB();
    const allPdfs = await db.getAll('pdfs');
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    let deletedCount = 0;
    for (const pdf of allPdfs) {
      if (pdf.lastAccessed < cutoffDate) {
        await db.delete('pdfs', pdf.id);
        deletedCount++;
      }
    }
    
    console.log(`${deletedCount}개의 오래된 PDF 파일을 정리했습니다.`);
    return deletedCount;
  } catch (error) {
    console.error('PDF 정리 실패:', error);
    return 0;
  }
}; 