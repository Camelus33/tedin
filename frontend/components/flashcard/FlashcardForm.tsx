import React, { useState } from 'react';
import { flashcardApi, Flashcard } from '@/lib/api';
import { TSNote } from '@/components/ts/TSNoteCard';
import { QuestionMarkCircleIcon, CheckCircleIcon, XCircleIcon, PlusCircleIcon, PencilSquareIcon } from '@heroicons/react/24/solid';

// [TS메모카드→플래시카드 변환 연계 가이드]
// - 이 컴포넌트는 TSNoteCard(메모진화 시스템)에서 플래시카드 변환(onFlashcardConvert) 요청 시 사용됩니다.
// - note(메모) 기반으로 플래시카드 생성 시 /api/flashcards/from-memo API를 호출하며, 메모의 내용(content)이 기본 문제(question)로 사용됩니다.
// - 생성된 플래시카드는 onCreated 콜백으로 상위 상태에 전달되어, 반복 복습(SRS) 등에서 활용됩니다.
// - editId가 있으면 기존 플래시카드 수정, 없으면 새로 생성합니다.
// - UX: 생성/수정/에러 피드백, 입력값 검증, API 연동, 취소(onCancel) 등 직관적 피드백 제공.
// - 보안: 저장/수정 시 JWT 토큰 필요, 인증 실패 시 동작 제한.
// - 유지보수 시 TSNoteCard, BookDetailPage, flashcardApi, 인증/보안 연동을 반드시 함께 점검하세요.

interface FlashcardFormProps {
  note?: TSNote;
  bookId: string;
  pageStart?: number;
  pageEnd?: number;
  onCreated: (card: Flashcard) => void;
  onCancel: () => void;
  questionDefault?: string;
  answerDefault?: string;
  editId?: string;
}

const FlashcardForm: React.FC<FlashcardFormProps> = ({ note, bookId, pageStart, pageEnd, onCreated, onCancel, questionDefault, answerDefault, editId }) => {
  const [question, setQuestion] = useState(note ? note.content : questionDefault || '');
  const [answer, setAnswer] = useState(answerDefault || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let card;
      if (editId) {
        card = await flashcardApi.update(editId, {
          question,
          answer,
        });
      } else if (note) {
        card = await flashcardApi.fromMemo({
          memoId: note._id,
          question,
          answer,
        });
      } else {
        card = await flashcardApi.create({
          bookId,
          question,
          answer,
          sourceText: question,
        });
      }
      onCreated(card);
    } catch (err: any) {
      setError(err.message || '플래시카드 생성 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl border-0 p-8 max-w-md mx-auto mt-8">
      <div className="flex flex-col items-center mb-6">
        <QuestionMarkCircleIcon className="w-10 h-10 text-indigo-700 mb-2" />
        <h3 className="text-2xl font-bold text-indigo-800 mb-1 tracking-tight">{editId ? '플래시카드 수정' : '플래시카드 생성'}</h3>
        {note && <div className="mb-2 text-xs text-gray-400 text-center">출처: "{note.content}"</div>}
      </div>
      <div className="mb-6 flex flex-col gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="relative group">
              <QuestionMarkCircleIcon className="w-6 h-6 text-indigo-700" aria-label="질문(앞면)" />
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10 transition-opacity">
                질문(앞면): 플래시카드의 문제를 입력하세요
              </div>
            </div>
          </div>
          <input
            type="text"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            className="w-full p-3 rounded-xl border-2 border-indigo-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition shadow-sm placeholder-gray-400"
            placeholder="예: 이 개념의 핵심은 무엇인가요?"
            required
          />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="relative group">
              <CheckCircleIcon className="w-6 h-6 text-green-600" aria-label="정답(뒷면)" />
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10 transition-opacity">
                정답(뒷면): 플래시카드의 답을 입력하세요
              </div>
            </div>
          </div>
          <input
            type="text"
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            className="w-full p-3 rounded-xl border-2 border-indigo-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition shadow-sm placeholder-gray-400"
            placeholder="예: 기억법, 공식, 요약 등"
            required
          />
        </div>
      </div>
      {error && <div className="text-red-500 mb-4 flex items-center gap-2"><span>⚠️</span>{error}</div>}
      <div className="flex gap-3 justify-end mt-6">
        <div className="relative group">
          <button type="button" onClick={onCancel} aria-label="취소" title="취소" className="p-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition shadow-sm flex items-center justify-center">
            <XCircleIcon className="w-6 h-6" />
          </button>
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10 transition-opacity">
            취소
          </div>
        </div>
        <div className="relative group">
          <button type="submit" disabled={loading} aria-label={editId ? '수정' : '생성'} title={editId ? '수정' : '생성'} className="p-2 rounded-lg bg-indigo-700 text-white font-bold shadow-md hover:bg-indigo-800 transition disabled:opacity-50 flex items-center justify-center">
            {loading ? (
              <span className="animate-spin mr-1">⏳</span>
            ) : (
              editId ? <PencilSquareIcon className="w-6 h-6" /> : <PlusCircleIcon className="w-6 h-6" />
            )}
          </button>
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10 transition-opacity">
            {editId ? '수정' : '생성'}
          </div>
        </div>
      </div>
    </form>
  );
};

export default FlashcardForm; 