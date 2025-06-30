'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import Button from '@/components/common/Button';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, RadialLinearScale } from 'chart.js';
import { Doughnut, Line as RJSLine, Radar } from 'react-chartjs-2';
import { zengo as zengoApi } from '@/lib/api';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import CognitiveProfileContainer from '@/components/cognitive/CognitiveProfileContainer';
import { FiHelpCircle, FiBook, FiTrendingUp, FiTarget, FiZap, FiAward } from 'react-icons/fi';
import { BookOpenIcon } from '@heroicons/react/24/outline';
import AppLogo from '@/components/common/AppLogo';
import NotificationBell from '@/components/common/NotificationBell';
import { loginSuccess } from '@/store/slices/userSlice';
import { apiClient } from '@/lib/apiClient';
import { books as booksApi, user as userApi /*, zengo as zengoApi */ } from '@/lib/api';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line } from 'recharts'; // Commented out
import api from '@/lib/api';
import { ChevronDownIcon } from '@heroicons/react/24/solid';

// Cyber Theme Definition (Updated to match brand guidelines)
const habitus33Theme = {
  primary: 'text-cyan-400',
  secondary: 'text-purple-400', 
  bgPrimary: 'bg-gray-900',
  bgSecondary: 'bg-gray-800',
  cardBg: 'bg-gray-800/90',
  borderPrimary: 'border-cyan-500/20',
  borderSecondary: 'border-purple-500/20',
  gradient: 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900',
  textMuted: 'text-gray-400',
  textLight: 'text-cyan-300',
  inputBg: 'bg-gray-700',
  inputBorder: 'border-gray-600',
  inputFocusBorder: 'focus:border-cyan-400',
  inputFocusRing: 'focus:ring-cyan-400/20',
  progressBarBg: 'bg-gray-700',
  progressFg: 'bg-gradient-to-r from-cyan-500 to-purple-500',
  buttonPrimaryBg: 'bg-cyan-600',
  buttonPrimaryHoverBg: 'hover:bg-cyan-700',
  buttonSecondaryBg: 'bg-gray-700',
  buttonSecondaryHoverBg: 'hover:bg-gray-600',
  buttonOutlineBorder: 'border-cyan-400',
  buttonOutlineText: 'text-cyan-400',
  buttonOutlineHoverBg: 'hover:bg-cyan-400/10',
  buttonDisabledBg: 'bg-gray-600',
  errorText: 'text-red-400',
  errorBorder: 'border-red-400/20',
  menuBg: 'bg-gray-800',
  menuItemHover: 'hover:bg-gray-700',
  tooltipBg: 'bg-gray-700',
  tooltipText: 'text-cyan-300',
};

// Chart.js 등록
ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, RadialLinearScale, Title, Tooltip, Legend);

// 타입 정의
type Book = {
  _id: string;
  title: string;
  author: string;
  coverImage?: string;
  totalPages: number;
  currentPage: number;
  genre: string;
  status: 'reading' | 'completed';
  estimatedRemainingMinutes?: number | null; // optional, can be null
  avgPpm?: number | null;
};

// 사용하지 않는 ReadingSession 타입 제거 가능
// type ReadingSession = { ... };

// *** 사용하지 않는 ReadingStats 타입 제거 ***
// type ReadingStats = { ... };

// --- 새로 정의할 사용자 통계 타입 ---
interface UserDashboardStats {
  recentPpm: number | null;
  todayTsCount: number;
  totalTsCount: number;
  todayZengoScore: number;
  totalZengoScore: number;
  totalBooks: number;
}

// 젠고 통계 타입 정의
type ZengoStats = {
  totalActivities: number;
  averageScores: {
    overall: number;
    memory: number;
    attention: number;
    reasoning: number;
    creativity: number;
  };
  moduleAverages?: Record<string, { total: number; count: number; average: number }>;
  recentScores?: Array<{
    date: Date;
    moduleId: string;
    scores: {
      attention: number;
      memory: number;
      reasoning: number;
      creativity: number;
    }
  }>;
  progress?: {
    last7Days: Array<{
      date: Date;
      moduleId: string;
      overallScore: number;
    }>;
    last30Days: Array<{
      date: Date;
      moduleId: string;
      overallScore: number;
    }>;
  };
  skillScores?: {
    memory: number;
    language: number;
    logic: number;
    accuracy: number;
    reactionTime: number;
  };
};

