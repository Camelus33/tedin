import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface TSSession {
  id: string;
  bookId: string;
  mode: 'TS';
  startPage: number;
  endPage: number;
  actualEndPage: number | null;
  durationSec: number;
  ppm: number | null;
  memo: string | null;
  summary10words: string[] | null;
  selfRating: number | null;
  createdAt: string;
  status: 'pending' | 'active' | 'completed';
}

interface SessionState {
  currentSession: TSSession | null;
  sessionHistory: TSSession[];
  loading: boolean;
  timer: {
    isActive: boolean;
    startTime: number | null;
    elapsedTime: number;
  };
  error: string | null;
}

const initialState: SessionState = {
  currentSession: null,
  sessionHistory: [],
  loading: false,
  timer: {
    isActive: false,
    startTime: null,
    elapsedTime: 0,
  },
  error: null,
}

export const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    startSession: (state, action: PayloadAction<TSSession>) => {
      state.currentSession = action.payload;
      state.timer.isActive = true;
      state.timer.startTime = Date.now();
      state.timer.elapsedTime = 0;
    },
    pauseSession: (state) => {
      if (state.timer.isActive && state.timer.startTime) {
        state.timer.isActive = false;
        state.timer.elapsedTime = state.timer.elapsedTime + (Date.now() - state.timer.startTime);
        state.timer.startTime = null;
      }
    },
    resumeSession: (state) => {
      state.timer.isActive = true;
      state.timer.startTime = Date.now();
    },
    completeSession: (state, action: PayloadAction<{
      actualEndPage: number;
      memo: string;
      summary10words: string[];
      selfRating: number;
    }>) => {
      if (state.currentSession) {
        state.currentSession.status = 'completed';
        state.currentSession.actualEndPage = action.payload.actualEndPage;
        state.currentSession.memo = action.payload.memo;
        state.currentSession.summary10words = action.payload.summary10words;
        state.currentSession.selfRating = action.payload.selfRating;
        
        // Calculate PPM
        if (state.timer.elapsedTime > 0) {
          const pagesRead = action.payload.actualEndPage - state.currentSession.startPage;
          const minutesSpent = (state.timer.elapsedTime / 1000) / 60;
          state.currentSession.ppm = parseFloat((pagesRead / minutesSpent).toFixed(2));
        }
        
        state.sessionHistory.push(state.currentSession);
      }
      
      // Reset timer
      state.timer.isActive = false;
      state.timer.startTime = null;
      state.timer.elapsedTime = 0;
    },
    cancelSession: (state) => {
      state.currentSession = null;
      state.timer.isActive = false;
      state.timer.startTime = null;
      state.timer.elapsedTime = 0;
    },
    updateElapsedTime: (state, action: PayloadAction<number>) => {
      state.timer.elapsedTime = action.payload;
    },
    fetchSessionsSuccess: (state, action: PayloadAction<TSSession[]>) => {
      state.sessionHistory = action.payload;
      state.loading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
})

export const {
  startSession,
  pauseSession,
  resumeSession,
  completeSession,
  cancelSession,
  updateElapsedTime,
  fetchSessionsSuccess,
  setLoading,
  setError,
} = sessionSlice.actions

export default sessionSlice.reducer 