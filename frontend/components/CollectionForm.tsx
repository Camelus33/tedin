"use client";

import React, { useState, useEffect } from 'react';
import { collectionsApi } from '@/lib/api';
import Button from '@/components/common/Button';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast'; // 토스트 사용 위해 import

// MyversePage와 동일한 Collection 인터페이스 정의 (또는 공유 타입 사용)
interface Collection {
  _id: string;
  id?: string; // API 응답에 id가 있을 수 있으므로 포함 (선택적)
  name: string;
  description?: string;
  type?: string;
  visibility?: 'private' | 'public' | 'group';
  // owner 등 다른 필드가 있다면 추가
}

interface CollectionFormProps {
  onCancel: () => void;
  onSuccess: (collection: Collection) => void;
  initialData?: Collection | null; // 수정 위한 initialData prop 추가
}

const CollectionForm: React.FC<CollectionFormProps> = ({ onCancel, onSuccess, initialData }) => {
  const isEditMode = !!initialData; // 수정 모드 여부 확인

  // 상태 초기값 설정 (수정 모드 고려)
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [type, setType] = useState(initialData?.type || 'custom'); 
  const [visibility, setVisibility] = useState<'private' | 'public' | 'group'>(initialData?.visibility || 'private');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // initialData 변경 시 상태 업데이트 (선택적이지만, prop 변경에 대응하려면 필요)
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setDescription(initialData.description || '');
      setType(initialData.type || 'custom');
      setVisibility(initialData.visibility || 'private');
    }
    // 수정 모드 시작 시 오류 초기화 (선택적)
    setError(null);
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('컬렉션 이름은 필수입니다.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const collectionData = {
        name: name.trim(),
        description: description.trim(),
        type: type.trim() || 'custom',
        visibility: visibility,
      };

      let resultCollection: Collection;
      if (isEditMode && initialData) {
        // 수정 API 호출
        resultCollection = await collectionsApi.update(initialData._id, collectionData);
      } else {
        // 생성 API 호출
        resultCollection = await collectionsApi.create(collectionData);
      }
      
      // API 응답 형식에 따라 id 또는 _id 사용 조정 필요
      const finalData: Collection = {
        ...resultCollection,
        id: resultCollection._id || (resultCollection as any).id // API 응답에 id 필드가 있다면 사용
      };

      onSuccess(finalData); // 성공 콜백 호출 (수정 또는 생성된 데이터 전달)

    } catch (err: any) {
      const action = isEditMode ? '수정' : '생성';
      console.error(`컬렉션 ${action} 실패:`, err);
      const message = err.message || `컬렉션 ${action} 중 오류가 발생했습니다.`;
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-neutral-DEFAULT">
          {isEditMode ? '컬렉션 수정' : '새 카테고리 (컬렉션)'}
        </h2>
        <button onClick={onCancel} className="text-neutral-500 hover:text-neutral-700">
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="collectionName" className="block text-sm font-medium text-neutral-700 mb-1">
            이름 <span className="text-feedback-error">*</span>
          </label>
          <input
            id="collectionName"
            type="text"
            className="block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:ring-accent focus:border-accent sm:text-sm"
            placeholder="예: 프로젝트 아이디어"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="collectionDesc" className="block text-sm font-medium text-neutral-700 mb-1">
            설명
          </label>
          <textarea
            id="collectionDesc"
            rows={3}
            className="block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:ring-accent focus:border-accent sm:text-sm resize-none"
            placeholder="컬렉션에 대한 간단한 설명 (선택 사항)"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>
        
        {/* 타입 필드는 수정 시 기본값을 보여주는 정도로 유지 (타입 변경 로직은 복잡할 수 있음) */}
        {/* <div>
          <label htmlFor="collectionType" className="block text-sm font-medium text-neutral-700 mb-1">
            타입 (선택)
          </label>
          <input
            id="collectionType"
            type="text"
            className="block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:ring-accent focus:border-accent sm:text-sm"
            placeholder="예: study, work, custom (기본값: custom)"
            value={type}
            onChange={e => setType(e.target.value)}
          />
        </div> */}

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">공개 설정</label>
          <div className="flex space-x-2">
            {[
              { value: 'private', label: '비공개' },
              { value: 'public', label: '전체 공개' },
              // { value: 'group', label: '그룹 공개' } // 그룹 공개는 추후 구현 시 추가
            ].map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => setVisibility(option.value as 'private' | 'public')}
                className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors ${visibility === option.value ? 'bg-primary/10 text-primary border-primary/30' : 'bg-white text-neutral-600 border-neutral-300 hover:bg-secondary'}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-sm text-feedback-error">오류: {error}</p>
        )}

        <div className="flex justify-end space-x-3 pt-2">
          <Button variant="secondary" type="button" onClick={onCancel} disabled={loading}>
            취소
          </Button>
          <Button 
            variant="default" 
            type="submit" 
            loading={loading} 
            disabled={loading || !name.trim()}
          >
            {loading ? (isEditMode ? '수정 중...' : '생성 중...') : (isEditMode ? '수정 완료' : '컬렉션 생성')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CollectionForm; 