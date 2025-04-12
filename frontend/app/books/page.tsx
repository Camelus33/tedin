"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { AiOutlinePlus, AiOutlineSearch, AiOutlineFilter, AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import { FiBook, FiClock, FiChevronRight, FiMoreVertical } from "react-icons/fi";
import { books as booksApi } from "@/lib/api";

// API base URL - for consistent usage
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// 도서 타입 정의
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

export default function BooksPage() {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"title" | "date" | "progress">("date");
  const [showMenu, setShowMenu] = useState<string | null>(null);
  
  // For keeping track of API requests
  const requestTimeout = useRef<NodeJS.Timeout | null>(null);
  const controller = useRef<AbortController | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    
    // Cleanup function
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
      // Reset any existing controllers or timeouts
      if (controller.current) {
        controller.current.abort();
      }
      if (requestTimeout.current) {
        clearTimeout(requestTimeout.current);
      }
      
      // Create a new abort controller for this request
      controller.current = new AbortController();
      setIsLoading(true);
      setError(""); // Clear any previous errors
      
      // Set a timeout to abort the request if it takes too long
      requestTimeout.current = setTimeout(() => {
        if (controller.current) {
          controller.current.abort();
          if (isMounted.current) {
            setError("서버 응답 시간이 초과되었습니다. 네트워크 연결을 확인하거나 나중에 다시 시도해주세요.");
            setIsLoading(false);
          }
        }
      }, 15000); // 15 seconds timeout
      
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
          throw new Error(`책 목록을 불러오는데 실패했습니다. 상태: ${response.status}`);
        }

        let data;
        try {
          data = await response.json();
          console.log('Book list data received:', data);
        } catch (e) {
          console.error('Error parsing API response:', e);
          throw new Error('서버 응답을 처리하는 데 실패했습니다. 잘못된 데이터 형식');
        }
        
        // 백엔드에서 반환하는 데이터 구조에 맞게 처리
        let booksData: Book[] = [];
        
        if (Array.isArray(data)) {
          booksData = data;
        } else if (data && Array.isArray(data.books)) {
          booksData = data.books;
        } else {
          console.error('책 데이터 형식이 올바르지 않습니다:', data);
          // Set empty array instead of throwing error, allow the UI to show empty state
          booksData = [];
        }
        
        if (isMounted.current) {
          setBooks(booksData);
          setFilteredBooks(booksData);
          setIsLoading(false);
        }
      } catch (err: any) {
        console.error('책 목록 로딩 오류:', err);
        
        // Don't set error state if it's just an abort error from unmounting
        if (isMounted.current && err.name !== 'AbortError') {
          setError(err.message || "책 정보를 불러오는 중 오류가 발생했습니다");
          setIsLoading(false);
        }
      } finally {
        // Clear the timeout
        if (requestTimeout.current) {
          clearTimeout(requestTimeout.current);
          requestTimeout.current = null;
        }
      }
    };

    fetchBooks();
  }, [router]);

  // 검색 기능
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
    setFilteredBooks(filtered);
  }, [searchQuery, books]);

  // 정렬 기능
  useEffect(() => {
    const sorted = [...filteredBooks];
    
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
        const progressA = a.totalPages ? (a.currentPage / a.totalPages) * 100 : 0;
        const progressB = b.totalPages ? (b.currentPage / b.totalPages) * 100 : 0;
        return progressB - progressA;
      });
    }
    
    setFilteredBooks(sorted);
  }, [sortBy]);

  // Separate useEffect to prevent sort being lost when filter changes
  useEffect(() => {
    const applySort = () => {
      let sorted = [...books];
      
      if (searchQuery.trim()) {
        sorted = sorted.filter(
          (book) =>
            book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.author.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
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
          const progressA = a.totalPages ? (a.currentPage / a.totalPages) * 100 : 0;
          const progressB = b.totalPages ? (b.currentPage / b.totalPages) * 100 : 0;
          return progressB - progressA;
        });
      }
      
      setFilteredBooks(sorted);
    };
    
    applySort();
  }, [books, searchQuery, sortBy]);

  // 진행률 계산
  const calculateProgress = (currentPage: number, totalPages: number) => {
    if (!totalPages) return 0;
    const progress = Math.round((currentPage / totalPages) * 100);
    return Math.min(Math.max(progress, 0), 100); // Ensure between 0-100
  };

  // 마지막 읽은 날짜 포맷팅
  const formatLastRead = (dateString?: string) => {
    if (!dateString) return "";
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "오늘";
    if (diffDays === 1) return "어제";
    if (diffDays < 7) return `${diffDays}일 전`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;
    
    return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
  };

  // 책 삭제 처리 함수
  const handleDeleteBook = async (bookId: string) => {
    if (!confirm('정말로 이 책을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
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
        throw new Error('책 삭제를 실패했습니다.');
      }

      alert('책이 성공적으로 삭제되었습니다.');
      // 목록 다시 불러오기
      setBooks(books.filter(book => book._id !== bookId));
      setFilteredBooks(filteredBooks.filter(book => book._id !== bookId));
    } catch (err: any) {
      alert(`오류 발생: ${err.message}`);
      console.error('책 삭제 오류:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 메뉴 토글 함수
  const toggleMenu = (bookId: string, e: React.MouseEvent) => {
    // 이벤트가 더 이상 전파되지 않도록 함
    e.stopPropagation();
    
    if (showMenu === bookId) {
      setShowMenu(null);
    } else {
      setShowMenu(bookId);
    }
  };
  
  // 메뉴 외부 클릭 처리
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMenu) {
        setShowMenu(null);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showMenu]);

  // 직접 상세 페이지로 이동하는 함수
  const handleViewBookDetails = (bookId: string) => {
    router.push(`/books/${bookId}`);
  };

  // 책 추가 페이지로 이동
  const handleAddBook = () => {
    router.push("/books/new");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-gray-600 hover:text-indigo-600 transition-colors">
                <span className="text-sm font-medium">대시보드</span>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">내 서재</h1>
            </div>
            <button
              onClick={handleAddBook}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
            >
              <AiOutlinePlus size={18} />
              <span>새 책 등록</span>
            </button>
          </div>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <AiOutlineSearch className="text-gray-400" size={20} />
            </div>
            <input
              type="text"
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="제목 또는 저자 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "title" | "date" | "progress")}
              className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
            >
              <option value="date">최근 읽은 순</option>
              <option value="title">제목순</option>
              <option value="progress">진행률순</option>
            </select>
            <button className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
              <AiOutlineFilter size={20} className="text-gray-600" />
            </button>
          </div>
        </div>

        {isLoading ? (
          // 로딩 UI
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">책 목록을 불러오는 중...</p>
          </div>
        ) : error ? (
          // 에러 UI
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-red-600 underline"
            >
              다시 시도
            </button>
          </div>
        ) : filteredBooks.length === 0 ? (
          // 빈 상태 UI
          <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
              <FiBook size={36} className="text-indigo-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">아직 등록된 책이 없습니다</h3>
            <p className="text-gray-600 mb-6 text-center max-w-md">
              새 책을 등록하고 읽기 세션을 기록하여 독서 습관을 개선해보세요!
            </p>
            <button
              onClick={handleAddBook}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-medium transition-colors"
            >
              <AiOutlinePlus size={20} />
              <span>새 책 등록하기</span>
            </button>
          </div>
        ) : (
          // 책 목록 그리드
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.map((book) => (
              <div
                key={book._id}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
                onClick={() => handleViewBookDetails(book._id)}
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="relative h-36 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      {book.coverImage ? (
                        <Image
                          src={book.coverImage}
                          alt={book.title}
                          fill
                          sizes="100px"
                          className="object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "https://via.placeholder.com/120x180?text=No+Cover";
                          }}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-gray-200">
                          <FiBook size={36} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                        {book.title}
                      </h2>
                      <p className="text-sm text-gray-600 mb-2">{book.author}</p>
                      <div className="flex items-center text-xs text-gray-500 mb-3">
                        <FiClock size={14} className="mr-1" />
                        <span>{formatLastRead(book.lastReadAt)}</span>
                      </div>

                      {/* 진행률 바 */}
                      <div className="relative w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-1">
                        <div
                          className="absolute top-0 left-0 h-full bg-indigo-500 rounded-full"
                          style={{
                            width: `${calculateProgress(book.currentPage, book.totalPages)}%`,
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-indigo-600">
                          {calculateProgress(book.currentPage, book.totalPages)}%
                        </span>
                        <span className="text-gray-500">
                          {book.currentPage} / {book.totalPages} 페이지
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 p-4 bg-gray-50 flex justify-between">
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewBookDetails(book._id);
                      }}
                      className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      상세보기
                    </button>
                    <div className="relative">
                      <button 
                        onClick={(e) => toggleMenu(book._id, e)}
                        className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        <FiMoreVertical size={16} />
                      </button>
                      {showMenu === book._id && (
                        <div 
                          className="absolute bottom-full left-0 mb-1 bg-white shadow-lg rounded-md overflow-hidden z-10 w-32"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/books/${book._id}/edit`);
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                          >
                            <AiOutlineEdit size={14} />
                            <span>수정</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBook(book._id);
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 text-left"
                          >
                            <AiOutlineDelete size={14} />
                            <span>삭제</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/reading-session?bookId=${book._id}`);
                    }}
                    className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    계속 읽기
                    <FiChevronRight size={16} className="ml-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 