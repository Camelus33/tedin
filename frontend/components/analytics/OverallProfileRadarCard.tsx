'use client';

import React from 'react';
import { Radar } from 'react-chartjs-2';
import { ChartData, ChartOptions } from 'chart.js'; // Chart.js 타입 import

interface OverallProfileRadarCardProps {
  // page.tsx에서 생성된 radarChartData의 타입과 일치해야 합니다.
  // ChartData<'radar', (number | null)[], unknown>는 radar 차트 데이터에 대한 구체적인 타입입니다.
  radarChartData: ChartData<'radar', (number | null)[], unknown> | null;
  radarChartOptions: ChartOptions<'radar'>;
}

const OverallProfileRadarCard: React.FC<OverallProfileRadarCardProps> = ({ radarChartData, radarChartOptions }) => {
  // radarChartData가 null이거나 datasets이 비어있을 경우 대체 UI 표시
  if (!radarChartData || !radarChartData.datasets || radarChartData.datasets.length === 0 || radarChartData.datasets.every(ds => !ds.data || ds.data.length === 0)) {
    return (
      <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-4 md:p-6 flex flex-col items-center justify-center h-full min-h-[300px] sm:min-h-[350px] md:min-h-[428px]">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-1 text-center">종합 인지 프로필</h2>
        <p className="text-sm sm:text-md text-gray-500 text-center">표시할 데이터가 없습니다.<br/>게임을 플레이하여 데이터를 생성해 주세요.</p>
        {/* Optional: Add a placeholder image or icon */}
      </div>
    );
  }

  return (
    <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-4 md:p-6">
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-1">종합 인지 프로필</h2>
      <p className="text-sm sm:text-md text-gray-500 mb-4">
        현재 나의 주요 인지 역량 상태를 한눈에 파악합니다.
      </p>
      <div className="relative h-72 sm:h-80 md:h-96">
        <Radar data={radarChartData} options={radarChartOptions} />
      </div>
    </div>
  );
};

export default OverallProfileRadarCard; 