'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/common/Button';
import { AiOutlineEdit, AiOutlineQuestionCircle, AiOutlineArrowRight, AiOutlineInfoCircle, AiOutlineEye, AiOutlineArrowLeft } from 'react-icons/ai';
import { FiBook } from 'react-icons/fi';
import useBooks from '@/hooks/useBooks';
import TSNoteCard, { TSNote, TSSessionDetails } from '@/components/ts/TSNoteCard';
import Spinner from '@/components/ui/Spinner';
import FlashcardDeck from '@/components/flashcard/FlashcardDeck';
import FlashcardForm from '@/components/flashcard/FlashcardForm';
import { DocumentTextIcon, BookOpenIcon, PlayCircleIcon, NewspaperIcon } from '@heroicons/react/24/outline';
import { ShareIcon } from '@heroicons/react/24/solid';
import { AiFillYoutube } from 'react-icons/ai';
import api from '@/lib/api'; // Added import for central api instance
import { useCartStore } from '@/store/cartStore'; // Uncommented
import { showSuccess, showError } from '@/lib/toast';
import { ClientDateDisplay } from '@/components/share/ClientTimeDisplay';

// API base URL - this should match what's used elsewhere in the app (REMOVING THIS)
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'; // Commented out

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
  exam_prep: "시험/학습",
  practical_knowledge: "지식/기술 습득",
  humanities_self_reflection: "인문 소양/자기 성찰",
  reading_pleasure: "읽는 재미"
};

/**
 * @interface BookWithId
 * @description useBooks 훅에서 반환되는 Book 타입에 _id 필드를 명시적으로 포함하는 확장 인터페이스입니다.
 *             기존 Book 타입이 id (string)를 가질 수 있으나, MongoDB의 _id와 일관성을 맞추기 위함입니다.
 */
interface BookWithId extends Omit<Book, 'id'> {
  _id: string;
  category?: string;
  genre?: string;
  readingPurpose?: string;
  readingGoal?: string;
}

/**
 * @interface Book (기존 타입)
 * @description 책 정보를 나타내는 기본 인터페이스입니다.
 */
