import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AiOutlineQuestionCircle, AiOutlineInfoCircle } from 'react-icons/ai';
import { GiCutDiamond, GiRock } from 'react-icons/gi';
import { QuestionMarkCircleIcon, ArrowTopRightOnSquareIcon, LightBulbIcon, PhotoIcon, LinkIcon, SparklesIcon, ShoppingCartIcon, PencilSquareIcon, TagIcon, EllipsisVerticalIcon, BookOpenIcon as SolidBookOpenIcon, ChevronLeftIcon, ChevronRightIcon, ChatBubbleOvalLeftEllipsisIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import { XMarkIcon } from '@heroicons/react/24/outline';
import api, { inlineThreadApi } from '@/lib/api'; // Import the central api instance
import { showSuccess } from '@/lib/toast';
import dynamic from 'next/dynamic';
const PdfViewerOverlay = dynamic(() => import('@/components/pdf/PdfViewerOverlay'), { ssr: false });
import AiCoachPopover from '../common/AiCoachPopover';
import ConceptScoreIcon from '../ConceptScoreIcon';
import ConceptScorePopup from '../ConceptScorePopup';
import { useConceptScore } from '@/hooks/useConceptScore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Import Dropdown components
import { Button } from '@/components/ui/button'; // Import Button for styling consistency
import { cn } from '@/lib/utils';
import { formatUserTime } from '@/lib/timeUtils'; // 시간 포맷팅 유틸리티 import

// Define the structure for a single related link
export interface RelatedLink {
  type: 'book' | 'paper' | 'youtube' | 'media' | 'website';
  url: string;
  reason?: string;
  _id?: string; // Optional: Mongoose might add an _id to subdocuments
}

// Define the structure for inline memo thread
export interface InlineThread {
  _id: string;
  content: string;
  authorId?: string;
  authorName?: string;
  createdAt: string;
  clientCreatedAt?: string;
  isTemporary?: boolean;
  parentNoteId: string;
  depth?: number; // 쓰레드 깊이 (0이 최상위)
}

/**
 * @interface TSNote
 * @description TSNoteCard 컴포넌트에서 사용하는 1줄 메모(노트)의 기본 데이터 구조입니다.
 * 이 구조는 백엔드의 Note 모델과 동기화되며, 추가적인 클라이언트 측 필드를 포함할 수 있습니다.
 */
export interface TSNote {
  /** @property {string} _id - 노트의 고유 MongoDB ID. */
  _id: string;
  /** 
   * @property {string} bookId - 이 노트가 속한 책(Book)의 고유 ID.
   * 지식 카트에 담을 때나, 특정 책에 종속된 노트를 필터링할 때 사용됩니다.
   */
  bookId: string;
  /** @property {string} userId - 노트를 작성한 사용자의 고유 ID. */
  userId?: string;
  /** @property {string} content - 1줄 메모의 핵심 내용. */
  content: string;
  /** @property {string[]} tags - 노트와 관련된 태그 목록. */
  tags: string[];
  /** @property {number} [pageNumber] - 하이라이트된 문장의 페이지 번호. */
  pageNumber?: number;
  /** @property {string} [highlightedText] - 밑줄친 원문 텍스트. */
  highlightedText?: string;
  /** @property {string} [importanceReason] - 메모 진화: 중요하다고 생각한 이유. */
  importanceReason?: string;
  /** @property {string} [momentContext] - 메모 진화: 메모 작성 당시의 상황이나 맥락. */
  momentContext?: string;
  /** @property {string} [relatedKnowledge] - 메모 진화: 관련된 기존 지식. */
  relatedKnowledge?: string;
  /** @property {string} [mentalImage] - 메모 진홧: 떠오른 심상이나 아이디어. */
  mentalImage?: string;
  /** @property {string} [nickname] - (사용자 정의) 노트에 대한 별칭. */
  nickname?: string;
  /** @property {RelatedLink[]} [relatedLinks] - (백엔드 동기화) 관련된 외부 링크 목록. */
  relatedLinks?: RelatedLink[];
  /** @property {InlineThread[]} [inlineThreads] - 인라인메모 쓰레드 목록. */
  inlineThreads?: InlineThread[];
  /** @property {boolean} [isArchived] - 노트가 보관된 상태인지 여부. */
  isArchived?: boolean;
  /** @property {boolean} [isTemporary] - 노트가 임시 상태인지 여부. */
  isTemporary?: boolean;
  /** @property {string} [originSession] - 노트가 생성된 TS 세션의 ID. */
  originSession?: string;
  /** @property {string} [createdAt] - 서버에서 기록된 생성 시간 (ISO 문자열). */
  createdAt?: string;
  /** @property {string} [clientCreatedAt] - 클라이언트에서 기록된 사용자 현지 시간 (ISO 문자열). */
  clientCreatedAt?: string;
  // pageNum, sessionId 등 추가 필드가 백엔드 Note 모델에 있을 수 있으나, TSNoteCard에서 직접 사용되지 않으면 생략 가능.
}

// TS 세션 상세 정보 타입 (백엔드 ISession 모델 기반)
export interface TSSessionDetails {
  createdAtISO?: string;    // Session.createdAt (ISO 문자열로 변환된 값) - 서버 시간
  clientCreatedAtISO?: string; // Session.clientCreatedAt (ISO 문자열로 변환된 값) - 클라이언트 시간
  durationSeconds?: number; // Session.durationSec
  startPage?: number;       // Session.startPage
  actualEndPage?: number;   // Session.actualEndPage
  targetPage?: number;      // Session.endPage (목표 종료 페이지로 사용)
  ppm?: number;             // Session.ppm
  book?: any;                // Added book from session data
}

// 목적별 4단계 질문/가이드/placeholder 매핑
// 질문은 모든 목적에서 공통(why, where/context, association, mental image)
// placeholder만 목적별로 차등 제공하여 입력 혼란을 줄입니다.
const memoEvolutionPrompts: Record<string, Array<{ question: string; placeholder: string }>> = {
  exam_prep: [
    { question: '왜 이 문장을 메모했나요?', placeholder: '(예: 핵심 개념, 오답률↓, 집중  | 순서: 이유, 목표, 감정 / 자유 서술 가능)' },
    { question: '그때의 장소나 상황은 어땠나요?', placeholder: '(예: 독서실, 긴장, 흐림  | 순서: 장소, 분위기, 날씨 / 자유 서술 가능)' },
    { question: '이 문장이 어떤 지식/문장/경험과 연결되나요?', placeholder: '(예: 단원_확률, 23회 기출, 공식  | 순서: 연결, 출처, 유형 / 자유 서술 가능)' },
    { question: '이 문장을 읽으면 마음속에 어떤 장면이 떠오르나요?', placeholder: '(예: 화이트보드, 도식 화살표, 명료  | 순서: 장면, 상징, 감정 / 자유 서술 가능)' },
  ],
  practical_knowledge: [
    { question: '왜 이 문장을 메모했나요?', placeholder: '(예: 장애 원인, 재발방지, 긴장  | 순서: 이유, 목표, 감정 / 자유 서술 가능)' },
    { question: '그때의 장소나 상황은 어땠나요?', placeholder: '(예: 사무실, 협업, 맑음  | 순서: 장소, 분위기, 날씨 / 자유 서술 가능)' },
    { question: '이 문장이 어떤 지식/문장/경험과 연결되나요?', placeholder: '(예: PR#1243, 에러로그, 리팩토링  | 순서: 연결, 출처, 유형 / 자유 서술 가능)' },
    { question: '이 문장을 읽으면 마음속에 어떤 장면이 떠오르나요?', placeholder: '(예: 시퀀스도, 병목 아이콘, 가벼움  | 순서: 장면, 상징, 감정 / 자유 서술 가능)' },
  ],
  humanities_self_reflection: [
    { question: '왜 이 문장을 메모했나요?', placeholder: '(예: 가치관 성찰, 기록, 울림  | 순서: 이유, 목표, 감정 / 자유 서술 가능)' },
    { question: '그때의 장소나 상황은 어땠나요?', placeholder: '(예: 산책길, 고요, 바람  | 순서: 장소, 분위기, 날씨 / 자유 서술 가능)' },
    { question: '이 문장이 어떤 지식/문장/경험과 연결되나요?', placeholder: '(예: 대화_메모, 영화_OO, 책임  | 순서: 연결, 출처, 주제 / 자유 서술 가능)' },
    { question: '이 문장을 읽으면 마음속에 어떤 장면이 떠오르나요?', placeholder: '(예: 석양 바다, 문턱, 잔잔함  | 순서: 장면, 상징, 감정 / 자유 서술 가능)' },
  ],
  reading_pleasure: [
    { question: '왜 이 문장을 메모했나요?', placeholder: '(예: 문체/리듬, 좋아서 기록, 즐거움  | 순서: 이유, 목표, 감정 / 자유 서술 가능)' },
    { question: '그때의 장소나 상황은 어땠나요?', placeholder: '(예: 카페, 여유, 비  | 순서: 장소, 분위기, 날씨 / 자유 서술 가능)' },
    { question: '이 문장이 어떤 지식/문장/경험과 연결되나요?', placeholder: '(예: 유사 장면, 작가_무라카미, 몽환  | 순서: 연결, 출처, 분위기 / 자유 서술 가능)' },
    { question: '이 문장을 읽으면 마음속에 어떤 장면이 떠오르나요?', placeholder: '(예: 인물 클로즈업, 빗물 질감, 여운  | 순서: 장면, 상징, 감정 / 자유 서술 가능)' },
  ],
};

/**
 * @interface TSNoteCardProps
 * @description TSNoteCard 컴포넌트가 받는 프롭(props)들의 타입 정의입니다.
 */
export type TSNoteCardProps = {
  /** @property {TSNote} note - 표시하고 관리할 노트 객체. */
  note: TSNote;
  /** @property {string} [bookTitle] - (선택적) 이 노트가 유래한 책의 제목. */
  bookTitle?: string;
  /** 
   * @property {(updated: Partial<TSNote>) => void} onUpdate 
   * - 노트의 내용(메모 진화 필드 등)이 변경되었을 때 호출되는 콜백 함수입니다.
   *   변경된 필드만 포함하는 부분적인 TSNote 객체를 인자로 받습니다.
   *   부모 컴포넌트에서 이 콜백을 통해 상태를 동기화하거나 추가 작업을 수행할 수 있습니다.
   */
  onUpdate?: (updatedFields: Partial<TSNote>) => void;
  /** 
   * @property {(note: TSNote) => void} [onFlashcardConvert]
   * - (선택적) 퀴즈 카드 변환 버튼 클릭 시 호출되는 콜백 함수입니다.
*   해당 노트 객체를 인자로 전달하여 부모 컴포넌트에서 퀴즈 카드 생성 로직을 처리하도록 합니다.
   */
  onFlashcardConvert?: (note: TSNote) => void;
  /** 
   * @property {(note: TSNote) => void} [onRelatedLinks]
   * - (선택적) 관련 링크 관리 버튼 클릭 시 호출되는 콜백 함수입니다.
   *   해당 노트 객체를 인자로 전달하여 부모 컴포넌트에서 관련 링크 관리 UI를 열도록 합니다.
   */
  onRelatedLinks?: (note: TSNote) => void;
  /** @property {string} [readingPurpose] - (선택적) 현재 독서 목적 (예: 'exam_prep'). 메모 진화 질문 세트를 선택하는 데 사용됩니다. */
  readingPurpose?: string;
  /** @property {TSSessionDetails} [sessionDetails] - (선택적) 노트가 생성된 TS 세션의 상세 정보. 카드 좌측에 표시됩니다. */
  sessionDetails?: TSSessionDetails;
  /** 
   * @property {(noteId: string, bookId: string) => void} [onAddToCart]
   * - (선택적) "지식 카트에 담기" 버튼 클릭 시 호출되는 콜백 함수입니다.
   *   해당 노트의 ID(noteId)와 책 ID(bookId)를 인자로 전달하여, 부모 컴포넌트에서 실제 카트 추가 로직을 수행합니다.
   *   이 프롭이 제공되면 카트 담기 버튼이 활성화됩니다.
   */
  onAddToCart?: (noteId: string, bookId: string) => void;
  /** 
   * @property {boolean} [isAddedToCart]
   * - (선택적) 해당 노트가 이미 지식 카트에 담겨있는지 여부를 나타내는 boolean 값입니다.
   *   이 값에 따라 "지식 카트에 담기" 버튼의 아이콘 및 툴크 내용이 변경됩니다. (예: 🛒+ 또는 🛒✅)
   */
  isAddedToCart?: boolean;
  /** @property {string} [className] - (선택적) 컴포넌트에 추가할 클래스 이름. */
  className?: string;
  /** @property {boolean} [showActions] - (선택적) 컴포넌트에 액션 버튼을 표시할지 여부. */
  showActions?: boolean;
  /** @property {boolean} [minimalDisplay] - (선택적) 최소 표시 모드를 사용할지 여부. */
  minimalDisplay?: boolean;
  /** @property {boolean} [isPageEditing] - (선택적) 페이지 전체의 편집 모드 상태 */
  isPageEditing?: boolean;
  /** @property {boolean} [enableOverlayEvolutionMode] - (선택적) 오버레이 진화 모드를 활성화할지 여부 */
  enableOverlayEvolutionMode?: boolean;
  /** 
   * @property {(noteId: string, threadContent: string) => void} [onAddInlineThread]
   * - (선택적) 인라인메모 쓰레드 추가 시 호출되는 콜백 함수입니다.
   *   노트 ID와 쓰레드 내용을 인자로 전달합니다.
   */
  onAddInlineThread?: (noteId: string, threadContent: string) => void;
  /** 
   * @property {(threadId: string, updatedContent: string) => void} [onUpdateInlineThread]
   * - (선택적) 인라인메모 쓰레드 수정 시 호출되는 콜백 함수입니다.
   *   쓰레드 ID와 수정된 내용을 인자로 전달합니다.
   */
  onUpdateInlineThread?: (threadId: string, updatedContent: string) => void;
  /** 
   * @property {(threadId: string) => void} [onDeleteInlineThread]
   * - (선택적) 인라인메모 쓰레드 삭제 시 호출되는 콜백 함수입니다.
   *   삭제할 쓰레드 ID를 인자로 전달합니다.
   */
  onDeleteInlineThread?: (threadId: string) => void;
};

const tabIconMap = [
  { icon: LightBulbIcon, color: 'text-blue-500', ring: 'ring-blue-200' },
  { icon: PhotoIcon, color: 'text-purple-500', ring: 'ring-purple-200' },
  { icon: LinkIcon, color: 'text-green-500', ring: 'ring-green-200' },
  { icon: SparklesIcon, color: 'text-orange-500', ring: 'ring-orange-200' },
];

// 진하고 고급스러운 딥톤 컬러 팔레트
const tabColorMap = [
  { color: '#234E70', ring: '#234E70' }, // 딥 네이비 블루
  { color: '#6C3483', ring: '#6C3483' }, // 딥 바이올렛
  { color: '#218C5A', ring: '#218C5A' }, // 딥 포레스트 그린
  { color: '#E67E22', ring: '#E67E22' }, // 딥 앰버 오렌지
];

// Helper 함수들
/**
 * @function formatSessionCreatedAt
 * @description 세션 생성 시간을 사용자 친화적인 형식으로 포맷팅합니다.
 * 클라이언트 시간(사용자 현지 시간)이 있으면 우선 사용하고, 없으면 서버 시간을 사용합니다.
 * @param {string} [clientTimeISO] - 클라이언트에서 기록된 시간 (ISO 문자열)
 * @param {string} [serverTimeISO] - 서버에서 기록된 시간 (ISO 문자열)
 * @returns {string} 포맷팅된 시간 문자열 또는 '정보 없음'
 */
const formatSessionCreatedAt = (clientTimeISO?: string, serverTimeISO?: string): string => {
  return formatUserTime(clientTimeISO, serverTimeISO);
};

/**
 * @function formatNoteCreatedAt
 * @description 노트 생성 시간을 사용자 친화적인 형식으로 포맷팅합니다.
 * 클라이언트 시간(사용자 현지 시간)이 있으면 우선 사용하고, 없으면 서버 시간을 사용합니다.
 * @param {TSNote} note - 시간 정보를 포함한 노트 객체
 * @returns {string} 포맷팅된 시간 문자열 또는 '정보 없음'
 */
const formatNoteCreatedAt = (note: TSNote): string => {
  return formatUserTime(note.clientCreatedAt, note.createdAt);
};

const formatSessionDuration = (seconds?: number): string => {
  if (seconds === undefined || seconds < 0) return '정보 없음';
  if (seconds === 0) return '0분';
  const totalMinutes = Math.floor(seconds / 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  let durationString = "";
  if (h > 0) durationString += `${h}시간 `;
  if (m > 0 || h === 0) durationString += `${m}분`; // 0시간일때도 분은 표시
  return durationString.trim();
};

const formatSessionPageProgress = (start?: number, actualEnd?: number, targetEnd?: number): string => {
  if (start === undefined) return '정보 없음';
  let progress = `${start}p`;
  if (actualEnd !== undefined) {
    progress += ` ~ ${actualEnd}p`;
  } else if (targetEnd !== undefined) {
    progress += ` (목표: ${targetEnd}p)`;
  }
  return progress;
};

const formatPPM = (ppm?: number): string => {
  if (ppm === undefined) return '정보 없음';
  return `분당 ${ppm.toFixed(1)} 페이지`;
};

// Helper to get link type icon
const getLinkTypeIcon = (type: RelatedLink['type']) => {
  switch (type) {
    case 'book': return <PencilSquareIcon className="h-4 w-4 mr-1 inline-block text-blue-400" />;
    case 'paper': return <PencilSquareIcon className="h-4 w-4 mr-1 inline-block text-green-400" />;
    case 'youtube': return <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-1 inline-block text-red-400" />; // Or a specific YouTube icon
    case 'media': return <PhotoIcon className="h-4 w-4 mr-1 inline-block text-purple-400" />;
    case 'website': return <LinkIcon className="h-4 w-4 mr-1 inline-block text-gray-400" />;
    default: return <LinkIcon className="h-4 w-4 mr-1 inline-block text-gray-400" />;
  }
};

// Helper function to extract domain from URL
const getDomainFromUrl = (url: string) => {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname;
  } catch (e) {
    // If URL is invalid, return a placeholder or the original URL fragment
    return url.split('/')[2] || url;
  }
};

// Ensure cyberTheme is defined or imported if it's used here (e.g., for button/menu styling)
// Minimal cyberTheme definition for TSNoteCard if not using a global one:
const cyberTheme = {
  cardBg: 'bg-gray-800',
  cardBorder: 'border-gray-700',
  textMain: 'text-gray-100',
  textMuted: 'text-gray-400',
  primaryText: 'text-cyan-400',
  secondaryText: 'text-purple-400',
  tagBg: 'bg-gray-700',
  tagText: 'text-gray-300',
  buttonOutlineBorder: 'border-gray-600',
  buttonOutlineText: 'text-gray-300',
  buttonOutlineHoverBg: 'hover:bg-gray-700',
  menuBg: 'bg-gray-700', // Example for dropdown
  menuBorder: 'gray-600', // Example for dropdown border
  menuItemHover: 'hover:bg-gray-600', // Example for dropdown item hover
};

/**
 * @component TSNoteCard
 * @description 1줄 메모(노트)를 표시하고, 메모 진화(4단계 질문 답변), 퀴즈 카드 변환, 관련 링크 관리,
 *              지식 카트 담기 등의 기능을 제공하는 핵심 UI 컴포넌트입니다.
 * @param {TSNoteCardProps} props - 컴포넌트가 받는 프롭들.
 */
export default function TSNoteCard({ 
  note: initialNote,
  onUpdate,
  onFlashcardConvert,
  onRelatedLinks,
  readingPurpose = 'humanities_self_reflection', // 기본값 설정
  sessionDetails,
  onAddToCart,
  isAddedToCart,
  className,
  showActions = true,
  minimalDisplay = false,
  bookTitle,
  isPageEditing = false, // 기본값을 false로 변경
  enableOverlayEvolutionMode = false,
  onAddInlineThread,
  onUpdateInlineThread,
  onDeleteInlineThread,
}: TSNoteCardProps) {
  const [note, setNote] = useState(initialNote);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // 오버레이 UI 표시 상태
  const [isInlineEditing, setIsInlineEditing] = useState(false); // 인라인 편집 상태 관리
  const [showSessionDetailsPopover, setShowSessionDetailsPopover] = useState(false);

  // 인라인메모 쓰레드 관련 상태
  const [showInlineThreads, setShowInlineThreads] = useState(false);
  const [isAddingThread, setIsAddingThread] = useState(false);
  const [newThreadContent, setNewThreadContent] = useState('');
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [editingThreadContent, setEditingThreadContent] = useState('');
  const [isSubmittingThread, setIsSubmittingThread] = useState(false); // 중복 요청 방지용 상태
  
  // 섹션별 접기/펼치기 상태 관리
  const [showMemoEvolution, setShowMemoEvolution] = useState(false);
  const [showRelatedLinks, setShowRelatedLinks] = useState(false);
  
  // 개념이해도 점수 관련 상태
  const [showConceptScorePopup, setShowConceptScorePopup] = useState(false);
  const { score, loading: scoreLoading, error: scoreError, fetchScore, handleAction } = useConceptScore(note._id);
  
  // React Strict Mode 대응을 위한 ref들
  const submissionRef = useRef<Set<string>>(new Set()); // 컴포넌트별 요청 추적
  const abortControllerRef = useRef<AbortController | null>(null); // API 호출 중단용
  const isFirstRenderRef = useRef(true); // 첫 번째 렌더링 체크
  const isMountedRef = useRef(true); // 컴포넌트 마운트 상태 추적
  const cardRef = useRef<HTMLDivElement>(null);

  const [fields, setFields] = useState({
    importanceReason: initialNote.importanceReason || '',
    momentContext: initialNote.momentContext || '',
    relatedKnowledge: initialNote.relatedKnowledge || '',
    mentalImage: initialNote.mentalImage || '',
  });
  
  const tabKeys = ['importanceReason', 'momentContext', 'relatedKnowledge', 'mentalImage'] as const;
  type MemoEvolutionFieldKey = typeof tabKeys[number];

  const [activeTabKey, setActiveTabKey] = useState<MemoEvolutionFieldKey>(tabKeys[0]);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSavingEvolution, setIsSavingEvolution] = useState(false);
  const evolutionTextareaRef = useRef<HTMLTextAreaElement>(null);

  // 유사 메모 패널 상태
  const [similarOpen, setSimilarOpen] = useState(false);
  const [similarItems, setSimilarItems] = useState<Array<{ _id: string; bookId?: string; content: string; createdAt?: string; score?: number }>>([]);
  const [similarQuery, setSimilarQuery] = useState<string>('');
  // 1차 트리거 토스트 시퀀스 중복 방지
  const milestone1ToastShownRef = useRef<boolean>(false);

  const tabList = [
    { key: 'importanceReason', label: '적은 이유' },
    { key: 'momentContext', label: '적었던 당시 상황' },
    { key: 'relatedKnowledge', label: '연상된 지식' },
    { key: 'mentalImage', label: '떠오른 장면' },
  ];
  
  const prompts = memoEvolutionPrompts[readingPurpose as keyof typeof memoEvolutionPrompts] || memoEvolutionPrompts['humanities_self_reflection'];

  // 컴포넌트 마운트 상태 관리 (useIsMounted 패턴)
  const [isMounted, setIsMounted] = useState(false);
  
  // 마운트 상태 추적 useEffect (React Strict Mode 대응)
  useEffect(() => {
    setIsMounted(true);
    isMountedRef.current = true;
    // Deep-link handler: openSimilarPanel/seed/slot via URLSearchParams
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const open = params.get('openSimilarPanel');
        const seed = params.get('seed');
        if (open === '1') {
          setSimilarOpen(true);
        }
        if (seed && seed.length > 0) {
          setSimilarQuery(seed);
          // Trigger a lightweight similar search when seed exists
          const token = localStorage.getItem('token');
          const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
          if (token) {
            fetch(`${base}/api/analytics/similar`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ text: seed, limit: 5 }),
            })
              .then(r => r.json())
              .then((data) => {
                const results = Array.isArray(data?.results) ? data.results : [];
                if (results.length) {
                  setSimilarItems(results.slice(0,5));
                  setSimilarOpen(true);
                }
              }).catch(() => {});
          }
        }
      }
    } catch {}
    
    return () => {
      setIsMounted(false);
      isMountedRef.current = false;
      
      // 진행 중인 API 호출 중단
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // 전역 요청 추적에서 제거
      submissionRef.current.forEach(requestKey => {
        if ((window as any).__pendingThreadRequests) {
          (window as any).__pendingThreadRequests.delete(requestKey);
        }
      });
      submissionRef.current.clear();
    };
  }, []);

  // initialNote prop 변경 감지 useEffect (React Strict Mode 완전 대응)
  useEffect(() => {
    let isCleandUp = false; // 핵심: cleanup 플래그 (웹 검색 결과 패턴)

    // 마운트되지 않은 상태에서는 실행하지 않음
    if (!isMounted) {
      return;
    }

    // 첫 번째 렌더링에서는 실행하지 않음 (React Strict Mode 대응)
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }

    // 컴포넌트가 언마운트된 상태에서는 실행하지 않음
    if (!isMountedRef.current) {
      return;
    }

    // 안전한 상태 업데이트 (cleanup 플래그와 마운트 상태 재확인)
    if (!isCleandUp && isMountedRef.current) {
      setNote(initialNote);
      setFields({
        importanceReason: initialNote.importanceReason || '',
        momentContext: initialNote.momentContext || '',
        relatedKnowledge: initialNote.relatedKnowledge || '',
        mentalImage: initialNote.mentalImage || '',
      });
      
      // 페이지 전체 편집 모드가 비활성화되거나, 오버레이 모드가 활성화되면
      // 개별 카드의 인라인 편집 상태도 초기화 (비활성화)합니다.
      if (!isPageEditing || enableOverlayEvolutionMode) {
        if (!isCleandUp && isMountedRef.current) {
          setIsInlineEditing(false);
        }
      }
    }

    // cleanup 함수: isCleandUp 플래그 설정
    return () => {
      isCleandUp = true;
    };
  }, [initialNote, isPageEditing, enableOverlayEvolutionMode, isMounted]);

  useEffect(() => {
    const newCurrentStep = tabKeys.indexOf(activeTabKey) + 1;
    if (newCurrentStep > 0) {
      setCurrentStep(newCurrentStep);
    }
  }, [activeTabKey, tabKeys]);

  const handleSaveEvolution = useCallback(async () => {
    const changedFields: Partial<TSNote> = { _id: note._id };
    let hasChanges = false;
    for (const key of tabKeys) {
      if (fields[key] !== (note[key as MemoEvolutionFieldKey] || '')) {
        (changedFields as any)[key] = fields[key];
        hasChanges = true;
      }
    }

    if (hasChanges && onUpdate) {
      setIsSavingEvolution(true);
      try {
        const beforeMilestone1 = (note as any).milestone1NotifiedAt || null;
        const beforeMilestone2 = (note as any).milestone2NotifiedAt || null;

        await onUpdate(changedFields);

        // 변경 후 노트 리패치하여 마일스톤 변화 감지
        try {
          const refreshed = await api.get(`/notes/${note._id}`);
          const after = refreshed.data || {};
          const afterMilestone1 = after.milestone1NotifiedAt || null;
          const afterMilestone2 = after.milestone2NotifiedAt || null;
          if (!beforeMilestone1 && afterMilestone1 && !milestone1ToastShownRef.current) {
            milestone1ToastShownRef.current = true;
            // 1) 유사 메모 자동 추적 완료 → 2) 반복 패턴 → 3) 방향 제안 순으로 토스트 표시 (시간 간격 부여)
            try {
              const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
              const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
              const now = new Date();
              const hourBucket = now.getHours();
              const weekday = now.getDay();
              if (token) {
                const text = String(after?.content || note.content || '').slice(0, 600);
                // 1) 유사 메모 자동 추적
                fetch(`${base}/api/analytics/similar`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                  body: JSON.stringify({ text, limit: 3, hourBucket, weekday }),
                })
                  .then(r => r.json())
                  .then((data) => {
                    const results = Array.isArray(data?.results) ? data.results : [];
                    if (results.length) {
                      setSimilarItems(results.slice(0,3));
                      setSimilarOpen(true);
                      showSuccess(`유사 메모 ${results.length}개 자동 추적 완료. 지금 바로 확인하세요.`);
                    }
                  })
                  .catch(() => {})
                  .finally(() => {
                    // 2) 반복 패턴 제안 (약간의 지연 후)
                    setTimeout(() => {
                      fetch(`${base}/api/analytics/repetition?days=30`, { headers: { Authorization: `Bearer ${token}` } })
                        .then(r => r.json())
                        .then((rep) => {
                          if (rep?.buckets?.length) {
                            showSuccess('이 시간대 반복되는 생각이군요.');
                          }
                        })
                        .catch(() => {})
                        .finally(() => {
                          // 3) 방향(전이) 제안 (추가 지연 후)
                          setTimeout(() => {
                            fetch(`${base}/api/analytics/direction`, { headers: { Authorization: `Bearer ${token}` } })
                              .then(r => r.json())
                              .then((dir) => {
                                const tags = dir?.suggestions?.map((s: any) => s.tag).filter(Boolean) || [];
                                if (tags.length) {
                                  showSuccess(`다음 생각으로 가능성 높은 주제 : ${tags.join(', ')}`);
                                }
                              })
                              .catch(() => {});
                          }, 1200);
                        });
                    }, 1200);
                  });
              }
            } catch {}
          }
          if (!beforeMilestone2 && afterMilestone2) {
            showSuccess('훌륭해요! 4단계 + 연결 4개 달성! 포커스드 노트로 묶어 보시겠어요?');
            // 2차 마일스톤 달성 시 정밀 유사 메모 안내
            try {
              const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
              const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
              if (token) {
                const now = new Date();
                const hourBucket = now.getHours();
                const weekday = now.getDay();
                const textParts = [
                  String(after?.content || note.content || ''),
                  String(after?.importanceReason || ''),
                  String(after?.relatedKnowledge || ''),
                ].join('\n').slice(0, 800);
                fetch(`${base}/api/analytics/similar`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                  body: JSON.stringify({ text: textParts, limit: 5, hourBucket, weekday }),
                })
                  .then(r => r.json())
                  .then((data) => {
                    const results = Array.isArray(data?.results) ? data.results : [];
                    if (results.length) {
                      showSuccess(`정밀 유사 메모 ${results.length}개 발견! 비교해 보세요.`);
                      setSimilarItems(results.slice(0,3));
                      setSimilarOpen(true);
                    }
                  }).catch(() => {});
              }
            } catch {}
          }
          // 반복/방향 제안(경량) — 로그인 환경에서만
          try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            if (token) {
              fetch(`${base}/api/analytics/repetition?days=30`, { headers: { Authorization: `Bearer ${token}` } })
                .then(r => r.json()).then((data) => {
                  if (data?.buckets?.length) {
                    showSuccess('이 시간대에 자주 반복하던 생각이에요. 다른 관점으로 확장해볼까요?');
                  }
                }).catch(() => {});
              fetch(`${base}/api/analytics/direction`, { headers: { Authorization: `Bearer ${token}` } })
                .then(r => r.json()).then((data) => {
                  const tags = data?.suggestions?.map((s:any)=> s.tag).filter(Boolean) || [];
                  if (tags.length) showSuccess(`다음으로 이어질 가능성 높은 주제: ${tags.join(', ')}`);
                }).catch(() => {});
            }
          } catch {}
        } catch {}
        // 오버레이 또는 인라인 편집 상태에 따라 적절히 닫기
        if (enableOverlayEvolutionMode) {
          setIsOpen(false); 
        } else {
          // 인라인 편집 저장 후 자동으로 닫을지는 UX 결정 사항
          // setIsInlineEditing(false); 
        }
      } catch (error) {
        console.error("Failed to save note evolution:", error);
      } finally {
        setIsSavingEvolution(false);
      }
    } else {
      // 변경 사항이 없어도 닫기
      if (enableOverlayEvolutionMode) {
        setIsOpen(false); 
      } else {
        // setIsInlineEditing(false);
      }
    }
  }, [fields, note, onUpdate, tabKeys, setIsOpen, enableOverlayEvolutionMode, setIsInlineEditing]);

  const toggleEvolutionOverlay = () => {
    if (enableOverlayEvolutionMode) { 
      setIsOpen((prev) => {
        const nextOpenState = !prev;
        if (nextOpenState) {
          setIsInlineEditing(false); // 오버레이 열리면 인라인 편집은 닫음
          setFields({
            importanceReason: note.importanceReason || '',
            momentContext: note.momentContext || '',
            relatedKnowledge: note.relatedKnowledge || '',
            mentalImage: note.mentalImage || '',
          });
          setActiveTabKey(tabKeys[0]);
        }
        return nextOpenState;
      });
    } else {
      // 오버레이 모드가 아닐 때는 인라인 편집 모드 사용
      toggleInlineEdit();
    }
  };

  const toggleInlineEdit = () => {
    // 오버레이 모드가 아니고 최소 표시 모드가 아닐 때만 동작
    if (!enableOverlayEvolutionMode && !minimalDisplay) {
      setIsInlineEditing(prev => {
        const nextInlineState = !prev;
        if (nextInlineState && isOpen) {
          setIsOpen(false); // 인라인 편집 시작 시 오버레이 닫음
        }
        return nextInlineState;
      });
    }
  };

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button, a, [role="button"], [role="link"], [data-no-toggle]')) {
      return;
    }
  };

  const handleFieldChange = (key: MemoEvolutionFieldKey, value: string) => {
    setFields(prev => ({ ...prev, [key]: value }));
  };
  
  const handleNextStep = useCallback(() => {
    const currentIndex = tabKeys.indexOf(activeTabKey);
    if (currentIndex < tabKeys.length - 1) {
      setActiveTabKey(tabKeys[currentIndex + 1]);
    }
  }, [activeTabKey, tabKeys]);

  const handlePrevStep = useCallback(() => {
    const currentIndex = tabKeys.indexOf(activeTabKey);
    if (currentIndex > 0) {
      setActiveTabKey(tabKeys[currentIndex - 1]);
    }
  }, [activeTabKey, tabKeys]);

  const displaySessionCreatedAt = sessionDetails?.createdAtISO || sessionDetails?.clientCreatedAtISO 
    ? formatSessionCreatedAt(sessionDetails.clientCreatedAtISO, sessionDetails.createdAtISO) 
    : '세션 정보 없음';
  const displaySessionDuration = sessionDetails?.durationSeconds !== undefined ? formatSessionDuration(sessionDetails.durationSeconds) : '';
  const displaySessionPageProgress = (sessionDetails?.startPage !== undefined || sessionDetails?.actualEndPage !== undefined || sessionDetails?.targetPage !== undefined) 
                                     ? formatSessionPageProgress(sessionDetails?.startPage, sessionDetails?.actualEndPage, sessionDetails?.targetPage) 
                                     : '';
  const displayPPM = sessionDetails?.ppm !== undefined ? formatPPM(sessionDetails.ppm) : '';

  const displayBookTitle = bookTitle || sessionDetails?.book?.title || "Unknown Book";

  const renderSessionInfoButton = () => (
    <button
      onMouseEnter={() => setShowSessionDetailsPopover(true)}
      onMouseLeave={() => setShowSessionDetailsPopover(false)}
      onClick={(e) => e.stopPropagation()}
      data-no-toggle
      className={`absolute bottom-2 left-2 z-30 p-1.5 rounded-full bg-gray-700/70 hover:bg-cyan-600/90
                  text-gray-300 hover:text-white transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-cyan-500
                  sm:p-1.5 ${isOpen && enableOverlayEvolutionMode ? 'invisible' : ''}`}
      aria-label="TS 세션 정보"
    >
      <AiOutlineInfoCircle className="h-3 w-3 sm:h-4 sm:w-4" />
    </button>
  );

  const renderSessionInfoPopover = () => (
    <div 
      className={`transition-opacity duration-200 ease-in-out ${showSessionDetailsPopover ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                 absolute bottom-10 left-2 w-auto max-w-[200px] xs:max-w-[240px] sm:max-w-xs bg-gray-900/90 backdrop-blur-md p-2 sm:p-3 rounded-lg
                 text-xs text-gray-200 z-20 shadow-xl border border-gray-700/50`}
    >
      <h4 className={`font-semibold mb-1.5 text-cyan-400 border-b border-cyan-400/30 pb-1 text-xs sm:text-sm`}>TS 세션</h4>
      {sessionDetails?.createdAtISO && <p className="mt-1 truncate text-xs" title={`기록일: ${displaySessionCreatedAt}`}>기록일: {displaySessionCreatedAt}</p>}
      {sessionDetails?.durationSeconds !== undefined && <p className="truncate text-xs" title={`읽은 시간: ${displaySessionDuration}`}>읽은 시간: {displaySessionDuration}</p>}
      {sessionDetails && (sessionDetails.startPage !== undefined || sessionDetails.actualEndPage !== undefined) && (
        <p className="truncate text-xs" title={`페이지: ${displaySessionPageProgress}`}>페이지: {displaySessionPageProgress}</p>
      )}
      {sessionDetails?.ppm !== undefined && <p className="truncate text-xs" title={`읽은 속도: ${displayPPM}`}>읽은 속도: {displayPPM}</p>}
      {(!sessionDetails || Object.keys(sessionDetails).length === 0) && <p className="text-gray-400 italic text-xs">세션 정보가 없습니다.</p>}
    </div>
  );
  
  // 인라인메모 쓰레드 렌더링 함수
  const renderInlineThreads = () => {
    // 최소 표시 모드이거나 오버레이가 열려있을 때는 쓰레드 숨김
    if (minimalDisplay || isOpen) return null;

    const threads = note.inlineThreads || [];
    const hasThreads = threads.length > 0;

    return (
      <div className="flex flex-col items-start">
        {/* 빽빽한 텍스트 형태 */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleInlineThreads();
          }}
          className="text-xs text-gray-300 hover:text-blue-400 transition-colors break-words tracking-wide"
          data-no-toggle
        >
          {showInlineThreads ? '▼' : `▶생각추가(${threads.length}/5)`}
        </button>

        {/* 쓰레드 목록 */}
        {showInlineThreads && (
          <div className="mt-2 space-y-2">
            {threads.map((thread) => (
              <div key={thread._id} className="border-l-2 border-gray-600 pl-2 sm:pl-3 py-1">
                {editingThreadId === thread._id ? (
                  // 편집 모드
                  <div className="space-y-2">
                    <textarea
                      value={editingThreadContent}
                      onChange={(e) => setEditingThreadContent(e.target.value)}
                      className="w-full p-2 text-xs sm:text-sm bg-gray-700 border border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500 text-white resize-none tsnote-scrollbar"
                      rows={2}
                      placeholder="쓰레드 내용을 입력하세요..."
                    />
                    <div className="flex space-x-1 sm:space-x-2">
                      <button
                        onClick={handleSaveEditThread}
                        className="px-2 py-1 text-xs bg-cyan-600 text-white rounded hover:bg-cyan-700 transition-colors"
                      >
                        저장
                      </button>
                      <button
                        onClick={handleCancelEditThread}
                        className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  // 표시 모드
                  <div className="group">
                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed whitespace-pre-wrap break-words">
                      {thread.content}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500 truncate">
                        {thread.authorName || '익명'} • {formatUserTime(thread.clientCreatedAt, thread.createdAt)}
                      </span>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1 flex-shrink-0 ml-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditThread(thread._id, thread.content);
                          }}
                          className="p-1 text-xs text-gray-400 hover:text-cyan-400 transition-colors"
                          title="편집"
                          data-no-toggle
                        >
                          <PencilSquareIcon className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('이 인라인메모를 삭제하시겠습니까?')) {
                              handleDeleteThread(thread._id);
                            }
                          }}
                          className="p-1 text-xs text-gray-400 hover:text-red-400 transition-colors"
                          title="삭제"
                          data-no-toggle
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* 새 쓰레드 추가 */}
            {isAddingThread ? (
              <div className="border-l-2 border-cyan-500 pl-2 sm:pl-3 py-1">
                <textarea
                  value={newThreadContent}
                  onChange={(e) => setNewThreadContent(e.target.value)}
                  className="w-full p-2 text-xs sm:text-sm bg-gray-700 border border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500 text-white resize-none tsnote-scrollbar"
                  rows={2}
                  placeholder="생각을 추가하세요..."
                  autoFocus
                />
                <div className="flex space-x-1 sm:space-x-2 mt-2">
                  <button
                    onClick={handleAddThread}
                    disabled={isSubmittingThread}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      isSubmittingThread 
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                        : 'bg-cyan-600 text-white hover:bg-cyan-700'
                    }`}
                  >
                    {isSubmittingThread ? '추가 중...' : '추가'}
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingThread(false);
                      setNewThreadContent('');
                    }}
                    className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isSubmittingThread) {
                    setIsAddingThread(true);
                  }
                }}
                disabled={isSubmittingThread}
                className={`flex items-center text-xs transition-colors duration-200 ml-2 sm:ml-4 ${
                  isSubmittingThread 
                    ? 'text-gray-500 cursor-not-allowed' 
                    : 'text-gray-400 hover:text-cyan-400'
                }`}
                data-no-toggle
              >
                <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                {isSubmittingThread ? '처리 중...' : '생각 추가'}
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderMemoEvolutionSummary = () => {
    // 다음 조건 중 하나라도 해당되면 요약을 보여주지 않음:
    // 1. 최소 표시 모드일 때
    if (minimalDisplay) return null;
    // 2. 오버레이가 열려있을 때
    if (isOpen) return null;
    // 3. 인라인 모드이면서 페이지 편집 모드이고 이 카드가 인라인 편집 중일 때
    if (!enableOverlayEvolutionMode && isPageEditing && isInlineEditing) return null;

    const evolutionFieldsToShow: { key: MemoEvolutionFieldKey; label: string }[] = [
      { key: 'importanceReason', label: '작성 이유' },
      { key: 'momentContext', label: '작성 당시 상황' },
      { key: 'relatedKnowledge', label: '연상되는 지식' },
      { key: 'mentalImage', label: '떠오른 장면' },
    ];

    const details = evolutionFieldsToShow
      .map(field => {
        const value = note[field.key];
        if (value && typeof value === 'string' && value.trim() !== '') {
          return (
            <div key={field.key} className="mt-2.5">
              <p className="text-xs font-medium text-cyan-600 mb-0.5">{field.label}:</p>
              <p className="text-xs sm:text-sm text-gray-300 whitespace-pre-wrap break-words">{value}</p>
            </div>
          );
        }
        return null;
      })
      .filter(Boolean);

    if (details.length === 0) {
      return (
        <div className="flex items-center">
          <button
            className="text-xs text-gray-300 hover:text-purple-400 transition-colors break-words tracking-wide"
            data-no-toggle
          >
            ▶기억강화(0/4)
          </button>
          <span className="ml-2 text-xs text-gray-500 italic">4단계 작성시 유사카드 자동추적</span>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-start">
        {/* 빽빽한 텍스트 형태 */}
        <button
          onClick={() => setShowMemoEvolution(!showMemoEvolution)}
          className="text-xs text-gray-300 hover:text-purple-400 transition-colors break-words tracking-wide"
          data-no-toggle
        >
          {showMemoEvolution ? '▼' : `▶기억강화(${details.length}/4)`}
        </button>

        {/* 펼친 상태 내용 */}
        {showMemoEvolution && (
          <div className="mt-2 p-1.5 sm:p-2 bg-gray-800/20 rounded-md border border-gray-700/30">
            {details}
          </div>
        )}
      </div>
    );
  };

  // 인라인메모 쓰레드 관련 핸들러들
  const toggleInlineThreads = () => {
    setShowInlineThreads(!showInlineThreads);
  };

  const handleAddThread = async () => {
    let isCleandUp = false; // 핵심: cleanup 플래그 (웹 검색 결과 패턴)

    // 컴포넌트가 언마운트된 상태에서는 실행하지 않음
    if (!isMountedRef.current) {
      console.log('컴포넌트 언마운트 상태, 인라인메모 쓰레드 추가 취소');
      return;
    }

    // 중복 요청 방지: 이미 제출 중이거나 내용이 비어있으면 리턴
    if (isSubmittingThread || !newThreadContent.trim()) {
      console.log('인라인메모 쓰레드 추가 차단:', { isSubmittingThread, hasContent: !!newThreadContent.trim() });
      return;
    }
    
    const content = newThreadContent.trim();
    
    // 컴포넌트별 중복 방지
    const requestKey = `${note._id}-${content}`;
    if (submissionRef.current.has(requestKey)) {
      console.log('컴포넌트 중복 요청 차단:', { noteId: note._id, content, requestKey });
      return;
    }
    
    // 전역 중복 방지: 같은 노트와 내용으로 이미 요청 중인지 확인
    if ((window as any).__pendingThreadRequests?.has(requestKey)) {
      console.log('전역 중복 요청 차단:', { noteId: note._id, content, requestKey });
      return;
    }
    
    // 이전 요청이 진행 중이면 중단
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // 새로운 AbortController 생성
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    
    // cleanup 함수 등록
    const cleanup = () => {
      isCleandUp = true;
      console.log('handleAddThread cleanup 실행');
    };
    
    signal.addEventListener('abort', cleanup);
    
    // 컴포넌트별 요청 추적 시작
    submissionRef.current.add(requestKey);
    
    // 전역 요청 추적 시작
    if (!(window as any).__pendingThreadRequests) {
      (window as any).__pendingThreadRequests = new Set();
    }
    (window as any).__pendingThreadRequests.add(requestKey);
    
    // 제출 상태로 변경 (중복 요청 방지)
    if (!isCleandUp && isMountedRef.current) {
      setIsSubmittingThread(true);
    }
    
    console.log('인라인메모 쓰레드 추가 시작:', { noteId: note._id, content, requestKey });
    
    // 즉시 로컬 상태 업데이트 (낙관적 업데이트)
    const tempThread: InlineThread = {
      _id: `temp-${Date.now()}`, // 임시 ID
      content,
      authorName: '나',
      createdAt: new Date().toISOString(),
      clientCreatedAt: new Date().toISOString(),
      parentNoteId: note._id,
      isTemporary: true
    };

    // 로컬 note 상태에 즉시 추가 (cleanup 플래그 확인)
    if (!isCleandUp && isMountedRef.current) {
      setNote(prevNote => ({
        ...prevNote,
        inlineThreads: [...(prevNote.inlineThreads || []), tempThread]
      }));

      // 쓰레드가 추가되면 자동으로 쓰레드 목록을 펼쳐서 보여주기
      setShowInlineThreads(true);
      setNewThreadContent('');
      setIsAddingThread(false);
    }

    // 백엔드 API 호출
    try {
      // AbortController 신호를 체크하면서 API 호출
      const newThreadPromise = inlineThreadApi.create(note._id, content);
      
      // Promise와 AbortController를 결합
      const newThread = await Promise.race([
        newThreadPromise,
        new Promise<never>((_, reject) => {
          signal.addEventListener('abort', () => {
            reject(new Error('Request aborted'));
          });
        })
      ]);
      
      // cleanup 플래그 확인: 요청이 중단되었거나 컴포넌트가 언마운트되었으면 처리하지 않음
      if (isCleandUp || signal.aborted || !isMountedRef.current) {
        console.log('인라인메모 쓰레드 추가 요청이 중단됨 (cleanup 플래그 또는 abort)');
        return;
      }
      
      // 서버 응답 검증: _id가 있는지 확인
      if (!newThread || !newThread._id) {
        console.error('인라인메모 쓰레드 생성 실패: 서버 응답에 _id가 없음:', newThread);
        throw new Error('서버 응답이 올바르지 않음: _id 누락');
      }
      
      console.log('인라인메모 쓰레드 생성 성공:', { tempId: tempThread._id, newId: newThread._id });
      
      // 실제 서버 응답으로 임시 쓰레드를 대체 (cleanup 플래그 재확인)
      if (!isCleandUp && isMountedRef.current) {
        setNote(prevNote => ({
          ...prevNote,
          inlineThreads: prevNote.inlineThreads?.map(thread => 
            thread._id === tempThread._id ? newThread : thread
          ) || []
        }));

        // 마일스톤 변화 감지 (리패치)
        try {
          const refreshed = await api.get(`/notes/${note._id}`);
          const after = refreshed.data || {};
          if (!(note as any).milestone1NotifiedAt && after.milestone1NotifiedAt) {
            showSuccess('좋아요! 생각추가/기억강화/지식연결이 시작되었어요. 비슷한 메모를 연결해볼까요?');
          }
          if (!(note as any).milestone2NotifiedAt && after.milestone2NotifiedAt) {
            showSuccess('훌륭해요! 4단계 + 연결 4개 달성! 포커스드 노트로 묶어 보시겠어요?');
          }
        } catch {}

        // 🚫 중복 API 호출 방지: onAddInlineThread 콜백 호출 제거
        // TSNoteCard에서 이미 완전한 API 호출과 상태 관리를 처리하므로
        // 부모 컴포넌트에 추가 알림이 불필요함
        // if (onAddInlineThread) {
        //   onAddInlineThread(note._id, content);
        // }
      }
    } catch (error) {
      // AbortError는 정상적인 중단이므로 로그만 출력
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('인라인메모 쓰레드 추가 요청이 중단됨:', error.message);
        return;
      }
      
      console.error('인라인메모 쓰레드 생성 실패:', error);
      
      // 실패 시 롤백 (cleanup 플래그와 컴포넌트 마운트 상태 확인)
      if (!isCleandUp && isMountedRef.current) {
        setNote(prevNote => ({
          ...prevNote,
          inlineThreads: prevNote.inlineThreads?.filter(thread => thread._id !== tempThread._id) || []
        }));
      }
    } finally {
      // 요청 추적 해제 (cleanup 플래그와 컴포넌트 마운트 상태 확인)
      if (!isCleandUp && isMountedRef.current) {
        submissionRef.current.delete(requestKey);
        if ((window as any).__pendingThreadRequests) {
          (window as any).__pendingThreadRequests.delete(requestKey);
        }
        
        // 제출 상태 해제 (성공/실패 관계없이)
        setIsSubmittingThread(false);
        console.log('인라인메모 쓰레드 추가 완료:', { requestKey });
      }
      
      // AbortController 정리
      if (abortControllerRef.current && !abortControllerRef.current.signal.aborted) {
        abortControllerRef.current = null;
      }
      
      // cleanup 함수 호출
      cleanup();
    }
  };

  const handleEditThread = (threadId: string, currentContent: string) => {
    setEditingThreadId(threadId);
    setEditingThreadContent(currentContent);
  };

  const handleSaveEditThread = async () => {
    // ID 및 내용 검증
    if (!editingThreadId || editingThreadId === 'undefined') {
      console.error('인라인메모 쓰레드 수정 실패: 유효하지 않은 쓰레드 ID:', editingThreadId);
      return;
    }
    
    if (!editingThreadContent.trim()) {
      console.error('인라인메모 쓰레드 수정 실패: 내용이 비어있음');
      return;
    }
    
    const content = editingThreadContent.trim();
    const originalThread = note.inlineThreads?.find(thread => thread._id === editingThreadId);
    
    if (!originalThread) {
      console.error('인라인메모 쓰레드 수정 실패: 원본 쓰레드를 찾을 수 없음, ID:', editingThreadId);
      return;
    }
    
    // 즉시 로컬 상태 업데이트
    setNote(prevNote => ({
      ...prevNote,
      inlineThreads: prevNote.inlineThreads?.map(thread => 
        thread._id === editingThreadId 
          ? { ...thread, content }
          : thread
      ) || []
    }));
    
    setEditingThreadId(null);
    setEditingThreadContent('');

    // 백엔드 API 호출
    try {
      const updatedThread = await inlineThreadApi.update(note._id, editingThreadId, content);
      
      // 서버 응답 검증
      if (!updatedThread || !updatedThread._id) {
        console.error('인라인메모 쓰레드 수정 실패: 서버 응답에 _id가 없음:', updatedThread);
        throw new Error('서버 응답이 올바르지 않음');
      }
      
      // 실제 서버 응답으로 업데이트
      setNote(prevNote => ({
        ...prevNote,
        inlineThreads: prevNote.inlineThreads?.map(thread => 
          thread._id === editingThreadId ? updatedThread : thread
        ) || []
      }));
      
      // 🚫 중복 API 호출 방지: onUpdateInlineThread 콜백 호출 제거
      // TSNoteCard에서 이미 완전한 API 호출과 상태 관리를 처리하므로
      // 부모 컴포넌트에 추가 알림이 불필요함
      // if (onUpdateInlineThread) {
      //   onUpdateInlineThread(editingThreadId, content);
      // }
    } catch (error) {
      console.error('인라인메모 쓰레드 수정 실패:', error);
      // 실패 시 원래 내용으로 복원
      if (originalThread) {
        setNote(prevNote => ({
          ...prevNote,
          inlineThreads: prevNote.inlineThreads?.map(thread => 
            thread._id === editingThreadId ? originalThread : thread
          ) || []
        }));
      }
    }
  };

  const handleCancelEditThread = () => {
    setEditingThreadId(null);
    setEditingThreadContent('');
  };

  const handleDeleteThread = async (threadId: string) => {
    // ID 검증: undefined 또는 빈 문자열 체크
    if (!threadId || threadId === 'undefined') {
      console.error('인라인메모 쓰레드 삭제 실패: 유효하지 않은 쓰레드 ID:', threadId);
      return;
    }

    // 삭제 전 백업 (복원용)
    const threadToDelete = note.inlineThreads?.find(thread => thread._id === threadId);
    
    if (!threadToDelete) {
      console.error('인라인메모 쓰레드 삭제 실패: 쓰레드를 찾을 수 없음, ID:', threadId);
      return;
    }
    
    // 즉시 로컬 상태에서 제거
    setNote(prevNote => ({
      ...prevNote,
      inlineThreads: prevNote.inlineThreads?.filter(thread => thread._id !== threadId) || []
    }));

    // 백엔드 API 호출
    try {
      await inlineThreadApi.delete(note._id, threadId);
      
      // 🚫 중복 API 호출 방지: onDeleteInlineThread 콜백 호출 제거
      // TSNoteCard에서 이미 완전한 API 호출과 상태 관리를 처리하므로
      // 부모 컴포넌트에 추가 알림이 불필요함
      // if (onDeleteInlineThread) {
      //   onDeleteInlineThread(threadId);
      // }
    } catch (error) {
      console.error('인라인메모 쓰레드 삭제 실패:', error);
      // 실패 시 복원
      if (threadToDelete) {
        setNote(prevNote => ({
          ...prevNote,
          inlineThreads: [...(prevNote.inlineThreads || []), threadToDelete]
        }));
      }
    }
  };

  // 개념이해도 점수 관련 핸들러들
  const handleConceptScoreClick = () => {
    setShowConceptScorePopup(true);
  };

  const handleConceptScoreClose = () => {
    setShowConceptScorePopup(false);
  };

  const handleConceptScoreAction = async (action: string) => {
    try {
      await handleAction(action);
      // 점수 업데이트 후 팝업 닫기
      setShowConceptScorePopup(false);
    } catch (error) {
      console.error('개념이해도 점수 액션 실행 실패:', error);
    }
  };

  // 컴포넌트 마운트 시 점수 조회 - 조건부 호출
  useEffect(() => {
    if (note._id && note._id !== 'temp' && !note.isTemporary && !minimalDisplay) {
      fetchScore();
    }
  }, [note._id, fetchScore, minimalDisplay]);

  // 지식연결 렌더링 함수
  const renderRelatedLinks = () => {
    // 다음 조건 중 하나라도 해당되면 지식연결을 보여주지 않음:
    // 1. 최소 표시 모드일 때
    if (minimalDisplay) return null;
    // 2. 오버레이가 열려있을 때
    if (isOpen) return null;
    // 3. 인라인 편집 중일 때
    if (isInlineEditing) return null;
    // 4. 페이지 편집 모드일 때
    if (isPageEditing) return null;
    // 5. 관련 링크가 없을 때
    if (!note.relatedLinks || note.relatedLinks.length === 0) return null;

    const links = note.relatedLinks;
    const hasLinks = links.length > 0;

    return (
      <div className="flex flex-col items-start">
        {/* 빽빽한 텍스트 형태 */}
        <button
          onClick={() => setShowRelatedLinks(!showRelatedLinks)}
          className="text-xs text-gray-300 hover:text-green-400 transition-colors break-words tracking-wide"
          data-no-toggle
        >
          {showRelatedLinks ? '▼' : `▶지식연결(${links.length}/5)`}
        </button>

        {/* 펼친 상태 내용 */}
        {showRelatedLinks && hasLinks && (
          <div className="mt-2 p-1.5 sm:p-2 bg-gray-800/20 rounded-md border border-gray-700/30">
            <ul className="space-y-1">
              {links.map((link, idx) => (
                <li key={link._id || idx} className="flex items-center text-xs text-gray-300 hover:text-cyan-400 transition-colors duration-150 min-w-0">
                  <ArrowTopRightOnSquareIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 sm:mr-1.5 flex-shrink-0 text-gray-500" />
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="line-clamp-1 min-w-0 text-xs break-all"
                    title={link.url}
                    onClick={(e) => e.stopPropagation()}
                    data-no-toggle
                  >
                    {link.reason || getDomainFromUrl(link.url)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={cn(
        "relative bg-gray-900/20 backdrop-blur-md p-1.5 sm:p-2 md:p-3 rounded-lg shadow-lg transition-transform duration-300 group",
        isOpen && enableOverlayEvolutionMode ? "ring-2 ring-cyan-500" : "",
        minimalDisplay ? "max-h-44 overflow-hidden group-hover:max-h-none" : "",
        className
      )}
      onClick={handleCardClick}
      ref={cardRef}
    >
      {/* 페이지 배지 (우측 상단) */}
      {typeof note.pageNumber === 'number' && note.pageNumber > 0 && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setShowPdfPreview(true); }}
          className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 px-1.5 py-0.5 rounded-md text-[10px] sm:text-xs bg-gray-800/80 border border-gray-600/60 text-gray-200 hover:bg-gray-700/80 transition-colors"
          title={`페이지 ${note.pageNumber}`}
          data-no-toggle
        >
          p.{note.pageNumber}
        </button>
      )}
      {!minimalDisplay && sessionDetails && Object.keys(sessionDetails).length > 0 && ( 
        <>
          {renderSessionInfoButton()}
          {renderSessionInfoPopover()}
        </>
      )}

      <div className="flex-grow mb-1 sm:mb-2 space-y-0.5 sm:space-y-1">
        {note.highlightedText && note.content ? (
          <p
            className={cn(
              minimalDisplay ?
                "text-xs sm:text-sm leading-snug font-normal" :
                "text-sm sm:text-base md:text-lg leading-relaxed font-medium",
              "whitespace-pre-wrap break-words break-all",
              isPageEditing || (isOpen && enableOverlayEvolutionMode) || minimalDisplay ? 'text-gray-300' : 'text-white',
              !isPageEditing && !(isOpen && enableOverlayEvolutionMode) && !minimalDisplay && !isInlineEditing ? 'border-l-2 sm:border-l-4 border-cyan-600 pl-1.5 sm:pl-2 md:pl-3 py-1' : 'py-1',
              minimalDisplay ? 'pb-5' : '',
              !isPageEditing && !(isOpen && enableOverlayEvolutionMode) && !minimalDisplay && !isInlineEditing ? 'hover:text-yellow-300 transition-colors duration-200' : ''
            )}
          >
            <span className="block sm:inline">{note.highlightedText}</span>
            <span className="hidden sm:inline mx-2">—</span>
            <span className="block sm:inline">{note.content}</span>
          </p>
        ) : (
          <p
            className={cn(
              minimalDisplay ?
                "text-xs sm:text-sm leading-snug font-normal" :
                "text-sm sm:text-base md:text-lg leading-relaxed font-medium",
              "whitespace-pre-wrap break-words break-all",
              isPageEditing || (isOpen && enableOverlayEvolutionMode) || minimalDisplay ? 'text-gray-300' : 'text-white',
              !isPageEditing && !(isOpen && enableOverlayEvolutionMode) && !minimalDisplay && !isInlineEditing ? 'border-l-2 sm:border-l-4 border-cyan-600 pl-1.5 sm:pl-2 md:pl-3 py-1' : 'py-1',
              minimalDisplay ? 'pb-5' : '',
              !isPageEditing && !(isOpen && enableOverlayEvolutionMode) && !minimalDisplay && !isInlineEditing ? 'hover:text-yellow-300 transition-colors duration-200' : ''
            )}
          >
            {note.highlightedText || note.content}
          </p>
        )}

        {/* 책 제목(출처) 표시 - 생각추가 위로 이동 */}
        <div className={cn("mt-0.5 sm:mt-1.5 text-xs text-gray-400 flex items-center min-w-0", {
          "invisible": isInlineEditing || !bookTitle || minimalDisplay || isOpen || isPageEditing
        })}>
            <SolidBookOpenIcon className="h-3 w-3 mr-0.5 sm:mr-1.5 text-gray-500 flex-shrink-0" />
            <span className="truncate" title={`출처: ${displayBookTitle}`}>
              출처: {displayBookTitle}
            </span>
        </div>

        {/* 메뉴 버튼들을 가로로 배치 (모바일에서는 세로로) */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-y-0.5 sm:gap-x-3 sm:gap-y-1">
          <div className="flex items-center">
            {renderInlineThreads()}
          </div>
          <div className="flex items-center">
            {renderMemoEvolutionSummary()}
          </div>
          <div className="flex items-center">
            {renderRelatedLinks()}
          </div>
        </div>
      </div>
      
      {!minimalDisplay && note.tags && note.tags.length > 0 && (
        <div className="border-t border-gray-700/50 flex flex-wrap items-center justify-start gap-x-1 sm:gap-x-2 gap-y-1 sm:gap-y-1.5 py-1 sm:py-2">
          <TagIcon className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" title="태그" />
          {note.tags.map((tag, index) => (
            <span
              key={index}
              className={`px-1 sm:px-2 py-0.5 text-xs rounded-full ${cyberTheme.tagBg} ${cyberTheme.tagText} flex items-center justify-center max-w-[100px] xs:max-w-[120px] sm:max-w-[150px]`}
              onClick={(e) => e.stopPropagation()}
              data-no-toggle
              title={tag}
            >
              <span className="truncate">{tag}</span>
            </span>
          ))}
        </div>
      )}

      {(() => {
        // --- DEBUG LOG START ---
        const shouldRenderActions = showActions && !minimalDisplay;
        const shouldRenderConceptScore = score && !minimalDisplay;
        
        if (shouldRenderActions) {
          return (
            <div className="flex items-center justify-end space-x-1 sm:space-x-2 mt-auto pt-1.5 sm:pt-2 border-t border-gray-700/50">
              {/* 개념이해도 점수 아이콘 */}
              {shouldRenderConceptScore && (
                <ConceptScoreIcon
                  score={score.totalScore}
                  level={score.level}
                  onClick={handleConceptScoreClick}
                  className="flex-shrink-0"
                />
              )}
              
              {/* AI 코멘트 Popover */}
              <AiCoachPopover
                memoText={note.content}
                onSelect={() => {}}
                className=""
              />
              {onAddToCart && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={(e) => { e.stopPropagation(); onAddToCart(note._id, note.bookId); }}
                  title={isAddedToCart ? "제거" : "담기"}
                  className={`h-7 w-7 sm:h-8 sm:w-8 ${isAddedToCart ? 'border-green-500 text-green-500 hover:bg-green-500/10' : cyberTheme.buttonOutlineBorder + ' ' + cyberTheme.buttonOutlineText + ' ' + cyberTheme.buttonOutlineHoverBg }`}
                  data-no-toggle
                >
                  <ShoppingCartIcon className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${isAddedToCart ? 'text-green-500' : ''}`} />
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="px-1 sm:px-2 h-7 w-7 sm:h-8 sm:w-8" data-no-toggle onClick={(e) => e.stopPropagation()}>
                    <EllipsisVerticalIcon className={`h-3 w-3 sm:h-4 sm:w-4 text-gray-400 hover:${cyberTheme.primaryText}`} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className={`${cyberTheme.menuBg} border-${cyberTheme.menuBorder} min-w-[120px] sm:min-w-[140px]`}>
                  {/* "기억 강화" 메뉴 항목 조건 변경: 항상 표시하되 모드에 따라 텍스트만 다르게 */}
                  <DropdownMenuItem 
                    onClick={toggleEvolutionOverlay} 
                    className={`${cyberTheme.menuItemHover} ${cyberTheme.primaryText} text-xs sm:text-sm`}
                  >
                    <SparklesIcon className={`h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5 ${cyberTheme.primaryText}`} /> 
                    <span className="hidden sm:inline">기억 강화</span>
                    <span className="sm:hidden">강화</span>
                  </DropdownMenuItem>
                  
                  {/* 기존의 인라인 편집 시작/종료 메뉴는 제거 (중복 방지) */}
                  
                  {onFlashcardConvert && (
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onFlashcardConvert(note); }} className={`${cyberTheme.menuItemHover} ${cyberTheme.primaryText} text-xs sm:text-sm`}>
                      <GiCutDiamond className={`h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5 ${cyberTheme.primaryText}`} /> 
                                      <span className="hidden sm:inline">퀴즈 카드</span>
                <span className="sm:hidden">퀴즈</span>
                    </DropdownMenuItem>
                  )}
                  {onRelatedLinks && (
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onRelatedLinks(note); }} className={`${cyberTheme.menuItemHover} ${cyberTheme.primaryText} text-xs sm:text-sm`}>
                      <LinkIcon className={`h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5 ${cyberTheme.primaryText}`} /> 
                      <span className="hidden sm:inline">지식 연결</span>
                      <span className="sm:hidden">연결</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        }
        
        // minimalDisplay 모드에서도 개념이해도점수 표시
        if (minimalDisplay && score) {
          return (
            <div className="flex items-center justify-end mt-auto pt-2">
              <ConceptScoreIcon
                score={score.totalScore}
                level={score.level}
                onClick={handleConceptScoreClick}
                className="flex-shrink-0 scale-75"
              />
            </div>
          );
        }
      })()}

      {isOpen && !minimalDisplay && (
        <div className="absolute inset-0 bg-gray-800/95 backdrop-blur-sm p-1 sm:p-2 lg:p-4 rounded-lg z-40 flex flex-col animate-fadeIn">
          {/* 헤더 - 최소화 */}
          <div className="flex justify-between items-center mb-0.5 lg:mb-1 px-1 sm:px-2 lg:px-0 flex-shrink-0">
            <h3 className="text-[10px] sm:text-xs lg:text-sm font-semibold text-cyan-400 truncate mr-1 sm:mr-2">기억 강화: {tabList.find(t => t.key === activeTabKey)?.label}</h3>
            <Button variant="ghost" size="icon" onClick={toggleEvolutionOverlay} className="text-gray-400 hover:text-white flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 lg:w-auto lg:h-auto p-1">
              <XMarkIcon className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5"/>
            </Button>
          </div>
          
          {/* 메인 작업 영역 - 최대화 */}
          <div className="flex-1 flex flex-col px-1 sm:px-2 lg:px-0 overflow-auto">
            <p className="text-[10px] sm:text-xs text-gray-300 mb-0.5 lg:mb-1 leading-tight flex-shrink-0">{prompts[tabKeys.indexOf(activeTabKey)]?.question}</p>
            <textarea
              ref={evolutionTextareaRef}
              value={fields[activeTabKey]}
              onChange={(e) => handleFieldChange(activeTabKey, e.target.value)}
              placeholder={prompts[tabKeys.indexOf(activeTabKey)]?.placeholder}
              className="w-full flex-1 p-1.5 sm:p-2 lg:p-2 text-[11px] sm:text-xs lg:text-sm bg-gray-700 border border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500 text-white resize-none tsnote-scrollbar min-h-24 sm:min-h-28 lg:min-h-32"
            />
          </div>

          {/* 컨트롤 영역 - 최소화 */}
          <div className="flex-shrink-0 mt-1 sm:mt-1.5 lg:mt-2 px-1 sm:px-2 lg:px-0">
            {/* 탭 인디케이터 */}
            <div className="flex justify-center mb-0.5 sm:mb-1 lg:mb-1">
              <div className="flex space-x-0.5 sm:space-x-1">
                {tabList.map((tab, index) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTabKey(tab.key as MemoEvolutionFieldKey)}
                    className={`w-1 h-1 sm:w-1.5 sm:h-1.5 lg:w-2 lg:h-2 rounded-full transition-all duration-200 ${activeTabKey === tab.key ? 'bg-cyan-500 scale-110' : 'bg-gray-600 hover:bg-gray-500'}`}
                    title={tab.label}
                  />
                ))}
              </div>
            </div>
            
            {/* 버튼 그룹 - 컴팩트 */}
            <div className="flex justify-between items-center gap-1 sm:gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handlePrevStep} 
                disabled={isSavingEvolution || tabKeys.indexOf(activeTabKey) === 0}
                className="text-gray-300 border-gray-600 hover:bg-gray-700 px-1.5 sm:px-2 py-0.5 sm:py-1 text-[11px] sm:text-xs h-5 sm:h-6 lg:h-auto"
                title="이전 단계"
              >
                <ChevronLeftIcon className="h-2 w-2 sm:h-2.5 sm:w-2.5 lg:h-3.5 lg:w-3.5 mr-0.5 sm:mr-1" />
                <span className="hidden sm:inline">이전</span>
              </Button>
              
              <Button 
                size="sm" 
                onClick={handleSaveEvolution} 
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-2 sm:px-2 py-0.5 sm:py-1 text-[11px] sm:text-xs h-5 sm:h-6 lg:h-auto"
                disabled={isSavingEvolution}
              >
                {isSavingEvolution ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-1 h-2 w-2 sm:h-2.5 sm:w-2.5 lg:h-3.5 lg:w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="hidden sm:inline">저장 중</span>
                    <span className="sm:hidden">저장</span>
                  </>
                ) : (
                  "완료"
                )}
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleNextStep} 
                disabled={isSavingEvolution || tabKeys.indexOf(activeTabKey) === tabKeys.length - 1}
                className="text-gray-300 border-gray-600 hover:bg-gray-700 px-1.5 sm:px-2 py-0.5 sm:py-1 text-[11px] sm:text-xs h-5 sm:h-6 lg:h-auto"
                title="다음 단계"
              >
                <span className="hidden sm:inline">다음</span>
                <ChevronRightIcon className="h-2 w-2 sm:h-2.5 sm:w-2.5 lg:h-3.5 lg:w-3.5 ml-0.5 sm:ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 유사 메모 미니 패널 */}
      {similarOpen && similarItems.length > 0 && !minimalDisplay && (
        <div className="absolute bottom-1 left-1 right-1 sm:bottom-2 sm:left-2 sm:right-2 bg-gray-900/95 border border-cyan-700/30 rounded-md p-2 z-30 shadow-xl">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs sm:text-sm text-cyan-300 font-semibold">유사 메모</span>
            <button className="text-xs text-gray-400 hover:text-white" onClick={(e)=>{e.stopPropagation(); setSimilarOpen(false);}}>닫기</button>
          </div>
          <ul className="space-y-1">
            {similarItems.map((it, idx) => (
              <li key={it._id || idx} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[11px] sm:text-xs text-gray-300 truncate" title={it.content}>{(it.content || '').slice(0,80)}</p>
                  {it.createdAt && (
                    <span className="text-[10px] text-gray-500">{new Date(it.createdAt).toLocaleDateString()}</span>
                  )}
                </div>
                <button
                  className="flex-shrink-0 text-[11px] sm:text-xs px-2 py-1 rounded bg-cyan-700 hover:bg-cyan-600 text-white"
                  onClick={(e)=>{
                    e.stopPropagation();
                    try {
                      const target = document.getElementById(`note-${it._id}`);
                      if (target) {
                        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        setSimilarOpen(false);
                      } else if (it.bookId) {
                        // 상세 페이지로 이동하되, 앵커를 붙여 정확히 해당 카드로 스크롤되게 함
                        window.location.href = `/books/${it.bookId}#note-${it._id}`;
                      }
                    } catch {}
                  }}
                >열기</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Source & Date overlay for minimalDisplay */}
      {minimalDisplay && (
        <>
          {bookTitle && (
            <span className="absolute bottom-1 left-1.5 sm:left-2 text-[8px] sm:text-[10px] text-gray-600 truncate max-w-[75%] sm:max-w-[80%] pointer-events-none">
              {bookTitle}
            </span>
          )}
          {(note.createdAt || note.clientCreatedAt) && (
            <span className="absolute bottom-1 right-1.5 sm:right-2 text-[8px] sm:text-[10px] text-gray-600 pointer-events-none">
              {formatNoteCreatedAt(note)}
            </span>
          )}
        </>
      )}

      {/* 개념이해도 점수 팝업 */}
      {score && !minimalDisplay && (
        <ConceptScorePopup
          score={score}
          isOpen={showConceptScorePopup}
          onClose={handleConceptScoreClose}
        />
      )}

      {/* PDF 풀스크린 오버레이 (포털) */}
      {showPdfPreview && (
        <PdfViewerOverlay
          isOpen={showPdfPreview}
          onClose={() => setShowPdfPreview(false)}
          bookId={note.bookId}
          initialPage={note.pageNumber || 1}
          title={bookTitle}
        />
      )}
    </div>
  );
} 