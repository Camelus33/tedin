'use client';

import React from 'react';
import { Line } from 'react-chartjs-2';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
// Chart.js 타입 (필요에 따라 더 구체화 가능)
import { ChartOptions } from 'chart.js'; 

// Props로 받을 차트 데이터셋의 타입 정의
interface ChartDataset {
  label: string;
  data: (number | null)[]; // API 응답에 따라 null 값이 올 수 있음을 명시
  borderColor: string;
  tension: number;
  hidden?: boolean;
  backgroundColor?: string; // 원본 page.tsx의 lineChartData 구조 참고
  yAxisID?: string;      // 원본 page.tsx의 lineChartData 구조 참고
}

// Props로 받을 차트 데이터 전체 구조 타입 정의
interface TimeSeriesChartData {
  labels: string[];
  datasets: ChartDataset[];
}

// TimeSeriesChartCard 컴포넌트의 Props 타입 정의
interface TimeSeriesChartCardProps {
  chartData: TimeSeriesChartData | null; // 데이터가 null일 수 있음 (로딩 중 또는 데이터 없음)
  // Chart.js의 옵션 타입 사용, 복잡할 경우 'any'로 대체 가능
  chartOptions: ChartOptions<'line'>; 
}

const TimeSeriesChartCard: React.FC<TimeSeriesChartCardProps> = ({ chartData, chartOptions }) => {
  // 데이터가 없거나 로딩 중일 때 표시할 UI
  if (!chartData || chartData.datasets.length === 0) {
    return (
      <Card className="mb-6 md:mb-8">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl sm:text-2xl">시간에 따른 역량 변화</CardTitle>
          <CardDescription className="text-sm sm:text-md">
            표시할 시간별 역량 데이터가 없거나 로딩 중입니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] sm:h-[350px] md:h-[400px] p-4 flex items-center justify-center">
          <p className="text-gray-500">데이터가 없습니다.</p>
        </CardContent>
      </Card>
    );
  }

  // 데이터가 있을 경우 차트를 포함한 카드 UI 렌더링
  return (
    <Card className="mb-6 md:mb-8">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl sm:text-2xl">시간에 따른 역량 변화</CardTitle>
        <CardDescription className="text-sm sm:text-md">
          주요 인지 역량의 변화 추이를 확인하세요. 범례를 클릭하여 특정 지표를 숨기거나 표시할 수 있습니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[300px] sm:h-[350px] md:h-[400px] p-4">
        <Line data={chartData} options={chartOptions} />
      </CardContent>
    </Card>
  );
};

export default TimeSeriesChartCard; 