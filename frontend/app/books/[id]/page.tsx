'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Button from '@/components/common/Button';
import useBooks from '@/hooks/useBooks';

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
  const [notes, setNotes] = useState<Note[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeTab, setActiveTab] = useState<'notes' | 'sessions'>('notes');
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
  
  // Fetch notes and sessions when book is loaded
  useEffect(() => {
    if (!bookId || !book) return;
    
    const fetchRelatedData = async () => {
      try {
        // Get auth token
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/auth/login');
          return;
        }
        
        // Fetch notes and sessions in parallel
        const [notesResponse, sessionsResponse] = await Promise.allSettled([
          fetch(`${API_BASE_URL}/notes?bookId=${bookId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/sessions?bookId=${bookId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
          })
        ]);
        
        // Process notes
        if (notesResponse.status === 'fulfilled' && notesResponse.value.ok) {
          try {
            const notesData = await notesResponse.value.json();
            console.log('Notes data:', notesData);
            
            if (Array.isArray(notesData)) {
              setNotes(notesData);
            } else if (notesData && Array.isArray(notesData.notes)) {
              setNotes(notesData.notes);
            } else {
              setNotes([]);
            }
          } catch (error) {
            console.error('Error parsing notes:', error);
            setNotes([]);
          }
        } else {
          console.log('Failed to load notes');
          setNotes([]);
        }
        
        // Process sessions
        if (sessionsResponse.status === 'fulfilled' && sessionsResponse.value.ok) {
          try {
            const sessionsData = await sessionsResponse.value.json();
            console.log('Sessions data:', sessionsData);
            
            if (Array.isArray(sessionsData)) {
              setSessions(sessionsData);
            } else if (sessionsData && Array.isArray(sessionsData.sessions)) {
              setSessions(sessionsData.sessions);
            } else {
              setSessions([]);
            }
          } catch (error) {
            console.error('Error parsing sessions:', error);
            setSessions([]);
          }
        } else {
          console.log('Failed to load sessions');
          setSessions([]);
        }
      } catch (error: any) {
        console.error('Error loading related data:', error);
        // Don't display errors if it's just an abort error from unmounting
        if (error.name !== 'AbortError') {
          // Still keep the book data even if notes/sessions fail
        }
      }
    };
    
    fetchRelatedData();
  }, [bookId, router, book]);

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
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Book Cover */}
              <div className="w-full md:w-1/3 lg:w-1/4">
                <div className="aspect-[2/3] bg-gray-100 rounded-lg overflow-hidden">
                  {bookData.coverImage ? (
                    <img
                      src={bookData.coverImage}
                      alt={bookData.title || '책 제목 없음'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-gray-400">
                      <span>표지 이미지 없음</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Book Info */}
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">{bookData.title || '제목 없음'}</h1>
                <p className="text-gray-600 mb-4">{bookData.author || '저자 미상'}</p>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-6">
                  <div>
                    <span className="text-sm text-gray-500">장르</span>
                    <p>{localMetadata?.genre || bookData.category || bookData.genre || '미분류'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">독서 목적</span>
                    <p>{localMetadata?.readingPurpose || bookData.readingPurpose || bookData.readingGoal || '설정되지 않음'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">총 페이지</span>
                    <p>{(bookData.totalPages && bookData.totalPages > 0) ? `${bookData.totalPages}페이지` : '페이지 정보 없음'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">등록일</span>
                    <p>{bookData.createdAt ? formatDate(bookData.createdAt) : '등록일 정보 없음'}</p>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>독서 진행률</span>
                    <span className="font-medium">{getProgressPercentage()}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-indigo-600 h-2.5 rounded-full" 
                      style={{ width: `${getProgressPercentage()}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>현재 {bookData.currentPage || 0}페이지</span>
                    <span>{bookData.totalPages || 0}페이지</span>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <Button 
                    variant="default" 
                    className="flex-1"
                    onClick={handleStartReading}
                  >
                    TS 모드로 읽기
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => router.push(`/zengo?bookId=${bookId}`)}
                  >
                    Zengo 모드
                  </Button>
                </div>
                
                {/* 책 관리 버튼 */}
                <div className="flex gap-3 mt-3">
                  <Button
                    variant="ghost"
                    className="flex-1 border border-gray-200"
                    onClick={handleEditBook}
                  >
                    책 정보 수정
                  </Button>
                  <Button
                    variant="ghost"
                    className="flex-1 text-red-600 border border-red-200 hover:bg-red-50"
                    onClick={handleDeleteBook}
                    disabled={isDeleting}
                  >
                    {isDeleting ? '삭제 중...' : '책 삭제하기'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'notes'
                    ? 'border-b-2 border-indigo-500 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('notes')}
              >
                독서 메모
              </button>
              <button
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'sessions'
                    ? 'border-b-2 border-indigo-500 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('sessions')}
              >
                세션 기록
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {activeTab === 'notes' ? (
              <>
                {notes.length === 0 ? (
                  <div className="text-center p-8">
                    <p className="text-gray-500 mb-4">아직 작성된 메모가 없습니다.</p>
                    <Button 
                      variant="outline"
                      onClick={() => router.push(`/books/${bookId}/notes/new`)}
                    >
                      메모 작성하기
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notes.map((note) => (
                      <div key={note._id} className="border rounded-lg p-4 hover:shadow transition">
                        <div className="flex justify-between items-start mb-2">
                          <div className="inline-block px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            {note.type === 'quote' ? '인용' : note.type === 'thought' ? '생각' : '질문'}
                          </div>
                          <div className="text-xs text-gray-500">{formatDate(note.createdAt)}</div>
                        </div>
                        <p className="text-gray-800 mb-2">{note.content}</p>
                        {note.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {note.tags.map((tag, index) => (
                              <span 
                                key={index} 
                                className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    
                    <div className="mt-4 text-center">
                      <Button 
                        variant="outline"
                        onClick={() => router.push(`/books/${bookId}/notes/new`)}
                      >
                        새 메모 작성
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                {sessions.length === 0 ? (
                  <div className="text-center p-8">
                    <p className="text-gray-500 mb-4">아직 독서 세션 기록이 없습니다.</p>
                    <Button 
                      variant="outline"
                      onClick={handleStartReading}
                    >
                      TS 모드 시작하기
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sessions.map((session) => (
                      <div key={session._id} className="border rounded-lg p-4 hover:shadow transition">
                        <div className="flex justify-between items-start mb-2">
                          <div className="text-sm font-medium">{formatDate(session.createdAt)}</div>
                          {session.ppm && (
                            <div className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs">
                              {session.ppm.toFixed(1)} PPM
                            </div>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 mb-3">
                          <div className="text-center">
                            <div className="text-sm text-gray-500">시작 페이지</div>
                            <div className="font-medium">{session.startPage}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-gray-500">종료 페이지</div>
                            <div className="font-medium">{session.actualEndPage || session.endPage}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-gray-500">소요 시간</div>
                            <div className="font-medium">{Math.round(session.durationSec / 60)}분</div>
                          </div>
                        </div>
                        
                        {session.memo && (
                          <div className="mt-2">
                            <div className="text-sm text-gray-500 mb-1">메모</div>
                            <p className="text-gray-800">{session.memo}</p>
                          </div>
                        )}
                        
                        <div className="mt-3 text-right">
                          <Button 
                            variant="ghost" 
                            onClick={() => router.push(`/ts/result?sessionId=${session._id}`)}
                          >
                            상세 보기
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 