import React from 'react';
import { ShoppingCartIcon } from '@heroicons/react/24/solid';
import { useCartStore } from '@/store/cartStore';

/**
 * @interface FloatingCartButtonProps
 * @description FloatingCartButton 컴포넌트가 받는 프롭들의 타입 정의입니다.
 */
interface FloatingCartButtonProps {
  /** 
   * @property {() => void} onOpenCart - 버튼 클릭 시 호출될 콜백 함수입니다.
   * 일반적으로 부모 컴포넌트에서 지식 카트 모달을 여는 로직을 수행합니다.
   */
  onOpenCart: () => void;
}

/**
 * @component FloatingCartButton
 * @description 화면 우측 하단에 떠다니는 지식 카트 아이콘 버튼입니다.
 * 카트에 담긴 아이템 개수를 표시하고, 클릭 시 onOpenCart 콜백을 실행하여 카트 모달을 엽니다.
 * @param {FloatingCartButtonProps} props - 컴포넌트 프롭 (onOpenCart 콜백 함수).
 */
const FloatingCartButton: React.FC<FloatingCartButtonProps> = ({ onOpenCart }) => {
  // Zustand 스토어에서 현재 카트에 담긴 아이템 목록을 가져옵니다.
  const cartItems = useCartStore(state => state.items);
  // 카트에 담긴 아이템의 개수를 계산합니다.
  const itemCount = cartItems.length;

  // 카트에 아이템이 없을 경우 버튼을 렌더링하지 않습니다 (선택적 동작).
  // 또는, 아이템이 없어도 버튼을 표시하고 싶다면 이 조건을 제거할 수 있습니다.
  if (itemCount === 0) {
    return null; 
  }

  return (
    <button
      onClick={onOpenCart} // 버튼 클릭 시 부모로부터 받은 onOpenCart 함수를 호출합니다.
      className="fixed bottom-6 right-6 bg-gradient-to-tr from-yellow-400 to-amber-500 text-white p-4 rounded-full shadow-xl hover:from-yellow-500 hover:to-amber-600 focus:outline-none focus:ring-4 focus:ring-amber-300 transition-all duration-200 ease-in-out transform hover:scale-110 z-50"
      aria-label={`지식 카트 열기, ${itemCount}개 아이템 담김`} // 접근성을 위한 레이블
      title={`지식 카트 (${itemCount}개)`} // 마우스 호버 시 표시될 툴팁
    >
      <ShoppingCartIcon className="h-7 w-7" />
      {/* 카트에 담긴 아이템 개수를 뱃지 형태로 표시합니다. */}
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {itemCount}
        </span>
      )}
    </button>
  );
};

export default FloatingCartButton; 