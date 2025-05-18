// [ZenGo 모드 분리 원칙]
// ZenGo는 세 가지 모드(젠고 기본, 젠고 마이버스, 젠고 오리지널/브랜디드)를 별도로 운영합니다.
// - 각 모드는 게임 콘텐츠(문제, 기록, 통계 등)와 데이터 모델/저장소/API가 절대 섞이지 않으며, UI/컴포넌트 일부만 공유합니다.
// - Myverse 콘텐츠가 오리지널/기본에 노출되거나, 오리지널/기본 콘텐츠가 Myverse에 노출되는 일은 없어야 합니다.
// - 이 원칙을 위반하는 데이터/로직/호출/UI 혼용은 금지합니다.

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Button from '@/components/common/Button';
import { myverseApi, collectionsApi } from '@/lib/api';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import CollectionCard from '@/components/CollectionCard';
import AppLogo from '@/components/common/AppLogo';
import NotificationBell from '@/components/common/NotificationBell';
import { AcademicCapIcon, BookOpenIcon, BriefcaseIcon, SunIcon, PlusIcon, TagIcon, SquaresPlusIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import GameCard from '@/components/GameCard';
import { toast } from 'react-hot-toast';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid';
import HabitusIcon from '@/components/HabitusIcon';
import { cyberTheme } from '@/src/styles/theme'; // Import centralized theme

// Dynamically import modal components
const CountdownModal = dynamic(() => import('@/components/CountdownModal'), { ssr: false });
const CollectionGameForm = dynamic(() => import('./[collectionId]/CollectionGameForm'), { ssr: false });
const CollectionForm = dynamic(() => import('../../components/CollectionForm'), { ssr: false });

// 타입 정의
interface Collection {
  id: string;
  _id: string;
  name: string;
  title?: string;
  description?: string;
  type?: string; // category 대신 type 사용 (백엔드 모델과 일치 가정)
}

// 게임 데이터 타입 정의 (이전에 있었는지 확인, 없다면 추가)
interface MyverseGameData {
  _id: string;
  title: string;
  inputText: string;
  description?: string;
  type?: string; // 'myverse' 또는 'zengo' 등
  updatedAt?: string;
  owner?: { nickname: string };
  collectionId?: { _id: string; name: string; type: string };
  // CollectionGameForm의 MyverseGame 타입과 필요한 필드 동기화 필요
  wordMappings?: { word: string; coords: { x: number; y: number } }[];
  boardSize?: number;
  visibility?: 'private' | 'public' | 'group';
  sharedWith?: string[];
}

// 임시 카테고리 정의
const collectionCategories = [
  { id: 'all', label: '전체', Icon: TagIcon },
  { id: '시험', label: '시험', Icon: AcademicCapIcon },
  { id: '학습', label: '학습', Icon: BookOpenIcon },
  { id: '업무', label: '업무', Icon: BriefcaseIcon },
  { id: '일상', label: '일상', Icon: SunIcon },
];

// *** Add Category Color Mapping ***
const categoryColorMap: { [key: string]: string } = {
  '시험': 'text-yellow-400',
  '학습': 'text-lime-400',
  '업무': 'text-sky-400',
  '일상': 'text-orange-400',
  'all': cyberTheme.primary, // Use primary theme color for 'all'
};
// Default color for categories not in the map (if any)
const defaultCategoryColor = cyberTheme.textLight;

export default function MyversePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user);
  const [activeTab, setActiveTab] = useState('myCollections');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [myCollections, setMyCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // '내 컬렉션' 탭 > '전체보기' 상태 복원
  const [accessibleGames, setAccessibleGames] = useState<MyverseGameData[]>([]);
  const [isAccessibleLoading, setIsAccessibleLoading] = useState(false);
  const [accessibleError, setAccessibleError] = useState('');
  const [accessibleNextCursor, setAccessibleNextCursor] = useState<string | null>(null);

  // '공유받은 게임' 탭 상태 복원
  const [sharedGames, setSharedGames] = useState<MyverseGameData[]>([]);
  const [isSharedLoading, setIsSharedLoading] = useState(false);
  const [sharedError, setSharedError] = useState('');
  const [sharedNextCursor, setSharedNextCursor] = useState<string | null>(null);

  // '내 컬렉션' 탭 > 특정 카테고리 선택 상태 복원
  const [categoryGames, setCategoryGames] = useState<MyverseGameData[]>([]);
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState('');
  const [categoryNextCursor, setCategoryNextCursor] = useState<string | null>(null);

  // 게임 생성 모달 상태 및 선택된 컬렉션 ID 상태 추가
  const [showCreateGameModal, setShowCreateGameModal] = useState(false);
  const [selectedCollectionIdForCreation, setSelectedCollectionIdForCreation] = useState<string | null>(null);
  const [showCreateCollectionModal, setShowCreateCollectionModal] = useState(false);
  // 게임 수정 모달 상태 추가
  const [showEditGameModal, setShowEditGameModal] = useState(false);
  const [editingGameData, setEditingGameData] = useState<MyverseGameData | null>(null);

  // 추가된 상태
  const [selectedGame, setSelectedGame] = useState<any | null>(null);
  const [showCountdown, setShowCountdown] = useState(false);

  // '내가 보낸 게임' 탭 상태 복원
  const [sentGames, setSentGames] = useState<MyverseGameData[]>([]);
  const [isSentLoading, setIsSentLoading] = useState(false);
  const [sentError, setSentError] = useState('');
  const [sentNextCursor, setSentNextCursor] = useState<string | null>(null);

  // Initialize active tab, default to 'myCollections'
  useEffect(() => {
    const paramTab = searchParams.get('tab');
    if (paramTab === 'myCollections' || paramTab === 'sharedGames' || paramTab === 'sentGames' || paramTab === 'exploreGames') {
      setActiveTab(paramTab);
    }
  }, [searchParams]);

  // 컬렉션 데이터 로드 함수 정의
  const fetchData = async () => {
    // 컬렉션 로딩 상태 관리 (필요시 추가)
    // setError(''); // 오류 상태 초기화 위치 조정 필요 시
    try {
      const collectionResult = await collectionsApi.getAll();
      const collectionsData = Array.isArray(collectionResult)
        ? collectionResult.map(item => ({ ...item, id: item._id })) // id 필드 추가 (기존 로직 유지)
        : [];
      setMyCollections(collectionsData);
    } catch (err: any) {
      console.error('컬렉션 불러오기 실패:', err);
      // setError(err.message || '컬렉션을 불러오는 중 오류가 발생했습니다.'); // 오류 처리 방식 통일 필요
    } finally {
      // 컬렉션 로딩 상태 관리 (필요시 추가)
    }
  };

  // 접근 가능 게임 데이터 로드 함수
  const fetchAccessibleGames = async (cursor?: string) => {
    if (!cursor) {
      setIsAccessibleLoading(true);
      setAccessibleError('');
      setAccessibleGames([]); // 첫 페이지 로드 시 기존 목록 비움
    }
    try {
      const params = { limit: 12, cursor };
      const result = await myverseApi.getAccessible(params);
      setAccessibleGames(prev => cursor ? [...prev, ...result.games] : result.games);
      setAccessibleNextCursor(result.nextCursor);
    } catch (err: any) {
      console.error('접근 가능 게임 불러오기 실패:', err);
      setAccessibleError(err.message || '전체 게임 목록을 불러오는 중 오류 발생');
    } finally {
      if (!cursor) {
        setIsAccessibleLoading(false);
      }
    }
  };

  // 특정 카테고리 게임 데이터 로드 함수
  const fetchCategoryGames = async (category: string, cursor?: string) => {
    if (!cursor) {
      setIsCategoryLoading(true);
      setCategoryError('');
      setCategoryGames([]); // 첫 페이지 로드 시 기존 목록 비움
    }
    try {
      const params = { limit: 12, cursor };
      const result = await myverseApi.getByType(category, params);
      setCategoryGames(prev => cursor ? [...prev, ...result.games] : result.games);
      setCategoryNextCursor(result.nextCursor);
    } catch (err: any) {
      console.error(`'${category}' 카테고리 게임 불러오기 실패:`, err);
      setCategoryError(err.message || `'${category}' 게임 로딩 중 오류`);
    } finally {
      if (!cursor) {
        setIsCategoryLoading(false);
      }
    }
  };

  // 공유받은 게임 데이터 로드 함수
  const fetchSharedGames = async (cursor?: string) => {
    if (!cursor) {
      setIsSharedLoading(true);
      setSharedError('');
      setSharedGames([]); // 첫 페이지 로드 시 기존 목록 비움
    }
    try {
      const params = { limit: 12, cursor };
      const result = await myverseApi.getShared(params);
      setSharedGames(prev => cursor ? [...prev, ...result.games] : result.games);
      setSharedNextCursor(result.nextCursor);
    } catch (err: any) {
      console.error('공유 게임 불러오기 실패:', err);
      setSharedError(err.message || '공유받은 게임을 불러오는 중 오류가 발생했습니다.');
    } finally {
      if (!cursor) {
        setIsSharedLoading(false);
      }
    }
  };

  // 내가 보낸 게임 데이터 로드 함수
  const fetchSentGames = async (cursor?: string) => {
    if (!cursor) {
      setIsSentLoading(true);
      setSentError('');
      setSentGames([]); // 첫 페이지 로드 시 기존 목록 비움
    }
    try {
      const params = { limit: 12, cursor };
      const result = await myverseApi.getSent(params);
      setSentGames(prev => cursor ? [...prev, ...result.games] : result.games);
      setSentNextCursor(result.nextCursor);
    } catch (err: any) {
      console.error('내가 보낸 게임 불러오기 실패:', err);
      // '유효하지 않은 게임 ID입니다.' 오류는 게임 없음 상태로 간주
      const msg = err.message || '';
      if (msg.includes('유효하지 않은 게임 ID')) {
        setSentError('');
        setSentGames([]);
      } else {
        setSentError(msg || '내가 보낸 게임을 불러오는 중 오류가 발생했습니다.');
      }
    } finally {
      if (!cursor) setIsSentLoading(false);
    }
  };

  // 컬렉션 데이터는 페이지 로드 시 한 번만 로드하고 유지
  useEffect(() => {
    fetchData();
  }, []); // 빈 의존성 배열로 마운트 시 한 번만 실행

  // '내 컬렉션' 탭 데이터 로드 useEffect 수정
  useEffect(() => {
    if (activeTab !== 'myCollections') return;

    if (selectedCategory === 'all') {
      fetchAccessibleGames(); // '전체보기' 선택 시 접근 가능 게임 로드
      setCategoryGames([]); // 카테고리 게임 목록은 비움
    } else {
      fetchCategoryGames(selectedCategory); // 특정 카테고리 선택 시 해당 카테고리 게임 로드
      setAccessibleGames([]); // 접근 가능 게임 목록은 비움
    }
  }, [activeTab, selectedCategory]);

  // '공유받은 게임' 데이터 로드 useEffect
  useEffect(() => {
    if (activeTab === 'sharedGames') {
      fetchSharedGames();
    }
  }, [activeTab]);

  // '내가 보낸 게임' 데이터 로드 useEffect
  useEffect(() => {
    if (activeTab === 'sentGames') {
      fetchSentGames();
    }
  }, [activeTab]);

  // 페이지네이션 핸들러 복원
  const handleLoadMoreAccessible = () => {
    if (accessibleNextCursor) {
      setIsAccessibleLoading(true); // 로딩 상태 추가
      fetchAccessibleGames(accessibleNextCursor);
    }
  };

  const handleLoadMoreCategory = () => {
    if (categoryNextCursor) {
      setIsCategoryLoading(true); // 로딩 상태 추가
      fetchCategoryGames(selectedCategory, categoryNextCursor);
    }
  };

  const handleLoadMoreShared = () => {
    if (sharedNextCursor) {
      setIsSharedLoading(true); // 로딩 상태 추가
      fetchSharedGames(sharedNextCursor);
    }
  };

  // Load more for sent games
  const handleLoadMoreSent = () => {
    if (sentNextCursor) {
      setIsSentLoading(true);
      fetchSentGames(sentNextCursor);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('auth_token');
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    window.location.href = '/auth/login';
  };

  // 새 게임 만들기 버튼 클릭 핸들러
  const handleCreateGameClick = () => {
    if (selectedCategory === 'all') {
      console.warn('전체보기 상태에서는 특정 카테고리에 게임을 생성할 수 없습니다.');
      return;
    }
    // myCollections 상태에서 selectedCategory와 일치하는 컬렉션 찾기 (type 필드 기준)
    const targetCollection = myCollections.find(col => col.type === selectedCategory);

    if (targetCollection) {
      setSelectedCollectionIdForCreation(targetCollection._id);
      setShowCreateGameModal(true);
    } else {
      toast.error(`'${selectedCategory}' 카테고리에 해당하는 컬렉션을 찾을 수 없습니다.`);
      console.error('Error: Collection not found for category:', selectedCategory, myCollections);
    }
  };

  // 게임 수정 핸들러 구현
  const handleEditGame = (gameId: string) => {
    let gameToEdit: MyverseGameData | undefined;
    // 현재 활성 탭/카테고리에 따라 적절한 목록에서 게임 찾기
    if (activeTab === 'myCollections') {
      if (selectedCategory === 'all') {
        gameToEdit = accessibleGames.find(g => g._id === gameId);
      } else {
        gameToEdit = categoryGames.find(g => g._id === gameId);
      }
    } else if (activeTab === 'sharedGames') {
      gameToEdit = sharedGames.find(g => g._id === gameId);
    }

    if (gameToEdit) {
      setEditingGameData(gameToEdit);
      setShowEditGameModal(true);
    } else {
      console.error('수정할 게임 데이터를 찾을 수 없습니다:', gameId);
      toast.error('게임 정보를 불러오는 데 실패했습니다.');
    }
  };

  // 게임 삭제 핸들러
  const handleDeleteGame = async (gameId: string) => {
    if (window.confirm('정말 이 게임을 삭제하시겠습니까?')) {
      try {
        await myverseApi.delete(gameId);
        toast.success('게임이 삭제되었습니다.');
        // 목록 새로고침
        if (activeTab === 'myCollections') {
          if (selectedCategory === 'all') {
            fetchAccessibleGames();
          } else {
            fetchCategoryGames(selectedCategory);
          }
        } else if (activeTab === 'sharedGames') {
          fetchSharedGames();
        }
      } catch (error: any) {
        console.error('게임 삭제 실패:', error);
        toast.error(error.message || '게임 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  // 게임 카드 클릭 핸들러
  const handleGameCardClick = (game: any) => {
    setSelectedGame(game);
    setShowCountdown(true);
  };

  // ===== 애니메이션 Variants 정의 =====
  const pageVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  // JSX 구조 복원 (Phase 4 완료 시점)
  return (
    <div className={`min-h-screen ${cyberTheme.gradient}`}>
      <header className={`sticky top-0 z-10 py-3 px-4 backdrop-blur-md shadow-sm ${cyberTheme.bgSecondary}/90 border-b border-gray-700/50`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center space-x-3 group">
            <AppLogo className="w-8 h-8 group-hover:opacity-90 transition-opacity" />
            <div>
              <h1 className={`font-extrabold text-xl tracking-tight ${cyberTheme.textLight} group-hover:text-cyan-300 transition-colors`}>
                Habitus33
              </h1>
              <p className={`text-xs font-medium tracking-wider ${cyberTheme.textMuted}`}>
                Sharpen Your Mind
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="flex items-center">
              <div className="mr-3 text-right">
                <p className={`font-semibold ${cyberTheme.textLight}`}>
                  {user?.nickname || '사용자'}
                </p>
                <p className={`text-xs ${cyberTheme.textMuted}`}>
                  {user?.email ? user.email.split('@')[0] : '나만의 암기노트'}
                </p>
              </div>
              <div className="relative">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer shadow-md overflow-hidden bg-gradient-to-br from-cyan-600 to-purple-600 border-2 border-purple-500/50"
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                >
                  {user?.profileImage ? (
                    <img 
                      src={user.profileImage} 
                      alt={user?.nickname || '사용자'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className={`text-white font-bold text-lg`}>
                      {user?.nickname?.charAt(0) || '?'}
                    </span>
                  )}
                </div>
                {profileMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileMenuOpen(false)}></div>
                    <div className={`absolute right-0 mt-2 w-48 ${cyberTheme.menuBg} rounded-md shadow-lg py-1 z-50 border ${cyberTheme.inputBorder}`}>
                      <Link 
                        href="/profile" 
                        className={`block px-4 py-2 text-sm ${cyberTheme.textLight} ${cyberTheme.menuItemHover} transition-colors`}
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        프로필 설정
                      </Link>
                      <button 
                        onClick={() => {
                          setProfileMenuOpen(false);
                          handleLogout();
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm ${cyberTheme.textLight} ${cyberTheme.menuItemHover} transition-colors`}
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

      <motion.main
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        variants={pageVariants}
        initial="hidden"
        animate="visible"
      >
        <h1 className={`text-heading-sm mb-6 ${cyberTheme.textLight}`}>
          ZenGo Myverse 
          <span className={`text-base font-medium ml-1 ${cyberTheme.textMuted}`}>
            - 게임으로 외우고, 즐겁게 공유하세요.
          </span>
        </h1>

        <div className="mb-6 border-b border-gray-700">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('myCollections')}
              className={`whitespace-nowrap pb-3 pt-4 px-1 border-b-2 font-medium text-sm transition-colors duration-150 ${activeTab === 'myCollections' ? `border-cyan-500 ${cyberTheme.primary}` : `border-transparent ${cyberTheme.textMuted} hover:${cyberTheme.textLight} hover:border-gray-500`}`}
            >
              전체 게임 보기
            </button>
            <button
              onClick={() => setActiveTab('sharedGames')}
              className={`whitespace-nowrap pb-3 pt-4 px-1 border-b-2 font-medium text-sm transition-colors duration-150 ${activeTab === 'sharedGames' ? `border-cyan-500 ${cyberTheme.primary}` : `border-transparent ${cyberTheme.textMuted} hover:${cyberTheme.textLight} hover:border-gray-500`}`}
            >
              공유 받은 게임
            </button>
            <button
              onClick={() => setActiveTab('sentGames')}
              className={`whitespace-nowrap pb-3 pt-4 px-1 border-b-2 font-medium text-sm transition-colors duration-150 ${activeTab === 'sentGames' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'}`}
            >
              내가 보낸 게임
            </button>
            <button
              onClick={() => setActiveTab('exploreGames')}
              className={`whitespace-nowrap pb-3 pt-4 px-1 border-b-2 font-medium text-sm transition-colors duration-150 ${activeTab === 'exploreGames' ? 'border-accent text-accent' : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'}`}
              disabled
            >
              나의 스터디 클랜 - 곧 오픈 예정
            </button>
          </nav>
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'myCollections' && (
            <div className="flex flex-col lg:flex-row gap-8">
              <aside className="w-full lg:w-1/4 xl:w-1/5 flex-shrink-0">
                <h2 className={`text-lg font-semibold mb-4 ${cyberTheme.textLight}`}>콜렉션</h2>
                <nav className="space-y-1">
                  {collectionCategories.map(category => {
                    const collectionForCategory = myCollections.find(col => col.type === category.id);
                    // Determine the specific color for this category
                    const activeColor = categoryColorMap[category.id] || cyberTheme.primary; // Use specific color or default primary when active
                    const labelColor = categoryColorMap[category.id] || defaultCategoryColor; // Use specific color always for label

                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        // Adjust background/text for active state, keeping hover
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors group ${selectedCategory === category.id ? `${cyberTheme.buttonSecondaryBg}` : `${cyberTheme.textMuted} hover:${cyberTheme.buttonSecondaryHoverBg} hover:${cyberTheme.textLight}`}`}
                      >
                        <div className="flex items-center truncate">
                          {/* Apply specific color to icon when active */}
                          <category.Icon className={`mr-3 h-5 w-5 flex-shrink-0 ${selectedCategory === category.id ? activeColor : `${cyberTheme.textMuted} group-hover:${cyberTheme.textLight}`}`} aria-hidden="true" />
                          {/* Apply specific color to label always */}
                          <span className={`truncate ${selectedCategory === category.id ? activeColor : labelColor}`}>{category.label}</span>
                        </div>
                        {category.id !== 'all' && collectionForCategory && (
                          <Link
                            href={`/myverse/${collectionForCategory._id}`}
                            onClick={(e) => e.stopPropagation()}
                            className={`ml-2 p-0.5 rounded opacity-0 group-hover:opacity-70 hover:opacity-100 hover:bg-gray-600/50 transition-opacity duration-150`}
                            aria-label={`${category.label} 컬렉션 상세 보기`}
                          >
                            <ArrowTopRightOnSquareIcon className={`h-4 w-4 ${cyberTheme.textMuted}`} />
                          </Link>
                        )}
                      </button>
                    );
                  })}
                  {myCollections
                    .filter(col => !collectionCategories.some(cat => cat.id === col.type))
                    .map(col => (
                      <Link
                        key={col._id}
                        href={`/myverse/${col._id}`}
                        onClick={e => e.stopPropagation()}
                        className="mt-2 w-full flex items-center px-3 py-2 rounded-md text-sm font-medium text-neutral-600 hover:bg-secondary hover:text-neutral-900 transition-colors"
                      >
                        <HabitusIcon className={`mr-3 h-5 w-5 flex-shrink-0 ${cyberTheme.textMuted} group-hover:${cyberTheme.textLight}`} />
                        <span className="truncate">{col.name}</span>
                      </Link>
                    ))}
                  <button 
                    onClick={() => setShowCreateCollectionModal(true)}
                    className={`mt-4 w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors border border-dashed ${cyberTheme.inputBorder} ${cyberTheme.textMuted} hover:${cyberTheme.buttonSecondaryHoverBg} hover:${cyberTheme.textLight}`}
                    >
                    <PlusIcon className={`mr-3 h-5 w-5 flex-shrink-0 ${cyberTheme.textMuted}`} />
                    새 콜렉션
                  </button>
                </nav>
              </aside>

              <section className="flex-1">
                <div className="flex justify-between items-center mb-4">
                  <h2 className={`text-lg font-semibold ${cyberTheme.textLight}`}>
                    {collectionCategories.find(c => c.id === selectedCategory)?.label || '전체'} 게임
                    <span className={`text-base font-normal ml-2 ${cyberTheme.textMuted}`}>
                      {
                        selectedCategory === 'all'
                        ? `(${(isAccessibleLoading && accessibleGames.length === 0) ? '...' : accessibleGames.length})`
                        : `(${(isCategoryLoading && categoryGames.length === 0) ? '...' : categoryGames.length})`
                      }
                    </span>
                  </h2>
                  <Button
                    onClick={handleCreateGameClick}
                    disabled={selectedCategory === 'all' || isAccessibleLoading || isCategoryLoading}
                    className={`${cyberTheme.buttonPrimaryBg} ${cyberTheme.buttonPrimaryHoverBg}`}
                  >
                    <SquaresPlusIcon className="h-5 w-5 mr-1" />
                    새 게임
                  </Button>
                </div>

                {selectedCategory === 'all' && (
                  isAccessibleLoading && accessibleGames.length === 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="animate-pulse bg-white h-40 rounded-lg shadow-md" />
                      ))}
                    </div>
                  ) : accessibleError ? (
                    <div className="bg-feedback-error/10 text-feedback-error p-4 rounded-lg">{accessibleError}</div>
                  ) : accessibleGames.length === 0 ? (
                    <div className="text-center py-16 border border-dashed border-neutral-300 rounded-lg">
                      <p className="text-neutral-500">아직 생성하거나 공유받은 게임이 없습니다.</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {accessibleGames.map((game, index) => (
                          <motion.div
                            key={game._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                          >
                            <GameCard 
                              game={game} 
                              onEditClick={handleEditGame} 
                              onDeleteClick={handleDeleteGame} 
                              onClick={() => handleGameCardClick(game)}
                            />
                          </motion.div>
                        ))}
                      </div>
                      {accessibleNextCursor && (
                        <div className="mt-8 text-center">
                          <Button
                            variant="secondary"
                            onClick={handleLoadMoreAccessible}
                            disabled={isAccessibleLoading}
                            loading={isAccessibleLoading && accessibleGames.length > 0}
                          >
                            더보기
                          </Button>
                        </div>
                      )}
                    </>
                  )
                )}

                {selectedCategory !== 'all' && (
                  isCategoryLoading && categoryGames.length === 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="animate-pulse bg-white h-40 rounded-lg shadow-md" />
                      ))}
                    </div>
                  ) : categoryError ? (
                    <div className="bg-feedback-error/10 text-feedback-error p-4 rounded-lg">{categoryError}</div>
                  ) : categoryGames.length === 0 ? (
                    <div className="text-center py-16 border border-dashed border-neutral-300 rounded-lg">
                      <p className="text-neutral-500">해당 콜렉션에 게임이 없습니다.</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categoryGames.map((game, index) => (
                          <motion.div
                            key={game._id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                          >
                            <GameCard 
                              game={game} 
                              onEditClick={handleEditGame} 
                              onDeleteClick={handleDeleteGame} 
                              onClick={() => handleGameCardClick(game)}
                            />
                          </motion.div>
                        ))}
                      </div>
                      {categoryNextCursor && (
                        <div className="mt-8 text-center">
                          <Button
                            variant="secondary"
                            onClick={handleLoadMoreCategory}
                            disabled={isCategoryLoading}
                            loading={isCategoryLoading && categoryGames.length > 0}
                          >
                            더보기
                          </Button>
                        </div>
                      )}
                    </>
                  )
                )}
              </section>
            </div>
          )}
          {activeTab === 'sharedGames' && (
            <section className="flex-1">
              <h2 className="text-lg font-semibold text-neutral-DEFAULT mb-4">
                공유받은 게임
                {!isSharedLoading && (
                  <span className="text-base font-normal text-neutral-500 ml-2">
                    ({sharedGames.length})
                  </span>
                )}
              </h2>
              {isSharedLoading && sharedGames.length === 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-white h-40 rounded-lg shadow-md" />
                  ))}
                </div>
              ) : sharedError ? (
                <div className="bg-feedback-error/10 text-feedback-error p-4 rounded-lg">{sharedError}</div>
              ) : sharedGames.length === 0 ? (
                <div className="text-center py-12 text-neutral-500">
                  <p>아직 공유받은 게임이 없습니다.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {sharedGames.map((game, index) => (
                      <motion.div
                        key={game._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <GameCard 
                          game={game} 
                          onEditClick={handleEditGame} 
                          onDeleteClick={handleDeleteGame} 
                          onClick={() => handleGameCardClick(game)}
                        />
                      </motion.div>
                    ))}
                  </div>
                  {sharedNextCursor && (
                    <div className="mt-8 text-center">
                      <Button
                        variant="secondary"
                        onClick={handleLoadMoreShared}
                        disabled={isSharedLoading}
                        loading={isSharedLoading && sharedGames.length > 0}
                      >
                        더보기
                      </Button>
                    </div>
                  )}
                </>
              )}
            </section>
          )}
          {activeTab === 'sentGames' && (
            <section className="flex-1">
              <h2 className="text-lg font-semibold text-neutral-DEFAULT mb-4">
                내가 보낸 게임
                {!isSentLoading && (
                  <span className="text-base font-normal text-neutral-500 ml-2">
                    ({sentGames.length})
                  </span>
                )}
              </h2>
              {isSentLoading && sentGames.length === 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-white h-40 rounded-lg shadow-md" />
                  ))}
                </div>
              ) : sentError ? (
                <div className="bg-feedback-error/10 text-feedback-error p-4 rounded-lg">{sentError}</div>
              ) : sentGames.length === 0 ? (
                <div className="text-center py-12 text-neutral-500">
                  <p>아직 보낸 게임이 없습니다.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {sentGames.map((game, index) => (
                      <motion.div
                        key={game._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <GameCard
                          game={game}
                          onEditClick={handleEditGame}
                          onDeleteClick={handleDeleteGame}
                          onClick={() => handleGameCardClick(game)}
                        />
                      </motion.div>
                    ))}
                  </div>
                  {sentNextCursor && (
                    <div className="mt-8 text-center">
                      <Button
                        variant="secondary"
                        onClick={handleLoadMoreSent}
                        disabled={isSentLoading}
                        loading={isSentLoading && sentGames.length > 0}
                      >
                        더보기
                      </Button>
                    </div>
                  )}
                </>
              )}
            </section>
          )}
          {activeTab === 'exploreGames' && (
            <div className="text-center py-16 border border-dashed border-neutral-300 rounded-lg">
              <p className="text-neutral-500">곧 오픈</p>
            </div>
          )}
        </motion.div>
      </motion.main>

      <AnimatePresence>
        {showCreateGameModal && selectedCollectionIdForCreation && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-full max-w-lg bg-white rounded-lg shadow-xl overflow-hidden"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CollectionGameForm
                collectionId={selectedCollectionIdForCreation}
                onCancel={() => {
                  setShowCreateGameModal(false);
                  setSelectedCollectionIdForCreation(null);
                }}
                onSuccess={() => {
                  setShowCreateGameModal(false);
                  setSelectedCollectionIdForCreation(null);
                  if (selectedCategory === 'all') {
                    fetchAccessibleGames();
                  } else {
                    fetchCategoryGames(selectedCategory);
                  }
                  toast.success('게임이 성공적으로 생성되었습니다!');
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCreateCollectionModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CollectionForm 
                onCancel={() => setShowCreateCollectionModal(false)}
                onSuccess={(newCollection) => {
                  setShowCreateCollectionModal(false);
                  fetchData();
                  toast.success(`컬렉션 '${newCollection.name}' 생성 완료!`);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEditGameModal && editingGameData && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-full max-w-lg bg-white rounded-lg shadow-xl overflow-hidden"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CollectionGameForm
                collectionId={editingGameData.collectionId?._id || ''}
                initialData={editingGameData as any}
                onCancel={() => {
                  setShowEditGameModal(false);
                  setEditingGameData(null);
                }}
                onSuccess={(updatedGame) => {
                  setShowEditGameModal(false);
                  setEditingGameData(null);
                  if (activeTab === 'myCollections') {
                    if (selectedCategory === 'all') {
                      setAccessibleGames(prev => prev.map(g => g._id === updatedGame._id ? updatedGame : g));
                    } else {
                      setCategoryGames(prev => prev.map(g => g._id === updatedGame._id ? updatedGame : g));
                    }
                  } else if (activeTab === 'sharedGames') {
                    setSharedGames(prev => prev.map(g => g._id === updatedGame._id ? updatedGame : g));
                  }
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCountdown && selectedGame && (
          <CountdownModal
            game={selectedGame}
            onCancel={() => { setShowCountdown(false); setSelectedGame(null); }}
            onComplete={() => {
              setShowCountdown(false);
              router.push(`/myverse/games/${selectedGame._id}`);
              setSelectedGame(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
} 