'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PercentileRankCard from '@/components/analytics/PercentileRankCard';
import TimeSeriesChartCard from '@/components/analytics/TimeSeriesChartCard';
import OverallScoreCard from '@/components/analytics/OverallScoreCard';
import StrengthsWeaknessesDisplay from '@/components/analytics/StrengthsWeaknessesDisplay';
import WeekHourHeatmap from '@/components/analytics/WeekHourHeatmap';
import FastRhythmTop from '@/components/analytics/FastRhythmTop';
import KeywordChips from '@/components/analytics/KeywordChips';
import { ExtendedCognitiveMetrics, extendedMetricDisplayNames } from '../../src/types/cognitiveMetricsExtended';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { apiClient } from '@/lib/apiClient';

// V2 확장 타입 사용
type CognitiveMetrics = ExtendedCognitiveMetrics;

// 시계열 데이터 구조를 모든 메트릭을 포함하도록 확장
interface TimeSeriesData {
  workingMemory: { date: string; value: number }[];
  attention: { date: string; value: number }[];
  processingSpeed: { date: string; value: number }[];
  cognitiveFlexibility: { date: string; value: number }[];
  visuospatialPrecision: { date: string; value: number }[];
  patternRecognition: { date: string; value: number }[];
  hippocampusActivation: { date: string; value: number }[];
  executiveFunction: { date: string; value: number }[];
}

