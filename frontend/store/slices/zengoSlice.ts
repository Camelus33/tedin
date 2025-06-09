import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { RootState } from '../store'; // Assuming store is one level up
// import { zengoProverbApi } from '../../lib/api'; // <-- Adjust path to your API functions
// Import types from the new file
import { 
    ZengoProverbContent, 
    ZengoSessionResult, 
    IMyVerseSessionResult,
    GameState, 
    PlacedStone,
    BoardStoneData 
} from '../../src/types/zengo'; // Adjust path if necessary
import axios from 'axios';
import { myverseApi } from '@/lib/api'; // Import myverseApi for the new endpoint
import { zengoDataCollector } from '@/lib/zengoDataCollector'; // V2 데이터 수집기 추가

// API URL 설정
const apiUrl = process.env.NEXT_PUBLIC_API_URL; // 올바른 환경 변수 이름 사용
if (!apiUrl) {
  // 환경 변수가 설정되지 않은 경우, 빌드나 실행 시점에 명확한 에러를 발생시킴
  throw new Error(
    "CRITICAL: NEXT_PUBLIC_API_URL is not defined. " +
    "Please set this environment variable in your Vercel project settings (or .env.local for local development) " +
    "to the base URL of your backend API (e.g., https://habitus33-api.onrender.com)."
  );
}

