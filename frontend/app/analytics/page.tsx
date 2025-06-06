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

// #############################################################################
// Presentation Component: Renders the dashboard when data is ready
// #############################################################################
function AnalyticsDashboard({ data }: { data: BrainAnalyticsData }) {
  const { metrics, timeSeriesData: timeSeries, percentileRanks, recommendations, overallScore } = data;

  // Memoized chart data calculations, now safe because `data` is guaranteed to be non-null
  const overallProfileData = useMemo(() => {
    if (!metrics) return null;
    const labels = Object.keys(metrics).map(key => metricDisplayNames[key as keyof CognitiveMetrics] || key);
    const dataValues = Object.values(metrics);
    return { labels, datasets: [{ label: '나의 인지 역량', data: dataValues, backgroundColor: 'rgba(79, 70, 229, 0.2)', borderColor: 'rgba(79, 70, 229, 1)', borderWidth: 2 }] };
  }, [metrics]);

  const timeSeriesChartData = useMemo(() => {
    if (!timeSeries || timeSeries.length === 0) return null;
    const labels = timeSeries.map(d => new Date(d.date).toLocaleDateString());
    const datasets = Object.keys(timeSeries[0].metrics).map(key => ({
      label: metricDisplayNames[key as keyof CognitiveMetrics] || key,
      data: timeSeries.map(d => d.metrics[key as keyof CognitiveMetrics]),
      borderColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
      tension: 0.1,
    }));
    return { labels, datasets };
  }, [timeSeries]);
  
  // Chart options can be defined here as they are static
  const radarChartOptions = { scales: { r: { suggestedMin: 0, suggestedMax: 100 } }, maintainAspectRatio: false };
  const lineChartOptions = { responsive: true, maintainAspectRatio: false };

  return (
    <>
      <header className="mb-8 md:mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">브레인 역량 분석</h1>
        <p className="text-md sm:text-lg text-gray-600 mt-1">
          나의 인지 능력을 다각도로 분석하고 성장을 위한 맞춤형 가이드를 받아보세요.
        </p>
      </header>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 md:mb-8">
        <OverallProfileRadarCard radarChartData={overallProfileData} radarChartOptions={radarChartOptions} />
        <StrengthsWeaknessesDisplay strengthsData={data.strengths} improvementAreasData={data.weaknesses} metricDisplayNames={metricDisplayNames} />
      </div>

      <TimeSeriesChartCard chartData={timeSeriesChartData} chartOptions={lineChartOptions} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 md:mb-8">
        <PercentileRankCard percentileRanksData={percentileRanks} metricDisplayNames={metricDisplayNames} />
      </div>

      <RecommendationsCard recommendationsData={recommendations} />
      <OverallScoreCard score={overallScore} />
    </>
  );
}

// #############################################################################
// Container Component: Handles data fetching, loading, and error states
// #############################################################################
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
      const token = localStorage.getItem('token');

      if (!token) {
        if (process.env.NODE_ENV === 'development') {
          console.warn("DEV: No token found, using mock data.");
          setAnalyticsData(mockBrainAnalyticsData);
        } else {
          router.push('/auth/login');
        }
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/cognitive/metrics?timeRange=${timeRange}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        const result: ApiResponse = await response.json();
        if (!result.data) throw new Error("Invalid data structure from API.");
        setAnalyticsData(result.data);
      } catch (err) {
        console.error('Failed to fetch analytics data:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        if (process.env.NODE_ENV === 'development') {
          console.warn("DEV: API call failed, falling back to mock data.");
          setAnalyticsData(mockBrainAnalyticsData);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [timeRange, router]);

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as any)} className="mb-6 md:mb-8">
        <TabsList>
          <TabsTrigger value="1m">1개월</TabsTrigger>
          <TabsTrigger value="3m">3개월</TabsTrigger>
          <TabsTrigger value="6m">6개월</TabsTrigger>
          <TabsTrigger value="all">전체</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {isLoading && <div className="text-center py-10">데이터를 불러오는 중...</div>}
      {error && <div className="text-center py-10 text-red-500">오류: {error}</div>}
      
      {/* Render the dashboard ONLY when data is available and there are no errors */}
      {!isLoading && !error && analyticsData && <AnalyticsDashboard data={analyticsData} />}
      
      {/* Handle case where data is empty but no error */}
      {!isLoading && !error && !analyticsData && <div className="text-center py-10">분석 데이터가 없습니다.</div>}
    </div>
  );
} 