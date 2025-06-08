import axios, { AxiosError, AxiosResponse } from 'axios';
import { IMyVerseSessionResult } from '@/src/types/zengo'; // Corrected import path

// 베이스 URL을 API 호스트로 변경
const API_HOST = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'; // Changed variable name and removed /api from fallback

// Default timeout for all requests (ms)
const DEFAULT_TIMEOUT = 10000; // 10 seconds

// Error messages
export const API_ERRORS = {
  NETWORK_ERROR: '네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해주세요.',
  TIMEOUT_ERROR: '서버 응답이 너무 오래 걸립니다. 나중에 다시 시도해주세요.',
  AUTH_ERROR: '로그인이 필요하거나 세션이 만료되었습니다.',
  SERVER_ERROR: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  NOT_FOUND: '요청한 리소스를 찾을 수 없습니다.',
  UNKNOWN_ERROR: '알 수 없는 오류가 발생했습니다.',
};

// Create axios instance with configuration
const api = axios.create({
  baseURL: `${API_HOST}/api`, // Ensure the /api prefix is always present for axios instances
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: DEFAULT_TIMEOUT,
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage in client side
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: any) => {
    // Handle canceled requests
    if (axios.isCancel(error)) {
      const abortError = new Error('ABORTED');
      console.log('Request aborted:', error?.message || 'No reason provided');
      return Promise.reject(abortError);
    }

    // Handle network errors (no internet connection)
    if (error?.message === 'Network Error') {
      const networkError = new Error(API_ERRORS.NETWORK_ERROR);
      return Promise.reject(networkError);
    }

    // Handle API errors based on status code
    if (error?.response && typeof error.response === 'object') {
      const { status } = error.response;
      
      switch (status) {
        case 401:
          return Promise.reject(new Error(API_ERRORS.AUTH_ERROR));
        case 404:
          return Promise.reject(new Error(API_ERRORS.NOT_FOUND));
        case 500:
        case 502:
        case 503:
        case 504:
          return Promise.reject(new Error(API_ERRORS.SERVER_ERROR));
        default:
          // Get error message from response if available
          const errorMessage = error.response?.data?.message || 
                              error.response?.data?.error || 
                              `Error ${status}`;
          return Promise.reject(new Error(errorMessage));
      }
    }

    // Fallback for other error types
    const message = error?.message || 'Unknown error occurred';
    return Promise.reject(new Error(message));
  }
);

/**
 * Higher-order function that adds retry logic to an API call
 */
export const withRetry = async <T>(
  fn: () => Promise<T>,
  {
    retries = 3,
    initialDelay = 500,
    excludedErrors = [API_ERRORS.AUTH_ERROR, API_ERRORS.NOT_FOUND, 'ABORTED'],
  }: {
    retries?: number;
    initialDelay?: number;
    excludedErrors?: string[];
  } = {}
): Promise<T> => {
  let lastError: any;
  let attempt = 0;

  while (attempt <= retries) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const errorMessage = error?.message || 'Unknown error';

      // Don't retry on certain errors
      if (excludedErrors.some(excluded => errorMessage.includes(excluded))) {
        console.log(`Not retrying due to excluded error: ${errorMessage}`);
        throw error;
      }

      // If we've exhausted our retries, throw the last error
      if (attempt >= retries) {
        console.log(`All ${retries} retries exhausted`);
        throw lastError;
      }

      // Calculate backoff delay with jitter
      const delay = initialDelay * Math.pow(2, attempt) * (0.8 + Math.random() * 0.4);
      
      // Log retry information
      console.log(`API call failed (attempt ${attempt + 1}/${retries + 1}): ${errorMessage}`);
      console.log(`Retrying in ${Math.round(delay)}ms...`);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
      attempt++;
    }
  }

  // This should never happen but TypeScript requires a return value
  throw lastError;
};

/**
 * Helper function to safely execute fetch requests with proper AbortError handling
 * Use this wrapper when making direct fetch calls outside the axios instance
 */
