import React, { useEffect, useState } from 'react';
import { flashcardApi, Flashcard, books } from '@/lib/api';
import FlashcardForm from './FlashcardForm';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisVerticalIcon, PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const cyberTheme = {
  primary: 'text-cyan-400',
  secondary: 'text-purple-400',
  cardBg: 'bg-gray-800/70',
  inputBg: 'bg-gray-700/50',
  inputBorder: 'border-gray-600',
  buttonPrimaryBg: 'bg-purple-600',
  buttonPrimaryHoverBg: 'hover:bg-purple-700',
  textLight: 'text-gray-200',
  textMuted: 'text-gray-400',
  menuBg: 'bg-gray-700',
  menuItemHover: 'hover:bg-gray-600',
  borderPrimary: 'border-cyan-500',
  borderSecondary: 'border-purple-500',
  errorText: 'text-red-400',
  successText: 'text-emerald-400',
};

interface FlashcardDeckProps {
  bookId: string;
  memoId?: string; // 특정 메모의 복습카드만 필터링하기 위한 옵션
}

const FlashcardDeck: React.FC<FlashcardDeckProps> = ({ bookId, memoId }) => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookTitle, setBookTitle] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAnswerFor, setShowAnswerFor] = useState<{ [id: string]: boolean }>({});

  const fetchDeck = () => {
    setLoading(true);
    flashcardApi.list({ bookId })
      .then((data) => {
        let allFlashcards = Array.isArray(data) ? data : data.flashcards || [];
        
        // memoId가 제공된 경우 해당 메모의 복습카드만 필터링
        if (memoId) {
          allFlashcards = allFlashcards.filter((card: Flashcard) => card.memoId === memoId);
        }
        
        setFlashcards(allFlashcards);
        setShowAnswerFor({});
      })
              .catch((e) => setError(e.message || '복습 카드 불러오기 실패'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!bookId) return;
    fetchDeck();
    books.getById(bookId)
      .then((data) => setBookTitle(data.title || ''))
      .catch(() => setBookTitle(''));
  }, [bookId, memoId]);

  const toggleShowAnswer = (id: string) => {
    setShowAnswerFor(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleEditSaved = () => {
    setEditingId(null);
    fetchDeck();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('정말로 이 복습 카드를 삭제하시겠습니까?')) return;
    try {
      await flashcardApi.delete(id);
      fetchDeck();
    } catch (e) {
      alert((e as any).message || '삭제 실패');
    }
  };

      if (loading) return <div className={`text-center py-10 ${cyberTheme.textMuted}`}>복습 카드 불러오는 중...</div>;
  if (error) return <div className={`text-center py-10 ${cyberTheme.errorText}`}>{error}</div>;
  
  return (
    <div className="space-y-6 mt-6">
      {flashcards.length === 0 && (
        <div className={`text-center py-10 ${cyberTheme.textMuted}`}>복습 카드가 없습니다.</div>
      )}

      {flashcards.map((card) => (
        <div key={card._id} className={`${cyberTheme.cardBg} rounded-xl p-5 shadow-lg border ${cyberTheme.borderPrimary}/20 relative transition-all duration-300 hover:shadow-cyan-500/20`}>
          <div className="absolute bottom-3 right-3 z-10">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className={`text-gray-400 hover:text-cyan-300 p-1.5`}>
                  <EllipsisVerticalIcon className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className={`${cyberTheme.menuBg} border ${cyberTheme.inputBorder}`}>
                <DropdownMenuItem 
                  onClick={() => {
                    setEditingId(card._id!);
                  }}
                  className={`${cyberTheme.menuItemHover} ${cyberTheme.textLight} cursor-pointer flex items-center px-3 py-2 text-sm`}
                >
                  <PencilIcon className={`h-4 w-4 mr-2 ${cyberTheme.primary}`} /> 수정하기
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleDelete(card._id!)} 
                  className={`${cyberTheme.menuItemHover} ${cyberTheme.errorText} hover:!text-red-300 cursor-pointer flex items-center px-3 py-2 text-sm`}
                >
                  <TrashIcon className="h-4 w-4 mr-2" /> 삭제하기
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {editingId === card._id ? (
            <FlashcardForm
              bookId={bookId}
              questionDefault={card.question}
              answerDefault={card.answer}
              onCreated={handleEditSaved}
              onCancel={() => { setEditingId(null); }}
              editId={editingId}
              isEditing
            />
          ) : (
            <div className="space-y-4">
              <div className="flex items-start">
                <span className={`font-semibold ${cyberTheme.primary} text-xl mr-2 mt-0.5`}>Q.</span>
                <p className={`${cyberTheme.textLight} text-lg leading-relaxed break-words whitespace-pre-wrap`}>{card.question}</p>
              </div>

              {showAnswerFor[card._id!] && (
                <div className="pt-3 border-t border-gray-700/50 mt-3">
                  <div className="flex items-start">
                    <span className={`font-semibold ${cyberTheme.secondary} text-xl mr-2 mt-0.5`}>A.</span>
                    <p className={`${cyberTheme.textLight} text-lg leading-relaxed break-words whitespace-pre-wrap`}>{card.answer}</p>
                  </div>
                  <div className={`text-xs ${cyberTheme.textMuted} mt-2 pl-8`}>
                    책: <span className={`${cyberTheme.secondary} font-medium`}>{bookTitle || '정보 없음'}</span>
                    {card.pageStart && <> | 페이지: {card.pageStart}{card.pageEnd ? `-${card.pageEnd}` : ''}</>}
                  </div>
                </div>
              )}

              <div className="mt-4 flex justify-start">
                <Button
                  variant="outline"
                  className={`px-4 py-2 rounded-md border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white text-sm transition-colors duration-150 flex items-center`}
                  onClick={() => toggleShowAnswer(card._id!)}
                >
                  {showAnswerFor[card._id!] ? <EyeSlashIcon className="h-5 w-5 mr-2" /> : <EyeIcon className="h-5 w-5 mr-2" />}
                  {showAnswerFor[card._id!] ? '정답 숨기기' : '정답 보기'}
                </Button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FlashcardDeck; 