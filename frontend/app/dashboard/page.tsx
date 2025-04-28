'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/common/Button';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, RadialLinearScale } from 'chart.js';
import { Doughnut, Line, Radar } from 'react-chartjs-2';
import { zengo as zengoApi } from '@/lib/api';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import CognitiveProfileContainer from '@/components/cognitive/CognitiveProfileContainer';
import './styles/dashboard.css';
import { FiHelpCircle } from 'react-icons/fi';
import AppLogo from '@/components/common/AppLogo';

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
  estimatedRemainingMinutes?: number | null;
  avgPpm?: number | null;
};

type ReadingSession = {
  _id: string;
  bookId: string;
  bookTitle: string;
  date: string;
  duration: number;
  pagesRead: number;
};

type ReadingStats = {
  totalBooks: number;
  booksCompleted: number;
  totalPagesRead: number;
  totalReadingTime: number;
  readingStreak: number;
  dailyReadingGoal: number;
  weeklyReadingSessions: {
    day: string;
    minutes: number;
  }[];
  avgReadingSpeed?: number;
  readingImprovements?: {
    speed: number;
    comprehension: number;
  };
};

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

// 33일 루틴 타입 정의
type RoutineProgress = {
  currentDay: number;
  totalDays: number;
  streakDays: number;
  milestones: {
    day: number;
    achieved: boolean;
    title: string;
  }[];
};

