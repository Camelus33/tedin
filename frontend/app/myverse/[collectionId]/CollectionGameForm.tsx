"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { myverseApi } from '@/lib/api';
import api from '@/lib/api';
import Button from '@/components/common/Button';
import { XMarkIcon, UserPlusIcon, MagnifyingGlassIcon, PencilSquareIcon, InformationCircleIcon, GlobeAltIcon, TagIcon } from '@heroicons/react/24/outline';
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
        api.get('/users/bulk', { params: { ids: initialData.sharedWith.join(',') } })
          .then(res => {
            setSelectedUsers(res.data);
          })
          .catch(() => {
            setSelectedUsers(initialData.sharedWith.map(id => ({ _id: id, nickname: id })));
          });
      } else {
        setSelectedUsers([]);
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

  const isFormValid = !titleError && !textError && !tagsError;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // 1단계: 상태 및 페이로드 로깅
    console.log('[handleSubmit] 함수 시작 시점');
    console.log('[handleSubmit] 현재 visibility 상태:', visibility);
    console.log('[handleSubmit] 현재 selectedUsers 상태 (길이):', selectedUsers.length);
    console.log('[handleSubmit] 현재 selectedUsers 상태 (내용):', JSON.stringify(selectedUsers, null, 2));

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
      // 1단계: usersToShareIds 로깅
      const usersToShareIds = visibility === 'group' ? selectedUsers.map(u => u._id) : [];
      console.log('[handleSubmit] API로 보낼 usersToShareIds:', JSON.stringify(usersToShareIds));

      if (isEditMode && initialData) {
        const updatePayload = {
          title: trimmedTitle,
          description: description.trim(),
          visibility,
          sharedWith: usersToShareIds,
          tags: tagsInput.trim() ? tagsInput.trim().split(/\s+/).filter(Boolean) : []
        };
        // 1단계: 최종 API 페이로드 로깅
        console.log('[handleSubmit] 수정 모드 - 최종 API 페이로드:', JSON.stringify(updatePayload, null, 2));
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
          sharedWith: usersToShareIds,
          tags: tagsInput.trim() ? tagsInput.trim().split(/\s+/).filter(Boolean) : []
        };
        // 1단계: 최종 API 페이로드 로깅
        console.log('[handleSubmit] 생성 모드 - 최종 API 페이로드:', JSON.stringify(createPayload, null, 2));
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
    <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-accent">{isEditMode ? '게임 수정' : '새 게임'}</h2>
        {onCancel && (
          <button onClick={onCancel} className="text-neutral-400 hover:text-neutral-700">
            <XMarkIcon className="h-6 w-6" />
          </button>
        )}
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="gameTitle" className="block text-sm font-semibold text-neutral-800 mb-1">
            제목
          </label>
          <input
            id="gameTitle"
            type="text"
            className="block w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg shadow-sm text-sm focus:ring-accent focus:border-accent placeholder:text-neutral-400 transition"
            placeholder="2~50자, 중복/특수문자 불가"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            maxLength={50}
          />
        </div>
        <div>
          <label htmlFor="gameDescription" className="block text-sm font-semibold text-neutral-800 mb-1 flex items-center">
            <InformationCircleIcon className="h-5 w-5 text-neutral-800 mr-1" aria-hidden="true" />
            <span className="sr-only">만든 이유</span>
          </label>
          <textarea
            id="gameDescription"
            className="block w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg shadow-sm text-sm focus:ring-accent focus:border-accent placeholder:text-neutral-400 transition resize-none min-h-[40px] max-h-[80px]"
            placeholder="10~300자, 예: 이 게임은 친구와 단어 암기 대결을 위해 만들었습니다."
            value={description}
            onChange={e => setDescription(e.target.value)}
            maxLength={300}
            rows={2}
          />
        </div>
        <div>
          <label htmlFor="gameText" className="block text-sm font-semibold text-neutral-800 mb-1 flex items-center">
            <PencilSquareIcon className="h-5 w-5 text-neutral-800 mr-1" aria-hidden="true" />
            <span className="sr-only">게임 입력</span>
          </label>
          <textarea
            id="gameText"
            className="block w-full px-3 py-2 bg-violet-50 border border-violet-200 rounded-lg shadow-sm text-lg font-bold focus:ring-accent focus:border-accent placeholder:text-neutral-400 transition resize-none min-h-[48px] max-h-[80px]"
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
            <label className="block text-sm font-semibold text-neutral-800 mb-1 flex items-center">
              <GlobeAltIcon className="h-5 w-5 text-neutral-800 mr-1" aria-hidden="true" />
              <span className="sr-only">공개 설정</span>
            </label>
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
                  className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-colors shadow-sm
                    ${visibility === option.value
                      ? 'bg-accent/10 text-accent border-accent ring-2 ring-accent'
                      : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-accent/5 hover:border-accent'}
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 min-w-[160px]">
            <label htmlFor="tagsInput" className="block text-sm font-semibold text-neutral-800 mb-1 flex items-center">
              <TagIcon className="h-5 w-5 text-neutral-800 mr-1" aria-hidden="true" />
              <span className="sr-only">태그(선택)</span>
            </label>
            <input
              id="tagsInput"
              type="text"
              className="block w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg shadow-sm text-sm focus:ring-accent focus:border-accent placeholder:text-neutral-400 transition"
              placeholder="띄어쓰기로 여러 태그 입력(최대 20개)"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              maxLength={200}
            />
          </div>
        </div>
        {visibility === 'group' && (
          <div className="pt-1">
            <label htmlFor="userSearch" className="block text-sm font-semibold text-neutral-800 mb-1">공유할 사용자 추가</label>
            <div className="relative">
              <input
                id="userSearch"
                type="text"
                className="block w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg shadow-sm text-sm focus:ring-accent focus:border-accent placeholder:text-neutral-400 transition pl-8"
                placeholder="닉네임 검색"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <MagnifyingGlassIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            </div>
            {searchLoading && <p className="text-xs text-neutral-500">검색 중...</p>}
            {searchError && <p className="text-xs text-feedback-error">{searchError}</p>}
            {suggestions.length > 0 && (
              <ul className="border border-neutral-200 rounded-lg max-h-24 overflow-auto text-sm bg-white shadow">
                {suggestions.map(u => (
                  <li key={u._id}>
                    <button
                      type="button"
                      className="w-full text-left px-3 py-2 hover:bg-accent/10 flex items-center justify-between rounded-lg"
                      onClick={() => {
                        // 2단계: 사용자 추가 로깅
                        console.log('[사용자 추가 클릭] 추가 전 selectedUsers:', JSON.stringify(selectedUsers, null, 2));
                        console.log('[사용자 추가 클릭] 추가할 사용자 (u):', JSON.stringify(u, null, 2));
                        setSelectedUsers(prevUsers => {
                          const newSelectedUsers = [...prevUsers, u];
                          console.log('[사용자 추가 클릭] setSelectedUsers 내부 - newSelectedUsers:', JSON.stringify(newSelectedUsers, null, 2));
                          return newSelectedUsers;
                        });
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
                  <span key={u._id} className="inline-flex items-center bg-accent/10 text-accent text-sm font-medium px-2 py-1 rounded-full shadow-sm">
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
        <div className="flex justify-end pt-4">
          {onCancel && (
            <Button variant="secondary" type="button" onClick={onCancel} disabled={loading} className="text-sm px-5 py-2 rounded-lg shadow font-semibold">
              취소
            </Button>
          )}
          <Button type="submit" variant="default" disabled={!isFormValid || loading} className="text-sm px-5 py-2 rounded-lg shadow font-semibold ml-2">
            {isEditMode ? '게임 수정' : '게임 만들기'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CollectionGameForm; 