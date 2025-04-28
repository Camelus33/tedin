import { configureStore } from '@reduxjs/toolkit'
import userReducer from './slices/userSlice'
import bookReducer from './slices/bookSlice'
import sessionReducer from './slices/sessionSlice'
import zengoProverbReducer from './slices/zengoSlice'
import collectionReducer from './slices/collectionSlice'
import myverseGameReducer from './slices/myverseGameSlice'

export const store = configureStore({
  reducer: {
    user: userReducer,
    book: bookReducer,
    session: sessionReducer,
    zengoProverb: zengoProverbReducer,
    collections: collectionReducer,
    myverseGames: myverseGameReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch 