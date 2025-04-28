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

// Define the props interface
interface CognitiveProfileChartProps {
  data: {
    hippocampusActivation: number;
    workingMemory: number;
    spatialCognition: number;
    attention: number;
    patternRecognition: number;
    cognitiveFlexibility: number;
  };
  className?: string;
}

// Korean labels for metrics
const metricLabelsKo = {
  hippocampusActivation: '해마 활성화',
  workingMemory: '작업 기억력',
  spatialCognition: '공간 인지력',
  attention: '주의력',
  patternRecognition: '패턴 인식',
  cognitiveFlexibility: '인지 유연성'
};

const CognitiveProfileChart: React.FC<CognitiveProfileChartProps> = ({ data, className = '' }) => {
  // Prepare data for the radar chart
  const chartData = {
    labels: [
      metricLabelsKo.hippocampusActivation,
      metricLabelsKo.workingMemory,
      metricLabelsKo.spatialCognition,
      metricLabelsKo.attention,
      metricLabelsKo.patternRecognition,
      metricLabelsKo.cognitiveFlexibility,
    ],
    datasets: [
      {
        label: '인지 능력 프로필',
        data: [
          data.hippocampusActivation,
          data.workingMemory,
          data.spatialCognition,
          data.attention,
          data.patternRecognition,
          data.cognitiveFlexibility,
        ],
        backgroundColor: 'rgba(116, 154, 230, 0.2)',
        borderColor: 'rgba(116, 154, 230, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(116, 154, 230, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(116, 154, 230, 1)',
      },
    ],
  };

  // Chart options
  const options = {
    scales: {
      r: {
        angleLines: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          stepSize: 20,
          backdropColor: 'transparent',
        },
        suggestedMin: 0,
        suggestedMax: 100,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        pointLabels: {
          font: {
            size: 12,
            family: "'Pretendard', sans-serif",
          },
          color: '#333',
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        titleFont: {
          size: 14,
          family: "'Pretendard', sans-serif",
        },
        bodyFont: {
          size: 13,
          family: "'Pretendard', sans-serif",
        },
        padding: 8,
        displayColors: false,
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className={`relative h-80 ${className}`}>
      <Radar data={chartData} options={options} />
    </div>
  );
};

export default CognitiveProfileChart; 