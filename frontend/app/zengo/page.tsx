'use client';

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

export default function ZengoPage() {
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
  const [uiState, setUiState] = useState<'intro' | 'selection'>('intro');
  const [selectedBoardSize, setSelectedBoardSize] = useState<number>(3);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('ko'); // Default to Korean
  const [loading, setLoading] = useState(false); // Keep local loading for button state?

  // Track if word order was correct
  const [wordOrderCorrect, setWordOrderCorrect] = useState<boolean | null>(null);

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
    const level = mapSizeToLevel(selectedBoardSize);
    const language = selectedLanguage;
    console.log('다음 게임 시작...', { level, language });
    try {
      // 1. 결과 평가 및 최신 resultType 획득
      const rt = await dispatch(evaluateResultThunk()).unwrap();
      // 2. 다음 게임 준비 (새 콘텐츠, 새 위치)
      dispatch(prepareNextGame({ keepContent: false, keepPositions: false }));
      // 3. 게임 상태 초기화 (플래그만 보존)
      dispatch(resetGame({ preserveFlags: true }));
      // 4. 새 설정 적용 및 콘텐츠 로드
      dispatch(setSettings({ level, language }));
      await dispatch(fetchContentThunk({ level, language, reshuffleWords: true })).unwrap();
      console.log('다음 게임 준비 완료:', rt);
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

  // --- Render Logic --- 

  // Intro Screen
  if (uiState === 'intro') {
  return (
    <div className="zengo-container">
      <div className="zengo-intro">
        <h1 className="intro-title">ZenGo : 기억 착수<br />
          <span className="intro-subtitle">바둑과 인지과학의 만남</span>
        </h1>
        
        {/* 세로 스크롤 방식 튜토리얼 섹션 */}
        <div className="tutorial-scroll-container">
          {/* 튜토리얼 1단계 */}
          <section className="tutorial-section">
            <div className="tutorial-content">
              <div className="tutorial-image">
                <div className="animation-board">
                  <div className="mini-board">
                    <div className="mini-stone">기억</div>
                    <div className="mini-stone">은</div>
                    <div className="mini-stone">반복</div>
                    <div className="mini-stone">의</div>
                    <div className="mini-stone">어머니</div>
                  </div>
                </div>
              </div>
              <div className="tutorial-text">
                <h2>1. 단어 패턴 기억하기</h2>
                <p>바둑판에 나타나는 단어들의 위치를 기억하세요. 이 단어들은 함께 모이면 의미 있는 명언이나 속담을 완성합니다.</p>
                <div className="tutorial-tip">
                  <span className="tip-icon">💡</span>
                  <span className="tip-text">잠시 후 단어들이 사라지므로 위치와 순서를 잘 기억해두세요. 난이도가 높을수록 표시 시간이 짧아집니다.</span>
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
                <div className="animation-board">
                  <div className="mini-board memory-phase">
                    <div className="mini-stone empty"></div>
                    <div className="mini-stone empty"></div>
                    <div className="mini-stone placing">반복</div>
                    <div className="mini-stone empty"></div>
                    <div className="mini-stone placed">기억</div>
                  </div>
                </div>
              </div>
              <div className="tutorial-text">
                <h2>2. 기억을 바탕으로 돌 놓기</h2>
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
                <h2>3. 난이도별 두뇌 훈련</h2>
                <p>3x3 초급부터 시작해 5x5 중급, 7x7 고급까지 도전하며 기억력을 향상시키세요. 해마 활성화를 통해 기억력과 집중력이 증강됩니다.</p>
                <div className="tutorial-tip">
                  <span className="tip-icon">💡</span>
                  <span className="tip-text">정기적인 훈련을 통해 공간 인지 능력, 단기 기억력, 집중력이 향상됩니다. 다양한 언어로도 도전해보세요!</span>
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
          ZenGo 시작하기
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
                    본 페이지의 모든 콘텐츠는 저작권법에 의해 보호되며  무단 복제, 배포를 원칙적으로 금합니다
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
            <h2 className="settings-title" style={{ color: '#1a237e' }}>ZenGo 설정</h2>
            <p className="settings-intro">
              레벨과 언어를 선택하고 시작하세요
            </p>
            {/* 보드 크기 선택 + Myverse 카드 */}
            <section className="settings-section">
              <h3>재밌게 즐기세요</h3>
              <div className="level-grid" role="radiogroup" aria-label="레벨 선택">
                {[{ size: 3, label: '초급', desc: '기억력 기초 - 5분 세션 권장', icon: '🔰' },
                  { size: 5, label: '중급', desc: '집중력 강화 - 10분 세션 권장', icon: '⭐' },
                  { size: 7, label: '고급', desc: '공간 지각력 - 15분 세션 권장', icon: '🏆' }
                ].map(level => (
                  <div
                    key={level.size}
                    className={`level-card ${selectedBoardSize === level.size ? 'selected' : ''}`}
                    onClick={() => setSelectedBoardSize(level.size)}
                    onKeyPress={(e) => handleKeyPress(e, () => setSelectedBoardSize(level.size))}
                    role="radio"
                    aria-checked={selectedBoardSize === level.size}
                    tabIndex={0}
                  >
                    <div className="level-header">
                      <span className="level-icon">{level.icon}</span>
                      <h4>{`${level.size}x${level.size} ${level.label}`}</h4>
                    </div>
                    <p className="level-desc">{level.desc}</p>
                    {selectedBoardSize === level.size && <div className="selection-indicator"></div>}
                  </div>
                ))}
                {/* ZenGo Myverse Premium Edition Card (as a level card) */}
                <div
                  className="level-card group cursor-pointer premium-myverse-card border-2 border-blue-400 relative flex flex-col items-center justify-center transition mx-auto"
                  style={{ minHeight: 0, minWidth: 0, background: 'linear-gradient(135deg, #4F46E5 0%, #60A5FA 100%)', color: '#fff', boxShadow: '0 4px 24px 0 rgba(96,165,250,0.12), 0 1.5px 8px 0 rgba(79,70,229,0.10)', alignSelf: 'center', justifySelf: 'center' }}
                  onClick={() => setShowMyverseModal(true)}
                  tabIndex={0}
                  aria-label="ZenGo Myverse 프리미엄 에디션 자세히 보기"
                >
                  <div className="flex items-center gap-2 mb-1 mt-1 w-full justify-center">
                    <span className="text-sm md:text-lg font-extrabold" style={{ color: '#fff', letterSpacing: '-0.02em' }}>ZenGo</span>
                    <span className="text-sm md:text-lg font-extrabold" style={{ color: '#FBBF24', letterSpacing: '-0.02em' }}>Myverse</span>
                    <span className="ml-2 bg-blue-400 text-white px-2 py-0.5 rounded-full text-[10px] md:text-xs font-bold shadow border border-blue-300" style={{ letterSpacing: '0.01em', height: 'fit-content' }}>PREMIUM</span>
                  </div>
                  <div className="text-center font-semibold text-sm md:text-base mb-1 w-full" style={{ color: '#fff', wordBreak: 'keep-all', lineHeight: 1.3, maxWidth: '90%' }}>
                    외우고 싶은 문장을 입력해 나 만의 ZenGo를 즐기세요
                  </div>
                  <div className="text-xs mb-2 w-full text-center" style={{ color: '#DBEAFE', fontWeight: 500, letterSpacing: '0.01em', lineHeight: 1.2, maxWidth: '90%' }}>
                    - 초대코드 / 유료가입 -
                  </div>
                  <div className="mt-2 text-xs font-bold group-hover:underline" style={{ color: '#fff', letterSpacing: '0.01em' }}>자세히 보기 &gt;</div>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-10 rounded-2xl pointer-events-none transition" style={{ background: 'linear-gradient(135deg, #60A5FA 0%, #4F46E5 100%)' }} />
                </div>
              </div>
            </section>
            {/* 언어 선택 */}
            <section className="settings-section">
              <h3>언어를 선택하세요</h3>
              <div className="language-grid" role="radiogroup" aria-label="언어 선택">
                {[{ code: 'ko', name: '한국어', flag: '🇰🇷' },
                  { code: 'en', name: 'English', flag: '🇺🇸' }
                ].map(lang => (
                  <div
                    key={lang.code}
                    className={`language-card ${selectedLanguage === lang.code ? 'selected' : ''}`}
                    onClick={() => setSelectedLanguage(lang.code)}
                    onKeyPress={(e) => handleKeyPress(e, () => setSelectedLanguage(lang.code))}
                    role="radio"
                    aria-checked={selectedLanguage === lang.code}
                    tabIndex={0}
                  >
                    <span className="language-flag">{lang.flag}</span>
                    <span className="language-name">{lang.name}</span>
                    {selectedLanguage === lang.code && <div className="selection-indicator"></div>}
                  </div>
                ))}
              </div>
              {!selectedLanguage && <p className="selection-guide">언어를 선택해주세요</p>}
            </section>
            {/* 고급 트레이닝 섹션 */}
            <section className="settings-section rounded-2xl p-6 md:p-8 mb-6 shadow-xl"
              style={{ background: 'linear-gradient(90deg, #232946 0%, #1a237e 60%, #283593 100%)', position: 'relative' }}
            >
              <h3 className="text-2xl font-extrabold mb-2 text-white" style={{ color: '#fff', textShadow: '0 1px 8px rgba(30,40,80,0.18)' }}>
                고급 트레이닝 33일 루틴 <span style={{ color: '#FFD600', fontWeight: 700, marginLeft: 4, fontSize: '1rem', letterSpacing: '-0.01em' }}>인지과학자 + 프로바둑기사 협업 독점콘텐츠</span>
              </h3>
              <div className="text-gray-200 text-sm md:text-base mb-4">
                바둑 수읽기를 응용, 고급 시험에서 요구하는 긴 호흡의 문해력, 집중력, 언어추리력을 단계별로 향상시킬 수 있습니다.
              </div>
              <div className="level-grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {[
                  { size: '7x5', desc: '3분 모드' },
                  { size: '9x7', desc: '5분 모드' },
                  { size: '11x9', desc: '7분 모드' },
                  { size: '13x11', desc: '9분 모드' },
                ].map((item) => (
                  <div
                    key={item.size}
                    className="level-card cursor-pointer border-2 border-gray-300 hover:border-blue-400 transition flex flex-col items-center justify-center p-4 rounded-xl bg-white shadow-sm"
                    onClick={() => alert('고급 트레이닝은 곧 오픈 예정입니다.')}
                    tabIndex={0}
                    role="button"
                    aria-label={`고급 트레이닝 ${item.size}`}
                  >
                    <div className="text-lg md:text-xl font-bold mb-1 text-gray-800">{item.size}</div>
                    <div className="text-xs md:text-sm text-gray-500 mb-1">{item.desc}</div>
                    <div className="text-xs text-gray-400">흑돌/백돌 기억 착수</div>
                  </div>
                ))}
              </div>
              {/* Gold badge at top-right */}
              <span style={{ position: 'absolute', top: 16, right: 16, zIndex: 2 }} aria-label="프리미엄 골드 배지">
                <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
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
            {/* ZenGo Myverse Modal */}
            {showMyverseModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <div className="bg-white rounded-2xl shadow-2xl px-6 md:px-12 py-8 md:py-12 w-full max-w-md relative flex flex-col items-center" style={{ boxShadow: '0 8px 40px 0 rgba(79,70,229,0.10), 0 2px 16px 0 rgba(96,165,250,0.10)' }}>
                  <button
                    className="absolute top-5 right-5 text-gray-400 hover:text-blue-600 text-2xl"
                    onClick={() => setShowMyverseModal(false)}
                    aria-label="닫기"
                  >✕</button>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl font-extrabold text-blue-700">ZenGo</span>
                    <span className="text-xl font-extrabold text-yellow-400">Myverse</span>
                    <span className="ml-2 bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs font-bold border border-yellow-200">PREMIUM</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-4 leading-tight">
                    지금 성장하세요
                  </h2>
                  <p className="text-base md:text-lg text-gray-700 text-center mb-6 leading-relaxed font-medium">
                    좋은 글을 입력하고, 게임으로 즐기세요.
                  </p>
                  <ul className="w-full max-w-xs mx-auto flex flex-col gap-3 mb-10">
                    <li className="text-base text-gray-600 font-medium text-center">중요한 문장, 감동적인 문장</li>
                    <li className="text-base text-gray-600 font-medium text-center">새기고 싶은 문장</li>
                    <li className="text-base text-gray-600 font-medium text-center">매일 1 문장씩 성장하세요 !</li>
                  </ul>
                  <button
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold text-base shadow hover:from-blue-600 hover:to-blue-800 transition cursor-not-allowed"
                    disabled
                  >
                    <svg width="20" height="20" fill="none" viewBox="0 0 20 20" className="inline-block mr-1" style={{ color: '#FBBF24' }}><path fill="#FBBF24" d="M10 2a4 4 0 0 1 4 4v2h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2h1V6a4 4 0 0 1 4-4Zm0 2a2 2 0 0 0-2 2v2h4V6a2 2 0 0 0-2-2Zm-5 6v6h10v-6H5Z"/></svg>
                    프리미엄 가입 (곧 오픈 예정)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      );
  }

  // Fallback or error state
  return <div className="zengo-container"><p>ZenGo: 알 수 없는 상태입니다.</p></div>;
}

