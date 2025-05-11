import React, { useState, useEffect } from 'react';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import { GiCutDiamond, GiRock } from 'react-icons/gi';
import { QuestionMarkCircleIcon, ArrowTopRightOnSquareIcon, LightBulbIcon, PhotoIcon, LinkIcon, SparklesIcon } from '@heroicons/react/24/solid';

export interface TSNote {
  _id: string;
  content: string;
  tags: string[];
  importanceReason?: string;
  momentContext?: string;
  relatedKnowledge?: string;
  mentalImage?: string;
  nickname?: string;
}

// 목적별 4단계 질문/가이드/placeholder 매핑
const memoEvolutionPrompts: Record<string, Array<{ question: string; placeholder: string }>> = {
  exam_prep: [
    { question: '이 부분이 시험/인증에 왜 중요하다고 느꼈나요?', placeholder: '이 개념은 자주 출제된다, 시험에서 헷갈리기 쉬운 부분' },
    { question: '실제 시험 문제로 나온다면 어떻게 출제될까요?', placeholder: '이론 설명형, 사례 적용형, OX 문제 등' },
    { question: '이 내용을 내 언어로 요약하거나, 암기 팁을 만들어 보세요.', placeholder: '공식 암기법, 키워드 연결, 그림 그리기' },
    { question: '시험 직전, 이 내용을 어떻게 복습할 계획인가요?', placeholder: '플래시카드, 요약노트, 친구에게 설명' },
  ],
  practical_knowledge: [
    { question: '이 내용이 내 실무/업무에 어떻게 적용될 수 있나요?', placeholder: '프로젝트에 바로 쓸 수 있다, 업무 자동화에 활용' },
    { question: '실제로 적용한다면 어떤 문제가 생길 수 있나요?', placeholder: '현장 상황, 리소스 부족, 협업 이슈' },
    { question: '내 경험/기존 지식과 어떻게 연결되나요?', placeholder: '이전 프로젝트, 다른 툴과의 차이' },
    { question: '내 업무에 바로 적용하기 위한 액션 플랜을 적어보세요.', placeholder: '내일 회의 때 공유, 샘플 코드 작성' },
  ],
  humanities_self_reflection: [
    { question: '이 부분이 내 생각/가치관에 어떤 영향을 주었나요?', placeholder: '새로운 시각, 내 신념과의 충돌' },
    { question: '이 내용을 내 삶/경험과 연결해 본다면?', placeholder: '과거 경험, 가족/사회와의 관계' },
    { question: '이 책의 메시지가 내게 주는 의미는 무엇인가요?', placeholder: '삶의 방향, 내면의 변화' },
    { question: '앞으로 내 삶에 어떻게 적용/실천할 수 있을까요?', placeholder: '일상에서 실천, 주변에 추천' },
  ],
  reading_pleasure: [
    { question: '이 부분이 왜 재미있거나 인상적이었나요?', placeholder: '반전, 유머, 감동적인 장면' },
    { question: '가장 기억에 남는 장면/대사/캐릭터는?', placeholder: '주인공의 한마디, 명장면' },
    { question: '이 책을 다른 사람에게 추천한다면 뭐라고 말할까요?', placeholder: '이 책의 매력, 추천 포인트' },
    { question: '이 책을 읽고 느낀 감정/생각을 자유롭게 적어보세요.', placeholder: '여운, 아쉬움, 다음 권 기대' },
  ],
};

type TSNoteCardProps = {
  note: TSNote;
  onUpdate: (updated: Partial<TSNote>) => void;
  onFlashcardConvert?: (note: TSNote) => void;
  onRelatedLinks?: (note: TSNote) => void;
  readingPurpose?: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

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

export default function TSNoteCard({ note, onUpdate, onFlashcardConvert, onRelatedLinks, readingPurpose }: TSNoteCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [fields, setFields] = useState<{ [K in keyof Omit<TSNote, '_id' | 'content' | 'tags' | 'nickname'>]: string }>({
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
    { key: 'relatedKnowledge', label: '연결된 지식' },
    { key: 'mentalImage', label: '내게 온 의미' },
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
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${API_BASE_URL}/notes/${note._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ [activeTab]: inputValue }),
      });
      if (res.ok) {
        onUpdate({ [activeTab]: inputValue });
        setFields(prev => ({ ...prev, [activeTab]: inputValue }));
        setSaveSuccess(true);
      } else {
        // 에러 처리 필요시 추가
      }
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
    { key: 'relatedKnowledge', label: '이 문장은 어떤 지식과 연결할 수 있나요?' },
    { key: 'mentalImage', label: '왜 이 문장이 중요했나요?' },
  ];

  const toggleOpen = () => setIsOpen((prev) => !prev);

  const handleChange = (key: keyof typeof fields, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleBlur = async (key: keyof typeof fields) => {
    const value = (fields[key] || '').trim();
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${API_BASE_URL}/notes/${note._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ [key]: value }),
      });
      if (res.ok) {
        onUpdate({ [key]: value });
      } else {
        console.error('Failed to update field', key);
      }
    } catch (err) {
      console.error('Error updating note:', err);
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
    importanceReason: '상황 의존 학습 효과↑',
    momentContext: '시각적 상상으로 기억 강화↑',
    relatedKnowledge: '유의미 연결망 강화↑',
    mentalImage: '심층 처리(Elaboration) 효과↑',
  };

  return (
    <div className="bg-indigo-50 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow" role="region" aria-label="TS 메모 카드">
      <div className="flex justify-between items-start">
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
        <div className="flex flex-col items-center ml-4 gap-y-3">
          {/* 다이아몬드 아이콘 */}
          <div className="relative group">
            <GiCutDiamond
              className="text-blue-500 drop-shadow-md text-xl cursor-pointer hover:scale-110 hover:brightness-125 transition-transform"
              aria-label="Cut diamond"
              onClick={() => setIsOpen((prev) => !prev)}
            />
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10 transition-opacity">
              메모를 가공해 다이아몬드로 만드세요.
            </div>
          </div>
          {/* 플래시카드 버튼 */}
          {onFlashcardConvert && (
            <div className="relative group w-full">
              <button
                type="button"
                className="w-full px-2 py-0.5 bg-blue-500 text-white rounded text-xs font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center shadow-sm"
                aria-label="플래시카드 변환"
                onClick={(e) => { e.stopPropagation(); onFlashcardConvert(note); }}
              >
                <QuestionMarkCircleIcon className="w-4 h-4" />
              </button>
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10 transition-opacity">
                메모를 퀴즈로 만들어 자신의 지식으로 만드세요
              </div>
            </div>
          )}
          {/* 관련링크 버튼 */}
          {onRelatedLinks && (
            <div className="relative group w-full">
              <button
                type="button"
                className="w-full px-2 py-0.5 bg-green-500 text-white rounded text-xs font-semibold hover:bg-green-600 transition-colors flex items-center justify-center shadow-sm"
                aria-label="관련링크 관리"
                onClick={(e) => { e.stopPropagation(); onRelatedLinks(note); }}
              >
                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
              </button>
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10 transition-opacity">
                이 메모와 관련된 외부 자료를 연결하세요
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
          <span className="text-xs text-gray-400 italic ml-auto whitespace-nowrap">Uncut diamond from this book</span>
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