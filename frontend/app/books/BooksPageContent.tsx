'use client';

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { AiOutlinePlus, AiOutlineSearch, AiOutlineFilter, AiOutlineEdit, AiOutlineDelete, AiOutlineHighlight, AiOutlineBook, AiOutlineFileText } from "react-icons/ai";
import { FiBook, FiClock, FiChevronRight, FiMoreVertical, FiList, FiCalendar, FiTrendingUp, FiActivity } from "react-icons/fi";
import api, { books as booksApi } from "@/lib/api";
import Spinner from "@/components/ui/Spinner";
import { Button } from '@/components/ui/button';
import { EllipsisVerticalIcon as DotsVerticalIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Cyber Theme Definition
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
  inputBg: 'bg-gray-700/50',
  inputBorder: 'border-gray-600',
  inputFocusBorder: 'focus:border-cyan-500',
  inputFocusRing: 'focus:ring-cyan-500/50',
  progressBarBg: 'bg-gray-700',
  progressFg: 'bg-gradient-to-r from-cyan-500 to-purple-500',
  buttonPrimaryBg: 'bg-cyan-600',
  buttonPrimaryHoverBg: 'hover:bg-cyan-700',
  buttonSecondaryBg: 'bg-gray-700/50',
  buttonSecondaryHoverBg: 'hover:bg-gray-600/50',
  buttonDisabledBg: 'bg-gray-600',
  errorText: 'text-red-400',
  errorBorder: 'border-red-500/50',
  menuBg: 'bg-gray-700',
  menuItemHover: 'hover:bg-gray-600',
  tabActiveBg: 'bg-cyan-600',
  tabInactiveBg: 'bg-gray-700',
  tabText: 'text-white',
};

// Book Type
interface Book {
  _id: string;
  title: string;
  author: string;
  genre?: string;
  category?: string;
  totalPages: number;
  currentPage: number;
  coverImage?: string;
  lastReadAt?: string;
  status?: string;
  completionPercentage?: number;
  createdAt: string;
}

// SummaryNote Type
interface SummaryNote {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  bookIds: string[];
  orderedNoteIds: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// Sort options type
type SortByType = "title" | "date" | "progress";

export default function BooksPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortByType>("date");
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [showSortOptions, setShowSortOptions] = useState(false);
  const sortButtonRef = useRef<HTMLButtonElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  
  const [activeTab, setActiveTab] = useState<'books' | 'summaryNotes'>('books');
  const [summaryNotes, setSummaryNotes] = useState<SummaryNote[]>([]);
  const [summaryNotesLoading, setSummaryNotesLoading] = useState<boolean>(false);
  const [summaryNotesError, setSummaryNotesError] = useState<string>('');
  const [filteredSummaryNotes, setFilteredSummaryNotes] = useState<SummaryNote[]>([]);
  
  const requestTimeout = useRef<NodeJS.Timeout | null>(null);
  const controller = useRef<AbortController | null>(null);
  const isMounted = useRef(true);

  const fetchBooks = useCallback(async () => {
    if (controller.current) controller.current.abort();
    controller.current = new AbortController();
    
    setIsLoading(true);
    setError("");
    
    if(requestTimeout.current) clearTimeout(requestTimeout.current);
    requestTimeout.current = setTimeout(() => {
      if (isMounted.current && controller.current) {
        controller.current.abort();
        setError("서버 응답 시간이 초과되었습니다.");
        setIsLoading(false);
      }
    }, 15000);

    try {
      console.log('Fetching books from API...');
      const data = await booksApi.getAll({ signal: controller.current?.signal });
      let booksData: Book[] = [];
      if (Array.isArray(data)) {
        booksData = data;
      } else if (data && Array.isArray(data.books)) {
        booksData = data.books;
      } else {
        console.error('Book data format is incorrect:', data);
        throw new Error('수신된 책 데이터 형식이 올바르지 않습니다.');
      }
      
      booksData.forEach(book => {
        console.log(`Book: ${book.title}, Cover Image Path/URL: ${book.coverImage}`);
      });

      if (isMounted.current) {
        setBooks(booksData);
        setFilteredBooks(booksData);
      }
    } catch (err: any) {
      if (isMounted.current && err.name !== 'AbortError') {
        console.error('Error loading books:', err);
        setError(err.message || "기억 저장소 정보를 불러오는 중 오류가 발생했습니다");
      }
    } finally {
      if (isMounted.current) setIsLoading(false);
      if(requestTimeout.current) clearTimeout(requestTimeout.current);
    }
  }, []);

