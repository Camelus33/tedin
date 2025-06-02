import React from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore, CartItem } from '@/store/cartStore';
import { XMarkIcon, TrashIcon, ShoppingCartIcon, DocumentPlusIcon } from '@heroicons/react/24/outline';
import Button from '@/components/common/Button'; // 경로 수정: @/components/common/Button

/**
 * @interface KnowledgeCartModalProps
 * @description KnowledgeCartModal 컴포넌트가 받는 프롭들의 타입 정의입니다.
 */
interface KnowledgeCartModalProps {
  /** 
   * @property {boolean} isOpen - 모달의 현재 열림/닫힘 상태입니다.
   * 부모 컴포넌트(CartUIManager)에서 이 상태를 관리합니다.
   */
  isOpen: boolean;
  /**
   * @property {() => void} onClose - 모달을 닫아야 할 때 호출되는 콜백 함수입니다.
   * 모달 내부의 닫기 버튼 또는 배경 클릭 시 호출됩니다.
   */
  onClose: () => void;
}

/**
 * @component KnowledgeCartModal
 * @description 지식 카트에 담긴 아이템들을 보여주고 관리하는 모달(또는 사이드 패널) 컴포넌트입니다.
 * 카트 아이템 목록 표시, 개별 아이템 삭제, 전체 카트 비우기, 단권화 노트 생성 페이지로 이동 기능을 제공합니다.
 * @param {KnowledgeCartModalProps} props - 컴포넌트 프롭 (isOpen, onClose).
 */
const KnowledgeCartModal: React.FC<KnowledgeCartModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  // Zustand 스토어에서 카트 아이템 목록과 관련 액션(removeFromCart, clearCart)을 가져옵니다.
  const { items: cartItems, removeFromCart, clearCart } = useCartStore();

  // 모달이 열려있지 않으면 아무것도 렌더링하지 않습니다.
  if (!isOpen) return null;

  /**
   * @function handleCreateSummaryNote
   * @description "[단권화 노트 만들기]" 버튼 클릭 시 실행되는 핸들러입니다.
   * 카트를 닫고, 단권화 노트 생성 페이지('/summary-notes/create')로 사용자를 이동시킵니다.
   */
  const handleCreateSummaryNote = () => {
    onClose(); // 모달을 닫습니다.
    router.push('/summary-notes/create'); // 단권화 노트 생성 페이지로 이동합니다.
  };

  /**
   * @function handleRemoveItem
   * @description 특정 카트 아이템의 "삭제" 버튼 클릭 시 실행되는 핸들러입니다.
   * @param {string} noteId - 삭제할 아이템의 노트 ID.
   */
  const handleRemoveItem = (noteId: string) => {
    removeFromCart(noteId); // 스토어의 removeFromCart 액션을 호출합니다.
  };

  /**
   * @function handleClearCart
   * @description "카트 비우기" 버튼 클릭 시 실행되는 핸들러입니다.
   * 확인창을 띄우고, 사용자가 "확인"을 누르면 스토어의 clearCart 액션을 호출하여 모든 아이템을 제거합니다.
   */
  const handleClearCart = () => {
    if (window.confirm('정말로 카트를 비우시겠습니까? 모든 담은 내용이 사라집니다.')) {
      clearCart(); // 스토어의 clearCart 액션을 호출합니다.
    }
  };

  // 모달 배경 클릭 시 닫기 처리
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out"
      onClick={handleBackdropClick} // 배경 클릭 시 모달 닫기
      role="dialog" // 접근성을 위한 역할 명시
      aria-modal="true" // 현재 모달이 활성화되어 있음을 알림
      aria-labelledby="knowledge-cart-title" // 모달 제목을 가리키는 ID
    >
      <div 
        className="bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col border border-gray-700 max-h-[80vh]"
        onClick={(e) => e.stopPropagation()} // 모달 컨텐츠 클릭 시 이벤트 전파 중단 (배경 클릭으로 닫히는 것 방지)
      >
        {/* 모달 헤더: 제목과 닫기 버튼 */}
        <div className="flex items-center justify-between p-5 border-b border-gray-700">
          <h2 id="knowledge-cart-title" className="text-xl font-semibold flex items-center">
            <ShoppingCartIcon className="h-6 w-6 mr-2 text-yellow-400" />
            지식 카트 ({cartItems.length}개)
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-700"
            aria-label="카트 닫기"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* 카트 아이템 목록: 아이템이 있을 경우와 없을 경우를 구분하여 표시 */}
        <div className="p-5 overflow-y-auto flex-grow">
          {cartItems.length === 0 ? (
            <p className="text-gray-400 text-center py-8">카트에 담긴 1줄 메모가 없습니다.</p>
          ) : (
            <ul className="space-y-3">
              {cartItems.map((item) => (
                <li 
                  key={item.noteId} 
                  className="flex items-center justify-between bg-gray-700/50 p-3 rounded-lg shadow-md border border-gray-600 hover:bg-gray-700/70 transition-colors"
                >
                  <div className="flex-grow overflow-hidden mr-3">
                    <p className="text-xs text-yellow-300 font-medium truncate" title={item.bookTitle}>
                      📚 {item.bookTitle}
                    </p>
                    <p className="text-sm text-gray-200 truncate mt-1" title={item.contentPreview}>
                      {item.contentPreview}
                    </p>
                  </div>
                  <button 
                    onClick={() => handleRemoveItem(item.noteId)} 
                    className="text-red-400 hover:text-red-300 p-1 rounded-full hover:bg-red-500/20 transition-colors flex-shrink-0"
                    aria-label={`'${item.contentPreview.substring(0,20)}...' 메모 카트에서 제거`}
                    title="카트에서 제거"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 모달 푸터: 액션 버튼들 */}
        {cartItems.length > 0 && (
          <div className="p-5 border-t border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-3">
            <Button 
              variant="outline"
              onClick={handleClearCart}
              className="w-full sm:w-auto border-red-500/70 text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center gap-2 transition-colors"
              aria-label="카트의 모든 항목 비우기"
            >
              <TrashIcon className="h-5 w-5" />
              카트 비우기
            </Button>
            <Button 
              variant="default"
              onClick={handleCreateSummaryNote}
              className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold flex items-center gap-2 transition-colors"
              aria-label="선택된 메모로 단권화 노트 만들기"
            >
              <DocumentPlusIcon className="h-5 w-5" />
              단권화 노트 만들기 ({cartItems.length}개)
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeCartModal; 