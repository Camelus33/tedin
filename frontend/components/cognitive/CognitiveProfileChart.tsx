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

// Korean labels for metrics
const metricLabelsKo = {
  hippocampusActivation: '해마 활성화',
  workingMemory: '작업 기억력',
  processingSpeed: '처리 속도',
  attention: '주의력',
  patternRecognition: '패턴 인식',
  cognitiveFlexibility: '인지 유연성'
};

const CognitiveProfileChart: React.FC<CognitiveProfileChartProps> = ({ data, previousData, className = '' }) => {
  // Prepare data for the radar chart
  const chartData = {
    labels: Object.values(metricLabelsKo),
    datasets: [
      {
        label: '현재 능력치',
        data: Object.keys(metricLabelsKo).map(key => data[key as keyof MetricData]),
        // Refined violet color theme
        backgroundColor: 'rgba(167, 139, 250, 0.35)', // Violet-400 with adjusted opacity
        borderColor: 'rgba(139, 92, 246, 1)',    // Solid Violet-600
        borderWidth: 1.5,
        pointBackgroundColor: 'rgba(139, 92, 246, 1)', // Violet-600 for points
        pointBorderColor: '#fff',
        pointRadius: 4, 
        pointHoverRadius: 6, 
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(139, 92, 246, 1)',
        tension: 0.1, // Add slight curve to the line
      },
    ],
  };

  // Chart options
  const options = {
    scales: {
      r: {
        angleLines: {
          display: true,
          color: 'rgba(0, 0, 0, 0.06)', 
        },
        ticks: {
          stepSize: 20,
          backdropColor: 'transparent',
          font: {
            size: 10,
            family: "'Pretendard', sans-serif"
          },
          color: 'rgba(0, 0, 0, 0.4)' 
        },
        suggestedMin: 0,
        suggestedMax: 100,
        grid: {
          color: 'rgba(0, 0, 0, 0.08)', // Slightly darker than angle lines
          borderDash: [3, 3], // Make grid lines dashed
        },
        pointLabels: {
          font: {
            size: 13, 
            family: "'Pretendard', sans-serif",
          },
          color: '#4B5563',
          padding: 10, // Add padding around labels
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(31, 41, 55, 0.85)', // Darker tooltip background (gray-800)
        titleFont: {
          size: 13,
          family: "'Pretendard', sans-serif",
        },
        bodyFont: {
          size: 12,
          family: "'Pretendard', sans-serif",
        },
        padding: 10, // Slightly more padding
        displayColors: false,
        cornerRadius: 4, // Rounded corners
        titleColor: '#ffffff',
        bodyColor: '#E5E7EB', // Lighter gray body text (gray-200)
      },
    },
    maintainAspectRatio: false,
  };

  // Calculate and format changes if previousData exists
  const renderChanges = () => {
    if (!previousData) {
      return null;
    }

    const changes = Object.keys(metricLabelsKo).map(key => {
      const current = data[key as keyof MetricData];
      const previous = previousData[key as keyof MetricData];
      const diff = current - previous;
      const sign = diff > 0 ? '+' : diff < 0 ? '' : ''; // No sign for 0 change
      const colorClass = diff > 0 ? 'text-emerald-600' : diff < 0 ? 'text-rose-600' : 'text-gray-500';
      const arrow = diff > 0 ? '▲' : diff < 0 ? '▼' : '';

      return (
        <li key={key} className="text-base flex justify-between items-baseline py-1.5 border-b border-gray-100 last:border-b-0">
          <span className="text-gray-700">{metricLabelsKo[key as keyof typeof metricLabelsKo]}:</span>
          <span className={`font-semibold ${colorClass} flex items-center`}>
            {current}
            {diff !== 0 && (
              <span className="ml-1.5 flex items-center text-sm">
                 ({arrow}{sign}{diff})
              </span>
            )}
          </span>
        </li>
      );
    });

    return (
      <div className="mt-8 pt-6 border-t border-gray-200 px-2 md:px-4">
        <h4 className="text-lg font-semibold text-gray-800 mb-4 text-center">최근 변화</h4>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
          {changes}
        </ul>
      </div>
    );
  };

  return (
    <div className={`cognitive-profile-chart ${className}`}>
      <div className="h-72 md:h-80"> 
        <Radar data={chartData} options={options} />
      </div>
      {renderChanges()} {/* Render the changes section */}
    </div>
  );
};

export default CognitiveProfileChart; 