import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { AiOutlineQuestionCircle, AiOutlineInfoCircle } from 'react-icons/ai';
import { GiCutDiamond, GiRock } from 'react-icons/gi';
import { QuestionMarkCircleIcon, ArrowTopRightOnSquareIcon, LightBulbIcon, PhotoIcon, LinkIcon, SparklesIcon, ShoppingCartIcon, PencilSquareIcon, TagIcon, EllipsisVerticalIcon, BookOpenIcon as SolidBookOpenIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import api from '@/lib/api'; // Import the central api instance
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Import Dropdown components
import { Button } from '@/components/ui/button'; // Import Button for styling consistency

// Define the structure for a single related link
export interface RelatedLink {
  type: 'book' | 'paper' | 'youtube' | 'media' | 'website';
  url: string;
  reason?: string;
  _id?: string; // Optional: Mongoose might add an _id to subdocuments
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
  /** @property {boolean} [isArchived] - 노트가 보관된 상태인지 여부. */
  isArchived?: boolean;
  /** @property {boolean} [isTemporary] - 노트가 임시 상태인지 여부. */
  isTemporary?: boolean;
  /** @property {string} [originSession] - 노트가 생성된 TS 세션의 ID. */
  originSession?: string;
  // pageNum, sessionId 등 추가 필드가 백엔드 Note 모델에 있을 수 있으나, TSNoteCard에서 직접 사용되지 않으면 생략 가능.
}

// TS 세션 상세 정보 타입 (백엔드 ISession 모델 기반)
export interface TSSessionDetails {
  createdAtISO?: string;    // Session.createdAt (ISO 문자열로 변환된 값)
  durationSeconds?: number; // Session.durationSec
  startPage?: number;       // Session.startPage
  actualEndPage?: number;   // Session.actualEndPage
  targetPage?: number;      // Session.endPage (목표 종료 페이지로 사용)
  ppm?: number;             // Session.ppm
  book?: any;                // Added book from session data
}

// 목적별 4단계 질문/가이드/placeholder 매핑
// New questions and placeholders based on user feedback
const memoEvolutionPrompts: Record<string, Array<{ question: string; placeholder: string }>> = {
  exam_prep: [ // 시험/인증 대비
    { question: "이 내용을 읽을 때 어떤 상황이었나요?", placeholder: "예) 이동 중, 특정 문제 고민 중" },
    { question: "이 내용이 왜 중요하다고 생각했나요?", placeholder: "예) 새로운 아이디어, 문제 해결 실마리" },
    { question: "이 내용과 관련된 기존 지식은 무엇인가요?", placeholder: "예) 이전에 읽은 책, 경험" },
    { question: "이 내용을 어떻게 활용할 수 있을까요?", placeholder: "예) 업무 적용, 대화 주제" }
  ],
  practical_knowledge: [ // 실용적 지식 습득 및 적용
    { question: "이 내용을 읽을 때 어떤 상황이었나요?", placeholder: "예) 이동 중, 특정 문제 고민 중" },
    { question: "이 내용이 왜 중요하다고 생각했나요?", placeholder: "예) 새로운 아이디어, 문제 해결 실마리" },
    { question: "이 내용과 관련된 기존 지식은 무엇인가요?", placeholder: "예) 이전에 읽은 책, 경험" },
    { question: "이 내용을 어떻게 활용할 수 있을까요?", placeholder: "예) 업무 적용, 대화 주제" }
  ],
  humanities_self_reflection: [ // 인문학적 성찰 및 자기 계발
    { question: "이 내용을 읽을 때 어떤 상황이었나요?", placeholder: "예) 이동 중, 특정 문제 고민 중" },
    { question: "이 내용이 왜 중요하다고 생각했나요?", placeholder: "예) 새로운 아이디어, 문제 해결 실마리" },
    { question: "이 내용과 관련된 기존 지식은 무엇인가요?", placeholder: "예) 이전에 읽은 책, 경험" },
    { question: "이 내용을 어떻게 활용할 수 있을까요?", placeholder: "예) 업무 적용, 대화 주제" }
  ],
  reading_pleasure: [ // 독서 자체의 즐거움 추구
    { question: "이 내용을 읽을 때 어떤 상황이었나요?", placeholder: "예) 이동 중, 특정 문제 고민 중" },
    { question: "이 내용이 왜 중요하다고 생각했나요?", placeholder: "예) 새로운 아이디어, 문제 해결 실마리" },
    { question: "이 내용과 관련된 기존 지식은 무엇인가요?", placeholder: "예) 이전에 읽은 책, 경험" },
    { question: "이 내용을 어떻게 활용할 수 있을까요?", placeholder: "예) 업무 적용, 대화 주제" }
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
   * - (선택적) 플래시카드 변환 버튼 클릭 시 호출되는 콜백 함수입니다.
   *   해당 노트 객체를 인자로 전달하여 부모 컴포넌트에서 플래시카드 생성 로직을 처리하도록 합니다.
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
const formatSessionCreatedAt = (isoString?: string): string => {
  if (!isoString) return '정보 없음';
  const date = new Date(isoString);
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
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
 * @description 1줄 메모(노트)를 표시하고, 메모 진화(4단계 질문 답변), 플래시카드 변환, 관련 링크 관리,
 *              지식 카트 담기 등의 기능을 제공하는 핵심 UI 컴포넌트입니다.
 * @param {TSNoteCardProps} props - 컴포넌트가 받는 프롭들.
 */
export default function TSNoteCard({ 
  note: initialNote,
  onUpdate,
  onFlashcardConvert,
  onRelatedLinks,
  readingPurpose,
  sessionDetails,
  onAddToCart,
  isAddedToCart,
  className,
  showActions = true,
  minimalDisplay = false,
  bookTitle,
  isPageEditing = true,
}: TSNoteCardProps) {
  const [note, setNote] = useState<TSNote>(initialNote);
  const [isMemoEvolutionModalOpen, setIsMemoEvolutionModalOpen] = useState(false); 
  const [isMemoEvolutionEditing, setIsMemoEvolutionEditing] = useState(false);
  const [memoEvolutionContentExists, setMemoEvolutionContentExists] = useState(false);

  const tabList = useMemo(() => [
    { key: 'momentContext', label: '읽던 순간' },
    { key: 'importanceReason', label: '중요 이유' },
    { key: 'relatedKnowledge', label: '관련 지식' },
    { key: 'mentalImage', label: '실행' },
  ], []);

  const tabKeys = useMemo(() => tabList.map(t => t.key as MemoEvolutionFieldKey), [tabList]);
  type MemoEvolutionFieldKey = 'momentContext' | 'importanceReason' | 'relatedKnowledge' | 'mentalImage';

  const [activeTab, setActiveTab] = useState<MemoEvolutionFieldKey>(tabKeys[0]);
  
  // Holds the current values in the form fields
  const [fields, setFields] = useState<Record<MemoEvolutionFieldKey, string>>(() => {
    const setup: Partial<Record<MemoEvolutionFieldKey, string>> = {};
    for (const key of tabKeys) {
      setup[key] = (initialNote[key] as string | undefined) || '';
    }
    return setup as Record<MemoEvolutionFieldKey, string>;
  });

  // Holds the values of the fields when the modal was opened or last saved
  const [fieldsAtModalOpen, setFieldsAtModalOpen] = useState<Record<MemoEvolutionFieldKey, string>>(fields);

  // Effect to sync 'fields' and 'fieldsAtModalOpen' when 'initialNote' (prop) changes
  useEffect(() => {
    const newFieldsFromProp: Record<MemoEvolutionFieldKey, string> = {} as Record<MemoEvolutionFieldKey, string>;
    let contentFound = false;
    for (const key of tabKeys) {
      const value = (initialNote[key] as string | undefined) || '';
      newFieldsFromProp[key] = value;
      if (typeof value === 'string' && value.trim() !== '') {
        contentFound = true;
      }
    }
    setFields(newFieldsFromProp);
    setMemoEvolutionContentExists(contentFound);
    // If modal is not open, also reset the baseline for "cancel"
    if (!isMemoEvolutionModalOpen) {
      setFieldsAtModalOpen(newFieldsFromProp);
    }
  }, [initialNote, tabKeys, isMemoEvolutionModalOpen]);
  
  const [isHoveringInfo, setIsHoveringInfo] = useState(false);
  const [isHoveringCard, setIsHoveringCard] = useState(false);
  const [showSessionDetailsPopover, setShowSessionDetailsPopover] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const evolutionTextareaRef = useRef<HTMLTextAreaElement>(null);

  const prompts = memoEvolutionPrompts[readingPurpose as keyof typeof memoEvolutionPrompts] || memoEvolutionPrompts['humanities_self_reflection'];
  
  const currentPromptDetails = useMemo(() => {
    const currentIndex = tabKeys.indexOf(activeTab);
    return prompts[currentIndex];
  }, [activeTab, prompts, tabKeys]);

  const handleOpenMemoEvolutionModal = useCallback(() => {
    const currentFieldsFromNoteState: Record<MemoEvolutionFieldKey, string> = {} as Record<MemoEvolutionFieldKey, string>;
    let contentCurrentlyExists = false;
    for (const key of tabKeys) {
      const value = (note[key] as string | undefined) || '';
      currentFieldsFromNoteState[key] = value;
      if (typeof value === 'string' && value.trim() !== '') {
        contentCurrentlyExists = true;
      }
    }
    setFields(currentFieldsFromNoteState);
    setFieldsAtModalOpen(currentFieldsFromNoteState); // Set baseline for this modal session
    setMemoEvolutionContentExists(contentCurrentlyExists);
    setActiveTab(tabKeys[0]);

    if (contentCurrentlyExists) {
      setIsMemoEvolutionEditing(false);
    } else {
      setIsMemoEvolutionEditing(true);
    }
    setIsMemoEvolutionModalOpen(true);
  }, [note, tabKeys]);

  const handleCloseMemoEvolutionModal = useCallback(() => {
    setIsMemoEvolutionModalOpen(false);
    setIsMemoEvolutionEditing(false);
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    const changesToApply: Partial<Pick<TSNote, MemoEvolutionFieldKey>> = {};
    let hasChanges = false;

    for (const key of tabKeys) {
      if (fields[key] !== fieldsAtModalOpen[key]) {
        changesToApply[key] = fields[key];
        hasChanges = true;
      }
    }

    if (hasChanges) {
      try {
        await api.patch(`/notes/${note._id}/memo-evolution`, changesToApply);
        
        setNote(prevNote => ({
            ...prevNote,
            ...changesToApply,
            lastDeepDiveDate: new Date().toISOString()
        }));
        
        // Update fieldsAtModalOpen to the new saved state for subsequent cancels/saves in the same modal session
        setFieldsAtModalOpen(fields);

        onUpdate?.(changesToApply as Partial<TSNote>);
        
        setMemoEvolutionContentExists(true);
        setIsMemoEvolutionEditing(false); 
      } catch (error) {
        console.error("Failed to save note evolution:", error);
      } finally {
        setIsSaving(false);
      }
    } else {
      setIsMemoEvolutionEditing(false); 
      setIsSaving(false);
    }
  }, [fields, fieldsAtModalOpen, note, onUpdate, tabKeys]);

  const handleCancelEdit = useCallback(() => {
    setFields(fieldsAtModalOpen); 
    setIsMemoEvolutionEditing(false);
    if (!memoEvolutionContentExists) { 
        setIsMemoEvolutionModalOpen(false);
    }
  }, [fieldsAtModalOpen, memoEvolutionContentExists]);

  const handleChange = (key: MemoEvolutionFieldKey, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };
  
  const handleNext = useCallback(() => {
    const currentIndex = tabKeys.indexOf(activeTab);
    if (currentIndex < tabKeys.length - 1) {
      setActiveTab(tabKeys[currentIndex + 1]);
    } else {
      setActiveTab(tabKeys[0]); 
    }
  }, [activeTab, tabKeys]);

  const handlePrev = useCallback(() => {
    const currentIndex = tabKeys.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabKeys[currentIndex - 1]);
    } else {
      setActiveTab(tabKeys[tabKeys.length - 1]);
    }
  }, [activeTab, tabKeys]);

  useEffect(() => {
    if (isMemoEvolutionEditing && evolutionTextareaRef.current) {
      evolutionTextareaRef.current.style.height = 'auto';
      evolutionTextareaRef.current.style.height = `${evolutionTextareaRef.current.scrollHeight}px`;
    }
  }, [fields[activeTab], isMemoEvolutionEditing, activeTab]);

  const displaySessionCreatedAt = sessionDetails?.createdAtISO ? formatSessionCreatedAt(sessionDetails.createdAtISO) : '세션 정보 없음';
  const displaySessionDuration = sessionDetails?.durationSeconds !== undefined ? formatSessionDuration(sessionDetails.durationSeconds) : '';
  const displaySessionPageProgress = (sessionDetails?.startPage !== undefined || sessionDetails?.actualEndPage !== undefined || sessionDetails?.targetPage !== undefined) 
                                    ? formatSessionPageProgress(sessionDetails.startPage, sessionDetails.actualEndPage, sessionDetails.targetPage) 
                                    : '';
  const displayPPM = sessionDetails?.ppm !== undefined ? formatPPM(sessionDetails.ppm) : '';

  const renderSessionInfoButton = () => (
    <button
      onMouseEnter={() => setShowSessionDetailsPopover(true)}
      onMouseLeave={() => setShowSessionDetailsPopover(false)}
      className={`absolute bottom-2 left-2 z-30 p-1.5 rounded-full bg-gray-700/70 hover:bg-cyan-600/90
                  text-gray-300 hover:text-white transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-cyan-500`}
      aria-label="TS 세션 정보 보기"
    >
      <AiOutlineInfoCircle className="h-4 w-4" />
    </button>
  );

  const renderSessionInfoPopover = () => (
    <div 
      className={`transition-opacity duration-200 ease-in-out ${showSessionDetailsPopover ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                 absolute bottom-10 left-2 w-auto max-w-xs bg-gray-900/90 backdrop-blur-md p-3 rounded-lg
                 text-xs text-gray-200 z-20 shadow-xl border border-gray-700/50`}
    >
      <h4 className={`font-semibold mb-1.5 text-cyan-400 border-b border-cyan-400/30 pb-1`}>TS 세션 정보</h4>
      {sessionDetails?.createdAtISO && <p className="mt-1">기록일: {displaySessionCreatedAt}</p>}
      {sessionDetails?.durationSeconds !== undefined && <p>집중 시간: {displaySessionDuration}</p>}
      {sessionDetails && (sessionDetails.startPage !== undefined || sessionDetails.actualEndPage !== undefined) && (
        <p>페이지: {displaySessionPageProgress}</p>
      )}
      {sessionDetails?.ppm !== undefined && <p>독서 속도: {displayPPM}</p>}
      {(!sessionDetails || Object.keys(sessionDetails).length === 0) && <p className="text-gray-400 italic">세션 정보가 없습니다.</p>}
    </div>
  );
  
  const renderBookSource = () => {
    if (!bookTitle) return null;
    return (
      <div className="mt-1 mb-2 text-xs text-gray-400 flex items-center">
        <SolidBookOpenIcon className="h-3.5 w-3.5 mr-1.5 text-cyan-500 flex-shrink-0" />
        출처: <span className="font-medium text-gray-300 ml-1 truncate" title={bookTitle}>{bookTitle}</span>
      </div>
    );
  };

  // "메모 진화" 내용을 조회 모드에서 표시하는 함수
  const renderMemoEvolutionDetails = () => {
    if (isMemoEvolutionModalOpen || isPageEditing || minimalDisplay) {
      return null;
    }

    const evolutionFieldsToShow: { key: MemoEvolutionFieldKey; label: string }[] = tabList
      .map(tab => ({ key: tab.key as MemoEvolutionFieldKey, label: tab.label }));

    const details = evolutionFieldsToShow
      .map(field => {
        const value = (note[field.key as MemoEvolutionFieldKey] as string | undefined);
        if (value && typeof value === 'string' && value.trim() !== '') {
          return (
            <div key={field.key} className="mb-3">
              <h4 className="text-sm font-semibold text-cyan-500 mb-0.5">{field.label}</h4>
              <p className="text-sm text-gray-200 whitespace-pre-wrap break-words">
                {value}
              </p>
            </div>
          );
        }
        return null;
      })
      .filter(Boolean);

    if (details.length === 0) {
      return null;
    }

    return (
      <div className="mt-4 pt-3 border-t border-gray-700/50">
        <h4 className="text-xs font-semibold text-gray-400 mb-2">
          메모 진화 내용:
        </h4>
        {details}
      </div>
    );
  };

  return (
    <div 
      className={`relative group ${cyberTheme.cardBg} p-4 rounded-lg shadow-md border ${cyberTheme.cardBorder} ${className} ${minimalDisplay ? 'min-h-0' : 'min-h-[180px]'} transition-all duration-200 hover:shadow-xl hover:border-cyan-500/70 w-full`}
      onMouseEnter={() => setIsHoveringCard(true)}
      onMouseLeave={() => setIsHoveringCard(false)}
    >
      {sessionDetails && !minimalDisplay && (
        <>
          {renderSessionInfoButton()}
          {renderSessionInfoPopover()}
        </>
      )}
      
      <div 
        className="relative flex flex-col h-full"
      >
        {/* 1. 강조된 note.content 인용 블록 */}
        <div className="mb-3 border-l-4 border-cyan-400 pl-4 py-3">
          <p className="text-xl font-medium text-gray-100 leading-relaxed whitespace-pre-wrap break-words">
            {note.content}
          </p>
        </div>

        {/* 2. 출처 정보 */}
        {!minimalDisplay && renderBookSource()}
        
        {/* 3. Render memo evolution details in view mode */}
        {renderMemoEvolutionDetails()}

        {/* 4. 태그 목록 */}
        {!minimalDisplay && note.tags && note.tags.length > 0 && (
          <div className="mb-3 mt-1 flex flex-wrap gap-1.5">
            {note.tags.map((tag, index) => (
              <span
                key={index}
                className={`px-2 py-0.5 text-xs rounded-full ${cyberTheme.tagBg} ${cyberTheme.tagText} flex items-center`}
              >
                <TagIcon className="h-3 w-3 mr-1" />
                {tag}
              </span>
            ))}
          </div>
        )}
        
        {showActions && !minimalDisplay && (
          <div className="flex items-center justify-end space-x-2 mt-auto pt-2 border-t border-gray-700/50">
            {onAddToCart && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => onAddToCart(note._id, note.bookId)}
                title={isAddedToCart ? "단권화 노트에서 제거" : "단권화 노트에 담기"}
                className={`${isAddedToCart ? 'border-green-500 text-green-500 hover:bg-green-500/10' : cyberTheme.buttonOutlineBorder + ' ' + cyberTheme.buttonOutlineText + ' ' + cyberTheme.buttonOutlineHoverBg }`}
              >
                <ShoppingCartIcon className={`h-4 w-4 ${isAddedToCart ? 'text-green-500' : ''}`} />
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="px-2">
                  <EllipsisVerticalIcon className={`h-5 w-5 text-gray-400 hover:${cyberTheme.primaryText}`} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className={`${cyberTheme.menuBg} border-${cyberTheme.menuBorder}`}>
                <DropdownMenuItem onClick={handleOpenMemoEvolutionModal} className={`${cyberTheme.menuItemHover} ${cyberTheme.primaryText}`}>
                  <SparklesIcon className={`h-4 w-4 mr-2 ${cyberTheme.primaryText}`} /> 메모 진화
                </DropdownMenuItem>
                {onFlashcardConvert && (
                  <DropdownMenuItem onClick={() => onFlashcardConvert(note)} className={`${cyberTheme.menuItemHover} ${cyberTheme.primaryText}`}>
                    <GiCutDiamond className={`h-4 w-4 mr-2 ${cyberTheme.primaryText}`} /> 플래시카드 변환
                  </DropdownMenuItem>
                )}
                {onRelatedLinks && (
                  <DropdownMenuItem onClick={() => onRelatedLinks(note)} className={`${cyberTheme.menuItemHover} ${cyberTheme.primaryText}`}>
                    <LinkIcon className={`h-4 w-4 mr-2 ${cyberTheme.primaryText}`} /> 관련 링크 관리
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {isMemoEvolutionModalOpen && !minimalDisplay && (
        <div className="absolute inset-0 bg-gray-800/95 backdrop-blur-sm p-4 rounded-lg z-20 flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-cyan-400">
              메모 진화: {tabList.find(t => t.key === activeTab)?.label}
            </h3>
            <Button variant="ghost" size="sm" onClick={handleCloseMemoEvolutionModal} className="text-gray-400 hover:text-white">✕</Button>
          </div>
          
          {isMemoEvolutionEditing ? (
            // EDIT MODE UI
            <>
              <div className="flex-grow overflow-y-auto pr-2">
                <p className="text-sm text-gray-300 mb-1">{currentPromptDetails?.question}</p>
                <textarea
                  ref={evolutionTextareaRef}
                  value={fields[activeTab]}
                  onChange={(e) => handleChange(activeTab, e.target.value)}
                  placeholder={currentPromptDetails?.placeholder}
                  className="w-full min-h-[80px] p-2 text-sm bg-gray-700 border border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500 text-white resize-none overflow-hidden"
                  rows={3} // Initial rows, auto-resize will adjust
                />
                {/* 관련 링크 표시는 뷰 모드에서 하거나, 에디트 모드에서도 필요하다면 추가 */}
              </div>
              <div className="mt-3 flex justify-between items-center">
                <div className="flex space-x-1">
                  {tabList.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as MemoEvolutionFieldKey)}
                      className={`w-3 h-3 rounded-full ${activeTab === tab.key ? 'bg-cyan-500' : 'bg-gray-600 hover:bg-gray-500'}`}
                      title={tab.label}
                    />
                  ))}
                </div>
                <div className="space-x-2">
                  <Button variant="outline" size="sm" onClick={handleCancelEdit} disabled={isSaving}>
                    취소
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleSave} 
                    className="bg-cyan-600 hover:bg-cyan-700 text-white min-w-[80px]"
                    disabled={isSaving}
                  >
                    {isSaving ? "저장 중..." : "저장"}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            // VIEW MODE UI
            <>
              <div className="flex-grow overflow-y-auto pr-2">
                {tabList.map(tab => (
                  fields[tab.key as MemoEvolutionFieldKey] && ( // Only show if there's content
                    <div key={tab.key} className="mb-3">
                      <h4 className="text-sm font-semibold text-cyan-500 mb-0.5">{tab.label}</h4>
                      <p className="text-sm text-gray-200 whitespace-pre-wrap break-words">
                        {fields[tab.key as MemoEvolutionFieldKey]}
                      </p>
                    </div>
                  )
                ))}
                {!memoEvolutionContentExists && (
                    <p className="text-sm text-gray-400 italic text-center py-4">진화시킬 내용이 아직 없습니다. 수정을 눌러 작성을 시작하세요.</p>
                )}
              </div>
              <div className="mt-3 flex justify-end items-center">
                 <Button 
                    size="sm" 
                    onClick={() => setIsMemoEvolutionEditing(true)} 
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    수정
                  </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
} 