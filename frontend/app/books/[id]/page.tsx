'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Button from '@/components/common/Button';
import { AiOutlineEdit, AiOutlineQuestionCircle, AiOutlineArrowRight, AiOutlineInfoCircle } from 'react-icons/ai';
import { FiBook } from 'react-icons/fi';
import useBooks from '@/hooks/useBooks';
import TSNoteCard from '@/components/ts/TSNoteCard';
import Spinner from '@/components/ui/Spinner';

// API base URL - this should match what's used elsewhere in the app
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Cyber Theme Definition (Copied from books/page.tsx)
const cyberTheme = {
  primary: 'text-cyan-400',
  secondary: 'text-purple-400',
  bgPrimary: 'bg-gray-900',
  bgSecondary: 'bg-gray-800',
  cardBg: 'bg-gray-800/60', // Slightly transparent card bg
  borderPrimary: 'border-cyan-500',
  borderSecondary: 'border-purple-500',
  gradient: 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900', // Main background gradient
  textMuted: 'text-gray-400',
  textLight: 'text-gray-300',
  textDark: 'text-gray-800', // Keep for contrast if needed inside cards
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
  buttonOutlineBorder: 'border-cyan-500', // For outline buttons
  buttonOutlineText: 'text-cyan-400',
  buttonOutlineHoverBg: 'hover:bg-cyan-500/10',
  buttonDisabledBg: 'bg-gray-600',
  errorText: 'text-red-400',
  errorBorder: 'border-red-500/50',
  menuBg: 'bg-gray-700',
  menuItemHover: 'hover:bg-gray-600',
  tooltipBg: 'bg-gray-700',
  tooltipText: 'text-gray-200',
};

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
  }, [bookId, book, router]);

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
    if (!confirm('정말로 이 책을 삭제하시겠습니까? 연관된 메모도 함께 삭제됩니다.')) {
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
        throw new Error('책 삭제 실패');
      }

      alert('책이 삭제되었습니다.');
      router.push('/books');
    } catch (err: any) {
      alert(`오류: ${err.message}`);
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
      <div className={`min-h-screen flex items-center justify-center ${cyberTheme.gradient}`}>
        <Spinner size="lg" color="cyan" />
        <p className={`ml-4 ${cyberTheme.textLight}`}>기억 정보 로딩 중...</p>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${cyberTheme.gradient}`}>
        <div className={`${cyberTheme.cardBg} rounded-xl shadow-lg p-6 max-w-md w-full border ${cyberTheme.errorBorder}`}>
          <h1 className={`text-xl font-bold ${cyberTheme.errorText} mb-4`}>오류 발생</h1>
          <p className={`mb-6 ${cyberTheme.textLight}`}>{error || '기억 정보를 찾을 수 없습니다.'}</p>
          <Button
            href="/books"
            variant="default"
            className={`w-full text-white`}
          >
            기억 저장소 목록으로
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
    <div className={`min-h-screen ${cyberTheme.gradient} p-4 md:p-6 ${cyberTheme.textLight}`}>
      <div className="container mx-auto max-w-4xl">
        {/* App Logo/Name Header */}
        <div className="text-center mb-6">
          <h1 
            className={`text-2xl font-bold ${cyberTheme.primary} cursor-pointer hover:text-cyan-300 transition-colors inline-block opacity-80`}
            onClick={() => router.push('/dashboard')}
          >
            Habitus33
          </h1>
        </div>
        
        {/* Book Header */}
        <div className={`${cyberTheme.cardBg} rounded-xl shadow-2xl overflow-hidden mb-6 relative border ${cyberTheme.borderSecondary}/30`}>
          {/* Action Buttons group at top right */}
          <div className="absolute top-4 right-4 z-10 flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleEditBook}
              aria-label="책 정보 수정"
              className={`${cyberTheme.buttonOutlineBorder} ${cyberTheme.buttonOutlineText} ${cyberTheme.buttonOutlineHoverBg} border`}
            >
              책 정보 수정
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleStartReading}
              aria-label="TS 모드 진입"
              className={`text-white`}
            >
              TS 모드 진입
            </Button>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
            {/* Book Cover and placeholder */}
            <div className="md:col-span-1 space-y-2 flex justify-center">
              <div className={`w-full max-w-[150px] aspect-[2/3] ${cyberTheme.inputBg} rounded-lg overflow-hidden border ${cyberTheme.inputBorder}`}>
                {bookData.coverImage ? (
                  <img
                    src={bookData.coverImage}
                    alt={bookData.title || '기억 표지'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className={`flex flex-col items-center justify-center w-full h-full text-gray-500`}>
                    <FiBook className="h-10 w-10 mb-2" />
                    <span className="text-xs">표지 없음</span>
                  </div>
                )}
              </div>
            </div>
            {/* Book Info */}
            <div className="md:col-span-3 space-y-3">
              <h1 className={`text-2xl md:text-3xl font-bold ${cyberTheme.textLight} mb-1`}>{bookData.title || '제목 없음'}</h1>
              <p className={`text-md ${cyberTheme.textLight} mb-4`}>{bookData.author || '저자 미상'}</p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                {[
                  ['장르', localMetadata?.genre || bookData.category || bookData.genre || '미분류'],
                  ['독서 목적', localMetadata?.readingPurpose || bookData.readingPurpose || bookData.readingGoal || '설정되지 않음'],
                  ['총 페이지', (bookData.totalPages && bookData.totalPages > 0) ? `${bookData.totalPages} 페이지` : '페이지 정보 없음'],
                  ['등록일', bookData.createdAt ? formatDate(bookData.createdAt) : '등록일 정보 없음'],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-baseline space-x-2">
                    <span className={`w-20 ${cyberTheme.textMuted}`}>{label}:</span>
                    <span className={`font-medium ${cyberTheme.textLight}`}>{value}</span>
                  </div>
                ))}
              </div>
              {/* Progress Bar */}
              <div className="pt-2" role="group" aria-label={`독서 진행률 ${getProgressPercentage()}%`}>
                <div className="flex justify-between items-center mb-1 text-sm">
                  <span className={cyberTheme.textMuted}>독서 진행률</span>
                  <span className={cyberTheme.textLight}>{getProgressPercentage()}%</span>
                </div>
                <div className={`w-full ${cyberTheme.progressBarBg} h-2 rounded-full overflow-hidden`}>
                  <div
                    className={`${cyberTheme.progressFg} h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${getProgressPercentage()}%` }}
                  />
                </div>
                <div className={`text-xs mt-1 ${cyberTheme.textMuted}`}>
                  현재 {bookData.currentPage || 0} / {bookData.totalPages || '∞'} 페이지
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Memo Evolution Section - Cybernetic Feedback Loop 개선버전 */}
        <section className={`mt-8 ${cyberTheme.bgSecondary} p-4 md:p-6 rounded-lg border ${cyberTheme.borderPrimary}/30`}>
          <div className="flex flex-col md:flex-row gap-8 mb-3">
            {/* 왼쪽: 타이틀/설명 */}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl md:text-2xl font-bold text-cyan-400 mb-1">메모 진화: 지식성장 피드백루프</h2>
              <span className="text-xs text-gray-400 font-medium block mb-2">관찰-기록-성찰-조정-적용-창발의 순환, 그리고 자기주도적 성장</span>
              <p className="text-base font-semibold text-cyan-300 mb-2">기억과 지식은 순환하며 진화한다.</p>
              <p className="text-sm text-gray-400 leading-relaxed mb-2">
                기억과 지식은 <strong className="text-cyan-300">관찰-기록-성찰-조정-적용</strong>의 순환을 거치며,<br/>
                피드백을 통해 점점 더 깊고 넓게 진화합니다.<br/>
                이 순환의 끝에서 우리는 <strong className="text-emerald-300">새로운 통찰(창발)</strong>을 얻고,<br/>
                다시 관찰로 돌아가 더 높은 차원의 발견을 이룹니다.<br/>
                이것이 <strong className="text-purple-300">사이버네틱스 피드백루프</strong>, 그리고 진정한 진화의 본질입니다.
              </p>
            </div>
            {/* 오른쪽: 단계별 카드 grid */}
            <div className="flex-1 min-w-0">
              {(() => {
                // 네온/사이버틱 6단계 그라디언트 팔레트
                const gradientColors = [
                  {
                    bg: 'bg-[#00eaff]/30', // 1 네온 블루
                    badge: 'text-[#00eaff] border-[#00eaff]',
                  },
                  {
                    bg: 'bg-[#00ffd0]/30', // 2 네온 민트
                    badge: 'text-[#00ffd0] border-[#00ffd0]',
                  },
                  {
                    bg: 'bg-[#00ff85]/30', // 3 네온 그린
                    badge: 'text-[#00ff85] border-[#00ff85]',
                  },
                  {
                    bg: 'bg-[#aaff00]/30', // 4 네온 라임
                    badge: 'text-[#aaff00] border-[#aaff00]',
                  },
                  {
                    bg: 'bg-[#ffd600]/30', // 5 네온 옐로우
                    badge: 'text-[#ffd600] border-[#ffd600]',
                  },
                  {
                    bg: 'bg-[#ff00c8]/30', // 6 네온 핑크
                    badge: 'text-[#ff00c8] border-[#ff00c8]',
                  },
                ];
                const stages = [
                  {
                    title: '관찰',
                    desc: '새로움에 주의를 기울입니다.',
                  },
                  {
                    title: '기록',
                    desc: '중요함을 메모로 외부화합니다.',
                  },
                  {
                    title: '성찰',
                    desc: '질문 후, 의미를 부여합니다.',
                  },
                  {
                    title: '조정',
                    desc: '연결 - 재구성 -새로운 시각',
                  },
                  {
                    title: '적용',
                    desc: '실제 자신의 삶에 활용',
                  },
                  {
                    title: '창발',
                    desc: 'Aha! ',
                    extra: <span className="text-gray-400">(예: "이거 였구나!"라는 통찰)</span>,
                  },
                ];
                // 시계방향 배치 인덱스: 1 2 / 6 3 / 5 4
                const clockwiseOrder = [0, 1, 5, 2, 4, 3];
                // 2열 3행으로 배치
                const grid = [
                  [clockwiseOrder[0], clockwiseOrder[1]], // 1 2
                  [clockwiseOrder[2], clockwiseOrder[3]], // 6 3
                  [clockwiseOrder[4], clockwiseOrder[5]], // 5 4
                ];
                return (
                  <div className="grid grid-rows-3 grid-cols-2 gap-2">
                    {grid.flat().map((stageIdx, pos) => {
                      const stage = stages[stageIdx];
                      const color = gradientColors[stageIdx];
                      return (
                        <div key={stage.title} className={`rounded-lg ${color.bg} p-2 shadow text-xs flex items-start gap-2`}>
                          {/* Step Number Badge */}
                          <span
                            className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs border-2 ${color.badge} bg-gray-900/70 mr-1`}
                            aria-label={`단계 ${stageIdx + 1}`}
                          >
                            {stageIdx + 1}
                          </span>
                          <div>
                            <span className={`font-bold ${color.badge}`}>{stage.title}</span>
                            <p className="mt-1 text-gray-200 text-[10px] leading-tight">
                              {stage.desc} {stage.extra || null}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Notes List */}
          {tsNotes.length === 0 ? (
            <p className={`${cyberTheme.textMuted} text-center py-4`}>활성화된 기억 데이터가 없습니다. TS 루프를 시작하여 메모를 생성하세요.</p>
          ) : (
            <div className={`space-y-4 border-t ${cyberTheme.inputBorder} pt-4`}>
              {tsNotes.map((note) => (
                <div key={note._id} className={`${cyberTheme.cardBg} p-3 rounded-md border ${cyberTheme.inputBorder}`}>
                  <TSNoteCard
                    note={note}
                    onUpdate={(updated: Partial<Note>) =>
                      setTsNotes((prev) =>
                        prev.map((n) => (n._id === note._id ? { ...n, ...updated } : n))
                      )
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Optional: Delete Button at the bottom? */}
        <div className="mt-8 flex justify-end">
          <Button
            variant="danger"
            size="sm"
            onClick={handleDeleteBook}
            disabled={isDeleting}
            className={`border border-red-500/50 text-red-400 hover:bg-red-500/10 ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isDeleting ? '삭제 중...' : '이 책 삭제'}
          </Button>
        </div>
      </div>
    </div>
  );
} 