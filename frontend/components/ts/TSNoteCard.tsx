import React, { useState, useEffect } from 'react';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import { GiCutDiamond, GiRock } from 'react-icons/gi';
import { QuestionMarkCircleIcon, ArrowTopRightOnSquareIcon, LightBulbIcon, PhotoIcon, LinkIcon, SparklesIcon, ShoppingCartIcon, PencilSquareIcon, TagIcon } from '@heroicons/react/24/solid';
import api from '@/lib/api'; // Import the central api instance

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
type TSNoteCardProps = {
  /** @property {TSNote} note - 표시하고 관리할 노트 객체. */
  note: TSNote;
  /** 
   * @property {(updated: Partial<TSNote>) => void} onUpdate 
   * - 노트의 내용(메모 진화 필드 등)이 변경되었을 때 호출되는 콜백 함수입니다.
   *   변경된 필드만 포함하는 부분적인 TSNote 객체를 인자로 받습니다.
   *   부모 컴포넌트에서 이 콜백을 통해 상태를 동기화하거나 추가 작업을 수행할 수 있습니다.
   */
  onUpdate: (updated: Partial<TSNote>) => void;
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

/**
 * @component TSNoteCard
 * @description 1줄 메모(노트)를 표시하고, 메모 진화(4단계 질문 답변), 플래시카드 변환, 관련 링크 관리,
 *              지식 카트 담기 등의 기능을 제공하는 핵심 UI 컴포넌트입니다.
 * @param {TSNoteCardProps} props - 컴포넌트가 받는 프롭들.
 */
export default function TSNoteCard({ note, onUpdate, onFlashcardConvert, onRelatedLinks, readingPurpose, sessionDetails, onAddToCart, isAddedToCart }: TSNoteCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [fields, setFields] = useState<{ [K in keyof Omit<TSNote, '_id' | 'bookId' | 'content' | 'tags' | 'nickname' | 'relatedLinks'>]: string }>(() => ({ // Added relatedLinks to Omit
    importanceReason: note.importanceReason || '',
    momentContext: note.momentContext || '',
    relatedKnowledge: note.relatedKnowledge || '',
    mentalImage: note.mentalImage || '',
  }));
  const [currentStep, setCurrentStep] = useState(1);

  // 탭 제목: 읽던 순간, 떠오른 장면, 연결된 지식, 내게 온 의미
  const tabList = [
    { key: 'importanceReason', label: '읽던 순간' },
    { key: 'momentContext', label: '떠오른 장면' },
    { key: 'relatedKnowledge', label: '연상된 지식' },
    { key: 'mentalImage', label: '받아들인 의미' },
  ];
  const [activeTab, setActiveTab] = useState(tabList[0].key);

  // 탭 순서: importanceReason, momentContext, relatedKnowledge, mentalImage
  const tabKeys = ['importanceReason', 'momentContext', 'relatedKnowledge', 'mentalImage'] as const;
  
  // Update fields state if note prop changes (e.g. parent re-fetches data)
  useEffect(() => {
    setFields({
      importanceReason: note.importanceReason || '',
      momentContext: note.momentContext || '',
      relatedKnowledge: note.relatedKnowledge || '',
      mentalImage: note.mentalImage || '',
    });
    // No need to update relatedLinks here as they are directly used from `note.relatedLinks` for display
  }, [note.importanceReason, note.momentContext, note.relatedKnowledge, note.mentalImage]);

  const prompts = memoEvolutionPrompts[readingPurpose as keyof typeof memoEvolutionPrompts] || memoEvolutionPrompts['humanities_self_reflection'];
  const tabQuestions: Record<string, { question: string; placeholder: string }> = {
    importanceReason: prompts[0],
    momentContext: prompts[1],
    relatedKnowledge: prompts[2],
    mentalImage: prompts[3],
  };

  const handleSave = async () => {
    const updatedNotePartial: Partial<TSNote> = { _id: note._id, ...fields };
    
    // Send only changed fields to onUpdate
    const changedFields: Partial<TSNote> = { _id: note._id };
    let hasChanges = false;
    for (const key of tabKeys) {
      if (fields[key] !== (note[key] || '')) {
        (changedFields as any)[key] = fields[key];
        hasChanges = true;
      }
    }

    if (hasChanges) {
      onUpdate(changedFields);
    }
    setIsOpen(false); 
  };

  const toggleOpen = () => setIsOpen((prev) => !prev);

  const handleChange = (key: keyof typeof fields, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };
  
  const handleBlur = async (key: keyof typeof fields) => {
    // Call onUpdate when a field loses focus and its content has actually changed
    // from the original note prop
    if (fields[key] !== (note[key] || '')) {
        onUpdate({ _id: note._id, [key]: fields[key] });
    }
  };

  const handleNext = () => {
    const currentIndex = tabKeys.indexOf(activeTab as typeof tabKeys[number]);
    if (currentIndex < tabKeys.length - 1) {
      setActiveTab(tabKeys[currentIndex + 1]);
    } else {
      // If on the last tab, "Next" could become "Save" or cycle to first
      handleSave(); 
    }
  };

  const handlePrev = () => {
    const currentIndex = tabKeys.indexOf(activeTab as typeof tabKeys[number]);
    if (currentIndex > 0) {
      setActiveTab(tabKeys[currentIndex - 1]);
    }
  };

  // Ensure that sessionDetails object exists and has properties before trying to access them
  const displaySessionCreatedAt = sessionDetails?.createdAtISO ? formatSessionCreatedAt(sessionDetails.createdAtISO) : '세션 정보 없음';
  const displaySessionDuration = sessionDetails?.durationSeconds !== undefined ? formatSessionDuration(sessionDetails.durationSeconds) : '';
  const displaySessionPageProgress = (sessionDetails?.startPage !== undefined || sessionDetails?.actualEndPage !== undefined || sessionDetails?.targetPage !== undefined) 
                                    ? formatSessionPageProgress(sessionDetails.startPage, sessionDetails.actualEndPage, sessionDetails.targetPage) 
                                    : '';
  const displayPPM = sessionDetails?.ppm !== undefined ? formatPPM(sessionDetails.ppm) : '';


  const renderSessionInfo = () => (
    <div className="text-xs text-gray-400 mr-4 pr-4 border-r border-gray-700 min-w-[120px] max-w-[150px] flex-shrink-0">
        <div className="font-semibold mb-1 text-gray-300">TS 정보</div>
        <div>{displaySessionCreatedAt}</div>
        {displaySessionDuration && <div>{displaySessionDuration}</div>}
        {displaySessionPageProgress && <div>{displaySessionPageProgress}</div>}
        {displayPPM && <div>{displayPPM}</div>}
    </div>
  );

  return (
    <div className="bg-gray-800 bg-opacity-70 backdrop-blur-sm shadow-lg rounded-lg p-1 w-full max-w-2xl mx-auto border border-gray-700 hover:border-cyan-600/50 transition-all duration-300 ease-in-out">
      <div className="flex">
        {/* TS Session Info (Left Column) */}
        {sessionDetails && renderSessionInfo()}

        {/* Main Content (Right Column) */}
        <div className="flex-grow p-4">
          {/* Top Bar: Note Content and Action Buttons */}
          <div className="flex justify-between items-start mb-3">
            <p className="text-gray-100 text-base leading-relaxed break-words hyphens-auto mr-2 flex-grow" lang="ko">
              {note.content}
            </p>
            <div className="flex-shrink-0 flex items-center space-x-1">
              {onFlashcardConvert && (
                <button
                    onClick={() => onFlashcardConvert(note)}
                    className="p-1.5 text-gray-400 hover:text-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 rounded-md transition-colors"
                    title="플래시카드로 변환"
                >
                    <SparklesIcon className="h-5 w-5" />
                </button>
              )}
              {onRelatedLinks && (
                <button
                    onClick={() => onRelatedLinks(note)}
                    className="p-1.5 text-gray-400 hover:text-green-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 rounded-md transition-colors"
                    title="관련 링크 관리"
                >
                    <LinkIcon className="h-5 w-5" />
                </button>
              )}
              {onAddToCart && (
                 <button
                    onClick={() => onAddToCart(note._id, note.bookId)}
                    className={`p-1.5 ${isAddedToCart ? 'text-cyan-400' : 'text-gray-400 hover:text-cyan-300'} focus:outline-none focus:ring-2 focus:ring-cyan-500/50 rounded-md transition-colors`}
                    title={isAddedToCart ? "카트에서 제거" : "지식 카트에 담기"}
                >
                    <ShoppingCartIcon className={`h-5 w-5 ${isAddedToCart ? 'fill-current' : ''}`} />
                </button>
              )}
            </div>
          </div>

          {/* Tags Display */}
          {note.tags && note.tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {note.tags.map((tag, index) => (
                <span key={index} className="px-2 py-0.5 bg-gray-700 text-xs text-gray-300 rounded-full flex items-center">
                  <TagIcon className="h-3 w-3 mr-1 text-cyan-400" /> 
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          {/* Display Related Links if they exist */}
          {note.relatedLinks && note.relatedLinks.length > 0 && (
            <div className="mb-4 mt-2 border-t border-gray-700 pt-3">
              <h4 className="text-sm font-semibold text-gray-400 mb-2 flex items-center">
                <LinkIcon className="h-4 w-4 mr-2 text-green-400" />
                관련 자료
              </h4>
              <ul className="space-y-1.5 pl-1">
                {note.relatedLinks.map((link, index) => (
                  <li key={link._id || index} className="text-xs group">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 hover:underline underline-offset-2 transition-colors items-center group"
                    >
                      {getLinkTypeIcon(link.type)}
                      <span className="truncate group-hover:whitespace-normal group-hover:break-all">{link.url}</span>
                    </a>
                    {link.reason && (
                      <p className="text-gray-500 pl-5 text-xxs italic truncate group-hover:whitespace-normal group-hover:break-all">
                        ({link.reason})
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}


          {/* Memo Evolution Toggle Button */}
          <div className="text-right mt-2">
             <button 
                onClick={toggleOpen} 
                className="px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600/80 text-gray-300 rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/60 flex items-center justify-center ml-auto"
            >
                <PencilSquareIcon className={`h-4 w-4 mr-1.5 ${isOpen ? 'text-purple-400' : 'text-gray-400'}`} />
                {isOpen ? '메모 진화 닫기' : '메모 진화'}
            </button>
          </div>

          {/* Memo Evolution Section (Collapsible) */}
          {isOpen && (
            <div className="mt-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700/70">
              {/* Tabs for Memo Evolution Steps */}
              <div className="mb-4 border-b border-gray-700 flex space-x-1">
                {tabList.map((tab, index) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-3 py-2 text-xs font-medium rounded-t-md transition-colors
                                ${activeTab === tab.key 
                                  ? `${tabColorMap[index]?.color ? `text-white border-b-2` : 'bg-purple-600 text-white'}` 
                                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'}`}
                    style={activeTab === tab.key ? { borderColor: tabColorMap[index]?.color, color: tabColorMap[index]?.color } : {}}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Current Tab Content */}
              <div>
                <label htmlFor={activeTab} className="block text-sm font-medium text-gray-300 mb-1">
                  {tabQuestions[activeTab]?.question || '질문'}
                </label>
                <textarea
                  id={activeTab}
                  name={activeTab}
                  rows={3}
                  className="mt-1 block w-full p-2.5 bg-gray-800/70 border border-gray-600 rounded-md shadow-sm text-gray-200 placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500 text-sm transition-colors"
                  placeholder={tabQuestions[activeTab]?.placeholder || '답변을 입력하세요...'}
                  value={fields[activeTab as keyof typeof fields]}
                  onChange={(e) => handleChange(activeTab as keyof typeof fields, e.target.value)}
                  onBlur={() => handleBlur(activeTab as keyof typeof fields)}
                />
              </div>

              {/* Navigation and Save Buttons */}
              <div className="mt-5 flex justify-between items-center">
                <button 
                    onClick={handlePrev} 
                    disabled={tabKeys.indexOf(activeTab as typeof tabKeys[number]) === 0}
                    className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-md disabled:opacity-50 transition-colors"
                >
                    이전
                </button>
                <div className="text-xs text-gray-500">
                    {tabKeys.indexOf(activeTab as typeof tabKeys[number]) + 1} / {tabKeys.length} 단계
                </div>
                {tabKeys.indexOf(activeTab as typeof tabKeys[number]) === tabKeys.length - 1 ? (
                     <button 
                        onClick={handleSave} 
                        className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
                    >
                        메모 진화 저장
                    </button>
                ) : (
                    <button 
                        onClick={handleNext} 
                        className="px-4 py-2 text-sm bg-cyan-600 hover:bg-cyan-700 text-white rounded-md transition-colors"
                    >
                        다음
                    </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 