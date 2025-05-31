"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { 
  setSettings, 
  fetchContentThunk, 
  resetGame, 
  placeStone, 
  submitResultThunk, 
  startGame, 
  hideWords, 
  clearStoneFeedback, 
  evaluateResult, 
  evaluateResultThunk,
  prepareNextGame, 
  regeneratePositionsThunk,
  retryContentThunk,
  ResultType
} from '@/store/slices/zengoSlice';
import './zengo.css';
import ZengoBoard from '@/components/zengo/ZengoBoard';
import ZengoStatusDisplay from '@/components/zengo/ZengoStatusDisplay';
import ZengoResultPage from '@/components/zengo/ZengoResultPage';
import { BoardStoneData, PlacedStone, BoardSize, InteractionMode } from '@/src/types/zengo';
import { LightBulbIcon, FireIcon, QuestionMarkCircleIcon, DocumentTextIcon, UserIcon, ArrowTrendingUpIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';
import { playSound } from '@/lib/audioUtils';

// [ZenGo 모드 분리 원칙]
// ZenGo는 세 가지 모드(젠고 기본, 젠고 마이버스, 젠고 오리지널/브랜디드)를 별도로 운영합니다.
// - 각 모드는 게임 콘텐츠(문제, 기록, 통계 등)와 데이터 모델/저장소/API가 절대 섞이지 않으며, UI/컴포넌트 일부만 공유합니다.
// - Myverse 콘텐츠가 오리지널/기본에 노출되거나, 오리지널/기본 콘텐츠가 Myverse에 노출되는 일은 없어야 합니다.
// - 이 원칙을 위반하는 데이터/로직/호출/UI 혼용은 금지합니다.

// Helper to map size to level string (adjust as needed)
const mapSizeToLevel = (size: number): string => {
  if (size === 3) return '3x3-easy';
  if (size === 5) return '5x5-medium';
  if (size === 7) return '7x7-hard';
  return `${size}x${size}-custom`; // Fallback for other sizes if needed later
};

// Add this function to check order correctness
const isOrderCorrect = (placedStones: PlacedStone[], expectedOrder: { x: number, y: number }[]): boolean => {
  // Filter only correct placements
  const correctPlacements = placedStones.filter(stone => stone.correct === true);
  
  // If we don't have all the correct stones yet, or too many correct stones, order can't be correct
  if (correctPlacements.length !== expectedOrder.length) {
    console.log(`Order check: Not enough correct placements. Got ${correctPlacements.length}, expected ${expectedOrder.length}`);
    return false;
  }
  
  // 단어가 배치된 순서(placementIndex)대로 정렬된 돌 배열 생성
  const placementOrder = [...correctPlacements]
    .sort((a, b) => (a.placementIndex || 0) - (b.placementIndex || 0))
    .map(stone => ({ x: stone.x, y: stone.y }));
  
  console.log('Expected word order:', expectedOrder.map(pos => `(${pos.x}, ${pos.y})`));
  console.log('Actual placement order:', placementOrder.map(pos => `(${pos.x}, ${pos.y})`));
  
  // 기대 순서와 실제 배치 순서가 정확히 일치하는지 확인
  let isSequentiallyCorrect = true;
  for (let i = 0; i < expectedOrder.length; i++) {
    if (expectedOrder[i].x !== placementOrder[i].x || expectedOrder[i].y !== placementOrder[i].y) {
      console.log(`Sequence mismatch at position ${i}: 
        Expected: (${expectedOrder[i].x}, ${expectedOrder[i].y}), 
        Actual: (${placementOrder[i].x}, ${placementOrder[i].y})`);
      isSequentiallyCorrect = false;
      break;
    }
  }
  
  // 모든 단어가 올바른 위치에 있는지 확인 (순서와 관계없이)
  let allWordsInCorrectPosition = true;
  for (const expectedPos of expectedOrder) {
    const found = correctPlacements.some(stone => 
      stone.x === expectedPos.x && stone.y === expectedPos.y
    );
    
    if (!found) {
      console.log(`Missing word at position (${expectedPos.x}, ${expectedPos.y})`);
      allWordsInCorrectPosition = false;
      break;
    }
  }
  
  console.log('All words in correct positions:', allWordsInCorrectPosition);
  console.log('Words placed in correct sequence:', isSequentiallyCorrect);
  
  // 두 조건이 모두 충족되어야 어순이 정확한 것
  return allWordsInCorrectPosition && isSequentiallyCorrect;
};

// export interface ZengoPageProps {
//   initialUiState?: 'intro' | 'selection';
//   onNextGame?: () => void;
//   onRetrySameContent?: () => void;
//   onBackToIntro?: () => void;
// }

export default function ZengoPage(
  // {
  //   initialUiState,
  //   onNextGame: customOnNextGame,
  //   onRetrySameContent: customOnRetrySameContent,
  //   onBackToIntro: customOnBackToIntro
  // }: ZengoPageProps
) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { 
    gameState, 
    currentContent, 
    error: zengoError, 
    placedStones, 
    revealedWords, 
    lastResult, 
    usedStonesCount, 
    startTime,
    resultType 
  } = useSelector((state: RootState) => state.zengoProverb);
  
  // 로그인 상태 확인
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('사용자가 로그인되어 있지 않습니다. 로그인 페이지로 이동합니다.');
      router.push('/auth/login');
    }
  }, [router]);
  
  const [hasSubmitted, setHasSubmitted] = useState(false); // Local state to track submission
  const timeoutRef = useRef<NodeJS.Timeout | null>(null); // Ref to store timeout ID
  const feedbackClearTimeouts = useRef<{ [key: string]: NodeJS.Timeout }>({}); // Ref for feedback clearing timeouts

  // Local state for managing UI flow (intro/selection) before game starts
  // ZengoPageProps에서 오던 initialUiState를 임시로 'intro'로 설정
  const [uiState, setUiState] = useState<'intro' | 'selection'>('intro');
  const [selectedBoardSize, setSelectedBoardSize] = useState<number>(3);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('ko'); // Default to Korean
  const categories = [
    "수능·시험",
    "외국어·편입",
    "대학교 시험",
    "유학·면접",
    "취업·자격증",
    "공무원·고시",
    "직무별 노하우",
    "전문가 컨설팅"
  ];
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]);
  const [loading, setLoading] = useState(false); // Keep local loading for button state?

  // Track if word order was correct
  const [wordOrderCorrect, setWordOrderCorrect] = useState<boolean | null>(null);

  // Animation state for Original cards
  const [originalCardsVisible, setOriginalCardsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation for Original cards shortly after component mounts or uiState changes to selection
    if (uiState === 'selection') {
      const timer = setTimeout(() => {
        setOriginalCardsVisible(true);
      }, 100); // Slight delay to ensure elements are rendered
      return () => clearTimeout(timer);
    }
  }, [uiState]);

  // Reset Redux state when component mounts or user returns to intro
  useEffect(() => {
    if (uiState === 'intro') {
      dispatch(resetGame());
    }
  }, [uiState, dispatch]);

  // Effect to handle Redux state changes (e.g., loading, game state transitions)
  useEffect(() => {
    setLoading(gameState === 'loading' || gameState === 'submitting');
    // Potentially navigate or show different components based on gameState
    // if (gameState === 'playing' || gameState === 'showing') {
    //   // Ensure game board is visible
    // }
    // if (gameState === 'finished_success' || gameState === 'finished_fail') {
    //   // Show results component
    // }
  }, [gameState]);

  // Effect to check for game end condition after each stone placement
  useEffect(() => {
    if (gameState === 'playing' && currentContent) {
      const success = revealedWords.length === currentContent.totalWords;
      const failed = usedStonesCount >= currentContent.totalAllowedStones && !success;
      
      if (success || failed) {
        console.log(`게임 종료 조건 충족! ${success ? "성공" : "실패"}`);
        console.log('현재 상태:', { 
          gameState, 
          resultType, 
          usedStonesCount, 
          totalAllowedStones: currentContent.totalAllowedStones,
          revealedWords: revealedWords.length,
          totalWords: currentContent.totalWords
        });
        
        // 제출 상태 초기화 및 결과 평가
        setHasSubmitted(false);
        dispatch(evaluateResult());
      }
    }
  }, [placedStones, revealedWords, gameState, currentContent, dispatch, usedStonesCount]);

  // Effect to submit result when game state changes to finished
  useEffect(() => {
    if ((gameState === 'finished_success' || gameState === 'finished_fail') && !hasSubmitted) {
      console.log(`결과 제출 시작: 게임 상태=${gameState}, 결과 유형=${resultType}`);
      
      // 결과 제출 요청
      dispatch(submitResultThunk());
      setHasSubmitted(true);
      
      console.log('결과 제출 후 상태:', { 
        gameState, 
        resultType,
        hasSubmitted: true
      });
    }
  }, [gameState, dispatch, hasSubmitted, resultType]);

  // Effect to automatically start the game once content is loaded
  useEffect(() => {
    // Check if content is loaded and we are in the idle state post-loading
    if (gameState === 'idle' && currentContent && uiState === 'selection') {
      console.log("Content loaded, starting game...");
      dispatch(startGame());
    }
  }, [gameState, currentContent, uiState, dispatch]);

  // Effect to handle the transition from showing words to playing
  useEffect(() => {
    // Clear previous timeout if exists
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (gameState === 'showing' && currentContent) {
      console.log(`Showing words for ${currentContent.initialDisplayTimeMs}ms`);
      timeoutRef.current = setTimeout(() => {
        console.log("Hiding words, changing state to playing...");
        dispatch(hideWords());
      }, currentContent.initialDisplayTimeMs);
    }

    // Cleanup function to clear timeout if component unmounts or gameState changes
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [gameState, currentContent, dispatch]);

  // Effect to automatically clear feedback state after a delay
  useEffect(() => {
    const newTimeouts: { [key: string]: NodeJS.Timeout } = {};

    placedStones.forEach(stone => {
      const key = `${stone.x}-${stone.y}`;
      // If feedback exists and no timeout is currently set for this stone
      if (stone.feedback && !feedbackClearTimeouts.current[key]) {
        console.log(`Setting timeout to clear feedback for ${key}`);
        newTimeouts[key] = setTimeout(() => {
          console.log(`Clearing feedback for ${key}`);
          dispatch(clearStoneFeedback({ x: stone.x, y: stone.y }));
          // Remove timeout ID from ref after execution
          delete feedbackClearTimeouts.current[key]; 
        }, 600); // Delay should match animation duration
      }
    });

    // Update the ref with new timeouts
    feedbackClearTimeouts.current = { ...feedbackClearTimeouts.current, ...newTimeouts };

    // Cleanup function: clear all timeouts when component unmounts or placedStones changes
    return () => {
      console.log("Clearing all feedback timeouts due to unmount or placedStones change.");
      Object.values(feedbackClearTimeouts.current).forEach(clearTimeout);
      // Optionally clear the ref itself if needed, though new timeouts will overwrite
      // feedbackClearTimeouts.current = {}; 
    };
    // Depend only on placedStones. Ensure placedStones array reference changes on update.
  }, [placedStones, dispatch]); 

  // Word order check effect
  useEffect(() => {
    // Only check when state is 'playing' and content is loaded
    if (gameState === 'playing' && currentContent) {
      // If all words are correct, check the order
      const correctPlacements = placedStones.filter(stone => stone.correct);
      
      if (correctPlacements.length === currentContent.wordMappings.length) {
        // 모든 단어를 찾았을 때만 어순 확인
        console.log('모든 단어 찾음, 어순 확인 시작:');
        
        // 기대하는 배치 순서 - 복사본 생성 후 정렬
        const expectedWordOrder = Array.from(currentContent.wordMappings)
          .sort((a, b) => {
            const aIndex = currentContent.proverbText.indexOf(a.word);
            const bIndex = currentContent.proverbText.indexOf(b.word);
            return aIndex - bIndex;
          })
          .map(wm => ({ x: wm.coords.x, y: wm.coords.y }));
        
        console.log('기대하는 배치 순서:', expectedWordOrder.map((pos, idx) => 
          `${idx + 1}. (${pos.x}, ${pos.y}) - "${currentContent.proverbText.split(' ')[idx] || '?'}"`
        ));
        
        // 실제 배치 순서 - 복사본 생성 후 정렬
        const actualPlacementOrder = Array.from(correctPlacements)
          .filter(stone => stone.placementIndex !== undefined)
          .sort((a, b) => (a.placementIndex || 0) - (b.placementIndex || 0))
          .map(stone => ({ x: stone.x, y: stone.y }));
        
        console.log('실제 배치 순서:', actualPlacementOrder.map((pos, idx) => {
          // 찾아진 단어 정보 로그
          const wordMapping = currentContent.wordMappings.find(wm => 
            wm.coords.x === pos.x && wm.coords.y === pos.y);
          return `${idx + 1}. (${pos.x}, ${pos.y}) - "${wordMapping?.word || '?'}"`;
        }));
        
        // Check if current order matches expected - 강화된 isOrderCorrect 함수 사용
        const isCorrect = isOrderCorrect(placedStones, expectedWordOrder);
        console.log(`어순 검사 결과: ${isCorrect ? '정확함 ✓' : '부정확함 ✗'}`);
        
        // Only update state if the value changes to avoid unnecessary re-renders
        if (wordOrderCorrect !== isCorrect) {
          console.log('결과: 어순 정확도 =', isCorrect ? '정확함' : '부정확함');
          setWordOrderCorrect(isCorrect);
        }
      } else {
        // 단어를 모두 맞추지 않았으면 어순 정확도는 null로 설정
        if (wordOrderCorrect !== null) {
          console.log('아직 모든 단어를 맞추지 않았습니다. 어순 정확도를 null로 설정합니다.');
          setWordOrderCorrect(null);
        }
      }
    } else if (gameState === 'idle' || gameState === 'setting') {
      // Reset when game is reset
      setWordOrderCorrect(null);
    }
  }, [placedStones, gameState, currentContent, wordOrderCorrect]);

  // Add useEffect for animation transitions
  useEffect(() => {
    // Handle stone animations and transitions
    if (gameState === 'playing') {
      // Create a timing mechanism to hide stones after animation completes
      const stoneAnimationTimers: NodeJS.Timeout[] = [];
      
      // 문장 사라짐 애니메이션은 컴포넌트 내에서 CSS로만 처리
      // Redux 액션 dispatch 없이 애니메이션만 적용

      // Cleanup timers on state change
      return () => {
        stoneAnimationTimers.forEach(timer => clearTimeout(timer));
      };
    }
  }, [gameState, revealedWords, currentContent]);

  // Start Game Function (replaces startTraining)
  const handleStartGame = () => {
    const level = mapSizeToLevel(selectedBoardSize);
    const language = selectedLanguage;

    console.log('게임 시작 버튼 클릭:', { level, language });
    
    // Promise 체인을 사용하여 액션 순서 보장
    Promise.resolve()
      // 1. 설정 적용
      .then(() => {
        console.log('1단계: 게임 설정 적용');
        return dispatch(setSettings({ level, language }));
      })
      // 2. 콘텐츠 요청
      .then(() => {
        console.log('2단계: 새 콘텐츠 요청');
        return dispatch(fetchContentThunk({ level, language, reshuffleWords: true }));
      })
      .then((result) => {
        console.log('게임 시작 준비 완료:', result);
        // UI 상태 업데이트
        setUiState('selection');
      })
      .catch((error) => {
        console.error('게임 시작 중 오류 발생:', error);
        // 오류 발생 시 알림
        alert('게임을 시작하는 중 오류가 발생했습니다. 다시 시도해주세요.');
      });
  };

  // Function to retry fetching content
  const handleRetryFetch = () => {
    // 결과 제출 관련 상태 초기화
    setHasSubmitted(false);
    
    const level = mapSizeToLevel(selectedBoardSize);
    const language = selectedLanguage;
    // reshuffleWords를 true로 설정하여 새로운 콘텐츠 요청
    dispatch(fetchContentThunk({ level, language, reshuffleWords: true }));
    console.log('재시도 요청:', { level, language, reshuffleWords: true });
  };

  // 다음 게임으로 진행하는 함수 
  const handleNextGame = async () => {
    setHasSubmitted(false);
    // isMyVerseGame 플래그를 명확히 사용
    const isMyVerseGame = currentContent?.level?.includes('-myverse') || currentContent?.level?.includes('-custom');
    const level = mapSizeToLevel(selectedBoardSize);
    const language = selectedLanguage;
    console.log('다음 게임 시작...', { level, language, isMyVerseGame });
    try {
      // 1. 결과 평가 및 최신 resultType 획득
      const rt = await dispatch(evaluateResultThunk()).unwrap();
      // 2. 다음 게임 준비 (새 콘텐츠, 새 위치)
      dispatch(prepareNextGame({ keepContent: false, keepPositions: false }));
      // 3. 게임 상태 초기화 (플래그만 보존)
      dispatch(resetGame({ preserveFlags: true }));
      // 4. MyVerse/기본 분기
      if (isMyVerseGame && currentContent?.collectionId) {
        // MyVerse: 현재 collection 내 다음 게임으로 라우팅 (MyVerse adapter에서 처리)
        router.push(`/myverse/games/${currentContent._id}?next=1`); // next=1은 예시, 실제 nextGame 로직은 myverse adapter에서 처리
      } else {
        // 기본: 새 설정 적용 및 콘텐츠 로드
        dispatch(setSettings({ level, language }));
        await dispatch(fetchContentThunk({ level, language, reshuffleWords: true })).unwrap();
        console.log('다음 게임 준비 완료:', rt);
      }
    } catch (error) {
      console.error('다음 게임 준비 실패:', error);
      dispatch(resetGame({ preserveFlags: false }));
      dispatch(setSettings({ level, language }));
      dispatch(fetchContentThunk({ level, language, reshuffleWords: true }));
    }
  };
  
  // 어순은 틀렸지만 단어는 모두 맞춘 경우 같은 문장으로 다시 시작하는 함수
  const handleRetrySameContent = async () => {
    setHasSubmitted(false);
    if (!currentContent) {
      console.warn('현재 콘텐츠가 없어 새 게임을 시작합니다.');
      try {
        const last = sessionStorage.getItem('zengo_last_content');
        if (last) {
          const { level, language, _id } = JSON.parse(last);
          dispatch(setSettings({ level, language }));
          await dispatch(fetchContentThunk({ level, language, contentId: _id, reshuffleWords: false })).unwrap();
        } else {
          dispatch(setSettings({ level: 'beginner', language: 'ko' }));
          await dispatch(fetchContentThunk({ level: 'beginner', language: 'ko', reshuffleWords: true })).unwrap();
        }
      } catch (err) {
        console.error('세션 복구 중 오류:', err);
      }
      return;
    }
    const { level, language } = currentContent;
    sessionStorage.setItem(
      'zengo_last_content',
      JSON.stringify({ _id: currentContent._id, level, language })
    );
    // 1. 결과 평가 및 최신 resultType 획득
    const rt = await dispatch(evaluateResultThunk()).unwrap();
    // 2. 게임 상태 초기화 (플래그만 보존)
    dispatch(resetGame({ onlyGameState: true, preserveFlags: true }));
    try {
      // 3. 결과 타입에 따른 재실행 동작
      if (rt === 'EXCELLENT') {
        // 완벽 성공: 완전히 새 콘텐츠
        await dispatch(fetchContentThunk({ level, language, reshuffleWords: true })).unwrap();
      } else if (rt === 'SUCCESS') {
        // 성공(위치만 맞음): 같은 문장, 다른 위치
        await dispatch(retryContentThunk({ reshufflePositions: true })).unwrap();
      } else {
        // 실패: 같은 위치로 재실행 (기존 좌표 유지)
        dispatch(startGame());
      }
      console.log('콘텐츠 로드 또는 재실행 완료:', rt);
    } catch (error) {
      console.error('같은 문항 반복 오류:', error);
      // 폴백: 새 콘텐츠 로드
      await dispatch(fetchContentThunk({ level, language, reshuffleWords: true })).unwrap();
    }
  };

  // Accessibility handler
  const handleKeyPress = (e: React.KeyboardEvent, callback: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      callback();
    }
  };

  // Create placement order for display
  const getPlacementOrder = () => {
    if (!currentContent || !placedStones.length) return [];
    
    // Create a map of stone positions to their indices in the stones array
    const stoneIndicesMap = new Map<string, number>();
    
    // Populate finalBoardStones first
    const stoneMap = new Map<string, BoardStoneData>(); 

    // 1. Process word mappings based on game state
    currentContent.wordMappings.forEach(mapping => {
      if (!mapping || !mapping.coords || typeof mapping.coords.x !== 'number' || typeof mapping.coords.y !== 'number') {
        console.warn('Invalid word mapping found, skipping:', mapping);
        return;
      }
      
      const key = `${mapping.coords.x}-${mapping.coords.y}`;
      if (gameState === 'showing') {
          stoneMap.set(key, {
              position: [mapping.coords.x, mapping.coords.y],
              value: mapping.word,
              color: 'black',
              visible: true,
              isNew: true, // Appear on showing
              isHiding: false,
              feedback: undefined,
              memoryPhase: true, // Add memory phase flag
          });
      } else if (gameState === 'playing' && !revealedWords.includes(mapping.word)) {
           // If playing and word not revealed, add a placeholder to hide
           stoneMap.set(key, {
              position: [mapping.coords.x, mapping.coords.y],
              value: mapping.word, // Keep the word value for the transition
              color: 'black',
              visible: true, // Initially visible for animation
              isNew: false,
              isHiding: true, // Apply hiding animation before disappearing
              feedback: undefined,
          });
      }
    });

    // 2. Process user placements (only in 'playing' state)
    if (gameState === 'playing') {
        // 타입 체크 및 방어 로직
        const validPlacedStones = Array.isArray(placedStones) ? placedStones : [];
        if (!Array.isArray(placedStones)) {
            console.warn('placedStones is not valid:', placedStones);
        }
        
        validPlacedStones.forEach((placed, index) => {
            if (!placed || typeof placed.x !== 'number' || typeof placed.y !== 'number') {
                console.warn('Invalid placed stone data, skipping:', placed);
                return;
            }
            
            const key = `${placed.x}-${placed.y}`;
            const isLastPlaced = index === validPlacedStones.length - 1;
            let value: string | number = '';
            let color: 'black' | 'white' = 'black';
            const feedback = placed.correct === true ? 'correct' : (placed.correct === false ? 'incorrect' : undefined);

            // Check if this placement corresponds to a revealed word
            const originalWordMapping = currentContent.wordMappings.find(
                m => m && m.coords && m.coords.x === placed.x && m.coords.y === placed.y
            );
            
            if (originalWordMapping && revealedWords.includes(originalWordMapping.word)) {
                value = originalWordMapping.word;
                color = 'black'; // Assuming correct words are black
            } else if (placed.correct === false) {
                value = 'X'; // Show X for incorrect
                color = 'white'; // Assuming incorrect are white
            }
            
            // Override or add the placed stone info to the map
            stoneMap.set(key, {
                position: [placed.x, placed.y],
                value: value,
                color: color,
                visible: true,
                isNew: isLastPlaced, // Apply appearing animation only to the last placed stone
                isHiding: false,
                feedback: feedback, // Pass feedback state
            });
        });
    }

    // Convert map values to array
    const finalBoardStones: BoardStoneData[] = Array.from(stoneMap.values());

    // Create indices map
    finalBoardStones.forEach((stone, index) => {
      const key = `${stone.position[0]}-${stone.position[1]}`;
      stoneIndicesMap.set(key, index);
    });
    
    // Filter only correct placements
    const correctPlacements = placedStones.filter(stone => stone.correct === true);
    
    // Create placement order array
    return correctPlacements.map(stone => {
      const key = `${stone.x}-${stone.y}`;
      return stoneIndicesMap.get(key) || -1;
    });
  };

  // --- ZenGo Myverse Modal State ---
  const [showMyverseModal, setShowMyverseModal] = useState(false);

  // 정답/오답/퍼펙트 사운드 연동 useEffect 추가 (placedStones, wordOrderCorrect 등 변화 시)
  useEffect(() => {
    if (gameState === 'playing' && currentContent) {
      const correctPlacements = placedStones.filter(stone => stone.correct);
      const allWordsCorrect = correctPlacements.length === currentContent.wordMappings.length;
      if (allWordsCorrect) {
        if (wordOrderCorrect) {
          playSound('perfect'); // 퍼펙트 사운드
        } else {
          playSound('correct'); // 일반 정답 사운드
        }
      } else {
        // 마지막 놓은 돌이 오답이면 오답 사운드
        const lastPlaced = placedStones[placedStones.length - 1];
        if (lastPlaced && lastPlaced.correct === false) {
          playSound('incorrect');
        }
      }
    }
  }, [placedStones, wordOrderCorrect, gameState, currentContent]);

  // --- Render Logic --- 

  // Intro Screen
  if (uiState === 'intro') {
  return (
    <div className="zengo-container">
      <div className="zengo-intro">
        <h1 className="intro-title">ZenGo : 기억 착수<br />
          <span className="intro-subtitle">바둑판에 나타나는 단어들을 기억하세요</span>
        </h1>
        
        {/* 세로 스크롤 방식 튜토리얼 섹션 */}
        <div className="tutorial-scroll-container">
          {/* 튜토리얼 1단계 */}
          <section className="tutorial-section">
            <div className="tutorial-content">
              <div className="tutorial-image">
                <div className="animation-board">
                  <div className="mini-board">
                    <div className="mini-stone">계속</div>
                    <div className="mini-stone">떠올리면</div>
                    <div className="mini-stone">기억이</div>
                    <div className="mini-stone">오래</div>
                    <div className="mini-stone">갑니다</div>
                  </div>
                </div>
              </div>
              <div className="tutorial-text">
                <h2>1. 단어 패턴 떠올리기</h2>
                <p>바둑판에 나타나는 단어들의 위치와 순서. 함께 모이면 명언이 완성됩니다</p>
                <div className="tutorial-tip">
                  <span className="tip-icon">💡</span>
                  <span className="tip-text">잠시 후 사라지므로 위치와 순서를 잘 기억해두세요</span>
                </div>
              </div>
            </div>
            <div className="scroll-indicator">
              <span>아래로 스크롤하여 계속 알아보기</span>
              <div className="scroll-arrow">↓</div>
            </div>
          </section>
          
          {/* 튜토리얼 2단계 */}
          <section className="tutorial-section">
            <div className="tutorial-content">
              <div className="tutorial-image">
                <div className="animation-board memory-phase">
                  <div className="mini-board">
                    <div className="mini-stone empty"></div>
                    <div className="mini-stone empty"></div>
                    <div className="mini-stone placing">장소</div>
                    <div className="mini-stone empty"></div>
                    <div className="mini-stone placed">연상</div>
                  </div>
                </div>
              </div>
              <div className="tutorial-text">
                <h2>2. 장소를 연상하고 돌 놓기</h2>
                <p>단어가 사라진 후, 기억한 위치에 돌을 놓아보세요. 정확한 위치에 놓으면 해당 단어가 다시 나타납니다.</p>
                <div className="tutorial-tip">
                  <span className="tip-icon">💡</span>
                  <span className="tip-text">단어들을 원래 문장 순서대로 배치하면 '완벽' 평가를 받을 수 있습니다. 순서가 틀려도 모든 단어를 맞추면 '성공'입니다.</span>
                </div>
              </div>
            </div>
            <div className="scroll-indicator">
              <span>마지막 단계로 스크롤하세요</span>
              <div className="scroll-arrow">↓</div>
            </div>
          </section>
          
          {/* 튜토리얼 3단계 */}
          <section className="tutorial-section">
            <div className="tutorial-content">
              <div className="tutorial-image">
                <div className="difficulty-showcase">
                  <div className="diff-board small">3x3</div>
                  <div className="diff-board medium">5x5</div>
                  <div className="diff-board large">7x7</div>
                </div>
              </div>
              <div className="tutorial-text">
                <h2>3. 목표 기억 사이즈별 도전</h2>
                <p>3x3 초급부터 시작해 5x5 중급, 7x7 고급까지 도전하세요. 기억판의 사이즈가 점점 커집니다.</p>
                <div className="tutorial-tip">
                  <span className="tip-icon">💡</span>
                  <span className="tip-text">향상된 기억력을 외국어 학습에 활용해 보세요!</span>
                </div>
              </div>
            </div>
          </section>
        </div>
        
        <button 
          className="start-button" 
          onClick={() => setUiState('selection')}
          onKeyPress={(e) => handleKeyPress(e, () => setUiState('selection'))}
          tabIndex={0}
        >
          ZenGo 기억 착수 시작
        </button>
      </div>
    </div>
  );
}

  // Selection Screen (and later game screen)
  if (uiState === 'selection') {
      // Show Loading indicator based on Redux state
      if (gameState === 'loading') {
          return <div className="zengo-container"><p>ZenGo 콘텐츠 로딩 중...</p></div>;
      }

      // Check for content fetch error specifically in idle/setting state
      if ((gameState === 'idle' || gameState === 'setting') && zengoError && !currentContent) {
        return (
            <div className="zengo-container zengo-selector">
                 <h2>콘텐츠 로드 오류</h2>
                 <p className="error-message" role="alert">
                      ZenGo 콘텐츠를 불러오는 중 오류가 발생했습니다: {zengoError}
                 </p>
                <button
                     className="retry-button-error"
                     onClick={handleRetryFetch}
                     onKeyPress={(e) => handleKeyPress(e, handleRetryFetch)}
                 >
                     다시 시도
                </button>
                <button
                     className="back-button"
                     onClick={() => setUiState('intro')}
                     onKeyPress={(e) => handleKeyPress(e, () => setUiState('intro'))}
                 >
                     뒤로 가기
                </button>
            </div>
        );
      }

      // Show Game Board and Status if game is in progress
      if ((gameState === 'showing' || gameState === 'playing') && currentContent) {
          
          // 타입 체크 및 버그 방어 로직
          if (!currentContent.wordMappings || !Array.isArray(currentContent.wordMappings)) {
              console.error('Invalid content structure:', currentContent);
              return <div className="zengo-container zengo-error-container">
                  <h2>데이터 구조 오류</h2>
                  <p>게임을 표시할 수 없습니다. 다시 시도해주세요.</p>
                  <button 
                      className="retry-button-error"
                      onClick={() => dispatch(resetGame())}
                  >
                      다시 시작하기
                  </button>
              </div>;
          }
          
          // Use the imported BoardStoneData type
          const stoneMap = new Map<string, BoardStoneData>(); 

          // 1. Process word mappings based on game state
          currentContent.wordMappings.forEach(mapping => {
            if (!mapping || !mapping.coords || typeof mapping.coords.x !== 'number' || typeof mapping.coords.y !== 'number') {
              console.warn('Invalid word mapping found, skipping:', mapping);
              return;
            }
            
            const key = `${mapping.coords.x}-${mapping.coords.y}`;
            if (gameState === 'showing') {
                stoneMap.set(key, {
                    position: [mapping.coords.x, mapping.coords.y],
                    value: mapping.word,
                    color: 'black',
                    visible: true,
                    isNew: true, // Appear on showing
                    isHiding: false,
                    feedback: undefined,
                    memoryPhase: true, // Add memory phase flag
                });
            } else if (gameState === 'playing' && !revealedWords.includes(mapping.word)) {
                 // If playing and word not revealed, add a placeholder to hide
                 stoneMap.set(key, {
                    position: [mapping.coords.x, mapping.coords.y],
                    value: mapping.word, // Keep the word value for the transition
                    color: 'black',
                    visible: true, // Initially visible for animation
                    isNew: false,
                    isHiding: true, // Apply hiding animation before disappearing
                    feedback: undefined,
                });
            }
          });

          // 2. Process user placements (only in 'playing' state)
          if (gameState === 'playing') {
              // 타입 체크 및 방어 로직
              const validPlacedStones = Array.isArray(placedStones) ? placedStones : [];
              if (!Array.isArray(placedStones)) {
                  console.warn('placedStones is not valid:', placedStones);
              }
              
              validPlacedStones.forEach((placed, index) => {
                  if (!placed || typeof placed.x !== 'number' || typeof placed.y !== 'number') {
                      console.warn('Invalid placed stone data, skipping:', placed);
                      return;
                  }
                  
                  const key = `${placed.x}-${placed.y}`;
                  const isLastPlaced = index === validPlacedStones.length - 1;
                  let value: string | number = '';
                  let color: 'black' | 'white' = 'black';
                  const feedback = placed.correct === true ? 'correct' : (placed.correct === false ? 'incorrect' : undefined);

                  // Check if this placement corresponds to a revealed word
                  const originalWordMapping = currentContent.wordMappings.find(
                      m => m && m.coords && m.coords.x === placed.x && m.coords.y === placed.y
                  );
                  
                  if (originalWordMapping && revealedWords.includes(originalWordMapping.word)) {
                      value = originalWordMapping.word;
                      color = 'black'; // Assuming correct words are black
                  } else if (placed.correct === false) {
                      value = 'X'; // Show X for incorrect
                      color = 'white'; // Assuming incorrect are white
                  }
                  
                  // Override or add the placed stone info to the map
                  stoneMap.set(key, {
                      position: [placed.x, placed.y],
                      value: value,
                      color: color,
                      visible: true,
                      isNew: isLastPlaced, // Apply appearing animation only to the last placed stone
                      isHiding: false,
                      feedback: feedback, // Pass feedback state
                  });
              });
          }

          // Convert map values to array
          const finalBoardStones: BoardStoneData[] = Array.from(stoneMap.values());

          // Get placement order
          const placementOrder = getPlacementOrder();

          return (
              <div className="zengo-container">
                {/* Board with status overlay at top-left corner */}
                <div style={{ position: 'relative', width: '100%' }}>
                  <ZengoBoard
                    boardSize={currentContent.boardSize as BoardSize}
                    stoneMap={finalBoardStones}
                    interactionMode={gameState === 'playing' ? 'click' : 'view'}
                    onIntersectionClick={(position: [number, number]) => {
                      if (gameState === 'playing') {
                        dispatch(placeStone({ x: position[0], y: position[1] }));
                      }
                    }}
                    isShowing={gameState === 'showing'}
                  />
                  <div className="status-card-responsive">
                    <ZengoStatusDisplay
                      usedStonesCount={usedStonesCount}
                      totalAllowedStones={currentContent.totalAllowedStones}
                      startTime={startTime}
                      gameState={gameState}
                      wordOrderCorrect={wordOrderCorrect}
                    />
                  </div>
                  <div className="mt-2 text-[10px] text-gray-300 select-none opacity-70 text-center">
                    본 페이지의 콘텐츠는 저작권법에 의해 보호되며  무단 복제, 배포 및 AI학습 사용을 금합니다
                  </div>
                </div>
              </div>
          );
      }

      // Show Results if game is finished
      if (gameState === 'finished_success' || gameState === 'finished_fail' || gameState === 'submitting') {
          console.log('게임 종료 화면 렌더링:', { 
            gameState, 
            resultType, 
            hasResult: !!lastResult,
            hasSubmitted
          });
          
          // 결과가 제출 중이면 로딩 표시
          if (gameState === 'submitting' && !lastResult) {
            return (
              <div className="zengo-container">
                <div className="loading-container" style={{ textAlign: 'center', padding: '30px' }}>
                  <h3>ZenGo 결과 제출 중...</h3>
                  <p>잠시만 기다려주세요.</p>
                </div>
              </div>
            );
          }
          
          // 결과 페이지 표시 (hasSubmitted 여부와 상관없이)
          return (
            <div className="zengo-container">
              <ZengoResultPage
                result={lastResult}
                resultType={resultType}
                error={zengoError}
                onNextGame={handleNextGame}
                onRetrySameContent={handleRetrySameContent}
                onBackToIntro={() => setUiState('intro')}
              />
            </div>
          );
      }
      
      // Show Settings Selection UI if idle/setting/error
      return (
        <div className="zengo-container">
          <div className="zengo-selector">
            <h2 className="settings-title" style={{ color: '#1a237e' }}>ZenGo Game</h2>
            <p className="settings-intro">
              자신의 성장 목표에 맞는 메모리보드 사이즈와 목표 언어를 선택하세요
            </p>
            {/* 보드 크기 선택 + Myverse 카드 */}
            <section className="settings-section">
              <h3 className="text-xl font-semibold text-gray-700 mb-6">메모리보드</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" role="radiogroup" aria-label="레벨 선택">
                {[{ size: 3, desc: '매일 꾸준히 해 보세요', IconComponent: UserIcon },
                  { size: 5, desc: '점점 더 쉬워집니다', IconComponent: ArrowTrendingUpIcon },
                  { size: 7, desc: '성취감을 느껴 보세요', IconComponent: RocketLaunchIcon }
                ].map(level => (
                  <div
                    key={level.size}
                    className={`p-6 rounded-xl border-2 transition-all duration-200 cursor-pointer bg-white hover:shadow-lg flex flex-col items-center justify-center text-center ${selectedBoardSize === level.size ? 'border-primary-500 shadow-xl ring-2 ring-primary-500/50' : 'border-gray-200 hover:border-gray-300'}`}
                    onClick={() => setSelectedBoardSize(level.size)}
                    onKeyPress={(e) => handleKeyPress(e, () => setSelectedBoardSize(level.size))}
                    role="radio"
                    aria-checked={selectedBoardSize === level.size}
                    tabIndex={0}
                  >
                    <level.IconComponent className="w-12 h-12 text-primary-600 mb-3" />
                    <h4 className="text-3xl font-bold text-gray-800 mb-2">{`${level.size}x${level.size}`}</h4>
                    <p className="text-sm text-gray-600">{level.desc}</p>
                  </div>
                ))}
              </div>
            </section>
            {/* 언어 선택 */}
            <section className="settings-section">
              <h3 className="text-xl font-semibold text-gray-700 mb-6">목표 언어</h3>
              <div className="flex flex-wrap gap-4 mb-8" role="radiogroup" aria-label="언어 선택">
                {[{ code: 'ko', name: '한국어', flag: '🇰🇷' },
                  { code: 'en', name: 'English', flag: '🇺🇸' }
                ].map(lang => (
                  <div
                    key={lang.code}
                    className={`flex items-center p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer bg-white hover:shadow-lg ${selectedLanguage === lang.code ? 'border-primary-500 shadow-xl ring-2 ring-primary-500/50' : 'border-gray-200 hover:border-gray-300'}`}
                    onClick={() => setSelectedLanguage(lang.code)}
                    onKeyPress={(e) => handleKeyPress(e, () => setSelectedLanguage(lang.code))}
                    role="radio"
                    aria-checked={selectedLanguage === lang.code}
                    tabIndex={0}
                  >
                    <span className="text-3xl mr-3">{lang.flag}</span>
                    <span className="text-md font-medium text-gray-800">{lang.name}</span>
                  </div>
                ))}
              </div>
              {!selectedLanguage && <p className="text-sm text-red-500 selection-guide">언어를 선택해주세요</p>}
            </section>
            {/* 브랜디드 콘텐츠 섹션 */}
            <section className="settings-section rounded-2xl p-8 md:p-10 mb-6"
              style={{ background: 'linear-gradient(90deg, #0a1020 0%, #1e293b 60%, #232946 100%)', position: 'relative', boxShadow: '0 2px 8px #1e293b44' }}
            >
              <h3 className="text-2xl font-extrabold mb-4 text-white" style={{ color: '#fff', textShadow: '0 1px 8px #38bdf833' }}>
                ZenGo 오리지널 <span style={{ color: '#FFD600', fontWeight: '600', marginLeft: '0.25rem', fontSize: '0.9rem', letterSpacing: '-0.01em' }}>암기비결·고수 노하우 오픈마켓</span>
              </h3>
              <div className="text-gray-300 text-sm md:text-base mb-6 leading-relaxed">
                이제 학습에 필요한 모든 걸 사고 팔 수 있습니다. 각 분야 고수의 노하우를 담은 <span style={{ color: '#38BDF8', fontWeight: 'bold' }}>ZenGo</span>로 경쟁에서 이기세요
              </div>
              {/* Categories Tabs */}
              <nav role="tablist" aria-label="콘텐츠 카테고리" className="bg-neutral-900/10 rounded-lg px-4 py-2 flex overflow-x-auto space-x-6 border-b border-neutral-600 mb-6 md:justify-center">
                {categories.map(cat => (
                  <div key={cat} className="relative group">
                    <button
                      role="tab"
                      aria-selected={selectedCategory === cat}
                      tabIndex={selectedCategory === cat ? 0 : -1}
                      onClick={() => setSelectedCategory(cat)}
                      className={`uppercase font-medium tracking-wide px-5 py-3 text-xs transition-all duration-200 ease-in-out ${selectedCategory === cat ? 'text-white border-b-2 border-primary-500' : 'text-neutral-400 hover:text-white hover:bg-neutral-700/60'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}>
                      {cat}
                    </button>
                    <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-700 text-neutral-200 text-xs whitespace-nowrap rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      추후 공개
                    </div>
                  </div>
                ))}
              </nav>
              <div className="level-grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {[
                  { title: '단권화 노트', slogan: '알맹이만 콕콕', icon: LightBulbIcon, color: '#6366F1', gradFrom: '#4F46E5', gradTo: '#7C3AED', tag: '핵심요약' },
                  { title: '시험 족보', slogan: '꼭 나오는 것만', icon: FireIcon, color: '#3B82F6', gradFrom: '#2563EB', gradTo: '#60A5FA', tag: '기출기반' },
                  { title: '예상 적중', slogan: '이번엔 이 문제', icon: QuestionMarkCircleIcon, color: '#10B981', gradFrom: '#059669', gradTo: '#34D399', tag: '실전대비' },
                  { title: '한장 요약', slogan: '시험 직전', icon: DocumentTextIcon, color: '#EC4899', gradFrom: '#DB2777', gradTo: '#F472B6', tag: '막판정리' },
                ].map((item, index) => (
                  <div
                    key={item.title}
                    className={`group relative flex flex-col items-center justify-between p-4 md:p-5 rounded-xl overflow-hidden cursor-pointer transform transition-all duration-1000 ease-out hover:scale-105 hover:shadow-2xl ${originalCardsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
                    style={{
                      background: `linear-gradient(145deg, ${item.gradFrom} 0%, ${item.gradTo} 100%)`,
                      color: '#fff',
                      border: `2px solid ${item.color}`,
                      boxShadow: `0 6px 12px ${item.color}55, 0 2px 6px ${item.color}33`,
                      fontFamily: "'Noto Sans KR', Orbitron, Exo, 'Roboto Mono', sans-serif",
                      minHeight: '200px',
                      position: 'relative', // For pseudo-element positioning
                      transitionDelay: originalCardsVisible ? `${index * 150}ms` : '0ms', // 지연 시간 증가
                    }}
                    onClick={() => alert(`${item.title} - Coming Soon!`)}
                    tabIndex={0}
                    role="button"
                    aria-label={`오픈마켓 ${item.title}: ${item.slogan}`}
                  >
                    {/* Tag */}
                    <span className="absolute top-3 right-3 bg-white/20 text-white text-[10px] md:text-xs font-semibold px-2 py-1 rounded-full backdrop-blur-sm">
                      {item.tag}
                    </span>
                    
                    {/* Icon and Title */}
                    <div className="text-center w-full mt-2" style={{ position: 'relative', zIndex: 1 }}>
                      <div className="mb-2 md:mb-3 p-2 md:p-2.5 rounded-full bg-white/25 inline-block shadow-md">
                        <item.icon className="w-8 h-8 md:w-10 md:h-10 text-white drop-shadow-lg group-hover:text-yellow-300 transition-colors duration-200 ease-in-out" />
                      </div>
                      <h4 className="text-sm md:text-base font-bold mb-1" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>{item.title}</h4>
                      <p className="text-xs md:text-sm text-indigo-100" style={{ opacity: 0.85 }}>{item.slogan}</p>
                    </div>

                    {/* CTA Button Placeholder */}
                    <button 
                      className="mt-3 md:mt-4 w-full text-center py-2 px-3 text-xs md:text-sm font-semibold rounded-lg transition-all duration-200 ease-in-out opacity-90 group-hover:opacity-100"
                      style={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.15)', 
                        color: '#fff',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        backdropFilter: 'blur(4px)',
                        zIndex: 1, // Ensure button is above the pattern
                      }}
                      onClick={(e) => { e.stopPropagation(); alert(`${item.title} - 콘텐츠 보기 (준비중)`); }}
                    >
                      콘텐츠 보기
                    </button>
                    
                    {/* Subtle Circuit Pattern Overlay */}
                    <div
                      className="absolute inset-0 w-full h-full opacity-50 transition-opacity duration-300 pointer-events-none group-hover:opacity-75"
                      style={{
                        backgroundImage: `
                          linear-gradient(to right, ${item.color}88 1px, transparent 1px),
                          linear-gradient(to bottom, ${item.color}88 1px, transparent 1px)
                        `,
                        backgroundSize: '20px 20px', 
                        zIndex: 0, 
                      }}
                    />
                  </div>
                ))}
              </div>
              {/* Gold badge at top-right */}
              <span 
                className="absolute top-4 right-4 z-10 transform transition-all duration-200 ease-in-out hover:scale-110 hover:rotate-3 cursor-pointer group"
                style={{ zIndex: 2 }} // zIndex는 style prop으로 유지
                aria-label="프리미엄 골드 배지"
              >
                <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md group-hover:drop-shadow-xl">
                  <circle cx="22" cy="22" r="20" fill="#FFD600" stroke="#FFB300" strokeWidth="3"/>
                  <circle cx="22" cy="22" r="14" fill="#FFF8E1" stroke="#FFECB3" strokeWidth="2"/>
                  <path d="M22 11l2.47 6.62h6.96l-5.63 4.09 2.47 6.62L22 24.24l-5.27 4.09 2.47-6.62-5.63-4.09h6.96L22 11z" fill="#FFC107" stroke="#FFB300" strokeWidth="1.2"/>
                </svg>
              </span>
            </section>
            {/* Start Game Button */}
            <div className="action-buttons-container">
              <button
                className="start-button"
                onClick={handleStartGame}
                onKeyPress={(e) => handleKeyPress(e, handleStartGame)}
                disabled={loading || !selectedBoardSize || !selectedLanguage}
                aria-disabled={loading || !selectedBoardSize || !selectedLanguage}
                tabIndex={0}
              >
                {loading ? '로딩 중...' : (!selectedBoardSize || !selectedLanguage ? '옵션을 모두 선택하세요' : 'ZenGo 시작')}
              </button>
              <button
                className="back-button"
                onClick={() => setUiState('intro')}
                onKeyPress={(e) => handleKeyPress(e, () => setUiState('intro'))}
                aria-label="인트로 화면으로 돌아가기"
                tabIndex={0}
              >
                뒤로 가기
              </button>
            </div>
          </div>
        </div>
      );
  }

  // Fallback or error state
  return <div className="zengo-container"><p>ZenGo: 알 수 없는 상태입니다.</p></div>;
}

