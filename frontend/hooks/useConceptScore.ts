import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/apiClient';

interface ConceptUnderstandingScore {
  totalScore: number;
  breakdown: {
    thoughtExpansion: number;
    memoEvolution: number;
    knowledgeConnection: number;
    flashcardCreation: number;
    tagUtilization: number;
    userRating: number;
  };
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  recommendations: string[];
}

interface ConceptScoreResponse {
  noteId: string;
  conceptUnderstandingScore: ConceptUnderstandingScore;
  lastUpdated: string;
  calculationVersion: string;
  performanceMetrics: {
    calculationTime: number;
    memoryUsage: number;
  };
}

interface UpdateScoreRequest {
  action: 'add_thought' | 'evolve_memo' | 'add_connection' | 'create_flashcard' | 'add_tag' | 'update_rating';
  data: any;
}

export const useConceptScore = (noteId: string) => {
  const [score, setScore] = useState<ConceptUnderstandingScore | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // 점수 조회
  const fetchScore = useCallback(async () => {
    if (!noteId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get(`/notes/${noteId}/concept-score`);
      
      if (response.data && response.data.conceptUnderstandingScore) {
        setScore(response.data.conceptUnderstandingScore);
        setLastUpdated(response.data.lastUpdated);
      } else {
        console.warn('API 응답에 conceptUnderstandingScore가 없습니다:', response.data);
        setError('점수 데이터를 찾을 수 없습니다.');
      }
    } catch (err: any) {
      // 404 에러는 조용히 처리 (노트가 존재하지 않거나 concept-score가 지원되지 않는 경우)
      if (err.status === 404) {
        console.warn('Concept score not available for note:', noteId);
        return;
      }
      console.error('개념이해도 점수 조회 실패:', err);
      setError('점수를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [noteId]);

  // 점수 업데이트
  const updateScore = useCallback(async (action: string, data: any) => {
    if (!noteId) return;

    setLoading(true);
    setError(null);

    try {
      const requestData: UpdateScoreRequest = {
        action: action as any,
        data
      };

      const response = await apiClient.post(`/notes/${noteId}/update-score`, requestData);
      
      // 업데이트된 점수로 상태 갱신
      if (response.data && response.data.conceptScore) {
        setScore(response.data.conceptScore);
        setLastUpdated(response.data.lastUpdated);
      } else {
        console.warn('업데이트 응답에 conceptScore가 없습니다:', response.data);
        setError('업데이트된 점수 데이터를 찾을 수 없습니다.');
      }
      
      return response.data;
    } catch (err) {
      console.error('개념이해도 점수 업데이트 실패:', err);
      setError('점수 업데이트에 실패했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [noteId]);

  // 액션별 업데이트 함수들
  const addThought = useCallback(async (thoughtData: any) => {
    return updateScore('add_thought', thoughtData);
  }, [updateScore]);

  const evolveMemo = useCallback(async (evolutionData: any) => {
    return updateScore('evolve_memo', evolutionData);
  }, [updateScore]);

  const addConnection = useCallback(async (connectionData: any) => {
    return updateScore('add_connection', connectionData);
  }, [updateScore]);

  const createFlashcard = useCallback(async (flashcardData: any) => {
    return updateScore('create_flashcard', flashcardData);
  }, [updateScore]);

  const addTag = useCallback(async (tagData: any) => {
    return updateScore('add_tag', tagData);
  }, [updateScore]);

  const updateRating = useCallback(async (ratingData: any) => {
    return updateScore('update_rating', ratingData);
  }, [updateScore]);

  // 액션 핸들러
  const handleAction = useCallback(async (action: string, data?: any) => {
    switch (action) {
      case 'add_thought':
        return addThought(data);
      case 'evolve_memo':
        return evolveMemo(data);
      case 'add_connection':
        return addConnection(data);
      case 'create_flashcard':
        return createFlashcard(data);
      case 'add_tag':
        return addTag(data);
      case 'update_rating':
        return updateRating(data);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }, [addThought, evolveMemo, addConnection, createFlashcard, addTag, updateRating]);

  return {
    score,
    loading,
    error,
    lastUpdated,
    fetchScore,
    updateScore,
    handleAction,
    // 개별 액션 함수들
    addThought,
    evolveMemo,
    addConnection,
    createFlashcard,
    addTag,
    updateRating
  };
}; 