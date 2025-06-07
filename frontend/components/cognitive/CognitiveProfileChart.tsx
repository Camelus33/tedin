'use client';

import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

// Define the interface for metric data
interface MetricData {
  hippocampusActivation: number;
  workingMemory: number;
  processingSpeed: number;
  attention: number;
  patternRecognition: number;
  cognitiveFlexibility: number;
}

// Component props interface
interface CognitiveProfileChartProps {
  data: MetricData;          // Current profile data
  previousData?: MetricData; // Optional: Previous profile data
  className?: string;
}

// 개선된 한글 지표명 - 더 자연스럽고 부드러운 표현으로 변경
const metricLabelsKo = {
  hippocampusActivation: '기억 형성',
  workingMemory: '정보 유지',
  processingSpeed: '생각 흐름',
  attention: '집중 감각',
  patternRecognition: '연결 발견',
  cognitiveFlexibility: '사고 유연함'
};

const CognitiveProfileChart: React.FC<CognitiveProfileChartProps> = ({ data, previousData, className = '' }) => {
  // 차트 데이터 준비 - 색상 변경
  const chartData = {
    labels: Object.values(metricLabelsKo),
    datasets: [
      {
        label: '현재 여정',
        data: Object.keys(metricLabelsKo).map(key => data[key as keyof MetricData]),
        backgroundColor: 'rgba(219, 234, 254, 0.35)', // 딥 인디고(Light)
        borderColor: 'rgba(30, 58, 138, 0.8)',       // 딥 인디고(Dark)
        borderWidth: 1.5,
        pointBackgroundColor: 'rgba(30, 58, 138, 0.8)',
        pointBorderColor: '#fff',
        pointRadius: 4, 
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(30, 58, 138, 1)',
        tension: 0.4, // 더 부드러운 곡선
        borderJoinStyle: 'round' as const, // 둥근 연결점
      },
    ],
  };

  // 차트 옵션 - 부드러운 표현으로 변경
  const options = {
    scales: {
      r: {
        angleLines: {
          display: true,
          color: 'rgba(30, 58, 138, 0.1)',
        },
        ticks: {
          stepSize: 20,
          backdropColor: 'transparent',
          font: {
            size: 10,
            family: "'Pretendard', sans-serif"
          },
          color: 'rgba(30, 58, 138, 0.4)' 
        },
        suggestedMin: 0,
        suggestedMax: 100,
        grid: {
          color: 'rgba(30, 58, 138, 0.05)',
          borderDash: [3, 3],
          circular: true, // 원형 그리드
        },
        pointLabels: {
          font: {
            size: 13, 
            family: "'Pretendard', sans-serif",
          },
          color: '#1E40AF', // 인디고 색상
          padding: 10,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(30, 58, 138, 0.8)',
        titleFont: {
          size: 13,
          family: "'Pretendard', sans-serif",
        },
        bodyFont: {
          size: 12,
          family: "'Pretendard', sans-serif",
        },
        padding: 10,
        displayColors: false,
        cornerRadius: 4,
        titleColor: '#ffffff',
        bodyColor: '#E5E7EB',
      },
    },
    maintainAspectRatio: false,
    animation: {
      duration: 2000, // 천천히 나타나는 애니메이션
      easing: 'easeInOutQuart' as const // 부드러운 가속/감속
    }
  };

  // 변화 표시 함수 개선 - 물결 아이콘 사용
  const renderChanges = () => {
    if (!previousData) {
      return null;
    }

    const changes = Object.keys(metricLabelsKo).map(key => {
      const current = data[key as keyof MetricData];
      const previous = previousData[key as keyof MetricData];
      const diff = current - previous;
      const sign = diff > 0 ? '+' : diff < 0 ? '' : '';
      const colorClass = 'text-indigo-700'; // 일관된 색상으로 변경
      const icon = diff !== 0 ? '∿' : ''; // 모든 변화에 동일한 물결 아이콘

      return (
        <li key={key} className="text-base flex justify-between items-baseline py-1.5 border-b border-indigo-100/30 last:border-b-0">
          <span className="text-indigo-800">{metricLabelsKo[key as keyof typeof metricLabelsKo]}</span>
          <span className={`font-medium ${colorClass} flex items-center`}>
            {current}
            {diff !== 0 && (
              <span className="ml-1.5 flex items-center text-sm opacity-80">
                 {icon} {sign}{Math.abs(diff)}
              </span>
            )}
          </span>
        </li>
      );
    });

    return (
      <div className="mt-8 pt-6 border-t border-indigo-100/50 px-2 md:px-4 bg-blue-50/30 rounded-b-lg">
        <h4 className="text-lg font-medium text-indigo-900 mb-4 text-center">나의 인지 리듬</h4>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
          {changes}
        </ul>
      </div>
    );
  };

  return (
    <div className={`cognitive-profile-chart ${className}`}>
      <div className="h-72 md:h-80 relative">
        {/* 배경 패턴 추가 */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <pattern id="garden-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M20 0 A20 20 0 0 1 20 40 A20 20 0 0 1 20 0" fill="none" stroke="#4338ca" strokeWidth="0.5" />
            </pattern>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#garden-pattern)" />
          </svg>
        </div>
        <Radar data={chartData} options={options} />
      </div>
      {renderChanges()}
    </div>
  );
};

export default CognitiveProfileChart; 