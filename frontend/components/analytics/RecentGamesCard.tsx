'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// page.tsx에 정의된 타입들과 유사하게 정의합니다.
// 실제 애플리케이션에서는 이 타입들을 공유 위치에서 관리하는 것이 좋습니다.
interface CognitiveMetricsStubForRecentGames {
  workingMemoryCapacity?: number; // Partial<>이므로 optional
  visuospatialPrecision?: number;
  processingSpeed?: number;
  sustainedAttention?: number;
  patternRecognition?: number;
  cognitiveFlexibility?: number;
  hippocampusActivation?: number;
  executiveFunction?: number;
}

interface RecentGameItem {
  gameId: string;
  gameName: string;
  playedAt: string; // ISO 날짜 문자열
  score: number;
  level: string;
  metricsChange: Partial<CognitiveMetricsStubForRecentGames>; // 이전 대비 변화량 또는 주요 영향 지표
}

interface RecentGamesCardProps {
  recentGamesData: RecentGameItem[] | undefined | null;
  // metricDisplayNames의 키는 CognitiveMetricsStubForRecentGames의 키와 일치해야 합니다.
  metricDisplayNames: Record<keyof CognitiveMetricsStubForRecentGames, string>;
}

const RecentGamesCard: React.FC<RecentGamesCardProps> = ({ recentGamesData, metricDisplayNames }) => {
  if (!recentGamesData || recentGamesData.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-xl sm:text-2xl">최근 게임 분석</CardTitle>
          <CardDescription className="text-sm sm:text-md">표시할 최근 게임 데이터가 없습니다.</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground text-center py-4">최근 게임 기록이 없습니다.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl sm:text-2xl">최근 게임 분석</CardTitle>
        <CardDescription className="text-sm sm:text-md">
          최근 플레이한 게임이 인지 역량에 미친 영향을 간략히 보여줍니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 p-4">
        <ul className="space-y-3">
          {/* page.tsx에서처럼 최근 3개만 표시하거나, prop으로 받을 수 있습니다. */}
          {recentGamesData.slice(0, 3).map((game) => (
            <li key={game.gameId} className="p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow bg-white">
              <div className="flex justify-between items-center mb-1">
                <h4 className="font-semibold text-indigo-700 text-sm sm:text-base">{game.gameName}</h4>
                <span className="text-xs text-gray-500">{new Date(game.playedAt).toLocaleDateString()}</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1.5">점수: {game.score}점 ({game.level})</p>
              <div className="text-xs flex flex-wrap gap-1">
                {Object.entries(game.metricsChange).map(([metric, change]) => {
                  // change가 undefined일 수 있으므로, 0으로 처리하여 숫자 연산에 문제 없도록 합니다.
                  const changeValue = change ?? 0;
                  return (
                    <Badge
                      key={metric}
                      variant={changeValue > 0 ? 'default' : 'secondary'}
                      className="text-xs px-1.5 py-0.5 font-normal"
                    >
                      {/* metricDisplayNames에서 해당 metric 키가 없을 경우를 대비하여 fallback 표시 */}
                      {metricDisplayNames[metric as keyof CognitiveMetricsStubForRecentGames] || metric}: {changeValue > 0 ? '+' : ''}{changeValue}
                    </Badge>
                  );
                })}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default RecentGamesCard; 