const apiClient = axios.create({
  baseURL: apiUrl, // 수정된 환경 변수 값 사용
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Request interceptor to add auth token from localStorage
apiClient.interceptors.request.use(
  (config) => {
    // 로컬 스토리지에서 토큰 가져오기
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

// 결과 타입 정의
export type ResultType = 'EXCELLENT' | 'SUCCESS' | 'FAIL' | null;

// --- Type Definitions --- 
// Removed - Now imported from ../../src/types/zengo

// --- Async Thunks --- 

export const fetchContentThunk = createAsyncThunk<
    ZengoProverbContent,
    { level: string; language: string; reshuffleWords?: boolean; contentId?: string },
    { rejectValue: string }
>(
    'zengoProverb/fetchContent',
    async ({ level, language, reshuffleWords = false, contentId }, { rejectWithValue }) => {
        try {
            console.log('콘텐츠 로드 요청:', { level, language, reshuffleWords, contentId });
            
            // 쿼리 파라미터 구성
            const params = new URLSearchParams({
                level,
                lang: language,
                reshuffle: reshuffleWords.toString(),
                random: Date.now().toString() // 캐시 방지
            });
            
            // contentId가 제공된 경우 추가
            if (contentId) {
                params.append('contentId', contentId);
            }
            
            // API 요청 URL 구성
            const endpoint = `/api/zengo/proverb-content?${params.toString()}`;
            console.log('API 요청 URL:', endpoint);
            
            const response = await apiClient.get<ZengoProverbContent>(endpoint);
            
            if (!response.data || !response.data._id) {
                return rejectWithValue('Invalid content response from API');
            }
            
            // 성공적으로 콘텐츠 로드
            console.log('속담 콘텐츠 로드 성공:', {
                contentId: response.data._id,
                wordCount: response.data.wordMappings.length
            });
            
            return response.data;
        } catch (error) {
            // 오류 처리 및 로깅
            console.error('콘텐츠 로드 실패:', error);
            
            if (axios.isAxiosError(error)) {
                const errorData = error.response?.data;
                const statusCode = error.response?.status;
                console.error('API 오류 상세:', { statusCode, errorData });
                return rejectWithValue(`${statusCode}: ${JSON.stringify(errorData)}`);
            }
            
            if (error instanceof Error) {
                return rejectWithValue(error.message);
            }
            
            return rejectWithValue('Failed to load content');
        }
    }
);

export const submitResultThunk = createAsyncThunk<
    // Return type can be either standard or MyVerse result
    ZengoSessionResult | IMyVerseSessionResult,
    void,
    { state: { zengoProverb: ZengoState }, rejectValue: string }
>(
    'zengoProverb/submitResult',
    async (_, { getState, rejectWithValue }) => {
        const { zengoProverb } = getState();
        const { currentContent, startTime, revealedWords, resultType, placedStones, usedStonesCount, score } = zengoProverb;

        if (!currentContent || !startTime) {
            return rejectWithValue('No active game session');
        }
        if (!resultType) {
            return rejectWithValue('결과 타입이 설정되지 않았습니다');
        }

        // --- 공통 데이터 계산 --- 
        const timeTakenMs = Date.now() - startTime;
        const completedSuccessfully =
            revealedWords.length === currentContent.totalWords;
        const correctPlacedStones = placedStones.filter(stone => stone.correct);
        const incorrectPlacementsCount = placedStones.filter(stone => !stone.correct).length;
        const orderCorrect = resultType === 'EXCELLENT'; // 어순 정확성은 결과 타입으로 판단

        // --- 게임 타입 식별 --- 
        // level 문자열에 '-myverse' 또는 '-custom'이 포함되어 있는지 확인 (더 나은 방법이 있다면 수정)
        const isMyVerse = currentContent.level.includes('-myverse') || currentContent.level.includes('-custom');
        console.log(`게임 타입 식별: isMyVerse=${isMyVerse} (level: ${currentContent.level})`);

        try {
            let responseData: ZengoSessionResult | IMyVerseSessionResult;

            if (isMyVerse) {
                // --- MyVerse 결과 제출 --- 
                // Ensure collectionId from currentContent is included in the payload
                if (!currentContent.collectionId) {
                    console.error('MyVerse 게임 결과 제출 실패: collectionId가 currentContent에 없습니다.');
                    return rejectWithValue('MyVerse 게임 정보에 collectionId가 누락되었습니다.');
                }
                const myVersePayload = {
                    myVerseGameId: currentContent._id,
                    collectionId: currentContent.collectionId, // Add collectionId from content state
                    level: currentContent.level,
                    language: currentContent.language,
                    timeTakenMs,
                    correctPlacements: correctPlacedStones.length,
                    incorrectPlacements: incorrectPlacementsCount,
                    usedStonesCount,
                    completedSuccessfully,
                    resultType,
                };
                console.log('MyVerse 세션 결과 제출 데이터:', myVersePayload);
                responseData = await myverseApi.submitResult(myVersePayload);
                console.log('MyVerse 세션 결과 제출 성공:', responseData);

            } else {
                // --- Standard/Original Zengo 결과 제출 --- 
                
                // === V2 상세 데이터 수집 ===
                const detailedData = zengoDataCollector.getCurrentData();
                console.log('[submitResultThunk] V2 상세 데이터 수집 상태:', {
                    hasDetailedData: !!detailedData,
                    dataVersion: detailedData?.detailedDataVersion,
                    clickCount: detailedData?.clickPositions?.length || 0,
                    spatialErrorCount: detailedData?.spatialErrors?.length || 0
                });

                const standardPayload = {
                    contentId: currentContent._id,
                    level: currentContent.level,
                    language: currentContent.language,
                    timeTakenMs,
                    correctPlacements: correctPlacedStones.length,
                    incorrectPlacements: incorrectPlacementsCount,
                    usedStonesCount,
                    completedSuccessfully,
                    orderCorrect,
                    resultType,
                    score,
                    placementOrder: correctPlacedStones
                        .filter(stone => stone.placementIndex !== undefined)
                        .sort((a, b) => (a.placementIndex || 0) - (b.placementIndex || 0))
                        .map(stone => {
                            const index = currentContent.wordMappings.findIndex(wm =>
                                wm.coords.x === stone.x && wm.coords.y === stone.y);
                            return index;
                        }),
                    
                    // === V2 상세 데이터 구조 수정 ===
                    // 백엔드가 기대하는 `detailedMetrics` 객체로 감싸서 전송
                    detailedMetrics: (detailedData && detailedData.detailedDataVersion === 'v2.0') ? detailedData : undefined
                };

                console.log('Standard 세션 결과 제출 데이터 (V2 구조화):', JSON.stringify(standardPayload, null, 2));
                
                // Use apiClient directly as before for the standard endpoint
                const response = await apiClient.post<ZengoSessionResult>('/api/zengo/session-result', standardPayload);
                responseData = response.data;
                console.log('Standard 세션 결과 제출 성공:', responseData);
            }

            // 서버 응답의 resultType 사용 (선택적)
            if ('resultType' in responseData && responseData.resultType && responseData.resultType !== resultType) {
                console.log(`결과 타입 변경: ${resultType} → ${responseData.resultType} (서버 판정)`);
                // dispatch(setResultType(responseData.resultType)); // Optionally update state based on server response
            }

            return responseData; // Return the combined type

        } catch (error) {
            console.error('세션 결과 제출 실패:', error);
            if (axios.isAxiosError(error)) {
                console.error('응답 상태:', error.response?.status);
                console.error('응답 데이터:', error.response?.data);
                // Construct error message from backend response if available
                const errorMsg = error.response?.data?.message || JSON.stringify(error.response?.data);
                return rejectWithValue(`API 오류: ${error.response?.status} - ${errorMsg}`);
            }
            if (error instanceof Error) {
                return rejectWithValue(error.message);
            }
            return rejectWithValue('Failed to submit result');
        }
    }
);

// 위치 재생성 Thunk
export const regeneratePositionsThunk = createAsyncThunk<
    ZengoProverbContent,
    void,
    { state: { zengoProverb: ZengoState }, rejectValue: string }
>(
    'zengoProverb/regeneratePositions',
    async (_, { getState, rejectWithValue }) => {
        const { zengoProverb } = getState();
        
        if (!zengoProverb.currentContent) {
            console.error('위치 재생성 실패: 현재 콘텐츠가 없습니다.');
            return rejectWithValue('No content to regenerate positions for');
        }
        
        const contentId = zengoProverb.currentContent._id;
        const level = zengoProverb.currentContent.level;
        const language = zengoProverb.currentContent.language;
        
        console.log('위치 재생성 요청 준비:', { 
            contentId, 
            level, 
            language, 
            shouldKeepContent: zengoProverb.shouldKeepContent
        });
        
        try {
            // 캐시 방지를 위한 랜덤 타임스탬프 추가
            const randomTimestamp = Date.now();
            
            // 주의: baseURL이 이미 'http://localhost:8000/api'이므로 '/api/' 중복 제거
            const url = `/api/zengo/proverb-content?level=${level}&lang=${language}&contentId=${contentId}&reshuffle=true&random=${randomTimestamp}`;
            console.log('위치 재생성 요청 URL:', url);
            
            const response = await apiClient.get<ZengoProverbContent>(url);
            
            console.log('위치 재생성 요청 성공:', {
                newContentId: response.data._id,
                requestedContentId: contentId,
                isSameContent: response.data._id === contentId,
                wordCount: response.data.wordMappings.length
            });
            
            return response.data;
        } catch (error) {
            if (error instanceof Error) {
                console.error('위치 재생성 요청 실패:', error.message);
                return rejectWithValue(error.message);
            }
            return rejectWithValue('Failed to regenerate positions');
        }
    }
);

// 같은 콘텐츠로 재시도하는 Thunk
export const retryContentThunk = createAsyncThunk<
    ZengoProverbContent,
    { reshufflePositions: boolean },
    { state: { zengoProverb: ZengoState }, rejectValue: string }
>(
    'zengoProverb/retryContent',
    async ({ reshufflePositions }, { getState, rejectWithValue }) => {
        const { zengoProverb } = getState();
        
        // 현재 콘텐츠 검증
        if (!zengoProverb.currentContent) {
            return rejectWithValue('No content to retry');
        }
        
        const { _id: contentId, level, language } = zengoProverb.currentContent;
        
        try {
            // 파라미터 구성
            const params = new URLSearchParams({
                level,
                lang: language,
                contentId,
                reshuffle: reshufflePositions.toString(),
                random: Date.now().toString()
            });
            
            // 주의: baseURL이 이미 'http://localhost:8000/api'이므로 '/api/' 중복 제거
            const endpoint = `/api/zengo/proverb-content?${params}`;
            console.log('콘텐츠 재시도 API 요청:', endpoint);
            
            const response = await apiClient.get<ZengoProverbContent>(endpoint);
            
            if (!response.data) {
                return rejectWithValue('Invalid retry content response');
            }
            
            return response.data;
        } catch (error) {
            console.error('콘텐츠 재시도 실패:', error);
            
            if (error instanceof Error) {
                return rejectWithValue(error.message);
            }
            
            return rejectWithValue('Failed to retry content');
        }
    }
);

// Thunk to evaluate result and return the updated resultType (avoids stale closures)
export const evaluateResultThunk = createAsyncThunk<
  ResultType,
  void,
  { state: { zengoProverb: ZengoState } }
>(
  'zengoProverb/evaluateResultAndReturnType',
  async (_, { dispatch, getState }) => {
    // Run the existing reducer to set resultType
    dispatch(evaluateResult());
    // Retrieve and return the fresh resultType
    const { resultType } = getState().zengoProverb;
    return resultType as ResultType;
  }
);

// --- Slice Definition --- 

// Define ZengoState using imported types
interface ZengoState {
  gameState: GameState; // Uses imported type
  currentContent: ZengoProverbContent | null; // Uses imported type
  selectedLevel: string | null;
  selectedLanguage: string | null;
  // Game Play State
  placedStones: PlacedStone[]; // Uses imported type
  revealedWords: string[]; 
  usedStonesCount: number;
  startTime: number | null;
  score: number; // 점수 필드 추가
  // Result & Error Handling
  lastResult: ZengoSessionResult | IMyVerseSessionResult | null; // Uses imported type
  resultType: ResultType; // 결과 타입 (EXCELLENT, SUCCESS, FAIL)
  shouldKeepContent: boolean; // 같은 컨텐츠 유지 여부
  shouldKeepPositions: boolean; // 같은 위치 유지 여부
  error: string | null;
  // Add a flag to explicitly track if the current game is MyVerse
  // This should be set when content is loaded (e.g., in setContent reducer)
  isMyVerseGame: boolean; 
}

const initialState: ZengoState = {
  gameState: 'idle',
  currentContent: null,
  selectedLevel: null,
  selectedLanguage: null,
  placedStones: [],
  revealedWords: [],
  usedStonesCount: 0,
  startTime: null,
  score: 0,
  lastResult: null,
  resultType: null,
  shouldKeepContent: false,
  shouldKeepPositions: false,
  error: null,
  isMyVerseGame: false, // Default to false
};

const zengoProverbSlice = createSlice({
  name: 'zengoProverb',
  initialState,
  // 게임결과 후처리 (반드시 주석에 남겨둬 깜빡하지 않기)
  // 1. 엑셀런트: 어순과 위치를 모두 맞춘 경우 -> 다음 게임
  // 2. 성공: 위치를 맞았으나 어순이 틀린 경우 -> [다음 게임] or [같은 문장 다른 위치]
  // 3. 실패: 위치를 틀린 경우 -> [동일 게임 재실행]
  reducers: {
    // Reset game to initial state or settings state
    resetGame: (state, action: PayloadAction<{ onlyGameState?: boolean; preserveFlags?: boolean } | undefined>) => {
        const onlyGameState = action.payload?.onlyGameState;
        const preserveFlags = action.payload?.preserveFlags ?? false;
        
        state.gameState = 'idle';
        if (!onlyGameState && !preserveFlags) {
            state.currentContent = null;
            // Keep selectedLevel and selectedLanguage from being cleared
            // state.selectedLevel = null;
            // state.selectedLanguage = null;
        }
        state.placedStones = [];
        state.revealedWords = [];
        state.usedStonesCount = 0;
        state.startTime = null;
        state.lastResult = null;
        state.resultType = null;
        
        // preserveFlags가 true인 경우 shouldKeepContent와 shouldKeepPositions 값을 보존
        if (!preserveFlags) {
            state.shouldKeepContent = false;
            state.shouldKeepPositions = false;
        }
        
        state.error = null;
    },
    setSettings: (state, action: PayloadAction<{ level: string; language: string }>) => {
        state.selectedLevel = action.payload.level;
        state.selectedLanguage = action.payload.language;
        state.gameState = 'setting'; // Ready to load content for these settings
        // Reset other game states if settings change mid-game attempt
        state.currentContent = null;
        state.placedStones = [];
        state.revealedWords = [];
        state.usedStonesCount = 0;
        state.startTime = null;
        state.lastResult = null;
        state.error = null;
    },
    // Reducers for game flow control (triggered by UI or thunks/timeouts)
    startGame: (state) => {
        if (state.gameState === 'idle' && state.currentContent) {
            state.gameState = 'showing';
            // Reset specific game variables again just before starting
            state.placedStones = [];
            state.revealedWords = [];
            state.usedStonesCount = 0;
            state.startTime = null; // Start time is set when words are hidden
            state.error = null;
            // Timeout to call hideWords should be handled outside reducer (e.g., in component or thunk)
        } else {
            console.error('Cannot start game: Not in idle state or no content loaded.');
        }
    },
    hideWords: (state) => {
        if (state.gameState === 'showing') {
            state.gameState = 'playing';
            state.startTime = Date.now(); // Record start time when play begins
        }
    },
    placeStone: (state, action: PayloadAction<{ x: number; y: number }>) => {
        if (state.gameState !== 'playing' || !state.currentContent) return;

        const { x, y } = action.payload;
        const { wordMappings, totalAllowedStones, totalWords } = state.currentContent;

        // Check if stone already placed or game is over (based on stones)
        if (state.placedStones.some(p => p.x === x && p.y === y)) return;
        if (state.usedStonesCount >= totalAllowedStones) return;

        state.usedStonesCount += 1;
        let isCorrect: boolean | null = null;
        let foundWord: string | null = null;

        const matchedWordMapping = wordMappings.find(
            (mapping) => mapping.coords.x === x && mapping.coords.y === y
        );

        if (matchedWordMapping) {
            if (!state.revealedWords.includes(matchedWordMapping.word)) {
                 isCorrect = true;
                 foundWord = matchedWordMapping.word;
                 state.revealedWords.push(foundWord);
            } else {
                 isCorrect = false; // Already revealed, counts as incorrect placement now
            }
        } else {
            isCorrect = false; // No word at this position
        }

        // Add the placed stone with correctness and feedback state
        state.placedStones.push({
            x,
            y,
            correct: isCorrect,
            feedback: isCorrect ? 'correct' : 'incorrect',
            placementIndex: state.placedStones.length // 배치 순서 기록 (0부터 시작)
        });

        // --- Check Game End Conditions ---
        const success = state.revealedWords.length === totalWords;
        const failed = state.usedStonesCount === totalAllowedStones && !success;

        // IMPORTANT: Do not change gameState directly here.
        // The useEffect in ZengoPage.tsx handles dispatching finishGame.
        // if (success) { ... } else if (failed) { ... }
    },
    finishGame: (state, action: PayloadAction<{ resultType: 'success' | 'fail' }>) => {
        if (state.gameState === 'playing') {
            // Only change the state, thunk will handle submission
            state.gameState = action.payload.resultType === 'success' ? 'finished_success' : 'finished_fail';
            // Keep startTime, placedStones etc. until submission is done?
        }
    },
    clearStoneFeedback: (state, action: PayloadAction<{ x: number; y: number }>) => {
        const stone = state.placedStones.find(p => p.x === action.payload.x && p.y === action.payload.y);
        if (stone) {
            stone.feedback = undefined; // Clear the feedback state
        }
    },
    // 게임 결과 평가 및 결과 화면 표시 준비
    evaluateResult: (state) => {
        if (state.gameState !== 'playing' || !state.currentContent) return;
        
        // 성공 여부 판단 (모든 단어를 다 찾았는지)
        const completedSuccessfully = state.revealedWords.length === state.currentContent.totalWords;
        
        // 결과 처리
        if (completedSuccessfully) {
            const correctPlacedStones = state.placedStones.filter(stone => stone.correct);
            const wordMappings = state.currentContent.wordMappings;
            
            // 1. 예상 순서 (속담 내 단어 순서에 따른 좌표)
            const expectedOrder = [...wordMappings]
              .sort((a, b) => {
                // 속담에서의 단어 위치로 정렬
                const aIndex = state.currentContent!.proverbText.indexOf(a.word);
                const bIndex = state.currentContent!.proverbText.indexOf(b.word);
                return aIndex - bIndex;
              })
              .map(m => m.coords);
            
            // 2. 실제 배치 순서 (placementIndex 순서대로)
            const actualOrder = [...correctPlacedStones]
              .sort((a, b) => (a.placementIndex || 0) - (b.placementIndex || 0))
              .map(stone => ({
                x: stone.x,
                y: stone.y
              }));
            
            // 3. 순서 정확성 평가 - 정확히 일치해야만 true
            let orderCorrect = expectedOrder.length === actualOrder.length;
            
            if (orderCorrect) {
                for (let i = 0; i < expectedOrder.length; i++) {
                    const expected = expectedOrder[i];
                    const actual = actualOrder[i];
                    if (expected.x !== actual.x || expected.y !== actual.y) {
                        orderCorrect = false;
                        break;
                    }
                }
            }
            
            console.log('단어 배치 순서 최종 검증:');
            console.log('- 예상 순서:', expectedOrder.map(p => `(${p.x}, ${p.y})`));
            console.log('- 실제 순서:', actualOrder.map(p => `(${p.x}, ${p.y})`));
            console.log('- 순서 일치?', orderCorrect);
            
            // 정확도 평가 (속담의 모든 단어를 찾았고, 잘못된 선택이 X회 이하)
            const accuracyGood = state.usedStonesCount <= wordMappings.length + (wordMappings.length <= 3 ? 1 : 2);
            
            // 최종 결과 계산
            if (orderCorrect && accuracyGood) {
                state.resultType = 'EXCELLENT';  // 어순도 정확하고 정확도도 높음
            } else {
                state.resultType = 'SUCCESS';    // 모든 단어를 찾았지만 어순이 틀렸거나 정확도가 낮음
            }
        } else {
            state.resultType = 'FAIL';           // 모든 단어를 찾지 못함
        }
        
        // 게임 상태 변경
        state.gameState = completedSuccessfully ? 'finished_success' : 'finished_fail';
        
        console.log(`게임 결과 평가 완료: ${state.resultType}, 게임상태: ${state.gameState}`);
    },
    // 다음 게임 준비 함수
    prepareNextGame: (state, action: PayloadAction<{ keepContent?: boolean; keepPositions?: boolean }>) => {
        // 명시적으로 전달된 값이 있으면 우선 적용
        const explicitKeepContent = action.payload?.keepContent;
        const explicitKeepPositions = action.payload?.keepPositions;
        
        // 디버그 로깅
        console.log('다음 게임 준비 중...', { 
            resultType: state.resultType,
            explicitKeepContent,
            explicitKeepPositions
        });
        
        // 결과 타입별 기본 동작 정의 (명시적 파라미터가 없을 때)
        if (explicitKeepContent !== undefined) {
            state.shouldKeepContent = explicitKeepContent;
        } else {
            // 핵심: 성공(SUCCESS)은 같은 콘텐츠를 유지해야 함
            switch (state.resultType) {
                case 'EXCELLENT':
                    state.shouldKeepContent = false; // 새 콘텐츠
                    break;
                case 'SUCCESS':
                    state.shouldKeepContent = true;  // 같은 콘텐츠 유지 (수정 부분)
                    break;
                case 'FAIL':
                    state.shouldKeepContent = true;  // 같은 콘텐츠 유지
                    break;
                default:
                    state.shouldKeepContent = false;
            }
        }
        
        if (explicitKeepPositions !== undefined) {
            state.shouldKeepPositions = explicitKeepPositions;
        } else {
            switch (state.resultType) {
                case 'EXCELLENT':
                    state.shouldKeepPositions = false; // 새 위치
                    break;
                case 'SUCCESS':
                    state.shouldKeepPositions = false; // 새 위치 (위치는 변경)
                    break;
                case 'FAIL':
                    state.shouldKeepPositions = true;  // 같은 위치
                    break;
                default:
                    state.shouldKeepPositions = false;
            }
        }
        
        // 게임 상태 리셋
        state.placedStones = [];
        state.revealedWords = [];
        state.usedStonesCount = 0;
        state.startTime = null;
        state.gameState = 'idle';
        
        console.log(`다음 게임 준비 완료: 콘텐츠 유지=${state.shouldKeepContent}, 위치 유지=${state.shouldKeepPositions}`);
    },
    generateWordPlaceholders: (state) => {
        // ... 기존 코드 유지 ...
    },
    // New reducer to set content directly (for Myverse adapter)
    setContent: (state, action: PayloadAction<ZengoProverbContent>) => {
      state.currentContent = action.payload;
      state.gameState = 'idle';
      state.placedStones = [];
      state.revealedWords = [];
      state.usedStonesCount = 0;
      state.startTime = null;
      state.lastResult = null;
      state.resultType = null;
      state.error = null;
      // ** Determine if it's a MyVerse game when content is set **
      state.isMyVerseGame = action.payload.level.includes('-myverse') || action.payload.level.includes('-custom');
      console.log(`Content set: ID=${action.payload._id}, isMyVerse=${state.isMyVerseGame}`);
    },
    calculateAndSetScore(state) {
      if (!state.currentContent || !state.startTime) return;

      const timeTakenMs = Date.now() - state.startTime;
      const timeTakenSec = timeTakenMs / 1000;

      const correctCount = state.placedStones.filter(s => s.correct).length;
      const totalWords = state.currentContent.totalWords;

      // 기본 점수: (정확도 점수 + 시간 점수) / 2
      const accuracyScore = totalWords > 0 ? (correctCount / totalWords) * 100 : 0;
      
      // 시간 점수: 목표 시간(단어당 5초) 대비, 최대 100점
      const targetTimeSec = totalWords * 5;
      const timeRatio = timeTakenSec / targetTimeSec;
      let timeScore = 0;
      if (timeRatio <= 1) { // 목표 시간 내 성공
        timeScore = 100 - (timeRatio * 40); // 60-100점
      } else if (timeRatio <= 2) { // 목표 시간 2배 내 성공
        timeScore = 60 - ((timeRatio - 1) * 30); // 30-60점
      } else { // 그 이상
        timeScore = 30 - ((timeRatio - 2) * 10); // 10-30점
      }
      timeScore = Math.max(10, Math.min(100, timeScore));
      
      let baseScore = (accuracyScore * 0.7) + (timeScore * 0.3); // 정확도 가중치 70%
      
      // 순서 보너스
      const isOrderCorrect = state.resultType === 'EXCELLENT';
      if (isOrderCorrect && state.placedStones.length === totalWords) {
        baseScore += 15; // 순서 정확도 보너스
      }
      
      // 최종 점수는 0~100 사이로 제한
      state.score = Math.round(Math.max(0, Math.min(100, baseScore)));
    },
    setResultType(state, action: PayloadAction<ResultType>) {
      state.resultType = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchContentThunk states
      .addCase(fetchContentThunk.pending, (state) => {
        state.gameState = 'loading';
        state.error = null;
        state.currentContent = null;
      })
      .addCase(fetchContentThunk.fulfilled, (state, action: PayloadAction<ZengoProverbContent>) => {
        state.gameState = 'idle'; // Ready to start game
        state.currentContent = action.payload;
        state.placedStones = [];
        state.revealedWords = [];
        state.usedStonesCount = 0;
        state.startTime = null;
        state.error = null;
        state.isMyVerseGame = action.payload.level.includes('-myverse') || action.payload.level.includes('-custom');
        console.log(`Content loaded via Thunk: ID=${action.payload._id}, isMyVerse=${state.isMyVerseGame}`);
      })
      .addCase(fetchContentThunk.rejected, (state, action) => {
        state.gameState = 'idle';
        state.error = action.payload ?? 'Failed to fetch content';
      })
      // submitResultThunk states
      .addCase(submitResultThunk.pending, (state) => {
        // 게임 상태는 변경하지 않고 'submitting' 플래그만 추가
        console.log('제출 대기 중...', { prevState: state.gameState });
        state.error = null;
      })
      .addCase(submitResultThunk.fulfilled, (state, action: PayloadAction<ZengoSessionResult | IMyVerseSessionResult>) => {
        // 게임 상태는 evaluateResult에서 이미 설정했으므로 변경하지 않음
        
        // 백엔드 응답에는 activityId, score만 포함되어 있음
        // 나머지 필요한 데이터는 현재 상태에서 보존
        state.lastResult = action.payload;
        
        state.error = null;
        console.log('결과 제출 성공:', { 
          lastResult: state.lastResult, 
          gameState: state.gameState, 
          resultType: state.resultType 
        });
      })
      .addCase(submitResultThunk.rejected, (state, action) => {
        // 제출 실패 시에도 게임 상태는 유지함 (finished_success/finished_fail)
        state.error = action.payload ?? 'Failed to submit result';
        console.log('결과 제출 실패:', {
          error: state.error,
          gameState: state.gameState
        });
      })
      // 위치 재생성 핸들러
      .addCase(regeneratePositionsThunk.pending, (state) => {
        state.gameState = 'setting';
        state.error = null;
      })
      .addCase(regeneratePositionsThunk.fulfilled, (state, action) => {
        state.currentContent = action.payload;
        state.gameState = 'showing';
        state.error = null;
        state.isMyVerseGame = action.payload.level.includes('-myverse') || action.payload.level.includes('-custom');
        console.log(`Positions regenerated & content set: ID=${action.payload._id}, isMyVerse=${state.isMyVerseGame}`);
      })
      .addCase(regeneratePositionsThunk.rejected, (state, action) => {
        state.gameState = 'idle';
        state.error = action.payload || '위치 재생성에 실패했습니다.';
      })
      // 같은 콘텐츠로 재시도하는 Thunk
      .addCase(retryContentThunk.pending, (state) => {
        state.gameState = 'setting';
        state.error = null;
      })
      .addCase(retryContentThunk.fulfilled, (state, action) => {
        state.currentContent = action.payload;
        state.gameState = 'showing';
        state.error = null;
      })
      .addCase(retryContentThunk.rejected, (state, action) => {
        state.gameState = 'idle';
        state.error = action.payload || '콘텐츠 재시도에 실패했습니다.';
      });
  },
})

export const {
    resetGame,
    setSettings,
    startGame,
    hideWords,
    placeStone,
    clearStoneFeedback,
    evaluateResult,
    prepareNextGame,
    generateWordPlaceholders,
    setContent,
    calculateAndSetScore,
    setResultType,
} = zengoProverbSlice.actions

export default zengoProverbSlice.reducer 