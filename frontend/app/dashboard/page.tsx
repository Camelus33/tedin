'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { apiClient } from '@/lib/apiClient';
import { FiSettings, FiGrid, FiList, FiChevronDown, FiBook, FiTarget, FiFileText } from 'react-icons/fi';
import AppLogo from '@/components/common/AppLogo';
import TSNoteCard, { TSNote } from '@/components/ts/TSNoteCard';

// 타입 정의 - TSNote를 사용

interface SummaryNote {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  bookIds: string[];
  orderedNoteIds: string[];
  tags: string[];
  userMarkdownContent?: string;
  createdAt: string;
  updatedAt: string;
}

interface User {
  _id: string;
  nickname: string;
  email: string;
  profileImage?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const reduxUser = useSelector((state: RootState) => state.user);
  const [user, setUser] = useState<User | null>(null);
  const [recentMemos, setRecentMemos] = useState<TSNote[]>([]);
  const [summaryNotes, setSummaryNotes] = useState<SummaryNote[]>([]);
  const [memoCount, setMemoCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('latest');
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const sortMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        setSortMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // 사용자 정보 가져오기
      console.log('🔍 [DEBUG] 0. Starting to fetch user info...');
      try {
        const userResponse = await apiClient.get('/users/profile');
        const userData = Array.isArray(userResponse) ? userResponse[0] : (userResponse?.data || userResponse);
        console.log('🔍 [DEBUG] 0.5. User data:', userData);
        setUser(userData);
             } catch (userError) {
         console.error('🔍 [DEBUG] Error fetching user info:', userError);
         // Redux에서 가져온 사용자 정보를 fallback으로 사용
         if (reduxUser && reduxUser.nickname) {
           setUser({
             _id: reduxUser.id || 'unknown',
             nickname: reduxUser.nickname,
             email: reduxUser.email || '',
             profileImage: reduxUser.profileImage || undefined
           });
         }
       }
      
      // 최근 메모 가져오기 (notes API 사용)
      console.log('🔍 [DEBUG] 1. Starting to fetch recent memos...');
      const memosResponse = await apiClient.get('/notes?limit=3&sort=createdAt:desc');
      console.log('🔍 [DEBUG] 2. Raw memos API response:', memosResponse);
      console.log('🔍 [DEBUG] 3. Raw memos data:', memosResponse?.data);
      console.log('🔍 [DEBUG] 4. Is memos data an array?', Array.isArray(memosResponse?.data));
      console.log('🔍 [DEBUG] 5. Memos data length:', memosResponse?.data?.length);
      console.log('🔍 [DEBUG] 5.5. Is memosResponse directly an array?', Array.isArray(memosResponse));
      console.log('🔍 [DEBUG] 5.6. memosResponse direct length:', memosResponse?.length);
      
      // API 응답이 직접 배열인지 확인하고 적절히 처리
      const rawNotes = Array.isArray(memosResponse) ? memosResponse : (memosResponse?.data || []);
      console.log('🔍 [DEBUG] 6. Raw notes after fallback:', rawNotes);
      
      // 서버는 title 필드를 사용하므로, TSNoteCard에서 필요로 하는 content 필드로 매핑
      // 최근 3개만 선택
      const mappedNotes = rawNotes
        .slice(0, 3) // 최근 3개만 선택
        .map((n: any) => {
          console.log('🔍 [DEBUG] 7. Mapping individual note:', n);
          const mapped = {
            ...n,
            content: n.content || n.title || '',
            tags: n.tags || [],
          };
          console.log('🔍 [DEBUG] 8. Mapped note result:', mapped);
          return mapped;
        });
      console.log('🔍 [DEBUG] 9. Final mapped notes (최근 3개):', mappedNotes);
      setRecentMemos(mappedNotes);
      console.log('🔍 [DEBUG] 10. Set recentMemos state to:', mappedNotes);
      
      // 전체 메모 개수 설정 (실제 API에서 받은 전체 개수 사용)
      setMemoCount(rawNotes.length);
      console.log('🔍 [DEBUG] 10.5. Set memoCount to:', rawNotes.length);

      // 단권화 노트 가져오기 (최신 3개만 표시)
      console.log('🔍 [DEBUG] 11. Starting to fetch summary notes...');
      const summaryNotesResponse = await apiClient.get('/summary-notes');
      console.log('🔍 [DEBUG] 12. Raw summary notes API response:', summaryNotesResponse);
      console.log('🔍 [DEBUG] 13. Raw summary notes data:', summaryNotesResponse?.data);
      console.log('🔍 [DEBUG] 14. Is summary notes data an array?', Array.isArray(summaryNotesResponse?.data));
      console.log('🔍 [DEBUG] 15. Summary notes data length:', summaryNotesResponse?.data?.length);
      console.log('🔍 [DEBUG] 15.5. Is summaryNotesResponse directly an array?', Array.isArray(summaryNotesResponse));
      console.log('🔍 [DEBUG] 15.6. summaryNotesResponse direct length:', summaryNotesResponse?.length);
      
      // API 응답이 직접 배열인지 확인하고 적절히 처리
      const allSummaryNotes = Array.isArray(summaryNotesResponse) ? summaryNotesResponse : (summaryNotesResponse?.data || []);
      console.log('🔍 [DEBUG] 16. All summary notes after fallback:', allSummaryNotes);
      
      // 클라이언트 사이드에서 최신 3개만 선택
      const recentSummaryNotes = allSummaryNotes
        .sort((a: SummaryNote, b: SummaryNote) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 3);
      console.log('🔍 [DEBUG] 17. Recent 3 summary notes:', recentSummaryNotes);
      setSummaryNotes(recentSummaryNotes);
      console.log('🔍 [DEBUG] 18. Set summaryNotes state to:', recentSummaryNotes);

    } catch (error) {
      console.error('🔍 [DEBUG] ERROR in fetchDashboardData:', error);
    } finally {
      setIsLoading(false);
      console.log('🔍 [DEBUG] 19. Finished loading, isLoading set to false');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/auth/login');
  };

