'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/common/Button';

type Book = {
  _id: string;
  title: string;
  author: string;
  genre?: string;
  coverImage?: string;
  totalPages: number;
  currentPage: number;
  status?: 'reading' | 'completed';
};

type Session = {
  _id: string;
  startTime: Date;
  duration: number; // in seconds
  pages: number;
  notes: string;
};

export default function ReadingSessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookId = searchParams.get('bookId') || '';
  
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  
  // Session tracking states
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [startPage, setStartPage] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showSaveNotes, setShowSaveNotes] = useState<boolean>(false);
  
  // Timer ref for cleanup
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Fetch book data
  useEffect(() => {
    const fetchBook = async () => {
      if (!bookId) {
        // If no book ID, redirect to book selection
        router.push('/books');
        return;
      }
      
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/auth/login');
          return;
        }
        
        const response = await fetch(`/api/books/${bookId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('책 정보를 불러오는 데 실패했습니다.');
        }
        
        const data = await response.json();
        setBook(data.book);
        setStartPage(data.book.currentPage);
        setCurrentPage(data.book.currentPage);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBook();
  }, [bookId, router]);
  
  // Timer effect to track elapsed time
  useEffect(() => {
    if (isSessionActive && !isPaused) {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isSessionActive, isPaused]);
  
  // Format time helpers
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Handle starting the reading session
  const handleStartSession = () => {
    setSessionStartTime(new Date());
    setIsSessionActive(true);
    setElapsedTime(0);
  };
  
  // Handle pausing/resuming the session
  const handlePauseResume = () => {
    setIsPaused(prev => !prev);
  };
  
  // Handle incrementing/decrementing page
  const handlePageChange = (increment: number) => {
    setCurrentPage(prev => {
      const newPage = prev + increment;
      // Ensure we don't go below start page or beyond total pages
      if (newPage < startPage) return startPage;
      if (book && newPage > book.totalPages) return book.totalPages;
      return newPage;
    });
  };
  
  // Handle finishing the session
  const handleFinishSession = async () => {
    if (!book) return;
    
    // Show notes dialog first
    setShowSaveNotes(true);
  };
  
  // Handle saving the session
  const handleSaveSession = async () => {
    if (!book || !sessionStartTime) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }
      
      // Calculate pages read
      const pagesRead = currentPage - startPage + 1;
      
      // Save the session
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookId: book._id,
          startTime: sessionStartTime,
          duration: elapsedTime,
          startPage,
          endPage: currentPage,
          pagesRead,
          notes,
        }),
      });
      
      if (!response.ok) {
        throw new Error('세션 저장에 실패했습니다.');
      }
      
      // Update the book's current page
      await fetch(`/api/books/${book._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPage,
        }),
      });
      
      // Redirect to dashboard
      router.push('/dashboard?sessionComplete=true');
    } catch (err: any) {
      setError(err.message);
    }
  };
  
  // Skip session and just update current page
  const handleSkipSession = async () => {
    if (!book) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }
      
      // Update the book's current page
      await fetch(`/api/books/${book._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPage,
        }),
      });
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };
  
  // If error, show error message
  if (error) {
    return (
      <div className="min-h-screen bg-blue-50 p-4 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
          <h1 className="text-2xl font-bold mb-4">오류 발생</h1>
          <p className="text-red-600 mb-6">{error}</p>
          <Button
            href="/books"
            variant="default"
          >
            서재로 돌아가기
          </Button>
        </div>
      </div>
    );
  }
  
  // If loading or no book, show loading spinner
  if (isLoading || !book) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <p>로딩 중...</p>
      </div>
    );
  }
  
  // Calculate reading stats
  const pagesRead = currentPage - startPage + 1;
  const readingSpeed = elapsedTime > 0 ? Math.round((pagesRead / elapsedTime) * 3600) : 0; // pages per hour
  const progressPercentage = Math.round((currentPage / book.totalPages) * 100);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto max-w-2xl">
        {/* Book header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center mb-4">
            <Link href="/books" className="text-indigo-600 mr-4">
              ← 서재
            </Link>
            <h1 className="text-2xl font-bold">{book.title}</h1>
          </div>
          
          <div className="flex">
            {book.coverImage ? (
              <img 
                src={book.coverImage} 
                alt={book.title} 
                className="w-24 h-36 object-cover rounded-md mr-4"
              />
            ) : (
              <div className="w-24 h-36 bg-gray-200 rounded-md flex items-center justify-center mr-4">
                <span className="text-gray-400 text-xs">No Cover</span>
              </div>
            )}
            <div>
              <p className="text-gray-700">{book.author}</p>
              {book.genre && <p className="text-gray-500 text-sm">{book.genre}</p>}
              <div className="mt-2">
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full" 
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">{progressPercentage}%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {currentPage} / {book.totalPages} 페이지
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Session Controls */}
        {!isSessionActive ? (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">TS 세션 시작</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                시작 페이지
              </label>
              <input
                type="number"
                min={1}
                max={book.totalPages}
                value={startPage}
                onChange={e => setStartPage(Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <Button
              variant="default"
              fullWidth
              onClick={handleStartSession}
            >
              시작하기
            </Button>
            <p className="text-center text-sm text-gray-500 mt-2">
              독서를 시작하면 타이머가 작동합니다
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">독서 진행 중</h2>
              <div className="text-center">
                <p className="text-2xl font-mono font-bold text-indigo-600">
                  {formatTime(elapsedTime)}
                </p>
                <p className="text-xs text-gray-500">경과 시간</p>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                현재 페이지
              </label>
              <div className="flex items-center">
                <button
                  onClick={() => handlePageChange(-1)}
                  className="p-2 bg-gray-100 rounded-l-md border border-r-0 border-gray-300"
                >
                  -
                </button>
                <input
                  type="number"
                  min={startPage}
                  max={book.totalPages}
                  value={currentPage}
                  onChange={e => setCurrentPage(Number(e.target.value))}
                  className="p-2 border border-gray-300 text-center w-20"
                />
                <button
                  onClick={() => handlePageChange(1)}
                  className="p-2 bg-gray-100 rounded-r-md border border-l-0 border-gray-300"
                >
                  +
                </button>
                <span className="ml-2 text-sm text-gray-500">/ {book.totalPages}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-indigo-50 p-3 rounded-md text-center">
                <p className="text-lg font-bold text-indigo-700">{pagesRead}</p>
                <p className="text-xs text-gray-600">읽은 페이지</p>
              </div>
              <div className="bg-green-50 p-3 rounded-md text-center">
                <p className="text-lg font-bold text-green-700">{readingSpeed}</p>
                <p className="text-xs text-gray-600">페이지/시간</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={isPaused ? "default" : "outline"}
                onClick={handlePauseResume}
              >
                {isPaused ? '다시 시작' : '일시 정지'}
              </Button>
              <Button
                variant="secondary"
                onClick={handleFinishSession}
              >
                독서 완료
              </Button>
            </div>
          </div>
        )}
        
        {/* Notes section (only visible when session is active) */}
        {isSessionActive && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">독서 노트</h2>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="이 책에서 인상적인 부분이나 새로 알게 된 내용을 메모하세요."
              className="w-full p-3 border border-gray-300 rounded-md h-40"
            ></textarea>
          </div>
        )}
        
        {/* Save notes dialog */}
        {showSaveNotes && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">독서 세션 저장</h2>
              <p className="mb-4">
                {formatTime(elapsedTime)} 동안 {pagesRead}페이지를 읽었습니다.
                세션을 저장하시겠습니까?
              </p>
              
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="이 독서 세션에 대한 메모를 남겨주세요."
                className="w-full p-3 border border-gray-300 rounded-md h-32 mb-4"
              ></textarea>
              
              <div className="flex space-x-4">
                <Button
                  variant="secondary"
                  onClick={() => setShowSaveNotes(false)}
                >
                  취소
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSkipSession}
                >
                  저장 안 함
                </Button>
                <Button
                  variant="default"
                  onClick={handleSaveSession}
                >
                  세션 저장
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 