import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Book {
  _id: string;
  id: string;
  title: string;
  author: string;
  coverImage: string;
  totalPages: number;
  genre: string;
  readingGoal: string;
  currentPage: number;
  status: 'reading' | 'completed';
  createdAt: string;
}

interface BookState {
  books: Book[];
  currentBook: Book | null;
  loading: boolean;
  error: string | null;
}

const initialState: BookState = {
  books: [],
  currentBook: null,
  loading: false,
  error: null,
}

export const bookSlice = createSlice({
  name: 'book',
  initialState,
  reducers: {
    fetchBooksStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchBooksSuccess: (state, action: PayloadAction<Book[]>) => {
      state.loading = false;
      state.books = action.payload;
    },
    fetchBooksFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    setCurrentBook: (state, action: PayloadAction<Book>) => {
      state.currentBook = action.payload;
    },
    addBook: (state, action: PayloadAction<Book>) => {
      state.books.push(action.payload);
    },
    updateBook: (state, action: PayloadAction<Book>) => {
      const index = state.books.findIndex(book => book._id === action.payload._id);
      if (index !== -1) {
        state.books[index] = action.payload;
        if (state.currentBook && state.currentBook._id === action.payload._id) {
          state.currentBook = action.payload;
        }
      }
    },
    removeBook: (state, action: PayloadAction<string>) => {
      state.books = state.books.filter(book => book._id !== action.payload);
      if (state.currentBook && state.currentBook._id === action.payload) {
        state.currentBook = null;
      }
    },
  },
})

export const {
  fetchBooksStart,
  fetchBooksSuccess,
  fetchBooksFailure,
  setCurrentBook,
  addBook,
  updateBook,
  removeBook,
} = bookSlice.actions

export default bookSlice.reducer 