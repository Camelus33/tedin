import React, { useState } from 'react';
import { flashcardApi, Flashcard } from '@/lib/api';
import { TSNote } from '@/components/ts/TSNoteCard';

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
    <form onSubmit={handleSubmit} className="bg-gray-900/90 p-6 rounded-lg border border-cyan-500/40 max-w-lg mx-auto mt-6">
      <h3 className="text-lg font-bold text-purple-300 mb-2">{editId ? '플래시카드 수정' : '플래시카드 생성'}</h3>
      {note && <div className="mb-2 text-xs text-gray-400">출처: "{note.content}"</div>}
      <div className="mb-4 flex flex-col gap-4">
        <div>
          <label className="block text-sm text-cyan-300 mb-1">질문(앞면)</label>
          <input
            type="text"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            className="w-full p-2 rounded border border-cyan-500/30 bg-gray-800 text-white"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-cyan-300 mb-1">정답(뒷면)</label>
          <input
            type="text"
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            className="w-full p-2 rounded border border-cyan-500/30 bg-gray-800 text-white"
            required
          />
        </div>
      </div>
      {error && <div className="text-red-400 mb-2">{error}</div>}
      <div className="flex gap-2 justify-end mt-4">
        <button type="button" onClick={onCancel} className="px-3 py-1 rounded bg-gray-700 text-gray-300 hover:bg-gray-600">취소</button>
        <button type="submit" disabled={loading} className="px-4 py-1 rounded bg-cyan-600 text-white hover:bg-cyan-700 disabled:opacity-50">
          {loading ? (editId ? '수정 중...' : '생성 중...') : (editId ? '수정' : '생성')}
        </button>
      </div>
    </form>
  );
};

export default FlashcardForm; 