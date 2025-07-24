'use client';

import React, { useState } from 'react';
import ConceptScoreIcon from '@/components/ConceptScoreIcon';
import ConceptScorePopup from '@/components/ConceptScorePopup';

// 테스트용 더미 데이터
const mockScore = {
  totalScore: 75,
  breakdown: {
    thoughtExpansion: 18,
    memoEvolution: 16,
    knowledgeConnection: 14,
    flashcardCreation: 12,
    tagUtilization: 8,
    userRating: 7
  },
  level: 'advanced' as const,
  recommendations: [
    '더 많은 생각을 추가해보세요',
    '메모를 4단계까지 발전시켜보세요',
    '다른 지식과 연결해보세요'
  ]
};

export default function TestConceptScorePage() {
  const [showPopup, setShowPopup] = useState(false);

  const handleActionClick = (action: string) => {
    console.log('Action clicked:', action);
    // 실제 구현에서는 API 호출
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">개념이해도 점수 테스트</h1>
        
        <div className="space-y-8">
          {/* 기본 아이콘 테스트 */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">기본 아이콘</h2>
            <div className="flex items-center gap-4">
              <ConceptScoreIcon
                score={75}
                level="advanced"
                onClick={() => setShowPopup(true)}
              />
              <span className="text-gray-300">클릭하여 팝업 열기</span>
            </div>
          </div>

          {/* 다양한 점수 레벨 테스트 */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">다양한 점수 레벨</h2>
            <div className="flex items-center gap-4 flex-wrap">
              <ConceptScoreIcon
                score={25}
                level="beginner"
                onClick={() => {}}
              />
              <ConceptScoreIcon
                score={45}
                level="intermediate"
                onClick={() => {}}
              />
              <ConceptScoreIcon
                score={75}
                level="advanced"
                onClick={() => {}}
              />
              <ConceptScoreIcon
                score={95}
                level="expert"
                onClick={() => {}}
              />
            </div>
          </div>

          {/* 팝업 테스트 */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">팝업 테스트</h2>
            <button
              onClick={() => setShowPopup(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              팝업 열기
            </button>
          </div>
        </div>

        {/* 팝업 */}
        <ConceptScorePopup
          score={mockScore}
          isOpen={showPopup}
          onClose={() => setShowPopup(false)}
          onActionClick={handleActionClick}
        />
      </div>
    </div>
  );
} 