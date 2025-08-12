'use client';

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { AiOutlinePlus, AiOutlineSearch, AiOutlineFilter, AiOutlineEdit, AiOutlineDelete, AiOutlineHighlight, AiOutlineBook, AiOutlineFileText } from "react-icons/ai";
import { FiBook, FiClock, FiChevronRight, FiMoreVertical, FiList, FiCalendar, FiTrendingUp, FiActivity, FiTarget } from "react-icons/fi";
import api, { books as booksApi } from "@/lib/api";
import Spinner from "@/components/ui/Spinner";
import { Button } from '@/components/ui/button';
import { EllipsisVerticalIcon as DotsVerticalIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ClientDateDisplay } from '@/components/share/ClientTimeDisplay';
import SearchUIManager from '@/components/search/SearchUIManager';

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
  // 개선된 디자인 요소들
  cardHover: 'hover:scale-105 hover:shadow-2xl hover:border-cyan-400/50',
  cardActive: 'active:scale-95',
  cardTransition: 'transition-all duration-300 ease-out',
  buttonHover: 'hover:shadow-lg hover:shadow-cyan-500/25',
  inputHover: 'hover:border-gray-500',
  progressGlow: 'shadow-lg shadow-cyan-500/20',
  tabHover: 'hover:bg-gray-600/70 hover:text-cyan-300',
  searchFocus: 'focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400',
};

