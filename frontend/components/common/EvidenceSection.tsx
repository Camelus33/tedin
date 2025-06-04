import React from 'react';

// Citation 타입 및 prop 제거
// type Citation = {
//   author: string;
//   title: string;
//   year: number;
//   url?: string;
// };

interface EvidenceSectionProps {
  description: string;
}

const EvidenceSection: React.FC<EvidenceSectionProps> = ({ description }) => {
  return (
    // 배경, 테두리, 큰 패딩 제거. 하단 마진만 유지.
    <div className="mb-3">
      {/* 설명 텍스트를 더 부드럽고 작게 만듭니다. */}
      <p className="text-neutral-400 text-sm">{description}</p>
      {/* Citations 리스트 렌더링 코드 완전 제거 */}
    </div>
  );
};

export default EvidenceSection; 