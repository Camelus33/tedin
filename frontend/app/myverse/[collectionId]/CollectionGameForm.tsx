"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { myverseApi } from '@/lib/api';
import api from '@/lib/api';
import Button from '@/components/common/Button';
import { XMarkIcon, UserPlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface MyverseGame {
  _id: string;
  title: string;
  inputText: string;
  wordMappings?: { word: string; coords: { x: number; y: number } }[];
  boardSize?: number;
  visibility: 'private' | 'public' | 'group';
  sharedWith: string[];
}

interface CollectionGameFormProps {
  collectionId: string;
  onCancel?: () => void;
  onSuccess?: (game: MyverseGame) => void;
  initialData?: MyverseGame | null;
}

const CollectionGameForm: React.FC<CollectionGameFormProps> = ({ collectionId, onCancel, onSuccess, initialData }) => {
  const router = useRouter();
  const isEditMode = !!initialData;
  const [title, setTitle] = useState(initialData?.title || '');
  const [visibility, setVisibility] = useState<'private' | 'public' | 'group'>(initialData?.visibility || 'private');
  const [text, setText] = useState(initialData?.inputText || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<{ _id: string; nickname: string }[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<{ _id: string; nickname: string }[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setVisibility(initialData.visibility || 'private');
      setText(initialData.inputText || '');
      if (initialData.visibility === 'group' && initialData.sharedWith?.length > 0) {
        // TODO: initialData.sharedWith ID 목록으로 사용자 정보(닉네임)를 가져오는 API 호출 구현
        // 임시: ID만 표시하거나, 비동기 로딩 상태 표시
        // setSelectedUsers(로드된_사용자_정보);
      }
    } else {
      setTitle('');
      setVisibility('private');
      setText('');
      setSelectedUsers([]);
    }
    setError(null);
  }, [initialData]);

  useEffect(() => {
    if (visibility === 'group' && searchTerm.trim()) {
      setSearchLoading(true);
      api.get('/users/search', { params: { nickname: searchTerm } })
        .then(res => {
          const users: { _id: string; nickname: string }[] = res.data;
          const filtered = users.filter(u => !selectedUsers.find(s => s._id === u._id));
          setSuggestions(filtered);
          setSearchError(null);
        })
        .catch(err => {
          setSearchError(err.response?.data?.message || err.message || '사용자 검색 중 오류가 발생했습니다.');
          setSuggestions([]);
        })
        .finally(() => setSearchLoading(false));
    } else {
      setSuggestions([]);
      setSearchError(null);
    }
  }, [searchTerm, visibility, selectedUsers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedText = text.trim();

    if (!trimmedTitle) {
      setError('게임 제목은 필수입니다.');
      return;
    }
    if (!isEditMode && !trimmedText) {
      setError('문장 입력은 필수입니다.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let resultGame: MyverseGame;

      if (isEditMode && initialData) {
        const updatePayload = {
          title: trimmedTitle,
          visibility,
          sharedWith: visibility === 'group' ? selectedUsers.map(u => u._id) : [],
        };
        resultGame = await myverseApi.update(initialData._id, updatePayload);
        toast.success('게임 정보가 수정되었습니다.');
      } else {
      const words = trimmedText.split(/\s+/);
      let boardSize = 3;
      if (words.length <= 9) boardSize = 3;
      else if (words.length <= 25) boardSize = 5;
      else boardSize = 7;
      const coords: { x: number; y: number }[] = [];
      for (let x = 0; x < boardSize; x++) {
          for (let y = 0; y < boardSize; y++) { coords.push({ x, y }); }
      }
      for (let i = coords.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [coords[i], coords[j]] = [coords[j], coords[i]];
      }
      const wordMappings = words.map((word, idx) => ({ word, coords: coords[idx] }));
        
        const createPayload = {
        title: trimmedTitle,
        inputText: trimmedText,
        wordMappings,
        boardSize,
        visibility,
        sharedWith: visibility === 'group' ? selectedUsers.map(u => u._id) : []
        };
        resultGame = await myverseApi.create(collectionId, createPayload);
      }

      onSuccess?.(resultGame);

    } catch (err: any) {
      const action = isEditMode ? '수정' : '생성';
      console.error(`게임 ${action} 실패:`, err);
      const message = err.message || `게임 ${action} 중 오류가 발생했습니다.`;
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-neutral-DEFAULT">
          {isEditMode ? '게임 수정' : '새 게임 만들기'}
        </h2>
        {onCancel && (
          <button onClick={onCancel} className="text-neutral-500 hover:text-neutral-700">
            <XMarkIcon className="h-6 w-6" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="gameTitle" className="block text-sm font-medium text-neutral-700 mb-1">게임 제목</label>
        <input
            id="gameTitle"
          type="text"
            className="block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:ring-accent focus:border-accent sm:text-sm"
            placeholder="예: React 주요 개념 복습"
          value={title}
          onChange={e => setTitle(e.target.value)}
            required
        />
      </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">공개 설정</label>
          <div className="flex space-x-2">
            {[
              { value: 'private', label: '비공개' },
              { value: 'public', label: '전체 공개' },
              { value: 'group', label: '그룹 공개' }
            ].map(option => (
          <button
                key={option.value}
            type="button"
                onClick={() => setVisibility(option.value as 'private' | 'public' | 'group')}
                className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors ${visibility === option.value ? 'bg-primary/10 text-primary border-primary/30' : 'bg-white text-neutral-600 border-neutral-300 hover:bg-secondary'}`}
          >
                {option.label}
          </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="gameText" className="block text-sm font-medium text-neutral-700 mb-1">
            입력 문장 {isEditMode && <span className="text-xs text-neutral-500">(수정 불가)</span>}
          </label>
        <textarea
            id="gameText"
            className={`block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm sm:text-sm h-32 resize-none ${isEditMode ? 'bg-neutral-100 text-neutral-500 cursor-not-allowed' : 'focus:ring-accent focus:border-accent'}`}
            placeholder="기억하고 싶은 문장을 입력하세요. 단어는 공백으로 구분됩니다."
          value={text}
          onChange={e => setText(e.target.value)}
            required={!isEditMode}
            disabled={isEditMode}
        />
      </div>

      {visibility === 'group' && (
          <div className="space-y-2">
            <label htmlFor="userSearch" className="block text-sm font-medium text-neutral-700">공유할 사용자 추가</label>
            <div className="relative">
          <input
                id="userSearch"
            type="text"
                className="block w-full px-3 py-2 pl-10 border border-neutral-300 rounded-md shadow-sm focus:ring-accent focus:border-accent sm:text-sm"
                placeholder="닉네임으로 검색"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
            </div>
            {searchLoading && <p className="text-sm text-neutral-500">검색 중...</p>}
            {searchError && <p className="text-sm text-feedback-error">{searchError}</p>}
          {suggestions.length > 0 && (
              <ul className="border border-neutral-300 rounded-md max-h-40 overflow-auto">
              {suggestions.map(u => (
                  <li key={u._id}>
                    <button
                      type="button"
                      className="w-full text-left px-3 py-2 hover:bg-secondary flex items-center justify-between text-sm"
                  onClick={() => {
                    setSelectedUsers(prev => [...prev, u]);
                    setSearchTerm('');
                  }}
                >
                  {u.nickname}
                      <UserPlusIcon className="h-4 w-4 text-neutral-500" />
                    </button>
                </li>
              ))}
            </ul>
          )}
          {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
              {selectedUsers.map(u => (
                  <span key={u._id} className="inline-flex items-center bg-secondary text-neutral-700 text-sm font-medium px-2 py-1 rounded-full">
                  {u.nickname}
                  <button
                    type="button"
                    onClick={() => setSelectedUsers(prev => prev.filter(s => s._id !== u._id))}
                      className="ml-1.5 text-neutral-400 hover:text-neutral-600"
                      aria-label={`사용자 ${u.nickname} 제거`}
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

        {error && <p className="text-feedback-error text-sm">{error}</p>}

        <div className="flex justify-end space-x-3 pt-2">
        {onCancel && (
            <Button variant="secondary" type="button" onClick={onCancel} disabled={loading}>
            취소
            </Button>
        )}
          <Button 
            variant="default" 
            type="submit" 
            loading={loading} 
            disabled={loading || !title.trim() || (!isEditMode && !text.trim())}
        >
            {loading ? (isEditMode ? '수정 중...' : '생성 중...') : (isEditMode ? '수정 완료' : '게임 생성')}
          </Button>
      </div>
      </form>
    </div>
  );
};

export default CollectionGameForm; 