// Book Type
interface Book {
  _id: string;
  title: string;
  author: string;
  bookType?: 'BOOK' | 'NOTEBOOK';
  genre?: string;
  category?: string;
  totalPages: number;
  currentPage: number;
  coverImage?: string;
  lastReadAt?: string;
  status?: string;
  completionPercentage?: number;
  readingPurpose?: 'exam_prep' | 'practical_knowledge' | 'humanities_self_reflection' | 'reading_pleasure';
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
type SortByType = "title" | "date" | "progress" | "created" | "type" | "purpose";

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
        setError("성장 기록을 불러오는 데 시간이 조금 더 걸리네요. 잠시 후 다시 시도해 주시겠어요?");
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
        setError(err.message || "나의 도서관을 불러오는 중 잠시 문제가 생겼어요. 다시 한번 시도해볼까요?");
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
      setSummaryNotesError(err.response?.data?.message || err.message || '정리된 생각들을 불러오는 데 잠시 문제가 생겼어요. 다시 한번 시도해볼까요?');
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
    } else if (sortBy === "created") {
      sorted.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA; // 최근 등록 순
      });
    } else if (sortBy === "type") {
      sorted.sort((a, b) => {
        // BOOK을 먼저, NOTEBOOK을 나중에
        if (a.bookType === 'BOOK' && b.bookType === 'NOTEBOOK') return -1;
        if (a.bookType === 'NOTEBOOK' && b.bookType === 'BOOK') return 1;
        // 같은 타입 내에서는 제목순
        return a.title.localeCompare(b.title);
      });
    } else if (sortBy === "purpose") {
      sorted.sort((a, b) => {
        const purposeOrder = {
          'exam_prep': 1,
          'practical_knowledge': 2,
          'humanities_self_reflection': 3,
          'reading_pleasure': 4
        };
        const purposeA = a.readingPurpose || 'reading_pleasure';
        const purposeB = b.readingPurpose || 'reading_pleasure';
        const orderA = purposeOrder[purposeA as keyof typeof purposeOrder] || 5;
        const orderB = purposeOrder[purposeB as keyof typeof purposeOrder] || 5;
        if (orderA !== orderB) return orderA - orderB;
        // 같은 목적 내에서는 제목순
        return a.title.localeCompare(b.title);
      });
    }
    setFilteredBooks(sorted);
  }, [sortBy]);

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
  }, [searchQuery, books, summaryNotes, activeTab, applySort]);

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
    if (!dateString) return "아직 성장의 기록이 없어요";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 1) return "오늘의 기록";
    if (diffDays <= 7) return `${diffDays}일 전 기록`;
    return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
  };

  const handleDeleteBook = async (bookId: string) => {
    if (!window.confirm("이 책에 담긴 소중한 기록들을 정리하시겠어요? 관련 노트들도 함께 정리될 수 있어요.")) return;
    try {
      await booksApi.delete(bookId);
      setBooks(prev => prev.filter(b => b._id !== bookId));
      setFilteredBooks(prev => prev.filter(b => b._id !== bookId));
    } catch (err) {
      console.error("Error deleting book:", err);
      alert("기록을 정리하는 중에 잠시 문제가 생겼어요. 잠시 후에 다시 시도해주시면 감사하겠습니다.");
    }
  };

  const toggleMenu = (bookId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(prev => (prev === bookId ? null : bookId));
  };
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showMenu &&
          !target.closest('.action-menu') &&
          !target.closest('.toggle-menu-button')) {
        setShowMenu(null);
      }
      if (showSortOptions && sortButtonRef.current && !sortButtonRef.current.contains(target) && sortDropdownRef.current && !sortDropdownRef.current.contains(target)) {
        setShowSortOptions(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showMenu, showSortOptions]);

  const handleViewBookDetails = (bookId: string) => router.push(`/books/${bookId}`);
  const handleAddBook = () => router.push("/books/new/select");

  const handleDeleteSummaryNoteFromList = async (summaryNoteId: string) => {
    if (!window.confirm("이 단권화 노트를 정리하시겠어요? 소중한 1줄 메모들은 그대로 남아있으니 안심하세요.")) return;
    try {
      await api.delete(`/summary-notes/${summaryNoteId}`);
      setSummaryNotes(prev => prev.filter(note => note._id !== summaryNoteId));
      setFilteredSummaryNotes(prev => prev.filter(note => note._id !== summaryNoteId));
    } catch (err) {
      console.error("Error deleting summary note:", err);
      alert("노트를 정리하는 중에 잠시 문제가 생겼어요. 잠시 후에 다시 시도해볼까요?");
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
          {activeTab === 'books' ? '당신의 성장 기록을 불러오고 있어요...' : '정리된 생각들을 불러오고 있어요...'}
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
    { key: "date", label: "최근에 펼쳐본 순", icon: FiCalendar },
    { key: "progress", label: "성장 진행률 순", icon: FiTrendingUp },
    { key: "title", label: "가나다 순", icon: FiList },
    { key: "created", label: "등록일 순", icon: FiClock },
    { key: "type", label: "타입별 순", icon: FiBook },
    { key: "purpose", label: "목적별 순", icon: FiTarget },
  ];

  return (
    <div className={`min-h-screen ${cyberTheme.gradient} p-4 md:p-6 ${cyberTheme.textLight}`}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold ${cyberTheme.primary} tracking-tight`}>My Lib</h1>
            <button onClick={handleAddBook} aria-label="새 책 등록" className={`flex items-center gap-2 px-6 py-3 rounded-xl ${cyberTheme.buttonPrimaryBg} ${cyberTheme.buttonPrimaryHoverBg} ${cyberTheme.buttonHover} text-white font-semibold ${cyberTheme.cardTransition} w-full sm:w-auto mt-4 sm:mt-0 shadow-lg`}>
              <AiOutlinePlus className="h-5 w-5" /><span>NEW</span>
            </button>
          </div>
          <p className={`text-base ${cyberTheme.textMuted} leading-relaxed`}>your books, notes, and memories</p>
        </div>
        <div className={`flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 p-6 ${cyberTheme.bgSecondary} rounded-xl shadow-lg border ${cyberTheme.inputBorder}/30`}>
          <div className="relative w-full sm:w-auto flex-grow">
            <AiOutlineSearch className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 ${cyberTheme.textMuted}`} />
            <input type="text" placeholder={activeTab === 'summaryNotes' ? "필요한 내용을 찾아보세요" : "원하시는 책을 찾아보세요"} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`w-full pl-12 pr-4 py-3 rounded-xl border ${cyberTheme.inputBorder} ${cyberTheme.inputBg} ${cyberTheme.textLight} ${cyberTheme.inputHover} ${cyberTheme.searchFocus} focus:outline-none ${cyberTheme.cardTransition} text-base`} />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
             <div className="relative">
                 <button ref={sortButtonRef} onClick={() => setShowSortOptions(!showSortOptions)} aria-label="정렬 기준 변경" className={`flex items-center gap-2 px-4 py-3 rounded-xl border ${cyberTheme.inputBorder} ${cyberTheme.buttonSecondaryBg} ${cyberTheme.buttonSecondaryHoverBg} ${cyberTheme.buttonHover} ${cyberTheme.textLight} ${cyberTheme.cardTransition} shadow-md`}>
                     <AiOutlineFilter className="h-5 w-5" /><span className="hidden sm:inline">{sortOptions.find(opt => opt.key === sortBy)?.label || '정렬'}</span><span className="sm:hidden">정렬</span>
                 </button>
                 {showSortOptions && (
                     <div ref={sortDropdownRef} className={`absolute right-0 mt-2 w-40 sm:w-48 ${cyberTheme.menuBg} rounded-md shadow-lg z-10 border ${cyberTheme.inputBorder}`}>
                         {sortOptions.map((option) => (
                             <button key={option.key} onClick={() => handleSortChange(option.key)} className={`w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm flex items-center gap-2 ${cyberTheme.textLight} ${cyberTheme.menuItemHover} ${sortBy === option.key ? 'font-bold' : ''}`}>
                                 <option.icon className="h-3 w-3 sm:h-4 sm:w-4" />{option.label}
                             </button>
                         ))}
                     </div>
                 )}
             </div>
          </div>
        </div>

        <div className="mb-8 flex border-b border-gray-700/50">
          <button
            onClick={() => setActiveTab('books')}
            className={`px-4 sm:px-8 py-3 rounded-t-xl font-semibold ${cyberTheme.cardTransition} border-b-2
              ${activeTab === 'books' 
                ? `${cyberTheme.tabActiveBg} ${cyberTheme.tabText} border-cyan-400 shadow-lg ${cyberTheme.progressGlow}` 
                : `${cyberTheme.tabInactiveBg} text-gray-400 ${cyberTheme.tabHover} border-transparent`}
            `}
          >
            <FiBook className="inline mr-2 mb-0.5" /><span className="text-base sm:text-lg">등록 자료</span>
          </button>
          <button
            onClick={() => setActiveTab('summaryNotes')}
            className={`px-4 sm:px-8 py-3 rounded-t-xl font-semibold ${cyberTheme.cardTransition} border-b-2
              ${activeTab === 'summaryNotes' 
                ? `bg-purple-600 ${cyberTheme.tabText} border-purple-400 shadow-lg ${cyberTheme.progressGlow}` 
                : `${cyberTheme.tabInactiveBg} text-gray-400 hover:text-purple-300 hover:bg-gray-700/70 border-transparent`}
            `}
          >
            <AiOutlineHighlight className="inline mr-2 mb-0.5" /><span className="text-base sm:text-lg">단권화 노트</span>
          </button>
        </div>

        {activeTab === 'books' && (
          <>
            {filteredBooks.length === 0 && !isLoading ? (
              <div className={`text-center py-16 ${cyberTheme.textMuted} ${cyberTheme.cardBg} rounded-xl shadow-lg border ${cyberTheme.inputBorder}/30`}>
                <FiBook className="mx-auto text-6xl mb-4 opacity-40" />
                <p className="text-lg font-medium mb-2">새 자료를 등록하고 시작해볼까요?</p>
                <p className="text-sm opacity-70">첫 번째 책을 등록하면 여기에 표시됩니다</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
                {filteredBooks.map((book) => {
                  const progress = calculateProgress(book.currentPage, book.totalPages);
                  let imageSrc: string | null = null;
                  if (book.coverImage && (book.coverImage.startsWith('http') || book.coverImage.startsWith('/'))) {
                    imageSrc = book.coverImage;
                  } else if (book.coverImage) {
                    console.warn(`Invalid cover image path for book "${book.title}": ${book.coverImage}. Rendering placeholder.`);
                  }

                  return (
                    <div key={book._id} onClick={() => handleViewBookDetails(book._id)} className={`relative ${cyberTheme.cardBg} rounded-xl shadow-lg overflow-hidden cursor-pointer ${cyberTheme.cardTransition} ${cyberTheme.cardHover} ${cyberTheme.cardActive} border ${cyberTheme.inputBorder} hover:border-cyan-400/50`}>
                      <button onClick={(e) => toggleMenu(book._id, e)} aria-label="기억 관리 메뉴" className={`toggle-menu-button absolute top-2 right-2 p-1.5 rounded-full ${cyberTheme.buttonSecondaryBg} ${cyberTheme.buttonSecondaryHoverBg} ${cyberTheme.textMuted} z-10`}><FiMoreVertical className="h-5 w-5" /></button>
                      {showMenu === book._id && (
                        <div className={`action-menu absolute top-10 right-2 mt-1 w-32 sm:w-36 ${cyberTheme.menuBg} rounded-md shadow-lg z-20 border ${cyberTheme.inputBorder}`}>
                           <Link href={`/books/${book._id}/edit`} onClick={(e) => e.stopPropagation()} className={`block w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm ${cyberTheme.textLight} ${cyberTheme.menuItemHover} flex items-center gap-2`}><AiOutlineEdit className="h-3 w-3 sm:h-4 sm:w-4" /> 수정</Link>
                        </div>
                      )}
                      <div className={`w-full h-32 md:h-36 lg:h-40 ${cyberTheme.inputBg} flex items-center justify-center ${cyberTheme.textMuted} relative overflow-hidden`}>
                        {imageSrc ? (
                          <Image 
                            src={imageSrc} 
                            alt={book.title} 
                            width={100} height={150} 
                            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105" 
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
                          <FiBook className="h-16 w-16 placeholder-icon opacity-60" /> 
                        )}
                      </div>
                      <div className="p-3 md:p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <h2 className={`font-bold text-base md:text-lg truncate ${cyberTheme.textLight} leading-tight`} title={book.title}>{book.title}</h2>
                          {book.bookType === 'NOTEBOOK' && (
                            <span className="bg-purple-500/20 text-purple-400 text-xs px-2 py-0.5 rounded-full border border-purple-500/30 flex-shrink-0 font-medium">
                              노트북
                            </span>
                          )}
                        </div>
                        <p className={`text-sm md:text-base ${cyberTheme.textMuted} mb-3 truncate leading-relaxed`} title={book.author}>{book.author}</p>
                        
                        {/* 책인 경우만 진행률 표시 */}
                        {book.bookType !== 'NOTEBOOK' && (
                          <div className="mb-2">
                            <div className={`w-full ${cyberTheme.progressBarBg} rounded-full h-2 relative overflow-hidden`}>
                              <div className={`h-2 rounded-full ${cyberTheme.progressFg} ${cyberTheme.progressGlow} transition-all duration-500`} style={{ width: `${progress}%` }}></div>
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
                            </div>
                            <p className={`text-xs mt-1 ${cyberTheme.textMuted} font-medium`}>성장: {progress}% ({book.currentPage}/{book.totalPages}p)</p>
                          </div>
                        )}
                        
                        <div className={`flex items-center text-xs ${cyberTheme.textMuted}`}>
                          <FiClock className="h-3 w-3 mr-1" />
                          <span className="truncate">
                            {book.bookType === 'NOTEBOOK' ? '생성: ' : '최근: '}
                            {book.bookType === 'NOTEBOOK' 
                              ? <ClientDateDisplay createdAt={book.createdAt} />
                              : formatLastRead(book.lastReadAt)
                            }
                          </span>
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
                <p>소중한 단권화 노트를 불러오는 중 문제가 생겼어요. 조금 있다 다시 시도해 볼래요?</p>
                <Button onClick={fetchSummaryNotes} variant="outline" className="mt-4">다시 시도하기</Button>
              </div>
            )}
            {!summaryNotesLoading && !summaryNotesError && summaryNotes.length === 0 && (
              <div className={`text-center py-16 ${cyberTheme.textMuted} ${cyberTheme.cardBg} rounded-xl shadow-lg border ${cyberTheme.inputBorder}/30`}>
                <AiOutlineFileText className="mx-auto text-6xl mb-4 opacity-40" />
                <p className="text-lg font-medium mb-2">아직 정리된 생각이 없네요</p>
                <p className="text-sm opacity-70 mb-6">첫 번째 단권화 노트를 만들어볼까요?</p>
                <Button onClick={() => router.push('/summary-notes/create')} className={`${cyberTheme.buttonPrimaryBg} ${cyberTheme.buttonPrimaryHoverBg} ${cyberTheme.buttonHover} text-white px-6 py-3 rounded-xl shadow-lg`}>
                  <AiOutlinePlus className="mr-2" /> 새 단권화 노트
                </Button>
              </div>
            )}
            {!summaryNotesLoading && !summaryNotesError && summaryNotes.length > 0 && (
              <div className="space-y-4">
                {filteredSummaryNotes.map(note => (
                  <div 
                    key={note._id} 
                    className={`p-6 rounded-xl shadow-lg ${cyberTheme.cardTransition} ${cyberTheme.cardHover} border ${cyberTheme.borderSecondary}/30 ${cyberTheme.cardBg} hover:shadow-purple-500/30`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className={`text-xl sm:text-2xl font-semibold ${cyberTheme.secondary} mb-3 hover:text-purple-300 truncate leading-tight`} title={note.title}>
                          <Link href={`/summary-notes/${note._id}/edit`} className="hover:underline">{note.title}</Link>
                        </h3>
                        <p className={`text-base ${cyberTheme.textMuted} mb-3 line-clamp-2 leading-relaxed`}>{note.description || '어떤 내용인지 간단한 설명을 추가해보세요.'}</p>
                        <div className="flex items-center gap-4 text-sm ${cyberTheme.textMuted}">
                          <span className="flex items-center gap-1">
                            <AiOutlineHighlight className="h-4 w-4" />
                            연결: {note.orderedNoteIds.length}개
                          </span>
                          <span className="flex items-center gap-1">
                            <FiClock className="h-4 w-4" />
                            수정: <ClientDateDisplay createdAt={note.updatedAt} />
                          </span>
                        </div>
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
                              <PencilIcon className="h-4 w-4 mr-2" /> 수정
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteSummaryNoteFromList(note._id)} 
                              className={`${cyberTheme.menuItemHover} text-red-400 hover:!text-red-400 cursor-pointer flex items-center`}
                            >
                              <TrashIcon className="h-4 w-4 mr-2" /> 삭제
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
      <SearchUIManager />
    </div>
  );
} 