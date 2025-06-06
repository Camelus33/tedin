'use client';

import React, { useEffect, useState } from 'react';
import { Radar } from 'react-chartjs-2';
import { ChartData, ChartOptions } from 'chart.js';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

interface OverallProfileRadarCardProps {
  // page.tsx에서 생성된 radarChartData의 타입과 일치해야 합니다.
  // ChartData<'radar', (number | null)[], unknown>는 radar 차트 데이터에 대한 구체적인 타입입니다.
  radarChartData: ChartData<'radar', (number | null)[], unknown> | null;
  radarChartOptions: ChartOptions<'radar'>;
}

const OverallProfileRadarCard: React.FC<OverallProfileRadarCardProps> = ({ radarChartData, radarChartOptions }) => {
  const [appear, setAppear] = useState(false);
  const [enhancedChartData, setEnhancedChartData] = useState<ChartData<'radar', (number | null)[], unknown> | null>(null);

  useEffect(() => {
    // 고요한 승리를 위한 부드러운 등장 효과
    const timer = setTimeout(() => setAppear(true), 500);

    // 브랜드 컬러로 차트 데이터 강화
    if (radarChartData) {
      const brandEnhancedData = {
        ...radarChartData,
        datasets: radarChartData.datasets.map(dataset => ({
          ...dataset,
          backgroundColor: 'rgba(var(--primary-indigo), 0.2)',
          borderColor: 'rgb(var(--primary-turquoise))',
          pointBackgroundColor: 'rgb(var(--secondary-green))',
          pointBorderColor: 'rgb(var(--primary-indigo))',
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }))
      };
      setEnhancedChartData(brandEnhancedData);
    }

    return () => clearTimeout(timer);
  }, [radarChartData]);

  // 브랜드 OS에 맞는 차트 옵션 확장
  const enhancedOptions: ChartOptions<'radar'> = {
    ...radarChartOptions,
    animation: {
      duration: 1200,
      easing: 'easeInOutQuart',
    },
    plugins: {
      ...radarChartOptions.plugins,
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgb(var(--primary-indigo))',
        titleColor: 'white',
        bodyColor: 'white',
        padding: 12,
        cornerRadius: 8,
        displayColors: false
      }
    },
    scales: {
      r: {
        ...radarChartOptions.scales?.r,
        angleLines: {
          color: 'rgba(var(--secondary-beige), 0.3)'
        },
        grid: {
          color: 'rgba(var(--secondary-beige), 0.3)'
        },
        pointLabels: {
          font: {
            family: 'Pretendard Variable',
            size: 12
          },
          color: 'rgb(var(--primary-indigo))'
        },
        ticks: {
          display: false
        }
      }
    }
  };

  // radarChartData가 null이거나 datasets이 비어있을 경우 대체 UI 표시
  if (!radarChartData || !radarChartData.datasets || radarChartData.datasets.length === 0 || radarChartData.datasets.every(ds => !ds.data || ds.data.length === 0)) {
    return (
      <Card className="lg:col-span-2 habitus-transition">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">인지적 역량 패턴</CardTitle>
          <CardDescription className="text-sm sm:text-md">
            아직 당신의 고유한 인지적 패턴을 확인할 데이터가 충분하지 않습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-64 sm:h-72">
          <p className="text-gray-500 text-center">
            더 많은 활동을 통해 당신만의 고유한 패턴을 발견해보세요.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`lg:col-span-2 quiet-victory ${appear ? 'appear' : ''}`}>
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl">인지적 역량 패턴</CardTitle>
        <CardDescription className="text-sm sm:text-md">
          당신만의 고유한 인지 역량 패턴을 시각화합니다. 패턴의 특성이 중요하지, 크기가 아닙니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative h-72 sm:h-80 md:h-96 w-full">
          <Radar data={enhancedChartData || radarChartData} options={enhancedOptions} />
        </div>
        <p className="text-center text-sm text-gray-500 mt-4">
          "모든 식물은 자신만의 형태로 자라납니다"
        </p>
      </CardContent>
    </Card>
  );
};

export default OverallProfileRadarCard; 