// V2 확장 메트릭 표시명 사용
const metricDisplayNames = extendedMetricDisplayNames;

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<string>('3m');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [aggregate, setAggregate] = useState<null | any>(null);
  const [v2, setV2] = useState<null | {
    weekdayHourHeatmap: Record<'all' | 'create_note' | 'add_thought' | 'evolve_memo' | 'add_connection', number[][]>;
    fastestRhythmTop: Array<{ weekday: number; hour: number; medianIntervalMin: number; count: number }>;
    topKeywords7d: Array<{ term: string; count: number; deltaPct: number }>;
    streakDays: number;
  }>(null);

  // 백엔드 API에서 가져온 데이터를 저장하는 상태
  const [percentileRanks, setPercentileRanks] = useState<Partial<CognitiveMetrics> | null>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData | null>(null);
  const [strengthsWeaknesses, setStrengthsWeaknesses] = useState<{
    strengths: { metric: keyof CognitiveMetrics; score: number; description: string }[];
    weaknesses: { metric: keyof CognitiveMetrics; score: number; description: string }[];
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
      
      const analyticsData = await response.json();
      
      console.log('📊 Analytics API 원본 응답:', JSON.stringify(analyticsData, null, 2));

      // API 응답 구조에 맞게 `data` 객체 추출
      const { data } = analyticsData;

      if (!data) {
        // 데이터가 없는 경우의 처리 (예: 기본값 설정 또는 오류 메시지)
        setError('분석 데이터가 없습니다. 젠고 게임을 플레이하여 데이터를 생성해주세요.');
        setPercentileRanks(null);
        setTimeSeriesData(null);
        setStrengthsWeaknesses(null);
        setOverallScore(50); // 기본 점수 설정
        setGrowthStage('초보자');
        setLoading(false);
        return;
      }
      
      // V2 확장 메트릭을 포함한 백분위 순위 설정
      setPercentileRanks(data.percentileRanks || null);
      
      // timeSeriesData를 프론트엔드 형식으로 변환 (API 응답 키 이름 'timeSeriesData' 사용)
      if (data.timeSeriesData && data.timeSeriesData.length > 0) {
        const converted: TimeSeriesData = {
          workingMemory: data.timeSeriesData.map((item: any) => ({
            date: item.date,
            value: item.metrics.workingMemoryCapacity || 0,
          })),
          attention: data.timeSeriesData.map((item: any) => ({
            date: item.date,
            value: item.metrics.sustainedAttention || 0,
          })),
          processingSpeed: data.timeSeriesData.map((item: any) => ({
            date: item.date,
            value: item.metrics.processingSpeed || 0,
          })),
          cognitiveFlexibility: data.timeSeriesData.map((item: any) => ({
            date: item.date,
            value: item.metrics.cognitiveFlexibility || 0,
          })),
          visuospatialPrecision: data.timeSeriesData.map((item: any) => ({
            date: item.date,
            value: item.metrics.visuospatialPrecision || 0,
          })),
          patternRecognition: data.timeSeriesData.map((item: any) => ({
            date: item.date,
            value: item.metrics.patternRecognition || 0,
          })),
          hippocampusActivation: data.timeSeriesData.map((item: any) => ({
            date: item.date,
            value: item.metrics.hippocampusActivation || 0,
          })),
          executiveFunction: data.timeSeriesData.map((item: any) => ({
            date: item.date,
            value: item.metrics.executiveFunction || 0,
          })),
        };
        setTimeSeriesData(converted);
      } else {
        setTimeSeriesData(null);
      }
      
      // 강점/약점 데이터 설정 (API 응답 키 이름 'weaknesses' 사용)
      if (data.strengths && data.weaknesses) {
        const latestMetrics = data.metrics || {};
        setStrengthsWeaknesses({
          strengths: data.strengths.map((metric: keyof CognitiveMetrics) => ({
            metric: metricDisplayNames[metric],
            score: latestMetrics[metric] || 50,
            description: `${metricDisplayNames[metric]} 능력이 뛰어납니다!`,
          })),
          weaknesses: data.weaknesses.map((metric: keyof CognitiveMetrics) => ({
            metric: metricDisplayNames[metric],
            score: latestMetrics[metric] || 50,
            description: `${metricDisplayNames[metric]} 향상을 위해 더 연습해보세요.`,
          })),
        });
      } else {
        setStrengthsWeaknesses(null);
      }
      
      // 전체 점수 설정 (API에서 직접 제공하는 값 사용)
      const finalScore = data.overallScore || 50;
      setOverallScore(finalScore);
      
      // 성장 단계 설정 (계산된 점수 기반)
      if (finalScore >= 80) setGrowthStage('전문가');
      else if (finalScore >= 70) setGrowthStage('숙련자');
      else if (finalScore >= 60) setGrowthStage('중급자');
      else setGrowthStage('초보자');
      
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

  // 집계(생각 패턴) 로딩
  const fetchAggregate = async () => {
    try {
      const days = 30; // 기본 30일
      const res = await apiClient.get(`/analytics/aggregate?days=${days}&prevDays=30&topK=5`);
      setAggregate(res || null);
      if (res && typeof res === 'object') {
        const { weekdayHourHeatmap, fastestRhythmTop, topKeywords7d, streakDays } = res as any;
        if (weekdayHourHeatmap && fastestRhythmTop && topKeywords7d) {
          setV2({ weekdayHourHeatmap, fastestRhythmTop, topKeywords7d, streakDays });
        } else {
          setV2(null);
        }
      }
    } catch (e) {
      // 집계는 부가 정보이므로 에러시 무시하고 넘어갑니다
      console.warn('aggregate fetch failed', e);
      setAggregate(null);
      setV2(null);
    }
  };

  // 컴포넌트 마운트 시 및 timeRange 변경 시 데이터 로드
  useEffect(() => {
    fetchData(timeRange);
    fetchAggregate();
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
      <h1 className="text-3xl font-bold mb-6 text-gray-100">메모 패턴 분석</h1>
      
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
      {/* Three-card impact view (v2) */}
      {v2 && (
        <div className="grid grid-cols-1 gap-6 mb-10">
          {/* Card A: 생산선 현황 */}
          <Card>
            <CardHeader>
              <CardTitle>생산성 현황</CardTitle>
              <CardDescription>요일×시간대별 메모생성·생각추가·기억강화·지식연결</CardDescription>
            </CardHeader>
            <CardContent>
              <WeekHourHeatmap
                data={v2.weekdayHourHeatmap}
                streakDays={v2.streakDays}
                onSlotClick={(w,h) => {
                  const params = new URLSearchParams();
                  params.set('openSimilarPanel','1');
                  params.set('slot', `${w}-${h}`);
                  window.location.href = `/memo/new?${params.toString()}`;
                }}
              />
            </CardContent>
          </Card>

          {/* Card B: 가장 빠른 리듬 Top3 */}
          <Card>
            <CardHeader>
              <CardTitle>가장 빠른 리듬 Top3</CardTitle>
              <CardDescription>기존 콘텐츠에 추가가 가장 빨랐던 시간대</CardDescription>
            </CardHeader>
            <CardContent>
              <FastRhythmTop
                items={v2.fastestRhythmTop}
                onSchedule={(w,h) => {
                  alert(`${['일','월','화','수','목','금','토'][w]} ${h}시에 알림 일정을 추가해보세요.`);
                }}
                onWriteNow={(w,h) => {
                  const params = new URLSearchParams();
                  params.set('openSimilarPanel','1');
                  params.set('slot', `${w}-${h}`);
                  window.location.href = `/memo/new?${params.toString()}`;
                }}
              />
            </CardContent>
          </Card>

          {/* Card C: 최근 7일 관심사 */}
          <Card>
            <CardHeader>
              <CardTitle>최근 7일 관심사</CardTitle>
              <CardDescription>가장 많이 등장한 키워드</CardDescription>
            </CardHeader>
            <CardContent>
              <KeywordChips
                items={v2.topKeywords7d}
                onClick={(term) => {
                  const params = new URLSearchParams();
                  params.set('openSimilarPanel','1');
                  params.set('seed', term);
                  window.location.href = `/memo/new?${params.toString()}`;
                }}
              />
            </CardContent>
          </Card>
        </div>
      )}
      
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
          {/* 종합 점수와 강점/약점을 최상단에 다시 배치 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {overallScore && (
              <OverallScoreCard 
                score={overallScore}
              />
            )}
            {strengthsWeaknesses && (
            <StrengthsWeaknessesDisplay 
                strengths={strengthsWeaknesses.strengths} 
                weaknesses={strengthsWeaknesses.weaknesses}
            />
            )}
          </div>
          
          {/* (제거됨) ReflectionJournal & PersonalizedSuggestions */}

          {timeSeriesData && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>성장 추이</CardTitle>
                <CardDescription>
                  관심 있는 분야를 선택하여 성장 과정을 확인해보세요.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="memory" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                    <TabsTrigger value="memory">기억과 학습</TabsTrigger>
                    <TabsTrigger value="attention">주의와 집중</TabsTrigger>
                    <TabsTrigger value="processing">정보 처리</TabsTrigger>
                    <TabsTrigger value="executive">실행 기능</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="memory" className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <TimeSeriesChartCard
                        title="기억판"
                        description="한 번에 여러 생각을 다루는 힘의 변화입니다."
                        data={timeSeriesData.workingMemory}
                        metricLabel="기억판"
                      />
                      <TimeSeriesChartCard
                        title="장기 기억"
                        description="오늘의 배움이 얼마나 오래 지속되는가입니다."
                        data={timeSeriesData.hippocampusActivation}
                        metricLabel="장기 기억"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="attention" className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TimeSeriesChartCard 
                        title="몰입"
                        description="주변의 방해로부터 당신을 지키는 힘의 변화입니다."
                        data={timeSeriesData.attention}
                        metricLabel="몰입"
            />
            <TimeSeriesChartCard 
                        title="길찾기감각"
                        description="머릿속에 지도를 그리는 힘의 변화입니다."
                        data={timeSeriesData.visuospatialPrecision}
                        metricLabel="길찾기감각"
            />
          </div>
                  </TabsContent>
          
                  <TabsContent value="processing" className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TimeSeriesChartCard 
                        title="눈치"
                        description="상황의 핵심을 빠르게 파악하는 힘의 변화입니다."
                        data={timeSeriesData.processingSpeed}
                        metricLabel="눈치"
            />
            <TimeSeriesChartCard 
                        title="규칙찾기"
                        description="복잡함 속에서 질서를 발견하는 힘의 변화입니다."
                        data={timeSeriesData.patternRecognition}
                        metricLabel="규칙찾기"
            />
          </div>
                  </TabsContent>

                  <TabsContent value="executive" className="pt-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <TimeSeriesChartCard
                        title="틀깨기"
                        description="익숙함에서 벗어나 새로움을 보는 힘의 변화입니다."
                        data={timeSeriesData.cognitiveFlexibility}
                        metricLabel="틀깨기"
                      />
                      <TimeSeriesChartCard
                        title="끈기"
                        description="'시작'을 '완성'으로 만드는 힘의 변화입니다."
                        data={timeSeriesData.executiveFunction}
                        metricLabel="끈기"
            />
          </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
          {/* 생각 패턴 요약 (삭제됨) */}
        </>
      )}

      <div className="text-center py-8 text-gray-500 text-sm">
        <p>이 데이터는 {timeRange === '1m' ? '최근 1개월' : timeRange === '3m' ? '최근 3개월' : timeRange === '6m' ? '최근 6개월' : '전체 기간'}의 활동을 기반으로 분석되었습니다.</p>
        <p className="mt-1">
          이 분석은 정보 제공 목적으로만 사용되며, 의학적 진단을 대체하지 않습니다. 
          더 많은 활동을 수행할수록 점점 더 정확해져요.
        </p>
      </div>
    </div>
  );
} 