import React, { useState } from 'react';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { updateCollection, deleteCollection } from '@/store/slices/collectionSlice';
import type { AppDispatch } from '@/store/store';
import { PencilSquareIcon, TrashIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import Button from '@/components/common/Button';

// Define interface to match what we receive from the API
interface Collection {
  _id: string;
  id?: string;
  name: string;
  title?: string; 
  description?: string;
  category?: string;
  owner?: string;
  type?: string;
  visibility?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface CollectionCardProps {
  collection: Collection;
}

const CollectionCard: React.FC<CollectionCardProps> = ({ collection }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(collection.name || collection.title || '');
  const [editedDescription, setEditedDescription] = useState(collection.description || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsEditing(true);
    setEditedName(collection.name || collection.title || '');
    setEditedDescription(collection.description || '');
    setError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const nameTrim = editedName.trim();
    const descTrim = editedDescription.trim();
    if (!nameTrim) {
      setError('이름을 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      await dispatch(updateCollection({ id: collection._id, name: nameTrim, description: descTrim })).unwrap();
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || '수정 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setEditedName(collection.name || collection.title || '');
    setEditedDescription(collection.description || '');
    setError(null);
    setIsEditing(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    if (confirm('정말 삭제하시겠습니까?')) {
      dispatch(deleteCollection(collection._id));
    }
  };

  // Display name based on what's available
  const displayName = collection.name || collection.title || '무제';

  return (
    <div className={`relative transition-all duration-300 ${isEditing ? '' : 'group'}`}>
      {!isEditing ? (
        <Link
          href={`/myverse/${collection._id}`}
          className="block bg-white rounded-lg shadow-md hover:shadow-lg p-6 transition-shadow duration-300"
        >
          <div className="flex justify-between items-start mb-3">
            <h2 className="text-lg font-semibold text-neutral-DEFAULT mr-4 truncate">{displayName}</h2>
            <div className="flex space-x-2 flex-shrink-0">
              <button 
                onClick={handleEdit} 
                className="p-1 text-neutral-500 hover:text-accent transition-colors"
                aria-label="컬렉션 수정"
              >
                <PencilSquareIcon className="h-5 w-5" />
              </button>
              <button 
                onClick={handleDelete} 
                className="p-1 text-neutral-500 hover:text-feedback-error transition-colors"
                aria-label="컬렉션 삭제"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          <p className="text-sm text-neutral-500 h-10 overflow-hidden text-ellipsis">
            {collection.description || '설명이 없습니다.'}
          </p>
        </Link>
      ) : (
        <form 
          onSubmit={handleSave} 
          className="bg-white rounded-lg shadow-lg p-6 space-y-4 border border-accent"
        >
          <input
            type="text"
            className="block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:ring-accent focus:border-accent sm:text-sm"
            value={editedName}
            onChange={e => setEditedName(e.target.value)}
            placeholder="컬렉션 이름"
            disabled={loading}
            required
          />
          <textarea
            className="block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:ring-accent focus:border-accent sm:text-sm h-20 resize-none"
            value={editedDescription}
            onChange={e => setEditedDescription(e.target.value)}
            disabled={loading}
            placeholder="컬렉션 설명을 입력하세요 (선택)"
          />
          {error && <p className="text-feedback-error text-sm">{error}</p>}
          <div className="flex justify-end space-x-2">
            <Button 
              variant="secondary" 
              onClick={handleCancel} 
              type="button"
              disabled={loading}
              aria-label="취소"
            >
              <XMarkIcon className="h-5 w-5" />
            </Button>
            <Button 
              variant="default"
              type="submit" 
              disabled={loading} 
              loading={loading}
              aria-label="저장"
            >
              <CheckIcon className="h-5 w-5" />
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CollectionCard; 