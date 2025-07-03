import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AiOutlineQuestionCircle, AiOutlineInfoCircle } from 'react-icons/ai';
import { GiCutDiamond, GiRock } from 'react-icons/gi';
import { QuestionMarkCircleIcon, ArrowTopRightOnSquareIcon, LightBulbIcon, PhotoIcon, LinkIcon, SparklesIcon, ShoppingCartIcon, PencilSquareIcon, TagIcon, EllipsisVerticalIcon, BookOpenIcon as SolidBookOpenIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { XMarkIcon } from '@heroicons/react/24/outline';
import api from '@/lib/api'; // Import the central api instance
import AiCoachPopover from '../common/AiCoachPopover';
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
const memoEvolutionPrompts: Record<string, Array<{ question: string; placeholder: string }>> = {
  exam_prep: [
    { question: '어떤 부분이 중요하나 느껴졌나요?', placeholder: '(예: 핵심 개념, 빈출 공식)' },
    { question: '처음 봤을 때, 어떤 느낌이 들었나요?', placeholder: '(예: 용어가 생소함, 공식 유도 과정)' },
    { question: '기존의 어떤 지식이 연상되나요?', placeholder: '(예: 특정 책, 인물, 영상)' },
    { question: '표현할 수 방법은 무엇인가요?', placeholder: '(예: 마인드맵, 차트, 표)' },
  ],
  practical_knowledge: [
    { question: '어떻게 내 업무와 연결되나요?', placeholder: '(예: 특정 문제 해결, 프로세스 개선)' },
    { question: '이 것을 몰라 불편했던 경험이 있나요?', placeholder: '(예: 버그 해결 중, 보고서 작성 시)' },
    { question: '이 메모는 어떤 나의 경험/지식과 연상시키나요?', placeholder: '(예: 특정 책, 인물, 영상)' },
    { question: '이 것의 핵심을 한 문장으로 설명해 본다면?', placeholder: '(예: \'이 건 우리가 알고 있는 피라미드와 비슷해요\')' },
  ],
  humanities_self_reflection: [
    { question: '이 메모, 어떤 감정/생각을 불러일으켰나요?', placeholder: '(예: 특정 감정, 떠오른 질문)' },
    { question: '메모를 적던 당시 상황은 무엇을 떠올리게 하나요?', placeholder: '(예: 특정 장소, 인물, 경험)' },
    { question: '이 메모, 어떤 다른 지식을 연상시키나요?', placeholder: '(예: 책, 영화, 역사적 사건)' },
    { question: '이 메모의 내용을 한 폭의 그림이나 장면으로 묘사한다면?', placeholder: '(예: \'노을 지는 바다를 혼자 보는 모습\')' },
  ],
  reading_pleasure: [
    { question: '이 메모, 어떤 점이 가장 흥미로웠나요?', placeholder: '(예: 반전, 문체, 대사의 맛)' },
    { question: '이 구절을 읽을 때, 어떤 기분이었나요?', placeholder: '(예: 짜릿함, 평온함, 슬픔, 웃음)' },
    { question: '이 메모의 즐거움, 어떤 다른 작품/경험을 떠올리게 하나요?', placeholder: '(예: 영화 A의 한 장면, 어릴 적 놀이공원 갔던 경험)' },
    { question: '책 속의 어떤 장면이 머릿속에 생생하게 그려졌나요?', placeholder: '(예: 인물의 표정, 배경 묘사, 분위기)' },
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
  /** @property {boolean} [enableOverlayEvolutionMode] - (선택적) 오버레이 진화 모드를 활성화할지 여부 */
  enableOverlayEvolutionMode?: boolean;
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
 * @description 1줄 메모(노트)를 표시하고, 메모 진화(4단계 질문 답변), 플래시카드 변환, 관련 링크 관리,
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
}: TSNoteCardProps) {
  const [note, setNote] = useState(initialNote);
  const [isOpen, setIsOpen] = useState(false); // 오버레이 UI 표시 상태
  const [isInlineEditing, setIsInlineEditing] = useState(false); // 새로운 상태: 인라인 편집 활성화 여부

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
  const [showSessionDetailsPopover, setShowSessionDetailsPopover] = useState(false);
  const [isSavingEvolution, setIsSavingEvolution] = useState(false);
  const evolutionTextareaRef = useRef<HTMLTextAreaElement>(null);

  const tabList = [
    { key: 'importanceReason', label: '적은 이유' },
    { key: 'momentContext', label: '적었던 당시 상황' },
    { key: 'relatedKnowledge', label: '연상된 지식' },
    { key: 'mentalImage', label: '떠오른 장면' },
  ];
  
  const prompts = memoEvolutionPrompts[readingPurpose as keyof typeof memoEvolutionPrompts] || memoEvolutionPrompts['humanities_self_reflection'];

  useEffect(() => {
    setNote(initialNote);
    setFields({
      importanceReason: initialNote.importanceReason || '',
      momentContext: initialNote.momentContext || '',
      relatedKnowledge: initialNote.relatedKnowledge || '',
      mentalImage: initialNote.mentalImage || '',
    });
    // 페이지 전체 편집 모드가 비활성화되거나, 오버레이 모드가 활성화되면
    // 개별 카드의 인라인 편집 상태도 초기화 (비활성화)합니다.
    // 또한, initialNote가 변경될 때도 isInlineEditing을 false로 초기화할 수 있습니다. (선택적)
    if (!isPageEditing || enableOverlayEvolutionMode) {
      setIsInlineEditing(false);
    }
  }, [initialNote, isPageEditing, enableOverlayEvolutionMode]);

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
        await onUpdate(changedFields);
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
    setFields((prev) => ({ ...prev, [key]: value }));
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
                                    ? formatSessionPageProgress(sessionDetails.startPage, sessionDetails.actualEndPage, sessionDetails.targetPage) 
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
                  focus:outline-none focus:ring-2 focus:ring-cyan-500`}
      aria-label="TS 세션 정보"
    >
      <AiOutlineInfoCircle className="h-4 w-4" />
    </button>
  );

  const renderSessionInfoPopover = () => (
    <div 
      className={`transition-opacity duration-200 ease-in-out ${showSessionDetailsPopover ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                 absolute bottom-10 left-2 w-auto max-w-[280px] sm:max-w-xs bg-gray-900/90 backdrop-blur-md p-3 rounded-lg
                 text-xs text-gray-200 z-20 shadow-xl border border-gray-700/50`}
    >
      <h4 className={`font-semibold mb-1.5 text-cyan-400 border-b border-cyan-400/30 pb-1`}>TS 세션</h4>
      {sessionDetails?.createdAtISO && <p className="mt-1 truncate" title={`기록일: ${displaySessionCreatedAt}`}>기록일: {displaySessionCreatedAt}</p>}
      {sessionDetails?.durationSeconds !== undefined && <p className="truncate" title={`읽은 시간: ${displaySessionDuration}`}>읽은 시간: {displaySessionDuration}</p>}
      {sessionDetails && (sessionDetails.startPage !== undefined || sessionDetails.actualEndPage !== undefined) && (
        <p className="truncate" title={`페이지: ${displaySessionPageProgress}`}>페이지: {displaySessionPageProgress}</p>
      )}
      {sessionDetails?.ppm !== undefined && <p className="truncate" title={`읽은 속도: ${displayPPM}`}>읽은 속도: {displayPPM}</p>}
      {(!sessionDetails || Object.keys(sessionDetails).length === 0) && <p className="text-gray-400 italic">세션 정보가 없습니다.</p>}
    </div>
  );
  
  const renderInlineMemoEvolutionEditUI = () => {
    // 오버레이 모드이거나, 최소 표시거나, 이 카드가 인라인 편집 상태가 아니면 null (isPageEditing 조건 제거)
    if (enableOverlayEvolutionMode || minimalDisplay || !isInlineEditing) return null;

    return (
      <div className="mt-4 pt-3 border-t border-gray-700/50 space-y-2 sm:space-y-3">
        <h4 className="text-xs font-semibold text-gray-400 mb-2">
          메모 진화 (인라인 편집 중):
        </h4>
        {tabKeys.map((fieldKey, index) => (
          <div key={fieldKey}>
            <label htmlFor={`evolution-${fieldKey}-${note._id}`} className="block text-xs sm:text-sm font-medium text-cyan-500 mb-1">
              {prompts[index]?.question || fieldKey}
            </label>
            <textarea
              id={`evolution-${fieldKey}-${note._id}`}
              value={fields[fieldKey]}
              onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
              onBlur={() => {
                if (fields[fieldKey] !== (note[fieldKey] || '')) {
                  if (onUpdate) {
                    onUpdate({ _id: note._id, [fieldKey]: fields[fieldKey] });
                  }
                }
              }}
              placeholder={prompts[index]?.placeholder || '내용 입력'}
              rows={1.5}
              className="w-full p-2 text-xs sm:text-sm bg-gray-700 border border-gray-600 rounded-md focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 h-auto resize-none text-gray-200 custom-scrollbar"
            />
          </div>
        ))}
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
      { key: 'importanceReason', label: '작성한 이유' },
      { key: 'momentContext', label: '작성한 당시 상황' },
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
              <p className="text-sm text-gray-300 whitespace-pre-wrap break-words">{value}</p>
            </div>
          );
        }
        return null;
      })
      .filter(Boolean);

    if (details.length === 0) {
      return (
        <div className="mt-4 pt-3 border-t border-gray-700/50">
           <p className="text-xs text-gray-500 italic">아직 작성된 메모 진화가 없군요. 조금 남겨 두시겠어요?</p>
        </div>
      );
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
      className={cn(
        "relative p-2 sm:p-4 rounded-lg shadow-md transition-all duration-300 ease-in-out min-h-[120px] flex flex-col justify-between",
        (isOpen && enableOverlayEvolutionMode) || (isInlineEditing && isPageEditing && !enableOverlayEvolutionMode) ? "ring-2 ring-cyan-500 bg-gray-800" : "bg-gray-800/60 hover:bg-gray-700/80",
        minimalDisplay ? "p-2 sm:p-3 min-h-0" : "",
        className
      )}
      onClick={handleCardClick}
    >
      {!minimalDisplay && sessionDetails && Object.keys(sessionDetails).length > 0 && ( 
        <>
          {renderSessionInfoButton()}
          {renderSessionInfoPopover()}
        </>
      )}

      <div className="flex-grow mb-2">
        <p
          className={cn(
            "text-base sm:text-lg leading-relaxed whitespace-pre-wrap break-words break-all font-medium",
            isPageEditing || (isOpen && enableOverlayEvolutionMode) || minimalDisplay ? 'text-gray-300' : 'text-white',
            // 인라인 편집 중이 아닐 때만 왼쪽 border 적용 (또는 isPageEditing && !isInlineEditing 조건 추가)
            !isPageEditing && !(isOpen && enableOverlayEvolutionMode) && !minimalDisplay && !isInlineEditing ? 'border-l-4 border-cyan-600 pl-2 sm:pl-3 py-1' : 'py-1'
          )}
        >
          {note.content}
        </p>

        {/* 책 제목(출처) 표시 조건을 수정 */}
        <div className={cn("mt-2 text-xs text-gray-400 flex items-center min-w-0", {
          "invisible": isInlineEditing || !bookTitle || minimalDisplay || isOpen || isPageEditing
        })}>
            <SolidBookOpenIcon className="h-3 w-3 mr-1 sm:mr-1.5 text-gray-500 flex-shrink-0" />
            <span className="truncate" title={`출처: ${displayBookTitle}`}>
              출처: {displayBookTitle}
            </span>
        </div>
        
        <div className="grid">
          {/* Summary View - always rendered, visibility toggled */}
          <div
            className={cn(
              "transition-opacity duration-300 col-start-1 row-start-1",
              isInlineEditing ? "opacity-0 pointer-events-none" : "opacity-100"
            )}
            aria-hidden={isInlineEditing}
          >
            {renderMemoEvolutionSummary()}
          </div>

          {/* Edit View - always rendered, visibility toggled */}
          <div
            className={cn(
              "transition-opacity duration-300 col-start-1 row-start-1",
              isInlineEditing ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
            aria-hidden={!isInlineEditing}
          >
            {renderInlineMemoEvolutionEditUI()}
          </div>
        </div>

      </div>
      
      <div className={cn("mt-3 pt-2 border-t border-gray-700/50", {
        "invisible": isInlineEditing || !note.relatedLinks || note.relatedLinks?.length === 0 || minimalDisplay || isOpen || isPageEditing
      })}>
        <h4 className="text-xs font-semibold text-gray-400 mb-1.5 flex items-center">
          <LinkIcon className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5 text-gray-500" />
          지식 연결
        </h4>
        <ul className="space-y-1">
          {note.relatedLinks?.map((link, idx) => (
            <li key={link._id || idx} className="flex items-center text-xs text-gray-300 hover:text-cyan-400 transition-colors duration-150 min-w-0">
              <ArrowTopRightOnSquareIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 sm:mr-1.5 flex-shrink-0 text-gray-500" />
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="line-clamp-1 min-w-0"
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

      {!minimalDisplay && note.tags && note.tags.length > 0 && (
        <div className="mt-3 pt-2 border-t border-gray-700/50">
          <h4 className="text-xs font-semibold text-gray-400 mb-1.5 flex items-center">
            <TagIcon className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5 text-gray-500" />
            태그
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {note.tags.map((tag, index) => (
              <span
                key={index}
                className={`px-1.5 py-0.5 sm:px-2 sm:py-0.5 text-xs rounded-full ${cyberTheme.tagBg} ${cyberTheme.tagText} flex items-center max-w-[100px] sm:max-w-[120px]`}
                onClick={(e) => e.stopPropagation()}
                data-no-toggle
                title={tag}
              >
                <TagIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1 flex-shrink-0" />
                <span className="truncate">{tag}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {(() => {
        // --- DEBUG LOG START ---
        const shouldRenderActions = showActions && !minimalDisplay;
        if (shouldRenderActions) {
          return (
            <div className="flex items-center justify-end space-x-2 sm:space-x-2 mt-auto pt-2 border-t border-gray-700/50">
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
                  className={`h-9 w-9 sm:h-8 sm:w-8 ${isAddedToCart ? 'border-green-500 text-green-500 hover:bg-green-500/10' : cyberTheme.buttonOutlineBorder + ' ' + cyberTheme.buttonOutlineText + ' ' + cyberTheme.buttonOutlineHoverBg }`}
                  data-no-toggle
                >
                  <ShoppingCartIcon className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${isAddedToCart ? 'text-green-500' : ''}`} />
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="px-1.5 sm:px-2 h-9 w-9 sm:h-8 sm:w-8" data-no-toggle onClick={(e) => e.stopPropagation()}>
                    <EllipsisVerticalIcon className={`h-4 w-4 text-gray-400 hover:${cyberTheme.primaryText}`} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className={`${cyberTheme.menuBg} border-${cyberTheme.menuBorder}`}>
                  {/* "메모 진화" 메뉴 항목 조건 변경: 항상 표시하되 모드에 따라 텍스트만 다르게 */}
                  <DropdownMenuItem 
                    onClick={toggleEvolutionOverlay} 
                    className={`${cyberTheme.menuItemHover} ${cyberTheme.primaryText} text-xs sm:text-sm`}
                  >
                    <SparklesIcon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 ${cyberTheme.primaryText}`} /> 
                    메모 진화
                  </DropdownMenuItem>
                  
                  {/* 기존의 인라인 편집 시작/종료 메뉴는 제거 (중복 방지) */}
                  
                  {onFlashcardConvert && (
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onFlashcardConvert(note); }} className={`${cyberTheme.menuItemHover} ${cyberTheme.primaryText} text-xs sm:text-sm`}>
                      <GiCutDiamond className={`h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 ${cyberTheme.primaryText}`} /> 플래시카드
                    </DropdownMenuItem>
                  )}
                  {onRelatedLinks && (
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onRelatedLinks(note); }} className={`${cyberTheme.menuItemHover} ${cyberTheme.primaryText} text-xs sm:text-sm`}>
                      <LinkIcon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 ${cyberTheme.primaryText}`} /> 지식 연결
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        }
      })()}

      {isOpen && !minimalDisplay && (
        <div className="absolute inset-0 bg-gray-800/95 backdrop-blur-sm p-1 lg:p-4 rounded-lg z-20 flex flex-col animate-fadeIn">
          {/* 헤더 - 최소화 */}
          <div className="flex justify-between items-center mb-1 lg:mb-2 px-2 lg:px-0 flex-shrink-0">
            <h3 className="text-sm lg:text-lg font-semibold text-cyan-400 truncate mr-2">메모 진화: {tabList.find(t => t.key === activeTabKey)?.label}</h3>
            <Button variant="ghost" size="icon" onClick={toggleEvolutionOverlay} className="text-gray-400 hover:text-white flex-shrink-0 w-8 h-8 lg:w-auto lg:h-auto p-1">
              <XMarkIcon className="h-4 w-4 lg:h-5 lg:w-5"/>
            </Button>
          </div>
          
          {/* 메인 작업 영역 - 최대화 */}
          <div className="flex-1 flex flex-col px-2 lg:px-0 overflow-hidden">
            <p className="text-xs lg:text-sm text-gray-300 mb-1 lg:mb-1 flex-shrink-0">{prompts[tabKeys.indexOf(activeTabKey)]?.question}</p>
            <textarea
              ref={evolutionTextareaRef}
              value={fields[activeTabKey]}
              onChange={(e) => handleFieldChange(activeTabKey, e.target.value)}
              placeholder={prompts[tabKeys.indexOf(activeTabKey)]?.placeholder}
              className="w-full flex-1 p-3 lg:p-2 text-sm lg:text-sm bg-gray-700 border border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500 text-white resize-none custom-scrollbar"
              style={{ minHeight: 'calc(100% - 20px)' }}
            />
          </div>

          {/* 컨트롤 영역 - 최소화 */}
          <div className="flex-shrink-0 mt-2 lg:mt-3 px-2 lg:px-0">
            {/* 탭 인디케이터 */}
            <div className="flex justify-center mb-2 lg:mb-2">
              <div className="flex space-x-1.5">
                {tabList.map((tab, index) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTabKey(tab.key as MemoEvolutionFieldKey)}
                    className={`w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full transition-all duration-200 ${activeTabKey === tab.key ? 'bg-cyan-500 scale-125' : 'bg-gray-600 hover:bg-gray-500'}`}
                    title={tab.label}
                  />
                ))}
              </div>
            </div>
            
            {/* 버튼 그룹 - 컴팩트 */}
            <div className="flex justify-between items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handlePrevStep} 
                disabled={isSavingEvolution || tabKeys.indexOf(activeTabKey) === 0}
                className="text-gray-300 border-gray-600 hover:bg-gray-700 px-3 py-1.5 text-xs lg:text-sm h-8 lg:h-auto"
                title="이전 단계"
              >
                <ChevronLeftIcon className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                이전
              </Button>
              
              <Button 
                size="sm" 
                onClick={handleSaveEvolution} 
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-1.5 text-xs lg:text-sm h-8 lg:h-auto"
                disabled={isSavingEvolution}
              >
                {isSavingEvolution ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-1 h-3 w-3 lg:h-4 lg:w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    저장 중
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
                className="text-gray-300 border-gray-600 hover:bg-gray-700 px-3 py-1.5 text-xs lg:text-sm h-8 lg:h-auto"
                title="다음 단계"
              >
                다음
                <ChevronRightIcon className="h-3 w-3 lg:h-4 lg:w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 