  const handleNewMemo = () => {
    router.push('/memo/new');
  };

  const handleNewReading = () => {
    router.push('/ts');
  };

  const handleMemoCardClick = (memo: any) => {
    if (memo.bookId) {
      router.push(`/books/${memo.bookId}`);
      } else {
      console.warn('메모에 bookId가 없습니다:', memo);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '오늘';
    if (diffDays === 1) return '어제';
    if (diffDays < 7) return `${diffDays}일 전`;
    return date.toLocaleDateString('ko-KR');
  };

  // 렌더링 전 상태 확인
  console.log('🔍 [RENDER] Current user state:', user);
  console.log('🔍 [RENDER] Current user nickname:', user?.nickname);
  console.log('🔍 [RENDER] Redux user state:', reduxUser);
  console.log('🔍 [RENDER] Current recentMemos state:', recentMemos);
  console.log('🔍 [RENDER] Current summaryNotes state:', summaryNotes);
  console.log('🔍 [RENDER] Is recentMemos array?', Array.isArray(recentMemos));
  console.log('🔍 [RENDER] Is summaryNotes array?', Array.isArray(summaryNotes));
  console.log('🔍 [RENDER] recentMemos length:', recentMemos?.length);
  console.log('🔍 [RENDER] summaryNotes length:', summaryNotes?.length);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <div className="text-cyan-300 text-lg">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-blue-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-indigo-500/20 bg-black/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* 좌측: 로고 */}
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center space-x-3">
                <AppLogo />
                <span className="text-xl font-bold text-white">Habitus33</span>
              </Link>
              </div>

            {/* 우측: 설정 버튼과 사용자 프로필 */}
            <div className="flex items-center space-x-4">
              {/* 설정 버튼 */}
              <button
                onClick={() => router.push('/profile')}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-cyan-300 hover:text-cyan-100 hover:bg-indigo-800/30 rounded-md transition-colors border border-cyan-500/30 hover:border-cyan-400/50"
              >
                <FiSettings className="w-4 h-4" />
                <span>설정</span>
              </button>

