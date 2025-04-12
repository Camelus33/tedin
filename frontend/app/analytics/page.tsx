'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/common/Button';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Doughnut, Line, Bar } from 'react-chartjs-2';

// Chart.js 등록
ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

// 타입 정의
type ReadingStats = {
  // 전체 통계
  totalBooks: number;
  booksCompleted: number;
  totalPagesRead: number;
  totalReadingTime: number; // 분 단위
  averageReadingSpeed: number; // 페이지/시간
  readingStreak: number;
  
  // 시간대별 독서량
  readingByHour: {
    hour: number;
    minutes: number;
  }[];
  
  // 장르별 분포
  genreDistribution: {
    genre: string;
    count: number;
  }[];
  
  // 최근 30일 독서 시간
  dailyReading: {
    date: string;
    minutes: number;
  }[];
  
  // 월별 독서량
  monthlyReading: {
    month: string;
    pages: number;
  }[];
};

export default function AnalyticsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<ReadingStats | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/auth/login');
          return;
        }
        
        // 실제 API 호출 (백엔드 구현 시 아래 코드 사용)
        /*
        const response = await fetch(`/api/analytics?range=${timeRange}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('통계 데이터를 불러오는 데 실패했습니다.');
        }
        
        const data = await response.json();
        setStats(data.stats);
        */
        
        // 대신 목업 데이터 사용
        setStats({
          totalBooks: 18,
          booksCompleted: 12,
          totalPagesRead: 3256,
          totalReadingTime: 5430, // 분 단위 (약 90시간)
          averageReadingSpeed: 36, // 페이지/시간
          readingStreak: 14,
          
          readingByHour: [
            { hour: 0, minutes: 15 },
            { hour: 1, minutes: 5 },
            { hour: 2, minutes: 0 },
            { hour: 3, minutes: 0 },
            { hour: 4, minutes: 0 },
            { hour: 5, minutes: 0 },
            { hour: 6, minutes: 10 },
            { hour: 7, minutes: 45 },
            { hour: 8, minutes: 30 },
            { hour: 9, minutes: 20 },
            { hour: 10, minutes: 15 },
            { hour: 11, minutes: 10 },
            { hour: 12, minutes: 25 },
            { hour: 13, minutes: 20 },
            { hour: 14, minutes: 15 },
            { hour: 15, minutes: 30 },
            { hour: 16, minutes: 25 },
            { hour: 17, minutes: 35 },
            { hour: 18, minutes: 40 },
            { hour: 19, minutes: 60 },
            { hour: 20, minutes: 90 },
            { hour: 21, minutes: 120 },
            { hour: 22, minutes: 60 },
            { hour: 23, minutes: 40 },
          ],
          
          genreDistribution: [
            { genre: '소설', count: 7 },
            { genre: '인문학', count: 4 },
            { genre: '경제', count: 3 },
            { genre: '과학', count: 2 },
            { genre: '심리학', count: 2 },
          ],
          
          dailyReading: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            minutes: Math.floor(Math.random() * 60) + (i % 7 === 0 ? 0 : 15), // 일주일에 하루는 휴식일
          })),
          
          monthlyReading: [
            { month: '1월', pages: 245 },
            { month: '2월', pages: 312 },
            { month: '3월', pages: 198 },
            { month: '4월', pages: 275 },
            { month: '5월', pages: 410 },
            { month: '6월', pages: 323 },
            { month: '7월', pages: 375 },
            { month: '8월', pages: 289 },
            { month: '9월', pages: 356 },
            { month: '10월', pages: 420 },
            { month: '11월', pages: 290 },
            { month: '12월', pages: 198 },
          ],
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [timeRange, router]);
  
  // 시간 포맷팅 헬퍼
  const formatReadingTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}시간 ${mins}분`;
  };
  
  // 차트 데이터
  const genreChartData = {
    labels: stats?.genreDistribution.map(item => item.genre) || [],
    datasets: [
      {
        data: stats?.genreDistribution.map(item => item.count) || [],
        backgroundColor: [
          '#4F46E5', // indigo-600
          '#8B5CF6', // violet-500
          '#EC4899', // pink-500
          '#F59E0B', // amber-500
          '#10B981', // emerald-500
          '#06B6D4', // cyan-500
          '#6366F1', // indigo-500
        ],
        borderWidth: 1,
      },
    ],
  };
  
  const hourlyReadingData = {
    labels: stats?.readingByHour.map(item => `${item.hour}시`) || [],
    datasets: [
      {
        label: '평균 독서 시간 (분)',
        data: stats?.readingByHour.map(item => item.minutes) || [],
        backgroundColor: 'rgba(79, 70, 229, 0.7)',
        borderRadius: 4,
      },
    ],
  };
  
  const dailyReadingData = {
    labels: stats?.dailyReading.map(item => {
      const date = new Date(item.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }) || [],
    datasets: [
      {
        label: '독서 시간 (분)',
        data: stats?.dailyReading.map(item => item.minutes) || [],
        borderColor: '#4F46E5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.3,
        fill: true,
      },
    ],
  };
  
  const monthlyReadingData = {
    labels: stats?.monthlyReading.map(item => item.month) || [],
    datasets: [
      {
        label: '독서량 (페이지)',
        data: stats?.monthlyReading.map(item => item.pages) || [],
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderRadius: 4,
      },
    ],
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <p>통계 데이터 로딩 중...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-blue-50 p-4 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
          <h1 className="text-2xl font-bold mb-4">오류 발생</h1>
          <p className="text-red-600 mb-6">{error}</p>
          <Button
            href="/dashboard"
            variant="default"
          >
            대시보드로 돌아가기
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 py-8 px-4">
      <div className="container mx-auto max-w-5xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">독서 분석</h1>
          <p className="text-gray-600">내 독서 습관과 패턴을 분석해보세요</p>
        </header>
        
        {/* 필터 옵션 */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow p-4 flex space-x-4">
            <button
              onClick={() => setTimeRange('week')}
              className={`px-4 py-2 rounded-md ${
                timeRange === 'week'
                  ? 'bg-indigo-100 text-indigo-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              이번 주
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-4 py-2 rounded-md ${
                timeRange === 'month'
                  ? 'bg-indigo-100 text-indigo-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              이번 달
            </button>
            <button
              onClick={() => setTimeRange('year')}
              className={`px-4 py-2 rounded-md ${
                timeRange === 'year'
                  ? 'bg-indigo-100 text-indigo-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              올해
            </button>
          </div>
        </div>
        
        {/* 메인 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold mb-4">독서 현황</h2>
            <div className="h-48 flex justify-center items-center">
              <Doughnut
                data={genreChartData}
                options={{
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                  },
                  cutout: '65%',
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="bg-indigo-50 p-3 rounded-md text-center">
                <p className="text-2xl font-bold text-indigo-700">{stats?.totalBooks || 0}</p>
                <p className="text-xs text-gray-600">총 책</p>
              </div>
              <div className="bg-green-50 p-3 rounded-md text-center">
                <p className="text-2xl font-bold text-green-700">{stats?.booksCompleted || 0}</p>
                <p className="text-xs text-gray-600">완독</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold mb-4">독서 습관</h2>
            <div>
              <dl className="space-y-4">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">평균 독서 속도</dt>
                  <dd className="font-medium">{stats?.averageReadingSpeed || 0} 페이지/시간</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">총 독서 시간</dt>
                  <dd className="font-medium">{formatReadingTime(stats?.totalReadingTime || 0)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">총 읽은 페이지</dt>
                  <dd className="font-medium">{stats?.totalPagesRead || 0} 페이지</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">연속 독서</dt>
                  <dd className="font-medium">{stats?.readingStreak || 0}일</dd>
                </div>
              </dl>
            </div>
            <Button
              href="/dashboard"
              variant="outline"
              className="mt-6 w-full"
            >
              대시보드로 이동
            </Button>
          </div>
          
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold mb-4">시간별 독서 패턴</h2>
            <div className="h-64">
              <Bar
                data={hourlyReadingData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-4 text-center">
              저녁 8시~10시에 독서를 가장 많이 하시네요!
            </p>
          </div>
        </div>
        
        {/* 그래프 */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold mb-4">일간 독서 시간</h2>
            <div className="h-72">
              <Line
                data={dailyReadingData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: '독서 시간 (분)',
                      },
                    },
                    x: {
                      grid: {
                        display: false,
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold mb-4">월간 독서량</h2>
            <div className="h-72">
              <Bar
                data={monthlyReadingData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: '페이지',
                      },
                    },
                    x: {
                      grid: {
                        display: false,
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
        
        {/* 도전과제 및 인사이트 */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-4">독서 인사이트</h2>
          <div className="space-y-4">
            <div className="p-4 bg-indigo-50 rounded-lg">
              <h3 className="font-medium text-indigo-900 mb-2">당신의 독서 유형: 저녁 독서가</h3>
              <p className="text-sm text-gray-600">
                저녁 시간(20시~22시)에 가장 많은 독서를 하시는군요. 이 시간대는 하루를 마무리하며
                집중력이 높아지는 시간으로, 깊이 있는 독서에 적합합니다.
              </p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-900 mb-2">독서 목표 달성율</h3>
              <p className="text-sm text-gray-600">
                올해 설정한 독서 목표의 67%를 달성했습니다. 목표 달성까지 약 3,500페이지가 남았습니다.
                현재 페이스라면 12월 초에 목표를 달성할 수 있을 것으로 예상됩니다.
              </p>
            </div>
            
            <div className="p-4 bg-amber-50 rounded-lg">
              <h3 className="font-medium text-amber-900 mb-2">독서 제안</h3>
              <p className="text-sm text-gray-600">
                최근 인문학과 소설 위주로 독서하고 계시네요. 독서의 다양성을 위해 과학이나 경제 관련 
                도서를 시도해보는 것이 어떨까요? 추천 도서 목록을 확인해보세요.
              </p>
              <Button
                href="/books/recommendations"
                variant="outline"
                className="mt-2 text-sm py-1"
              >
                추천 도서 보기
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 