export const safeFetch = async <T>(
  fetchFn: () => Promise<T>,
  errorHandler?: (error: any) => void
): Promise<T | null> => {
  try {
    return await fetchFn();
  } catch (error: any) {
    // Don't propagate AbortError - it's expected when components unmount
    if (error.name === 'AbortError') {
      console.log('Fetch request aborted');
      return null;
    }
    
    // Let the caller handle other errors if they provided a handler
    if (errorHandler) {
      errorHandler(error);
    } else {
      console.error('Fetch error:', error);
    }
    
    throw error;
  }
};

// Auth API
export const auth = {
  register: async (email: string, password: string, nickname: string, inviteCode?: string) => {
    const response = await api.post('/auth/register', { email, password, nickname, inviteCode });
    return response.data;
  },
  
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    // Store token in localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
  },
  
  resetPassword: async (email: string) => {
    const response = await api.post('/auth/reset-password', { email });
    return response.data;
  },
};

// User API
export const user = {
  updateProfile: async (userId: string, data: { nickname?: string, profileImage?: string }) => {
    const response = await api.put(`/users/${userId}`, data);
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },
  
  getSettings: async () => {
    const response = await api.get('/users/settings');
    return response.data;
  },
  
  updateSettings: async (settings: any) => {
    const response = await api.put('/users/settings', settings);
    return response.data;
  },
  
  uploadProfileImage: async (file: File) => {
    const formData = new FormData();
    formData.append('profileImage', file);
    
    const response = await api.post('/users/profile-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Books API
export const books = {
  getAll: async (options?: { signal?: AbortSignal }) => {
    return withRetry(async () => {
      const response = await api.get('/books', { signal: options?.signal });
      return response.data;
    });
  },
  
  getById: async (id: string, options?: { signal?: AbortSignal }) => {
    return withRetry(async () => {
      const response = await api.get(`/books/${id}`, { signal: options?.signal });
      return response.data;
    });
  },
  
  create: async (bookData: any) => {
    const response = await api.post('/books', bookData);
    return response.data;
  },
  
  update: async (id: string, bookData: any) => {
    // The server only has a specific endpoint for updating book progress
    const response = await api.put(`/books/${id}/progress`, bookData);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/books/${id}`);
    return response.data;
  },
};

// Notes API
export const notes = {
  getByBookId: async (bookId: string) => {
    return withRetry(async () => {
      const response = await api.get(`/notes?bookId=${bookId}`);
      return response.data;
    });
  },
  
  create: async (noteData: any) => {
    const response = await api.post('/notes', noteData);
    return response.data;
  },
  
  update: async (id: string, noteData: any) => {
    const response = await api.put(`/notes/${id}`, noteData);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/notes/${id}`);
    return response.data;
  },
};

// TS Sessions API
export const sessions = {
  create: async (sessionData: any) => {
    const response = await api.post('/sessions', sessionData);
    return response.data;
  },
  
  getByBookId: async (bookId: string) => {
    return withRetry(async () => {
      const response = await api.get(`/sessions?bookId=${bookId}`);
      return response.data;
    });
  },
  
  getAll: async () => {
    const response = await api.get('/sessions');
    return response.data;
  },
  
  update: async (id: string, sessionData: any) => {
    const response = await api.put(`/sessions/${id}`, sessionData);
    return response.data;
  },
};

// Zengo API
export const zengo = {
  // 젠고 활동 목록 가져오기
  getAll: async () => {
    const response = await api.get('/zengo');
    return response.data;
  },
  
  // 특정 젠고 세션 상세 조회
  getById: async (id: string) => {
    const response = await api.get(`/zengo/${id}`);
    return response.data;
  },
  
  // 젠고 활동 결과 조회
  getResults: async (id: string) => {
    const response = await api.get(`/zengo/${id}/results`);
    return response.data;
  },
  
  // 젠고 세션 생성
  create: async (data: { boardSize: number, moduleType: string }) => {
    const response = await api.post('/zengo/start', data);
    return response.data;
  },
  
  // 젠고 세션 진행 중 모듈 결과 업데이트
  updateModule: async (id: string, moduleResults: any) => {
    const response = await api.put(`/zengo/${id}/module`, moduleResults);
    return response.data;
  },
  
  // 젠고 세션 완료
  complete: async (id: string, results: any) => {
    const response = await api.post(`/zengo/${id}/complete`, results);
    return response.data;
  },
  
  // 젠고 세션 취소
  cancel: async (id: string) => {
    const response = await api.post(`/zengo/${id}/cancel`);
    return response.data;
  },
  
  // 사용자의 젠고 통계 조회
  getUserStats: async () => {
    const response = await api.get('/zengo/stats');
    return response.data;
  },
  
  // 인지 능력 프로필 조회
  getCognitiveProfile: async (period: 'all' | 'week' | 'month' | 'year' = 'month', limit?: number) => {
    const params = new URLSearchParams();
    params.append('period', period);
    if (limit) params.append('limit', limit.toString());
    
    return withRetry(async () => {
      const response = await api.get(`/zengo/cognitive-profile?${params.toString()}`);
      return response.data;
    });
  },
  
  // 젠고 리더보드 조회
  getLeaderboard: async (limit: number = 10) => {
    const response = await api.get(`/leaderboard/zengo?limit=${limit}`);
    return response.data;
  }
};

// Leaderboard API
export const leaderboard = {
  getTopReaders: async (limit = 10) => {
    const response = await api.get(`/leaderboard/readers?limit=${limit}`);
    return response.data;
  },
  
  getTopZengo: async (limit = 10) => {
    const response = await api.get(`/leaderboard/zengo?limit=${limit}`);
    return response.data;
  },
};

// Badges API
export const badges = {
  getAll: async () => {
    const response = await api.get('/badges');
    return response.data;
  },
};

// Invite API
export const invites = {
  create: async () => {
    const response = await api.post('/invites');
    return response.data;
  },
  
  verify: async (code: string) => {
    const response = await api.get(`/invites/verify/${code}`);
    return response.data;
  },
};

// Type definition for the data sent to the MyVerse result endpoint
interface SubmitMyVerseResultPayload {
  myVerseGameId: string;
  collectionId?: string;
  level: string;
  language?: string;
  usedStonesCount: number;
  correctPlacements: number;
  incorrectPlacements: number;
  timeTakenMs: number;
  completedSuccessfully: boolean;
  resultType: 'EXCELLENT' | 'SUCCESS' | 'FAIL';
}

// Zengo Proverb Game API (NEW)
export const zengoProverbApi = {
  fetchContent: async (params: { level: string; lang: string; contentId?: string; reshuffle?: boolean }) => {
      const queryParams = new URLSearchParams({
          level: params.level,
          lang: params.lang,
          reshuffle: params.reshuffle ? 'true' : 'false',
          random: Date.now().toString()
      });
      if (params.contentId) {
          queryParams.append('contentId', params.contentId);
      }
      const response = await api.get(`/zengo/proverb-content?${queryParams.toString()}`);
      return response.data;
  },
};

// Collection API
export const collectionsApi = {
  getAll: async () => {
    const response = await api.get('/collections');
    return response.data;
  },
  // 컬렉션 메타데이터 단일 조회
  getById: async (id: string) => {
    const response = await api.get(`/collections/${id}`);
    return response.data;
  },
  create: async (data: { name: string; type?: string; visibility?: string }) => {
    const response = await api.post('/collections', data);
    return response.data;
  },
  update: async (id: string, data: { name?: string; type?: string; visibility?: string }) => {
    const response = await api.put(`/collections/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/collections/${id}`);
    return id;
  },
  // 공개 컬렉션 조회
  getPublic: async () => {
    const response = await api.get('/collections/public');
    return response.data;
  },
};

// Myverse Game API
export const myverseApi = {
  getByCollection: async (collectionId: string) => {
    const response = await api.get(`/myverse/collections/${collectionId}/games`);
    return response.data;
  },
  create: async (
    collectionId: string,
    payload: { title: string; inputText: string; wordMappings: any[]; boardSize: number; visibility?: string; sharedWith?: string[] }
  ) => {
    const response = await api.post(`/myverse/collections/${collectionId}/games`, payload);
    return response.data;
  },
  getOne: async (gameId: string) => {
    const response = await api.get(`/myverse/games/${gameId}`);
    return response.data;
  },
  update: async (gameId: string, updates: Partial<any>) => {
    const response = await api.put(`/myverse/games/${gameId}`, updates);
    return response.data;
  },
  delete: async (gameId: string) => {
    await api.delete(`/myverse/games/${gameId}`);
    return gameId;
  },
  getShared: async (params?: { 
    limit?: number;
    cursor?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
  }) => {
    const response = await api.get('/myverse/games/shared', { params });
    // 백엔드 응답 형식은 { games: IMyverseGame[], nextCursor: string | null } 이어야 함
    return response.data;
  },
  getAccessible: async (params?: { 
    limit?: number;
    cursor?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
  }) => {
    const response = await api.get('/myverse/games/accessible', { params });
    return response.data; // { games: IMyverseGame[], nextCursor: string | null }
  },
  getByType: async (type: string, params?: { 
    limit?: number;
    cursor?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
  }) => {
    const response = await api.get(`/myverse/games/type/${type}`, { params });
    return response.data; // { games: IMyverseGame[], nextCursor: string | null }
  },
  // Sent games (games shared by this user)
  getSent: async (params?: { 
    limit?: number;
    cursor?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
  }) => {
    const response = await api.get('/myverse/games/sent', { params });
    return response.data; // { games: IMyverseGame[], nextCursor: string | null }
  },
  /**
   * Submits the result of a MyVerse game session.
   */
  submitResult: async (data: SubmitMyVerseResultPayload): Promise<IMyVerseSessionResult> => {
    console.log('[API Call] Submitting MyVerse result:', data);
    try {
      const response = await api.post<IMyVerseSessionResult>('/myverse/session-result', data);
      console.log('[API Success] MyVerse result submitted:', response.data);
      return response.data;
    } catch (error) {
        console.error('[API Error] Failed to submit MyVerse result:', error);
        throw error;
    }
  },
};

// Flashcard 타입 정의
export interface Flashcard {
  _id?: string;
  userId?: string;
  bookId: string;
  tsSessionId?: string;
  memoId?: string;
  sourceText: string;
  question: string;
  answer: string;
  pageStart?: number;
  pageEnd?: number;
  tags?: string[];
  srsState?: {
    nextReview: string;
    interval: number;
    ease: number;
    repetitions: number;
    lastResult?: 'correct' | 'incorrect' | 'hard';
  };
  createdAt?: string;
  updatedAt?: string;
}

// Flashcard API
export const flashcardApi = {
  // 플래시카드 생성
  create: async (payload: Omit<Flashcard, '_id'|'userId'|'createdAt'|'updatedAt'>) => {
    const res = await api.post('/flashcards', payload);
    return res.data;
  },
  // 플래시카드 조회(책별, 유저별 등)
  list: async (params: { bookId: string }) => {
    const res = await api.get('/flashcards', { params });
    return res.data;
  },
  // 메모→플래시카드 변환
  fromMemo: async (payload: { memoId: string; question: string; answer: string }) => {
    const res = await api.post('/flashcards/from-memo', payload);
    return res.data;
  },
  // 플래시카드 복습(정답/오답 등 SRS 갱신)
  review: async (id: string, result: 'easy'|'fail'|'hard') => {
    const res = await api.post(`/flashcards/${id}/review`, { result });
    return res.data;
  },
  // 플래시카드 수정
  update: async (id: string, payload: Partial<Flashcard>) => {
    const res = await api.put(`/flashcards/${id}`, payload);
    return res.data;
  },
  // 플래시카드 삭제
  delete: async (id: string) => {
    const res = await api.delete(`/flashcards/${id}`);
    return res.data;
  },
};

export default api; 