import React, { useEffect, useRef } from 'react';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Tooltip,
  ChartOptions,
  ChartData,
} from 'chart.js';
import { AdapterDateFns } from 'chartjs-adapter-date-fns';
import { ko } from 'date-fns/locale';

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  AdapterDateFns,
  Tooltip,
);

interface CognitiveTimeSeriesChartProps {
  dataPoints: { date: string; cognitiveScore: number }[];
}

const CognitiveTimeSeriesChart: React.FC<CognitiveTimeSeriesChartProps> = ({
  dataPoints,
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current || dataPoints.length === 0) {
      return;
    }

    // Log the incoming dataPoints
    console.log('CognitiveTimeSeriesChart dataPoints:', dataPoints);

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) {
      return;
    }

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const chartData: ChartData<'line'> = {
      datasets: [
        {
          label: '종합 인지 점수',
          data: dataPoints.map((point) => {
            const dateObject = new Date(point.date);
            // Log the original date string and the parsed Date object
            console.log(`Parsing date: ${point.date} ->`, dateObject);
            return {
              x: dateObject.valueOf(), // Use valueOf() for timestamp
              y: point.cognitiveScore,
            };
          }),
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
          pointRadius: 3,
          pointBackgroundColor: 'rgb(75, 192, 192)',
        },
      ],
    };

    const scores = dataPoints.map((point) => point.cognitiveScore);
    const minScore = Math.min(...scores);
    const maxScore = Math.max(...scores);
    const yAxisMin = Math.max(0, minScore - 5);
    const yAxisMax = maxScore + 5;

    const options: ChartOptions<'line'> = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: 'time',
          adapters: {
            date: {
              locale: ko,
            },
          },
          time: {
            unit: 'day',
            displayFormats: {
              day: 'MM.dd',
            },
            tooltipFormat: 'yyyy.MM.dd',
          },
          title: {
            display: true,
            text: '날짜',
          },
          grid: {
            display: false,
          },
          ticks: {
            maxTicksLimit: 10,
            source: 'auto',
            autoSkip: true,
          }
        },
        y: {
          beginAtZero: false,
          min: yAxisMin,
          max: yAxisMax,
          title: {
            display: true,
            text: '종합 인지 점수',
          },
          grid: {
            color: 'rgba(200, 200, 200, 0.2)',
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: true,
          mode: 'index',
          intersect: false,
          callbacks: {
             title: function(tooltipItems) {
               const date = new Date(tooltipItems[0].parsed.x);
               return `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}`;
             },
             label: function(context) {
               let label = context.dataset.label || '';
               if (label) {
                 label += ': ';
               }
               if (context.parsed.y !== null) {
                 label += context.parsed.y;
               }
               return label;
             }
          }
        },
      },
       interaction: {
         mode: 'index',
         intersect: false,
       },
       elements: {
          point: {
            hoverRadius: 5,
            hitRadius: 10,
          }
       }
    };

    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: chartData,
      options: options,
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [dataPoints]);

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <canvas ref={chartRef} />
    </div>
  );
};

export default CognitiveTimeSeriesChart; 