import { useState, useEffect, useCallback } from 'react';

// API 함수의 응답 타입 정의 (백엔드 응답 형식과 일치)
interface PaginatedResponse<T> {
  games: T[];
  nextCursor: string | null;
}

// API 함수 시그니처 정의
type ApiFunction<T, P> = (params: P) => Promise<PaginatedResponse<T>>;

// 커스텀 훅의 반환 타입 정의
interface UsePaginatedGamesReturn<T> {
  games: T[];
  isLoading: boolean; // 초기 로딩 상태
  isPaginating: boolean; // 페이지네이션 로딩 상태 (더보기)
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  reset: () => void; // 상태 리셋 함수 (탭/필터 변경 시 유용)
}

// 커스텀 훅 구현
function usePaginatedGames<T, P extends { limit?: number; cursor?: string }>(
  apiFunction: ApiFunction<T, P>,
  initialParams: Omit<P, 'cursor'> & { limit?: number }, // 초기 파라미터 (cursor 제외)
  enabled: boolean = true // 훅 활성화 여부 (탭 전환 등에 사용)
): UsePaginatedGamesReturn<T> {
  const [games, setGames] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaginating, setIsPaginating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const limit = initialParams.limit || 12; // 기본 limit

  // 데이터 로드 함수 ( useCallback으로 메모이제이션)
  const loadData = useCallback(async (cursor?: string) => {
    const currentParams = { ...initialParams, limit, cursor } as P;

    if (cursor) {
      setIsPaginating(true);
    } else {
      setIsLoading(true);
      setGames([]); // 초기 로드 시 기존 데이터 클리어
      setError(null);
      setNextCursor(null);
      setHasMore(false);
    }

    try {
      const response = await apiFunction(currentParams);
      setGames(prev => (cursor ? [...prev, ...response.games] : response.games));
      setNextCursor(response.nextCursor);
      setHasMore(!!response.nextCursor);
    } catch (err: any) {
      console.error('Error fetching paginated data:', err);
      setError(err.message || '데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      if (cursor) {
        setIsPaginating(false);
      } else {
        setIsLoading(false);
      }
    }
  }, [apiFunction, initialParams, limit]); // 종속성 배열에 apiFunction과 initialParams 추가

  // 초기 데이터 로드 및 파라미터 변경 시 재로드
  useEffect(() => {
    if (enabled) {
      loadData(); // 초기 로드 (cursor 없음)
    } else {
      // 비활성화 시 상태 리셋
      setGames([]);
      setIsLoading(false);
      setIsPaginating(false);
      setError(null);
      setNextCursor(null);
      setHasMore(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, loadData]); // enabled 상태 또는 loadData 함수(파라미터 변경 시) 변경 시 재실행

  // 더보기 함수
  const loadMore = useCallback(() => {
    if (nextCursor && !isPaginating && !isLoading) {
      loadData(nextCursor);
    }
  }, [nextCursor, isPaginating, isLoading, loadData]);

  // 상태 리셋 함수
  const reset = useCallback(() => {
      setGames([]);
      setIsLoading(false);
      setIsPaginating(false);
      setError(null);
      setNextCursor(null);
      setHasMore(false);
      // Optionally trigger initial load again if needed, or let useEffect handle it based on 'enabled'
      // if (enabled) loadData(); 
  }, [/* No dependencies needed if it just resets state */]);


  return {
    games,
    isLoading,
    isPaginating,
    error,
    hasMore,
    loadMore,
    reset
  };
}

export default usePaginatedGames; 