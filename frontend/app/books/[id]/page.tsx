'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Button from '@/components/common/Button';
import { AiOutlineEdit, AiOutlineQuestionCircle, AiOutlineArrowRight } from 'react-icons/ai';
import { FiBook } from 'react-icons/fi';
import useBooks from '@/hooks/useBooks';
import TSNoteCard from '@/components/ts/TSNoteCard';

// API base URL - this should match what's used elsewhere in the app
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Define book interface that matches the structure from useBooks hook
interface BookWithId extends Omit<Book, 'id'> {
  _id: string;
  category?: string;
  genre?: string;
  readingPurpose?: string;
  readingGoal?: string;
}

type Book = {
  _id: string;
  title: string;
  author: string;
  coverImage?: string;
  totalPages: number;
  currentPage: number;
  category?: string;
  genre?: string;
  readingPurpose?: string;
  readingGoal?: string;
  status?: string;
  completionPercentage?: number;
  createdAt: string;
};

type Note = {
  _id: string;
  content: string;
  type: 'quote' | 'thought' | 'question';
  tags: string[];
  createdAt: string;
};

type Session = {
  _id: string;
  startPage: number;
  endPage: number;
  actualEndPage?: number;
  durationSec: number;
  memo?: string;
  ppm?: number;
  selfRating?: number;
  createdAt: string;
};

