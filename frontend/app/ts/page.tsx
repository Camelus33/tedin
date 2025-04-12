'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import Spinner from '@/components/ui/Spinner';

type Book = {
  _id: string;
  title: string;
  author: string;
  totalPages: number;
  currentPage: number;
};

const LOCAL_STORAGE_BOOKS_KEY = 'habitus33_books_cache';

export default function TSSetupPage() {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const [startPage, setStartPage] = useState<number>(1);
  const [endPage, setEndPage] = useState<number>(0);
  const [enableWarmup, setEnableWarmup] = useState<boolean>(true);
  const [focusDuration, setFocusDuration] = useState<number>(11);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isStarting, setIsStarting] = useState<boolean>(false);
  // New state for book source option
  const [bookSource, setBookSource] = useState<'library' | 'new'>('library');
  
  // Redux 스토어에서 user 정보 가져오기 (auth가 아닌 user 슬라이스 사용)
  const user = useSelector((state: RootState) => state.user?.isAuthenticated);

  useEffect(() => {
    // 서버 사이드 렌더링 시 localStorage 접근 방지
    if (typeof window === 'undefined') return;
    
    // 인증 확인
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    
    // 로컬 스토리지에서 캐시된 책 목록 가져오기
    try {
      const cachedBooks = localStorage.getItem(LOCAL_STORAGE_BOOKS_KEY);
      if (cachedBooks) {
        const parsed = JSON.parse(cachedBooks) as Book[];
        console.log('로컬 스토리지에서 책 목록 가져옴:', parsed.length + '권');
        if (parsed.length > 0) {
          setBooks(parsed);
          setSelectedBookId(parsed[0]._id);
          setStartPage(parsed[0].currentPage);
          setEndPage(Math.min(parsed[0].currentPage + 10, parsed[0].totalPages));
          // 로컬 스토리지에 데이터가 있더라도 최신 데이터를 가져오기 위해 API 호출을 계속 진행
        }
      }
    } catch (e) {
      console.error('로컬 스토리지에서 책 목록 가져오기 실패:', e);
    }
    
    // Fetch user's books from the API
    const fetchBooks = async () => {
      try {
        console.log('책 목록 불러오기 시작...');
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10초 타임아웃
        
        const response = await fetch('http://localhost:8000/api/books', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache', // 캐시 방지
            'Pragma': 'no-cache'
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        console.log('API 응답 상태:', response.status);
        
        if (!response.ok) {
          throw new Error(`책 목록을 불러오는 데 실패했습니다 (${response.status})`);
        }

        const data = await response.json();
        console.log('받은 데이터 구조:', JSON.stringify(data).substring(0, 200));
        console.log('데이터 타입:', Array.isArray(data) ? '배열' : typeof data);
        if (typeof data === 'object') {
          console.log('객체 키:', Object.keys(data));
        }
        
        // 데이터 안전하게 처리
        let bookList: Book[] = [];
        
        if (Array.isArray(data.books)) {
          console.log('data.books 형태의 데이터');
          bookList = data.books;
        } else if (Array.isArray(data)) {
          console.log('배열 형태의 데이터');
          bookList = data;
        } else if (data.books === undefined && typeof data === 'object' && data !== null) {
          // 다른 형태의 응답일 경우
          console.log('다른 형태의 데이터 시도');
          if (data.data && Array.isArray(data.data)) {
            bookList = data.data;
          }
        }
        
        console.log('최종 처리된 책 목록 수:', bookList.length);
        
        // 책 목록이 성공적으로 로드되면 로컬 스토리지에 저장
        if (bookList.length > 0) {
          try {
            localStorage.setItem(LOCAL_STORAGE_BOOKS_KEY, JSON.stringify(bookList));
            console.log('책 목록을 로컬 스토리지에 저장함');
          } catch (e) {
            console.error('로컬 스토리지에 책 목록 저장 실패:', e);
          }
        }
        
        setBooks(bookList);
        
        // 책이 있으면 첫 번째 책 선택
        if (bookList.length > 0) {
          console.log('첫 번째 책 선택:', bookList[0].title);
          setSelectedBookId(bookList[0]._id);
          setStartPage(bookList[0].currentPage);
          setEndPage(Math.min(bookList[0].currentPage + 10, bookList[0].totalPages));
        } else {
          console.log('책이 없어 새 책 추가 모드로 전환');
          // 책이 없으면 새 책 추가 옵션으로 전환
          setBookSource('new');
        }
      } catch (err: any) {
        console.error('책 목록 로드 오류:', err);
        
        // Skip error handling for AbortError (component unmounting)
        if (err.name === 'AbortError') {
          console.log('Fetch aborted - component likely unmounted');
          return;
        }
        
        // 이미 로컬 스토리지에서 책을 불러왔는지 확인
        const hasCachedBooks = books.length > 0;
        
        if (!hasCachedBooks) {
          // 개발 환경에서는 테스트 데이터 제공
          if (process.env.NODE_ENV === 'development') {
            console.log('개발 환경에서 테스트 데이터 사용');
            const testBooks: Book[] = [
              {
                _id: '67f5c742c37f6843551a6fc7', // 서버 로그에서 발견된 ID 사용
                title: '데이터 중심 애플리케이션 설계',
                author: '마틴 클레프만',
                totalPages: 450,
                currentPage: 120
              }
            ];
            setBooks(testBooks);
            setSelectedBookId(testBooks[0]._id);
            setStartPage(testBooks[0].currentPage);
            setEndPage(Math.min(testBooks[0].currentPage + 10, testBooks[0].totalPages));
            setError('서버 연결 실패, 테스트 데이터를 사용합니다');
          } else {
            // 캐시된 책 목록이 없는 경우 에러 표시
            setError(err.message || '책 목록을 불러오는 데 실패했습니다');
            setBookSource('new');
          }
        } else {
          // 캐시된 책 목록이 있는 경우 경고 메시지만 표시하고 계속 진행
          console.log('API 호출 실패했지만 캐시된 책 목록으로 계속 진행');
          setError('최신 책 정보를 불러올 수 없습니다. 캐시된 데이터를 사용합니다.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, [router, books.length]);

  const handleBookChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const bookId = e.target.value;
    setSelectedBookId(bookId);
    
    const selectedBook = books?.find(book => book._id === bookId);
    if (selectedBook) {
      setStartPage(selectedBook.currentPage);
      setEndPage(Math.min(selectedBook.currentPage + 10, selectedBook.totalPages));
    }
  };

  const selectedBook = books?.find(book => book._id === selectedBookId);

  const handleStartSession = async () => {
    try {
      setIsStarting(true);
      setError('');
      
      // 서버 사이드 렌더링 확인
      if (typeof window === 'undefined') return;
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('로그인이 필요합니다');
        return;
      }
      
      // If user selected "new book" option, redirect to book creation page
      if (bookSource === 'new') {
        router.push('/books/new');
        return;
      }
      
      // Validate book selection
      if (!selectedBookId) {
        setError('독서할 책을 선택해주세요');
        return;
      }
      
      // Create a new session
      const response = await fetch('http://localhost:8000/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookId: selectedBookId,
          mode: 'TS',
          startPage,
          endPage,
          durationSec: focusDuration * 60,
          status: 'pending',
        }),
      });

      if (!response.ok) {
        throw new Error(`세션 생성에 실패했습니다 (${response.status})`);
      }

      const data = await response.json();
      console.log('세션 생성 성공:', data);

      // Navigate to the appropriate next page
      if (enableWarmup) {
        router.push(`/ts/warmup?sessionId=${data._id}`);
      } else {
        router.push(`/ts/reading?sessionId=${data._id}`);
      }
    } catch (err: any) {
      console.error('세션 시작 오류:', err);
      setError(err.message || '세션 시작에 실패했습니다');
    } finally {
      setIsStarting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto max-w-md">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h1 className="text-2xl font-bold text-center mb-6">TS 모드 설정</h1>
          
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
              {error}
            </div>
          )}
          
          {/* Book source selector */}
          <div className="mb-6">
            <div className="flex w-full rounded-lg border border-gray-200 overflow-hidden mb-2">
              <button
                type="button"
                onClick={() => setBookSource('library')}
                className={`flex-1 py-3 text-center ${
                  bookSource === 'library'
                    ? 'bg-indigo-500 text-white font-medium'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                내 서재에서 선택
              </button>
              <button
                type="button"
                onClick={() => setBookSource('new')}
                className={`flex-1 py-3 text-center ${
                  bookSource === 'new'
                    ? 'bg-indigo-500 text-white font-medium'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                새 책 추가하기
              </button>
            </div>
            
            {bookSource === 'library' && books.length === 0 && (
              <div className="text-center py-6 px-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-yellow-700 mb-4">서재에 등록된 책이 없습니다.</p>
                <Button
                  onClick={() => setBookSource('new')}
                  variant="outline"
                  size="sm"
                >
                  새 책 추가하기
                </Button>
              </div>
            )}
          </div>

          {bookSource === 'new' ? (
            <div className="text-center p-4">
              <p className="mb-4">새 책을 추가하고 TS 모드를 시작합니다.</p>
              <Button
                onClick={() => router.push('/books/new')}
                variant="default"
                fullWidth
              >
                새 책 등록하기
              </Button>
            </div>
          ) : books.length > 0 ? (
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  독서할 책 선택
                </label>
                {/* 책 선택을 위한 스크롤 가능한 컨테이너로 변경 */}
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg shadow-inner">
                  {books.map((book) => (
                    <div
                      key={book._id}
                      onClick={() => {
                        setSelectedBookId(book._id);
                        setStartPage(book.currentPage);
                        setEndPage(Math.min(book.currentPage + 10, book.totalPages));
                      }}
                      className={`p-3 cursor-pointer border-b border-gray-100 hover:bg-indigo-50 transition-colors ${
                        selectedBookId === book._id ? 'bg-indigo-100 border-l-4 border-l-indigo-500' : ''
                      }`}
                    >
                      <h3 className="font-bold text-gray-900">{book.title}</h3>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-sm text-gray-600">{book.author}</p>
                        <span className="text-xs bg-gray-100 text-gray-700 py-1 px-2 rounded-full">
                          {book.currentPage} / {book.totalPages} 페이지
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startPage" className="block text-sm font-medium text-gray-700 mb-1">
                    시작 페이지
                  </label>
                  <input
                    id="startPage"
                    type="number"
                    min={1}
                    max={selectedBook?.totalPages || 1}
                    value={startPage}
                    onChange={(e) => setStartPage(Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label htmlFor="endPage" className="block text-sm font-medium text-gray-700 mb-1">
                    목표 페이지
                  </label>
                  <input
                    id="endPage"
                    type="number"
                    min={startPage}
                    max={selectedBook?.totalPages || 1}
                    value={endPage}
                    onChange={(e) => setEndPage(Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  예열 훈련
                </label>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <input
                      id="warmup-yes"
                      type="radio"
                      name="warmup"
                      checked={enableWarmup}
                      onChange={() => setEnableWarmup(true)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="warmup-yes" className="ml-2 text-sm text-gray-700">
                      예열 사용 (2분)
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="warmup-no"
                      type="radio"
                      name="warmup"
                      checked={!enableWarmup}
                      onChange={() => setEnableWarmup(false)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="warmup-no" className="ml-2 text-sm text-gray-700">
                      바로 시작
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="focusDuration" className="block text-sm font-medium text-gray-700 mb-1">
                  집중 시간
                </label>
                <select
                  id="focusDuration"
                  value={focusDuration}
                  onChange={(e) => setFocusDuration(Number(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="5">5분</option>
                  <option value="10">10분</option>
                  <option value="11">11분</option>
                  <option value="15">15분</option>
                  <option value="20">20분</option>
                  <option value="25">25분</option>
                  <option value="30">30분</option>
                  <option value="45">45분</option>
                  <option value="60">1시간</option>
                </select>
              </div>

              <Button
                type="button"
                onClick={handleStartSession}
                variant="default"
                fullWidth
                disabled={isStarting}
              >
                {isStarting ? '세션 시작 중...' : '세션 시작하기'}
              </Button>
            </form>
          ) : (
            <div className="text-center p-4">
              <p className="mb-4">등록된 책이 없습니다. 새 책을 추가해주세요.</p>
              <Button
                onClick={() => setBookSource('new')}
                variant="default"
              >
                책 등록하기
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 