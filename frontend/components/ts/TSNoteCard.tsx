import React, { useState, useEffect } from 'react';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import { GiCutDiamond, GiRock } from 'react-icons/gi';
import { QuestionMarkCircleIcon, ArrowTopRightOnSquareIcon, LightBulbIcon, PhotoIcon, LinkIcon, SparklesIcon, ShoppingCartIcon } from '@heroicons/react/24/solid';
import api from '@/lib/api'; // Import the central api instance

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

/**
 * @component TSNoteCard
 * @description 1줄 메모(노트)를 표시하고, 메모 진화(4단계 질문 답변), 플래시카드 변환, 관련 링크 관리,
 *              지식 카트 담기 등의 기능을 제공하는 핵심 UI 컴포넌트입니다.
 * @param {TSNoteCardProps} props - 컴포넌트가 받는 프롭들.
 */
export default function TSNoteCard({ note, onUpdate, onFlashcardConvert, onRelatedLinks, readingPurpose, sessionDetails, onAddToCart, isAddedToCart }: TSNoteCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [fields, setFields] = useState<{ [K in keyof Omit<TSNote, '_id' | 'bookId' | 'content' | 'tags' | 'nickname'>]: string }>({
    importanceReason: note.importanceReason || '',
    momentContext: note.momentContext || '',
    relatedKnowledge: note.relatedKnowledge || '',
    mentalImage: note.mentalImage || '',
  });
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
  // readingPurpose가 없거나 잘못된 값이면 humanities_self_reflection을 기본값으로 사용
  const prompts = memoEvolutionPrompts[readingPurpose as keyof typeof memoEvolutionPrompts] || memoEvolutionPrompts['humanities_self_reflection'];
  const tabQuestions: Record<string, { question: string; placeholder: string }> = {
    importanceReason: prompts[0],
    momentContext: prompts[1],
    relatedKnowledge: prompts[2],
    mentalImage: prompts[3],
  };
  const [inputValue, setInputValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  // 탭 변경 시 입력값 초기화 및 기존 값 반영
  useEffect(() => {
    setInputValue((fields as Record<string, string>)[activeTab] || '');
    setSaveSuccess(false);
  }, [activeTab, fields]);
  // 저장 함수
  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await api.put(`/notes/${note._id}`, { [activeTab]: inputValue });
      onUpdate({ ...fields, [activeTab]: inputValue, _id: note._id, bookId: note.bookId, content: note.content, tags: note.tags });
      setFields(prev => ({ ...prev, [activeTab]: inputValue }));
      setSaveSuccess(true);
    } catch (err) {
      console.error('Error saving note (handleSave):', err);
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveSuccess(false), 1200);
    }
  };

  useEffect(() => {
    if (!isOpen) setCurrentStep(1);
  }, [isOpen]);

  const questions: { key: keyof typeof fields; label: string }[] = [
    { key: 'importanceReason', label: '이 문장을 쓸 때, 주위 분위기는 조용했나요?' },
    { key: 'momentContext', label: '이 문장을 쓸 때, 어떤 장면이 그려지나요?' },
    { key: 'relatedKnowledge', label: '이 문장은 어떤 지식을 연상시키나요?' },
    { key: 'mentalImage', label: '왜 이 문장을 선택했나요?' },
  ];

  const toggleOpen = () => setIsOpen((prev) => !prev);

  const handleChange = (key: keyof typeof fields, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleBlur = async (key: keyof typeof fields) => {
    const value = (fields[key] || '').trim();
    try {
      await api.put(`/notes/${note._id}`, { [key]: value });
      onUpdate({ ...fields, [key]: value, _id: note._id, bookId: note.bookId, content: note.content, tags: note.tags });
    } catch (err) {
      console.error('Error updating note (handleBlur):', err);
    }
  };

  // Map each field to a tailwind border color for the effect bar
  const effectColorMap: Record<keyof typeof fields, string> = {
    importanceReason: 'border-blue-500',
    momentContext: 'border-purple-500',
    relatedKnowledge: 'border-green-500',
    mentalImage: 'border-orange-500',
  };

  // Effect description for tooltip per question
  const effectDescriptionMap: Record<keyof typeof fields, string> = {
    importanceReason: '상황 연상 효과↑',
    momentContext: '시각적 기억 강화↑',
    relatedKnowledge: '연결망 강화↑',
    mentalImage: '심층 처리 효과↑',
  };

  return (
    <div className="bg-indigo-50 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow" role="region" aria-label="TS 메모 카드">
      <div className="flex justify-between items-center">
        {/* Left column container for TS Info and Diamond button */}
        <div className="flex flex-col items-center gap-y-2 mr-4">
            {/* TS 세션 정보 버튼 및 툴크 */}
            {sessionDetails && (
              <div className="relative group w-full">
                <button
                  type="button"
                  className="h-9 px-3 py-1.5 flex items-center justify-center text-xs bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors shadow-sm font-semibold w-full"
                >
                  TS info
                </button>
                <div
                  className="absolute top-full left-0 mt-1 w-64 p-3 bg-indigo-700 text-indigo-100 text-xs rounded-md shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 leading-relaxed whitespace-normal"
                >
                  <div className="font-semibold text-white mb-1 border-b border-indigo-500 pb-1">세션 요약</div>
                  <div><strong className="text-indigo-200">독서 일시</strong> <span className="font-medium">{formatSessionCreatedAt(sessionDetails.createdAtISO)}</span></div>
                  <div><strong className="text-indigo-200">독서 시간</strong> <span className="font-medium">{formatSessionDuration(sessionDetails.durationSeconds)}</span></div>
                  <div><strong className="text-indigo-200">독서 범위</strong> <span className="font-medium">{formatSessionPageProgress(sessionDetails.startPage, sessionDetails.actualEndPage, sessionDetails.targetPage)}</span></div>
                  <div><strong className="text-indigo-200">독서 속도</strong> <span className="font-medium">{formatPPM(sessionDetails.ppm)}</span></div>
                </div>
              </div>
            )}
            {/* 다이아몬드 아이콘 (좌측 하단) */}
            <div className="relative group p-1.5 rounded-lg bg-gradient-to-br from-indigo-100 to-indigo-200 hover:from-indigo-200 hover:to-indigo-300 border border-indigo-300 shadow-sm hover:shadow-md transition-all flex items-center justify-center">
                <GiCutDiamond
                  className="text-indigo-600 drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)] text-2xl cursor-pointer hover:text-pink-500 hover:drop-shadow-[0_1px_3px_rgba(236,72,153,0.6)] hover:scale-110 hover:brightness-125 transition-all"
                  aria-label="Cut diamond"
                  onClick={toggleOpen}
                />
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10 transition-opacity">
                  메모를 다듬어 다이아몬드로 만드세요.
                </div>
            </div>
        </div>

        <div className="flex-1 w-full">
          <div className="w-full px-4">
            <span className="text-xl text-black font-sans font-medium tracking-tight leading-loose text-left align-middle border border-indigo-200 bg-indigo-100 rounded-md px-4 py-2 shadow-sm w-full block">
              {note.content}
            </span>
            {isOpen && (
              <div className="w-full grid grid-cols-4 gap-0 bg-gray-50 rounded-md shadow-sm mt-3 mb-2 border border-gray-100 overflow-hidden">
                {tabList.map((tab, idx) => {
                  const Icon = tabIconMap[idx].icon;
                  const deep = tabColorMap[idx].color;
                  const ring = tabColorMap[idx].ring;
                  const isActive = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      className={`w-full py-2 flex flex-col items-center justify-center font-semibold text-xs focus:outline-none transition-all border-r border-gray-100 last:border-r-0
                        ${isActive ? 'shadow-lg -mb-1 z-10 ring-2' : 'bg-gray-50 opacity-90 hover:opacity-100 hover:scale-105'}
                      `}
                      style={{
                        minHeight: 56,
                        background: isActive ? deep + 'E6' : '#F8FAFC', // 90% 불투명 or 연회색
                        color: isActive ? '#fff' : deep + 'CC', // 흰색 or 딥컬러 80% 투명도
                        boxShadow: isActive ? `0 4px 16px 0 ${ring}55` : undefined,
                        borderBottom: isActive ? `2.5px solid ${deep}` : undefined,
                      }}
                      onClick={() => setActiveTab(tab.key)}
                      type="button"
                    >
                      <Icon className="w-5 h-5 mb-1" style={{ color: isActive ? '#fff' : deep + 'CC' }} />
                      <span className="font-bold tracking-tight" style={{ color: isActive ? '#fff' : deep + 'CC' }}>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col items-stretch ml-4 gap-y-2">
          {/* 지식 카트 담기 버튼 */} 
          {onAddToCart && (
            <div className="relative group w-full rounded-lg bg-gradient-to-br from-yellow-100 to-yellow-200 hover:from-yellow-200 hover:to-yellow-300 border border-yellow-300 shadow-sm hover:shadow-md transition-all">
              <button
                type="button"
                className={`h-9 w-full px-2 py-0.5 text-xs font-semibold transition-colors flex items-center justify-center ${isAddedToCart ? 'text-yellow-700' : 'text-yellow-600'}`}
                aria-label={isAddedToCart ? "카트에서 제거" : "지식 카트에 담기"}
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(note._id, note.bookId);
                }}
              >
                <ShoppingCartIcon className={`w-5 h-5 ${isAddedToCart ? 'text-yellow-700 fill-current' : 'text-yellow-600'} group-hover:text-yellow-800 transition-colors`} />
                {isAddedToCart && <span className="ml-1 text-yellow-700 font-bold">🛒✅</span>} 
              </button>
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10 transition-opacity">
                {isAddedToCart ? "이미 카트에 담겨있습니다" : "지식 카트에 추가"}
              </div>
            </div>
          )}
          {/* 플래시카드 버튼 */}
          {onFlashcardConvert && (
            <div className="relative group w-full rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 border border-blue-300 shadow-sm hover:shadow-md transition-all">
              <button
                type="button"
                className="h-9 w-full px-2 py-0.5 text-xs font-semibold transition-colors flex items-center justify-center"
                aria-label="플래시카드 변환"
                onClick={(e) => { e.stopPropagation(); onFlashcardConvert(note); }}
              >
                <QuestionMarkCircleIcon className="w-5 h-5 text-blue-700 group-hover:text-blue-800 transition-colors" />
              </button>
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10 transition-opacity">
                퀴즈로 만들어 자기 것으로 만드세요
              </div>
            </div>
          )}
          {/* 관련링크 버튼 */}
          {onRelatedLinks && (
            <div className="relative group w-full rounded-lg bg-gradient-to-br from-green-100 to-green-200 hover:from-green-200 hover:to-green-300 border border-green-300 shadow-sm hover:shadow-md transition-all">
              <button
                type="button"
                className="h-9 w-full px-2 py-0.5 text-xs font-semibold transition-colors flex items-center justify-center"
                aria-label="관련링크 관리"
                onClick={(e) => { e.stopPropagation(); onRelatedLinks(note); }}
              >
                <ArrowTopRightOnSquareIcon className="w-5 h-5 text-green-700 group-hover:text-green-800 transition-colors" />
              </button>
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10 transition-opacity">
                이 메모와 관련된 외부 지식을 연결하세요
              </div>
            </div>
          )}
        </div>
      </div>
      {isOpen && (
        <div className="mt-4">
          {/* 탭 바는 위에서 1줄 메모와 함께 정렬됨 */}
          <div className="mt-4">
            <div className="mb-2 text-base font-semibold text-gray-700 flex items-center gap-2">
              {tabQuestions[activeTab].question}
              {saveSuccess && <span className="text-green-500 text-sm">✔ 저장됨</span>}
            </div>
            <textarea
              className="w-full p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400 text-gray-900 leading-relaxed mb-2"
              rows={2}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder={tabQuestions[activeTab].placeholder}
              disabled={isSaving}
            />
            <div className="flex justify-end">
              <button
                type="button"
                className={`px-4 py-1 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50`}
                onClick={handleSave}
                disabled={isSaving || !inputValue.trim()}
              >
                {isSaving ? <span className="animate-spin mr-1">⏳</span> : null}
                확인
              </button>
            </div>
            {/* 저장된 메모 인라인 표시 */}
            {(fields as Record<string, string>)[activeTab] && (
              <div className="mt-3 text-sm text-gray-600 bg-gray-50 rounded p-2 border border-gray-100">
                <span className="font-medium text-blue-700">저장된 메모:</span> {(fields as Record<string, string>)[activeTab]}
              </div>
            )}
          </div>
        </div>
      )}
      {(note.tags && note.tags.length > 0) && (
        <div className="flex flex-wrap items-center justify-between gap-y-2 mt-6 pt-2 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {note.tags.map((tag, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium border border-blue-100 shadow-sm"
              >
                #{tag}
              </span>
            ))}
          </div>
          <span className="text-xs text-rose-500 italic ml-auto whitespace-nowrap">Uncut diamond from this book</span>
        </div>
      )}
      <style jsx>{`
        textarea::placeholder {
          font-style: italic;
        }
      `}</style>
    </div>
  );
} 