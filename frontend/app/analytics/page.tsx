'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PercentileRankCard from '@/components/analytics/PercentileRankCard';
import TimeSeriesChartCard from '@/components/analytics/TimeSeriesChartCard';
import OverallScoreCard from '@/components/analytics/OverallScoreCard';
import StrengthsWeaknessesDisplay from '@/components/analytics/StrengthsWeaknessesDisplay';
import ReflectionJournal from '@/components/analytics/ReflectionJournal';
import PersonalizedSuggestions from '@/components/analytics/PersonalizedSuggestions';

// 인지 능력 메트릭 구조 정의
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

// 시계열 데이터 구조 정의
interface TimeSeriesData {
  workingMemory: { date: string; value: number; baseline?: number }[];
  attention: { date: string; value: number; baseline?: number }[];
  processingSpeed: { date: string; value: number; baseline?: number }[];
  cognitiveFlexibility: { date: string; value: number; baseline?: number }[];
}

// 메트릭 이름 매핑 데이터
const metricDisplayNames: Record<keyof CognitiveMetrics, string> = {
  workingMemoryCapacity: '작업 기억 용량',
  visuospatialPrecision: '시공간 정확도',
  processingSpeed: '처리 속도',
  sustainedAttention: '주의 지속성',
  patternRecognition: '패턴 인식',
  cognitiveFlexibility: '인지적 유연성',
  hippocampusActivation: '해마 활성화',
  executiveFunction: '실행 기능',
};

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<string>('3m');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 백엔드 API에서 가져온 데이터를 저장하는 상태
  const [percentileRanks, setPercentileRanks] = useState<Partial<CognitiveMetrics> | null>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData | null>(null);
  const [strengthsWeaknesses, setStrengthsWeaknesses] = useState<{
    strengths: { metric: keyof CognitiveMetrics; score: number; tip: string }[];
    weaknesses: { metric: keyof CognitiveMetrics; score: number; tip: string }[];
  } | null>(null);
  const [overallScore, setOverallScore] = useState<number | null>(null);
  const [growthStage, setGrowthStage] = useState<string | null>(null);

  // 데이터 로딩 함수
  const fetchData = async (range: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // localStorage에서 토큰 가져오기
      const token = localStorage.getItem('token');
      if (!token) {
        // 토큰이 없으면 로그인 페이지로 리디렉션 (실제 구현 시 router 사용)
        console.error("인증 토큰이 없습니다. 로그인 페이지로 이동합니다.");
        setError("인증 정보가 없습니다. 다시 로그인해주세요.");
        setLoading(false);
        // window.location.href = '/auth/login';
        return;
      }
      
      // API 라우트를 통해 데이터 요청 (인증 헤더 추가)
      const response = await fetch(`/api/cognitive/metrics?timeRange=${range}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        cache: 'no-store' // 캐시 비활성화
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          setError('세션이 만료되었거나 유효하지 않습니다. 다시 로그인해주세요.');
          // 여기서 로그인 페이지로 리디렉션 할 수 있습니다.
          // window.location.href = '/auth/login';
        } else {
          const errorData = await response.json().catch(() => ({ message: '알 수 없는 오류가 발생했습니다.' }));
          throw new Error(errorData.message || `API 요청 실패: ${response.status}`);
        }
        return; // 오류 발생 시 함수 종료
      }
      
      const data = await response.json();
      
      // 백엔드 응답 데이터를 각 상태에 할당
      setPercentileRanks(data.percentileRanks || null);
      setTimeSeriesData(data.timeSeriesData || null);
      setStrengthsWeaknesses(data.strengthsWeaknesses || null);
      setOverallScore(data.overallScore || null);
      setGrowthStage(data.growthStage || null);
      
    } catch (err) {
      console.error('데이터 로딩 오류:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('데이터를 불러오는 중 알 수 없는 오류가 발생했습니다. 나중에 다시 시도해주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 및 timeRange 변경 시 데이터 로드
  useEffect(() => {
    fetchData(timeRange);
  }, [timeRange]);

  // 시간 범위 변경 핸들러
  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
  };

  // 재시도 핸들러
  const handleRetry = () => {
    fetchData(timeRange);
  };

  // 로딩 상태 UI
  if (loading) {
    return (
      <div className="container p-4 mx-auto max-w-6xl">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-16 h-16 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
          <p className="mt-4 text-lg text-gray-600">데이터를 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

  // 오류 상태 UI
  if (error) {
    return (
      <div className="container p-4 mx-auto max-w-6xl">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-lg text-gray-700 mb-2">오류가 발생했습니다</p>
          <p className="text-sm text-gray-500 mb-6">{error}</p>
          <button 
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            onClick={handleRetry}
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container p-4 mx-auto max-w-6xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 quiet-victory">인지 능력 분석</h1>
      
      <div className="mb-8">
        <Tabs value={timeRange} onValueChange={handleTimeRangeChange}>
          <TabsList className="w-full">
            <TabsTrigger value="1m" className="flex-1">1개월</TabsTrigger>
            <TabsTrigger value="3m" className="flex-1">3개월</TabsTrigger>
            <TabsTrigger value="6m" className="flex-1">6개월</TabsTrigger>
            <TabsTrigger value="all" className="flex-1">전체</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* 데이터가 없는 경우 */}
      {!overallScore && !percentileRanks && !timeSeriesData ? (
        <div className="text-center py-10">
          <p className="text-gray-600">아직 분석할 데이터가 없습니다.</p>
          <p className="text-sm text-gray-500 mt-2">
            젠고 게임을 플레이하면 인지적 분석 데이터가 생성됩니다.
          </p>
          <a href="/zengo">
            <button
              className="mt-6 habitus-transition px-6 py-2 rounded-full"
              style={{
                backgroundColor: 'rgb(var(--primary-turquoise))',
                color: 'white'
              }}
            >
              젠고 게임하기
            </button>
          </a>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {overallScore !== null && <OverallScoreCard score={overallScore} />}
            <PercentileRankCard 
              percentileRanksData={percentileRanks} 
              metricDisplayNames={metricDisplayNames} 
            />
          </div>
          
          <div className="grid grid-cols-1 gap-6 mb-6">
            <StrengthsWeaknessesDisplay 
              strengths={strengthsWeaknesses?.strengths.map(s => ({ ...s, metric: metricDisplayNames[s.metric], description: s.tip })) || []} 
              weaknesses={strengthsWeaknesses?.weaknesses.map(w => ({ ...w, metric: metricDisplayNames[w.metric], description: w.tip })) || []} 
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <TimeSeriesChartCard 
              title="작업 기억력 추이"
              description="시간에 따른 작업 기억 용량의 변화를 추적합니다."
              data={timeSeriesData?.workingMemory || []}
              metricLabel="작업 기억력"
              yAxisLabel="점수"
              showBaseline={true}
            />
            <TimeSeriesChartCard 
              title="집중력 추이"
              description="시간에 따른 주의력 지속성의 변화를 추적합니다."
              data={timeSeriesData?.attention || []}
              metricLabel="집중력"
              yAxisLabel="점수"
              showBaseline={true}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <TimeSeriesChartCard 
              title="처리 속도 추이"
              description="시간에 따른 정보 처리 속도의 변화를 추적합니다."
              data={timeSeriesData?.processingSpeed || []}
              metricLabel="처리 속도"
              yAxisLabel="점수"
              showBaseline={true}
            />
            <TimeSeriesChartCard 
              title="인지적 유연성 추이"
              description="시간에 따른 인지적 유연성의 변화를 추적합니다."
              data={timeSeriesData?.cognitiveFlexibility || []}
              metricLabel="인지적 유연성"
              yAxisLabel="점수"
              showBaseline={true}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ReflectionJournal metricName="cognitive" />
            <PersonalizedSuggestions 
              currentGoals={['overall', 'workingMemory', 'attention']} 
              metricScores={percentileRanks || undefined}
            />
          </div>
        </>
      )}

      <div className="text-center py-8 text-gray-500 text-sm">
        <p>당신의 인지 능력 데이터는 {timeRange === '1m' ? '최근 1개월' : timeRange === '3m' ? '최근 3개월' : timeRange === '6m' ? '최근 6개월' : '전체 기간'}의 활동을 기반으로 분석되었습니다.</p>
        <p className="mt-1">
          이 분석은 정보 제공 목적으로만 사용되며, 의학적 진단을 대체하지 않습니다. 
          더 많은 활동을 수행할수록 더 정확한 분석이 가능합니다.
        </p>
      </div>
    </div>
  );
} 