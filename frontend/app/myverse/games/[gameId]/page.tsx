"use client";

import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/store/store';
import { setSettings, setContent, startGame } from '@/store/slices/zengoSlice';
import ZengoPage from '@/app/zengo/page';
import { myverseApi } from '@/lib/api';
import type { ZengoProverbContent } from '@/src/types/zengo';
import { useRouter } from 'next/navigation';

// Add type alias for word mappings
type WordMapping = ZengoProverbContent['wordMappings'][0];

interface AdapterProps {
  params: { gameId: string };
}

export default function Page({ params: { gameId } }: AdapterProps) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [gameData, setGameData] = useState<{ _id: string; collectionId: string } | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const game = await myverseApi.getOne(gameId);
        setGameData(game);
        const content: ZengoProverbContent = {
          _id: game._id,
          level: `${game.boardSize}x${game.boardSize}-custom`,
          language: 'ko',
          boardSize: game.boardSize,
          proverbText: game.inputText,
          wordMappings: game.wordMappings,
          totalWords: game.wordMappings.length,
          totalAllowedStones: game.wordMappings.length + 2,
          initialDisplayTimeMs: 3000,
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
    if (!gameData) return;
    try {
      // 서버에서 컬렉션 내 게임 목록과 커서를 포함한 응답을 받아옵니다.
      const response = await myverseApi.getByCollection(gameData.collectionId);
      const games = response.games; // 배열 형태의 게임 목록
      // 현재 게임의 인덱스를 찾아 다음 게임으로 이동합니다.
      const idx = games.findIndex((g: { _id: string }) => g._id === gameId);
      if (idx !== -1 && idx < games.length - 1) {
        router.push(`/myverse/games/${games[idx + 1]._id}`);
      } else {
        alert('다른 게임이 없습니다.');
      }
    } catch (error) {
      console.error('다음 게임 로드 오류', error);
      alert('다음 게임을 불러오는 중 오류가 발생했습니다.');
    }
  };

  // 콜렉션 페이지로 돌아가기
  const handleBackToCollection = () => {
    if (gameData) {
      router.push(`/myverse/${gameData.collectionId}`);
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

  return (
    <ZengoPage
      initialUiState="selection"
      onNextGame={handleNextGame}
      onRetrySameContent={handleRetrySameContent}
      onBackToIntro={handleBackToCollection}
    />
  );
} 