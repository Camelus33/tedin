"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { AiOutlinePlus, AiOutlineSearch, AiOutlineFilter, AiOutlineEdit, AiOutlineDelete, AiOutlineHighlight } from "react-icons/ai";
import { FiBook, FiClock, FiChevronRight, FiMoreVertical, FiList, FiCalendar, FiTrendingUp, FiActivity } from "react-icons/fi";
import { books as booksApi } from "@/lib/api";
import Spinner from "@/components/ui/Spinner";

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
};

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Book Type (Keep as is)
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

// Sort options type
type SortByType = "title" | "date" | "progress";

export default function BooksPage() {
  const router = useRouter();
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
  
  const requestTimeout = useRef<NodeJS.Timeout | null>(null);
  const controller = useRef<AbortController | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    
    return () => {
      isMounted.current = false;
      if (controller.current) {
        controller.current.abort();
      }
      if (requestTimeout.current) {
        clearTimeout(requestTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    const fetchBooks = async () => {
      if (controller.current) {
        controller.current.abort();
      }
      if (requestTimeout.current) {
        clearTimeout(requestTimeout.current);
      }
      
      controller.current = new AbortController();
      setIsLoading(true);
      setError("");
      
      requestTimeout.current = setTimeout(() => {
        if (controller.current) {
          controller.current.abort();
          if (isMounted.current) {
            setError("서버 응답 시간이 초과되었습니다. 네트워크 연결을 확인하거나 나중에 다시 시도해주세요.");
            setIsLoading(false);
          }
        }
      }, 15000);
      
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/auth/login");
          return;
        }

        console.log('Fetching books from API...');
        const response = await fetch(`${API_BASE_URL}/books`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.current.signal
        });

        console.log('Book list API response status:', response.status);

        if (!response.ok) {
          throw new Error(`기억 저장소 정보를 불러오는 데 실패했습니다. 상태: ${response.status}`);
        }

        let data;
        try {
          data = await response.json();
          console.log('Book list data received:', data);
        } catch (e) {
          console.error('Error parsing API response:', e);
          throw new Error('서버 응답을 처리하는 데 실패했습니다. 잘못된 데이터 형식');
        }
        
        let booksData: Book[] = [];
        
        if (Array.isArray(data)) {
          booksData = data;
        } else if (data && Array.isArray(data.books)) {
          booksData = data.books;
        } else {
          console.error('책 데이터 형식이 올바르지 않습니다:', data);
          booksData = [];
        }
        
        if (isMounted.current) {
          setBooks(booksData);
          setFilteredBooks(booksData);
          setIsLoading(false);
        }
      } catch (err: any) {
        console.error('책 목록 로딩 오류:', err);
        
        if (isMounted.current && err.name !== 'AbortError') {
          setError(err.message || "기억 저장소 정보를 불러오는 중 오류가 발생했습니다");
          setIsLoading(false);
        }
      } finally {
        if (requestTimeout.current) {
          clearTimeout(requestTimeout.current);
          requestTimeout.current = null;
        }
      }
    };

    fetchBooks();
  }, [router]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredBooks(books);
      return;
    }

    const filtered = books.filter(
      (book) =>
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase())
    );
    applySort(filtered);
  }, [searchQuery, books, sortBy]);

  const applySort = (booksToSort: Book[]) => {
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
  };

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
    return date.toLocaleDateString('ko-KR');
  };

  const handleDeleteBook = async (bookId: string) => {
    if (!confirm('정말로 이 기억 저장소 항목을 삭제하시겠습니까?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/books/${bookId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('기억 저장소 항목 삭제 실패');
      }

      alert('기억 저장소 항목이 성공적으로 삭제되었습니다.');
      setBooks(books.filter(book => book._id !== bookId));
      const newBooks = books.filter(b => b._id !== bookId);
      const filtered = newBooks.filter(
        (book) =>
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.author.toLowerCase().includes(searchQuery.toLowerCase())
      );
      applySort(filtered);
      setShowMenu(null);
    } catch (err: any) {
      alert(`오류 발생: ${err.message}`);
      console.error('기억 저장소 항목 삭제 오류:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMenu = (bookId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(prev => (prev === bookId ? null : bookId));
  };
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMenu) {
        setShowMenu(null);
      }
      if (showSortOptions && 
          sortButtonRef.current && !sortButtonRef.current.contains(event.target as Node) &&
          sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
          setShowSortOptions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu, showSortOptions]);

  const handleViewBookDetails = (bookId: string) => {
    router.push(`/books/${bookId}`);
  };

  const handleAddBook = () => {
    router.push("/books/new");
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${cyberTheme.gradient} p-4`}>
        <Spinner size="lg" color="cyan" />
        <p className={`mt-4 ${cyberTheme.textMuted}`}>기억 저장소 정보 로딩 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${cyberTheme.gradient} p-4`}>
        <div className={`${cyberTheme.cardBg} rounded-xl shadow-2xl p-6 max-w-md w-full border ${cyberTheme.errorBorder} text-center`}>
            <p className={`mb-4 ${cyberTheme.errorText}`}>{error}</p>
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
            <h1 className={`text-2xl md:text-3xl font-bold ${cyberTheme.primary}`}>
              내 서재
            </h1>
            <button
              onClick={handleAddBook}
              aria-label="새 책 등록"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${cyberTheme.buttonPrimaryBg} ${cyberTheme.buttonPrimaryHoverBg} text-white font-medium transition-colors w-full sm:w-auto mt-3 sm:mt-0`}
            >
              <AiOutlinePlus className="h-5 w-5" />
              <span>새 책 등록</span>
            </button>
          </div>
          <p className={`text-sm ${cyberTheme.textMuted}`}>
            당신이 읽고 있는 모든 것을 등록하고 관리하세요. 책, 논문, 수험서, 학습자료, 문서 등
          </p>
        </div>

        <div className={`flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 p-4 ${cyberTheme.bgSecondary} rounded-lg`}>
          <div className="relative w-full sm:w-auto flex-grow">
            <AiOutlineSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${cyberTheme.textMuted}`} />
            <input
              type="text"
              placeholder="기억 저장소에서 책 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${cyberTheme.inputBorder} ${cyberTheme.inputBg} ${cyberTheme.textLight} focus:outline-none ${cyberTheme.inputFocusRing} ${cyberTheme.inputFocusBorder}`}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
             <div className="relative">
                 <button
                     ref={sortButtonRef}
                     onClick={() => setShowSortOptions(!showSortOptions)}
                     aria-label="정렬 기준 변경"
                     className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${cyberTheme.inputBorder} ${cyberTheme.buttonSecondaryBg} ${cyberTheme.buttonSecondaryHoverBg} ${cyberTheme.textLight} transition-colors`}
                 >
                     <AiOutlineFilter className="h-5 w-5" />
                     <span>{sortOptions.find(opt => opt.key === sortBy)?.label || '정렬'}</span>
                 </button>
                 {showSortOptions && (
                     <div
                         ref={sortDropdownRef}
                         className={`absolute right-0 mt-2 w-48 ${cyberTheme.menuBg} rounded-md shadow-lg z-10 border ${cyberTheme.inputBorder}`}
                     >
                         {sortOptions.map((option) => (
                             <button
                                 key={option.key}
                                 onClick={() => handleSortChange(option.key)}
                                 className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${cyberTheme.textLight} ${cyberTheme.menuItemHover} ${sortBy === option.key ? 'font-bold' : ''}`}
                             >
                                 <option.icon className="h-4 w-4" />
                                 {option.label}
                             </button>
                         ))}
                     </div>
                 )}
             </div>
          </div>
        </div>

        {filteredBooks.length === 0 && !isLoading ? (
          <div className={`text-center py-10 ${cyberTheme.textMuted} ${cyberTheme.cardBg} rounded-lg`}>
            해당하는 책이 없거나 아직 책을 추가하지 않았습니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filteredBooks.map((book) => {
              const progress = calculateProgress(book.currentPage, book.totalPages);
              return (
                <div
                  key={book._id}
                  onClick={() => handleViewBookDetails(book._id)}
                  className={`relative ${cyberTheme.cardBg} rounded-lg shadow-lg overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:border-cyan-500/30 border ${cyberTheme.inputBorder}`}
                >
                  <button
                    onClick={(e) => toggleMenu(book._id, e)}
                    aria-label="기억 관리 메뉴"
                    className={`absolute top-2 right-2 p-1.5 rounded-full ${cyberTheme.buttonSecondaryBg} ${cyberTheme.buttonSecondaryHoverBg} ${cyberTheme.textMuted} z-10`}
                  >
                    <FiMoreVertical className="h-5 w-5" />
                  </button>

                  {showMenu === book._id && (
                    <div className={`action-menu absolute top-10 right-2 mt-1 w-36 ${cyberTheme.menuBg} rounded-md shadow-lg z-20 border ${cyberTheme.inputBorder}`}>
                       <Link href={`/books/${book._id}/edit`} onClick={(e) => e.stopPropagation()} className={`block w-full text-left px-4 py-2 text-sm ${cyberTheme.textLight} ${cyberTheme.menuItemHover} flex items-center gap-2`}>
                          <AiOutlineEdit className="h-4 w-4" /> 수정하기
                       </Link>
                       <button
                         onClick={(e) => { e.stopPropagation(); handleDeleteBook(book._id); }}
                         className={`block w-full text-left px-4 py-2 text-sm ${cyberTheme.errorText} ${cyberTheme.menuItemHover} flex items-center gap-2`}
                       >
                          <AiOutlineDelete className="h-4 w-4" /> 삭제하기
                       </button>
                    </div>
                  )}

                  <div className={`w-full h-32 md:h-40 ${cyberTheme.inputBg} flex items-center justify-center ${cyberTheme.textMuted}`}>
                    {book.coverImage ? (
                      <Image src={book.coverImage} alt={book.title} width={100} height={150} className="object-cover w-full h-full" />
                    ) : (
                      <FiBook className="h-12 w-12" />
                    )}
                  </div>

                  <div className="p-4">
                    <h2 className="font-bold text-base md:text-lg mb-1 truncate ${cyberTheme.textLight}" title={book.title}>{book.title}</h2>
                    <p className={`text-xs md:text-sm ${cyberTheme.textMuted} mb-3 truncate`} title={book.author}>{book.author}</p>

                    <div className="mb-2">
                      <div className={`w-full ${cyberTheme.progressBarBg} rounded-full h-1.5`}>
                        <div
                          className={`h-1.5 rounded-full ${cyberTheme.progressFg}`}
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <p className={`text-xs mt-1 ${cyberTheme.textMuted}`}>기억 저장: {progress}% ({book.currentPage}/{book.totalPages}쪽)</p>
                    </div>

                    <div className="flex items-center text-xs ${cyberTheme.textMuted}">
                      <FiClock className="h-3.5 w-3.5 mr-1" />
                      <span>최근 기억 활성화: {formatLastRead(book.lastReadAt)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
} 