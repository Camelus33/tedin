"use client";

import React, { useState } from 'react';
import HybridSearchButton from './HybridSearchButton';
import HybridSearchModal from './HybridSearchModal';

/**
 * @component SearchUIManager
 * @description 하이브리드 검색 UI를 관리하는 컴포넌트입니다.
 * 플로팅 검색 버튼과 검색 모달의 상태를 관리하고, 
 * 버튼 클릭 시 모달을 열고 닫는 기능을 제공합니다.
 */
const SearchUIManager: React.FC = () => {
  // 하이브리드 검색 모달의 열림/닫힘 상태를 관리합니다.
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // 검색 모달을 여는 함수입니다.
  const handleOpenSearch = () => {
    setIsSearchModalOpen(true);
  };

  // 검색 모달을 닫는 함수입니다.
  const handleCloseSearch = () => {
    setIsSearchModalOpen(false);
  };

  return (
    <>
      {/* 플로팅 검색 버튼을 렌더링하고, 클릭 시 handleOpenSearch 함수를 호출하도록 프롭을 전달합니다. */}
      <HybridSearchButton onOpenSearch={handleOpenSearch} />
      {/* 하이브리드 검색 모달을 렌더링하고, 열림/닫힘 상태(isOpen)와 닫기 콜백(onClose)을 프롭으로 전달합니다. */}
      <HybridSearchModal isOpen={isSearchModalOpen} onClose={handleCloseSearch} />
    </>
  );
};

export default SearchUIManager; 