// Routine API 응답 타입 정의
type RoutineData = {
  currentDay: number;
  totalDays: number;
  consecutiveStreak: number;
  todayTask: string;
  todayTsExecuted: boolean;
  todayZengoCompleted: boolean;
};

export default function DashboardPage() {
  const router = useRouter();
  const t = useTranslations('dashboard');
  const user = useSelector((state: RootState) => state.user);
  const [currentBooks, setCurrentBooks] = useState<Book[]>([]);
  const [stats, setStats] = useState<UserDashboardStats | null>(null);
  const [zengoStats, setZengoStats] = useState<ZengoStats | null>(null);
  const [routineData, setRoutineData] = useState<RoutineData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [profileMenuOpen, setProfileMenuOpen] = useState<boolean>(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showZengoCard, setShowZengoCard] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const [isRoutineTrackerExpanded, setIsRoutineTrackerExpanded] = useState(false);

  // 기존 useEffect 내부 fetchDashboardData를 바깥으로 분리하고 useCallback으로 최적화
  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      // 현재 읽고 있는 책 목록 조회
      const booksData = await apiClient.get('/books?status=reading');

      let readingBooks: Book[] = [];
      if (booksData && Array.isArray(booksData.books)) {
          readingBooks = booksData.books.slice(0, 3);
      } else if (booksData && Array.isArray(booksData)) {
          readingBooks = booksData.slice(0, 3);
      } else {
          console.error('API 응답 books 배열 없음 또는 booksData가 없음:', booksData);
      }
      setCurrentBooks(readingBooks);

      // 사용자 통계 조회
      const statsData: UserDashboardStats = await apiClient.get('/users/me/stats');
      setStats(statsData);
      
      // 루틴 정보 조회
      const routinePromise = api.get('/routines/current');

      // Promise.all로 병렬 처리
      const [profileRes, routineRes] = await Promise.all([
        userApi.getProfile(),
        routinePromise,
      ]);

      setRoutineData(routineRes.data);
      if (routineRes.data) {
        console.log('Routine data fetched:', routineRes.data);
      }

      // Fetch zengo stats
      try {
        const zengoData = await apiClient.get('/zengo/stats');
        setZengoStats(zengoData);
      } catch (zengoError) {
        console.error('Error fetching Zengo stats:', zengoError);
        setZengoStats({
          totalActivities: 8,
          averageScores: {
            overall: 78,
            memory: 72,
            attention: 85,
            reasoning: 68,
            creativity: 75
          }
        });
        console.warn('Zengo 통계 데이터를 불러오지 못해 기본 통계가 표시됩니다.');
      }

      // 안전한 유저 데이터 확인
      if (!user?.nickname) {
        console.log("사용자 데이터가 없거나 불완전함. 기본값 사용");
      }
      
      // 인지 능력 프로필은 별도 컴포넌트에서 처리

      setIsLoading(false);
    } catch (e) {
      console.error('Dashboard data loading failed:', e);
      setError(t('common.error'));
      setIsLoading(false);
      setRoutineData(null); // Ensure routine data is null on general error
    }
  }, [router, dispatch, t]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData, user]);

  // 페이지가 다시 활성화될 때 데이터를 새로고침하는 로직 추가
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchDashboardData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchDashboardData]);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const profile = await userApi.getProfile();
        dispatch(loginSuccess({
          id: profile.id,
          email: profile.email,
          nickname: profile.nickname,
          token: localStorage.getItem('token') || '',
          profileImage: profile.profileImage || '',
          trialEndsAt: profile.trialEndsAt || '',
          inviteCode: profile.inviteCode || '',
        }));
      } catch (e) {
        // 에러 처리 (예: 로그아웃)
      }
    }
    fetchProfile();
  }, [dispatch]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 책 상태 도넛 차트 데이터 - 더 이상 사용하지 않음

  // 주간 독서 시간 차트 데이터 (데이터 구조 변경으로 잠시 주석 처리 또는 제거 필요)
  // const weeklyChartData = {
  //   labels: stats?.weeklyReadingSessions?.map(session => session.day) || [],
  //   datasets: [
  //     {
  //       label: '주간 독서 시간 (분)',
  //       data: stats?.weeklyReadingSessions?.map(session => session.minutes) || [],
  //       borderColor: 'rgb(79, 70, 229)',
  //       backgroundColor: 'rgba(79, 70, 229, 0.5)',
  //     },
  //   ],
  // };

  // 독서 성과 개선 차트 (데이터 구조 변경으로 잠시 주석 처리 또는 제거 필요)
  // const improvementChartData = {
  //   labels: ['읽기 속도 (%)', '이해력 (%)'],
  //   datasets: [
  //     {
  //       label: '독서 성과 개선율',
  //       data: [
  //         stats?.readingImprovements?.speed || 0,
  //         stats?.readingImprovements?.comprehension || 0,
  //       ],
  //       backgroundColor: [
  //         'rgba(139, 92, 246, 0.6)',
  //         'rgba(29, 78, 216, 0.6)',
  //       ],
  //       borderColor: [
  //         'rgba(139, 92, 246, 1)',
  //         'rgba(29, 78, 216, 1)',
  //       ],
  //       borderWidth: 1,
  //     },
  //   ],
  // };

  // 독서 목표 달성률
  // const goalCompletionRate = stats?.totalReadingTime && stats?.dailyReadingGoal 
  //   ? Math.min(((stats.totalReadingTime / 7) / stats.dailyReadingGoal) * 100, 100) 
  //   : 0;

  // 젠고 기술 점수 데이터
  // ... existing code ...

  const handleLogout = () => {
    // 모든 가능한 토큰 키 제거
    localStorage.removeItem('token');
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('auth_token');
    
    // 쿠키도 제거 (필요한 경우)
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    // 페이지 완전 새로고침으로 상태 초기화 후 리디렉션
    window.location.href = '/auth/login';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  const formatReadingTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}시간 ${mins}분`;
  };

  // 안전한 Zengo 데이터 제공 (skillScores 구조가 코드 어딘가에서 사용되는 경우 대비)
  if (zengoStats && !zengoStats.skillScores) {
    // @ts-ignore - 런타임 오류 방지를 위한 임시 코드
    zengoStats.skillScores = {
      memory: zengoStats.averageScores?.memory || 0,
      language: zengoStats.averageScores?.reasoning || 0,
      logic: zengoStats.averageScores?.creativity || 0,
      accuracy: zengoStats.averageScores?.attention || 0,
      reactionTime: zengoStats.averageScores?.overall || 0,
    };
  }

  // 예상 시간 포맷팅 함수 (이전 답변 내용 재사용 또는 개선)
  const formatEstimatedTime = (minutes: number | null | undefined): string => {
    if (minutes === null || minutes === undefined || minutes <= 0) return ""; 

    const totalMinutes = Math.round(minutes);
    const days = Math.floor(totalMinutes / (60 * 24));
    const remainingHours = Math.floor((totalMinutes % (60 * 24)) / 60);
    const remainingMinutes = totalMinutes % 60;

    let result = "";
    if (days > 0) result += t('currently_reading.eta_message_days_hours', {days: days, hours: remainingHours});
    else if (remainingHours > 0) result += t('currently_reading.eta_message_hours', {hours: remainingHours});
    else if (remainingMinutes > 0) result += t('currently_reading.eta_message_minutes', {minutes: remainingMinutes});
    
    if (result === "") { // 매우 짧은 시간 처리
      if (totalMinutes < 1) return t('currently_reading.eta_message_short');
      if (totalMinutes < 60) return t('currently_reading.eta_message_minutes', {minutes: totalMinutes});
      return t('currently_reading.eta_message_hours', {hours: Math.floor(totalMinutes / 60)});
    } 

    return result.trim();
  };

  // Helper function to get dynamic motivation message based on current day
  const getMilestoneMessage = (currentDay: number | undefined): string => {
    if (currentDay === undefined || currentDay === null) {
      return t('routine.journey_start');
    }
    if (currentDay >= 33) return t('routine.milestone_33');
    if (currentDay >= 28) return t('routine.milestone_28'); 
    if (currentDay >= 21) return t('routine.milestone_21');
    if (currentDay >= 14) return t('routine.milestone_14');
    if (currentDay >= 7) return t('routine.milestone_7');
    return t('routine.milestone_start');
  };

  // 총 TS 시간 포맷 함수 (초 -> 시간 분)
  const formatTsTime = (seconds: number | null | undefined): string => {
    // 입력값 유효성 검사 추가
    if (typeof seconds !== 'number' || isNaN(seconds) || seconds < 0) {
      return '0분'; // 유효하지 않은 경우 0분 또는 '-' 표시
    }
    if (seconds === 0) return '0분'; // 0초일 경우 0분 표시
    if (seconds < 60) return `${seconds}초`; // 60초 미만은 초 단위 표시

    const totalMinutes = Math.floor(seconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours === 0) return `${minutes}분`;
    return `${hours}시간 ${minutes}분`;
  };

  const fetchRoutines = async () => {
    if (isLoading) return; // Prevent multiple fetches
    setIsLoading(true);
    try {
      const res = await api.get('/routines'); // Authorization is handled by interceptor
      const data = res.data; // For axios, data is in res.data
      setRoutineData(data);
    } catch (error) {
      console.error('Error fetching routine data:', error);
      setRoutineData(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${habitus33Theme.gradient}`}> {/* Applied cyber theme gradient */}
      {/* 고정 헤더 - 사이버 테마 적용 */}
      <header className={`sticky top-0 z-10 glass-header py-4 px-4 animate-fadeIn ${habitus33Theme.bgSecondary} border-b ${habitus33Theme.borderPrimary}`}>
        <div className="container mx-auto max-w-6xl flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center space-x-3 group">
            <AppLogo className="w-11 h-11 group-hover:opacity-90 transition-opacity" />
            <div>
              <h1 className={`font-medium text-xl sm:text-2xl tracking-tight ${habitus33Theme.primary} group-hover:text-cyan-300 transition-colors duration-500`}> 
                {t('header.title')}
              </h1>
              <p className={`text-xs font-medium tracking-wider ${habitus33Theme.textLight}`}> 
                {t('header.subtitle')}
              </p>
            </div>
          </Link>
          
          {/* 알림 및 사용자 프로필 */}
          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="flex items-center">
              <div className="mr-3 text-right">
                <p className={`font-medium ${habitus33Theme.primary}`}> 
                  {user?.nickname || '사용자'}
                </p>
              </div>
              <div className="relative">
                <div 
                  className={`w-11 h-11 rounded-full flex items-center justify-center cursor-pointer shadow-sm overflow-hidden border ${habitus33Theme.borderPrimary} transition-all duration-500 hover:border-cyan-400/40 hover:shadow-lg hover:shadow-cyan-400/20`}
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                >
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt={user?.nickname || '사용자'} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center"> 
                      <span className={`${habitus33Theme.primary} font-medium`}>{user?.nickname?.charAt(0) || '?'}</span>
                    </div>
                  )}
                </div>
                {profileMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileMenuOpen(false)}></div>
                    <div className={`absolute right-0 mt-2 w-48 ${habitus33Theme.menuBg} rounded-md shadow-lg py-1 z-50 transition-all duration-300 transform origin-top-right border ${habitus33Theme.inputBorder}`}> 
                      <Link href="/profile" className={`block px-4 py-2 text-sm ${habitus33Theme.textLight} ${habitus33Theme.menuItemHover} transition-colors`} onClick={() => setProfileMenuOpen(false)}>
                        {t('header.profile_settings')}
                      </Link>
                      <button onClick={() => { setProfileMenuOpen(false); handleLogout(); }} className={`block w-full text-left px-4 py-2 text-sm ${habitus33Theme.textLight} ${habitus33Theme.menuItemHover} transition-colors`}>
                        {t('header.logout')}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-6xl py-8 px-4">
        {/* AMFA Hero 섹션 - 사이버 테마 적용 */}
        <div className="mb-16 text-center animate-slideUp">
          <div className={`${habitus33Theme.cardBg} rounded-2xl p-6 sm:p-8 border ${habitus33Theme.borderPrimary} mb-8 backdrop-blur-sm relative overflow-hidden`}>
            {/* 배경 그라데이션 효과 */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 pointer-events-none" />
            <div className="relative z-10">
              <h1 className={`text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4`}>
                {t('hero.title')}
              </h1>
              <p className={`${habitus33Theme.textMuted} text-base sm:text-lg mb-6`}>
                {t('hero.subtitle')}
              </p>
              <Link href="/ts" className="inline-block">
                <button className={`${habitus33Theme.progressFg} text-white font-bold text-lg sm:text-xl px-8 sm:px-12 py-3 sm:py-4 rounded-xl shadow-lg hover:shadow-xl hover:shadow-cyan-500/25 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl`}>
                  {t('hero.action_button')}
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* 주요 액션 버튼 영역 - 공간감 개선 */}
        <div className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-8 animate-slideUp">
          {/* ZenGo Card - 사이버 테마 + 호버 효과 */}
          <Link href="/zengo" className="block group">
            <div className={`h-full p-6 rounded-xl ${habitus33Theme.cardBg} border ${habitus33Theme.borderSecondary} transition-all duration-300 hover:border-purple-400/60 hover:shadow-xl hover:shadow-purple-500/20 hover:scale-105 backdrop-blur-sm relative overflow-hidden flex flex-col justify-between`}> 
              {/* 호버 시 글로우 효과 */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-400 animate-pulse" />
                  <h2 className={`text-xl font-semibold ${habitus33Theme.secondary}`}>{t('actions.zengo_title')}</h2>
                </div>
                <p className={`${habitus33Theme.textMuted} text-sm leading-relaxed`}>{t('actions.zengo_description')}</p>
              </div>
              <div className="mt-6 relative z-10">
                <button className={`w-full bg-purple-500 hover:bg-purple-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30`}>
                  {t('actions.zengo_button')}
                </button>
              </div>
            </div>
          </Link>
          
          {/* ZenGo Myverse Card - 사이버 테마 + 호버 효과 */}
          <Link href="/myverse" className="block group">
            <div className={`relative h-full p-6 rounded-xl ${habitus33Theme.cardBg} border border-emerald-400/20 transition-all duration-300 hover:border-emerald-400/60 hover:shadow-xl hover:shadow-emerald-500/20 hover:scale-105 backdrop-blur-sm overflow-hidden flex flex-col justify-between`}>
              {/* 호버 시 글로우 효과 */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              {/* PREMIUM 뱃지 */}
              <div className="absolute top-3 right-3 z-20 pointer-events-none select-none">
                <span className="bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-500 text-white font-bold px-2 py-1 rounded-full text-[10px] shadow-md border border-white/30 tracking-widest uppercase">{t('actions.myverse_badge')}</span>
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 animate-pulse" />
                  <h2 className="text-xl font-semibold text-emerald-400">{t('actions.myverse_title')}</h2>
                </div>
                <p className={`${habitus33Theme.textMuted} text-sm leading-relaxed`}>{t('actions.myverse_description')}</p>
              </div>
              <div className="mt-6 relative z-10">
                <button className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/30">
                  {t('actions.myverse_button')}
                </button>
              </div>
            </div>
          </Link>
        </div>
        
        {error && (
          <div className={`bg-red-900/20 ${habitus33Theme.errorText} p-4 rounded-lg mb-6 border ${habitus33Theme.errorBorder}`}>
            {error}
          </div>
        )}
        
        {/* 33일 루틴 트래커 - 사이버 테마 적용 */}
        {routineData ? (
          <div className={`relative p-4 sm:p-6 mb-12 rounded-2xl border ${habitus33Theme.borderPrimary} shadow-xl ${habitus33Theme.cardBg} backdrop-blur-sm overflow-hidden group hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-500`}>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 pointer-events-none" />
            
            {/* 클릭 가능한 헤더 */}
            <div 
              className="flex justify-between items-center relative z-10 cursor-pointer md:cursor-default" 
              onClick={() => {
                if (window.innerWidth < 768) {
                  setIsRoutineTrackerExpanded(prev => !prev);
                }
              }}
            >
              <h2 className={`text-lg sm:text-xl font-medium ${habitus33Theme.primary}`}>
                {t('routine.title')}
              </h2>
              <button
                className="p-1 rounded-full block md:hidden"
                aria-expanded={isRoutineTrackerExpanded}
                aria-label="루틴 상세 정보 토글"
              >
                <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isRoutineTrackerExpanded ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* 접히는 콘텐츠 */}
            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isRoutineTrackerExpanded ? 'max-h-[500px] pt-6' : 'max-h-0'} md:max-h-full md:block md:pt-6`}>
              <div className="flex flex-col md:relative md:flex-row md:justify-center items-center gap-4 mb-6 z-10">
                <div className="order-2 md:order-none">
                  <button
                    onClick={() => router.push('/brain-hack-routine')}
                    className={`min-w-[200px] px-8 py-3 rounded-2xl ${habitus33Theme.progressFg} text-white font-bold text-lg transition-all duration-500 ease-in-out hover:shadow-xl hover:shadow-cyan-500/25 hover:scale-[1.05] focus:shadow-xl focus:shadow-cyan-500/25 focus:scale-[1.02] outline-none transform`}
                    aria-label="AMFA 가이드"
                    type="button"
                  >
                    {t('routine.action_button')}
                  </button>
                </div>
                <div className="order-1 md:order-none md:absolute md:top-0 md:right-0">
                  <div className={`${habitus33Theme.cardBg} py-2 px-3 rounded-full flex items-center space-x-2 border ${habitus33Theme.borderPrimary} shadow-sm backdrop-blur-sm`}>
                    <p className={`text-xs font-medium ${habitus33Theme.textLight}`}>{t('routine.today_success')}</p>
                    <span className={`text-sm ${routineData?.todayTsExecuted ? 'text-cyan-400' : 'text-gray-600'}`} title={routineData?.todayTsExecuted ? t('routine.today_ts_done') : t('routine.today_ts_pending')}>🌱</span>
                    <span className={`text-sm ${routineData?.todayZengoCompleted ? 'text-purple-400' : 'text-gray-600'}`} title={routineData?.todayZengoCompleted ? t('routine.today_zengo_done') : t('routine.today_zengo_pending')}>🌿</span>
                  </div>
                </div>
              </div>

              <div className="mb-8 relative h-3 z-10">
                <div className={`absolute top-0 left-0 w-full h-full ${habitus33Theme.progressBarBg} rounded-full overflow-hidden`}></div>
                <div
                  className={`absolute top-0 left-0 h-full ${habitus33Theme.progressFg} rounded-full transition-all duration-1000 ease-in-out shadow-lg`}
                  style={{ width: `${(routineData.currentDay / 33) * 100}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/5 to-transparent rounded-full" />
                </div>
                <div className="absolute top-[-24px] right-0 flex items-center">
                  <span className={`text-xs font-medium ${habitus33Theme.textLight}`}>{t('routine.day_progress', { currentDay: routineData.currentDay })}</span>
                </div>
              </div>

              <div className="mt-8 text-center relative z-10">
                <p className={`text-lg font-medium ${habitus33Theme.primary}`}>{getMilestoneMessage(routineData?.currentDay)}</p>
                <p className={`text-sm ${habitus33Theme.textMuted} mt-2`}>
                  <span className={`font-medium ${habitus33Theme.secondary}`}>{t('routine.streak_in_progress', { streak: routineData?.consecutiveStreak || 0 })}</span>
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className={`p-8 mb-12 text-center rounded-2xl border ${habitus33Theme.borderPrimary} shadow-xl ${habitus33Theme.cardBg} backdrop-blur-sm overflow-hidden relative`}>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 pointer-events-none" />
            <div className="relative z-10">
              <p className={`${habitus33Theme.textMuted} mb-4`}>{t('routine.no_routine')}</p>
              <button
                className={`mt-2 px-6 py-3 ${habitus33Theme.buttonPrimaryBg} text-white rounded-lg font-bold ${habitus33Theme.buttonPrimaryHoverBg} transition-all duration-300 disabled:opacity-60 hover:shadow-lg hover:shadow-cyan-500/30`}
                onClick={async () => {
                  setIsLoading(true);
                  setError('');
                  try {
                    await api.post('/routines', { goal: '뇌 최적화 루틴' });
                    await fetchRoutines();
                  } catch (e) {
                    console.error('루틴 생성 실패:', e);
                    setError(t('routine.create_routine_failed'));
                  } finally {
                    setIsLoading(false);
                  }
                }}
                disabled={isLoading}
              >
                {isLoading ? t('routine.creating_routine') : t('routine.start_routine_button')}
              </button>
            </div>
          </div>
        )}
        
        {/* 통계 요약 카드 - 사이버 테마 적용 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Atomic Reading - 강조된 스타일 */}
          <div className={`relative p-6 rounded-xl shadow-xl border-2 ${habitus33Theme.borderPrimary} ${habitus33Theme.cardBg} backdrop-blur-sm overflow-hidden group hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 hover:scale-105`}>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center space-x-4">
              <div className="bg-cyan-500/20 rounded-full p-3">
                <svg xmlns="http://www.w3.org/2000/svg" className={`w-7 h-7 ${habitus33Theme.primary}`} fill="currentColor" viewBox="0 0 24 24"><path d="M12 6a1 1 0 0 1 1 1v4.586l2.293 2.293a1 1 0 0 1-1.414 1.414l-2.5-2.5A1 1 0 0 1 11 12V7a1 1 0 0 1 1-1Z"/><path fillRule="evenodd" d="M12 2.25c-5.376 0-9.75 4.374-9.75 9.75s4.374 9.75 9.75 9.75 9.75-4.374 9.75-9.75S17.376 2.25 12 2.25ZM4.75 12a7.25 7.25 0 1 1 14.5 0 7.25 7.25 0 0 1-14.5 0Z" clipRule="evenodd"/></svg>
              </div>
              <div>
                <p className={`text-sm ${habitus33Theme.primary} mb-1 font-semibold`}>{t('stats.speed')}</p>
                <p className={`text-xl font-bold ${habitus33Theme.primary}`}>
                  {stats?.recentPpm != null ? `${stats.recentPpm.toFixed(0)}` : '-'} <span className={`text-xs ${habitus33Theme.textMuted}`}>{t('stats.ppm_unit')}</span>
                </p>
              </div>
            </div>
          </div>

          {/* TS - 사이버 테마 */}
          <div className={`relative p-5 rounded-lg ${habitus33Theme.cardBg} border ${habitus33Theme.borderPrimary} backdrop-blur-sm overflow-hidden group hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 hover:scale-105`}>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center space-x-3">
              <div className="bg-cyan-500/20 rounded-full p-2">
                <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${habitus33Theme.primary}`} fill="currentColor" viewBox="0 0 24 24"><path d="M13.5 2.25a.75.75 0 0 1 .75.75v5.19l3.72.53a1.125 1.125 0 0 1 .62 1.93l-8.1 8.1h3.56a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.35.44l-7.5-9.75a.75.75 0 0 1 .53-1.19l5.25-.75V3a.75.75 0 0 1 .75-.75h2.5Z"/></svg>
              </div>
              <div>
                <p className={`text-xs ${habitus33Theme.textMuted} mb-1`}>{t('stats.ts_session')}</p>
                <p className={`text-lg font-medium ${habitus33Theme.textLight}`}>{stats?.todayTsCount != null && stats?.totalTsCount != null ? `${stats.todayTsCount}/${stats.totalTsCount}` : '-'}</p>
              </div>
            </div>
          </div>

          {/* 총 등록 도서 - 사이버 테마 */}
          <div className={`relative p-5 rounded-lg ${habitus33Theme.cardBg} border ${habitus33Theme.borderPrimary} backdrop-blur-sm overflow-hidden group hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 hover:scale-105`}>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center space-x-3">
              <div className="bg-emerald-500/20 rounded-full p-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 24 24"><path d="M2.25 6.75A2.25 2.25 0 0 1 4.5 4.5h3.379c.621 0 1.23.154 1.77.448l2.351 1.294c.333.183.737.183 1.07 0l2.351-1.294A3.75 3.75 0 0 1 16.121 4.5H19.5a2.25 2.25 0 0 1 2.25 2.25v11.25a2.25 2.25 0 0 1-2.25 2.25h-3.379a3.75 3.75 0 0 0-1.77.448l-2.351 1.294a2.25 2.25 0 0 1-2.14 0l-2.351-1.294A3.75 3.75 0 0 0 4.5 20.25H4.5A2.25 2.25 0 0 1 2.25 18V6.75Zm2.25-.75a.75.75 0 0 0-.75.75v11.25c0 .414.336.75.75.75h3.379c.621 0 1.23.154 1.77.448l2.351 1.294c.333.183.737.183 1.07 0l2.351-1.294a3.75 3.75 0 0 1 1.77-.448H19.5a.75.75 0 0 0 .75-.75V6.75a.75.75 0 0 0-.75-.75h-3.379a2.25 2.25 0 0 0-1.07.276l-2.351 1.294a3.75 3.75 0 0 1-3.5 0L5.57 6.276A2.25 2.25 0 0 0 4.5 6Z"/></svg>
              </div>
              <div>
                <p className={`text-xs ${habitus33Theme.textMuted} mb-1`}>{t('stats.total_books')}</p>
                <p className={`text-lg font-medium ${habitus33Theme.textLight}`}>{stats ? `${stats.totalBooks}${t('stats.book_unit')}` : '-'}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* 현재 읽고 있는 책 목록 및 인지 프로필 */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-12">
          {/* 왼쪽: 현재 읽고 있는 책 목록 (Lg 스크린에서 3/5 너비) */}
          <div className={`lg:col-span-3 mt-12 p-4 sm:p-6 rounded-2xl border ${habitus33Theme.borderPrimary} ${habitus33Theme.cardBg} backdrop-blur-sm shadow-xl`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-xl font-bold ${habitus33Theme.primary}`}>{t('currently_reading.title')}</h2>
              <Link href="/books">
                <Button 
                  variant="outline"
                >
                  {t('currently_reading.my_lib_button')}
                </Button>
              </Link>
            </div>
            
            <div className="relative z-10">
              {currentBooks.length === 0 ? (
                <div className="text-center py-16">
                  <p className={`${habitus33Theme.primary} mb-6 text-lg`}>{t('currently_reading.add_new_book')}</p>
                  <Button 
                    href="/books/new" 
                    variant="default"
                  >
                    {t('currently_reading.add_book_button')}
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {currentBooks.map((book) => {
                    const progress = Math.round((book.currentPage / book.totalPages) * 100);
                    const estimatedTimeString = book.estimatedRemainingMinutes 
                      ? t('currently_reading.eta', {minutes: book.estimatedRemainingMinutes})
                      : null;

                    return (
                      <Link href={`/books/${book._id}`} key={book._id} className="block">
                        <div className={`book-item flex flex-col sm:flex-row items-start p-4 rounded-lg border ${habitus33Theme.borderPrimary} hover:border-cyan-400/60 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 ${habitus33Theme.cardBg} backdrop-blur-sm group`}>
                          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                          <div className="w-full sm:w-24 h-auto aspect-[2/3] relative bg-gray-700/50 flex-shrink-0 rounded shadow-sm book-cover z-10 mb-4 sm:mb-0">
                            {book.coverImage ? (
                              <img
                                src={book.coverImage}
                                alt={book.title}
                                className="object-cover w-full h-full rounded"
                              />
                            ) : (
                              <div className={`flex items-center justify-center w-full h-full ${habitus33Theme.textMuted}`}>
                                <FiBook className="w-8 h-8" /> 
                              </div>
                            )}
                          </div>
                          <div className="w-full sm:ml-6 flex-1 min-w-0 relative z-10">
                            <h3 className={`font-bold text-lg sm:text-xl ${habitus33Theme.primary} truncate mb-2`} title={book.title}>{book.title}</h3>
                            <p className={`${habitus33Theme.textMuted} text-sm sm:text-base mb-4 truncate`} title={book.author}>{book.author}</p>
                            <div className="flex items-center mb-3">
                              <div className={`w-full h-2 ${habitus33Theme.progressBarBg} rounded-full overflow-hidden`}>
                                <div 
                                  className={`h-full ${habitus33Theme.progressFg} rounded-full`} 
                                  style={{ width: `${progress}%` }}
                                >
                                </div>
                              </div>
                              <span className={`ml-4 text-xs sm:text-sm font-medium ${habitus33Theme.primary}`}> 
                                {t('currently_reading.page_progress', {currentPage: book.currentPage, totalPages: book.totalPages, progress: progress})}
                              </span>
                            </div>
                            {book.status !== 'completed' && estimatedTimeString && (
                              <p className={`text-sm ${habitus33Theme.textLight} font-medium mt-2`}>
                                ⏱️ {estimatedTimeString}
                              </p>
                            )}
                             {book.status !== 'completed' && !book.estimatedRemainingMinutes && book.currentPage < book.totalPages && (
                               <p className={`text-xs sm:text-sm ${habitus33Theme.textMuted} mt-2`}> 
                                 {t('currently_reading.eta_prompt')}
                               </p>
                             )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 오른쪽: 인지 능력 측정 (Lg 스크린에서 2/5 너비) */}
          <div className="lg:col-span-2 mt-12">
            <CognitiveProfileContainer className="glass-card h-full" />
          </div>
        </div>
      </div>
    </div>
  );
}