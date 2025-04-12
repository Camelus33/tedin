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
  const handleNextGame = () => {
    // 결과 제출 관련 상태 초기화
    setHasSubmitted(false);
    
    const level = mapSizeToLevel(selectedBoardSize);
    const language = selectedLanguage;
    
    // Redux 액션을 순차적으로 실행
    console.log('다음 게임 시작...', { level, language });
    
    // Promise 체인을 사용하여 액션 순서 보장
    Promise.resolve()
      // 1. 현재 상태 확인 및 결과 평가
      .then(() => {
        console.log('1단계: 결과 평가');
        return dispatch(evaluateResult());
      })
      // 2. 결과 타입에 따라 다음 게임 준비 - 항상 새 콘텐츠로 진행
      .then(() => {
        console.log('2단계: 다음 게임 준비');
        return dispatch(prepareNextGame({ keepContent: false, keepPositions: false }));
      })
      // 3. 게임 상태 리셋 (shouldKeepContent 플래그는 유지)
      .then(() => {
        console.log('3단계: 게임 상태 초기화');
        return dispatch(resetGame({ preserveFlags: true }));
      })
      // 4. 새 설정 적용
      .then(() => {
        console.log('4단계: 새 설정 적용');
        return dispatch(setSettings({ level, language }));
      })
      // 5. 새 콘텐츠 요청
      .then(() => {
        console.log('5단계: 새 콘텐츠 요청');
        return dispatch(fetchContentThunk({ level, language, reshuffleWords: true }));
      })
      .then((result) => {
        console.log('다음 게임 준비 완료:', result);
      })
      .catch((error) => {
        console.error('다음 게임 준비 실패:', error);
        // 오류 발생 시 기본 설정으로 새 게임 시작
        dispatch(resetGame({ preserveFlags: false }));
        dispatch(setSettings({ level, language }));
        dispatch(fetchContentThunk({ level, language, reshuffleWords: true }));
      });
  };
  
  // 어순은 틀렸지만 단어는 모두 맞춘 경우 같은 문장으로 다시 시작하는 함수
  const handleRetrySameContent = () => {
    // 결과 제출 관련 상태 초기화
    setHasSubmitted(false);
    
    // 현재 콘텐츠가 있을 때만 처리
    if (currentContent) {
      console.log('같은 문항 반복하기 시작...', { 
        contentId: currentContent._id, 
        level: currentContent.level, 
        language: currentContent.language,
        resultType
      });
      
      try {
        // 1. 콘텐츠 정보를 세션 스토리지에 백업
        const contentToKeep = {
          _id: currentContent._id,
          level: currentContent.level,
          language: currentContent.language
        };
        sessionStorage.setItem('zengo_last_content', JSON.stringify(contentToKeep));
        
        // 2. 결과 평가 (이미 평가되었을 수 있음)
        dispatch(evaluateResult());
        
        // 3. 결과 타입에 따라 다른 동작 수행
        let reshufflePositions: boolean;
        let shouldFetchNewContent: boolean = false;
        
        if (resultType === 'EXCELLENT') {
          // EXCELLENT 결과인 경우 새로운 콘텐츠 가져오기
          console.log('EXCELLENT 결과: 새 콘텐츠 요청');
          shouldFetchNewContent = true;
          reshufflePositions = true; // 새 콘텐츠는 항상 재배치
        } else if (resultType === 'SUCCESS') {
          // SUCCESS 결과인 경우 같은 콘텐츠, 다른 위치
          console.log('SUCCESS 결과: 같은 콘텐츠, 새 위치 요청');
          reshufflePositions = true;
          shouldFetchNewContent = false;
        } else {
          // FAIL 결과인 경우 같은 콘텐츠, 같은 위치
          console.log('FAIL 결과: 같은 콘텐츠, 같은 위치 요청');
          reshufflePositions = false;
          shouldFetchNewContent = false;
        }
        
        // 4-6. Redux 액션 순차 실행 (Promise 체인 사용)
        // Redux Toolkit의 dispatch는 Promise를 반환하므로 체인 가능
        Promise.resolve()
          // 4. 게임 상태 초기화
          .then(() => {
            console.log('1단계: 게임 상태 초기화');
            return dispatch(resetGame({ onlyGameState: true }));
          })
          // 5. 세팅 설정 유지
          .then(() => {
            console.log('2단계: 세팅 설정 적용');
            return dispatch(setSettings({ 
              level: contentToKeep.level, 
              language: contentToKeep.language 
            }));
          })
          // 6. 콘텐츠 요청 (상태 업데이트 완료 후 실행)
          .then(() => {
            console.log('3단계: 콘텐츠 요청 시작', { shouldFetchNewContent, reshufflePositions });
            
            if (shouldFetchNewContent) {
              // 새 콘텐츠 요청 (EXCELLENT 결과)
              return dispatch(fetchContentThunk({ 
                level: contentToKeep.level, 
                language: contentToKeep.language, 
                reshuffleWords: true 
              }));
            } else {
              // 기존 콘텐츠 재사용 (SUCCESS/FAIL 결과)
              return dispatch(fetchContentThunk({ 
                level: contentToKeep.level, 
                language: contentToKeep.language, 
                contentId: contentToKeep._id,
                reshuffleWords: reshufflePositions
              }));
            }
          })
          .then((result) => {
            console.log('콘텐츠 로드 완료:', result);
          })
          .catch((error) => {
            console.error('재시작 프로세스 오류:', error);
            // 오류 발생 시 새 게임 시작
            if (currentContent) {
              dispatch(fetchContentThunk({ 
                level: currentContent.level, 
                language: currentContent.language, 
                reshuffleWords: true 
              }));
            }
          });
        
        console.log(`API 요청 진행 중: ${shouldFetchNewContent ? '새 콘텐츠' : '같은 콘텐츠'}, reshuffle=${reshufflePositions}`);
      } catch (error) {
        console.error('같은 문항 반복하기 오류:', error);
        // 오류 발생 시 새 게임 시작
        if (currentContent) {
          dispatch(fetchContentThunk({ 
            level: currentContent.level, 
            language: currentContent.language, 
            reshuffleWords: true 
          }));
        }
      }
    } else {
      console.warn('현재 콘텐츠가 없어 새 게임을 시작합니다.');
      // 세션 스토리지에서 마지막 콘텐츠 정보 복구
      try {
        const lastContent = sessionStorage.getItem('zengo_last_content');
        if (lastContent) {
          const { level, language, _id } = JSON.parse(lastContent);
          
          // Promise 체인으로 순차 실행
          Promise.resolve()
            .then(() => {
              return dispatch(setSettings({ level, language }));
            })
            .then(() => {
              // 기존 콘텐츠 ID가 있으면 그것을 사용하여 요청
              if (_id) {
                return dispatch(fetchContentThunk({ 
                  level, 
                  language, 
                  contentId: _id,
                  reshuffleWords: false 
                }));
              } else {
                // 콘텐츠 ID가 없으면 새 콘텐츠 요청
                return dispatch(fetchContentThunk({ 
                  level, 
                  language, 
                  reshuffleWords: true 
                }));
              }
            })
            .catch((error) => {
              console.error('세션 데이터 처리 오류:', error);
              // 기본 값으로 새 게임 시작
              dispatch(setSettings({ level: 'beginner', language: 'ko' }));
              dispatch(fetchContentThunk({ level: 'beginner', language: 'ko', reshuffleWords: true }));
            });
        } else {
          console.error('세션 스토리지에 저장된 콘텐츠 정보가 없습니다.');
          
          // 기본 레벨과 언어를 사용하여 새 게임 시작
          dispatch(setSettings({ level: 'beginner', language: 'ko' }));
          dispatch(fetchContentThunk({ 
            level: 'beginner', 
            language: 'ko', 
            reshuffleWords: true 
          }));
        }
      } catch (error) {
        console.error('세션 스토리지 처리 중 오류:', error);
        
        // 오류 처리 - 기본 값으로 새 게임 시작
        dispatch(setSettings({ level: 'beginner', language: 'ko' }));
        dispatch(fetchContentThunk({ level: 'beginner', language: 'ko', reshuffleWords: true }));
      }
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

  // --- Render Logic --- 

  // Intro Screen
  if (uiState === 'intro') {
  return (
    <div className="zengo-container">
      <div className="zengo-intro">
        <h1 className="intro-title">ZenGo : 기억 착수 - 해마자극 멘탈케어<br />
          <span className="intro-subtitle">바둑과 신경과학의 만남</span>
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
                  {/* Render ZengoStatusDisplay */}
                  <ZengoStatusDisplay 
                      usedStonesCount={usedStonesCount}
                      totalAllowedStones={currentContent.totalAllowedStones}
                      startTime={startTime}
                      gameState={gameState}
                      wordOrderCorrect={wordOrderCorrect}
                  />
                  {/* Debugging state info - can be removed */} 
                  {/* <p>Game State: {gameState}</p> */} 
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
                  <h2 className="settings-title">ZenGo 설정</h2>
                  
                  {/* 설정 페이지 소개 */}
                  <p className="settings-intro">
                      훈련 레벨과 언어를 선택하여 기억력 향상 훈련을 시작하세요.
                  </p>

                  {/* 보드 크기 선택 (Simplified) */}
                  <section className="settings-section">
                      <h3>훈련 레벨 선택</h3>
                      <div className="level-grid" role="radiogroup" aria-label="레벨 선택">
                          {[
                              { size: 3, label: '초급', desc: '기억력 기초 훈련 - 5분 세션 권장', icon: '🔰' },
                              { size: 5, label: '중급', desc: '집중력 강화 - 10분 세션 권장', icon: '⭐' },
                              { size: 7, label: '고급', desc: '고급 인지 능력 - 15분 세션 권장', icon: '🏆' }
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
                      </div>
                      {!selectedBoardSize && <p className="selection-guide">레벨을 선택해주세요</p>}
                  </section>
              
                  {/* 언어 선택 (Updated) */}
                  <section className="settings-section">
                      <h3>언어 선택</h3>
                      <div className="language-grid" role="radiogroup" aria-label="언어 선택">
                          {[
                              { code: 'ko', name: '한국어', flag: '🇰🇷' },
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

