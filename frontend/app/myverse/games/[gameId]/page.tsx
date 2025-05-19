"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/store/store';
import { setSettings, setContent, startGame, placeStone, hideWords, evaluateResultThunk, submitResultThunk } from '@/store/slices/zengoSlice';
import { RootState } from '@/store/store';
import ZengoBoard from '@/components/zengo/ZengoBoard';
import { myverseApi } from '@/lib/api';
import type { ZengoProverbContent, GameState, BoardStoneData, InteractionMode as BoardInteractionMode, BoardSize } from '@/src/types/zengo';
import { useRouter, useParams } from 'next/navigation';
import ZengoStatusDisplay from '@/components/zengo/ZengoStatusDisplay';
import ZengoResultPage from '@/components/zengo/ZengoResultPage';

// Add type alias for word mappings
type WordMapping = ZengoProverbContent['wordMappings'][0];

export default function Page() {
  const { gameId } = useParams() as { gameId: string };
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [gameData, setGameData] = useState<{ _id: string; collectionId: string; visibility?: 'private' | 'public' | 'group' } | null>(null);
  // 로컬 상태: 결과 제출 중복 방지를 위한 플래그
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const { currentContent, gameState, usedStonesCount, startTime, revealedWords } = useSelector((state: RootState) => ({
    currentContent: state.zengoProverb.currentContent,
    gameState: state.zengoProverb.gameState,
    usedStonesCount: state.zengoProverb.usedStonesCount,
    startTime: state.zengoProverb.startTime,
    revealedWords: state.zengoProverb.revealedWords,
  }));

  // stoneMapForBoard 생성 로직을 젠고 기본과 동일하게 리팩터링
  // showing 상태: 단어가 보임, playing 상태: 돌이 사라짐, placedStones에 따라 돌/피드백 표시
  const placedStones = useSelector((state: RootState) => state.zengoProverb.placedStones);
  const lastResult = useSelector((state: RootState) => state.zengoProverb.lastResult);
  const resultType = useSelector((state: RootState) => state.zengoProverb.resultType);

  const stoneMapForBoard = useMemo((): BoardStoneData[] => {
    if (!currentContent?.wordMappings) return [];
    const map = new Map<string, BoardStoneData>();
    // showing 상태: 단어가 보임
    if (gameState === 'showing') {
      currentContent.wordMappings.forEach(mapping => {
        const key = `${mapping.coords.x},${mapping.coords.y}`;
        map.set(key, {
          position: [mapping.coords.x, mapping.coords.y],
          value: mapping.word,
          color: 'black',
          visible: true,
        });
      });
    }
    // playing 상태: placedStones에 따라 돌/피드백 표시
    if (gameState === 'playing' || gameState === 'finished_success' || gameState === 'finished_fail') {
      placedStones.forEach((placed, idx) => {
        const key = `${placed.x},${placed.y}`;
        let value: string | number = '';
        let color: 'black' | 'white' = 'black';
        const feedback = placed.correct === true ? 'correct' : (placed.correct === false ? 'incorrect' : undefined);
        // 정답 위치에 단어 표시, 오답은 X 표시
        const originalWordMapping = currentContent.wordMappings.find(
          m => m && m.coords && m.coords.x === placed.x && m.coords.y === placed.y
        );
        if (originalWordMapping && placed.correct) {
          value = originalWordMapping.word;
          color = 'black';
        } else if (placed.correct === false) {
          value = 'X';
          color = 'white';
        }
        map.set(key, {
          position: [placed.x, placed.y],
          value,
          color,
          visible: true,
          isNew: idx === placedStones.length - 1,
          feedback,
        });
      });
    }
    return Array.from(map.values());
  }, [currentContent, gameState, placedStones]);

  useEffect(() => {
    async function init() {
      try {
        const game = await myverseApi.getOne(gameId);
        setGameData(game);
        const content: ZengoProverbContent = {
          _id: game._id,
          collectionId: game.collectionId,
          level: `${game.boardSize}x${game.boardSize}-custom`,
          language: 'ko',
          boardSize: game.boardSize,
          proverbText: game.inputText,
          wordMappings: game.wordMappings,
          totalWords: game.wordMappings.length,
          totalAllowedStones: game.wordMappings.length + 2,
          initialDisplayTimeMs: 15000,
        };
        dispatch(setSettings({ level: content.level, language: content.language }));
        dispatch(setContent(content));
        dispatch(startGame());
      } catch (err) {
        console.error('Myverse adapter init error', err);
      }
    }
    init();
  }, [dispatch, gameId]);

  // 자동 단어 숨김 타이머:
  // showing 상태가 되면 initialDisplayTimeMs 만큼 대기 후 hideWords 액션을 디스패치하여 단어를 숨기고 playing 상태로 전환
  useEffect(() => {
    if (gameState === 'showing' && currentContent) {
      const timer = setTimeout(() => {
        dispatch(hideWords());
      }, currentContent.initialDisplayTimeMs);
      return () => clearTimeout(timer);
    }
  }, [gameState, currentContent, dispatch]);

  // 게임 종료 감지 및 결과 처리:
  // playing 상태에서 단어 찾기 또는 돌 소진 조건을 판정한 뒤,
  // evaluateResultThunk로 최종 결과를 평가하고 submitResultThunk로 서버에 제출
  useEffect(() => {
    if (gameState === 'playing' && currentContent && !hasSubmitted) {
      const success = currentContent.wordMappings.length === revealedWords.length;
      const failed = usedStonesCount >= currentContent.totalAllowedStones && !success;
      if (success || failed) {
        // 결과 평가(Thunk) 호출
        dispatch(evaluateResultThunk()).then(() => {
          // 평가 완료 후 서버에 결과 제출
          dispatch(submitResultThunk());
          setHasSubmitted(true);
        });
      }
    }
  }, [gameState, currentContent, revealedWords, usedStonesCount, dispatch, hasSubmitted]);

  // 현재 게임 기준으로 같은 콜렉션 내 다음 게임 실행
  const handleNextGame = async () => {
    console.log('handleNextGame triggered'); // 함수 호출 확인
    if (!gameData) {
        console.log('handleNextGame: gameData is null');
        return;
    }
    console.log('handleNextGame: Current gameData:', gameData);
    
    try {
      console.log(`handleNextGame: Fetching games for collection ${gameData.collectionId}`);
      // 서버에서 컬렉션 내 게임 목록과 커서를 포함한 응답을 받아옵니다.
      // TODO: Consider if pagination affects finding the next game. Fetch all?
      const response = await myverseApi.getByCollection(gameData.collectionId);
      console.log('handleNextGame: API response received:', response);
      
      // 응답 구조 확인 (games 배열이 있는지)
      if (!response || !Array.isArray(response.games)) {
        console.error('handleNextGame: Invalid API response structure. Expected { games: [...] }', response);
        alert('다음 게임 목록을 가져오는 데 실패했습니다. (응답 오류)');
        return;
      }
      
      const games = response.games; // 배열 형태의 게임 목록
      console.log('handleNextGame: Games in collection:', games);
      
      // 현재 게임의 인덱스를 찾아 다음 게임으로 이동합니다.
      const idx = games.findIndex((g: { _id: string }) => g._id === gameId);
      console.log(`handleNextGame: Current game index: ${idx} (for gameId: ${gameId})`);

      // Check if the current game was found in the list
      if (idx === -1) {
        console.log('handleNextGame: Current game not found in the collection list!');
        alert('현재 게임을 컬렉션 목록에서 찾을 수 없습니다.');
        return; // Stop execution if current game is not found
      }

      // Calculate the next game index, wrapping around to the beginning if at the end
      const nextIdx = (idx + 1) % games.length;
      console.log(`handleNextGame: Calculated next game index: ${nextIdx}`);

      // Ensure there's actually another game (list might contain only one game)
      // Also ensures we don't navigate to the same game if there's only one
      if (games.length > 1) { 
          const nextGameId = games[nextIdx]._id;
          console.log(`handleNextGame: Found next game (wrapping around if needed). Navigating to /myverse/games/${nextGameId}`);
          router.push(`/myverse/games/${nextGameId}`);
      } else {
          console.log('handleNextGame: No other games in this collection (only one game exists).');
          alert('다른 게임이 없습니다.'); // Keep the same message for the user
      }
    } catch (error) {
      console.error('handleNextGame: 다음 게임 로드 오류', error);
      alert('다음 게임을 불러오는 중 오류가 발생했습니다.');
    }
  };

  // 콜렉션 페이지로 돌아가기
  const handleBackToCollection = () => {
    if (gameData) {
      // If this game is a 'group' (shared) game, navigate to the Shared Games tab
      if (gameData.visibility === 'group') {
        router.push('/myverse?tab=sharedGames');
      } else {
        // Otherwise return to its original collection page
        router.push(`/myverse/${gameData.collectionId}`);
      }
    }
  };

  // 어순은 틀렸지만 모든 단어를 맞춘 경우 같은 문장 다른 위치로 재실행
  const handleRetrySameContent = async () => {
    setHasSubmitted(false); // P2: Reset submission flag

    if (!gameData || !currentContent) {
      console.warn("Myverse 재실행 오류: 게임 데이터 또는 현재 콘텐츠 없음");
      alert('게임을 재시작하는 중 오류가 발생했습니다.');
      return;
    }

    // P1: resultType에 따라 분기
    if (resultType === 'FAIL') {
      // 실패 시: 같은 위치로 다시 도전
      // 필요한 게임 상태만 초기화하고 같은 콘텐츠로 게임 재시작
      // zengoSlice에 placéStones, usedStonesCount, startTime, revealedWords 등을 리셋하는 액션 필요
      // 예시: dispatch(resetGameAttempt()); 또는 startGame()이 이를 처리한다면 그대로 사용
      console.log('Retrying MyVerse game (FAIL): Same content, same positions.');
      // 중요: currentContent는 그대로 유지, wordMappings도 셔플하지 않음
      // dispatch(setContent(currentContent)); // 콘텐츠는 이미 설정되어 있으므로 재설정 불필요할 수 있음
      dispatch(startGame()); // startGame이 게임 상태(돌, 시간 등)를 초기화한다고 가정
    } else if (resultType === 'SUCCESS') {
      // 성공 시 (어순 틀림): 같은 문장, 다른 위치로 도전
      console.log('Retrying MyVerse game (SUCCESS): Same content, new positions.');
      try {
        const game = await myverseApi.getOne(gameData._id); // Get original game data for shuffling
        const originalMappings = game.wordMappings;
        const coords = originalMappings.map((wm: WordMapping) => wm.coords);
        // Fisher-Yates shuffle
        for (let i = coords.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [coords[i], coords[j]] = [coords[j], coords[i]];
        }
        const shuffledMappings = originalMappings.map((wm: WordMapping, idx: number) => ({ ...wm, coords: coords[idx] }));
        
        const newShuffledContent: ZengoProverbContent = {
          ...currentContent, // 기존 콘텐츠 정보 유지 (ID, collectionId, level, language, boardSize, proverbText 등)
          _id: game._id, // Ensure _id is from the fetched game, though currentContent._id should be same
          collectionId: game.collectionId, // Ensure collectionId is consistent
          wordMappings: shuffledMappings,
          // totalWords, totalAllowedStones, initialDisplayTimeMs 등은 currentContent에서 오거나,
          // game.wordMappings.length 기준으로 재계산될 수 있음. 여기서는 currentContent 기반으로 유지.
          totalWords: shuffledMappings.length, 
          totalAllowedStones: shuffledMappings.length + currentContent.totalAllowedStones - currentContent.totalWords, // 비례적으로 조정 또는 고정값
        };
        dispatch(setContent(newShuffledContent));
        dispatch(startGame());
      } catch (error) {
        console.error('Myverse 재실행 오류 (SUCCESS, shuffle):', error);
        alert('게임을 재시작하는 중 오류가 발생했습니다.');
      }
    } else {
      // 기타 경우 (예: EXCELLENT인데 재시도 버튼이 눌린 경우 - 현재 UI상으로는 발생 안 함)
      // 기본적으로 새 게임을 시작하거나 컬렉션으로 돌아가는 등의 폴백 처리
      console.warn(`Myverse 재실행: 예상치 못한 resultType (${resultType}). 컬렉션으로 돌아갑니다.`);
      handleBackToCollection();
      return;
    }
  };

  const handleBoardClick = (position: [number, number]) => {
    if (interactionModeForBoard === 'click') {
      dispatch(placeStone({ x: position[0], y: position[1] }));
    }
  };

  // Derived states for ZengoBoard
  const interactionModeForBoard = useMemo((): BoardInteractionMode => {
    if (gameState === 'playing') return 'click';
    if (gameState === 'showing' || gameState === 'finished_success' || gameState === 'finished_fail') return 'view';
    return 'view'; // Default to view or disabled
  }, [gameState]);

  const isShowingForBoard = useMemo(() => {
    return gameState === 'showing';
  }, [gameState]);

  // Game End Logic
  useEffect(() => {
    if (gameState === 'finished_success' || gameState === 'finished_fail') { 
      console.log('Game has ended. State:', gameState);
      // Result UI is now part of the return statement
    }
  }, [gameState]); // Removed unused dependencies

  if (!currentContent) { 
    return <div className="flex items-center justify-center min-h-screen">Loading game data...</div>;
  }
  
  if (!currentContent.boardSize) { // Check specifically for boardSize after currentContent is loaded
    return <div className="flex items-center justify-center min-h-screen">Loading board configuration...</div>;
  }

  // 젠고 기본과 동일한 레이아웃: 바둑판 좌측 상단에 상태 카드, 우측에 보드
  return (
    <div className="zengo-container flex flex-row items-start justify-center min-h-screen bg-gray-100 p-4 relative">
      {/* 상태/타이머 UI: 바둑판 좌측 상단에 고정 */}
      <div className="absolute left-0 top-0 mt-8 ml-8 z-10">
        <ZengoStatusDisplay
          usedStonesCount={usedStonesCount}
          totalAllowedStones={currentContent.totalAllowedStones}
          startTime={startTime}
          gameState={gameState}
        />
      </div>
      {/* 바둑판 */}
      <div className="flex flex-col items-center justify-center w-full">
        <ZengoBoard
          boardSize={currentContent.boardSize as BoardSize}
          stoneMap={stoneMapForBoard}
          interactionMode={interactionModeForBoard}
          onIntersectionClick={handleBoardClick}
          isShowing={isShowingForBoard}
        />
      </div>
      {/* 게임 종료 시 젠고 기본과 동일한 결과 페이지 표시 */}
      {(gameState === 'finished_success' || gameState === 'finished_fail' || gameState === 'submitting') && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-20">
          <ZengoResultPage
            result={lastResult}
            resultType={resultType}
            error={null}
            onNextGame={handleNextGame}
            onRetrySameContent={handleRetrySameContent}
            onBackToIntro={handleBackToCollection}
          />
        </div>
      )}
    </div>
  );
} 