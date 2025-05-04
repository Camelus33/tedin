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
  description: string;
  tags: string[];
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
  const [description, setDescription] = useState(initialData?.description || '');
  const [tagsInput, setTagsInput] = useState(initialData?.tags?.join(' ') || '');
  const [titleError, setTitleError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [textError, setTextError] = useState('');
  const [tagsError, setTagsError] = useState('');

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

  useEffect(() => {
    if (!title.trim()) setTitleError('제목을 입력해 주세요.');
    else if (title.length < 2 || title.length > 50) setTitleError('제목은 2~50자여야 합니다.');
    else setTitleError('');
  }, [title]);

  useEffect(() => {
    if (!description.trim()) setDescriptionError('게임 설명을 입력해 주세요.');
    else if (description.length < 10 || description.length > 300) setDescriptionError('설명은 10~300자여야 합니다.');
    else setDescriptionError('');
  }, [description]);

  useEffect(() => {
    const words = text.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) setTextError('암기할 단어/문장을 입력해 주세요.');
    else if (words.length > 9) setTextError('최대 9개까지 입력할 수 있습니다.');
    else if (new Set(words).size !== words.length) setTextError('중복된 단어가 있습니다.');
    else if (words.some(w => w.length < 1 || w.length > 20)) setTextError('각 단어는 1~20자여야 합니다.');
    else if (words.some(w => !/^[가-힣a-zA-Z0-9]+$/.test(w))) setTextError('특수문자 없이 한글, 영문, 숫자만 입력해 주세요.');
    else setTextError('');
  }, [text]);

  useEffect(() => {
    if (!tagsInput.trim()) { setTagsError(''); return; }
    const tags = tagsInput.trim().split(/\s+/).filter(Boolean);
    if (tags.length > 20) setTagsError('태그는 최대 20개까지 입력할 수 있습니다.');
    else if (new Set(tags).size !== tags.length) setTagsError('중복된 태그가 있습니다.');
    else if (tags.some(t => t.length < 1 || t.length > 20)) setTagsError('각 태그는 1~20자여야 합니다.');
    else if (tags.some(t => !/^[가-힣a-zA-Z0-9]+$/.test(t))) setTagsError('특수문자 없이 한글, 영문, 숫자만 입력해 주세요.');
    else setTagsError('');
  }, [tagsInput]);

  const isFormValid = !titleError && !descriptionError && !textError && !tagsError;

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

    // 새로운 바둑판 크기 결정 로직
    const words = trimmedText.split(/\s+/);
    let boardSize = 3;
    if (words.length <= 5) {
      boardSize = 3;
    } else if (words.length <= 7) {
      boardSize = 5;
    } else if (words.length <= 9) {
      boardSize = 7;
    } else {
      setError('입력 단어는 최대 9개입니다.');
      toast.error('입력 단어는 최대 9개입니다.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let resultGame: MyverseGame;

      if (isEditMode && initialData) {
        const updatePayload = {
          title: trimmedTitle,
          description: description.trim(),
          visibility,
          sharedWith: visibility === 'group' ? selectedUsers.map(u => u._id) : [],
          tags: tagsInput.trim() ? tagsInput.trim().split(/\s+/).filter(Boolean) : []
        };
        resultGame = await myverseApi.update(initialData._id, updatePayload);
        toast.success('게임 정보가 수정되었습니다.');
      } else {
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
          description: description.trim(),
          inputText: trimmedText,
          wordMappings,
          boardSize,
          visibility,
          sharedWith: visibility === 'group' ? selectedUsers.map(u => u._id) : [],
          tags: tagsInput.trim() ? tagsInput.trim().split(/\s+/).filter(Boolean) : []
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

    // Add console log to check visibility state changes
    console.log("Current visibility state:", visibility);
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

      <form onSubmit={handleSubmit} className="space-y-2">
        <div>
          <label htmlFor="gameTitle" className="block text-xs font-medium text-neutral-700 mb-0.5">제목</label>
          <input
            id="gameTitle"
            type="text"
            className="block w-full px-2 py-1 border border-neutral-300 rounded focus:ring-accent focus:border-accent text-xs"
            placeholder="2~50자, 중복/특수문자 불가"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            maxLength={50}
          />
        </div>
        <div>
          <label htmlFor="gameDescription" className="block text-xs font-medium text-neutral-700 mb-0.5">설명/미션</label>
          <textarea
            id="gameDescription"
            className="block w-full px-2 py-1 border border-neutral-300 rounded focus:ring-accent focus:border-accent text-xs resize-none min-h-[40px] max-h-[80px]"
            placeholder="10~300자, 예: 이 게임은 친구와 단어 암기 대결을 위해 만들었습니다."
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
            maxLength={300}
            rows={2}
          />
        </div>
        <div>
          <label htmlFor="gameText" className="block text-xs font-medium text-neutral-700 mb-0.5">암기할 단어/문장</label>
          <textarea
            id="gameText"
            className="block w-full px-2 py-2 border-2 border-accent rounded font-bold text-lg bg-white/90 shadow focus:ring-accent focus:border-accent resize-none min-h-[48px] max-h-[80px] transition-all duration-150"
            placeholder="최대 9개, 띄어쓰기로 구분, 각 1~20자, 중복/특수문자 불가"
            value={text}
            onChange={e => setText(e.target.value)}
            required={!isEditMode}
            disabled={isEditMode}
            maxLength={180}
            rows={2}
          />
        </div>
        <div className="flex flex-row gap-2 items-end">
          <div className="flex-1 min-w-0">
            <label className="block text-xs font-medium text-neutral-700 mb-0.5">공개 설정</label>
            <div className="flex gap-1">
              {[
                { value: 'private', label: '비공개' },
                { value: 'public', label: '전체 공개' },
                { value: 'group', label: '지인 공유' }
              ].map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setVisibility(option.value as 'private' | 'public' | 'group')}
                  className={`px-2 py-1 text-xs font-medium rounded border transition-colors ${
                    visibility === option.value
                      ? 'bg-indigo-100 text-indigo-700 border-indigo-300'
                      : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 min-w-[160px]">
            <label htmlFor="tagsInput" className="block text-xs font-medium text-neutral-700 mb-0.5">태그(선택)</label>
            <input
              id="tagsInput"
              type="text"
              className="block w-full px-2 py-1 border border-neutral-300 rounded focus:ring-accent focus:border-accent text-xs"
              placeholder="띄어쓰기로 여러 태그 입력(최대 20개)"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              maxLength={200}
            />
          </div>
        </div>
        {visibility === 'group' && (
          <div className="pt-1">
            <label htmlFor="userSearch" className="block text-xs font-medium text-neutral-700">공유할 사용자 추가</label>
            <div className="relative">
              <input
                id="userSearch"
                type="text"
                className="block w-full px-2 py-1 pl-8 border border-neutral-300 rounded focus:ring-accent focus:border-accent text-xs"
                placeholder="닉네임 검색"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <MagnifyingGlassIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            </div>
            {searchLoading && <p className="text-xs text-neutral-500">검색 중...</p>}
            {searchError && <p className="text-xs text-feedback-error">{searchError}</p>}
            {suggestions.length > 0 && (
              <ul className="border border-neutral-300 rounded max-h-24 overflow-auto text-xs">
                {suggestions.map(u => (
                  <li key={u._id}>
                    <button
                      type="button"
                      className="w-full text-left px-2 py-1 hover:bg-secondary flex items-center justify-between"
                      onClick={() => {
                        setSelectedUsers(prev => [...prev, u]);
                        setSearchTerm('');
                      }}
                    >
                      {u.nickname}
                      <UserPlusIcon className="h-3 w-3 text-neutral-500" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {selectedUsers.map(u => (
                  <span key={u._id} className="inline-flex items-center bg-secondary text-neutral-700 text-xs font-medium px-1.5 py-0.5 rounded-full">
                    {u.nickname}
                    <button
                      type="button"
                      onClick={() => setSelectedUsers(prev => prev.filter(s => s._id !== u._id))}
                      className="ml-1 text-neutral-400 hover:text-neutral-600"
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
        {error && <p className="text-feedback-error text-xs">{error}</p>}
        <div className="flex justify-end pt-2">
          {onCancel && (
            <Button variant="secondary" type="button" onClick={onCancel} disabled={loading} className="text-xs px-3 py-1">
              취소
            </Button>
          )}
          <Button type="submit" variant="default" disabled={!isFormValid || loading} className="text-xs px-4 py-1 ml-2">
            {isEditMode ? '게임 수정' : '게임 만들기'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CollectionGameForm; 