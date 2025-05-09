import React, { useState, useEffect } from 'react';
import { AiOutlineQuestionCircle } from 'react-icons/ai';

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

type TSNoteCardProps = {
  note: TSNote;
  onUpdate: (updated: Partial<TSNote>) => void;
  onFlashcardConvert?: (note: TSNote) => void;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function TSNoteCard({ note, onUpdate, onFlashcardConvert }: TSNoteCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [fields, setFields] = useState<{ [K in keyof Omit<TSNote, '_id' | 'content' | 'tags' | 'nickname'>]: string }>({
    importanceReason: note.importanceReason || '',
    momentContext: note.momentContext || '',
    relatedKnowledge: note.relatedKnowledge || '',
    mentalImage: note.mentalImage || '',
  });
  const [currentStep, setCurrentStep] = useState(1);

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

  // Field-specific placeholder examples for each question
  const placeholderMap: Record<keyof typeof fields, string> = {
    importanceReason: '예: 도서관의 고요함 속에서 이 문장을 메모했어요.',
    momentContext: '예: 해질녘 창가에 앉아 햇살을 바라보며 떠올랐어요.',
    relatedKnowledge: '예: 사회학 이론의 계층 구조와 연결되어요.',
    mentalImage: '예: 이 문장은 제 삶의 방향을 재정립해 주었어요.',
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
      <div className="flex justify-between items-start cursor-pointer" onClick={toggleOpen}>
        <div className="flex-1">
          <blockquote className="text-xl italic text-indigo-700 leading-relaxed mb-2">
            “{note.content}”
            <footer className="block text-sm text-gray-500 mt-2">— {note.nickname || '사용자'}</footer>
          </blockquote>
          <div className="flex flex-wrap gap-1">
            {note.tags.map((tag, i) => (
              <span key={i} className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs">
                #{tag}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center ml-4 gap-2">
          <button type="button" className="text-gray-400 hover:text-gray-600" aria-label="메모 편집">✎</button>
          {onFlashcardConvert && (
            <button
              type="button"
              className="text-purple-400 hover:text-purple-600 text-xs border border-purple-300 rounded px-2 py-1 mt-1"
              aria-label="플래시카드 변환"
              onClick={(e) => { e.stopPropagation(); onFlashcardConvert(note); }}
            >
              플래시카드 변환
            </button>
          )}
        </div>
      </div>
      {isOpen && (
        <div className="mt-4 space-y-6">
          {questions.map(({ key, label }, idx) => {
            if (idx + 1 > currentStep) return null;
            const lblId = `lbl-${note._id}-${key}`;
            return (
              <div
                key={key}
                className={`bg-white p-6 rounded-lg shadow-sm border-l-4 ${effectColorMap[key]} relative group hover:bg-gray-50`}
              >
                <div className="flex items-center">
                  <label
                    id={lblId}
                    className="text-base font-semibold text-gray-700 leading-7 mb-3"
                  >
                    {`${idx + 1}. ${label}`}
                  </label>
                  <div className="relative ml-2">
                    <AiOutlineQuestionCircle
                      className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer"
                      aria-describedby={`${lblId}-tip`}
                    />
                    <div
                      role="tooltip"
                      id={`${lblId}-tip`}
                      className="hidden absolute top-0 left-full ml-2 bg-gray-700 text-white text-xs rounded px-2 py-1 z-10 whitespace-nowrap group-hover:block"
                    >
                      {effectDescriptionMap[key]}
                    </div>
                  </div>
                </div>
                <textarea
                  name={key}
                  aria-labelledby={lblId}
                  value={fields[key] || ''}
                  onChange={(e) => handleChange(key, e.target.value)}
                  onBlur={() => handleBlur(key)}
                  className="w-full p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400 text-gray-900 leading-relaxed"
                  rows={2}
                  placeholder={placeholderMap[key]}
                />
                {/* Step-by-step 버튼 */}
                {idx + 1 === currentStep && (
                  <div className="flex justify-end mt-2">
                    {currentStep < questions.length ? (
                      <button
                        type="button"
                        className="px-4 py-1 bg-cyan-600 text-white rounded hover:bg-cyan-700 disabled:opacity-50"
                        disabled={!fields[key]?.trim()}
                        onClick={() => setCurrentStep((s) => s + 1)}
                      >
                        다음
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="px-4 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50"
                        disabled={Object.values(fields).some((v) => !v.trim())}
                        onClick={() => setIsOpen(false)}
                      >
                        완료
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
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