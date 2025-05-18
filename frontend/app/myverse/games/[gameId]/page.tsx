"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/store/store';
import { setSettings, setContent, startGame, placeStone } from '@/store/slices/zengoSlice';
import { RootState } from '@/store/store';
import ZengoBoard from '@/components/zengo/ZengoBoard';
import { myverseApi } from '@/lib/api';
import type { ZengoProverbContent, GameState, BoardStoneData, InteractionMode as BoardInteractionMode, BoardSize } from '@/src/types/zengo';
import { useRouter } from 'next/navigation';

// Add type alias for word mappings
type WordMapping = ZengoProverbContent['wordMappings'][0];

interface AdapterProps {
  params: { gameId: string };
}

export default function Page({ params: { gameId } }: AdapterProps) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [gameData, setGameData] = useState<{ _id: string; collectionId: string; visibility?: 'private' | 'public' | 'group' } | null>(null);

  const { currentContent, gameState } = useSelector((state: RootState) => ({
    currentContent: state.zengoProverb.currentContent,
    gameState: state.zengoProverb.gameState,
  }));

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
    if (!gameData) return;
    try {
      // 최신 게임 데이터 가져오기
      const game = await myverseApi.getOne(gameData._id);
      // 좌표 섞기 (Fisher-Yates)
      const originalMappings = game.wordMappings;
      const coords = originalMappings.map((wm: WordMapping) => wm.coords);
      for (let i = coords.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [coords[i], coords[j]] = [coords[j], coords[i]];
      }
      const shuffledMappings = originalMappings.map((wm: WordMapping, idx: number) => ({ ...wm, coords: coords[idx] }));
      // 새로운 콘텐츠 객체 생성
      const content: ZengoProverbContent = {
        _id: game._id,
        collectionId: game.collectionId,
        level: `${game.boardSize}x${game.boardSize}-custom`,
        language: 'ko',
        boardSize: game.boardSize,
        proverbText: game.inputText,
        wordMappings: shuffledMappings,
        totalWords: shuffledMappings.length,
        totalAllowedStones: shuffledMappings.length + 2,
        initialDisplayTimeMs: 3000,
      };
      dispatch(setContent(content));
      dispatch(startGame());
    } catch (error) {
      console.error('Myverse 재실행 오류', error);
      alert('게임을 재시작하는 중 오류가 발생했습니다.');
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

  const stoneMapForBoard = useMemo((): BoardStoneData[] => {
    if (!currentContent?.wordMappings) return [];
    return currentContent.wordMappings.map(mapping => ({
      position: [mapping.coords.x, mapping.coords.y],
      value: mapping.word,
      color: 'black', // Default stone color
      visible: gameState === 'showing', // Only visible during 'showing' phase
      // Other fields like isNew, feedback, isHiding, memoryPhase, order can be added if needed by ZengoBoard
    }));
  }, [currentContent, gameState]);

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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <ZengoBoard
        boardSize={currentContent.boardSize as BoardSize}
        stoneMap={stoneMapForBoard}
        interactionMode={interactionModeForBoard}
        onIntersectionClick={handleBoardClick}
        isShowing={isShowingForBoard}
      />
      {(gameState === 'finished_success' || gameState === 'finished_fail') && (
        <div className="mt-4 p-4 bg-white rounded shadow-md text-center">
          <h3 className="text-xl font-semibold mb-2">Game Over!</h3>
          <p className="mb-1">Status: {gameState === 'finished_success' ? '성공' : '실패'}</p>
          {/* TODO: Display score from state.zengoProverb.lastResult?.score or similar */}
          {/* <p>Score: {useSelector((state: RootState) => state.zengoProverb.lastResult?.score)}</p> */}
          <div className="mt-3 space-x-2">
            <button onClick={handleRetrySameContent} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">Retry Game</button>
            <button onClick={handleNextGame} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">Next Game</button>
            <button onClick={handleBackToCollection} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors">Back to Collection</button>
          </div>
        </div>
      )}
    </div>
  );
} 