export default function DashboardPage() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user);
  const [currentBooks, setCurrentBooks] = useState<Book[]>([]);
  const [recentSessions, setRecentSessions] = useState<ReadingSession[]>([]);
  const [stats, setStats] = useState<ReadingStats | null>(null);
  const [zengoStats, setZengoStats] = useState<ZengoStats | null>(null);
  const [routineProgress, setRoutineProgress] = useState<RoutineProgress | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [profileMenuOpen, setProfileMenuOpen] = useState<boolean>(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/auth/login');
          return;
        }

        // 현재 읽고 있는 책 목록 조회 (백엔드에서 예상 시간 포함)
        // *** 중요: 백엔드 API가 /api/books?status=reading 응답에 estimatedRemainingMinutes를 포함하도록 수정되었다고 가정 ***
        const booksResponse = await fetch('http://localhost:8000/api/books?status=reading', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!booksResponse.ok) throw new Error('책 목록 로딩 실패');
        const booksData = await booksResponse.json();
        
        let readingBooks: Book[] = [];
        if (Array.isArray(booksData.books)) { // 응답 구조가 { books: [] } 일 경우
            readingBooks = booksData.books.slice(0, 3);
        } else if (Array.isArray(booksData)) { // 응답 구조가 [] 일 경우
            readingBooks = booksData.slice(0, 3);
        } else {
            console.error('API 응답 books 배열 없음:', booksData);
        }
        setCurrentBooks(readingBooks);

        // Fetch reading stats (가상 데이터로 대체)
        setStats({
          totalBooks: 12,
          booksCompleted: 5,
          totalPagesRead: 1823,
          totalReadingTime: 3250, // 분 단위
          readingStreak: 7,
          dailyReadingGoal: 30, // 분 단위
          weeklyReadingSessions: [
            { day: '월', minutes: 35 },
            { day: '화', minutes: 40 },
            { day: '수', minutes: 25 },
            { day: '목', minutes: 45 },
            { day: '금', minutes: 10 },
            { day: '토', minutes: 60 },
            { day: '일', minutes: 30 },
          ],
          avgReadingSpeed: 35, // 페이지/시간
          readingImprovements: {
            speed: 12, // % 증가
            comprehension: 8, // % 증가
          }
        });
        
        // 33일 루틴 데이터 (가상 데이터)
        setRoutineProgress({
          currentDay: 14,
          totalDays: 33,
          streakDays: 14,
          milestones: [
            { day: 7, achieved: true, title: '첫 주 완료' },
            { day: 14, achieved: true, title: '2주 달성' },
            { day: 21, achieved: false, title: '3주 차 도전' },
            { day: 33, achieved: false, title: '습관 형성 완료' },
          ]
        });
        
        // Fetch zengo stats
        try {
          const zengoData = await zengoApi.getUserStats();
          setZengoStats(zengoData);
        } catch (zengoError) {
          console.error('Error fetching Zengo stats:', zengoError);
          // 가상 데이터로 대체
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
      }
    };

    fetchDashboardData();
  }, [router]);

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

  // 주간 독서 시간 차트 데이터
  const weeklyReadingData = {
    labels: stats?.weeklyReadingSessions.map(session => session.day) || [],
    datasets: [
      {
        label: '독서 시간 (분)',
        data: stats?.weeklyReadingSessions.map(session => session.minutes) || [],
        borderColor: '#6366F1',
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderWidth: 2,
        tension: 0.3,
        fill: true,
      },
    ],
  };

  // Zengo 인지능력 레이더 차트는 컴포넌트로 대체

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

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* dashboard.css 스타일 적용을 위한 import */}
      <style jsx global>{`@import url('/app/dashboard/styles/dashboard.css');`}</style>
      
      {/* 고정 헤더 */}
      <header className="sticky top-0 z-10 glass-header py-4 px-4 animate-fadeIn">
        <div className="container mx-auto max-w-6xl flex justify-between items-center">
          <div className="flex items-center space-x-3">
            {/* 앱 로고 - 33을 이용한 habit 상징 */}
            <AppLogo className="w-11 h-11" />
            
            {/* 앱 이름 */}
            <div>
              <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 font-extrabold text-2xl tracking-tight">
                Habitus33
              </h1>
              <p className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 text-xs font-medium tracking-wider">
                READ FAST
              </p>
            </div>
          </div>
          
          {/* 사용자 프로필 */}
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <div className="mr-3 text-right">
                <p className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                  {user?.nickname || '사용자'}
                </p>
                <p className="text-xs text-gray-500">
                  {stats?.readingStreak ? 
                    `${stats.readingStreak}일째 읽는 중` : 
                    user?.email ? user.email.split('@')[0] : '독서 습관 만들기'}
                </p>
              </div>
              <div className="relative">
                <div 
                  className="w-11 h-11 rounded-full flex items-center justify-center cursor-pointer shadow-md overflow-hidden"
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                >
                  {user?.profileImage ? (
                    <img 
                      src={user.profileImage} 
                      alt={user?.nickname || '사용자'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white font-semibold">{user?.nickname?.charAt(0) || '?'}</span>
                    </div>
                  )}
                </div>
                {profileMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setProfileMenuOpen(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 transition-all duration-300 transform origin-top-right">
                      <Link 
                        href="/profile" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 transition-colors"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        프로필 설정
                      </Link>
                      <button 
                        onClick={() => {
                          setProfileMenuOpen(false);
                          handleLogout();
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 transition-colors"
                      >
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
        {/* 주요 액션 버튼 영역 */}
        <div className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-6 animate-slideUp">
          <Link href="/ts" className="block">
            <div className="action-card action-card-primary h-full">
              <div className="action-card-overlay"></div>
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <h2 className="text-3xl font-bold mb-3">Time Sprint</h2>
                  <p className="opacity-90 text-lg mb-6">읽기 속도를 측정해 드립니다</p>
                  <p className="opacity-90 text-lg mb-6">긴 글 집중력이 유지됩니다</p>
                  <div className="mt-4 inline-block bg-white/20 rounded-full px-4 py-2 text-sm font-medium relative overflow-hidden group">
                    <span className="relative z-10">바로 시작하기</span>
                    <span className="absolute bottom-0 left-0 w-0 h-full bg-white/30 transition-all duration-300 group-hover:w-full"></span>
                  </div>
                </div>
                <div className="action-card-emoji">📚</div>
              </div>
            </div>
          </Link>
          <Link href="/zengo" className="block">
            <div className="action-card action-card-secondary h-full">
              <div className="action-card-overlay"></div>
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <h2 className="text-3xl font-bold mb-3">ZenGo</h2>
                  <p className="opacity-90 text-lg mb-6">생생하게 떠올리는 연습을 하세요</p>
                  <p className="opacity-90 text-lg mb-6">건망증이 점점 개선됩니다</p>
                  <div className="mt-4 inline-block bg-white/20 rounded-full px-4 py-2 text-sm font-medium relative overflow-hidden group">
                    <span className="relative z-10">트레이닝 시작</span>
                    <span className="absolute bottom-0 left-0 w-0 h-full bg-white/30 transition-all duration-300 group-hover:w-full"></span>
                  </div>
                </div>
                <div className="action-card-emoji">🧠</div>
              </div>
            </div>
          </Link>
          <Link href="/books" className="block">
            <div className="action-card action-card-accent h-full">
              <div className="action-card-overlay"></div>
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <h2 className="text-3xl font-bold mb-3">내 서재</h2>
                  <p className="opacity-90 text-lg mb-6">책 등록 및 메모 관리</p>
                  <p className="opacity-90 text-lg mb-6">읽기 속도 변화를 확인하세요</p>
                  <div className="mt-4 inline-block bg-white/20 rounded-full px-4 py-2 text-sm font-medium relative overflow-hidden group">
                    <span className="relative z-10">책 관리하기</span>
                    <span className="absolute bottom-0 left-0 w-0 h-full bg-white/30 transition-all duration-300 group-hover:w-full"></span>
                  </div>
                </div>
                <div className="action-card-emoji">📖</div>
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
        {routineProgress && (
          <div className="glass-card p-6 mb-10 relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#6366F1] flex items-center space-x-2">
                <span>33일 뇌 최적화 루틴</span>
                <button
                  onClick={() => router.push('/brain-hack-routine')}
                  className="p-1 text-indigo-600 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  aria-label="유형 선택 도움말"
                >
                  <FiHelpCircle className="w-6 h-6" aria-hidden="true" />
                </button>
              </h2>
              <div className="bg-indigo-50 py-1 px-3 rounded-full">
                <p className="text-xs font-semibold text-indigo-600">Day {routineProgress.currentDay} / 33</p>
              </div>
            </div>
            
            {/* 드롭다운 팝업 (애니메이션) */}
            {dropdownOpen && (
              <div
                ref={dropdownRef}
                className="absolute top-12 left-0 w-full sm:w-56 sm:left-6 bg-white rounded-xl shadow-xl ring-1 ring-gray-200 z-20 transform scale-95 origin-top-left animate-fadeIn transition ease-out duration-200"
                role="menu"
              >
                <Link
                  href="/brain-hack-routine"
                  className="block px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-indigo-50 transition focus:outline-none"
                  onClick={() => setDropdownOpen(false)}
                >
                  뇌 최적화 루틴이란
                </Link>
                <ul className="divide-y divide-gray-100">
                  {[
                    { key: 'exam', label: '수험생' },
                    { key: 'selfDev', label: '대학생' },
                    { key: 'attention', label: '집중개선' },
                    { key: 'memory', label: '기억개선' },
                  ].map(({ key, label }) => (
                    <li key={key} role="none">
                      <Link
                        href={`/routine/${key}`}
                        className="block px-4 py-3 text-sm text-gray-800 hover:bg-indigo-50 transition focus:outline-none"
                        onClick={() => setDropdownOpen(false)}
                        role="menuitem"
                        tabIndex={0}
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* 프로그레스 바 */}
            <div className="progress-bar mb-10">
              <div
                className="progress-bar-fill"
                style={{ width: `${(routineProgress.currentDay / routineProgress.totalDays) * 100}%` }}
              >
                <div className="progress-bar-shine"></div>
              </div>
              <div className="absolute top-0 right-0 h-full flex items-center">
                <span className="text-xs font-medium text-gray-600 mr-1">
                  {Math.round((routineProgress.currentDay / routineProgress.totalDays) * 100)}%
                </span>
              </div>
            </div>
            
            {/* 마일스톤 영역 */}
            <div className="relative mb-8">
              {/* 마일스톤 연결선 */}
              <div className="absolute top-5 left-0 right-0 h-[1px] bg-gray-200 z-0"></div>
              
              {/* 마일스톤 포인트 */}
              <div className="flex justify-between relative z-10">
                {routineProgress.milestones.map((milestone, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className={`milestone-circle ${
                      milestone.achieved 
                        ? 'milestone-circle-completed' 
                        : 'milestone-circle-pending'
                    }`}>
                      {milestone.achieved ? '✓' : index + 1}
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-semibold text-gray-700">{milestone.title}</div>
                      <div className="text-xs text-gray-500">Day {milestone.day}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* 동기부여 메시지 */}
            <div className="motivation-message mt-6">
              <p className="motivation-title">
                두 번째 마일스톤 달성! 절반을 향해!
              </p>
              <p className="text-sm text-gray-600 mt-2">
                14일 연속 도전 중 - 습관 형성까지 19일 남았습니다
              </p>
            </div>
          </div>
        )}
        
        {/* 요약 통계 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10 animate-fadeIn">
          <div className="glass-card p-5 md:p-6">
            <div className="flex items-center mb-3">
              <div className="stats-icon">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-gray-500">평균 읽기속도</h3>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">{stats?.avgReadingSpeed || 0} PPM</p>
          </div>
          
          <div className="glass-card p-5 md:p-6">
            <div className="flex items-center mb-3">
              <div className="stats-icon">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-14a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-gray-500">총 읽기 시간</h3>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">{formatReadingTime(stats?.totalReadingTime || 0)}</p>
          </div>
          
          <div className="glass-card p-5 md:p-6">
            <div className="flex items-center mb-3">
              <div className="stats-icon">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-gray-500">총 젠고시간</h3>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">{zengoStats?.totalActivities || 0}회</p>
          </div>
          
          <div className="glass-card p-5 md:p-6">
            <div className="flex items-center mb-3">
              <div className="stats-icon">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-gray-500">총 독서량</h3>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">{stats?.totalPagesRead || 0} 페이지</p>
          </div>
        </div>
        
        {/* 재구성된 메인 콘텐츠 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-slideUp" style={{animationDelay: '200ms'}}>
          {/* 왼쪽: 현재 읽고 있는 책 */}
          <div className="glass-card p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">현재 읽고 있는 책</h2>
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
                      <div className="book-item">
                        <div className="w-20 h-28 relative bg-gray-100 flex-shrink-0 rounded shadow-sm book-cover">
                          {book.coverImage ? (
                            <img
                              src={book.coverImage}
                              alt={book.title}
                              className="object-cover w-full h-full rounded"
                            />
                          ) : (
                            <div className="flex items-center justify-center w-full h-full text-gray-400 text-xs">
                              <span>이미지 없음</span>
                            </div>
                          )}
                        </div>
                        <div className="ml-5 flex-1">
                          <h3 className="font-semibold text-lg">{book.title}</h3>
                          <p className="text-gray-600 text-sm mb-3">{book.author}</p>
                          <div className="flex items-center mb-2">
                            <div className="w-full progress-bar">
                              <div 
                                className={`progress-bar-fill ${progress >= 75 ? 'bg-gradient-to-r from-emerald-500 to-green-500' : ''}`}
                                style={{ width: `${progress}%` }}
                              >
                                <div className="progress-bar-shine"></div>
                              </div>
                            </div>
                            <span className="ml-3 text-xs font-medium text-gray-600">
                              {book.currentPage}/{book.totalPages} ({progress}%)
                            </span>
                          </div>
                          {/* 예상 완독 시간 표시 (수정) */} 
                          {book.status !== 'completed' && estimatedTimeString && (
                            <p className="text-xs text-indigo-600 font-medium mt-1"> 
                              {estimatedTimeString}
                            </p>
                          )}
                           {/* PPM 데이터 없는 경우 안내 (선택적) */}
                           {book.status !== 'completed' && !book.estimatedRemainingMinutes && book.currentPage < book.totalPages && (
                             <p className="text-xs text-gray-500 mt-1">
                               TS 세션으로 예상 완독 시간을 확인해보세요
                             </p>
                           )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
            
            <div className="mt-8 flex justify-center">
              <Button 
                href="/books/new" 
                variant="default"
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md action-button"
              >
                새 책 추가하기
              </Button>
            </div>
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
      `}</style>
    </div>
  );
} 