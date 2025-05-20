'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/common/Button';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, RadialLinearScale } from 'chart.js';
import { Doughnut, Line as RJSLine, Radar } from 'react-chartjs-2';
import { zengo as zengoApi } from '@/lib/api';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import CognitiveProfileContainer from '@/components/cognitive/CognitiveProfileContainer';
import { FiHelpCircle, FiBook } from 'react-icons/fi';
import { BookOpenIcon } from '@heroicons/react/24/outline';
import AppLogo from '@/components/common/AppLogo';
import NotificationBell from '@/components/common/NotificationBell';
import { loginSuccess } from '@/store/slices/userSlice';
import { apiClient } from '@/lib/apiClient';
import { books as booksApi, user as userApi /*, zengo as zengoApi */ } from '@/lib/api';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line } from 'recharts'; // Commented out
import api from '@/lib/api';

// Cyber Theme Definition (Added)
const cyberTheme = {
  primary: 'text-cyan-400',
  secondary: 'text-purple-400',
  bgPrimary: 'bg-gray-900',
  bgSecondary: 'bg-gray-800',
  cardBg: 'bg-gray-800/60',
  borderPrimary: 'border-cyan-500',
  borderSecondary: 'border-purple-500',
  gradient: 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900',
  textMuted: 'text-gray-400',
  textLight: 'text-gray-300',
  inputBg: 'bg-gray-700/50',
  inputBorder: 'border-gray-600',
  inputFocusBorder: 'focus:border-cyan-500',
  inputFocusRing: 'focus:ring-cyan-500/50',
  progressBarBg: 'bg-gray-700',
  progressFg: 'bg-gradient-to-r from-cyan-500 to-purple-500',
  buttonPrimaryBg: 'bg-cyan-600',
  buttonPrimaryHoverBg: 'hover:bg-cyan-700',
  buttonSecondaryBg: 'bg-gray-700/50',
  buttonSecondaryHoverBg: 'hover:bg-gray-600/50',
  buttonOutlineBorder: 'border-cyan-500',
  buttonOutlineText: 'text-cyan-400',
  buttonOutlineHoverBg: 'hover:bg-cyan-500/10',
  buttonDisabledBg: 'bg-gray-600',
  errorText: 'text-red-400',
  errorBorder: 'border-red-500/50',
  menuBg: 'bg-gray-700',
  menuItemHover: 'hover:bg-gray-600',
  tooltipBg: 'bg-gray-700',
  tooltipText: 'text-gray-200',
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
  const user = useSelector((state: RootState) => state.user);
  const [currentBooks, setCurrentBooks] = useState<Book[]>([]);
  const [stats, setStats] = useState<UserDashboardStats | null>(null);
  const [zengoStats, setZengoStats] = useState<ZengoStats | null>(null);
  const [routineData, setRoutineData] = useState<RoutineData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [profileMenuOpen, setProfileMenuOpen] = useState<boolean>(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();

  // 기존 useEffect 내부 fetchDashboardData를 바깥으로 분리
  const fetchDashboardData = async () => {
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
      console.log('Fetched Stats Data:', statsData);
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
      setError('데이터를 불러올 수 없습니다');
      setIsLoading(false);
      setRoutineData(null); // Ensure routine data is null on general error
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [router, user]);

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
        <p>데이터 로딩 중...</p>
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

    let result = "약 ";
    if (days > 0) result += `${days}일 `;
    if (remainingHours > 0) result += `${remainingHours}시간 `;
    if (days === 0 && remainingHours < 3 && remainingMinutes > 0) result += `${remainingMinutes}분 `;
    else if (days === 0 && remainingHours === 0 && remainingMinutes > 0) result += `${remainingMinutes}분 `;
    
    if (result === "약 ") { // 매우 짧은 시간 처리
      if (totalMinutes < 1) return "잠시 후 완독 예상";
      if (totalMinutes < 60) return `약 ${totalMinutes}분 후 완독 예상`;
      return `약 ${Math.floor(totalMinutes / 60)}시간 후 완독 예상`;
    } 

    return result.trim() + " 후 완독 예상";
  };

  // Helper function to get dynamic motivation message based on current day
  const getMilestoneMessage = (currentDay: number | undefined): string => {
    if (currentDay === undefined || currentDay === null) {
      // Handle case where routine data is not loaded yet or no active routine
      return "루틴 정보를 불러오는 중..." // Or a default message like "새로운 루틴을 시작해보세요!"
    }
    if (currentDay >= 33) return "🎉 습관 형성 완료! 축하합니다!";
    if (currentDay >= 28) return "🏁 마지막 주! 거의 다 왔어요!"; // Added a message for the last week
    if (currentDay >= 21) return "🏃 3주차 도전! 꾸준함이 중요해요!";
    if (currentDay >= 14) return "💪 2주 달성! 절반을 넘어섰습니다!";
    if (currentDay >= 7) return "👍 첫 주 완료! 잘하고 있어요!";
    return "🌱 첫 주 도전 시작! 화이팅!";
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
    <div className={`min-h-screen ${cyberTheme.gradient}`}> {/* Applied theme gradient */}
      {/* 고정 헤더 - 배경색 변경 */}
      <header className={`sticky top-0 z-10 glass-header py-4 px-4 animate-fadeIn ${cyberTheme.bgSecondary}`}>
        <div className="container mx-auto max-w-6xl flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center space-x-3 group">
            <AppLogo className="w-11 h-11 group-hover:opacity-90 transition-opacity" />
            <div>
              <h1 className={`font-orbitron font-extrabold text-2xl tracking-tight text-white group-hover:text-cyan-300 transition-colors`}> 
                Habitus33
              </h1>
              <p className={`text-xs font-medium tracking-wider text-white`}> 
                Sharpen Your Mind
              </p>
            </div>
          </Link>
          
          {/* 알림 및 사용자 프로필 */}
          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="flex items-center">
              <div className="mr-3 text-right">
                <p className={`font-medium text-white`}> 
                  {user?.nickname || '사용자'}
                </p>
              </div>
              <div className="relative">
                <div 
                  className="w-11 h-11 rounded-full flex items-center justify-center cursor-pointer shadow-md overflow-hidden border-2 border-purple-500/50" 
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                >
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt={user?.nickname || '사용자'} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-cyan-600 to-purple-600 flex items-center justify-center"> 
                      <span className="text-white font-semibold">{user?.nickname?.charAt(0) || '?'}</span>
                    </div>
                  )}
                </div>
                {profileMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileMenuOpen(false)}></div>
                    <div className={`absolute right-0 mt-2 w-48 ${cyberTheme.menuBg} rounded-md shadow-lg py-1 z-50 transition-all duration-300 transform origin-top-right border ${cyberTheme.inputBorder}`}> 
                      <Link href="/profile" className={`block px-4 py-2 text-sm ${cyberTheme.textLight} ${cyberTheme.menuItemHover} transition-colors`} onClick={() => setProfileMenuOpen(false)}>
                        프로필 설정
                      </Link>
                      <button onClick={() => { setProfileMenuOpen(false); handleLogout(); }} className={`block w-full text-left px-4 py-2 text-sm ${cyberTheme.textLight} ${cyberTheme.menuItemHover} transition-colors`}>
                        로그아웃
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
        {/* 주요 액션 버튼 영역 - Applying CyberTheme styles */}
        <div className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-6 animate-slideUp">
          {/* Time Sprint Card */}
          <Link href="/ts" className="block">
            <div className={`h-full p-6 rounded-lg shadow-lg transition-all hover:shadow-xl border ${cyberTheme.cardBg} border-cyan-500/30 hover:border-cyan-500/60 flex flex-col justify-between`}> {/* Theme card styles */} 
              <div>
                <h2 className={`text-2xl md:text-3xl font-orbitron font-bold mb-3 ${cyberTheme.primary}`}>TS : Micro-Reading</h2> {/* Theme text */}
                <p className={`opacity-90 text-base md:text-lg mb-2 ${cyberTheme.textLight}`}>읽기 집중력 체크</p> {/* Revised Text & Theme */}
                <p className={`opacity-80 text-sm ${cyberTheme.textMuted}`}>잘게 쪼갠 분단위 읽기로 지루함을 극복하세요 </p> {/* Theme text */}
              </div>
              <div className="mt-6">
                 <button className={`w-full ${cyberTheme.buttonPrimaryBg} ${cyberTheme.buttonPrimaryHoverBg} text-white font-barlow font-medium py-2 px-4 rounded-lg transition-colors`}> {/* Theme button */}
                    Speed {/* Revised Text */} 
                 </button>
              </div>
              {/* Removed emoji div */}
            </div>
          </Link>
          {/* ZenGo Card */}
          <Link href="/zengo" className="block">
            <div className={`h-full p-6 rounded-lg shadow-lg transition-all hover:shadow-xl border ${cyberTheme.cardBg} border-purple-500/30 hover:border-purple-500/60 flex flex-col justify-between`}> {/* Theme card styles */} 
               <div>
                 <h2 className={`text-2xl md:text-3xl font-orbitron font-bold mb-3 ${cyberTheme.secondary}`}>ZenGo : Work Memory</h2> {/* Theme text */} 
                 <p className={`opacity-90 text-base md:text-lg mb-2 ${cyberTheme.textLight}`}>작업 기억력 체크</p> {/* Revised Text & Theme */} 
                 <p className={`opacity-80 text-sm ${cyberTheme.textMuted}`}>더 선명하고 오래가는 기억력을 달성하세요</p> {/* Theme text */} 
               </div>
               <div className="mt-6">
                 <button className={`w-full bg-purple-600 hover:bg-purple-700 text-white font-barlow font-medium py-2 px-4 rounded-lg transition-colors`}> {/* Custom purple button for variety, uses theme concepts */} 
                   Capacity {/* Revised Text */} 
                 </button>
               </div>
               {/* Removed emoji div */}
            </div>
          </Link>
          {/* Myverse Card (was: 내 서재) */}
          <Link href="/myverse" className="block">
            <div className={`relative h-full p-6 rounded-lg shadow-lg transition-all hover:shadow-xl border ${cyberTheme.cardBg} border-emerald-400/30 hover:border-emerald-400/80 flex flex-col justify-between`}> {/* Neon green cybernetic theme */}
              {/* PREMIUM 뱃지 */}
              <div className="absolute top-4 right-4 z-10 pointer-events-none select-none">
                <span className="bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-500 text-white font-bold px-2 py-0.5 rounded-full text-[10px] shadow-lg border border-white/30 tracking-widest uppercase animate-premium-wave" style={{letterSpacing:'0.08em', backgroundSize:'200% 200%', backgroundPosition:'0% 50%'}}>PREMIUM</span>
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-orbitron font-bold mb-3 text-emerald-400">ZenGo Myverse</h2>
                <p className={`opacity-90 text-base md:text-lg mb-2 ${cyberTheme.textLight}`}>입력하고 외우고 공유하세요</p>
                <p className={`opacity-80 text-sm ${cyberTheme.textMuted}`}>내가 만든 ZenGo. 이제 건망증과 작별할 시간입니다</p>
              </div>
              <div className="mt-6">
                <button className="relative w-full bg-gradient-to-r from-cyan-800 via-fuchsia-700 via-purple-800 to-emerald-700 text-white font-barlow font-semibold py-2 px-4 rounded-lg transition-colors shadow-[0_0_8px_2px_rgba(16,185,129,0.5)] animate-cyber-wave hover:brightness-110" style={{backgroundSize:'200% 200%', backgroundPosition:'0% 50%'}}>
                  <span className="relative z-10 font-barlow uppercase tracking-wider">Start</span>
                  <span className="cyber-rect-anim pointer-events-none absolute inset-0 rounded-lg"></span>
                </button>
              </div>
            </div>
          </Link>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        {/* 33일 루틴 트래커 */}
        {routineData ? (
          <div className="relative p-6 mb-10 rounded-2xl border border-slate-700/80 ring-1 ring-slate-500/30 shadow-2xl bg-gradient-to-br from-gray-950 via-slate-900 to-gray-800 overflow-hidden">
            {/* metallic noise/texture SVG 배경 */}
            <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" viewBox="0 0 400 120" fill="none">
              <filter id="metallicNoise"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" result="turb"/><feColorMatrix type="saturate" values="0.2"/><feComponentTransfer><feFuncA type="linear" slope="0.2"/></feComponentTransfer></filter>
              <rect width="400" height="120" fill="#fff" filter="url(#metallicNoise)"/>
            </svg>
            <div className="flex justify-between items-center mb-4 relative z-10">
              <div className="flex flex-row items-center w-full">
                <div className="flex-1 flex justify-start">
                  <h2 className="text-xl font-orbitron font-bold text-cyan-300 drop-shadow-sm">
                    매일 11분씩 3회, 33일 후 놀라운 성장
                  </h2>
                </div>
                <div className="flex-1 flex justify-center">
                  <button
                    onClick={() => router.push('/brain-hack-routine')}
                    className="min-w-[200px] px-8 py-3 rounded-xl border-2 border-slate-400 bg-white text-gray-900 font-bold text-lg transition-all duration-400 ease-[cubic-bezier(.4,0,.2,1)] hover:bg-gradient-to-r hover:from-cyan-400 hover:via-fuchsia-600 hover:to-purple-800 hover:text-white hover:border-cyan-500 hover:shadow-2xl hover:scale-105 focus:bg-gradient-to-r focus:from-cyan-500 focus:via-fuchsia-700 focus:to-purple-900 focus:text-white focus:border-cyan-600 focus:shadow-2xl focus:scale-105 active:bg-purple-900 active:text-white active:scale-100 outline-none"
                    aria-label="Find Your Routine"
                    type="button"
                  >
                    Sharpen Your Brain
                  </button>
                </div>
                <div className="flex-1 flex justify-end">
                  <div className="bg-gradient-to-r from-slate-700 via-gray-800 to-slate-900 py-1 px-4 rounded-full flex items-center space-x-2 border border-slate-600 shadow-md">
                    <p className="text-xs font-semibold text-slate-200"> 
                      Day {routineData.currentDay} / 33
                    </p>
                    <span 
                      className={`text-sm ${routineData?.todayTsExecuted ? 'text-cyan-300' : 'text-slate-500'}`}
                      title={routineData?.todayTsExecuted ? "오늘 TS 실행 완료!" : "오늘 TS 실행 미완료"}
                    >
                      ⚡
                    </span>
                    <span 
                      className={`text-sm ${routineData?.todayZengoCompleted ? 'text-emerald-300' : 'text-slate-500'}`}
                      title={routineData?.todayZengoCompleted ? "오늘 ZenGo 완료!" : "오늘 ZenGo 미완료"}
                    >
                      🧠
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mb-6 relative h-2 z-10">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-slate-700 via-gray-800 to-slate-900 rounded-full overflow-hidden"></div>
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-400 via-slate-200 to-cyan-300 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(routineData.currentDay / 33) * 100}%` }}
              >
                {/* reflection overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-transparent rounded-full mix-blend-screen" />
              </div>
              <div className="absolute top-[-20px] right-0 flex items-center">
                <span className="text-xs font-medium text-slate-200"> 
                  {Math.round((routineData.currentDay / 33) * 100)}%
                </span>
              </div>
            </div>
            <div className="mt-6 text-center relative z-10">
              <p className="text-lg font-semibold text-emerald-300"> 
                {getMilestoneMessage(routineData?.currentDay)}
              </p>
              <p className="text-sm text-slate-200 mt-2">
                <span className="font-medium text-cyan-300">{routineData?.consecutiveStreak || 0}일</span> 연속 도전 중 🔥 - 
                습관 형성까지 <span className="font-medium text-cyan-300">{33 - (routineData?.currentDay || 0)}일</span> 남았습니다
              </p>
            </div>
          </div>
        ) : (
          <div className="p-6 mb-10 text-center rounded-2xl border border-slate-700/80 ring-1 ring-slate-500/30 shadow-2xl bg-gradient-to-br from-gray-950 via-slate-900 to-gray-800 overflow-hidden relative">
            <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" viewBox="0 0 400 120" fill="none">
              <filter id="metallicNoise2"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" result="turb"/><feColorMatrix type="saturate" values="0.2"/><feComponentTransfer><feFuncA type="linear" slope="0.2"/></feComponentTransfer></filter>
              <rect width="400" height="120" fill="#fff" filter="url(#metallicNoise2)"/>
            </svg>
            <p className="text-slate-400 mb-4">진행 중인 33일 루틴이 없습니다.</p>
            <button
              className="mt-2 px-6 py-2 bg-cyan-600 text-white rounded-lg font-bold hover:bg-cyan-700 transition disabled:opacity-60"
              onClick={async () => {
                setIsLoading(true);
                setError('');
                try {
                  await api.post('/routines', { goal: '뇌 최적화 루틴' });
                  await fetchRoutines();
                } catch (e) {
                  setError('루틴 생성에 실패했습니다');
                } finally {
                  setIsLoading(false);
                }
              }}
              disabled={isLoading}
            >
              {isLoading ? '루틴 생성 중...' : '루틴 시작'}
            </button>
          </div>
        )}
        
        {/* 통계 요약 카드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
          {/* 정보 처리 속도 */}
          <div className="relative p-6 rounded-xl shadow-md border border-gray-700 bg-gradient-to-br from-gray-900/80 via-blue-900/60 to-gray-800/80 backdrop-blur-md overflow-hidden">
            {/* 사이버 패턴 SVG 배경 - 파랑 계열 */}
            <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" viewBox="0 0 200 60" fill="none">
              <rect x="0" y="0" width="200" height="60" fill="url(#cyberPattern1)" />
              <defs>
                <linearGradient id="cyberPattern1" x1="0" y1="0" x2="200" y2="60" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#0ea5e9" />
                  <stop offset="1" stopColor="#6366f1" />
                </linearGradient>
              </defs>
              <line x1="10" y1="10" x2="190" y2="10" stroke="#38bdf8" strokeWidth="1" />
              <circle cx="50" cy="30" r="8" stroke="#818cf8" strokeWidth="1" fill="none" />
            </svg>
            <div className="relative flex items-center space-x-4">
              <div className="bg-white/70 rounded-full p-3">
                {/* Heroicons solid ClockIcon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 6a1 1 0 0 1 1 1v4.586l2.293 2.293a1 1 0 0 1-1.414 1.414l-2.5-2.5A1 1 0 0 1 11 12V7a1 1 0 0 1 1-1Z"/><path fillRule="evenodd" d="M12 2.25c-5.376 0-9.75 4.374-9.75 9.75s4.374 9.75 9.75 9.75 9.75-4.374 9.75-9.75S17.376 2.25 12 2.25ZM4.75 12a7.25 7.25 0 1 1 14.5 0 7.25 7.25 0 0 1-14.5 0Z" clipRule="evenodd"/></svg>
              </div>
              <div>
                <p className="text-sm text-gray-200 mb-1">나의 읽기 집중력</p>
                <p className="text-xl font-bold text-blue-400">
                  {stats?.recentPpm != null ? `${stats.recentPpm.toFixed(2)} PPM` : '-'}
                </p>
              </div>
            </div>
          </div>

          {/* TS */}
          <div className="relative p-6 rounded-xl shadow-md border border-gray-700 bg-gradient-to-br from-gray-900/80 via-indigo-900/60 to-gray-800/80 backdrop-blur-md overflow-hidden">
            {/* 사이버 패턴 SVG 배경 - 인디고 계열 */}
            <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" viewBox="0 0 200 60" fill="none">
              <rect x="0" y="0" width="200" height="60" fill="url(#cyberPattern2)" />
              <defs>
                <linearGradient id="cyberPattern2" x1="0" y1="0" x2="200" y2="60" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6366f1" />
                  <stop offset="1" stopColor="#0ea5e9" />
                </linearGradient>
              </defs>
              <rect x="30" y="20" width="40" height="10" stroke="#6366f1" strokeWidth="1" fill="none" />
              <line x1="60" y1="40" x2="160" y2="40" stroke="#818cf8" strokeWidth="1" />
            </svg>
            <div className="relative flex items-center space-x-4">
              <div className="bg-white/70 rounded-full p-3">
                {/* Heroicons solid BoltIcon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-indigo-500" fill="currentColor" viewBox="0 0 24 24"><path d="M13.5 2.25a.75.75 0 0 1 .75.75v5.19l3.72.53a1.125 1.125 0 0 1 .62 1.93l-8.1 8.1h3.56a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.35.44l-7.5-9.75a.75.75 0 0 1 .53-1.19l5.25-.75V3a.75.75 0 0 1 .75-.75h2.5Z"/></svg>
              </div>
              <div>
                <p className="text-sm text-gray-200 mb-1">TS</p>
                <p className="text-xl font-bold text-indigo-400">{stats ? `${stats.todayTsCount}/${stats.totalTsCount}` : '-'}</p>
              </div>
            </div>
          </div>

          {/* ZenGo */}
          <div className="relative p-6 rounded-xl shadow-md border border-gray-700 bg-gradient-to-br from-gray-900/80 via-green-900/60 to-gray-800/80 backdrop-blur-md overflow-hidden">
            {/* 사이버 패턴 SVG 배경 - 그린 계열 */}
            <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" viewBox="0 0 200 60" fill="none">
              <rect x="0" y="0" width="200" height="60" fill="url(#cyberPattern3)" />
              <defs>
                <linearGradient id="cyberPattern3" x1="0" y1="0" x2="200" y2="60" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#22c55e" />
                  <stop offset="1" stopColor="#0ea5e9" />
                </linearGradient>
              </defs>
              <circle cx="100" cy="30" r="18" stroke="#22c55e" strokeWidth="1" fill="none" />
              <rect x="140" y="10" width="30" height="8" stroke="#0ea5e9" strokeWidth="1" fill="none" />
            </svg>
            <div className="relative flex items-center space-x-4">
              <div className="bg-white/70 rounded-full p-3">
                {/* Heroicons solid FaceSmileIcon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2.25c-5.376 0-9.75 4.374-9.75 9.75s4.374 9.75 9.75 9.75 9.75-4.374 9.75-9.75S17.376 2.25 12 2.25ZM4.75 12a7.25 7.25 0 1 1 14.5 0 7.25 7.25 0 0 1-14.5 0Zm4.28 2.53a.75.75 0 0 1 1.06.22A3.25 3.25 0 0 0 12 16.25a3.25 3.25 0 0 0 1.91-1.5.75.75 0 1 1 1.28.78A4.75 4.75 0 0 1 12 17.75a4.75 4.75 0 0 1-3.19-1.47.75.75 0 0 1 .22-1.06ZM9.25 10a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-1.5 0V10.75A.75.75 0 0 1 9.25 10Zm5.5 0a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-1.5 0V10.75a.75.75 0 0 1 .75-.75Z" clipRule="evenodd"/></svg>
              </div>
              <div>
                <p className="text-sm text-gray-200 mb-1">ZenGo</p>
                <p className="text-xl font-bold text-green-400">{stats ? `${stats.todayZengoScore}/${stats.totalZengoScore}` : '-'}</p>
              </div>
            </div>
          </div>

          {/* 총 등록 도서 */}
          <div className="relative p-6 rounded-xl shadow-md border border-gray-700 bg-gradient-to-br from-gray-900/80 via-purple-900/60 to-gray-800/80 backdrop-blur-md overflow-hidden">
            {/* 사이버 패턴 SVG 배경 - 퍼플 계열 */}
            <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" viewBox="0 0 200 60" fill="none">
              <rect x="0" y="0" width="200" height="60" fill="url(#cyberPattern4)" />
              <defs>
                <linearGradient id="cyberPattern4" x1="0" y1="0" x2="200" y2="60" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#a21caf" />
                  <stop offset="1" stopColor="#818cf8" />
                </linearGradient>
              </defs>
              <rect x="60" y="20" width="30" height="15" stroke="#a21caf" strokeWidth="1" fill="none" />
              <circle cx="160" cy="30" r="10" stroke="#818cf8" strokeWidth="1" fill="none" />
            </svg>
            <div className="relative flex items-center space-x-4">
              <div className="bg-white/70 rounded-full p-3">
                {/* Heroicons solid BookOpenIcon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-purple-500" fill="currentColor" viewBox="0 0 24 24"><path d="M2.25 6.75A2.25 2.25 0 0 1 4.5 4.5h3.379c.621 0 1.23.154 1.77.448l2.351 1.294c.333.183.737.183 1.07 0l2.351-1.294A3.75 3.75 0 0 1 16.121 4.5H19.5a2.25 2.25 0 0 1 2.25 2.25v11.25a2.25 2.25 0 0 1-2.25 2.25h-3.379a3.75 3.75 0 0 0-1.77.448l-2.351 1.294a2.25 2.25 0 0 1-2.14 0l-2.351-1.294A3.75 3.75 0 0 0 4.5 20.25H4.5A2.25 2.25 0 0 1 2.25 18V6.75Zm2.25-.75a.75.75 0 0 0-.75.75v11.25c0 .414.336.75.75.75h3.379c.621 0 1.23.154 1.77.448l2.351 1.294c.333.183.737.183 1.07 0l2.351-1.294a3.75 3.75 0 0 1 1.77-.448H19.5a.75.75 0 0 0 .75-.75V6.75a.75.75 0 0 0-.75-.75h-3.379a2.25 2.25 0 0 0-1.07.276l-2.351 1.294a3.75 3.75 0 0 1-3.5 0L5.57 6.276A2.25 2.25 0 0 0 4.5 6Z"/></svg>
              </div>
              <div>
                <p className="text-sm text-gray-200 mb-1">내가 등록한 책</p>
                <p className="text-xl font-bold text-purple-400">{stats ? `${stats.totalBooks}권` : '-'}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* 재구성된 메인 콘텐츠 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-slideUp" style={{animationDelay: '200ms'}}>
          {/* 왼쪽: 현재 읽고 있는 책 */}
          <div className="glass-card p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">현재 읽고 있는 ...</h2>
              <Button 
                href="/books" 
                variant="outline"
              >
                전체 보기
              </Button>
            </div>
            
            {currentBooks.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500 mb-6">아직 읽고 있는 책이 없습니다.</p>
                <Button 
                  href="/books/new" 
                  variant="default"
                >
                  책 추가하기
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5">
                {currentBooks.map((book) => {
                  // 백엔드에서 받은 예상 시간 사용
                  const estimatedTimeString = formatEstimatedTime(book.estimatedRemainingMinutes);
                  const progress = Math.round((book.currentPage / book.totalPages) * 100);

                  return (
                    <Link href={`/books/${book._id}`} key={book._id} className="block">
                      <div className="book-item flex items-start">
                        <div className="w-20 h-auto aspect-[2/3] relative bg-gray-700/50 flex-shrink-0 rounded shadow-sm book-cover">
                          {book.coverImage ? (
                            <img
                              src={book.coverImage}
                              alt={book.title}
                              className="object-cover w-full h-full rounded"
                            />
                          ) : (
                            <div className="flex items-center justify-center w-full h-full text-gray-400">
                              <FiBook className="w-8 h-8" /> 
                            </div>
                          )}
                        </div>
                        <div className="ml-5 flex-1 min-w-0">
                          <h3 className={`font-bold text-lg text-indigo-400 truncate`} title={book.title}>{book.title}</h3>
                          <p className={`${cyberTheme.textMuted} text-sm mb-3 truncate`} title={book.author}>{book.author}</p>
                          <div className="flex items-center mb-2">
                            <div className={`w-full h-1.5 ${cyberTheme.progressBarBg} rounded-full overflow-hidden`}>
                              <div 
                                className={`h-full ${cyberTheme.progressFg} rounded-full`} 
                                style={{ width: `${progress}%` }}
                              >
                              </div>
                            </div>
                            <span className={`ml-3 text-xs font-medium ${cyberTheme.textMuted}`}> 
                              {book.currentPage}/{book.totalPages} ({progress}%)
                            </span>
                          </div>
                          {book.status !== 'completed' && estimatedTimeString && (
                            <p className={`text-xs ${cyberTheme.secondary} font-medium mt-1`}>
                              {estimatedTimeString}
                            </p>
                          )}
                           {book.status !== 'completed' && !book.estimatedRemainingMinutes && book.currentPage < book.totalPages && (
                             <p className={`text-xs ${cyberTheme.textMuted} mt-1`}> 
                               TS로 예상 완독 시간을 확인해보세요
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
          
          {/* 오른쪽: 인지 능력 측정 (기존 '내 서재 현황' 대체) */}
          <CognitiveProfileContainer className="glass-card hover:shadow-xl transition-all duration-300" />
        </div>
      </div>
      
      {/* CSS 애니메이션 스타일 - dashboard.css로 이동했으므로 전역 폰트만 유지 */}
      <style jsx global>{`
        * {
          font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
          letter-spacing: -0.02em;
        }
        @keyframes premium-wave {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-premium-wave {
          animation: premium-wave 2.5s linear infinite;
          background-size: 200% 200%;
          background-clip: padding-box;
          -webkit-background-clip: padding-box;
        }
        @keyframes cyber-wave {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-cyber-wave {
          animation: cyber-wave 2.5s linear infinite;
          background-size: 200% 200%;
          background-clip: padding-box;
          -webkit-background-clip: padding-box;
        }
        @keyframes cyber-rect-move {
          0%, 100% {
            border-top-color: #22d3ee;
            border-right-color: transparent;
            border-bottom-color: transparent;
            border-left-color: transparent;
          }
          25% {
            border-top-color: transparent;
            border-right-color: #a21caf;
            border-bottom-color: transparent;
            border-left-color: transparent;
          }
          50% {
            border-top-color: transparent;
            border-right-color: transparent;
            border-bottom-color: #059669;
            border-left-color: transparent;
          }
          75% {
            border-top-color: transparent;
            border-right-color: transparent;
            border-bottom-color: transparent;
            border-left-color: #7c3aed;
          }
        }
        .cyber-rect-anim {
          border-width: 2px;
          border-style: solid;
          border-radius: 0.5rem;
          border-color: transparent;
          animation: cyber-rect-move 2s linear infinite;
          box-shadow: 0 0 8px 2px rgba(34,211,238,0.3);
          pointer-events: none;
        }
        @keyframes cyber-glow {
          0% {
            border-image-source: linear-gradient(270deg, #22d3ee, #818cf8, #a21caf, #22d3ee);
            filter: drop-shadow(0 0 6px #22d3ee88);
          }
          50% {
            border-image-source: linear-gradient(90deg, #a21caf, #22d3ee, #818cf8, #a21caf);
            filter: drop-shadow(0 0 12px #818cf888);
          }
          100% {
            border-image-source: linear-gradient(270deg, #22d3ee, #818cf8, #a21caf, #22d3ee);
            filter: drop-shadow(0 0 6px #22d3ee88);
          }
        }
        .animate-cyber-glow {
          border-width: 2px;
          border-style: solid;
          border-radius: 9999px;
          border-image: linear-gradient(270deg, #22d3ee, #818cf8, #a21caf, #22d3ee) 1;
          animation: cyber-glow 2.5s linear infinite;
          box-shadow: 0 0 12px 2px #22d3ee44, 0 0 24px 4px #818cf844;
        }
        .three-d-btn-text {
          text-shadow: 0 2px 8px #0ff3, 0 1px 0 #2228;
        }
      `}</style>
    </div>
  );
} 