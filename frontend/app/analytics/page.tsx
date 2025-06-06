'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
import ReflectionJournal from '@/components/analytics/ReflectionJournal';
import PersonalizedSuggestions from '@/components/analytics/PersonalizedSuggestions';

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
  const [pageLoaded, setPageLoaded] = useState(false);
  
  // 진입 경험 효과
  useEffect(() => {
    // 페이지 진입 시 브리딩 모멘트 제공
    const timer = setTimeout(() => {
      setPageLoaded(true);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  // Memoized chart data calculations, now safe because `data` is guaranteed to be non-null
  const overallProfileData = useMemo(() => {
    if (!metrics) return null;
    const labels = Object.keys(metrics).map(key => metricDisplayNames[key as keyof CognitiveMetrics] || key);
    const dataValues = Object.values(metrics);
    return { labels, datasets: [{ label: '나의 인지 역량', data: dataValues, backgroundColor: 'rgba(79, 70, 229, 0.2)', borderColor: 'rgba(79, 70, 229, 1)', borderWidth: 2 }] };
  }, [metrics]);

  const timeSeriesChartData = useMemo(() => {
    if (!timeSeries || timeSeries.length === 0) return null;
  
    // 브랜드 컬러 시스템 정의
    const brandColors = [
      'rgb(var(--primary-indigo))',
      'rgb(var(--primary-turquoise))',
      'rgb(var(--secondary-green))',
      'rgb(var(--secondary-beige))',
      'rgb(var(--accent-orange))'
    ];
    
    const labels = timeSeries.map(d => new Date(d.date).toLocaleDateString());
    const datasets = Object.keys(timeSeries[0].metrics).map((key, index) => ({
      label: metricDisplayNames[key as keyof CognitiveMetrics] || key,
      data: timeSeries.map(d => d.metrics[key as keyof CognitiveMetrics]),
      borderColor: brandColors[index % brandColors.length],
      backgroundColor: `${brandColors[index % brandColors.length]}20`, // 약 12% 투명도
      tension: 0.3,
    }));
    return { labels, datasets };
  }, [timeSeries]);
  
  // Chart options can be defined here as they are static
  const radarChartOptions = { 
    scales: { r: { suggestedMin: 0, suggestedMax: 100 } }, 
    maintainAspectRatio: false 
  };
  
  const lineChartOptions = { 
    responsive: true, 
    maintainAspectRatio: false 
  };

  // 브랜드 OS에 맞는 진입 경험
  if (!pageLoaded) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center habitus-transition">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-medium mb-3" style={{ color: 'rgb(var(--primary-indigo))' }}>
            당신의 인지적 여정을 살펴볼 준비가 되셨나요?
          </h2>
          <p className="text-gray-600">
            잠시 호흡을 고르며 기다려주세요...
          </p>
        </div>
        <div className="w-16 h-16 border-t-4 border-b-4 rounded-full animate-spin" 
          style={{ borderColor: 'rgb(var(--primary-turquoise))' }}></div>
      </div>
    );
  }

  return (
    <>
      <header className="mb-8 md:mb-10 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: 'rgb(var(--primary-indigo))' }}>
          나의 인지적 여정
        </h1>
        <p className="text-md sm:text-lg text-gray-600 mt-2">
          당신만의 고유한 성장 패턴을 발견하고 앞으로의 여정을 설계하세요.
        </p>
      </header>

      {/* 최상단에 종합 점수(인지적 여정 단계) 배치 */}
      <OverallScoreCard score={overallScore} />
      
      {/* 시간에 따른 성장 여정 */}
      <TimeSeriesChartCard chartData={timeSeriesChartData} chartOptions={lineChartOptions} />

      {/* 인지적 역량 패턴과 강점/약점 분석 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 md:mb-8">
        <OverallProfileRadarCard radarChartData={overallProfileData} radarChartOptions={radarChartOptions} />
        <StrengthsWeaknessesDisplay strengthsData={data.strengths} improvementAreasData={data.weaknesses} metricDisplayNames={metricDisplayNames} />
      </div>
      
      {/* 역량 수준 상세 분석 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 md:mb-8">
        <PercentileRankCard percentileRanksData={percentileRanks} metricDisplayNames={metricDisplayNames} />
        <RecommendationsCard recommendationsData={recommendations} />
      </div>
      
      {/* 성찰 프롬프트 - 종료 경험 */}
      <Card className="mb-8 quiet-victory appear">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-medium mb-4" style={{ color: 'rgb(var(--primary-indigo))' }}>
            오늘의 발견
          </h3>
          <p className="text-gray-600 mb-6">
            오늘 발견한 당신의 인지적 강점을 잠시 되돌아보세요.
            이 순간의 성찰이 앞으로의 성장에 큰 힘이 됩니다.
          </p>
          <div className="p-4 rounded-lg bg-gray-50 inline-block">
            <p className="italic text-gray-500">
              "성장은 폭발이 아닌, 매일의 축적이다."
            </p>
          </div>
        </CardContent>
      </Card>
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
  const [isRetrying, setIsRetrying] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
        const token = localStorage.getItem('token');

        if (!token) {
          router.push('/auth/login');
        setIsLoading(false);
          return;
        }
        
      try {
        setIsRetrying(false);
        const response = await fetch(`/api/cognitive/metrics?timeRange=${timeRange}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.statusText}`);
        }
        
        const result: ApiResponse = await response.json();
        
        if (!result.data) {
          throw new Error("Invalid data structure from API.");
        }
        
        setAnalyticsData(result.data);
      } catch (err) {
        console.error('Failed to fetch analytics data:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        
        // 개발 환경에서는 목업 데이터를 사용하지 않음
        // 실제 API 오류 경험을 디버그하고 테스트하기 위함
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [timeRange, router, isRetrying]);

  // 데이터 다시 로드 핸들러
  const handleRetry = () => {
    setIsRetrying(true);
  };

  // 탭 변경 핸들러에 트랜지션 효과 추가
  const handleTimeRangeChange = (value: string) => {
    // 탭 변경 시 로딩 상태로 UI 업데이트
    setIsLoading(true);
    
    // 부드러운 트랜지션을 위해 짧은 지연 후 상태 업데이트
    setTimeout(() => {
      setTimeRange(value as any);
    }, 300);
  };

    return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      {/* 탭 변경 시 시각적 피드백 추가 */}
      <Tabs 
        value={timeRange} 
        onValueChange={handleTimeRangeChange} 
        className="mb-6 md:mb-8"
      >
        <TabsList className="habitus-transition">
          <TabsTrigger 
            value="1m"
            className="relative overflow-hidden habitus-transition"
            style={{ 
              color: timeRange === '1m' ? 'rgb(var(--primary-indigo))' : '',
              borderColor: timeRange === '1m' ? 'rgb(var(--primary-indigo))' : ''
            }}
          >
            1개월
            {timeRange === '1m' && (
              <span 
                className="absolute bottom-0 left-0 w-full h-0.5 habitus-transition"
                style={{ backgroundColor: 'rgb(var(--primary-turquoise))' }}
              ></span>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="3m"
            className="relative overflow-hidden habitus-transition"
            style={{ 
              color: timeRange === '3m' ? 'rgb(var(--primary-indigo))' : '',
              borderColor: timeRange === '3m' ? 'rgb(var(--primary-indigo))' : ''
            }}
          >
            3개월
            {timeRange === '3m' && (
              <span 
                className="absolute bottom-0 left-0 w-full h-0.5 habitus-transition"
                style={{ backgroundColor: 'rgb(var(--primary-turquoise))' }}
              ></span>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="6m"
            className="relative overflow-hidden habitus-transition"
            style={{ 
              color: timeRange === '6m' ? 'rgb(var(--primary-indigo))' : '',
              borderColor: timeRange === '6m' ? 'rgb(var(--primary-indigo))' : ''
            }}
          >
            6개월
            {timeRange === '6m' && (
              <span 
                className="absolute bottom-0 left-0 w-full h-0.5 habitus-transition"
                style={{ backgroundColor: 'rgb(var(--primary-turquoise))' }}
              ></span>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="all"
            className="relative overflow-hidden habitus-transition"
            style={{ 
              color: timeRange === 'all' ? 'rgb(var(--primary-indigo))' : '',
              borderColor: timeRange === 'all' ? 'rgb(var(--primary-indigo))' : ''
            }}
          >
            전체
            {timeRange === 'all' && (
              <span 
                className="absolute bottom-0 left-0 w-full h-0.5 habitus-transition"
                style={{ backgroundColor: 'rgb(var(--primary-turquoise))' }}
              ></span>
            )}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-16 h-16 border-t-4 border-b-4 rounded-full animate-spin mb-4" 
            style={{ borderColor: 'rgb(var(--primary-turquoise))' }}></div>
          <p className="text-gray-600 text-center">
            당신만의 인지적 여정을 불러오는 중입니다.<br/>
            잠시만 기다려주세요...
          </p>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <div className="bg-red-50 p-6 rounded-lg inline-block mb-6 max-w-md">
            <div className="text-red-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-red-800 mb-2">데이터를 불러오지 못했습니다</h3>
            <p className="text-sm text-red-700 mb-4">{error}</p>
            <p className="text-sm text-gray-600 mb-6">
              서버 연결에 문제가 있거나 데이터 처리 중 오류가 발생했습니다.
              잠시 후 다시 시도해주세요.
            </p>
            <Button
              onClick={handleRetry} 
              className="habitus-transition px-6 py-2 rounded-full"
              style={{
                backgroundColor: 'rgb(var(--primary-indigo))',
                color: 'white'
              }}
            >
              <span className="mr-2">다시 시도하기</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </Button>
          </div>
        </div>
      ) : analyticsData ? (
        <AnalyticsDashboard data={analyticsData} />
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-600">아직 분석할 데이터가 없습니다.</p>
          <p className="text-sm text-gray-500 mt-2">
            젠고 게임을 플레이하면 인지적 분석 데이터가 생성됩니다.
              </p>
              <Button
            onClick={() => router.push('/zengo')} 
            className="mt-6 habitus-transition px-6 py-2 rounded-full"
            style={{
              backgroundColor: 'rgb(var(--primary-turquoise))',
              color: 'white'
            }}
          >
            젠고 게임하기
              </Button>
        </div>
      )}
    </div>
  );
} 