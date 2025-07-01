'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
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

export default function TSSetupClientPage() { // 컴포넌트 이름 변경
  const t = useTranslations('ts.setup');
  const tCommon = useTranslations('ts.common');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const [startPage, setStartPage] = useState<number>(1);
  const [endPage, setEndPage] = useState<number>(0);
  const [enableWarmup, setEnableWarmup] = useState<boolean>(true);
  const [focusDuration, setFocusDuration] = useState<number>(3);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isStarting, setIsStarting] = useState<boolean>(false);
  const [bookSource, setBookSource] = useState<'library' | 'new'>('library');
  
  // Redux 스토어에서 user 정보 가져오기 (auth가 아닌 user 슬라이스 사용)
  const user = useSelector((state: RootState) => state.user?.isAuthenticated);

  // Selected book helper
  const selectedBook = books.find(b => b._id === selectedBookId);

  // URL에서 lastReadBookId를 읽고, 책 목록이 로드되면 해당 책을 선택
  useEffect(() => {
    const lastReadBookIdFromUrl = searchParams.get('lastReadBookId');
    console.log('[Effect: URL Param] lastReadBookIdFromUrl:', lastReadBookIdFromUrl, 'Books loaded:', books.length, 'Current selectedBookId:', selectedBookId);

    if (books.length > 0) {
      if (lastReadBookIdFromUrl) {
        const bookToSelect = books.find(book => book._id === lastReadBookIdFromUrl);
        if (bookToSelect) {
          console.log('[Effect: URL Param] Found book in list to select from URL:', lastReadBookIdFromUrl);
          if (selectedBookId !== lastReadBookIdFromUrl) {
            console.log('[Effect: URL Param] Setting selectedBookId from URL:', lastReadBookIdFromUrl);
            setSelectedBookId(lastReadBookIdFromUrl);
          } else {
            console.log('[Effect: URL Param] Book from URL already selected. No change needed.');
          }
        } else {
          console.log('[Effect: URL Param] Book from URL not found in books list. Current selectedBookId:', selectedBookId);
          // URL의 책 ID가 유효하지 않고, 아직 아무 책도 선택되지 않았다면 첫 번째 책 선택
          if (!selectedBookId && books.length > 0) { // selectedBookId가 비어있을 때만!
            console.log('[Effect: URL Param] Fallback to first book (URL book not found and no book selected). ID:', books[0]._id);
            setSelectedBookId(books[0]._id);
          }
        }
      } else {
        console.log('[Effect: URL Param] No lastReadBookIdFromUrl. Current selectedBookId:', selectedBookId);
        // URL 파라미터가 없고, 아직 아무 책도 선택되지 않았다면 첫 번째 책 선택
        if (!selectedBookId && books.length > 0) { // selectedBookId가 비어있을 때만!
          console.log('[Effect: URL Param] Fallback to first book (no URL param and no book selected). ID:', books[0]._id);
          setSelectedBookId(books[0]._id);
        }
      }
    }
  }, [books, searchParams]); // selectedBookId를 의존성 배열에서 제거, selectedBookId는 이 effect 내부에서만 참조

  // Update start and end pages when a book is selected
  useEffect(() => {
    console.log('[Effect: Page Update] selectedBookId changed to:', selectedBookId, 'Books available:', books.length);
    const selectedBook = books.find(b => b._id === selectedBookId);
    if (selectedBook) {
      console.log('[Effect: Page Update] Updating start/end pages for book:', selectedBook.title, 'currentPage:', selectedBook.currentPage);
      setStartPage(selectedBook.currentPage);
      setEndPage(Math.min(selectedBook.currentPage + 10, selectedBook.totalPages));
    } else {
      console.log('[Effect: Page Update] No selected book found or selectedBookId is empty.');
      // 선택된 책이 없거나 selectedBookId가 초기화되면 페이지 번호도 초기화하는 것이 좋을 수 있습니다.
      // setStartPage(1);
      // setEndPage(0); 
    }
  }, [selectedBookId, books]);

  useEffect(() => {
    // 서버 사이드 렌더링 시 localStorage 접근 방지
    if (typeof window === 'undefined') return;
    
    // 인증 확인 (필요하다면 useSelector로 Redux 상태를 확인하는 것이 더 적절할 수 있음)
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
        parsed = parsed.filter(book => !!book._id);
        console.log('로컬 스토리지에서 책 목록 가져옴:', parsed.length + '권');
        if (parsed.length > 0) {
          setBooks(parsed);
        }
      }
    } catch (e) {
      console.error('로컬 스토리지에서 책 목록 가져오기 실패:', e);
    }
    
    // Fetch user's books from the API
    const fetchBooks = async () => {
      setIsLoading(true); // API 호출 시작 시 로딩 상태 설정
      try {
        console.log('책 목록 불러오기 시작...');
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await api.get('/books', {
          signal: controller.signal,
          headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
        });

        clearTimeout(timeoutId);
        const data = response.data;
        let bookList: Book[] = [];
        
        if (Array.isArray(data.books)) bookList = data.books;
        else if (Array.isArray(data)) bookList = data;
        else if (data.data && Array.isArray(data.data)) bookList = data.data;
        
        console.log('API로부터 받은 최종 처리된 책 목록 수:', bookList.length);
        
        if (bookList.length > 0) {
          localStorage.setItem(LOCAL_STORAGE_BOOKS_KEY, JSON.stringify(bookList));
          console.log('책 목록을 로컬 스토리지에 저장함');
        }
        
        setBooks(bookList); // 여기서 books 상태가 업데이트됨
        
        if (bookList.length === 0 && !localStorage.getItem(LOCAL_STORAGE_BOOKS_KEY)) { // 캐시도 없고 API 결과도 없으면
          console.log('책이 없어 새 책 추가 모드로 전환');
          setBookSource('new');
        }
      } catch (err: any) {
        console.error('책 목록 로드 오류:', err);
        if (err.name === 'AbortError') {
          console.log('Fetch aborted');
          return;
        }
        // 캐시된 책이 이미 books 상태에 있을 수 있으므로, 추가 에러 핸들링은 이전과 유사하게
        const localBooks = JSON.parse(localStorage.getItem(LOCAL_STORAGE_BOOKS_KEY) || '[]') as Book[];
        if (localBooks.length === 0) { // API 실패했고 로컬 캐시도 없으면
          if (process.env.NODE_ENV === 'development') {
            const testBooks: Book[] = [/* 테스트 데이터 */];
            setBooks(testBooks);
            setError(t('loadingBooksError'));
          } else {
            setError(t('loadingBooksError'));
            setBookSource('new');
          }
        } else { // API 실패했으나 로컬 캐시가 있으면 그걸로 일단 보여줌
           console.log('API 호출 실패했지만 캐시된 책 목록으로 계속 진행');
           if (books.length === 0) setBooks(localBooks); // books 상태가 비어있으면 로컬 캐시로 채움
           setError(t('loadingBooksError'));
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, [router, t]);

  const handleBookChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const bookId = e.target.value;
    console.log('[handleBookChange] Changing book to:', bookId);
    setSelectedBookId(bookId);
  };

  const handleStartSession = async () => {
    if (!selectedBookId) {
      setError(t('validation.selectBookFirst'));
      return;
    }
    
    const selectedBook = books.find(b => b._id === selectedBookId);
    if (!selectedBook) {
      setError(t('errors.bookNotFound'));
      return;
    }
    
    if (startPage < 1 || endPage < startPage || endPage > selectedBook.totalPages) {
      setError(t('validation.invalidPageRange'));
      return;
    }
    
    if (endPage > selectedBook.totalPages) {
      setError(t('validation.endPageTooLarge'));
      return;
    }
    
    setIsStarting(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }
      
      const payload = {
        bookId: selectedBookId,
        startPage,
        endPage,
        durationSec: focusDuration * 60, // 분을 초로 변환
        warmupEnabled: enableWarmup,
      };
      
      const res = await api.post("/sessions", payload, { headers: { Authorization: `Bearer ${token}` } });
      const newSession = res.data;
      if (!newSession || !newSession._id) {
        setError(t('errors.sessionCreationFailed'));
        setIsStarting(false);
        return;
      }
      // 세션이 실제로 DB에 반영됐는지 GET으로 확인
      try {
        const getRes = await api.get(`/sessions/${newSession._id}`, { headers: { Authorization: `Bearer ${token}` } });
        if (getRes.data && getRes.data._id) {
          // durationSec sanity check
          if (getRes.data.durationSec < 60) {
            setError(t('errors.sessionCreationFailed'));
            setIsStarting(false);
            return;
          }
        router.push(`/ts/session/${newSession._id}`);
      } else {
          setError(t('errors.sessionCreationFailed'));
        }
      } catch (err) {
        setError(t('errors.sessionCreationFailed'));
      }
      setIsStarting(false);
    } catch (err: any) {
      setError(err?.response?.data?.error || t('errors.networkError'));
      setIsStarting(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${cyberTheme.gradient} p-4`}>
        <Spinner size="lg" color="cyan" />
        <p className={`mt-4 ${cyberTheme.textMuted}`}>{t('loadingBooks')}</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${cyberTheme.gradient} flex items-center justify-center p-4 md:p-6`}>
      <div className={`w-full max-w-2xl ${cyberTheme.cardBg} p-4 sm:p-6 rounded-lg shadow-xl border ${cyberTheme.borderSecondary}/30`}>
        <div className="flex flex-col space-y-4">
          <div>
            <h1 className={`text-xl sm:text-2xl font-bold mb-2 ${cyberTheme.primary} flex items-center gap-2`}> 
              <Cog6ToothIcon className="h-6 w-6" />
              {t('pageTitle')}
            </h1>
            <p className={`${cyberTheme.textMuted} text-sm mb-4`}>
              {t('pageSubtitle')}
            </p>
          </div>

          {books.length === 0 && bookSource !== 'new' && !isLoading ? ( // 로딩이 끝났는데도 책이 없으면 새 책 추가 유도
            <div className="flex flex-col items-center gap-4 py-8">
              <p className={`${cyberTheme.textMuted} text-base`}>{t('bookSelection.newBookMode')}</p>
              <Button onClick={() => router.push('/books/new')} className={`${cyberTheme.buttonPrimaryBg} text-white`}>
                {t('bookSelection.addNewBook')}
              </Button>
            </div>
          ) : (
            <>
          <div>
            <label htmlFor="book-select" className={`block text-sm font-medium mb-1 ${cyberTheme.textLight}`}>
              {t('bookSelection.label')}
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-2 mt-1">
              <select
                id="book-select"
                value={selectedBookId} // 이 값은 상태에 따라 올바르게 반영되어야 함
                onChange={handleBookChange}
                disabled={isLoading || books.length === 0} // 책이 없거나 로딩 중일 때 비활성화
                className={`w-full ${cyberTheme.inputBg} border ${cyberTheme.inputBorder} ${cyberTheme.textLight} rounded-md p-2 text-sm focus:outline-none ${cyberTheme.inputFocusRing} ${cyberTheme.inputFocusBorder} disabled:opacity-50 disabled:cursor-not-allowed`}
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
                 className={`w-full sm:w-auto ${cyberTheme.buttonOutlineBorder} ${cyberTheme.buttonOutlineText} ${cyberTheme.buttonOutlineHoverBg} border whitespace-nowrap`}
              >
                {t('bookSelection.addNewBook')}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className={`text-sm font-medium ${cyberTheme.textLight}`}>
              {t('pageRange.startPageLabel')} - {t('pageRange.endPageLabel')}
            </h2>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="flex-1 w-full">
                <label htmlFor="start-page" className={`block text-xs font-medium mb-1 ${cyberTheme.textMuted}`}>
                  {t('pageRange.startPageLabel')}
                </label>
                <input
                  type="number"
                  id="start-page"
                  value={startPage}
                  onChange={(e) => setStartPage(Number(e.target.value))}
                  min="1"
                  max={selectedBook?.totalPages || 1}
                  disabled={!selectedBookId} // 책이 선택되지 않으면 비활성화
                  className={`w-full ${cyberTheme.inputBg} border ${cyberTheme.inputBorder} ${cyberTheme.textLight} rounded-md p-2 text-sm focus:outline-none ${cyberTheme.inputFocusRing} ${cyberTheme.inputFocusBorder} disabled:opacity-50`}
                />
              </div>
              <span className={`text-lg font-medium ${cyberTheme.textMuted} sm:mt-4`}>~</span>
              <div className="flex-1 w-full">
                <label htmlFor="end-page" className={`block text-xs font-medium mb-1 ${cyberTheme.textMuted}`}>
                  {t('pageRange.endPageLabel')}
                </label>
                <input
                  type="number"
                  id="end-page"
                  value={endPage}
                  onChange={(e) => setEndPage(Number(e.target.value))}
                  min={startPage}
                  max={selectedBook?.totalPages || 10}
                  disabled={!selectedBookId} // 책이 선택되지 않으면 비활성화
                  className={`w-full ${cyberTheme.inputBg} border ${cyberTheme.inputBorder} ${cyberTheme.textLight} rounded-md p-2 text-sm focus:outline-none ${cyberTheme.inputFocusRing} ${cyberTheme.inputFocusBorder} disabled:opacity-50`}
                />
              </div>
            </div>
            <div id="page-range-hint" className={`text-xs ${cyberTheme.textMuted} break-words`}> 
              {selectedBook ? (
                <div className="space-y-1">
                  <p className="truncate">
                    {t('pageRange.currentPage')}: <span className="font-medium">{selectedBook.title}</span>
                  </p>
                  <p>
                    {t('pageRange.totalPages')} {selectedBook.totalPages} {tCommon('pages')}, {t('pageRange.currentPage')} {selectedBook.currentPage} {tCommon('pages')}
                  </p>
                </div>
              ) : (
                <p>{t('bookSelection.selectBook')}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h2 className={`text-sm font-medium ${cyberTheme.textLight}`}>{t('focusSettings.enableWarmup')}</h2>
            <div className="flex items-center justify-between py-1">
              <label htmlFor="warmup-toggle" className={`text-xs ${cyberTheme.textMuted} flex-grow mr-2`}>
                {t('focusSettings.enableWarmupDescription')}
              </label>
              <button
                id="warmup-toggle"
                type="button"
                role="switch"
                aria-checked={enableWarmup}
                onClick={() => setEnableWarmup(!enableWarmup)}
                disabled={!selectedBookId} // 책이 선택되지 않으면 비활성화
                className={`${enableWarmup ? cyberTheme.buttonPrimaryBg : 'bg-gray-600'} relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50`}
              >
                <span className="sr-only">{t('focusSettings.enableWarmupDescription')}</span>
                <span aria-hidden="true" className={`${enableWarmup ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}></span>
              </button>
            </div>
            <div className="py-1">
              <label htmlFor="focus-duration" className={`block text-xs font-medium mb-1 ${cyberTheme.textMuted}`}>
                {t('focusSettings.focusDuration')} ({tCommon('minutes')})
              </label>
              <div className="flex items-center gap-2 mt-1">
                 <input
                    type="range"
                    id="focus-duration"
                    name="focusDuration"
                    min="3"
                    max="17"
                    step="1"
                    value={focusDuration}
                    onChange={(e) => setFocusDuration(Number(e.target.value))}
                    disabled={!selectedBookId} // 책이 선택되지 않으면 비활성화
                    className="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer range-sm accent-cyan-500 flex-grow disabled:opacity-50"
                 />
                 <span className={`text-lg font-semibold ${cyberTheme.secondary} w-10 text-center`}>{focusDuration}</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {t('focusSettings.focusDurationDescription')}
              </p>
            </div>
          </div>

          {error && <p className={`text-sm ${cyberTheme.errorText} text-center`}>{error}</p>}
          
          <div className="mt-4">
            <Button
              onClick={handleStartSession}
              disabled={isStarting || isLoading || !selectedBookId || books.length === 0}
              className={`w-full ${cyberTheme.buttonPrimaryBg} ${cyberTheme.buttonPrimaryHoverBg} text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${cyberTheme.buttonDisabledBg} text-base`}
            >
              {isStarting ? (
                <Spinner size="sm" color="white" /> 
              ) : (
                <PlayIcon className="h-5 w-5" />
              )}
              {isStarting ? t('buttons.starting') : `${t('buttons.startSession')} (${selectedBook ? (endPage - startPage + 1) : 0} ${tCommon('pages')})`}
            </Button>
          </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 