type Book = {
  _id: string;
  title: string;
  author: string;
  bookType?: 'BOOK' | 'NOTEBOOK';
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

/**
 * @interface PageNote
 * @description BookDetailPage 내에서 사용되는 노트(1줄 메모)의 타입 정의입니다.
 * TSNoteCard 컴포넌트에서 요구하는 TSNote 인터페이스를 만족해야 하며 (특히 bookId 포함),
 * 페이지 특화적인 추가 필드(type, createdAt, originSession 등)를 가질 수 있습니다.
 * 이 페이지에서 API를 통해 가져온 노트 데이터는 이 타입으로 매핑됩니다.
 */
export interface PageRelatedLink {
  type: 'book' | 'paper' | 'youtube' | 'media' | 'website';
  url: string;
  reason?: string;
  _id?: string;
}

interface PageNote extends TSNote { 
  type: 'quote' | 'thought' | 'question'; 
  createdAt: string; 
  originSession?: string; 
  relatedLinks?: PageRelatedLink[];
}

/**
 * @interface Session
 * @description TS 모드 세션 정보를 나타내는 타입 정의입니다.
 */
type Session = {
  _id: string;
  startPage: number;
  endPage: number;
  actualEndPage?: number;
  durationSec: number;
  ppm?: number;
  createdAt: string;
};

/**
 * @interface RelatedLink
 * @description 노트에 연결된 관련 외부 링크의 정보를 나타내는 타입 정의입니다.
 */
type RelatedLink = {
  type: 'bookAndPaper' | 'youtube' | 'sns' | 'media' | 'noteApp';
  url: string;
  reason?: string;
};

/**
 * @page BookDetailPage
 * @description 특정 책의 상세 정보, 관련 TS 노트 목록, TS 세션 정보 등을 표시하는 페이지 컴포넌트입니다.
 * 사용자는 이 페이지에서 TS 노트를 확인하고, 해당 노트의 메모 진화 기능을 사용하거나,
 * 노트를 지식 카트에 담거나, 플래시카드로 만들거나, 관련 외부 링크를 추가/관리할 수 있습니다.
 * URL 경로의 `[id]` 파라미터를 통해 표시할 책을 식별합니다.
 * 
 * 주요 기능:
 * - 책 상세 정보 표시 (커버 이미지, 제목, 저자, 진행도 등)
 * - 해당 책의 1줄 메모(`TSNoteCard`) 목록 표시 및 메모 진화 기능 제공
 * - 1줄 메모를 지식 카트에 추가 (`onAddToCart` 프롭을 `TSNoteCard`에 전달)
 * - 1줄 메모를 플래시카드로 변환하는 기능
 * - 1줄 메모에 관련 외부 지식 링크를 추가하고 관리하는 기능
 * - TS 모드 시작 기능
 * - 책 정보 수정 및 삭제 기능 (구현 예정 또는 부분 구현)
 * 
 * 상태 관리:
 * - `book`: 현재 페이지에 표시될 책의 상세 정보 (`BookWithId` 타입).
 * - `tsNotes`: 현재 책에 속한 1줄 메모 목록 (`PageNote[]` 타입).
 * - `tsSessions`: 현재 책과 관련된 TS 모드 세션 목록 (`Session[]` 타입).
 * - `cartItems`: Zustand 스토어(`useCartStore`)에서 가져온 현재 지식 카트 아이템 목록.
 * - `activeTab`: 'memo', 'flashcard', 'relatedLinks' 탭 상태 관리.
 * - 기타 UI 및 데이터 로딩 상태 (isLoading, sessionsLoading, isDeleting 등).
 * 
 * 데이터 페칭:
 * - `useEffect` 훅을 사용하여 페이지 로드 시 `bookId`에 해당하는 책 상세 정보,
 *   관련 TS 노트 목록, TS 세션 목록을 비동기적으로 가져옵니다.
 * - 노트 업데이트, 카트 추가 등의 사용자 상호작용은 `api` 유틸리티를 통해 백엔드와 통신합니다.
 */
export default function BookDetailPage() {
  const router = useRouter();
  const params = useParams();
  const bookId = params.id as string; // URL 파라미터에서 현재 책의 ID를 가져옵니다.
  
  const { bookFetchState, fetchBookDetail } = useBooks();
  const [tsNotes, setTsNotes] = useState<PageNote[]>([]); // 현재 책에 속한 TS 노트 목록 상태
  const [tsSessions, setTsSessions] = useState<Session[]>([]); // 현재 책에 속한 TS 세션 목록 상태
  const [sessionsLoading, setSessionsLoading] = useState<boolean>(true); // 세션 로딩 상태
  const [isDeleting, setIsDeleting] = useState<boolean>(false); // 책 삭제 진행 상태
  const [flashcardFormNote, setFlashcardFormNote] = useState<PageNote | null>(null); // 플래시카드 생성 폼에 전달될 노트
  const [flashcardDeckKey, setFlashcardDeckKey] = useState(0); // 플래시카드 덱 강제 리렌더링을 위한 키
  const [activeTab, setActiveTab] = useState<'memo' | 'flashcard' | 'relatedLinks'>('memo'); // 현재 활성화된 탭 (메모진화, 지식연결, 플래시카드)
  const [showNewFlashcardForm, setShowNewFlashcardForm] = useState(false); // 새 플래시카드 수동 생성 폼 표시 여부
  const [selectedRelatedNote, setSelectedRelatedNote] = useState<PageNote | null>(null); // 지식연결 탭에서 선택된 노트
  const [isBookDetailExpanded, setIsBookDetailExpanded] = useState<boolean>(false); // 책 상세 정보 확장 상태
  
  // localStorage에서 읽어온 책의 추가 메타데이터를 저장하는 상태입니다.
  // 이 상태는 클라이언트 사이드에서만 업데이트됩니다.
  const [localMetadata, setLocalMetadata] = useState<any>(null);
  
  // 관련 링크 탭용 상태
  const relatedLinkTabs: { key: PageRelatedLink['type']; label: string; icon: React.ComponentType<any>; tooltip: string; }[] = [
    { key: 'book',         label: '책',              icon: BookOpenIcon,      tooltip: '관련 서적 연결' },
    { key: 'paper',        label: '논문/자료/AI답변',         icon: DocumentTextIcon,  tooltip: '논문, 학숩, AI 답변' },
    { key: 'youtube',      label: '유튜브',          icon: AiFillYoutube,     tooltip: '유튜브' },
    { key: 'media',        label: '미디어/뉴스',      icon: NewspaperIcon,     tooltip: '언론, 뉴스, SNS 연결' },
    { key: 'website',      label: '노트앱/기타',  icon: ShareIcon,         tooltip: '노션, 옵시디언 노트앱 연결' }, 
  ];
  const [activeRelatedLinkTab, setActiveRelatedLinkTab] = useState<PageRelatedLink['type']>(relatedLinkTabs[0].key);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkReason, setLinkReason] = useState('');
  const [relatedLinksMap, setRelatedLinksMap] = useState<Record<string, PageRelatedLink[]>>({});

  useEffect(() => {
    setLinkUrl('');
    setLinkReason('');
  }, [activeRelatedLinkTab, selectedRelatedNote]);

  const currentLinks = selectedRelatedNote ? (relatedLinksMap[selectedRelatedNote._id] || []) : [];
  const filteredLinks = currentLinks.filter(l => l.type === activeRelatedLinkTab);

  const handleAddRelatedLink = async () => {
    if (!selectedRelatedNote || !linkUrl.trim()) return;
    const newLink: PageRelatedLink = {
      type: activeRelatedLinkTab,
      url: linkUrl.trim(),
      reason: linkReason.trim(),
    };
    const noteId = selectedRelatedNote._id;
    const updatedLinks = [...(relatedLinksMap[noteId] || []), newLink];
    setRelatedLinksMap(prev => ({ ...prev, [noteId]: updatedLinks }));
    setLinkUrl('');
    setLinkReason('');
    try {
      await api.put(`/notes/${noteId}`, { relatedLinks: updatedLinks });
      setTsNotes(prevTsNotes => prevTsNotes.map(n => n._id === noteId ? {...n, relatedLinks: updatedLinks} : n));
      if (selectedRelatedNote && selectedRelatedNote._id === noteId) {
        setSelectedRelatedNote(prev => prev ? {...prev, relatedLinks: updatedLinks} : null);
      }
    } catch (err) {
      alert('링크를 저장하는 중 잠시 문제가 생겼어요: ' + (err as any).message);
      const originalLinks = (relatedLinksMap[noteId] || []).filter(link => link.url !== newLink.url || link.type !== newLink.type);
      setRelatedLinksMap(prev => ({ ...prev, [noteId]: originalLinks }));
    }
  };

  const handleDeleteRelatedLink = async (originalIndex: number) => {
    if (!selectedRelatedNote) return;
    const noteId = selectedRelatedNote._id;
    const allLinksForNote = relatedLinksMap[noteId] || [];
    
    let count = -1;
    const actualIndexInAll = allLinksForNote.findIndex(link => {
        if (link.type === activeRelatedLinkTab) {
            count++;
            return count === originalIndex;
        }
        return false;
    });

    if (actualIndexInAll === -1) {
        alert('정리하려는 링크를 찾지 못했어요. 다시 시도해 주세요.');
        return;
    }

    const linkToDelete = allLinksForNote[actualIndexInAll];
    const updatedLinks = allLinksForNote.filter((_, i) => i !== actualIndexInAll);
    
    setRelatedLinksMap(prev => ({ ...prev, [noteId]: updatedLinks }));
    try {
      await api.put(`/notes/${noteId}`, { relatedLinks: updatedLinks });
      setTsNotes(prevTsNotes => prevTsNotes.map(n => n._id === noteId ? {...n, relatedLinks: updatedLinks} : n));
      if (selectedRelatedNote && selectedRelatedNote._id === noteId) {
        setSelectedRelatedNote(prev => prev ? {...prev, relatedLinks: updatedLinks} : null);
      }
    } catch (err) {
      alert('링크를 정리하는 중 잠시 문제가 생겼어요: ' + (err as any).message);
      setRelatedLinksMap(prev => ({ ...prev, [noteId]: [...updatedLinks, linkToDelete].sort() })); 
    }
  };
  
  const { isLoading, error, book } = bookFetchState;
  const { items: cartItems, addToCart } = useCartStore();
  
  useEffect(() => {
    if (!bookId) return;
    const loadBook = async () => {
      await fetchBookDetail(bookId);
    };
    loadBook();
  }, [bookId, fetchBookDetail]);
  
  useEffect(() => {
    if (!bookId || !book) return;
    const fetchData = async () => {
      try {
        const notesResponse = await api.get(`/notes/book/${bookId}?originOnly=true`);
        const notesWithBookInfo: PageNote[] = (notesResponse.data || []).map((note: Omit<PageNote, 'bookId' | 'relatedLinks'> & { relatedLinks?: any[] }) => {
          const typedRelatedLinks: PageRelatedLink[] = (note.relatedLinks || []).map(link => ({
            ...link,
            type: link.type as PageRelatedLink['type'],
          })); 
          return {
            ...note,
            bookId: bookId,
            relatedLinks: typedRelatedLinks,
          };
        });
        setTsNotes(notesWithBookInfo);
        const initialRelatedLinksMap: Record<string, PageRelatedLink[]> = {};
        notesWithBookInfo.forEach(note => {
          if (note.relatedLinks) {
            initialRelatedLinksMap[note._id] = note.relatedLinks;
          }
        });
        setRelatedLinksMap(initialRelatedLinksMap);
      } catch (err) {
        console.error('1줄 메모 로딩 오류:', err);
        setTsNotes([]);
      }

      setSessionsLoading(true);
      try {
        const sessionsResponse = await api.get(`/sessions/book/${bookId}`);
        setTsSessions(sessionsResponse.data || []);
      } catch (err) {
        console.error('TS 세션 로딩 오류:', err);
        setTsSessions([]);
      } finally {
        setSessionsLoading(false);
      }
    };
    fetchData();
  }, [bookId, book, router]);

  /**
   * @effect 클라이언트 사이드에서 localStorage의 'book-metadata'를 읽어와 localMetadata 상태를 설정합니다.
   * bookId가 변경될 때마다 실행되어 해당 책의 메타데이터를 로드합니다.
   * 이 로직은 서버 사이드 렌더링 시 실행되지 않으며, 하이드레이션 오류를 방지합니다.
   */
  useEffect(() => {
    // window 객체의 존재 여부로 클라이언트 사이드인지 확인 (더 명시적인 방법)
    if (typeof window !== 'undefined' && bookId) {
      try {
        const bookMetadataStr = localStorage.getItem('book-metadata');
        if (bookMetadataStr) {
          const allMetadata = JSON.parse(bookMetadataStr);
          if (allMetadata && allMetadata[bookId]) {
            setLocalMetadata(allMetadata[bookId]);
            // console.log('Loaded local metadata for book:', allMetadata[bookId]);
          } else {
            setLocalMetadata(null); // 해당 bookId에 대한 메타데이터가 없으면 null로 설정
          }
        } else {
          setLocalMetadata(null); // 'book-metadata' 자체가 없으면 null로 설정
        }
      } catch (error) {
        console.error('Error reading book metadata from localStorage:', error);
        setLocalMetadata(null); // 오류 발생 시에도 null로 설정
      }
    }
  }, [bookId]); // bookId가 변경될 때마다 실행 (클라이언트에서만)

  // formatDate 함수는 더 이상 필요하지 않음 - ClientDateDisplay로 대체

  const getProgressPercentage = () => {
    if (!book) return 0;
    const bookData = book as unknown as BookWithId;
    const currentPage = typeof bookData.currentPage === 'number' ? bookData.currentPage : 0;
    const totalPages = typeof bookData.totalPages === 'number' && bookData.totalPages > 0 ? bookData.totalPages : 1;
    const percentage = Math.round((currentPage / totalPages) * 100);
    return Math.min(Math.max(percentage, 0), 100);
  };

  const handleStartReading = () => {
    // 노트북인 경우 메모 작성 페이지로, 일반 책인 경우 TS 세션으로 라우팅
    if (bookData.bookType === 'NOTEBOOK') {
      router.push(`/memo/new?notebook=${bookId}`);
    } else {
      router.push(`/ts?lastReadBookId=${bookId}`);
    }
  };

  const handleDeleteBook = async () => {
    if (!bookId) return;
    if (window.confirm('함께한 성장의 기록들을 모두 정리하시겠어요? 메모와 세션 기록들도 함께 정리됩니다.')) {
      setIsDeleting(true);
      try {
        await api.delete(`/books/${bookId}`);
        alert('성장의 기록이 잘 정리되었습니다.');
        router.push('/books');
      } catch (err) {
        console.error('책 삭제 오류:', err);
        alert('기록을 정리하는 중 잠시 문제가 생겼어요: ' + (err as any).message);
        setIsDeleting(false);
      }
    }
  };

  const handleEditBook = () => {
    router.push(`/books/${bookId}/edit`);
  };

  // 모바일용 단축 placeholder 매핑
  const linkPlaceholderMap: Record<PageRelatedLink['type'], string> = {
    book: 'URL 입력',
    paper: 'URL 입력', 
    youtube: 'URL 입력',
    media: 'URL 입력',
    website: 'URL 입력'
  };
  
  const reasonPlaceholderMap: Record<PageRelatedLink['type'], string> = {
    book: '연결 이유',
    paper: '연결 이유',
    youtube: '연결 이유', 
    media: '연결 이유',
    website: '연결 이유'
  };

  /**
   * @function handleNoteUpdate
   * @description TSNoteCard 내부에서 1줄 메모의 내용(메모 진화 필드 등)이 변경되었을 때 호출되는 콜백 함수입니다.
   * `tsNotes` 상태 배열에서 해당 노트를 찾아 변경된 내용으로 업데이트하고,
   * "지식 연결" 탭에서 선택된 노트(`selectedRelatedNote`)도 동일한 노트라면 함께 업데이트합니다.
   * @param {Partial<PageNote>} updatedNoteFields - 변경된 필드만 포함하는 부분적인 PageNote 객체 (반드시 _id 포함).
   */
  const handleNoteUpdate = async (updatedNoteFields: Partial<PageNote>) => {
    if (!updatedNoteFields._id) {
      console.error("Note ID is missing in updatedNoteFields");
      showError("메모를 업데이트하려면 정보가 조금 더 필요해요.");
      return Promise.reject("Note ID missing");
    }

    const noteId = updatedNoteFields._id;

    try {
      // Optimistic update can be considered here, but for now, we wait for API response.
      const response = await api.put(`/notes/${noteId}`, updatedNoteFields);
      
      // Update local state only after successful API call
      setTsNotes(prevNotes =>
        prevNotes.map(n => (n._id === noteId ? { ...n, ...response.data } : n))
      );

      if (selectedRelatedNote && selectedRelatedNote._id === noteId) {
        setSelectedRelatedNote(prev => prev ? { ...prev, ...response.data } : null);
      }
      
      showSuccess("메모가 성공적으로 저장되었습니다.");
      return Promise.resolve(); // Resolve the promise on success

    } catch (error) {
      console.error("Failed to update note:", error);
      let errorMessage = "메모를 저장하는 중에 잠시 문제가 생겼어요. 다시 시도해 주세요.";
      if (error && typeof error === 'object' && 'response' in error && error.response && 
          typeof error.response === 'object' && 'data' in error.response && error.response.data && 
          typeof error.response.data === 'object' && 'message' in error.response.data && 
          typeof error.response.data.message === 'string') {
        errorMessage = error.response.data.message;
      }
      showError(errorMessage);
      return Promise.reject(errorMessage); // Reject the promise on error
    }
  };

  /**
   * @function handleAddToCartToStore
   * @description `TSNoteCard`의 "지식 카트에 담기" 버튼 클릭 시 호출되는 콜백 함수입니다.
   * Zustand 스토어(`useCartStore`)의 `addToCart` 액션을 호출하여 해당 노트를 카트에 추가합니다.
   * 카트에 추가하기 전에 현재 페이지의 `book` 정보(특히 제목)가 로드되었는지 확인합니다.
   * @param {string} noteId - 카트에 추가할 노트의 ID.
   * @param {string} currentBookId - 노트가 속한 책의 ID (TSNoteCard에서 전달받음, 현재 페이지 bookId와 동일해야 함).
   */
  const handleAddToCartToStore = (noteId: string, currentBookId: string) => {
    // 현재 페이지의 책(book) 정보와 카트에 추가하려는 노트(tsNotes에서 찾음) 정보를 가져옵니다.
    const currentBook = book; // bookFetchState.book 에서 가져옴
    const noteToAdd = tsNotes.find(n => n._id === noteId);

    // 책 정보나 노트 정보가 없으면 오류를 발생시키거나 알림을 표시하고 함수를 종료합니다.
    if (!currentBook || !currentBook.title) {
      console.error('Book information is not loaded yet. Cannot add to cart.');
      alert('정보를 아직 불러오고 있어요. 잠시 후 다시 카트에 담아주세요.');
      return;
    }
    if (!noteToAdd) {
      console.error(`Note with ID ${noteId} not found in tsNotes. Cannot add to cart.`);
      alert('카트에 담으려는 메모를 찾지 못했어요. 다시 한번 시도해 주시겠어요?');
      return;
    }
    
    // Zustand 스토어의 addToCart 액션을 호출하여 아이템을 추가합니다.
    // contentPreview는 노트 내용의 앞 50자로 설정합니다.
    addToCart({
      noteId: noteToAdd._id,
      bookId: currentBookId, // TSNoteCard에서 전달받은 bookId 사용
      bookTitle: currentBook.title,
      contentPreview: noteToAdd.content.substring(0, 50) + (noteToAdd.content.length > 50 ? '...' : ''),
    });
    // 사용자에게 카트 추가 성공 알림을 표시합니다. (react-hot-toast 등 사용 가능)
    showSuccess(`'${noteToAdd.content.substring(0,20)}...' 메모 조각을 소중히 담았어요.`);
  };

  if (isLoading || sessionsLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${cyberTheme.gradient}`}>
        <Spinner size="lg" color="cyan" />
        <p className={`ml-4 ${cyberTheme.textLight}`}>소중한 기억들을 불러오는 중이에요...</p>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${cyberTheme.gradient}`}>
        <div className={`${cyberTheme.cardBg} rounded-xl shadow-lg p-6 max-w-md w-full border ${cyberTheme.errorBorder}`}>
          <h1 className={`text-xl font-bold ${cyberTheme.errorText} mb-4`}>잠시 문제가 발생했어요</h1>
          <p className={`mb-6 ${cyberTheme.textLight}`}>{error || '성장의 기록을 찾지 못했어요. 다시 한번 확인해 주시겠어요?'}</p>
          <Button
            href="/books"
            variant="default"
            className={`w-full text-white`}
          >
            My Lib
          </Button>
        </div>
      </div>
    );
  }

  // Cast book to our expected type
  const bookData = book as unknown as BookWithId;
  
  return (
    <div className={`min-h-screen ${cyberTheme.gradient} p-4 md:p-6 ${cyberTheme.textLight}`}>
      <div className="container mx-auto max-w-4xl">
        {/* "내 서재" 버튼 추가 */}
        <div className="mb-4">
          <Link href="/books" passHref>
            <Button 
              variant="outline" 
              size="sm"
              className={`${cyberTheme.buttonOutlineBorder} ${cyberTheme.buttonOutlineText} ${cyberTheme.buttonOutlineHoverBg} border flex items-center`}
            >
              <AiOutlineArrowLeft className="mr-2 h-4 w-4" />
              My Lib
            </Button>
          </Link>
        </div>
        
        {/* App Logo/Name Header */}
        <div className="text-center mb-6">
          <h1 
            className={`text-lg sm:text-2xl font-bold ${cyberTheme.primary} cursor-pointer hover:text-cyan-300 transition-colors inline-block opacity-80`}
            onClick={() => router.push('/dashboard')}
          >
            Habitus33
          </h1>
        </div>
        
        {/* Book Header - Compact with Expandable Details */}
        <div className={`${cyberTheme.cardBg} rounded-lg shadow-lg overflow-hidden mb-4 relative border ${cyberTheme.borderSecondary}/30 transition-all duration-300 ${isBookDetailExpanded ? 'shadow-2xl' : ''}`}>
          {/* Primary Action Button - Always visible */}
          <div className="absolute top-2 right-2 z-10">
            <Button
              variant="default"
              size="sm"
              onClick={handleStartReading}
              aria-label={bookData.bookType === 'NOTEBOOK' ? '메모 작성' : 'TS 세션 시작'}
              className={`text-white text-xs px-3 py-1 h-7 min-h-0`}
            >
              <span className="text-xs">
                {bookData.bookType === 'NOTEBOOK' ? '메모' : '읽기'}
              </span>
            </Button>
          </div>
          
          <div className="p-3">
            <div className="flex items-center gap-4">
              {/* Compact Book Cover */}
              <div className="flex-shrink-0">
                <div className={`${isBookDetailExpanded ? 'w-20 h-28' : 'w-12 h-16'} ${cyberTheme.inputBg} rounded overflow-hidden border ${cyberTheme.inputBorder} transition-all duration-300`}>
                  {bookData.coverImage ? (
                    <img
                      src={bookData.coverImage}
                      alt={bookData.title || '기억 표지'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className={`flex items-center justify-center w-full h-full text-gray-500`}>
                      <FiBook className={`${isBookDetailExpanded ? 'h-6 w-6' : 'h-4 w-4'} transition-all duration-300`} />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Compact Book Info */}
              <div className="flex-1 min-w-0 pr-16">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className={`${isBookDetailExpanded ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'} font-bold ${cyberTheme.textLight} truncate transition-all duration-300`} title={bookData.title}>
                    {bookData.title || '제목을 기다리고 있어요'}
                  </h1>
                  {bookData.bookType === 'NOTEBOOK' && (
                    <span className="bg-purple-500/20 text-purple-400 text-xs px-2 py-0.5 rounded-full border border-purple-500/30 flex-shrink-0">
                      노트북
                    </span>
                  )}
                </div>
                
                <p className={`text-sm ${cyberTheme.textMuted} mb-2 truncate`} title={bookData.author}>
                  {bookData.author || '저자를 기다리고 있어요'}
                </p>
                
                {/* Progress Bar - 책인 경우만 표시 */}
                {bookData.bookType !== 'NOTEBOOK' && (
                  <div className="flex items-center gap-3">
                    <div className={`flex-1 ${cyberTheme.progressBarBg} h-1.5 rounded-full overflow-hidden`}>
                      <div
                        className={`${cyberTheme.progressFg} h-1.5 rounded-full transition-all duration-300`}
                        style={{ width: `${getProgressPercentage()}%` }}
                      />
                    </div>
                    <span className={`text-xs ${cyberTheme.textLight} flex-shrink-0`}>
                      {getProgressPercentage()}%
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Expandable Detailed Information */}
            {isBookDetailExpanded && (
              <div className="mt-4 pt-4 border-t border-gray-600 animate-in slide-in-from-top duration-300">
                {/* Edit Button - Only visible when expanded */}
                <div className="flex justify-end mb-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEditBook}
                    aria-label="책 정보 수정"
                    className={`${cyberTheme.buttonOutlineBorder} ${cyberTheme.buttonOutlineText} ${cyberTheme.buttonOutlineHoverBg} border text-xs px-3 py-1 h-7 min-h-0`}
                  >
                    <AiOutlineEdit className="h-3 w-3 mr-1" />
                    <span className="text-xs">수정</span>
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  {[
                    ['분야', localMetadata?.genre || bookData.category || bookData.genre || '분류되지 않음'],
                    ['목적', readingPurposeLabels[String(localMetadata?.readingPurpose || bookData.readingPurpose || bookData.readingGoal)] || '아직 설정되지 않았어요'],
                    ['여정', (bookData.totalPages && bookData.totalPages > 0) ? `${bookData.totalPages} 페이지` : '페이지 정보가 없어요'],
                    ['시작일', bookData.createdAt ? <ClientDateDisplay createdAt={bookData.createdAt} /> : '기록 시작일 정보가 없어요'],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-baseline space-x-2">
                      <span className={`w-12 sm:w-20 ${cyberTheme.textMuted} text-xs sm:text-sm flex-shrink-0`}>{label}:</span>
                      <span className={`font-medium ${cyberTheme.textLight} text-xs sm:text-sm truncate`} title={value}>{value}</span>
                    </div>
                  ))}
                </div>
                
                {/* Detailed Progress Info for Books */}
                {bookData.bookType !== 'NOTEBOOK' && (
                  <div className="mt-3 pt-2 border-t border-gray-700">
                    <div className="flex justify-between items-center mb-1 text-sm">
                      <span className={cyberTheme.textMuted}>상세 진행률</span>
                      <span className={cyberTheme.textLight}>{getProgressPercentage()}%</span>
                    </div>
                    <div className={`w-full ${cyberTheme.progressBarBg} h-2 rounded-full overflow-hidden`}>
                      <div
                        className={`${cyberTheme.progressFg} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${getProgressPercentage()}%` }}
                      />
                    </div>
                    <div className={`text-xs mt-1 ${cyberTheme.textMuted}`}>
                      {bookData.currentPage || 0} / {bookData.totalPages || '∞'} 페이지
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Toggle Button */}
            <div className="mt-3 flex justify-center">
              <button
                onClick={() => setIsBookDetailExpanded(!isBookDetailExpanded)}
                className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs ${cyberTheme.textMuted} hover:${cyberTheme.textLight} transition-colors`}
              >
                <span>{isBookDetailExpanded ? '간단히 보기' : '자세히 보기'}</span>
                <AiOutlineArrowRight className={`h-3 w-3 transition-transform duration-300 ${isBookDetailExpanded ? 'rotate-90' : ''}`} />
              </button>
            </div>
          </div>
        </div>
        
        {/* 탭 버튼 */}
        <div className="flex gap-1 sm:gap-2 mb-4 overflow-x-auto">
          <button
            className={`px-2 sm:px-4 py-2 rounded-t-lg font-bold border-b-2 transition-colors whitespace-nowrap text-sm sm:text-base ${activeTab === 'memo' ? 'border-cyan-400 text-cyan-300 bg-gray-900' : 'border-transparent text-gray-400 bg-gray-800 hover:text-cyan-200'}`}
            onClick={() => setActiveTab('memo')}
          >
            <span className="hidden sm:inline">메모 진화</span>
            <span className="sm:hidden">메모</span>
          </button>
          <button
            className={`px-2 sm:px-4 py-2 rounded-t-lg font-bold border-b-2 transition-colors whitespace-nowrap text-sm sm:text-base ${activeTab === 'relatedLinks' ? 'border-green-400 text-green-400 bg-gray-900' : 'border-transparent text-gray-400 bg-gray-800'} ${!selectedRelatedNote ? 'opacity-50 cursor-not-allowed' : 'hover:text-green-300'}`}
            onClick={() => selectedRelatedNote && setActiveTab('relatedLinks')}
            disabled={!selectedRelatedNote}
            aria-disabled={!selectedRelatedNote}
          >
            <span className="hidden sm:inline">지식 연결</span>
            <span className="sm:hidden">연결</span>
          </button>
          <button
            className={`px-2 sm:px-4 py-2 rounded-t-lg font-bold border-b-2 transition-colors whitespace-nowrap text-sm sm:text-base ${activeTab === 'flashcard' ? 'border-purple-400 text-purple-300 bg-gray-900' : 'border-transparent text-gray-400 bg-gray-800 hover:text-purple-200'}`}
            onClick={() => setActiveTab('flashcard')}
          >
            <span className="hidden sm:inline">플래시카드</span>
            <span className="sm:hidden">카드</span>
          </button>
        </div>
        {/* 탭별 컨테이너 */}
        {activeTab === 'memo' && (
          <section className={`mt-0 ${cyberTheme.bgSecondary} p-3 md:p-4 rounded-lg border ${cyberTheme.borderPrimary}/30`}>
            {/* Minimized Memo Hub Header */}
            <div className="mb-4 text-center">
              <h2 className="text-xl font-bold text-cyan-400 mb-1 flex items-center justify-center gap-2">
                <AiOutlineEdit className="h-5 w-5" />
                Memo Hub
              </h2>
              <p className="text-sm text-gray-400">💡 생각의 조각을 지식의 자산으로 진화시키세요</p>
            </div>

            {/* Notes List */}
            {tsNotes.length === 0 ? (
              <p className={`${cyberTheme.textMuted} text-center py-4`}>아직 남겨진 생각의 조각이 없네요. TS 모드로 첫 메모를 남겨볼까요?</p>
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

                  const isNoteInCart = cartItems.some(item => item.noteId === note._id);

                  return (
                    <div key={note._id} className={`${cyberTheme.cardBg} p-1 sm:p-3 rounded-md border ${cyberTheme.inputBorder}`}>
                      <TSNoteCard
                        note={note as TSNote}
                        readingPurpose={bookData.readingPurpose || 'humanities_self_reflection'}
                        onUpdate={(updatedFields) => handleNoteUpdate(updatedFields as Partial<PageNote>)}
                        onFlashcardConvert={(targetNote) => {
                          setFlashcardFormNote(targetNote as PageNote);
                          setActiveTab('flashcard');
                        }}
                        onRelatedLinks={(targetNote) => {
                          setSelectedRelatedNote(targetNote as PageNote);
                          setRelatedLinksMap(prev => ({
                            ...prev,
                            [(targetNote as PageNote)._id]: (targetNote as PageNote).relatedLinks || [],
                          }));
                          setActiveTab('relatedLinks');
                        }}
                        sessionDetails={sessionDetailsForCard}
                        onAddToCart={handleAddToCartToStore}
                        isAddedToCart={isNoteInCart}
                        isPageEditing={false}
                        enableOverlayEvolutionMode={true}
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
            <section className="bg-gray-800/60 rounded-lg shadow-lg border-0 p-3 md:p-4 mt-6">
              {/* Minimized Connect Header */}
              <div className="mb-4 text-center">
                <h2 className="text-xl font-bold text-green-300 mb-1 flex items-center justify-center gap-2">
                  <ShareIcon className="h-5 w-5" />
                  Connect
                </h2>
                <p className="text-sm text-gray-400">🔗 외부 지식과 연결해 도메인 컨텍스트를 확장하세요</p>
              </div>
              {/* 메인 작업 영역 */}
              <div className="space-y-4 w-full max-w-3xl mx-auto">
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
                      className="w-full p-3 rounded-xl border-2 border-indigo-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition shadow-sm placeholder-gray-400 sm:hidden"
                      placeholder={linkPlaceholderMap[activeRelatedLinkTab]}
                      value={linkUrl}
                      onChange={e => setLinkUrl(e.target.value)}
                    />
                    <input
                      className="hidden sm:block w-full p-3 rounded-xl border-2 border-indigo-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition shadow-sm placeholder-gray-400"
                      placeholder="링크주소(URL)를 입력하세요"
                      value={linkUrl}
                      onChange={e => setLinkUrl(e.target.value)}
                    />
                    <input
                      className="w-full p-3 rounded-xl border-2 border-indigo-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition shadow-sm placeholder-gray-400 sm:hidden"
                      placeholder={reasonPlaceholderMap[activeRelatedLinkTab]}
                      value={linkReason}
                      onChange={e => setLinkReason(e.target.value)}
                    />
                    <input
                      className="hidden sm:block w-full p-3 rounded-xl border-2 border-indigo-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition shadow-sm placeholder-gray-400"
                      placeholder="배경/이유를 적어두면 더 오래 기억됩니다."
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
                    <div className="text-gray-400 text-sm">(추가된 링크가 없군요.)</div>
                  ) : (
                    <ul className="space-y-2 w-full">
                      {filteredLinks.map((link, idx) => (
                        <li key={idx} className="flex flex-col sm:flex-row sm:items-center gap-2 bg-gray-800/60 rounded px-3 py-2 border border-gray-700 shadow">
                          <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-300 underline break-all text-sm truncate max-w-full sm:max-w-xs">
                            {link.url}
                          </a>
                          {link.reason && (
                            <span className="text-xs text-gray-300 bg-gray-900/60 rounded px-2 py-0.5 truncate max-w-full sm:max-w-[120px]" title={link.reason}>{link.reason}</span>
                          )}
                          <button
                            className="ml-auto text-red-400 hover:text-red-600 text-xs font-bold px-2 py-1 rounded self-start sm:self-auto"
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
                지식연결
              </h2>
              <div className="text-gray-400 text-base">1줄 메모에서 <b>지식연결</b> 버튼을 눌러 관리할 메모를 선택해 보시겠어요?</div>
            </section>
          )
        )}
        {activeTab === 'flashcard' && (
          <section className="mt-0 bg-gray-900/80 p-4 md:p-6 rounded-lg border border-cyan-500/30">
            {flashcardFormNote ? (
              <div className="mb-4">
              <FlashcardForm
                  note={flashcardFormNote as any}
                bookId={bookId}
                onCreated={() => {
                  setFlashcardFormNote(null);
                  setFlashcardDeckKey((k) => k + 1);
                }}
                onCancel={() => setFlashcardFormNote(null)}
              />
              </div>
            ) : (
              <>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-purple-400">Flashcard</h2>
                <button
                  className="px-3 py-1 rounded bg-cyan-700 text-white text-xs hover:bg-cyan-800 font-semibold ml-4"
                  onClick={() => setShowNewFlashcardForm((v) => !v)}
                >
                  NEW
                </button>
              </div>
              <p className="text-sm text-gray-400 mb-4">퀴즈로 스스로에게 질문하며, 도메인 컨텍스트를 완성해보세요.</p>
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
              </>
              )}
              <FlashcardDeck bookId={bookId} key={flashcardDeckKey} />
            </section>
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