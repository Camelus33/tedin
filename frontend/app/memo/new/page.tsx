"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeftIcon, 
  PlusIcon,
  LightBulbIcon,
  ChatBubbleLeftIcon,
  QuestionMarkCircleIcon,
  XMarkIcon,
  CheckIcon
} from "@heroicons/react/24/outline";

interface Notebook {
  _id: string;
  title: string;
  author: string;
  bookType: 'NOTEBOOK';
  createdAt: string;
}

type MemoType = 'thought' | 'quote' | 'question';

function NewMemoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // URL에서 미리 선택된 노트북 ID 가져오기
  const preselectedNotebook = searchParams.get('notebook');
  
  // 상태 관리
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [selectedNotebook, setSelectedNotebook] = useState<string>('');
  const [memoType, setMemoType] = useState<MemoType>('thought');
  const [memoContent, setMemoContent] = useState('');
  const [tags, setTags] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // 노트북 목록 가져오기
  useEffect(() => {
    fetchNotebooks();
  }, []);

  // 미리 선택된 노트북이 있으면 설정
  useEffect(() => {
    if (preselectedNotebook && notebooks.length > 0) {
      const notebook = notebooks.find(nb => nb._id === preselectedNotebook);
      if (notebook) {
        setSelectedNotebook(preselectedNotebook);
      }
    }
  }, [preselectedNotebook, notebooks]);

  const fetchNotebooks = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch('/api/books?bookType=NOTEBOOK', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('노트북 목록을 가져오는데 실패했습니다.');
      }

      const data = await response.json();
      setNotebooks(data);
      
      // 노트북이 하나도 없으면 생성 페이지로 리다이렉트
      if (data.length === 0) {
        router.push('/books/new?type=notebook');
        return;
      }
      
      // 미리 선택된 노트북이 없고 노트북이 1개뿐이면 자동 선택
      if (!preselectedNotebook && data.length === 1) {
        setSelectedNotebook(data[0]._id);
      }
      
    } catch (error) {
      console.error('노트북 목록 가져오기 실패:', error);
      setError('노트북 목록을 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedNotebook) {
      setError('노트북을 선택해주세요.');
      return;
    }
    
    if (!memoContent.trim()) {
      setError('메모 내용을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookId: selectedNotebook,
          content: memoContent.trim(),
          type: memoType,
          tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
          page: 1, // 노트북은 페이지 개념이 없으므로 기본값
        }),
      });

      if (!response.ok) {
        throw new Error('메모 저장에 실패했습니다.');
      }

      // 성공 시 해당 노트북 페이지로 이동
      router.push(`/books/${selectedNotebook}`);
      
    } catch (error) {
      console.error('메모 저장 실패:', error);
      setError('메모 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewNotebook = () => {
    router.push('/books/new?type=notebook');
  };

  const getMemoTypeIcon = (type: MemoType) => {
    switch (type) {
      case 'thought': 
        return <LightBulbIcon className="w-5 h-5" />;
      case 'quote': 
        return <ChatBubbleLeftIcon className="w-5 h-5" />;
      case 'question': 
        return <QuestionMarkCircleIcon className="w-5 h-5" />;
      default: 
        return <LightBulbIcon className="w-5 h-5" />;
    }
  };

  const getMemoTypePlaceholder = (type: MemoType) => {
    switch (type) {
      case 'thought': return '오늘 떠오른 생각을 한 줄로 적어보세요...';
      case 'quote': return '인상 깊었던 문구나 말을 적어보세요...';
      case 'question': return '궁금한 점이나 질문을 적어보세요...';
      default: return '메모를 입력하세요...';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 flex items-center justify-center px-4">
        <div className="text-cyan-400 text-sm">노트북을 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 py-4 px-4 text-gray-200 font-sans flex items-center justify-center">
      <div className="w-full max-w-md mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <Link 
            href="/dashboard" 
            className="flex items-center text-cyan-400 hover:text-cyan-300 transition-colors text-sm"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            대시보드로 돌아가기
          </Link>
        </div>

        {/* 메인 카드 - 포스트잇 스타일 */}
        <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 border border-yellow-300/50 shadow-lg shadow-yellow-600/30 transform rotate-1 hover:rotate-0 transition-all duration-300 relative p-6 !rounded-none">
          {/* 포스트잇 접힌 모서리 효과 */}
          <div className="absolute top-0 right-0 w-3 h-3 bg-gradient-to-bl from-black/15 to-transparent transform rotate-45 translate-x-1 -translate-y-1"></div>
          
          <h1 className="text-xl font-bold text-gray-800 mb-4 font-orbitron tracking-wide text-center">
            Atomic Memo
          </h1>
          
          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 p-3 rounded mb-3 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 1. 노트북 선택 */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">노트북 선택</label>
              <div className="flex gap-2">
                <select
                  value={selectedNotebook}
                  onChange={(e) => setSelectedNotebook(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 text-sm"
                  required
                >
                  <option value="">노트북을 선택하세요</option>
                  {notebooks.map((notebook) => (
                    <option key={notebook._id} value={notebook._id}>
                      {notebook.title}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleNewNotebook}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors flex items-center justify-center text-sm font-medium min-w-[40px]"
                  title="새 노트북 만들기"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 2. 메모 타입 선택 */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">메모 유형</label>
              <div className="grid grid-cols-3 gap-2">
                {(['thought', 'quote', 'question'] as MemoType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setMemoType(type)}
                    className={`px-3 py-2 border transition-all text-sm font-medium flex items-center justify-center gap-1 ${
                      memoType === type
                        ? 'bg-indigo-100 border-indigo-400 text-indigo-700'
                        : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400'
                    }`}
                    title={type === 'thought' ? '생각' : type === 'quote' ? '인용' : '질문'}
                  >
                    {getMemoTypeIcon(type)}
                    <span className="text-xs">
                      {type === 'thought' ? '생각' : type === 'quote' ? '인용' : '질문'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. 메모 입력 */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">메모 내용</label>
              <textarea
                value={memoContent}
                onChange={(e) => setMemoContent(e.target.value)}
                placeholder={getMemoTypePlaceholder(memoType)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 resize-none text-sm"
                required
              />
              <div className="text-xs text-gray-500 mt-1 text-right">
                {memoContent.length}/200자
              </div>
            </div>

            {/* 4. 태그 입력 */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">태그</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="태그1, 태그2, 태그3"
                className="w-full px-3 py-2 border border-gray-300 rounded bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 text-sm"
              />
              <div className="text-xs text-gray-500 mt-1">
                쉼표(,)로 태그를 구분해주세요
              </div>
            </div>

            {/* 제출 버튼 */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (selectedNotebook) {
                    router.push(`/books/${selectedNotebook}`);
                  } else {
                    router.back();
                  }
                }}
                className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded transition-colors text-sm flex items-center justify-center gap-2"
                disabled={isSubmitting}
              >
                <XMarkIcon className="w-4 h-4" />
                취소
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !selectedNotebook || !memoContent.trim()}
                className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
              >
                <CheckIcon className="w-4 h-4" />
                {isSubmitting ? '저장 중...' : '저장'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Suspense로 감싸진 기본 export 컴포넌트
export default function NewMemoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 flex items-center justify-center px-4">
        <div className="text-cyan-400 text-sm">로딩 중...</div>
      </div>
    }>
      <NewMemoContent />
    </Suspense>
  );
} 