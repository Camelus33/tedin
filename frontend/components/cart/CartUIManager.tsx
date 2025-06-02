"use client";

import React, { useState, useEffect } from 'react';
import FloatingCartButton from './FloatingCartButton';
import KnowledgeCartModal from './KnowledgeCartModal';
import { useCartStore } from '@/store/cartStore';

/**
 * @component CartUIManager
 * @description 지식 카트 관련 UI 요소(플로팅 버튼, 모달)의 표시와 상태를 관리하는 최상위 클라이언트 컴포넌트입니다.
 * 플로팅 카트 버튼을 항상 표시하고, 해당 버튼 클릭 시 KnowledgeCartModal을 열고 닫는 상태를 제어합니다.
 * Next.js 환경에서 클라이언트 사이드에서만 렌더링되어야 하는 UI (Zustand 스토어 값에 의존하는 UI 등)의
 * 하이드레이션 오류를 방지하기 위해 isMounted 상태를 사용합니다.
 */
const CartUIManager: React.FC = () => {
  // KnowledgeCartModal의 열림/닫힘 상태를 관리합니다.
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  // 컴포넌트가 클라이언트 사이드에서 마운트되었는지 여부를 추적하는 상태입니다.
  // 서버 사이드 렌더링(SSR) 시에는 false였다가, 클라이언트에서 마운트된 후 true로 변경됩니다.
  const [isMounted, setIsMounted] = useState(false);

  // 컴포넌트가 클라이언트에서 마운트되면 isMounted 상태를 true로 설정합니다.
  // 이 useEffect는 클라이언트 사이드에서만 실행됩니다.
  useEffect(() => {
    setIsMounted(true);
  }, []);

  /**
   * @function handleOpenCart
   * @description 플로팅 카트 버튼 클릭 시 호출되어 카트 모달을 엽니다.
   */
  const handleOpenCart = () => {
    setIsCartModalOpen(true);
  };

  /**
   * @function handleCloseCart
   * @description 카트 모달의 닫기 요청 시 호출되어 카트 모달을 닫습니다.
   */
  const handleCloseCart = () => {
    setIsCartModalOpen(false);
  };

  // 컴포넌트가 아직 클라이언트에서 마운트되지 않았다면 아무것도 렌더링하지 않습니다.
  // 이는 Zustand 스토어와 같이 클라이언트 사이드 상태에 의존하는 UI 요소들이
  // 서버에서 렌더링된 HTML과 클라이언트에서 초기 렌더링된 결과 간의 불일치로 인해 발생하는
  // 하이드레이션 오류(hydration mismatch error)를 방지하는 데 도움을 줍니다.
  if (!isMounted) {
    return null;
  }

  return (
    <>
      {/* 플로팅 카트 버튼을 렌더링하고, 클릭 시 handleOpenCart 함수를 호출하도록 프롭을 전달합니다. */}
      <FloatingCartButton onOpenCart={handleOpenCart} />
      {/* 지식 카트 모달을 렌더링하고, 열림/닫힘 상태(isOpen)와 닫기 콜백(onClose)을 프롭으로 전달합니다. */}
      <KnowledgeCartModal isOpen={isCartModalOpen} onClose={handleCloseCart} />
    </>
  );
};

export default CartUIManager; 