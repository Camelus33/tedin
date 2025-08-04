import React from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';

/**
 * @interface HybridSearchButtonProps
 * @description HybridSearchButton 컴포넌트가 받는 프롭들의 타입 정의입니다.
 */
interface HybridSearchButtonProps {
  /** 
   * @property {() => void} onOpenSearch - 버튼 클릭 시 호출될 콜백 함수입니다.
   * 일반적으로 부모 컴포넌트에서 하이브리드 검색 모달을 여는 로직을 수행합니다.
   */
  onOpenSearch: () => void;
}

/**
 * @component HybridSearchButton
 * @description 화면 좌측 하단에 떠다니는 하이브리드 검색 아이콘 버튼입니다.
 * 클릭 시 onOpenSearch 콜백을 실행하여 하이브리드 검색 모달을 엽니다.
 * @param {HybridSearchButtonProps} props - 컴포넌트 프롭 (onOpenSearch 콜백 함수).
 */
const HybridSearchButton: React.FC<HybridSearchButtonProps> = ({ onOpenSearch }) => {
  return (
    <button
      onClick={onOpenSearch}
      className="fixed bottom-6 left-6 bg-gradient-to-tr from-indigo-500 to-purple-600 text-white p-4 rounded-full shadow-xl hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all duration-200 ease-in-out transform hover:scale-110 z-50"
      aria-label="하이브리드 검색 열기"
      title="하이브리드 검색 (키워드 + 벡터)"
    >
      <MagnifyingGlassIcon className="h-7 w-7" />
    </button>
  );
};

export default HybridSearchButton; 