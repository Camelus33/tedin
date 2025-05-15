'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Button from '@/components/common/Button';
import { AiOutlineEdit, AiOutlineQuestionCircle, AiOutlineArrowRight, AiOutlineInfoCircle, AiOutlineEye } from 'react-icons/ai';
import { FiBook } from 'react-icons/fi';
import useBooks from '@/hooks/useBooks';
import TSNoteCard from '@/components/ts/TSNoteCard';
import { TSSessionDetails } from '@/components/ts/TSNoteCard';
import Spinner from '@/components/ui/Spinner';
import FlashcardDeck from '@/components/flashcard/FlashcardDeck';
import FlashcardForm from '@/components/flashcard/FlashcardForm';
import { DocumentTextIcon, BookOpenIcon, PlayCircleIcon, NewspaperIcon } from '@heroicons/react/24/outline';
import { ShareIcon } from '@heroicons/react/24/solid';
import { AiFillYoutube } from 'react-icons/ai';

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

// 독서 목적 라벨 매핑
const readingPurposeLabels: Record<string, string> = {
  exam_prep: "시험/인증 대비",
  practical_knowledge: "실무지식/기술 습득",
  humanities_self_reflection: "인문 소양/자기 성찰",
  reading_pleasure: "읽는 재미"
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
  originSession?: string;
  importanceReason?: string;
  momentContext?: string;
  relatedKnowledge?: string;
  mentalImage?: string;
};

type Session = {
  _id: string;
  startPage: number;
  endPage: number;
  actualEndPage?: number;
  durationSec: number;
  ppm?: number;
  createdAt: string;
};

// RelatedLink 타입 정의
type RelatedLink = {
  type: 'bookAndPaper' | 'youtube' | 'sns' | 'media' | 'noteApp';
  url: string;
  reason: string;
};

