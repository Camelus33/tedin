'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, BarElement, RadarController, RadialLinearScale, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Line, Radar, Doughnut } from 'react-chartjs-2';
import Button from '@/components/common/Button'; // Assuming this component exists
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import TimeSeriesChartCard from '@/components/analytics/TimeSeriesChartCard'; // 새로 추가
import PercentileRankCard from '@/components/analytics/PercentileRankCard'; // 새로 추가
import RecentGamesCard from '@/components/analytics/RecentGamesCard'; // 새로 추가
import RecommendationsCard from '@/components/analytics/RecommendationsCard'; // 새로 추가
import OverallProfileRadarCard from '@/components/analytics/OverallProfileRadarCard'; // 새로 추가
import StrengthsWeaknessesDisplay from '@/components/analytics/StrengthsWeaknessesDisplay'; // 새로 추가
import OverallScoreCard from '@/components/analytics/OverallScoreCard'; // 새로 추가

// Register Chart.js components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadarController,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
);

// Type definitions
interface CognitiveMetrics {
  workingMemoryCapacity: number;
  visuospatialPrecision: number;
  processingSpeed: number;
  sustainedAttention: number;
  patternRecognition: number;
  cognitiveFlexibility: number;
  hippocampusActivation: number;
  executiveFunction: number;
}

interface CognitiveMetricsTimeSeries {
  date: string;
  metrics: CognitiveMetrics;
}

interface RecentGame {
  gameId: string;
  gameName: string;
  playedAt: string;
  score: number;
  level: string;
  metricsChange: Partial<CognitiveMetrics>;
}

interface BrainAnalyticsData {
  overallScore: number;
  metrics: CognitiveMetrics;
  timeSeriesData: CognitiveMetricsTimeSeries[];
  percentileRanks: Partial<Record<keyof CognitiveMetrics, number>>;
  strengths: (keyof CognitiveMetrics)[];
  weaknesses: (keyof CognitiveMetrics)[];
  recommendations: {
    title: string;
    description: string;
    action: string;
    link?: string;
  }[];
}

interface ApiResponse {
  message: string;
  data: BrainAnalyticsData;
}

// Mock Data (will be replaced by API call)
const mockCognitiveMetrics: CognitiveMetrics = {
  workingMemoryCapacity: 75,
  visuospatialPrecision: 80,
  processingSpeed: 85,
  sustainedAttention: 70,
  patternRecognition: 90,
  cognitiveFlexibility: 65,
  hippocampusActivation: 78,
  executiveFunction: 82,
};

const mockBrainAnalyticsData: BrainAnalyticsData = {
  overallScore: 78,
  metrics: mockCognitiveMetrics,
  timeSeriesData: [
    { date: '2024-04-01', metrics: { ...mockCognitiveMetrics, workingMemoryCapacity: 60, processingSpeed: 70 } },
    { date: '2024-04-15', metrics: { ...mockCognitiveMetrics, workingMemoryCapacity: 65, processingSpeed: 75 } },
    { date: '2024-05-01', metrics: { ...mockCognitiveMetrics, workingMemoryCapacity: 70, processingSpeed: 80 } },
    { date: '2024-05-15', metrics: mockCognitiveMetrics },
  ],
  percentileRanks: {
    workingMemoryCapacity: 88,
    processingSpeed: 92,
    sustainedAttention: 75,
    executiveFunction: 85,
  },
  strengths: ['patternRecognition', 'processingSpeed'],
  weaknesses: ['cognitiveFlexibility', 'sustainedAttention'],
  recommendations: [
    {
      title: '작업 기억 용량 강화',
      description: '작업 기억 용량이 평균보다 낮습니다. 젠고의 단어 순서 기억 게임을 통해 이 영역을 집중 훈련하세요.',
      action: '단어 순서 기억 게임 시작',
      link: '/zengo/memory-sequence',
    },
    {
      title: '정보 처리 속도 유지',
      description: '정보 처리 속도가 매우 우수합니다! 현재 수준을 유지하고 더 높은 난이도에 도전해 보세요.',
      action: '젠고 고급 레벨 도전',
      link: '/zengo/advanced-levels',
    },
  ],
};

