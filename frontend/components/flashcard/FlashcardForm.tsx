import React, { useState, useEffect } from 'react';
import { flashcardApi, Flashcard } from '@/lib/api';
import { TSNote } from '@/components/ts/TSNoteCard';
import { QuestionMarkCircleIcon, CheckCircleIcon, XCircleIcon, PlusCircleIcon } from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

// Cyber Theme (FlashcardDeck과 일관성을 위해 정의)
const cyberTheme = {
  primary: 'text-cyan-400',
  secondary: 'text-purple-400',
  inputBg: 'bg-gray-700/50',
  inputBorder: 'border-gray-600',
  buttonPrimaryBg: 'bg-purple-600',
  buttonPrimaryHoverBg: 'hover:bg-purple-700',
  buttonSecondaryBg: 'bg-gray-600',
  buttonSecondaryHoverBg: 'hover:bg-gray-500',
  textLight: 'text-gray-200',
  textMuted: 'text-gray-400',
  errorText: 'text-red-400',
  formBg: 'bg-gray-800/80', // Form 배경색 변경
  labelColor: 'text-cyan-300',
};

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
  isEditing?: boolean;
}

const FlashcardForm: React.FC<FlashcardFormProps> = ({ note, bookId, pageStart, pageEnd, onCreated, onCancel, questionDefault, answerDefault, editId, isEditing }) => {
  const [question, setQuestion] = useState(questionDefault || (note ? note.content : ''));
  const [answer, setAnswer] = useState(answerDefault || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setQuestion(questionDefault || (note ? note.content : ''));
    setAnswer(answerDefault || '');
  }, [questionDefault, answerDefault, note, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) {
      setError('질문과 답변을 모두 입력해주세요.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let card;
      const currentSourceText = note ? note.content : question;

      // API 페이로드 명시적 구성
      const apiPayload: {
        bookId: string;
        question: string;
        answer: string;
        sourceText: string;
        tsNoteId?: string;
        tsSessionId?: string;
        pageStart?: number;
        pageEnd?: number;
      } = {
        bookId,
        question,
        answer,
        sourceText: currentSourceText,
      };

      if (note) {
        apiPayload.tsNoteId = note._id;
        if (note.originSession !== undefined) { // note.originSession 사용 및 undefined 체크
          apiPayload.tsSessionId = note.originSession;
        }
      }
      if (pageStart !== undefined) {
        apiPayload.pageStart = pageStart;
      }
      if (pageEnd !== undefined) {
        apiPayload.pageEnd = pageEnd;
      }

      if (isEditing && editId) {
        card = await flashcardApi.update(editId, apiPayload); 
      } else if (note) { // TSNote에서 새로 생성하는 경우 (isEditing=false, editId=null)
        // fromMemo API는 다른 payload를 기대할 수 있으므로, 필요시 fromMemo용 payload 별도 구성
        // 여기서는 question, answer만 사용하고 memoId를 전달하는 기존 방식을 유지
        card = await flashcardApi.fromMemo({
          memoId: note._id,
          question: apiPayload.question, // 사용자가 수정한 question 사용
          answer: apiPayload.answer,   // 사용자가 입력한 answer 사용
        });
      } else { // 순수하게 새로 생성하는 경우
        card = await flashcardApi.create(apiPayload);
      }
      onCreated(card);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || '플래시카드 처리 중 오류 발생');
    } finally {
      setLoading(false);
    }
  };

  const formTitle = isEditing ? '플래시카드 수정' : '새 플래시카드 생성';

  return (
    <form onSubmit={handleSubmit} className={`p-2 sm:p-6 rounded-lg shadow-xl ${cyberTheme.formBg} border border-gray-700/50`}>
      <h3 className={`text-lg sm:text-xl font-semibold ${cyberTheme.primary} mb-2 sm:mb-6 text-center`}>{formTitle}</h3>
      
      <div className="space-y-3 sm:space-y-6 mb-3 sm:mb-6">
        <div>
          <label htmlFor="flashcard-question" className={`block text-sm font-medium ${cyberTheme.labelColor} mb-1 sm:mb-1.5`}>질문 (앞면)</label>
          <Textarea
            id="flashcard-question"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            className={`w-full p-2 sm:p-3 rounded-md ${cyberTheme.inputBg} ${cyberTheme.inputBorder} ${cyberTheme.textLight} placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500/50 min-h-[60px] sm:min-h-[80px]`}
            placeholder="예: 이 개념의 핵심은 무엇인가요?"
            required
          />
        </div>
        <div>
          <label htmlFor="flashcard-answer" className={`block text-sm font-medium ${cyberTheme.labelColor} mb-1 sm:mb-1.5`}>정답 (뒷면)</label>
          <Textarea
            id="flashcard-answer"
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            className={`w-full p-2 sm:p-3 rounded-md ${cyberTheme.inputBg} ${cyberTheme.inputBorder} ${cyberTheme.textLight} placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500/50 min-h-[60px] sm:min-h-[80px]`}
            placeholder="예: 기억법, 공식, 요약 등"
            required
          />
        </div>
      </div>

      {error && <p className={`text-sm ${cyberTheme.errorText} mb-2 sm:mb-4 text-center`}>{error}</p>}

      <div className="flex gap-2 sm:gap-3 justify-end mt-3 sm:mt-8">
        <Button 
          type="button" 
          onClick={onCancel} 
          variant="outline"
          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-md border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-150 flex items-center justify-center p-0`}
          title="취소"
          aria-label="취소"
        >
          <XCircleIcon className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>
        <Button 
          type="submit" 
          disabled={loading}
          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-md ${cyberTheme.buttonPrimaryBg} ${cyberTheme.buttonPrimaryHoverBg} text-white font-semibold transition-colors duration-150 disabled:opacity-60 flex items-center justify-center p-0`}
          title={isEditing ? "변경사항 저장" : "플래시카드 생성"}
          aria-label={isEditing ? "변경사항 저장" : "플래시카드 생성"}
        >
          {loading ? <span className="animate-spin h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent rounded-full"></span> : (isEditing ? <CheckCircleIcon className="h-5 w-5 sm:h-6 sm:w-6" /> : <PlusCircleIcon className="h-5 w-5 sm:h-6 sm:w-6" />)}
        </Button>
      </div>
    </form>
  );
};

export default FlashcardForm; 