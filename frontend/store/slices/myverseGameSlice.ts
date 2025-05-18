import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MyverseGameState {
  // 예시: 현재 게임 ID, 게임 상태 등
  currentGameId: string | null;
  status: 'idle' | 'loading' | 'playing' | 'finished';
  error: string | null;
  // 실제 필요한 상태들을 여기에 추가해야 합니다.
}

const initialState: MyverseGameState = {
  currentGameId: null,
  status: 'idle',
  error: null,
};

const myverseGameSlice = createSlice({
  name: 'myverseGame',
  initialState,
  reducers: {
    // 예시 리듀서: 게임 시작
    startGame: (state, action: PayloadAction<string>) => {
      state.status = 'playing';
      state.currentGameId = action.payload;
      state.error = null;
    },
    // 예시 리듀서: 게임 상태 변경
    setGameStatus: (state, action: PayloadAction<MyverseGameState['status']>) => {
      state.status = action.payload;
    },
    // 여기에 필요한 다른 리듀서들을 추가해야 합니다.
    // 예: setGameData, endGame, setError 등
  },
});

export const { startGame, setGameStatus } = myverseGameSlice.actions;

export default myverseGameSlice.reducer; 