              {/* 사용자 프로필 메뉴 */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-full hover:bg-indigo-800/30 transition-colors border border-cyan-500/30 hover:border-cyan-400/50"
                >
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.nickname || '사용자'}
                      className="w-8 h-8 rounded-full object-cover border-2 border-cyan-400"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {user?.nickname?.charAt(0) || '?'}
                      </span>
                    </div>
                  )}
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-900/95 backdrop-blur-md rounded-md shadow-xl py-1 z-50 border border-indigo-500/30">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-cyan-300 hover:bg-indigo-800/50 hover:text-cyan-100"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                        프로필 설정
                      </Link>
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        handleLogout();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-cyan-300 hover:bg-indigo-800/50 hover:text-cyan-100"
                    >
                        로그아웃
                      </button>
                    </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 상태 메시지 */}
        <div className="mb-8">
          <h1 className="text-2xl font-medium text-white">
            <span className="text-cyan-300">{user?.nickname || '사용자'}</span>님, 현재 <span className="text-indigo-300">{memoCount}개</span>의 메모카드를 작성하셨습니다.
          </h1>
        </div>

        {/* 새로 만들기 버튼 */}
        <div className="mb-8">
          <div className="flex space-x-4">
            <button
              onClick={handleNewReading}
              className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all font-medium shadow-lg hover:shadow-indigo-500/25 border border-indigo-500/30"
            >
              📖 리딩 세션 시작
            </button>
            <button
              onClick={handleNewMemo}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all font-medium shadow-lg hover:shadow-cyan-500/25 border border-cyan-500/30"
            >
              ✍️ 새 메모 작성
            </button>
          </div>
        </div>

        {/* 최근 메모 카드 섹션 */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-medium text-white">최근 메모 카드</h2>
            <div className="flex items-center space-x-4">
              {/* 보기 전환 버튼 */}
              <div className="flex items-center bg-gray-800/50 backdrop-blur-md rounded-lg p-1 border border-indigo-500/30">
                <button
                  onClick={() => setViewMode('grid')}
                                      className={`p-2 rounded-md transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-cyan-300 hover:text-cyan-100'
                    }`}
                >
                  <FiGrid className="w-4 h-4" />
                </button>
                  <button
                  onClick={() => setViewMode('list')}
                                      className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-cyan-300 hover:text-cyan-100'
                    }`}
                >
                  <FiList className="w-4 h-4" />
                  </button>
                </div>

              {/* 정렬 드롭다운 */}
              <div className="relative" ref={sortMenuRef}>
                <button
                  onClick={() => setSortMenuOpen(!sortMenuOpen)}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-cyan-300 hover:text-cyan-100 border border-indigo-500/30 rounded-md hover:border-indigo-400/50 transition-colors bg-gray-800/30 backdrop-blur-md"
                >
                  <span>최신 항목</span>
                  <FiChevronDown className="w-4 h-4" />
                </button>

                {sortMenuOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-gray-900/95 backdrop-blur-md rounded-md shadow-xl py-1 z-50 border border-indigo-500/30">
                    <button
                      onClick={() => {
                        setSortBy('latest');
                        setSortMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-cyan-300 hover:bg-indigo-800/50 hover:text-cyan-100"
                    >
                      최신 항목
                      </button>
                    <button 
                      onClick={() => {
                        setSortBy('oldest');
                        setSortMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-cyan-300 hover:bg-indigo-800/50 hover:text-cyan-100"
                    >
                      오래된 항목
                    </button>
                  </div>
                )}
              </div>

              {/* 나의 도서관 버튼 */}
              <Link
                href="/books"
                className="text-sm text-cyan-400 hover:text-cyan-200 transition-colors flex items-center space-x-1 border border-cyan-500/30 px-3 py-2 rounded-md hover:border-cyan-400/50 bg-gray-800/30 backdrop-blur-md"
              >
                <span>나의 도서관</span>
                <span>→</span>
              </Link>
            </div>
                </div>
                
          {/* 메모 카드들 - TSNoteCard 사용 */}
          {(() => {
            console.log('🔍 [RENDER] Checking recentMemos condition:', recentMemos.length > 0);
            console.log('🔍 [RENDER] recentMemos.length:', recentMemos.length);
            return recentMemos.length > 0 ? (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-2' : 'space-y-4 p-2'}>
                {recentMemos.map((memo, index) => {
                  console.log(`🔍 [RENDER] Rendering memo ${index}:`, memo);
                  
                  // 포스트잇 색상 배열 (인덱스에 따라 다른 색상 적용)
                  const postItColors = [
                    {
                      bg: 'from-yellow-100 to-yellow-200',
                      border: 'border-yellow-300/50',
                      shadow: 'shadow-yellow-600/20 hover:shadow-yellow-600/30',
                      rotation: 'rotate-1'
                    },
                    {
                      bg: 'from-pink-100 to-pink-200',
                      border: 'border-pink-300/50',
                      shadow: 'shadow-pink-600/20 hover:shadow-pink-600/30',
                      rotation: '-rotate-1'
                    },
                    {
                      bg: 'from-blue-100 to-blue-200',
                      border: 'border-blue-300/50',
                      shadow: 'shadow-blue-600/20 hover:shadow-blue-600/30',
                      rotation: 'rotate-2'
                    },
                    {
                      bg: 'from-green-100 to-green-200',
                      border: 'border-green-300/50',
                      shadow: 'shadow-green-600/20 hover:shadow-green-600/30',
                      rotation: '-rotate-2'
                    },
                    {
                      bg: 'from-purple-100 to-purple-200',
                      border: 'border-purple-300/50',
                      shadow: 'shadow-purple-600/20 hover:shadow-purple-600/30',
                      rotation: 'rotate-1'
                    }
                  ];
                  
                  const colorScheme = postItColors[index % postItColors.length];
                  
                  return (
                    <div 
                      key={memo._id} 
                      className={`${viewMode === 'list' ? 'w-full' : ''} cursor-pointer`}
                      onClick={() => handleMemoCardClick(memo)}
                    >
                      <TSNoteCard
                        note={memo}
                        showActions={true}
                        minimalDisplay={true}
                        className={`
                          bg-gradient-to-br ${colorScheme.bg}
                          ${colorScheme.border}
                          shadow-md ${colorScheme.shadow}
                          transform ${colorScheme.rotation} hover:rotate-0
                          hover:shadow-xl
                          hover:scale-105
                          transition-all duration-300 ease-out
                          relative
                          !rounded-none
                          !pb-3
                          backdrop-blur-none
                          before:absolute before:top-0 before:left-0 before:w-full before:h-full
                          before:bg-gradient-to-br before:from-transparent before:to-black/5
                          before:pointer-events-none
                          after:absolute after:top-0 after:right-0 after:w-3 after:h-3
                          after:bg-gradient-to-bl after:from-black/15 after:to-transparent
                          after:pointer-events-none after:transform after:rotate-45 after:translate-x-1 after:-translate-y-1
                          [&>div]:!rounded-none
                          [&_p]:!text-gray-800 [&_p]:!font-semibold
                          [&_.text-gray-300]:!text-gray-700
                          [&_.text-white]:!text-gray-800
                          [&_.text-gray-400]:!text-gray-600
                          [&_.text-cyan-400]:!text-indigo-700
                          [&_span]:!text-gray-700
                          border-t-4 border-t-black/10
                          shadow-[0_1px_3px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.6)]
                        `}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              (() => {
                console.log('🔍 [RENDER] Showing "no memos" message');
                return (
                  <div className="text-center py-12 text-gray-400">
                    <p>아직 메모가 없습니다.</p>
                    <p className="text-sm mt-2">첫 번째 메모를 작성해보세요!</p>
            </div>
                );
              })()
            );
          })()}
          </div>

        {/* 스크롤 영역 */}
        <div className="space-y-12">
          {/* 최근 단권화 노트 섹션 */}
          <div>
            <h2 className="text-xl font-medium text-white mb-6">최근 단권화 노트</h2>
            {(() => {
              console.log('🔍 [RENDER] Checking summaryNotes condition:', summaryNotes.length > 0);
              console.log('🔍 [RENDER] summaryNotes.length:', summaryNotes.length);
              return summaryNotes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {summaryNotes.map((note, index) => {
                    console.log(`🔍 [RENDER] Rendering summary note ${index}:`, note);
                    return (
                      <div
                        key={note._id}
                        className="aspect-square bg-gray-800/40 backdrop-blur-md border border-indigo-500/30 rounded-lg p-4 hover:shadow-lg hover:shadow-indigo-500/20 transition-all cursor-pointer hover:border-indigo-400/50 hover:bg-gray-800/60 flex flex-col"
                        onClick={() => router.push(`/summary-notes/${note._id}/edit`)}
                      >
                        {/* 카드 상단: 아이콘 */}
                        <div className="flex-shrink-0 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                            <FiFileText className="w-5 h-5 text-white" />
        </div>
      </div>

                        {/* 카드 중간: 제목과 내용 */}
                        <div className="flex-1 flex flex-col min-h-0">
                          <h3 className="font-medium text-white mb-2 line-clamp-2 text-sm">
                            {note.title || '제목 없음'}
                          </h3>
                          <p className="text-xs text-gray-300 line-clamp-3 mb-3 flex-1">
                            {note.description || '설명 없음'}
                          </p>
                        </div>
                        
                        {/* 카드 하단: 메타 정보 */}
                        <div className="flex-shrink-0 space-y-1">
                          <div className="text-xs text-cyan-400">
                            연결된 메모: {note.orderedNoteIds?.length || 0}개
                  </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(note.updatedAt)}
                </div>
                </div>
              </div>
                    );
                  })}
                </div>
              ) : (
                (() => {
                  console.log('🔍 [RENDER] Showing "no summary notes" message');
                  return (
                    <div className="text-center py-12 text-gray-400">
                      <p>아직 단권화 노트가 없습니다.</p>
                  </div>
                  );
                })()
              );
            })()}
          </div>
          
          {/* Zengo & Zengo Myverse 섹션 */}
          <div>
            <h2 className="text-xl font-medium text-white mb-6">두뇌 훈련</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link href="/zengo" className="group">
                <div className="bg-gray-800/40 backdrop-blur-md border border-indigo-500/30 rounded-lg p-6 hover:shadow-lg hover:shadow-indigo-500/20 transition-all group-hover:border-indigo-400/50 group-hover:bg-gray-800/60">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <FiTarget className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-medium text-white">Zengo</h3>
                  </div>
                  <p className="text-gray-300 mb-4">
                    남다른 읽기 통찰력을 키우세요.
                  </p>
                  <div className="text-indigo-400 font-medium">시작하기 →</div>
                </div>
              </Link>

              <Link href="/myverse" className="group">
                <div className="bg-gray-800/40 backdrop-blur-md border border-cyan-500/30 rounded-lg p-6 hover:shadow-lg hover:shadow-cyan-500/20 transition-all group-hover:border-cyan-400/50 group-hover:bg-gray-800/60">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <FiBook className="w-5 h-5 text-white" />
                  </div>
                    <h3 className="text-lg font-medium text-white">Zengo Myverse</h3>
                  </div>
                  <p className="text-gray-300 mb-4">
                    중요한 생각이 떠오르면 바로 외우세요.
                  </p>
                  <div className="text-cyan-400 font-medium">체험하기 →</div>
                </div>
              </Link>
              </div>
            </div>

          {/* 인지 분석 섹션 */}
          <div>
            <h2 className="text-xl font-medium text-white mb-6">인지 분석</h2>
            <Link href="/analytics" className="group">
              <div className="bg-gray-800/40 backdrop-blur-md border border-indigo-500/30 rounded-lg p-6 hover:shadow-lg hover:shadow-indigo-500/20 transition-all group-hover:border-indigo-400/50 group-hover:bg-gray-800/60">
                <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium text-white mb-2">인지 프로필 분석</h3>
                    <p className="text-gray-300">
                      학습 패턴과 인지 능력을 분석하여 개인화된 인사이트를 확인하세요.
                  </p>
                </div>
                  <div className="text-indigo-400 font-medium">분석 보기 →</div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}