export default function BookDetailPage() {
  const router = useRouter();
  const params = useParams();
  const bookId = params.id as string;
  
  // Use custom hooks
  const { bookFetchState, fetchBookDetail } = useBooks();
  const [tsNotes, setTsNotes] = useState<Note[]>([]);
  const [tsSessions, setTsSessions] = useState<Session[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState<boolean>(true);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [flashcardFormNote, setFlashcardFormNote] = useState<Note | null>(null);
  const [flashcardDeckKey, setFlashcardDeckKey] = useState(0); // Deck 강제 리렌더용
  const [activeTab, setActiveTab] = useState<'memo' | 'flashcard' | 'relatedLinks'>('memo');
  const [showNewFlashcardForm, setShowNewFlashcardForm] = useState(false);
  const [selectedRelatedNote, setSelectedRelatedNote] = useState<Note | null>(null);
  
  // 관련 링크 탭용 상태
  const relatedLinkTabs: { key: RelatedLink['type']; label: string; icon: React.ComponentType<any>; tooltip: string; }[] = [
    { key: 'bookAndPaper', label: '책과 논문',        icon: BookOpenIcon,      tooltip: '관련있는 책, 논문의 링크' },
    { key: 'youtube',      label: '유튜브',          icon: AiFillYoutube,     tooltip: '관련 유튜브 영상'       },
    { key: 'sns',          label: 'SNS',             icon: ShareIcon,         tooltip: '관련 있는 인스타그램, X(구 트위터), 페이스북, 쓰레드, 레딧 등의 링크' },
    { key: 'media',        label: '언론·방송·매체',    icon: NewspaperIcon,     tooltip: '관련 기사/방송/매체'   },
    { key: 'noteApp',      label: '노트앱 연동',      icon: DocumentTextIcon,  tooltip: '노션, 옵시디언 등 자신의 관련 페이지 링크' },
  ];
  const [activeRelatedLinkTab, setActiveRelatedLinkTab] = useState<'bookAndPaper' | 'youtube' | 'sns' | 'media' | 'noteApp'>('bookAndPaper');
  
  // 관련 링크 입력 상태
  const [linkUrl, setLinkUrl] = useState('');
  const [linkReason, setLinkReason] = useState('');

  // 관련 링크 리스트 로컬 상태 (selectedRelatedNote별로 관리)
  const [relatedLinksMap, setRelatedLinksMap] = useState<Record<string, RelatedLink[]>>({});

  // 탭 전환/노트 변경 시 입력값 초기화
  useEffect(() => {
    setLinkUrl('');
    setLinkReason('');
  }, [activeRelatedLinkTab, selectedRelatedNote]);

  // 현재 노트의 관련 링크 리스트
  const currentLinks = selectedRelatedNote ? (relatedLinksMap[selectedRelatedNote._id] || []) : [];
  const filteredLinks = currentLinks.filter(l => l.type === activeRelatedLinkTab);

  // 링크 추가
  const handleAddRelatedLink = async () => {
    if (!selectedRelatedNote || !linkUrl.trim()) return;
    const newLink: RelatedLink = {
      type: activeRelatedLinkTab as RelatedLink['type'],
      url: linkUrl.trim(),
      reason: linkReason.trim(),
    };
    const noteId = selectedRelatedNote._id;
    const updatedLinks = [...(relatedLinksMap[noteId] || []), newLink];
    setRelatedLinksMap(prev => ({
      ...prev,
      [noteId]: updatedLinks,
    }));
    setLinkUrl('');
    setLinkReason('');
    // 서버 저장
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('로그인 필요');
      const res = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ relatedLinks: updatedLinks }),
      });
      if (!res.ok) throw new Error('서버 저장 실패');
      // 성공 피드백
      // alert('관련 링크가 저장되었습니다.');
    } catch (err) {
      alert('관련 링크 저장 중 오류 발생: ' + (err as any).message);
    }
  };

  // 링크 삭제
  const handleDeleteRelatedLink = async (idx: number) => {
    if (!selectedRelatedNote) return;
    const noteId = selectedRelatedNote._id;
    const updatedLinks = (relatedLinksMap[noteId] || []).filter((_, i) => i !== idx);
    setRelatedLinksMap(prev => ({
      ...prev,
      [noteId]: updatedLinks,
    }));
    // 서버 저장
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('로그인 필요');
      const res = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ relatedLinks: updatedLinks }),
      });
      if (!res.ok) throw new Error('서버 저장 실패');
      // alert('관련 링크가 삭제되었습니다.');
    } catch (err) {
      alert('관련 링크 삭제 중 오류 발생: ' + (err as any).message);
    }
  };
  
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
  
  // Fetch TS 메모 and TS 세션 when book is loaded
  useEffect(() => {
    if (!bookId || !book) return;
    
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) { router.push('/auth/login'); return; }

      // Fetch TS Notes
      try {
        const notesRes = await fetch(
          `${API_BASE_URL}/notes/book/${bookId}?originOnly=true`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!notesRes.ok) throw new Error('Failed to fetch TS notes');
        const notesData = await notesRes.json();
        setTsNotes(Array.isArray(notesData) ? notesData : notesData.notes || []);
        // relatedLinksMap 동기화 로직은 그대로 유지
        const linksMap: Record<string, RelatedLink[]> = {};
        (Array.isArray(notesData) ? notesData : notesData.notes || []).forEach((n: any) => {
          if (n.relatedLinks && Array.isArray(n.relatedLinks)) {
            linksMap[n._id] = n.relatedLinks;
          }
        });
        setRelatedLinksMap(linksMap);

      } catch (e) {
        console.error('TS notes load error:', e);
        setTsNotes([]);
        setRelatedLinksMap({});
      }

      // Fetch TS Sessions for the book
      setSessionsLoading(true);
      try {
        // 백엔드 라우터 설정에 따라 URL 수정 필요 (예: /api/sessions/book/${bookId})
        const sessionsRes = await fetch(
          `${API_BASE_URL}/sessions/book/${bookId}`, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!sessionsRes.ok) throw new Error('Failed to fetch TS sessions for book');
        const sessionsData = await sessionsRes.json();
        setTsSessions(Array.isArray(sessionsData) ? sessionsData : sessionsData.sessions || []);
      } catch (e) {
        console.error('TS sessions for book load error:', e);
        setTsSessions([]);
      } finally {
        setSessionsLoading(false);
      }
    };

    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId, book, router]); // fetchBookDetail 제거 (book 객체 변경 시 실행으로 충분)

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

  // 탭별 placeholder 매핑
  const linkPlaceholderMap: Record<RelatedLink['type'], string> = {
    bookAndPaper: '이 메모와 관련 있는 책 또는 논문의 온라인 링크를 입력하세요',
    youtube:      '이 메모와 관련 있는 유튜브 영상의 URL을 입력하세요',
    sns:          '이 메모와 관련 있는 SNS 게시물(URL)을 입력하세요',
    media:        '이 메모와 관련 있는 기사/방송/매체의 URL을 입력하세요',
    noteApp:      '노션·옵시디언 페이지 링크를 입력하세요',
  };
  const reasonPlaceholderMap: Record<RelatedLink['type'], string> = {
    bookAndPaper: '이 링크가 왜 책 또는 논문과 관련 있다고 생각했나요?',
    youtube:      '이 영상이 왜 관련 있다고 생각했나요?',
    sns:          '이 링크가 왜 SNS 게시물과 관련 있다고 생각했나요?',
    media:        '이 매체가 왜 관련 있다고 생각했나요?',
    noteApp:      '이 링크가 왜 노트앱 페이지와 관련 있다고 생각했나요?',
  };

  if (isLoading || sessionsLoading) {
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
                  ['독서 목적', readingPurposeLabels[String(localMetadata?.readingPurpose || bookData.readingPurpose || bookData.readingGoal)] || '설정되지 않음'],
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
        
        {/* 탭 버튼 */}
        <div className="flex gap-2 mb-4">
          <button
            className={`px-4 py-2 rounded-t-lg font-bold border-b-2 transition-colors ${activeTab === 'memo' ? 'border-cyan-400 text-cyan-300 bg-gray-900' : 'border-transparent text-gray-400 bg-gray-800 hover:text-cyan-200'}`}
            onClick={() => setActiveTab('memo')}
          >
            메모진화
          </button>
          <button
            className={`px-4 py-2 rounded-t-lg font-bold border-b-2 transition-colors ${activeTab === 'relatedLinks' ? 'border-green-400 text-green-400 bg-gray-900' : 'border-transparent text-gray-400 bg-gray-800'} ${!selectedRelatedNote ? 'opacity-50 cursor-not-allowed' : 'hover:text-green-300'}`}
            onClick={() => selectedRelatedNote && setActiveTab('relatedLinks')}
            disabled={!selectedRelatedNote}
            aria-disabled={!selectedRelatedNote}
          >
            지식연결
          </button>
          <button
            className={`px-4 py-2 rounded-t-lg font-bold border-b-2 transition-colors ${activeTab === 'flashcard' ? 'border-purple-400 text-purple-300 bg-gray-900' : 'border-transparent text-gray-400 bg-gray-800 hover:text-purple-200'}`}
            onClick={() => setActiveTab('flashcard')}
          >
            플래시카드
          </button>
        </div>
        {/* 탭별 컨테이너 */}
        {activeTab === 'memo' && (
          <section className={`mt-0 ${cyberTheme.bgSecondary} p-4 md:p-6 rounded-lg border ${cyberTheme.borderPrimary}/30`}>
            <div className="flex flex-col md:flex-row gap-12 mb-3">
              {/* 왼쪽: 타이틀/설명 */}
              <div className="flex-1 md:flex-[1.2] max-w-md pl-2 py-4 min-w-0">
                <h2 className="text-xl md:text-2xl font-bold text-cyan-400 mb-1">메모진화 - Think Beyond</h2>
                <span className="text-xs text-gray-400 font-medium block mb-2">단순 기록을 넘어, 실제 도움이 되는 메모</span>
                <p className="text-sm text-cyan-300 mb-2 font-semibold">메모진화 시스템은 중요한 정보와 생각을 단계별로 정리해, 학습·업무·성장에 바로 활용할 수 있게 돕습니다.</p>
                <ul className="text-xs text-gray-400 leading-relaxed list-disc pl-4 space-y-1">
                  <li>핵심을 빠르게 기록하세요.</li>
                  <li>왜 중요한지, 어떻게 쓸지 한 줄로 남기세요.</li>
                  <li>필요할 때마다 메모를 발전시켜 나만의 지식 자산으로 만드세요.</li>
                </ul>
              </div>
              {/* 오른쪽: 단계별 카드 grid */}
              <div className="flex-1 md:flex-[0.8] flex items-center justify-center min-h-[180px] min-w-0">
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
                  const stageIcons = [
                    AiOutlineEye, // 관찰
                    AiOutlineEdit, // 기록
                    AiOutlineQuestionCircle, // 성찰
                    AiOutlineArrowRight, // 조정
                    AiOutlineInfoCircle, // 적용
                    FiBook, // 창발 (예시)
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
                    <div className="grid grid-rows-3 grid-cols-2 gap-4">
                      {grid.flat().map((stageIdx, pos) => {
                        const stage = stages[stageIdx];
                        const color = gradientColors[stageIdx];
                        const Icon = stageIcons[stageIdx];
                        return (
                          <div key={stage.title} className={`relative group rounded-lg ${color.bg} p-1.5 shadow text-[11px] flex items-center gap-2 w-auto min-w-0 justify-start`}>
                            {/* Step Number Badge */}
                            <span
                              className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] border-2 ${color.badge} bg-gray-900/70 mr-0.5`}
                              aria-label={`단계 ${stageIdx + 1}`}
                            >
                              {stageIdx + 1}
                            </span>
                            {/* Icon + Title */}
                            <Icon className="w-4 h-4 mr-0.5" aria-label={stage.title} />
                            <span className={`font-bold ${color.badge} text-[11px]`}>{stage.title}</span>
                            {/* Tooltip on hover */}
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10 transition-opacity shadow-lg min-w-max text-center" role="tooltip">
                              {stage.desc} {stage.extra || null}
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
                {tsNotes.map((note) => {
                  // 해당 노트의 originSession ID로 tsSessions 목록에서 일치하는 세션 찾기
                  const noteSession = tsSessions.find(session => session._id === note.originSession);

                  let sessionDetailsForCard: TSSessionDetails | undefined = undefined;
                  
                  if (noteSession) {
                    sessionDetailsForCard = {
                      createdAtISO: noteSession.createdAt,    // 백엔드에서 ISO 문자열로 제공 가정
                      durationSeconds: noteSession.durationSec,
                      startPage: noteSession.startPage,
                      actualEndPage: noteSession.actualEndPage,
                      targetPage: noteSession.endPage,       // ISession.endPage가 목표 페이지
                      ppm: noteSession.ppm
                    };
                  }

                  return (
                    <div key={note._id} className={`${cyberTheme.cardBg} p-3 rounded-md border ${cyberTheme.inputBorder}`}>
                      <TSNoteCard
                        note={note}
                        readingPurpose={bookData.readingPurpose || 'humanities_self_reflection'}
                        onUpdate={(updatedFields) => {
                          const updatedNotes = tsNotes.map(n =>
                            n._id === note._id ? { ...n, ...updatedFields } : n
                          );
                          setTsNotes(updatedNotes);
                        }}
                        onFlashcardConvert={(targetNote) => {
                          setFlashcardFormNote(targetNote as any);
                          setShowNewFlashcardForm(true);
                          setActiveTab('flashcard');
                        }}
                        onRelatedLinks={(targetNote) => {
                          setSelectedRelatedNote(targetNote as any);
                          setActiveTab('relatedLinks');
                        }}
                        sessionDetails={sessionDetailsForCard}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}
        {activeTab === 'relatedLinks' && (
          selectedRelatedNote ? (
            <section className="bg-gray-800/60 rounded-2xl shadow-2xl border-0 p-8 mt-6">
              {/* 상단: 설명 + 도해식 flow */}
              <div className="flex flex-col md:flex-row gap-12 mb-3">
                {/* 좌측: 설명 */}
                <div className="flex-1 md:flex-[1.2] max-w-md pl-2 py-4 min-w-0">
                  <h2 className="text-xl font-bold text-green-300 mb-1">지식연결: 지식의 연결고리</h2>
                  <span className="text-xs text-gray-300 block mb-2">메모와 외부 자료(책, 논문, 영상 등)를 연결해 지식의 폭을 넓히세요.</span>
                  <ul className="text-xs text-gray-300 list-disc pl-4 space-y-1">
                    <li>중요한 자료를 메모와 함께 한눈에 관리하세요.</li>
                    <li>탭을 눌러 자료 유형별로 정리할 수 있습니다.</li>
                    <li>링크와 이유를 남기면, 나중에 쉽게 참고할 수 있습니다.</li>
                  </ul>
                </div>
                {/* 우측: 도해식 flow */}
                <div className="flex-1 md:flex-[0.8] flex flex-col items-center justify-center min-h-[180px] min-w-0">
                  <div className="flex flex-row items-center gap-4 bg-gray-900/80 rounded-lg shadow border border-cyan-500/30 p-6 w-full max-w-xl">
                    {/* 1줄 메모 아이콘 */}
                    <div className="relative group flex flex-col items-center">
                      <span className="bg-indigo-700 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg">
                        <svg xmlns='http://www.w3.org/2000/svg' className='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01' /></svg>
                      </span>
                      <span className="text-xs text-indigo-200 mt-1">1줄 메모</span>
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10 transition-opacity">메모에서 출발</div>
                    </div>
                    {/* 화살표 */}
                    <span className="text-2xl text-cyan-400">→</span>
                    {/* 링크 아이콘 */}
                    <div className="relative group flex flex-col items-center">
                      <span className="bg-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg">
                        <svg xmlns='http://www.w3.org/2000/svg' className='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13.828 14.828a4 4 0 010-5.656m1.415-1.415a6 6 0 010 8.486m-1.415-1.415a4 4 0 010-5.656' /></svg>
                      </span>
                      <span className="text-xs text-green-200 mt-1">지식연결</span>
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10 transition-opacity">외부 자료와 연결</div>
                    </div>
                    {/* 화살표 */}
                    <span className="text-2xl text-cyan-400">→</span>
                    {/* 지식 확장 아이콘 */}
                    <div className="relative group flex flex-col items-center">
                      <span className="bg-purple-700 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg">
                        <svg xmlns='http://www.w3.org/2000/svg' className='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' /></svg>
                      </span>
                      <span className="text-xs text-purple-200 mt-1">지식 확장</span>
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10 transition-opacity">지식이 넓어짐</div>
                    </div>
                  </div>
                </div>
              </div>
              {/* 하단: 1줄 메모 카드 + 지식연결 UI */}
              <div className="space-y-4 border-t border-gray-700 pt-4 w-full max-w-3xl mx-auto">
                {/* 1줄 메모 카드 */}
                <div className="bg-gray-900/80 rounded-lg shadow border border-cyan-500/30 p-6 w-full">
                  <div className="border border-green-300 bg-green-900/30 rounded-md px-4 py-4 text-gray-100 font-bold text-lg leading-relaxed shadow-sm">
                    {selectedRelatedNote.content}
                  </div>
                </div>
                {/* 지식연결 탭/입력/리스트 카드 */}
                <div className="bg-gray-900/80 rounded-lg shadow border border-cyan-500/30 p-6 w-full flex flex-col gap-4">
                  <div className="flex gap-2 mb-2">
                    {relatedLinkTabs.map(tab => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.key}
                          className={`px-2 py-1 rounded-md focus:outline-none transition-colors flex items-center justify-center font-semibold text-xs shadow-sm ${activeRelatedLinkTab === tab.key ? 'bg-green-200/20 text-green-300 border-b-2 border-green-400' : 'bg-gray-800/60 text-gray-400 hover:bg-green-900/30'}`}
                          onClick={() => setActiveRelatedLinkTab(tab.key)}
                          type="button"
                        >
                          <div className="relative group flex items-center justify-center">
                            <Icon className="w-6 h-6" />
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10 transition-opacity">
                              {tab.tooltip}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {/* 입력 필드/버튼 */}
                  <div className="flex flex-col gap-2 mb-2 w-full">
                    <input
                      className="w-full p-3 rounded-xl border-2 border-indigo-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition shadow-sm placeholder-gray-400"
                      placeholder={linkPlaceholderMap[activeRelatedLinkTab] || '링크(URL)를 입력하세요'}
                      value={linkUrl}
                      onChange={e => setLinkUrl(e.target.value)}
                    />
                    <input
                      className="w-full p-3 rounded-xl border-2 border-indigo-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition shadow-sm placeholder-gray-400"
                      placeholder={reasonPlaceholderMap[activeRelatedLinkTab] || '링크 배경/이유를 간단히 입력'}
                      value={linkReason}
                      onChange={e => setLinkReason(e.target.value)}
                    />
                    <button
                      className="self-end px-4 py-1 rounded-lg bg-indigo-700 text-white font-bold shadow-md hover:bg-indigo-800 transition disabled:opacity-50 flex items-center justify-center mt-1"
                      onClick={handleAddRelatedLink}
                      disabled={!linkUrl.trim()}
                    >
                      추가
                    </button>
                  </div>
                  {/* 링크 리스트 */}
                  {filteredLinks.length === 0 ? (
                    <div className="text-gray-400 text-sm">(추가된 링크가 없습니다)</div>
                  ) : (
                    <ul className="space-y-2 w-full">
                      {filteredLinks.map((link, idx) => (
                        <li key={idx} className="flex items-center gap-2 bg-gray-800/60 rounded px-3 py-2 border border-gray-700 shadow">
                          <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-300 underline break-all max-w-xs truncate">
                            {link.url}
                          </a>
                          {link.reason && (
                            <span className="text-xs text-gray-300 bg-gray-900/60 rounded px-2 py-0.5 ml-2 truncate max-w-[120px]" title={link.reason}>{link.reason}</span>
                          )}
                          <button
                            className="ml-auto text-red-400 hover:text-red-600 text-xs font-bold px-2 py-1 rounded"
                            onClick={() => handleDeleteRelatedLink(idx)}
                            aria-label="링크 삭제"
                          >
                            삭제
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </section>
          ) : (
            <section className="bg-white rounded-xl shadow-lg p-6 mt-6">
              <h2 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                지식연결 관리
              </h2>
              <div className="text-gray-400 text-base">1줄 메모에서 <b>지식연결</b> 버튼을 눌러 관리할 메모를 선택하세요.</div>
            </section>
          )
        )}
        {activeTab === 'flashcard' && (
          <>
            {/* Flashcard 생성 폼 (모달/인라인) */}
            {flashcardFormNote && (
              <FlashcardForm
                note={flashcardFormNote}
                bookId={bookId}
                onCreated={() => {
                  setFlashcardFormNote(null);
                  setFlashcardDeckKey((k) => k + 1);
                }}
                onCancel={() => setFlashcardFormNote(null)}
              />
            )}
            {/* Flashcard Deck Section */}
            <section className="mt-0 bg-gray-900/80 p-4 md:p-6 rounded-lg border border-cyan-500/30">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl md:text-2xl font-bold text-purple-400">플래시카드 : 기억 회상</h2>
                <button
                  className="px-3 py-1 rounded bg-cyan-700 text-white text-xs hover:bg-cyan-800 font-semibold ml-4"
                  onClick={() => setShowNewFlashcardForm((v) => !v)}
                >
                  NEW
                </button>
              </div>
              <p className="text-sm text-gray-400 mb-4">읽은 내용을 직접 질문으로 바꾼 플래시카드로 기억을 강화하세요.</p>
              {showNewFlashcardForm && (
                <div className="mb-4">
                  <FlashcardForm
                    bookId={bookId}
                    onCreated={() => {
                      setShowNewFlashcardForm(false);
                      setFlashcardDeckKey((k) => k + 1);
                    }}
                    onCancel={() => setShowNewFlashcardForm(false)}
                  />
                </div>
              )}
              <FlashcardDeck bookId={bookId} key={flashcardDeckKey} />
            </section>
          </>
        )}
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