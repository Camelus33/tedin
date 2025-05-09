import React, { useEffect, useState } from 'react';
import { flashcardApi, Flashcard, books } from '@/lib/api';
import FlashcardForm from './FlashcardForm';

interface FlashcardDeckProps {
  bookId: string;
}

const FlashcardDeck: React.FC<FlashcardDeckProps> = ({ bookId }) => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flipped, setFlipped] = useState<{ [id: string]: boolean }>({});
  const [reviewing, setReviewing] = useState<{ [id: string]: boolean }>({});
  const [reviewed, setReviewed] = useState<{ [id: string]: boolean }>({});
  const [bookTitle, setBookTitle] = useState<string>('');
  const [userAnswers, setUserAnswers] = useState<{ [id: string]: string }>({});
  const [answerChecked, setAnswerChecked] = useState<{ [id: string]: boolean }>({});
  const [isCorrect, setIsCorrect] = useState<{ [id: string]: boolean }>({});
  const [feedback, setFeedback] = useState<{ [id: string]: string }>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);

  const fetchDeck = () => {
    setLoading(true);
    flashcardApi.list({ bookId })
      .then((data) => {
        setFlashcards(Array.isArray(data) ? data : data.flashcards || []);
      })
      .catch((e) => setError(e.message || '플래시카드 불러오기 실패'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!bookId) return;
    fetchDeck();
    books.getById(bookId)
      .then((data) => setBookTitle(data.title || ''))
      .catch(() => setBookTitle(''));
    // eslint-disable-next-line
  }, [bookId]);

  const handleFlip = (id: string) => {
    setFlipped((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleInputChange = (id: string, value: string) => {
    setUserAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleCheckAnswer = (id: string, correctAnswer: string) => {
    const userAnswer = (userAnswers[id] || '').trim();
    const isAnswerCorrect = userAnswer.localeCompare(correctAnswer.trim(), undefined, { sensitivity: 'base' }) === 0;
    setAnswerChecked((prev) => ({ ...prev, [id]: true }));
    setIsCorrect((prev) => ({ ...prev, [id]: isAnswerCorrect }));
    if (isAnswerCorrect) {
      setFeedback((prev) => ({ ...prev, [id]: '정답입니다! 잘 기억해냈어요. 왜 이 답을 떠올릴 수 있었는지 10초간 떠올려보세요.' }));
    } else {
      setFeedback((prev) => ({ ...prev, [id]: '오답입니다. 정답을 다시 확인하고, 내가 왜 다른 답을 썼는지 생각해보세요. 다시 시도해도 좋아요!' }));
    }
  };

  const handleBackToQuestion = (id: string) => {
    setAnswerChecked((prev) => ({ ...prev, [id]: false }));
    setUserAnswers((prev) => ({ ...prev, [id]: '' }));
    setFeedback((prev) => ({ ...prev, [id]: '' }));
    setIsCorrect((prev) => ({ ...prev, [id]: false }));
    setFlipped((prev) => ({ ...prev, [id]: false }));
  };

  // 수정 저장 핸들러
  const handleEditSaved = () => {
    setEditingId(null);
    setEditingCard(null);
    fetchDeck();
  };

  // 삭제 핸들러
  const handleDelete = async (id: string) => {
    if (!window.confirm('정말로 이 플래시카드를 삭제하시겠습니까?')) return;
    try {
      await flashcardApi.delete(id);
      fetchDeck();
    } catch (e) {
      alert((e as any).message || '삭제 실패');
    }
  };

  if (loading) return <div className="text-cyan-400">플래시카드 불러오는 중...</div>;
  if (error) return <div className="text-red-400">{error}</div>;
  if (flashcards.length === 0) return <div className="text-gray-400">플래시카드가 없습니다.</div>;

  return (
    <div className="space-y-4 mt-4">
      {flashcards.map((card) => (
        <div key={card._id} className="bg-gray-800/60 rounded-lg p-4 border border-cyan-500/30 relative">
          {/* 수정/삭제 버튼 */}
          <div className="absolute top-2 right-2 flex gap-1">
            <button
              className="px-2 py-0.5 rounded bg-gray-700 text-cyan-300 text-xs hover:bg-gray-600 border border-cyan-500/30"
              onClick={() => {
                setEditingId(card._id!);
                setEditingCard(card);
              }}
            >수정</button>
            <button
              className="px-2 py-0.5 rounded bg-gray-700 text-red-300 text-xs hover:bg-gray-600 border border-red-500/30"
              onClick={() => handleDelete(card._id!)}
            >삭제</button>
          </div>
          {/* 수정 모드 */}
          {editingId === card._id ? (
            <FlashcardForm
              bookId={bookId}
              questionDefault={editingCard?.question}
              answerDefault={editingCard?.answer}
              onCreated={handleEditSaved}
              onCancel={() => { setEditingId(null); setEditingCard(null); }}
              editId={editingId}
            />
          ) : (
            <>
              {/* 앞면: 질문, 답 입력, 확인 버튼 */}
              {!flipped[card._id!] ? (
                !answerChecked[card._id!] ? (
                  <>
                    <div className="font-bold text-cyan-300 mb-2 text-lg">Q. {card.question}</div>
                    <div className="flex flex-row gap-2 items-center mb-2">
                      <input
                        type="text"
                        value={userAnswers[card._id!] || ''}
                        onChange={e => handleInputChange(card._id!, e.target.value)}
                        className="w-2/3 max-w-lg p-2 rounded border border-cyan-500/30 bg-gray-800 text-white"
                        placeholder="여기에 답을 입력하세요"
                        onKeyDown={e => { if (e.key === 'Enter') handleCheckAnswer(card._id!, card.answer); }}
                      />
                      <button
                        className="px-3 py-1 rounded bg-purple-700 text-white text-xs hover:bg-purple-800 shrink-0"
                        onClick={() => handleCheckAnswer(card._id!, card.answer)}
                        disabled={!userAnswers[card._id!] || userAnswers[card._id!].trim() === ''}
                      >확인</button>
                    </div>
                  </>
                ) : (
                  // 답 체크 후: 정답/오답 피드백, 정답 표시, 질문으로 돌아가기
                  <>
                    <div className="font-bold text-cyan-300 mb-2 text-lg">Q. {card.question}</div>
                    <div className={`mb-2 text-base ${isCorrect[card._id!] ? 'text-emerald-400' : 'text-red-400'}`}>{feedback[card._id!]}</div>
                    <div className="text-gray-200 mb-2 text-base">정답: {card.answer}</div>
                    <div className="text-xs text-gray-400 mb-2">
                      책: <span className="text-cyan-200 font-semibold">{bookTitle || '(제목 정보 없음)'}</span>
                      {card.pageStart && <> | p.{card.pageStart}{card.pageEnd ? `~${card.pageEnd}` : ''}</>}
                      {card.sourceText && <> | "{card.sourceText}"</>}
                      {card.tsSessionId && <> | TS 세션: {card.tsSessionId}</>}
                    </div>
                    <button
                      className="px-2 py-1 rounded bg-gray-700 text-gray-200 text-xs hover:bg-gray-600 border border-gray-500"
                      onClick={() => handleBackToQuestion(card._id!)}
                    >질문으로 돌아가기</button>
                  </>
                )
              ) : null}
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default FlashcardDeck; 