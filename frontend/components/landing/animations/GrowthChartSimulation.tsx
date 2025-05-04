'use client';

import React, { useRef, useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
  ChartData
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { motion } from 'framer-motion';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Helper to generate sample growth data
const generateGrowthData = (days: number, initialValue: number, growthFactor: number) => {
  const data = [];
  let currentValue = initialValue;
  for (let i = 0; i < days; i++) {
    data.push(Math.round(currentValue));
    currentValue += Math.random() * growthFactor + growthFactor * 0.5;
  }
  return data;
};

export default function GrowthChartSimulation() {
  const days = 33;
  const labels = Array.from({ length: days }, (_, i) => `Day ${i + 1}`);

  // Initial state with empty data arrays matching labels length might be safer
  const initialDatasets = [
      {
        label: 'TS 속도 (WPM)',
        data: Array(days).fill(null), // Initialize with nulls
        borderColor: 'rgb(79, 70, 229)', // Indigo
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.3,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 5,
      },
      {
        label: 'ZenGo 용량 (점수)',
        data: Array(days).fill(null), // Initialize with nulls
        borderColor: 'rgb(5, 150, 105)', // Emerald
        backgroundColor: 'rgba(5, 150, 105, 0.1)',
        tension: 0.3,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 5,
      },
    ];

  const [chartData, setChartData] = useState<ChartData<"line">>({
    labels,
    datasets: initialDatasets,
  });

  const [startAnimation, setStartAnimation] = useState(false);
  const dataLoadedRef = useRef(false); // Ref to track if data has been loaded

  // Revised useEffect: Load data only once when startAnimation becomes true
  useEffect(() => {
    // Only proceed if animation should start and data hasn't been loaded yet
    if (startAnimation && !dataLoadedRef.current) {
      setChartData({
        labels,
        datasets: [
          {
            ...initialDatasets[0], // Use initialDataset structure
            data: generateGrowthData(days, 200, 5),
          },
          {
            ...initialDatasets[1], // Use initialDataset structure
            data: generateGrowthData(days, 50, 2),
          },
        ],
      });
      dataLoadedRef.current = true; // Mark data as loaded
    }
  // Removed chartData.datasets from dependency array
  }, [startAnimation, labels]); // Depend only on startAnimation and labels

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: '33일 작업 기억력 변화 시뮬레이션',
        font: {
            size: 16,
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        title: {
            display: true,
            text: '진행 일자'
        }
      },
      y: {
        beginAtZero: true,
         title: {
            display: true,
            text: '점수 / WPM'
        }
      },
    },
    animation: {
      duration: 1500,
      easing: 'easeInOutQuad',
    },
    hover: {
        mode: 'nearest' as const,
        intersect: true
    }
  };

  return (
    <motion.div 
        className="w-full h-full"
        onViewportEnter={() => {
            // Only trigger animation start if data hasn't been loaded
            if (!dataLoadedRef.current) {
              setStartAnimation(true);
            }
          }}
        initial={{ opacity: 0 }} // Add simple initial opacity
        animate={{ opacity: 1 }} // Fade in the chart container
        transition={{ duration: 0.5 }}
    >
      {/* Render Line only when data loading might have started to prevent initial render issues */}
      {/* Conditionally render or ensure Line handles empty data gracefully */}
      <Line options={options} data={chartData} />
    </motion.div>
  );
} 