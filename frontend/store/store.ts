import { configureStore } from '@reduxjs/toolkit'
import userReducer from './slices/userSlice'
import bookReducer from './slices/bookSlice'
import sessionReducer from './slices/sessionSlice'
import zengoProverbReducer from './slices/zengoSlice'

export const store = configureStore({
  reducer: {
    user: userReducer,
    book: bookReducer,
    session: sessionReducer,
    zengoProverb: zengoProverbReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch 