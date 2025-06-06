'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

interface OverallScoreCardProps {
  score: number | null; // 단일 점수를 받도록 수정 (null 가능성 고려)
}

const OverallScoreCard: React.FC<OverallScoreCardProps> = ({ score }) => {
  const displayScore = score !== null ? score.toFixed(1) : null;

  if (displayScore === null) {
    return (
      <Card className="mb-6 md:mb-8">
        <CardHeader className="pb-4 text-center">
          <CardTitle className="text-xl sm:text-2xl">나의 종합 인지 점수</CardTitle>
          <CardDescription className="text-sm sm:text-md mt-1">데이터가 부족하여 점수를 계산할 수 없습니다.</CardDescription>
        </CardHeader>
        <CardContent className="text-center p-4">
          <p className="text-4xl sm:text-5xl font-bold text-gray-400">- 점</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 md:mb-8">
      <CardHeader className="pb-4 text-center">
        <CardTitle className="text-xl sm:text-2xl">나의 종합 인지 점수</CardTitle>
        <CardDescription className="text-sm sm:text-md mt-1">(모든 역량 점수의 평균값)</CardDescription>
      </CardHeader>
      <CardContent className="text-center p-4">
        <p className="text-4xl sm:text-5xl font-bold text-indigo-600">
          {displayScore}
          <span className="text-2xl sm:text-3xl">점</span>
        </p>
      </CardContent>
    </Card>
  );
};

export default OverallScoreCard; 