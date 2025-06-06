'use client';

import React from 'react';
import { useRouter } from 'next/navigation'; // useRouter import
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import Button from '@/components/common/Button'; // Button 컴포넌트 import

// page.tsx의 personalizedRecommendations 배열의 요소 타입과 일치
interface RecommendationItem {
  title: string;
  description: string;
  action: string; 
  link?: string; 
}

interface RecommendationsCardProps {
  recommendationsData: RecommendationItem[] | undefined | null;
}

const RecommendationsCard: React.FC<RecommendationsCardProps> = ({ recommendationsData }) => {
  const router = useRouter(); // 컴포넌트 내부에서 useRouter 호출

  if (!recommendationsData || recommendationsData.length === 0) {
    return (
      <Card className="mb-6 md:mb-8">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl sm:text-2xl">맞춤형 성장 가이드</CardTitle>
          <CardDescription className="text-sm sm:text-md">표시할 추천 정보가 없습니다.</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <p className="text-center text-gray-400 pt-10">맞춤형 추천 정보가 준비 중입니다.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 md:mb-8">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl sm:text-2xl">맞춤형 성장 가이드</CardTitle>
        <CardDescription className="text-sm sm:text-md">
          나의 인지 프로필에 맞춰 효과적인 성장 방법을 추천해 드립니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {recommendationsData.map((rec, index) => (
          <div key={index} className="p-4 border border-indigo-100 rounded-lg bg-indigo-50 hover:shadow-lg transition-shadow flex flex-col justify-between h-full">
            <div>
              <h4 className="font-semibold text-indigo-800 mb-2 text-base sm:text-lg">{rec.title}</h4>
              <p className="text-xs sm:text-sm text-gray-700 mb-3">{rec.description}</p>
            </div>
            {rec.link ? (
              <Button 
                onClick={() => router.push(rec.link!)}
                variant="outline"
                size="sm" // page.tsx 에서 Linter 오류 수정된 사항 반영
                className="mt-auto self-start border-indigo-300 text-indigo-700 hover:bg-indigo-100 text-xs sm:text-sm px-2 py-1"
              >
                {rec.action || '자세히 보기'} &rarr;
              </Button>
            ) : rec.action && (
              // 링크가 없고 action 텍스트가 있는 경우 (예: 단순 활동 제안)
              <span className="text-sm text-indigo-600 font-medium mt-auto self-start pt-2">
                {rec.action}
              </span>
            )}
            {/* 기존 page.tsx의 이 부분은 Button이 있을 때만 !rec.link && rec.action !== 'activity' 조건으로 렌더링 되었었음. */}
            {/* Button이 없는 경우 위에서 이미 rec.action을 표시하므로, 이 부분은 간소화 하거나 목적에 맞게 재조정 필요. */}
            {/* 여기서는 Button이 없을 때 rec.action을 표시하는 것으로 통일함. */}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default RecommendationsCard; 