const metricDisplayNames: { [K in keyof CognitiveMetrics]: string } = {
  workingMemoryCapacity: '작업기억 용량',
  visuospatialPrecision: '시공간 정확도',
  processingSpeed: '처리 속도',
  sustainedAttention: '주의 지속성',
  patternRecognition: '패턴 인식',
  cognitiveFlexibility: '인지 유연성',
  hippocampusActivation: '해마 활성화',
  executiveFunction: '실행 기능',
};

export default function BrainAnalyticsPage() {
  const router = useRouter();
  const [analyticsData, setAnalyticsData] = useState<BrainAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'1m' | '3m' | '6m' | 'all'>('3m');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('token'); // 'authToken' 대신 'token' 사용

      if (!token) {
        setError('로그인이 필요합니다. 인증 토큰을 찾을 수 없습니다.');
        setIsLoading(false);
        
        // 개발 환경에서만 목업 데이터 사용
        if (process.env.NODE_ENV === 'development') {
          console.warn("개발 환경: 인증 토큰이 없어 목업 데이터를 사용합니다.");
          try {
            await new Promise(resolve => setTimeout(resolve, 1000)); // 네트워크 지연 시뮬레이션
            setAnalyticsData(mockBrainAnalyticsData);
          } catch (err) {
            if (err instanceof Error) {
              setError(err.message);
            } else {
              setError('알 수 없는 오류가 발생했습니다.');
            }
          } finally {
            setIsLoading(false);
          }
        } else {
          // 프로덕션 환경에서는 로그인 페이지로 리디렉션
          router.push('/auth/login');
        }
        return;
      }
      
      try {
        // 실제 API 엔드포인트 및 요청
        const response = await fetch(`/api/cognitive/metrics?timeRange=${timeRange}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          // HTTP 상태 코드가 200-299 범위가 아닐 경우 오류 처리
          const errorData = await response.json().catch(() => ({ message: '응답 처리 중 오류 발생' }));
          throw new Error(errorData.message || `데이터를 불러오는데 실패했습니다. 상태: ${response.status}`);
        }

        const responseData: ApiResponse = await response.json();
        
        // 응답 구조 유효성 검사
        if (!responseData.data || typeof responseData.data !== 'object') {
          console.error('API 응답 구조가 예상과 다릅니다:', responseData);
          throw new Error('API 응답 구조가 유효하지 않습니다.');
        }
        
        // 필수 필드 확인
        const requiredFields = ['metrics', 'overallScore', 'timeSeriesData'];
        const missingFields = requiredFields.filter(field => !(field in responseData.data));
        
        if (missingFields.length > 0) {
          console.error(`API 응답에 필수 필드가 누락되었습니다: ${missingFields.join(', ')}`, responseData.data);
          throw new Error('API 응답에 필수 데이터가 누락되었습니다.');
        }
        
        setAnalyticsData(responseData.data);
      } catch (err) {
        console.error('API 호출 중 오류 발생:', err);
        if (err instanceof Error) {
          setError(`데이터를 불러오는 중 오류가 발생했습니다: ${err.message}`);
        } else {
          setError('알 수 없는 오류가 발생했습니다.');
        }
        
        // 개발 환경에서만 목업 데이터로 폴백
        if (process.env.NODE_ENV === 'development') {
          console.warn("개발 환경: API 호출 실패로 목업 데이터를 사용합니다.");
          setAnalyticsData(mockBrainAnalyticsData);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [timeRange, router]);

  const timeSeriesData = useMemo(() => {
    // 기본값 반환 조건을 상단에 배치
    if (!analyticsData || !analyticsData.timeSeriesData || !analyticsData.metrics) return null;
    
    // 빈 배열 체크
    if (analyticsData.timeSeriesData.length === 0) return null;
    
    // 사전에 모든 배열과 변수 초기화
    const dates = [...analyticsData.timeSeriesData];
    const formattedLabels = [];
    
    // 라벨 처리를 별도로 진행
    for (const d of dates) {
      try {
        const date = new Date(d.date);
        formattedLabels.push(isNaN(date.getTime()) ? '날짜 없음' : `${date.getMonth() + 1}/${date.getDate()}`);
      } catch (e) {
        formattedLabels.push('날짜 없음');
      }
    }
    
    // 메트릭 키를 미리 배열로 준비 - 타입 명시
    const metricKeys = Object.keys(analyticsData.metrics) as Array<keyof CognitiveMetrics>;
    const datasets = [];
    
    // 각 메트릭에 대해 데이터셋 구성
    for (const key of metricKeys) {
      const dataPoints = [];
      for (const d of dates) {
        try {
          if (d.metrics && key in d.metrics) {
            const value = d.metrics[key];
            dataPoints.push(typeof value === 'number' && !isNaN(value) ? value : null);
          } else {
            dataPoints.push(null);
          }
        } catch (e) {
          console.error('데이터 포인트 처리 중 오류:', e);
          dataPoints.push(null);
        }
      }
      
      datasets.push({
        label: metricDisplayNames[key] || String(key),
        data: dataPoints,
        borderColor: getRandomColor(),
        tension: 0.1,
        hidden: !['workingMemoryCapacity', 'processingSpeed'].includes(key as string),
      });
    }
    
    return { labels: formattedLabels, datasets };
  }, [analyticsData, metricDisplayNames]);

  const overallProfileData = useMemo(() => {
    // 기본값 반환 조건을 상단에 배치
    if (!analyticsData || !analyticsData.metrics) return null;
    
    try {
      // 메트릭 키를 미리 배열로 준비
      const metricsKeys = Object.keys(analyticsData.metrics) as Array<keyof CognitiveMetrics>;
      
      if (metricsKeys.length === 0) return null;
      
      // 라벨과 데이터 값을 미리 배열로 초기화
      const labels = [];
      const dataValues = [];
      
      // 각 메트릭에 대해 라벨과 값 추출
      for (const key of metricsKeys) {
        labels.push(metricDisplayNames[key] || String(key));
        
        const value = analyticsData.metrics[key];
        dataValues.push(typeof value === 'number' && !isNaN(value) ? value : 0);
      }
      
      return {
        labels,
        datasets: [
          {
            label: '나의 인지 역량',
            data: dataValues,
            backgroundColor: 'rgba(79, 70, 229, 0.2)', // Indigo-500 with opacity
            borderColor: 'rgba(79, 70, 229, 1)', // Indigo-500
            borderWidth: 2,
            pointBackgroundColor: 'rgba(79, 70, 229, 1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(79, 70, 229, 1)',
          },
        ],
      };
    } catch (e) {
      console.error('인지 프로필 데이터 처리 중 오류:', e);
      return null;
    }
  }, [analyticsData, metricDisplayNames]);

  // Helper function to generate random colors for chart datasets
  const getRandomColor = () => {
    const r = Math.floor(Math.random() * 200);
    const g = Math.floor(Math.random() * 200);
    const b = Math.floor(Math.random() * 200);
    return `rgb(${r},${g},${b})`;
  };

  // lineChartData를 useMemo로 감싸고 안전하게 처리
  const lineChartData = useMemo(() => {
    // null 체크
    if (!analyticsData || !analyticsData.timeSeriesData) return { labels: [], datasets: [] };
  
    // 라벨 배열 초기화
    const formattedLabels = [];
    const workingMemoryData = [];
    const processingSpeedData = [];
  
    // 각 날짜와 데이터 포인트를 명시적으로 처리
    for (let i = 0; i < analyticsData.timeSeriesData.length; i++) {
      const d = analyticsData.timeSeriesData[i];
      
      // 날짜 라벨 처리
      try {
        const date = new Date(d.date);
        formattedLabels.push(isNaN(date.getTime()) ? '날짜 없음' : `${date.getMonth() + 1}/${date.getDate()}`);
      } catch (e) {
        formattedLabels.push('날짜 없음');
      }
      
      // 작업기억 용량 데이터 처리
      try {
        if (d.metrics && 'workingMemoryCapacity' in d.metrics) {
          const value = d.metrics.workingMemoryCapacity;
          workingMemoryData.push(typeof value === 'number' && !isNaN(value) ? value : null);
        } else {
          workingMemoryData.push(null);
        }
      } catch (e) {
        console.error('작업기억 용량 데이터 처리 중 오류:', e);
        workingMemoryData.push(null);
      }
      
      // 처리 속도 데이터 처리
      try {
        if (d.metrics && 'processingSpeed' in d.metrics) {
          const value = d.metrics.processingSpeed;
          processingSpeedData.push(typeof value === 'number' && !isNaN(value) ? value : null);
        } else {
          processingSpeedData.push(null);
        }
      } catch (e) {
        console.error('처리 속도 데이터 처리 중 오류:', e);
        processingSpeedData.push(null);
      }
    }
  
    return {
      labels: formattedLabels,
      datasets: [
        {
          label: '작업기억 용량',
          data: workingMemoryData,
          borderColor: 'rgb(79, 70, 229)', // Indigo
          backgroundColor: 'rgba(79, 70, 229, 0.5)',
          tension: 0.3,
          yAxisID: 'y',
        },
        {
          label: '처리 속도',
          data: processingSpeedData,
          borderColor: 'rgb(5, 150, 105)', // Emerald
          backgroundColor: 'rgba(5, 150, 105, 0.5)',
          tension: 0.3,
          yAxisID: 'y',
        },
      ],
    };
  }, [analyticsData]);

  // radarChartData를 useMemo로 감싸고 안전하게 처리
  const radarChartData = useMemo(() => {
    // null 체크
    if (!analyticsData || !analyticsData.metrics) return { labels: [], datasets: [] };
    
    // 기본 라벨 배열
    const labels = [
      '작업기억 용량',
      '시공간 정확도',
      '처리 속도',
      '주의 지속성',
      '패턴 인식',
      '인지 유연성',
      '해마 활성화',
      '실행 기능',
    ];
    
    // 데이터 포인트 초기화
    const dataPoints = [];
    
    // 각 메트릭 값을 명시적으로 추출
    try {
      const m = analyticsData.metrics;
      
      // 각 메트릭에 대해 값 추출 시 null 체크
      dataPoints.push(typeof m.workingMemoryCapacity === 'number' && !isNaN(m.workingMemoryCapacity) ? m.workingMemoryCapacity : 0);
      dataPoints.push(typeof m.visuospatialPrecision === 'number' && !isNaN(m.visuospatialPrecision) ? m.visuospatialPrecision : 0);
      dataPoints.push(typeof m.processingSpeed === 'number' && !isNaN(m.processingSpeed) ? m.processingSpeed : 0);
      dataPoints.push(typeof m.sustainedAttention === 'number' && !isNaN(m.sustainedAttention) ? m.sustainedAttention : 0);
      dataPoints.push(typeof m.patternRecognition === 'number' && !isNaN(m.patternRecognition) ? m.patternRecognition : 0);
      dataPoints.push(typeof m.cognitiveFlexibility === 'number' && !isNaN(m.cognitiveFlexibility) ? m.cognitiveFlexibility : 0);
      dataPoints.push(typeof m.hippocampusActivation === 'number' && !isNaN(m.hippocampusActivation) ? m.hippocampusActivation : 0);
      dataPoints.push(typeof m.executiveFunction === 'number' && !isNaN(m.executiveFunction) ? m.executiveFunction : 0);
    } catch (e) {
      console.error('메트릭 데이터 처리 중 오류:', e);
      // 오류 발생 시 모든 값을 0으로 설정
      for (let i = 0; i < 8; i++) {
        dataPoints.push(0);
      }
    }
    
    return {
      labels,
      datasets: [
        {
          label: '나의 인지 역량',
          data: dataPoints,
          backgroundColor: 'rgba(79, 70, 229, 0.2)', // Indigo
          borderColor: 'rgba(79, 70, 229, 1)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(79, 70, 229, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(79, 70, 229, 1)',
        },
      ],
    };
  }, [analyticsData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-600">데이터를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <p className="text-lg text-red-600 mb-4">오류: {error}</p>
        <Button onClick={() => { setIsLoading(true); setError(null); /* fetchData(); */ }} variant="outline">
          다시 시도
        </Button>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-500">분석 데이터를 표시할 수 없습니다.</p>
      </div>
    );
  }

  const { 
    metrics, 
    timeSeriesData: timeSeries,
    percentileRanks, 
    recommendations
  } = analyticsData;

  const radarChartOptions = {
    scales: {
      r: {
        angleLines: {
          display: true,
        },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: {
          stepSize: 20,
          backdropColor: 'transparent',
          font: { size: 10 }, // 틱 라벨 크기 조정
        },
        pointLabels: {
          font: {
            size: 11, // 포인트 라벨 크기를 약간 줄여 작은 화면에 대응
            family: "'Pretendard', sans-serif" // 폰트 일관성 유지
          },
          padding: 5 // 라벨과 차트 가장자리 사이의 패딩
        },
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.r !== null) {
              label += context.parsed.r.toFixed(0) + '점';
            }
            return label;
          }
        }
      }
    },
    maintainAspectRatio: false,
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toFixed(0) + '점';
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: '날짜',
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: '점수 (0-100)',
        },
        suggestedMin: 0,
        suggestedMax: 100,
      },
    },
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <header className="mb-8 md:mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">브레인 역량 분석</h1>
        <p className="text-md sm:text-lg text-gray-600 mt-1">
          나의 인지 능력을 다각도로 분석하고 성장을 위한 맞춤형 가이드를 받아보세요.
        </p>
      </header>

      <Tabs value={timeRange} onValueChange={(value: string) => setTimeRange(value as '1m' | '3m' | '6m' | 'all')} className="mb-6 md:mb-8">
        <TabsList>
          <TabsTrigger value="1m">1개월</TabsTrigger>
          <TabsTrigger value="3m">3개월</TabsTrigger>
          <TabsTrigger value="6m">6개월</TabsTrigger>
          <TabsTrigger value="all">전체</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 md:mb-8">
        {/* Left Column: Overall Profile Radar Chart */}
        <OverallProfileRadarCard 
          radarChartData={radarChartData} 
          radarChartOptions={radarChartOptions} 
        />

        {/* Right Column: Strengths and Improvement Areas */}
        <StrengthsWeaknessesDisplay 
          strengthsData={analyticsData?.strengths}
          improvementAreasData={analyticsData?.weaknesses}
          metricDisplayNames={metricDisplayNames}
        />
      </div>

      {/* Time-based Change Section */}
      <TimeSeriesChartCard chartData={timeSeriesData} chartOptions={lineChartOptions} />
      
      {/* Percentile Rank & Recent Games Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 md:mb-8">
        {/* Percentile Rank Section */}
        <PercentileRankCard 
          percentileRanksData={analyticsData?.percentileRanks} 
          metricDisplayNames={metricDisplayNames}
        />

        {/* Recent Games Section - 연결 데이터가 없으면 주석 처리 */}
        {/* <RecentGamesCard 
          recentGamesData={analyticsData?.recentGames} 
          metricDisplayNames={metricDisplayNames} 
        /> */}
      </div>

      {/* Personalized Recommendation Section */}
      <RecommendationsCard recommendationsData={analyticsData?.recommendations} />

      {/* Display Overall Cognitive Score Card */}
      <OverallScoreCard score={analyticsData.overallScore} />

    </div>
  );
} 