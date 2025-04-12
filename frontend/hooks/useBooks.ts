'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { 
  fetchBooksStart, 
  fetchBooksSuccess, 
  fetchBooksFailure, 
  addBook,
  updateBook,
  removeBook,
  setCurrentBook,
  Book 
} from '@/store/slices/bookSlice';
import { books as booksApi } from '@/lib/api';
import { API_ERRORS } from '@/lib/api';

// Interface for book fetching state
interface BookFetchState {
  isLoading: boolean;
  error: string | null;
  book: Book | null;
}

export default function useBooks() {
  const dispatch = useDispatch();
  const { books, currentBook, loading, error } = useSelector((state: RootState) => state.book);
  
  const [initialized, setInitialized] = useState(false);
  
  // For individual book fetch state management
  const [bookFetchState, setBookFetchState] = useState<BookFetchState>({
    isLoading: false,
    error: null,
    book: null
  });
  
  // Track mounted state to prevent state updates after unmount
  const isMounted = useRef(true);
  
  // Set up and clean up mounted ref
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Fetch books on initial load
  useEffect(() => {
    if (!initialized && !loading) {
      loadBooks();
      setInitialized(true);
    }
  }, [initialized, loading]);
  
  // Load all books for the current user
  const loadBooks = useCallback(async () => {
    try {
      dispatch(fetchBooksStart());
      const data = await booksApi.getAll();
      dispatch(fetchBooksSuccess(data));
    } catch (err: any) {
      dispatch(fetchBooksFailure(err.message || '도서 목록을 불러오는 중 오류가 발생했습니다'));
    }
  }, [dispatch]);
  
  // Get a single book by ID
  const getBook = useCallback(async (id: string) => {
    try {
      // Check if we already have the book in state
      const existingBook = books.find(book => book.id === id);
      if (existingBook) {
        dispatch(setCurrentBook(existingBook));
        return existingBook;
      }
      
      // Otherwise fetch from API
      const data = await booksApi.getById(id);
      dispatch(setCurrentBook(data));
      return data;
    } catch (err: any) {
      console.error('Error fetching book:', err);
      return null;
    }
  }, [books, dispatch]);
  
  // Safely fetch a book with timeout and better error handling
  const fetchBookDetail = useCallback(async (id: string) => {
    if (!id) {
      setBookFetchState({
        isLoading: false,
        error: '유효하지 않은 책 ID입니다',
        book: null
      });
      return null;
    }
    
    // Start loading
    setBookFetchState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Try to get from Redux store first
      const existingBook = books.find(book => book.id === id);
      if (existingBook) {
        if (isMounted.current) {
          setBookFetchState({
            isLoading: false,
            error: null,
            book: existingBook
          });
          dispatch(setCurrentBook(existingBook));
        }
        return existingBook;
      }
      
      // Fetch from API with retry mechanism
      const data = await booksApi.getById(id);
      
      if (isMounted.current) {
        setBookFetchState({
          isLoading: false,
          error: null,
          book: data
        });
        dispatch(setCurrentBook(data));
      }
      return data;
    } catch (err: any) {
      console.error('Error fetching book detail:', err);
      
      // Determine appropriate error message
      let errorMessage;
      if (err.message === API_ERRORS.TIMEOUT_ERROR) {
        errorMessage = '책 정보를 불러오는 시간이 초과되었습니다. 네트워크 연결을 확인하세요.';
      } else if (err.message === API_ERRORS.NETWORK_ERROR) {
        errorMessage = '네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인하세요.';
      } else if (err.message === API_ERRORS.AUTH_ERROR) {
        errorMessage = '로그인이 필요하거나 세션이 만료되었습니다.';
      } else if (err.message === API_ERRORS.NOT_FOUND) {
        errorMessage = '책을 찾을 수 없습니다.';
      } else {
        errorMessage = err.message || '책 정보를 불러오는 중 오류가 발생했습니다';
      }
      
      if (isMounted.current) {
        setBookFetchState({
          isLoading: false,
          error: errorMessage,
          book: null
        });
      }
      
      return null;
    }
  }, [books, dispatch]);
  
  // Create a new book
  const createBook = useCallback(async (bookData: Omit<Book, 'id' | 'createdAt' | 'status'>) => {
    try {
      const data = await booksApi.create({
        ...bookData,
        status: 'reading',
      });
      
      dispatch(addBook(data));
      return data;
    } catch (err: any) {
      console.error('Error creating book:', err);
      return null;
    }
  }, [dispatch]);
  
  // Update an existing book
  const editBook = useCallback(async (id: string, bookData: Partial<Book>) => {
    try {
      const data = await booksApi.update(id, bookData);
      dispatch(updateBook(data));
      return data;
    } catch (err: any) {
      console.error('Error updating book:', err);
      return null;
    }
  }, [dispatch]);
  
  // Delete a book
  const deleteBook = useCallback(async (id: string) => {
    try {
      await booksApi.delete(id);
      dispatch(removeBook(id));
      return true;
    } catch (err: any) {
      console.error('Error deleting book:', err);
      return false;
    }
  }, [dispatch]);
  
  // Update reading progress
  const updateProgress = useCallback(async (id: string, currentPage: number) => {
    try {
      const book = books.find(b => b.id === id);
      if (!book) return null;
      
      // Check if book is completed
      const isCompleted = currentPage >= book.totalPages;
      const status = isCompleted ? 'completed' : 'reading';
      
      const data = await booksApi.update(id, { 
        currentPage, 
        status,
      });
      
      dispatch(updateBook(data));
      return data;
    } catch (err: any) {
      console.error('Error updating progress:', err);
      return null;
    }
  }, [books, dispatch]);
  
  // Helper to get filtered books
  const getFilteredBooks = useCallback((status?: 'reading' | 'completed', searchTerm?: string) => {
    let filtered = [...books];
    
    // Filter by status
    if (status) {
      filtered = filtered.filter(book => book.status === status);
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(book => 
        book.title.toLowerCase().includes(term) || 
        book.author.toLowerCase().includes(term) ||
        book.genre.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  }, [books]);
  
  // Calculate overall reading progress
  const getOverallProgress = useCallback(() => {
    if (!books.length) return 0;
    
    const totalPages = books.reduce((sum, book) => sum + book.totalPages, 0);
    const readPages = books.reduce((sum, book) => sum + book.currentPage, 0);
    
    return Math.round((readPages / totalPages) * 100);
  }, [books]);
  
  return {
    books,
    currentBook,
    loading,
    error,
    bookFetchState, // New state for individual book fetching
    loadBooks,
    getBook,
    fetchBookDetail, // New safer method
    createBook,
    editBook,
    deleteBook,
    updateProgress,
    getFilteredBooks,
    getOverallProgress,
  };
} 