'use client';

import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Define the interface for metric data points
interface MetricDataPoint {
  date: string;
  metrics: {
    hippocampusActivation: number;
    workingMemory: number;
    spatialCognition: number;
    attention: number;
    patternRecognition: number;
    cognitiveFlexibility: number;
  };
}

// Component props
interface CognitiveTimeSeriesChartProps {
  data: MetricDataPoint[];
  className?: string;
}

// Korean labels for metrics
const metricLabelsKo = {
  hippocampusActivation: '해마 활성화',
  workingMemory: '작업 기억력',
  spatialCognition: '공간 인지력',
  attention: '주의력',
  patternRecognition: '패턴 인식',
  cognitiveFlexibility: '인지적 유연성'
};

// Colors for each metric
const metricColors = {
  hippocampusActivation: 'rgba(255, 99, 132, 1)',
  workingMemory: 'rgba(54, 162, 235, 1)',
  spatialCognition: 'rgba(255, 206, 86, 1)',
  attention: 'rgba(75, 192, 192, 1)',
  patternRecognition: 'rgba(153, 102, 255, 1)',
  cognitiveFlexibility: 'rgba(255, 159, 64, 1)'
};

const CognitiveTimeSeriesChart: React.FC<CognitiveTimeSeriesChartProps> = ({ data, className = '' }) => {
  // State to track which metric is currently selected
  const [selectedMetric, setSelectedMetric] = useState<keyof typeof metricLabelsKo>('hippocampusActivation');

  // Format dates for x-axis
  const labels = data.map(item => 
    format(new Date(item.date), 'MM.dd', { locale: ko })
  ).reverse();

  // Prepare time series data for the selected metric
  const chartData = {
    labels,
    datasets: [
      {
        label: metricLabelsKo[selectedMetric],
        data: data.map(item => item.metrics[selectedMetric]).reverse(),
        borderColor: metricColors[selectedMetric],
        backgroundColor: metricColors[selectedMetric].replace('1)', '0.2)'),
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  };

  // Chart options
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            family: "'Pretendard', sans-serif",
            size: 12,
          },
        },
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
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20,
          font: {
            family: "'Pretendard', sans-serif",
            size: 11,
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        ticks: {
          font: {
            family: "'Pretendard', sans-serif",
            size: 11,
          },
        },
        grid: {
          display: false,
        },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Metric selector buttons */}
      <div className="flex flex-wrap justify-center mb-4 gap-2">
        {Object.entries(metricLabelsKo).map(([key, label]) => (
          <button
            key={key}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              selectedMetric === key
                ? `bg-${key === 'hippocampusActivation' ? 'red' : 
                   key === 'workingMemory' ? 'blue' : 
                   key === 'spatialCognition' ? 'yellow' : 
                   key === 'attention' ? 'green' : 
                   key === 'patternRecognition' ? 'purple' : 
                   'orange'}-500 text-white`
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setSelectedMetric(key as keyof typeof metricLabelsKo)}
          >
            {label}
          </button>
        ))}
      </div>
      
      {/* Chart container */}
      <div className="h-60">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default CognitiveTimeSeriesChart; 