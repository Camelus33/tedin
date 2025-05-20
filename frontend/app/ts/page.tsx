'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import Spinner from '@/components/ui/Spinner';
import { Cog6ToothIcon, PlayIcon } from '@heroicons/react/24/outline';
import api from '@/lib/api'; // Import the central api instance

// 테마 색상 정의 (다른 페이지와 일관성 유지)
const cyberTheme = {
  primary: 'text-cyan-400',
  secondary: 'text-purple-400',
  bgPrimary: 'bg-gray-900',
  bgSecondary: 'bg-gray-800',
  cardBg: 'bg-gray-800/60', 
  borderPrimary: 'border-cyan-500',
  borderSecondary: 'border-purple-500',
  gradient: 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900',
  textMuted: 'text-gray-400',
  textLight: 'text-gray-300',
  inputBg: 'bg-gray-700/50', // 입력 필드 배경
  inputBorder: 'border-gray-600',
  inputFocusBorder: 'focus:border-cyan-500',
  inputFocusRing: 'focus:ring-cyan-500/50',
  buttonPrimaryBg: 'bg-cyan-500',
  buttonPrimaryHoverBg: 'hover:bg-cyan-600',
  buttonDisabledBg: 'disabled:bg-gray-500',
  buttonOutlineBorder: 'border-gray-300',
  buttonOutlineText: 'text-gray-300',
  buttonOutlineHoverBg: 'hover:bg-gray-200',
  errorText: 'text-red-400',
};

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
  const [bookSource, setBookSource] = useState<'library' | 'new'>('library');
  
  // Redux 스토어에서 user 정보 가져오기 (auth가 아닌 user 슬라이스 사용)
  const user = useSelector((state: RootState) => state.user?.isAuthenticated);

  // Handle bookId query parameter from URL
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const queryBookId = params.get('bookId');
    if (queryBookId) {
      setSelectedBookId(queryBookId);
    }
  }, [books]);

  // Update start and end pages when a book is selected
  useEffect(() => {
    const selectedBook = books.find(b => b._id === selectedBookId);
    if (selectedBook) {
      setStartPage(selectedBook.currentPage);
      setEndPage(Math.min(selectedBook.currentPage + 10, selectedBook.totalPages));
    }
  }, [selectedBookId, books]);

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
        let parsed = JSON.parse(cachedBooks) as Book[];
        // _id 없는 책은 무시
        parsed = parsed.filter(book => !!book._id);
        console.log('로컬 스토리지에서 책 목록 가져옴:', parsed.length + '권');
        if (parsed.length > 0) {
          setBooks(parsed);
          // 첫 번째 책으로 초기화는 아래 useEffect에서 처리
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
        
        const response = await api.get('/books', {
          signal: controller.signal,
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });

        clearTimeout(timeoutId);
        console.log('API 응답 상태:', response.status);
        
        const data = response.data;
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
            setError(err.message || '내 서재 목록을 가져오는 데 문제가 생겼어요');
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

  // books 배열이 바뀔 때마다 첫 번째 책으로 선택 상태 초기화
  useEffect(() => {
    if (books.length > 0) {
      setSelectedBookId(books[0]._id);
      setStartPage(books[0].currentPage);
      setEndPage(Math.min(books[0].currentPage + 10, books[0].totalPages));
    }
  }, [books]);

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
      setError("");
      if (typeof window === "undefined") return;
      const token = localStorage.getItem("token");
      if (!token) {
        setError("로그인이 필요합니다");
        setIsStarting(false);
        return;
      }
      if (bookSource === "new") {
        router.push("/books/new");
        return;
      }
      if (!selectedBookId) {
        setError("읽을 책을 선택해주세요");
        setIsStarting(false);
        return;
      }
      if (!selectedBook) {
        setError('선택된 책 정보를 찾을 수 없습니다');
        setIsStarting(false);
        return;
      }
      if (startPage >= endPage) {
        setError('시작 페이지는 종료 페이지보다 작아야 합니다.');
        setIsStarting(false);
        return;
      }
      if (endPage > selectedBook.totalPages) {
        setError('종료 페이지가 책의 총 페이지를 초과할 수 없습니다.');
        setIsStarting(false);
        return;
      }
      if (focusDuration <= 0) {
        setError('집중 시간은 1분 이상이어야 합니다.');
        setIsStarting(false);
        return;
      }
      const payload = {
        bookId: selectedBookId,
        startPage,
        endPage,
        durationSec: focusDuration * 60,
        warmup: enableWarmup,
        mode: "TS",
      };
      const res = await api.post("/sessions", payload, { headers: { Authorization: `Bearer ${token}` } });
      const newSession = res.data;
      if (!newSession || !newSession._id) {
        setError("세션 생성 실패");
        setIsStarting(false);
        return;
      }
      // 세션이 실제로 DB에 반영됐는지 GET으로 확인
      try {
        const getRes = await api.get(`/sessions/${newSession._id}`, { headers: { Authorization: `Bearer ${token}` } });
        if (getRes.data && getRes.data._id) {
          // durationSec sanity check
          if (getRes.data.durationSec < 60) {
            setError("세션 집중 시간이 비정상적으로 짧게 저장되었습니다. 다시 시도해 주세요.");
            setIsStarting(false);
            return;
          }
        router.push(`/ts/session/${newSession._id}`);
      } else {
          setError("세션 생성 후 조회 실패");
        }
      } catch (err) {
        setError("세션 생성 후 조회 실패(404)");
      }
      setIsStarting(false);
    } catch (err: any) {
      setError(err?.response?.data?.error || "세션 시작 중 오류 발생");
      setIsStarting(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${cyberTheme.gradient} p-4`}>
        <Spinner size="lg" color="cyan" />
        <p className={`mt-4 ${cyberTheme.textMuted}`}>내 서재 정보 가져오는 중...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${cyberTheme.gradient} flex items-center justify-center p-4 md:p-6`}>
      <div className={`w-full max-w-2xl ${cyberTheme.cardBg} p-6 rounded-lg shadow-xl border ${cyberTheme.borderSecondary}/30`}>
        <div className="flex flex-col space-y-4">
          <div>
            <h1 className={`text-2xl font-bold mb-2 ${cyberTheme.primary} flex items-center gap-2`}> 
              <Cog6ToothIcon className="h-6 w-6" />
              Time Sprint 설정
            </h1>
            <p className={`${cyberTheme.textMuted} text-sm mb-4`}>
              읽을 범위를 설정하고, 측정을 시작하세요.
            </p>
          </div>

          {/* books 배열이 비어있으면 안내 메시지와 새 책 추가 버튼만 노출 */}
          {books.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <p className={`${cyberTheme.textMuted} text-base`}>등록된 책이 없습니다. 먼저 책을 추가해 주세요.</p>
              <Button onClick={() => router.push('/books/new')} className={`${cyberTheme.buttonPrimaryBg} text-white`}>새 책 추가</Button>
            </div>
          ) : (
            // 기존 드롭다운 및 설정 UI 렌더링
            <>
          <div>
            <label htmlFor="book-select" className={`block text-sm font-medium mb-1 ${cyberTheme.textLight}`}>1. 어떤 기억을 활성화할까요? (책 선택)</label>
            <div className="flex items-center gap-2 mt-1">
              <select
                id="book-select"
                value={selectedBookId}
                onChange={handleBookChange}
                disabled={isLoading || bookSource === 'new'}
                className={`flex-grow ${cyberTheme.inputBg} border ${cyberTheme.inputBorder} ${cyberTheme.textLight} rounded-md p-2 text-sm focus:outline-none ${cyberTheme.inputFocusRing} ${cyberTheme.inputFocusBorder} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {books.map((book) => (
                      book._id && (
                  <option key={book._id} value={book._id}>
                    {book.title} ({book.author})
                  </option>
                      )
                ))}
              </select>
              <Button 
                 variant="outline"
                 size="sm" 
                 onClick={() => router.push('/books/new')}
                 className={`${cyberTheme.buttonOutlineBorder} ${cyberTheme.buttonOutlineText} ${cyberTheme.buttonOutlineHoverBg} border whitespace-nowrap`}
              >
                새 책 추가
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className={`text-sm font-medium ${cyberTheme.textLight}`}>2. 어디부터 어디까지 읽을까요? (페이지 범위)</h2>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="flex-1 w-full">
                <label htmlFor="start-page" className={`block text-xs font-medium mb-1 ${cyberTheme.textMuted}`}>시작 페이지</label>
                <input
                  type="number"
                  id="start-page"
                  value={startPage}
                  onChange={(e) => setStartPage(Number(e.target.value))}
                  min="1"
                  max={selectedBook?.totalPages || 1}
                  className={`w-full ${cyberTheme.inputBg} border ${cyberTheme.inputBorder} ${cyberTheme.textLight} rounded-md p-2 text-sm focus:outline-none ${cyberTheme.inputFocusRing} ${cyberTheme.inputFocusBorder}`}
                  aria-describedby="page-range-hint"
                />
              </div>
              <span className={`text-lg font-medium ${cyberTheme.textMuted} sm:mt-4`}>~</span>
              <div className="flex-1 w-full">
                <label htmlFor="end-page" className={`block text-xs font-medium mb-1 ${cyberTheme.textMuted}`}>종료 페이지</label>
                <input
                  type="number"
                  id="end-page"
                  value={endPage}
                  onChange={(e) => setEndPage(Number(e.target.value))}
                  min={startPage}
                  max={selectedBook?.totalPages || 10}
                  className={`w-full ${cyberTheme.inputBg} border ${cyberTheme.inputBorder} ${cyberTheme.textLight} rounded-md p-2 text-sm focus:outline-none ${cyberTheme.inputFocusRing} ${cyberTheme.inputFocusBorder}`}
                  aria-describedby="page-range-hint"
                />
              </div>
            </div>
            <p id="page-range-hint" className={`text-xs ${cyberTheme.textMuted}`}> 
              현재 선택: {selectedBook?.title || '책 없음'} (총 {selectedBook?.totalPages || '-'} 페이지, 현재 {selectedBook?.currentPage || '-'} 페이지)
            </p>
          </div>

          <div className="space-y-2">
            <h2 className={`text-sm font-medium ${cyberTheme.textLight}`}>3. 추가 설정</h2>
            <div className="flex items-center justify-between py-1">
              <label htmlFor="warmup-toggle" className={`text-xs ${cyberTheme.textMuted} flex-grow mr-2`}>속독 팁 활성화 (뇌 준비 운동)</label>
              <button
                id="warmup-toggle"
                type="button"
                role="switch"
                aria-checked={enableWarmup}
                onClick={() => setEnableWarmup(!enableWarmup)}
                className={`${enableWarmup ? cyberTheme.buttonPrimaryBg : 'bg-gray-600'} relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-800`}
              >
                <span className="sr-only">속독 팁 활성화</span>
                <span aria-hidden="true" className={`${enableWarmup ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}></span>
              </button>
            </div>
            <div className="py-1">
              <label htmlFor="focus-duration" className={`block text-xs font-medium mb-1 ${cyberTheme.textMuted}`}>읽는 시간 설정 (분)</label>
              <div className="flex items-center gap-2 mt-1">
                 <input
                    type="range"
                    id="focus-duration"
                    min="5"
                    max="16"
                    step="1"
                    value={focusDuration}
                    onChange={(e) => setFocusDuration(Number(e.target.value))}
                    className="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer range-sm accent-cyan-500 flex-grow"
                 />
                 <span className={`text-sm font-medium ${cyberTheme.textLight} w-8 text-right`}>{focusDuration}분</span>
              </div>
            </div>
          </div>

          {error && <p className={`text-sm ${cyberTheme.errorText} text-center`}>{error}</p>}
          
          <div className="mt-4">
            <Button
              onClick={handleStartSession}
              disabled={isStarting || isLoading || !selectedBookId}
              className={`w-full ${cyberTheme.buttonPrimaryBg} ${cyberTheme.buttonPrimaryHoverBg} text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${cyberTheme.buttonDisabledBg}`}
            >
              {isStarting ? (
                <Spinner size="sm" color="white" /> 
              ) : (
                <PlayIcon className="h-5 w-5" />
              )}
              측정 시작 ({endPage - startPage + 1} 페이지)
            </Button>
          </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 