'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Button from '@/components/common/Button';

type Book = {
  _id: string;
  title: string;
  author: string;
};

type NoteFormData = {
  content: string;
  type: 'quote' | 'thought' | 'question';
  tags: string[];
};

export default function NewNotePage() {
  const router = useRouter();
  const params = useParams();
  const bookId = params.id as string;
  
  const [book, setBook] = useState<Book | null>(null);
  const [formData, setFormData] = useState<NoteFormData>({
    content: '',
    type: 'thought',
    tags: [],
  });
  const [tagInput, setTagInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  // Fetch book info
  useEffect(() => {
    const fetchBookInfo = async () => {
      if (!bookId) return;

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/auth/login');
          return;
        }

        const response = await fetch(`/api/books/${bookId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('함께할 책 정보를 불러오는 데 잠시 문제가 생겼어요.');
        }

        const data = await response.json();
        setBook(data.book);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookInfo();
  }, [bookId, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTypeSelect = (type: 'quote' | 'thought' | 'question') => {
    setFormData(prev => ({
      ...prev,
      type,
    }));
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault(); // Prevent form submission
      addTag(tagInput.trim());
    }
  };

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Validate
      if (!formData.content.trim()) {
        throw new Error('어떤 생각을 하셨는지 알려주세요. 작은 조각이라도 소중해요.');
      }

      // Submit note
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          ...formData,
          bookId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '생각의 조각을 저장하는 데 잠시 문제가 생겼어요. 다시 시도해 주세요.');
      }

      // Return to book detail page
      router.push(`/books/${bookId}`);
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <p>어떤 책과 함께할지 확인하고 있어요...</p>
      </div>
    );
  }

  if (error && !book) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
          <h1 className="text-xl font-bold text-red-600 mb-4">잠시 문제가 생겼어요</h1>
          <p className="mb-6">{error}</p>
          <Button
            href="/books"
            variant="default"
          >
            나의 독서 공간으로
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto max-w-2xl">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-center mb-6">성장의 조각 남기기</h1>
          
          {/* Book Info */}
          {book && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h2 className="font-bold">{book.title}</h2>
              <p className="text-sm text-gray-600">{book.author}</p>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Note Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                어떤 종류의 생각인가요?
              </label>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => handleTypeSelect('quote')}
                  className={`flex-1 py-2 rounded-lg border ${
                    formData.type === 'quote'
                      ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                      : 'border-gray-300 hover:border-indigo-300'
                  }`}
                >
                  인용
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeSelect('thought')}
                  className={`flex-1 py-2 rounded-lg border ${
                    formData.type === 'thought'
                      ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                      : 'border-gray-300 hover:border-indigo-300'
                  }`}
                >
                  생각
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeSelect('question')}
                  className={`flex-1 py-2 rounded-lg border ${
                    formData.type === 'question'
                      ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                      : 'border-gray-300 hover:border-indigo-300'
                  }`}
                >
                  질문
                </button>
              </div>
            </div>
            
            {/* Note Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                생각의 조각을 남겨주세요
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder={
                  formData.type === 'quote' 
                    ? '마음에 와닿은 문장이 있었나요?' 
                    : formData.type === 'thought' 
                    ? '어떤 생각들이 스쳐 지나갔나요? 자유롭게 남겨주세요.' 
                    : '새로운 질문이 떠올랐나요?'
                }
                required
              />
            </div>
            
            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                어떤 주제와 관련 있나요? (선택)
              </label>
              <div className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  id="tagInput"
                  value={tagInput}
                  onChange={handleTagInputChange}
                  onKeyDown={handleTagInputKeyDown}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="키워드를 남겨두면 나중에 찾기 쉬워요."
                />
                <button
                  type="button"
                  onClick={() => addTag(tagInput.trim())}
                  disabled={!tagInput.trim()}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-200 disabled:opacity-50"
                >
                  추가
                </button>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag, index) => (
                    <div 
                      key={index} 
                      className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm flex items-center"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-indigo-400 hover:text-indigo-700"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                fullWidth
                onClick={() => router.back()}
              >
                취소
              </Button>
              <Button
                type="submit"
                variant="default"
                fullWidth
                disabled={isSubmitting || !formData.content.trim()}
              >
                {isSubmitting ? '저장 중...' : '메모 저장'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 