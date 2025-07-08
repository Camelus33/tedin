import { configureStore } from '@reduxjs/toolkit'
import userReducer from './slices/userSlice'
import bookReducer from './slices/bookSlice'
import sessionReducer from './slices/sessionSlice'
import zengoReducer from './slices/zengoSlice'
import collectionReducer from './slices/collectionSlice'
import myverseGameReducer from './slices/myverseGameSlice'

export const store = configureStore({
  reducer: {
    user: userReducer,
    book: bookReducer, // revert to original key
    session: sessionReducer,
    zengoProverb: zengoReducer, // revert to original key
    collections: collectionReducer,
    myverseGames: myverseGameReducer, // revert to original key
  },
})

// RootState와 AppDispatch 타입을 store 자체에서 추론합니다.
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch 