import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AiOutlineQuestionCircle, AiOutlineInfoCircle } from 'react-icons/ai';
import { GiCutDiamond, GiRock } from 'react-icons/gi';
import { QuestionMarkCircleIcon, ArrowTopRightOnSquareIcon, LightBulbIcon, PhotoIcon, LinkIcon, SparklesIcon, ShoppingCartIcon, PencilSquareIcon, TagIcon, EllipsisVerticalIcon, BookOpenIcon as SolidBookOpenIcon } from '@heroicons/react/24/solid';
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
const memoEvolutionPrompts: Record<string, Array<{ question: string; placeholder: string }>> = {
  exam_prep: [
    { question: '방금 읽은 이 부분에서, 무엇때문에 중요하거나 특히 기억해야 한다고 느꼈나요?', placeholder: '이 개념은 자주 출제된다, 시험에서 헷갈리기 쉬운 부분' },
    { question: '이 메모(또는 방금 읽은 내용)가 실제 시험 문제로 출제된다면 어떤 모습일까요?', placeholder: '이론 설명형, 사례 적용형, OX 문제 등' },
    { question: '방금 읽은 내용은 이미 알고 있는 어떤 것을 연상시키나요? ', placeholder: '강의, 노트 필기, 문제집 등' },
    { question: '이 부분의 학습이 이 책 전체 흐름에서 어떤 의미를 가지며, 이를 완벽히 이해하기 위해 어떤 것이 더 필요할까요?', placeholder: '플래시카드, 요약노트, 친구에게 설명' },
  ],
  practical_knowledge: [
    { question: '방금 읽은 이 기술/정보에서, 현재 업무/프로젝트에 즉시 적용할 만한 아이디어나 개선점을 발견했나요?', placeholder: '프로젝트에 바로 쓸 수 있다, 업무 자동화에 활용' },
    { question: '이 메모(또는 방금 읽은 내용)를 실제 업무에 적용하는 구체적인 절차나 예상되는 상황(제약, 협업)을 그려본다면?', placeholder: '현장 상황, 리소스 부족, 협업 이슈' },
    { question: '방금 읽은 이 새로운 지식이 기존의 업무 경험이나 보유 기술과 어떻게 연결되어 시너지/차이점을 만들 수 있을까요?', placeholder: '이전 프로젝트, 다른 툴과의 차이' },
    { question: '이 부분의 지식 습득이 당신의 전문성 향상에 어떤 의미를 주며, 실제 업무에 적용하기 위한 첫 단계는 무엇일까요?', placeholder: '내일 회의 때 공유, 샘플 코드 작성' },
  ],
  humanities_self_reflection: [
    { question: '방금 읽은 이 구절/내용을 접했을 때, 어떤 감정이나 생각이 가장 먼저 들었나요? 기존 가치관에 영향을 주었나요?', placeholder: '새로운 시각, 내 신념과의 충돌' },
    { question: '이 메모(또는 방금 읽은 내용)와 관련된 당신의 개인적인 경험이나 삶의 특정 장면이 있다면 무엇인가요?', placeholder: '과거 경험, 가족/사회와의 관계' },
    { question: '방금 읽은 이 부분과 유사한 주제를 다룬 다른 책, 영화, 예술 작품이나, 연관된 철학적/역사적 개념이 떠오르나요?', placeholder: '삶의 방향, 내면의 변화' },
    { question: '이 부분을 통해 얻은 깨달음이나 통찰이 당신의 삶에 어떤 새로운 의미를 더해주며, 앞으로 어떤 생각/행동의 변화로 이어질 수 있을까요?', placeholder: '일상에서 실천, 주변에 추천' },
  ],
  reading_pleasure: [
    { question: '방금 읽은 이 부분에서, 어떤 점(문장, 묘사, 사건) 때문에 즉각적으로 흥미나 감동을 느꼈나요?', placeholder: '반전, 유머, 감동적인 장면' },
    { question: '이 메모(또는 방금 읽은 내용)와 관련하여 가장 생생하게 떠오르는 장면, 대사, 또는 캐릭터의 모습은 무엇인가요?', placeholder: '주인공의 한마디, 명장면' },
    { question: '방금 읽은 이 부분의 내용/분위기가 당신의 다른 경험(독서, 영화 감상 등)과 연결되어 더 큰 재미나 특별한 느낌을 주었나요?', placeholder: '이 책의 매력, 추천 포인트' },
    { question: '이 부분을 통해 느낀 즐거움/감동이 당신에게 어떤 여운을 남겼으며, 이 책의 어떤 매력을 다른 사람에게 이야기하고 싶나요?', placeholder: '여운, 아쉬움, 다음 권 기대' },
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
  const [note, setNote] = useState(initialNote);
  const [isOpen, setIsOpen] = useState(false);
  const [fields, setFields] = useState({
    importanceReason: note.importanceReason || '',
    momentContext: note.momentContext || '',
    relatedKnowledge: note.relatedKnowledge || '',
    mentalImage: note.mentalImage || '',
  });
  const [initialFields, setInitialFields] = useState({...fields});
  const [currentStep, setCurrentStep] = useState(1);
  const [isHoveringInfo, setIsHoveringInfo] = useState(false);
  const [isHoveringCard, setIsHoveringCard] = useState(false);
  const [showSessionDetailsPopover, setShowSessionDetailsPopover] = useState(false);
  const [isSavingEvolution, setIsSavingEvolution] = useState(false);
  const evolutionTextareaRef = useRef<HTMLTextAreaElement>(null);

  const tabList = [
    { key: 'importanceReason', label: '읽던 순간' },
    { key: 'momentContext', label: '떠오른 장면' },
    { key: 'relatedKnowledge', label: '연상된 지식' },
    { key: 'mentalImage', label: '받아들인 의미' },
  ];
  const [activeTab, setActiveTab] = useState(tabList[0].key);

  const tabKeys = ['importanceReason', 'momentContext', 'relatedKnowledge', 'mentalImage'] as const;
  
  useEffect(() => {
    setFields({
      importanceReason: note.importanceReason || '',
      momentContext: note.momentContext || '',
      relatedKnowledge: note.relatedKnowledge || '',
      mentalImage: note.mentalImage || '',
    });
  }, [note.importanceReason, note.momentContext, note.relatedKnowledge, note.mentalImage]);

  const prompts = memoEvolutionPrompts[readingPurpose as keyof typeof memoEvolutionPrompts] || memoEvolutionPrompts['humanities_self_reflection'];
  const tabQuestions: Record<string, { question: string; placeholder: string }> = {
    importanceReason: prompts[0],
    momentContext: prompts[1],
    relatedKnowledge: prompts[2],
    mentalImage: prompts[3],
  };

  const handleSave = useCallback(async () => {
    const changedFields: Partial<TSNote> = { _id: note._id };
    let hasChanges = false;
    for (const key of tabKeys) {
      if (fields[key] !== (note[key] || '')) {
        (changedFields as any)[key] = fields[key];
        hasChanges = true;
      }
    }

    if (hasChanges && onUpdate) {
      setIsSavingEvolution(true);
      try {
        await onUpdate(changedFields);
        setIsOpen(false);
      } catch (error) {
        console.error("Failed to save note evolution:", error);
      } finally {
        setIsSavingEvolution(false);
      }
    } else {
      setIsOpen(false);
    }
  }, [fields, note, onUpdate, tabKeys, setIsOpen]);

  const toggleOpen = () => {
    if (!isPageEditing && !isOpen) return;
    setIsOpen((prev) => !prev);
  };

  const handleChange = (key: keyof typeof fields, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };
  
  const handleNext = useCallback(() => {
    const currentIndex = tabKeys.indexOf(activeTab as typeof tabKeys[number]);
    if (currentIndex < tabKeys.length - 1) {
      setActiveTab(tabKeys[currentIndex + 1]);
    } else {
      handleSave(); 
    }
  }, [activeTab, handleSave, tabKeys]);

  const handlePrev = () => {
    setCurrentStep((prev) => (prev > 1 ? prev - 1 : tabList.length));
  };

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
      <div className="mt-2 mb-1 text-xs text-gray-400 flex items-center">
        <SolidBookOpenIcon className="h-3.5 w-3.5 mr-1.5 text-cyan-500 flex-shrink-0" />
        출처: <span className="font-medium text-gray-300 ml-1 truncate" title={bookTitle}>{bookTitle}</span>
      </div>
    );
  };

  // "메모 진화" 내용을 조회 모드에서 표시하는 함수
  const renderMemoEvolutionDetails = () => {
    if (isOpen || isPageEditing || minimalDisplay) {
      return null;
    }

    const evolutionFieldsToShow: { key: keyof TSNote; label: string }[] = [
      { key: 'importanceReason', label: '중요했던 이유' },
      { key: 'momentContext', label: '작성 당시 상황' },
      { key: 'relatedKnowledge', label: '연관된 지식' },
      { key: 'mentalImage', label: '떠오른 생각/심상' },
    ];

    const details = evolutionFieldsToShow
      .map(field => {
        const value = note[field.key];
        if (value && typeof value === 'string' && value.trim() !== '') {
          return (
            <div key={field.key} className="mt-2">
              <p className="text-xs font-semibold text-cyan-500 mb-0.5">{field.label}:</p>
              <p className="text-sm text-gray-300 whitespace-pre-wrap break-words">{value}</p>
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
      <div className="mt-3 pt-3 border-t border-gray-700/30">
        <h4 className="text-xs font-bold text-gray-500 mb-1">메모 진화 내용:</h4>
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
        <div className="flex-grow mb-2">
          <p className={`text-base ${cyberTheme.textMain} leading-relaxed whitespace-pre-wrap break-words max-w-prose`}>
            {note.content}
          </p>
          {!minimalDisplay && renderBookSource()}
        </div>

        {/* Render memo evolution details in view mode */}
        {renderMemoEvolutionDetails()}

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
                size="sm"
                onClick={() => onAddToCart(note._id, note.bookId)}
                title={isAddedToCart ? "카트에서 제거" : "지식 카트에 담기"}
                className={`${isAddedToCart ? 'border-green-500 text-green-500 hover:bg-green-500/10' : cyberTheme.buttonOutlineBorder + ' ' + cyberTheme.buttonOutlineText + ' ' + cyberTheme.buttonOutlineHoverBg }`}
              >
                <ShoppingCartIcon className={`h-4 w-4 mr-1.5 ${isAddedToCart ? 'text-green-500' : ''}`} />
                {isAddedToCart ? '카트에 담김' : '카트 담기'}
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="px-2">
                  <EllipsisVerticalIcon className={`h-5 w-5 text-gray-400 hover:${cyberTheme.primaryText}`} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className={`${cyberTheme.menuBg} border-${cyberTheme.menuBorder}`}>
                <DropdownMenuItem onClick={toggleOpen} className={`${cyberTheme.menuItemHover} ${cyberTheme.primaryText}`}>
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

      {isOpen && !minimalDisplay && (
        <div className="absolute inset-0 bg-gray-800/95 backdrop-blur-sm p-4 rounded-lg z-20 flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-cyan-400">메모 진화: {tabList[currentStep - 1]?.label}</h3>
            <Button variant="ghost" size="sm" onClick={toggleOpen} className="text-gray-400 hover:text-white">✕</Button>
          </div>
          
          <div className="flex-grow overflow-y-auto pr-2">
            <p className="text-sm text-gray-300 mb-1">{prompts[currentStep - 1]?.question}</p>
            <textarea
              ref={evolutionTextareaRef}
              value={fields[tabKeys[currentStep - 1] as keyof typeof fields]}
              onChange={(e) => handleChange(tabKeys[currentStep - 1] as keyof typeof fields, e.target.value)}
              placeholder={prompts[currentStep - 1]?.placeholder}
              className="w-full h-32 p-2 text-sm bg-gray-700 border border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500 text-white"
            />
            {note.relatedLinks && note.relatedLinks.length > 0 && currentStep === 3 && (
                 <div className="mt-3">
                     <h4 className="text-sm font-medium text-gray-400 mb-1">관련 링크:</h4>
                     <ul className="space-y-1 text-xs">
                         {note.relatedLinks.map((link, idx) => (
                             <li key={idx} className="flex items-center">
                                 {getLinkTypeIcon(link.type)}
                                 <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline truncate" title={link.url}>
                                     {link.reason || link.url}
                                 </a>
                             </li>
                         ))}
                     </ul>
                 </div>
             )}
          </div>

          <div className="mt-3 flex justify-between items-center">
            <div className="flex space-x-1">
              {tabList.map((tab, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index + 1)}
                  className={`w-3 h-3 rounded-full ${currentStep === index + 1 ? 'bg-cyan-500' : 'bg-gray-600 hover:bg-gray-500'}`}
                  title={tab.label}
                />
              ))}
            </div>
            <div className="space-x-2">
              <Button variant="outline" size="sm" onClick={handlePrev} disabled={isSavingEvolution}>이전</Button>
              <Button variant="outline" size="sm" onClick={handleNext} disabled={isSavingEvolution}>다음</Button>
              <Button 
                size="sm" 
                onClick={handleSave} 
                className="bg-cyan-600 hover:bg-cyan-700 text-white min-w-[80px]"
                disabled={isSavingEvolution}
              >
                {isSavingEvolution ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    저장 중...
                  </>
                ) : (
                  "완료"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 