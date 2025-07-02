"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft, FiPlus, FiBookOpen } from "react-icons/fi";

interface Notebook {
  _id: string;
  title: string;
  author: string;
  bookType: 'NOTEBOOK';
  createdAt: string;
}

type MemoType = 'thought' | 'quote' | 'question';

export default function NewMemoPage() {
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

  const getMemoTypeLabel = (type: MemoType) => {
    switch (type) {
      case 'thought': return '💭 생각';
      case 'quote': return '💬 인용';
      case 'question': return '❓ 질문';
      default: return type;
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-cyan-400 text-lg">노트북을 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 py-6 px-2 sm:px-4 text-gray-200 font-sans">
      <div className="max-w-2xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <Link 
            href="/dashboard" 
            className="flex items-center text-cyan-400 hover:text-cyan-300 transition-colors text-sm"
          >
            <FiArrowLeft className="w-4 h-4 mr-2" />
            대시보드로 돌아가기
          </Link>
        </div>

        {/* 메인 카드 */}
        <div className="bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-cyan-500/10 border border-cyan-500/40 p-6">
          <h1 className="text-2xl font-bold text-cyan-300 mb-6 font-orbitron tracking-wide">
            ✍️ Atomic Memo
          </h1>
          
          {error && (
            <div className="bg-red-900/30 border border-red-500/50 text-red-300 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. 노트북 선택 */}
            <div>
              <label className="block text-sm font-semibold text-cyan-300 mb-3">
                📔 노트북 선택
              </label>
              <div className="flex gap-3">
                <select
                  value={selectedNotebook}
                  onChange={(e) => setSelectedNotebook(e.target.value)}
                  className="flex-1 px-4 py-3 border border-cyan-500/40 rounded-lg bg-gray-700/60 focus:ring-2 focus:ring-cyan-400/60 focus:border-cyan-400 text-gray-100 font-mono transition-all"
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
                  className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <FiPlus className="w-4 h-4" />
                  NEW
                </button>
              </div>
            </div>

            {/* 2. 메모 타입 선택 */}
            <div>
              <label className="block text-sm font-semibold text-cyan-300 mb-3">
                💭 메모 타입
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['thought', 'quote', 'question'] as MemoType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setMemoType(type)}
                    className={`px-4 py-3 rounded-lg border transition-all text-sm font-medium ${
                      memoType === type
                        ? 'bg-cyan-600/30 border-cyan-400 text-cyan-300'
                        : 'bg-gray-700/40 border-gray-600 text-gray-300 hover:bg-gray-700/60 hover:border-gray-500'
                    }`}
                  >
                    {getMemoTypeLabel(type)}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. 1줄 메모 입력 */}
            <div>
              <label className="block text-sm font-semibold text-cyan-300 mb-3">
                ✍️ 1줄 메모
              </label>
              <textarea
                value={memoContent}
                onChange={(e) => setMemoContent(e.target.value)}
                placeholder={getMemoTypePlaceholder(memoType)}
                rows={3}
                className="w-full px-4 py-3 border border-cyan-500/40 rounded-lg bg-gray-700/60 focus:ring-2 focus:ring-cyan-400/60 focus:border-cyan-400 text-gray-100 font-mono transition-all resize-none"
                required
              />
              <div className="text-xs text-gray-400 mt-1">
                {memoContent.length}/200자
              </div>
            </div>

            {/* 4. 태그 입력 */}
            <div>
              <label className="block text-sm font-semibold text-cyan-300 mb-3">
                🏷️ 태그 (선택사항)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="태그1, 태그2, 태그3 (쉼표로 구분)"
                className="w-full px-4 py-3 border border-cyan-500/40 rounded-lg bg-gray-700/60 focus:ring-2 focus:ring-cyan-400/60 focus:border-cyan-400 text-gray-100 font-mono transition-all"
              />
              <div className="text-xs text-gray-400 mt-1">
                쉼표(,)로 태그를 구분해주세요
              </div>
            </div>

            {/* 제출 버튼 */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !selectedNotebook || !memoContent.trim()}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 via-purple-500 to-emerald-400 hover:from-cyan-400 hover:to-purple-400 text-white font-bold rounded-lg shadow-cyan-500/20 hover:shadow-cyan-400/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '저장 중...' : '메모 저장하기'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 