  const fetchSummaryNotes = useCallback(async () => {
    setSummaryNotesLoading(true);
    setSummaryNotesError('');
    try {
      const response = await api.get('/summary-notes/');
      const notesData = response.data || [];
      setSummaryNotes(notesData);
      setFilteredSummaryNotes(notesData);
    } catch (err: any) {
      console.error('단권화 노트 로딩 오류:', err);
      setSummaryNotesError(err.response?.data?.message || err.message || '단권화 노트를 불러오는 중 오류 발생');
    } finally {
      setSummaryNotesLoading(false);
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    const tabFromQuery = searchParams.get('tab');
    if (tabFromQuery === 'summary') {
      setActiveTab('summaryNotes');
    } else {
      setActiveTab('books');
    }
    // Note: The loading logic for activeTab === 'books' vs 'summaryNotes' 
    // is now handled by the return statement conditions using pageIsLoading.
    // This useEffect primarily sets the activeTab based on query.
    // The actual data fetching calls are now triggered based on activeTab in the second useEffect.

    return () => {
      isMounted.current = false;
      if (controller.current) controller.current.abort();
      if (requestTimeout.current) clearTimeout(requestTimeout.current);
    };
  }, [searchParams]); // Depends only on searchParams to set initial tab

  // This useEffect will run when activeTab changes (either by query or by user click)
  useEffect(() => {
    if (activeTab === 'books') {
      fetchBooks();
    } else if (activeTab === 'summaryNotes') {
      fetchSummaryNotes();
    }
  }, [activeTab, fetchBooks, fetchSummaryNotes]);
  
  useEffect(() => {
    if (activeTab === 'books') {
        if (!searchQuery.trim()) {
            applySort(books);
            return;
        }
        const filtered = books.filter(
            (book) =>
            book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.author.toLowerCase().includes(searchQuery.toLowerCase())
        );
        applySort(filtered);
    } else if (activeTab === 'summaryNotes') {
        if (!searchQuery.trim()) {
            setFilteredSummaryNotes(summaryNotes);
            return;
        }
        const filtered = summaryNotes.filter(
            (note) =>
            note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (note.description && note.description.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        setFilteredSummaryNotes(filtered);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, books, summaryNotes, activeTab]); // applySort is memoized for books

  const applySort = useCallback((booksToSort: Book[]) => {
    let sorted = [...booksToSort];
    if (sortBy === "title") {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "date") {
      sorted.sort((a, b) => {
        const dateA = a.lastReadAt ? new Date(a.lastReadAt).getTime() : 0;
        const dateB = b.lastReadAt ? new Date(b.lastReadAt).getTime() : 0;
        return dateB - dateA;
      });
    } else if (sortBy === "progress") {
      sorted.sort((a, b) => {
        const progressA = calculateProgress(a.currentPage, a.totalPages);
        const progressB = calculateProgress(b.currentPage, b.totalPages);
        return progressB - progressA;
      });
    }
    setFilteredBooks(sorted);
  }, [sortBy]);

  const handleSortChange = (newSortBy: SortByType) => {
    setSortBy(newSortBy);
    setShowSortOptions(false);
  };

  const calculateProgress = (currentPage: number, totalPages: number): number => {
    if (!totalPages) return 0;
    const progress = Math.round((currentPage / totalPages) * 100);
    return Math.min(Math.max(progress, 0), 100);
  };

  const formatLastRead = (dateString?: string): string => {
    if (!dateString) return "아직 읽지 않음";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 1) return "오늘 활성화";
    if (diffDays <= 7) return `${diffDays}일 전 활성화`;
    return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
  };

  const handleDeleteBook = async (bookId: string) => {
    if (!window.confirm("이 책을 정말 삭제하시겠습니까? 관련된 노트와 데이터가 함께 삭제될 수 있습니다.")) return;
    try {
      await booksApi.delete(bookId);
      setBooks(prev => prev.filter(b => b._id !== bookId));
      setFilteredBooks(prev => prev.filter(b => b._id !== bookId));
    } catch (err) {
      console.error("Error deleting book:", err);
      alert("책 삭제 중 오류가 발생했습니다.");
    }
  };

  const toggleMenu = (bookId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(prev => (prev === bookId ? null : bookId));
  };
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMenu) setShowMenu(null);
      if (showSortOptions && sortButtonRef.current && !sortButtonRef.current.contains(event.target as Node) && sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
          setShowSortOptions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu, showSortOptions]);

  const handleViewBookDetails = (bookId: string) => router.push(`/books/${bookId}`);
  const handleAddBook = () => router.push("/books/new");

  const handleDeleteSummaryNoteFromList = async (summaryNoteId: string) => {
    if (!window.confirm("이 단권화 노트를 정말 삭제하시겠습니까? 1줄 메모들은 삭제되지 않습니다.")) return;
    try {
      await api.delete(`/summary-notes/${summaryNoteId}`);
      setSummaryNotes(prev => prev.filter(note => note._id !== summaryNoteId));
      setFilteredSummaryNotes(prev => prev.filter(note => note._id !== summaryNoteId));
    } catch (err) {
      console.error("Error deleting summary note:", err);
      alert("단권화 노트 삭제 중 오류가 발생했습니다.");
    }
  };

  // Main loading state for the page, prioritizing books tab if both are potentially loading.
  const pageIsLoading = activeTab === 'books' ? isLoading : summaryNotesLoading;
  const currentError = activeTab === 'books' ? error : summaryNotesError;

  if (pageIsLoading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${cyberTheme.gradient} p-4`}>
        <Spinner size="lg" color="cyan" />
        <p className={`mt-4 ${cyberTheme.textLight}`}>
          {activeTab === 'books' ? '기억 저장소 정보 로딩 중...' : '단권화 노트 로딩 중...'}
        </p>
      </div>
    );
  }

  if (currentError) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${cyberTheme.gradient} p-4`}>
        <div className={`${cyberTheme.cardBg} rounded-xl shadow-2xl p-6 max-w-md w-full border ${cyberTheme.errorBorder} text-center`}>
            <p className={`mb-4 ${cyberTheme.errorText}`}>{currentError}</p>
            <Button onClick={() => activeTab === 'books' ? fetchBooks() : fetchSummaryNotes()}>다시 시도</Button>
        </div>
      </div>
    );
  }

  const sortOptions: { key: SortByType; label: string; icon: React.ElementType }[] = [
    { key: "date", label: "최근 기억 활성화 순", icon: FiCalendar },
    { key: "progress", label: "기억 저장 진행률 순", icon: FiTrendingUp },
    { key: "title", label: "제목순", icon: FiList },
  ];

  return (
    <div className={`min-h-screen ${cyberTheme.gradient} p-4 md:p-6 ${cyberTheme.textLight}`}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
            <h1 className={`text-2xl md:text-3xl font-bold ${cyberTheme.primary}`}>내 서재</h1>
            <button onClick={handleAddBook} aria-label="새 책 등록" className={`flex items-center gap-2 px-4 py-2 rounded-lg ${cyberTheme.buttonPrimaryBg} ${cyberTheme.buttonPrimaryHoverBg} text-white font-medium transition-colors w-full sm:w-auto mt-3 sm:mt-0`}>
              <AiOutlinePlus className="h-5 w-5" /><span>새 책 등록</span>
            </button>
          </div>
          <p className={`text-sm ${cyberTheme.textMuted}`}>당신이 읽고 있는 모든 것을 등록하고 관리하세요. 책, 논문, 수험서, 학습자료, 문서 등</p>
        </div>
        <div className={`flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 p-4 ${cyberTheme.bgSecondary} rounded-lg`}>
          <div className="relative w-full sm:w-auto flex-grow">
            <AiOutlineSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${cyberTheme.textMuted}`} />
            <input type="text" placeholder={activeTab === 'summaryNotes' ? "단권화 노트 제목, 내용 검색..." : "기억 저장소에서 책 검색..."} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`w-full pl-10 pr-4 py-2 rounded-lg border ${cyberTheme.inputBorder} ${cyberTheme.inputBg} ${cyberTheme.textLight} focus:outline-none ${cyberTheme.inputFocusRing} ${cyberTheme.inputFocusBorder}`} />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
             <div className="relative">
                 <button ref={sortButtonRef} onClick={() => setShowSortOptions(!showSortOptions)} aria-label="정렬 기준 변경" className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${cyberTheme.inputBorder} ${cyberTheme.buttonSecondaryBg} ${cyberTheme.buttonSecondaryHoverBg} ${cyberTheme.textLight} transition-colors`}>
                     <AiOutlineFilter className="h-5 w-5" /><span>{sortOptions.find(opt => opt.key === sortBy)?.label || '정렬'}</span>
                 </button>
                 {showSortOptions && (
                     <div ref={sortDropdownRef} className={`absolute right-0 mt-2 w-48 ${cyberTheme.menuBg} rounded-md shadow-lg z-10 border ${cyberTheme.inputBorder}`}>
                         {sortOptions.map((option) => (
                             <button key={option.key} onClick={() => handleSortChange(option.key)} className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${cyberTheme.textLight} ${cyberTheme.menuItemHover} ${sortBy === option.key ? 'font-bold' : ''}`}>
                                 <option.icon className="h-4 w-4" />{option.label}
                             </button>
                         ))}
                     </div>
                 )}
             </div>
          </div>
        </div>

        <div className="mb-6 flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('books')}
            className={`px-6 py-2.5 rounded-t-lg font-semibold transition-all duration-200 ease-in-out border-b-2
              ${activeTab === 'books' 
                ? `${cyberTheme.tabActiveBg} ${cyberTheme.tabText} border-cyan-300 shadow-md` 
                : `${cyberTheme.tabInactiveBg} text-gray-400 hover:text-cyan-300 border-transparent hover:bg-gray-700/70`}
            `}
          >
            <FiBook className="inline mr-2 mb-0.5" />내 서재
          </button>
          <button
            onClick={() => setActiveTab('summaryNotes')}
            className={`px-6 py-2.5 rounded-t-lg font-semibold transition-all duration-200 ease-in-out border-b-2
              ${activeTab === 'summaryNotes' 
                ? `bg-purple-600 ${cyberTheme.tabText} border-purple-400 shadow-md` 
                : `${cyberTheme.tabInactiveBg} text-gray-400 hover:text-purple-300 border-transparent hover:bg-gray-700/70`}
            `}
          >
            <AiOutlineHighlight className="inline mr-2 mb-0.5" />단권화 노트
          </button>
        </div>

        {activeTab === 'books' && (
          <>
            {filteredBooks.length === 0 && !isLoading ? (
              <div className={`text-center py-10 ${cyberTheme.textMuted} ${cyberTheme.cardBg} rounded-lg`}>해당하는 책이 없거나 아직 책을 추가하지 않았습니다.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {filteredBooks.map((book) => {
                  const progress = calculateProgress(book.currentPage, book.totalPages);
                  let imageSrc: string | null = null;
                  if (book.coverImage && (book.coverImage.startsWith('http') || book.coverImage.startsWith('/'))) {
                    imageSrc = book.coverImage;
                  } else if (book.coverImage) {
                    console.warn(`Invalid cover image path for book "${book.title}": ${book.coverImage}. Rendering placeholder.`);
                  }

                  return (
                    <div key={book._id} onClick={() => handleViewBookDetails(book._id)} className={`relative ${cyberTheme.cardBg} rounded-lg shadow-lg overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:border-cyan-500/30 border ${cyberTheme.inputBorder}`}>
                      <button onClick={(e) => toggleMenu(book._id, e)} aria-label="기억 관리 메뉴" className={`absolute top-2 right-2 p-1.5 rounded-full ${cyberTheme.buttonSecondaryBg} ${cyberTheme.buttonSecondaryHoverBg} ${cyberTheme.textMuted} z-10`}><FiMoreVertical className="h-5 w-5" /></button>
                      {showMenu === book._id && (
                        <div className={`action-menu absolute top-10 right-2 mt-1 w-36 ${cyberTheme.menuBg} rounded-md shadow-lg z-20 border ${cyberTheme.inputBorder}`}>
                           <Link href={`/books/${book._id}/edit`} onClick={(e) => e.stopPropagation()} className={`block w-full text-left px-4 py-2 text-sm ${cyberTheme.textLight} ${cyberTheme.menuItemHover} flex items-center gap-2`}><AiOutlineEdit className="h-4 w-4" /> 수정하기</Link>
                           <button onClick={(e) => { e.stopPropagation(); handleDeleteBook(book._id); }} className={`block w-full text-left px-4 py-2 text-sm ${cyberTheme.errorText} ${cyberTheme.menuItemHover} flex items-center gap-2`}><AiOutlineDelete className="h-4 w-4" /> 삭제하기</button>
                        </div>
                      )}
                      <div className={`w-full h-32 md:h-40 ${cyberTheme.inputBg} flex items-center justify-center ${cyberTheme.textMuted}`}>
                        {imageSrc ? (
                          <Image 
                            src={imageSrc} 
                            alt={book.title} 
                            width={100} height={150} 
                            className="object-cover w-full h-full" 
                            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                              console.error(`Failed to load image (onError event): ${imageSrc}`, e.currentTarget);
                              (e.currentTarget as HTMLImageElement).style.display = 'none'; 
                              const parent = e.currentTarget.parentElement;
                              if (parent && !parent.querySelector('.placeholder-icon')) {
                                const placeholder = document.createElement('div');
                                placeholder.className = 'placeholder-icon'; 
                                placeholder.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-12 w-12"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"></path></svg>'; 
                                parent.appendChild(placeholder);
                              }
                            }}
                          />
                        ) : (
                          <FiBook className="h-12 w-12 placeholder-icon" /> 
                        )}
                      </div>
                      <div className="p-4">
                        <h2 className={`font-bold text-base md:text-lg mb-1 truncate ${cyberTheme.textLight}`} title={book.title}>{book.title}</h2>
                        <p className={`text-xs md:text-sm ${cyberTheme.textMuted} mb-3 truncate`} title={book.author}>{book.author}</p>
                        <div className="mb-2">
                          <div className={`w-full ${cyberTheme.progressBarBg} rounded-full h-1.5`}>
                            <div className={`h-1.5 rounded-full ${cyberTheme.progressFg}`} style={{ width: `${progress}%` }}></div>
                          </div>
                          <p className={`text-xs mt-1 ${cyberTheme.textMuted}`}>기억 저장: {progress}% ({book.currentPage}/{book.totalPages}쪽)</p>
                        </div>
                        <div className={`flex items-center text-xs ${cyberTheme.textMuted}`}>
                          <FiClock className="h-3.5 w-3.5 mr-1" />
                          <span>최근 기억 활성화: {formatLastRead(book.lastReadAt)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
        {activeTab === 'summaryNotes' && (
          <div className="mt-2">
            {summaryNotesLoading && (
              <div className="flex justify-center items-center py-10">
                <Spinner size="lg" color="purple" />
                <p className={`ml-3 ${cyberTheme.textMuted}`}>단권화 노트 로딩 중...</p>
              </div>
            )}
            {summaryNotesError && (
              <div className={`text-center py-10 ${cyberTheme.errorText} bg-red-900/20 p-4 rounded-md`}>
                <p>오류: {summaryNotesError}</p>
                <Button onClick={fetchSummaryNotes} variant="outline" className="mt-4">재시도</Button>
              </div>
            )}
            {!summaryNotesLoading && !summaryNotesError && summaryNotes.length === 0 && (
              <div className={`text-center py-10 ${cyberTheme.textMuted}`}>
                <AiOutlineFileText className="mx-auto text-4xl mb-3" />
                <p className="mb-4">아직 생성된 단권화 노트가 없습니다.</p>
                <Button onClick={() => router.push('/summary-notes/create')} className={`${cyberTheme.buttonPrimaryBg} ${cyberTheme.buttonPrimaryHoverBg} text-white`}>
                  <AiOutlinePlus className="mr-2" /> 새 단권화 노트 만들기
                </Button>
              </div>
            )}
            {!summaryNotesLoading && !summaryNotesError && summaryNotes.length > 0 && (
              <div className="space-y-4">
                {filteredSummaryNotes.map(note => (
                  <div 
                    key={note._id} 
                    className={`p-5 rounded-lg shadow-lg transition-all duration-300 ease-in-out hover:shadow-purple-500/30 border ${cyberTheme.borderSecondary}/30 ${cyberTheme.cardBg}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className={`text-xl font-semibold ${cyberTheme.secondary} mb-1.5 hover:text-purple-300`}>
                          <Link href={`/summary-notes/${note._id}/edit`}>{note.title}</Link>
                        </h3>
                        <p className={`text-sm ${cyberTheme.textMuted} mb-1`}>{note.description || '설명 없음'}</p>
                        <p className={`text-xs ${cyberTheme.textMuted}`}>포함된 1줄 메모: {note.orderedNoteIds.length}개</p>
                        <p className={`text-xs ${cyberTheme.textMuted}`}>마지막 업데이트: {new Date(note.updatedAt).toLocaleDateString('ko-KR')}</p>
                      </div>
                      <div className="flex space-x-2 flex-shrink-0 ml-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className={`text-gray-400 hover:text-cyan-400 p-1.5`}>
                              <DotsVerticalIcon className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className={`${cyberTheme.menuBg} border-${cyberTheme.borderSecondary}`}>
                            <DropdownMenuItem 
                              onClick={() => router.push(`/summary-notes/${note._id}/edit`)} 
                              className={`${cyberTheme.menuItemHover} ${cyberTheme.primary} cursor-pointer flex items-center`}
                            >
                              <PencilIcon className="h-4 w-4 mr-2" /> 수정하기
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteSummaryNoteFromList(note._id)} 
                              className={`${cyberTheme.menuItemHover} text-red-400 hover:!text-red-400 cursor-pointer flex items-center`}
                            >
                              <TrashIcon className="h-4 w-4 mr-2" /> 삭제하기
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 