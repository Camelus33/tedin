'use client';

import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

// page.tsx에 정의된 CognitiveMetrics와 동일한 구조를 가정합니다.
// 실제 애플리케이션에서는 공유 타입 파일을 통해 import하는 것이 좋습니다.
interface CognitiveMetricsForPercentile {
  workingMemoryCapacity: number;
  visuospatialPrecision: number;
  processingSpeed: number;
  sustainedAttention: number;
  patternRecognition: number;
  cognitiveFlexibility: number;
  hippocampusActivation: number;
  executiveFunction: number;
}

interface PercentileRankCardProps {
  percentileRanksData: Partial<Record<keyof CognitiveMetricsForPercentile, number>> | undefined | null;
  metricDisplayNames: Record<keyof CognitiveMetricsForPercentile, string>;
}

// Helper function to get color based on percentile rank value (컴포넌트 내부로 이동)
const getRankColor = (value: number): string => {
  if (value >= 80) return '#10B981'; // Green-500 (Excellent)
  if (value >= 60) return '#3B82F6'; // Blue-500 (Good)
  if (value >= 40) return '#F59E0B'; // Amber-500 (Average)
  return '#EF4444'; // Red-500 (Needs Improvement)
};

const PercentileRankCard: React.FC<PercentileRankCardProps> = ({ percentileRanksData, metricDisplayNames }) => {
  if (!percentileRanksData || Object.keys(percentileRanksData).length === 0) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-xl sm:text-2xl">나의 백분위 순위</CardTitle>
          <CardDescription className="text-sm sm:text-md">표시할 백분위 순위 데이터가 없습니다.</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground text-center py-4">백분위 순위 데이터가 아직 집계되지 않았습니다.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl sm:text-2xl">나의 백분위 순위</CardTitle>
        <CardDescription className="text-sm sm:text-md">
          주요 역량에 대한 상대적 위치를 시각적으로 확인하세요.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-x-2 gap-y-4 sm:gap-x-4 sm:gap-y-6 p-4">
        {Object.entries(percentileRanksData).map(([key, value]) => {
          const metricKey = key as keyof CognitiveMetricsForPercentile;
          // metricDisplayNames에 해당 key가 없을 경우를 대비하여 fallback 제공
          const metricName = metricDisplayNames[metricKey] || metricKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
          
          const chartDataConfig = {
            labels: [metricName, ''], // 툴팁에 표시될 레이블, 두 번째는 빈 문자열로 공간 확보
            datasets: [
              {
                data: [value, 100 - value],
                backgroundColor: [getRankColor(value), '#E9ECEF'], // #E5E7EB (tailwind gray-200) 보다 약간 더 연한 회색
                borderColor: [getRankColor(value), '#E9ECEF'],
                borderWidth: 1,
                circumference: 180, // 반원
                rotation: 270,      // 아래쪽에서 시작
                cutout: '70%',       // 도넛 두께
              },
            ],
          };

          const chartOptionsConfig = {
            responsive: true,
            maintainAspectRatio: true, // 컨테이너 비율에 맞춤
            aspectRatio: 2,            // 너비가 높이의 2배가 되도록 (반원 모양 유지에 도움)
            plugins: {
              legend: { display: false }, // 범례 숨김
              tooltip: {
                enabled: true,
                displayColors: false, // 툴팁에서 색상 상자 숨김
                callbacks: {
                  label: function (context: any) {
                    // 첫 번째 데이터셋의 첫 번째 값(실제 백분위 값)에 대해서만 툴팁 표시
                    if (context.datasetIndex === 0 && context.dataIndex === 0) {
                      return `${context.chart.data.labels[0]}: ${context.raw}%`;
                    }
                    return null; // 다른 부분은 툴팁 표시 안함
                  },
                  title: () => null, // 툴팁 제목 숨김
                },
              },
            },
            events: ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove'], // 기본 이벤트 유지
          };

          return (
            <div key={metricKey} className="flex flex-col items-center p-2 sm:p-3 border rounded-lg shadow-sm bg-white">
              <div className="w-full h-16 sm:h-20 md:h-24 mb-1 sm:mb-2 relative">
                <Doughnut data={chartDataConfig} options={chartOptionsConfig as any} />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-lg sm:text-xl font-bold" style={{ color: getRankColor(value) }}>
                    {value}%
                  </span>
                </div>
              </div>
              <span className="text-xs sm:text-sm font-medium text-center text-gray-700">{metricName}</span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default PercentileRankCard; 