export default function BookDetailPage() {
  const router = useRouter();
  const params = useParams();
  const bookId = params.id as string;
  
  // Use custom hooks
  const { bookFetchState, fetchBookDetail } = useBooks();
  const [tsNotes, setTsNotes] = useState<Note[]>([]);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  
  // Destructure for cleaner access
  const { isLoading, error, book } = bookFetchState;
  
  // Fetch book and related data
  useEffect(() => {
    // Exit if no book ID
    if (!bookId) return;
    
    console.log('Fetching book detail for ID:', bookId);
    
    // Fetch the book 
    const loadBook = async () => {
      // This will handle loading state internally
      await fetchBookDetail(bookId);
    };
    
    loadBook();
  }, [bookId, fetchBookDetail]);
  
  // Fetch TS 메모 when book is loaded
  useEffect(() => {
    if (!bookId || !book) return;
    const fetchTSNotes = async () => {
      const token = localStorage.getItem('token');
      if (!token) { router.push('/auth/login'); return; }
      try {
        const res = await fetch(
          `${API_BASE_URL}/notes/book/${bookId}?originOnly=true`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        setTsNotes(Array.isArray(data) ? data : data.notes || []);
      } catch (e) {
        console.error('TS notes load error:', e);
        setTsNotes([]);
      }
    };
    fetchTSNotes();
  }, [bookId, book]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getProgressPercentage = () => {
    if (!book) return 0;
    
    // Check for valid values to avoid division by zero
    const bookData = book as unknown as BookWithId;
    const currentPage = typeof bookData.currentPage === 'number' ? bookData.currentPage : 0;
    const totalPages = typeof bookData.totalPages === 'number' && bookData.totalPages > 0 ? bookData.totalPages : 1;
    
    // Ensure percentage is between 0 and 100
    const percentage = Math.round((currentPage / totalPages) * 100);
    return Math.min(Math.max(percentage, 0), 100); // Clamp between 0 and 100
  };

  const handleStartReading = () => {
    router.push(`/ts?bookId=${bookId}`);
  };

  // 책 삭제 처리 함수
  const handleDeleteBook = async () => {
    if (!confirm('정말로 이 책을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    setIsDeleting(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/books/${bookId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('책 삭제를 실패했습니다.');
      }

      alert('책이 성공적으로 삭제되었습니다.');
      router.push('/books');
    } catch (err: any) {
      alert(`오류 발생: ${err.message}`);
      console.error('책 삭제 오류:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // 책 수정 페이지로 이동
  const handleEditBook = () => {
    router.push(`/books/${bookId}/edit`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-800">책 정보 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
          <h1 className="text-xl font-bold text-red-600 mb-4">오류 발생</h1>
          <p className="mb-6">{error || '책 정보를 찾을 수 없습니다.'}</p>
          <Button
            href="/books"
            variant="default"
          >
            책 목록으로
          </Button>
        </div>
      </div>
    );
  }

  // Cast book to our expected type
  const bookData = book as unknown as BookWithId;
  
  // Check if there's additional metadata in localStorage
  let localMetadata: any = null;
  try {
    const bookMetadataStr = localStorage.getItem('book-metadata');
    if (bookMetadataStr) {
      const allMetadata = JSON.parse(bookMetadataStr);
      if (allMetadata && allMetadata[bookId]) {
        localMetadata = allMetadata[bookId];
        console.log('Found local metadata for book:', localMetadata);
      }
    }
  } catch (error) {
    console.error('Error reading book metadata from localStorage:', error);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* App Logo/Name Header */}
        <div className="text-center mb-6">
          <h1 
            className="text-3xl font-bold text-indigo-700 cursor-pointer hover:text-indigo-800 transition-colors inline-block"
            onClick={() => router.push('/dashboard')}
          >
            Habitus33
          </h1>
        </div>
        
        {/* Book Header */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6 relative">
          {/* Action Buttons group at top right */}
          <div className="absolute top-4 right-4 flex space-x-2">
            <Button variant="outline" size="default" className="px-6" onClick={handleEditBook} aria-label="책 정보 수정">
              책 정보 수정
            </Button>
            <Button variant="default" size="default" className="px-6" onClick={handleStartReading} aria-label="TS 모드 진입">
              TS 모드 진입
            </Button>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
            {/* Book Cover and placeholder */}
            <div className="md:col-span-1 space-y-2 flex justify-center">
              <div className="w-full max-w-[200px] md:max-w-[120px] aspect-[2/3] bg-gray-200 rounded-lg overflow-hidden">
                {bookData.coverImage ? (
                  <img
                    src={bookData.coverImage}
                    alt={bookData.title || '책 제목 없음'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center w-full h-full border-2 border-gray-300 border-dashed rounded-lg text-gray-400">
                    <FiBook className="h-8 w-8 mb-2" />
                    <span className="text-xs">표지 이미지 없음</span>
                  </div>
                )}
              </div>
            </div>
            {/* Book Info */}
            <div className="md:col-span-3 space-y-3">
              <h1 className="text-3xl font-bold text-gray-800 mb-1">{bookData.title || '제목 없음'}</h1>
              <p className="text-lg text-gray-600 mb-4">{bookData.author || '저자 미상'}</p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {[
                  ['장르', localMetadata?.genre || bookData.category || bookData.genre || '미분류'],
                  ['독서 목적', localMetadata?.readingPurpose || bookData.readingPurpose || bookData.readingGoal || '설정되지 않음'],
                  ['총 페이지', (bookData.totalPages && bookData.totalPages > 0) ? `${bookData.totalPages}페이지` : '페이지 정보 없음'],
                  ['등록일', bookData.createdAt ? formatDate(bookData.createdAt) : '등록일 정보 없음'],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-baseline space-x-2">
                    <span className="text-sm text-gray-500">{label}</span>
                    <span className="text-sm font-medium text-gray-800">{value}</span>
                  </div>
                ))}
              </div>
              {/* Progress Bar */}
              <div className="flex items-center space-x-4" role="group" aria-label={`독서 진행률 ${getProgressPercentage()}%`}>
                <div className="flex-1">
                  <div className="bg-indigo-50 h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${getProgressPercentage()}%` }}
                    />
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-800" aria-live="polite">
                  {getProgressPercentage()}%
                </div>
                <div className="text-sm text-gray-500">
                  현재 {bookData.currentPage || 0} / {bookData.totalPages || 0} 페이지
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* DIKW 피라미드 Section */}
        <section className="mt-8 bg-gray-100 p-6 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl font-bold text-indigo-700">DIKW 피라미드 : 메모 진화 시스템</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <span className="font-bold text-indigo-600">D</span>
                <span>데이터</span>
              </div>
              <AiOutlineArrowRight className="text-gray-400" />
              <div className="flex items-center space-x-1">
                <span className="font-bold text-pink-500">I</span>
                <span>정보</span>
              </div>
              <AiOutlineArrowRight className="text-gray-400" />
              <div className="flex items-center space-x-1">
                <span className="font-bold text-green-500">K</span>
                <span>지식</span>
              </div>
              <AiOutlineArrowRight className="text-gray-400" />
              <div className="flex items-center space-x-1">
                <span className="font-bold text-yellow-500">W</span>
                <span>지혜</span>
              </div>
            </div>
          </div>
          {tsNotes.length === 0 ? (
            <p className="text-gray-500">아직 작성된 TS 반추 메모가 없습니다.</p>
          ) : (
            <div className="space-y-4">
              {tsNotes.map((note) => (
                <TSNoteCard
                  key={note._id}
                  note={note}
                  onUpdate={(updated: Partial<Note>) =>
                    setTsNotes((prev) =>
                      prev.map((n) => (n._id === note._id ? { ...n, ...updated } : n))
                    )
                  }
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
} 