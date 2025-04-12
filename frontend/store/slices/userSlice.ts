import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UserState {
  id: string | null;
  email: string | null;
  nickname: string | null;
  profileImage: string | null;
  isAuthenticated: boolean;
  token: string | null;
  trialEndsAt: string | null;
  inviteCode: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  id: null,
  email: null,
  nickname: null,
  profileImage: null,
  isAuthenticated: false,
  token: null,
  trialEndsAt: null,
  inviteCode: null,
  loading: false,
  error: null,
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ 
      id: string, 
      email: string, 
      nickname: string, 
      token: string,
      profileImage?: string | null,
      trialEndsAt: string | null,
      inviteCode: string | null
    }>) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.id = action.payload.id;
      state.email = action.payload.email;
      state.nickname = action.payload.nickname;
      state.profileImage = action.payload.profileImage || null;
      state.token = action.payload.token;
      state.trialEndsAt = action.payload.trialEndsAt;
      state.inviteCode = action.payload.inviteCode;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.id = null;
      state.email = null;
      state.nickname = null;
      state.profileImage = null;
      state.isAuthenticated = false;
      state.token = null;
      state.trialEndsAt = null;
      state.inviteCode = null;
    },
    updateProfile: (state, action: PayloadAction<{ nickname?: string, profileImage?: string }>) => {
      if (action.payload.nickname) {
        state.nickname = action.payload.nickname;
      }
      if (action.payload.profileImage !== undefined) {
        state.profileImage = action.payload.profileImage;
      }
    },
  },
})

export const { loginStart, loginSuccess, loginFailure, logout, updateProfile } = userSlice.actions

export default userSlice.reducer 