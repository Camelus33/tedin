import React, { useState } from 'react';

interface CollectionModalProps {
  onClose: () => void;
  onSubmit: (data: { name: string; type?: string; visibility?: string; description?: string }) => void;
}

const CollectionModal: React.FC<CollectionModalProps> = ({ onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [visibility, setVisibility] = useState<'private' | 'public'>('private');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return;
    }
    onSubmit({
      name: trimmedName,
      type: type.trim() || undefined,
      visibility,
      description: description.trim() || undefined
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
      <div className="bg-white rounded-lg p-6 z-50 w-full max-w-md relative">
        <h2 className="text-xl font-semibold mb-4">새 컬렉션 생성</h2>
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">이름</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">타입 (선택)</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded"
            value={type}
            onChange={e => setType(e.target.value)}
            placeholder="예: Quiz, Puzzle 등"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">공개 범위</label>
          <select
            className="w-full px-3 py-2 border rounded"
            value={visibility}
            onChange={e => setVisibility(e.target.value as 'private' | 'public')}
          >
            <option value="private">비공개</option>
            <option value="public">공개</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">설명 <span className="text-feedback-error">*</span></label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="간단한 설명을 입력하세요 (필수)"
          />
        </div>
        <div className="flex justify-end">
          <button
            className="px-4 py-2 mr-2 text-gray-700 hover:bg-gray-100 rounded"
            onClick={onClose}
          >
            취소
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={handleSubmit}
          >
            생성
          </button>
        </div>
      </div>
    </div>
  );
};

export default CollectionModal; 