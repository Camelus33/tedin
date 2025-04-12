'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { 
  startSession, 
  pauseSession, 
  resumeSession, 
  completeSession, 
  cancelSession, 
  updateElapsedTime 
} from '@/store/slices/sessionSlice';
import { formatTime } from '@/lib/formatter';
import { sessions } from '@/lib/api';
import { Book } from '@/store/slices/bookSlice';

type TTModeStatus = 'idle' | 'warmup' | 'reading' | 'paused' | 'review' | 'completed';

interface UseTTProps {
  book?: Book;
}

export default function useTT({ book }: UseTTProps = {}) {
  const dispatch = useDispatch();
  const { currentSession, timer } = useSelector((state: RootState) => state.session);
  
  const [status, setStatus] = useState<TTModeStatus>('idle');
  const [displayTime, setDisplayTime] = useState('00:00');
  const [error, setError] = useState<string | null>(null);
  
  // Setup an interval to track elapsed time
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (timer.isActive) {
      interval = setInterval(() => {
        if (timer.startTime) {
          const elapsed = timer.elapsedTime + (Date.now() - timer.startTime);
          setDisplayTime(formatTime(elapsed / 1000));
          
          // Update the elapsed time in Redux every second
          dispatch(updateElapsedTime(elapsed));
        }
      }, 1000);
    } else if (timer.elapsedTime > 0) {
      setDisplayTime(formatTime(timer.elapsedTime / 1000));
    } else {
      setDisplayTime('00:00');
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer.isActive, timer.startTime, timer.elapsedTime, dispatch]);
  
  // Initialize a new TT session
  const initSession = useCallback(async (startPage: number, endPage: number, warmup: boolean) => {
    try {
      if (!book) {
        throw new Error('책을 선택해주세요');
      }
      
      // Create a pending session in the backend
      const response = await sessions.create({
        bookId: book.id,
        mode: 'TT',
        startPage,
        endPage,
        status: 'pending',
      });
      
      // Start the session in Redux
      dispatch(startSession({
        ...response,
        status: 'active',
      }));
      
      // Set the initial status based on whether warmup is enabled
      setStatus(warmup ? 'warmup' : 'reading');
      setError(null);
      
      return response;
    } catch (err: any) {
      setError(err.message || '세션 초기화 중 오류가 발생했습니다');
      return null;
    }
  }, [book, dispatch]);
  
  // Start reading (after warmup or directly)
  const startReading = useCallback(() => {
    setStatus('reading');
  }, []);
  
  // Pause the current reading session
  const pauseReading = useCallback(() => {
    dispatch(pauseSession());
    setStatus('paused');
  }, [dispatch]);
  
  // Resume the paused reading session
  const resumeReading = useCallback(() => {
    dispatch(resumeSession());
    setStatus('reading');
  }, [dispatch]);
  
  // Finish reading and move to review
  const finishReading = useCallback(() => {
    dispatch(pauseSession());
    setStatus('review');
  }, [dispatch]);
  
  // Submit the review and complete the session
  const submitReview = useCallback(async (reviewData: {
    actualEndPage: number;
    memo: string;
    summary10words: string[];
    selfRating: number;
  }) => {
    try {
      if (!currentSession) {
        throw new Error('현재 세션이 존재하지 않습니다');
      }
      
      // Complete the session in Redux
      dispatch(completeSession(reviewData));
      
      // Update the session in the backend
      await sessions.update(currentSession.id, {
        ...reviewData,
        status: 'completed',
        durationSec: Math.floor(timer.elapsedTime / 1000),
      });
      
      setStatus('completed');
      setError(null);
    } catch (err: any) {
      setError(err.message || '세션 완료 중 오류가 발생했습니다');
    }
  }, [currentSession, dispatch, timer.elapsedTime]);
  
  // Cancel the current session
  const cancelCurrentSession = useCallback(async () => {
    if (currentSession) {
      try {
        // Cancel the session in Redux
        dispatch(cancelSession());
        
        // Update the session status in the backend if needed
        await sessions.update(currentSession.id, { status: 'cancelled' });
        
        setStatus('idle');
        setError(null);
      } catch (err: any) {
        setError(err.message || '세션 취소 중 오류가 발생했습니다');
      }
    } else {
      // No session to cancel, just reset the state
      setStatus('idle');
    }
  }, [currentSession, dispatch]);
  
  return {
    // State
    status,
    currentSession,
    displayTime,
    isActive: timer.isActive,
    elapsedTime: timer.elapsedTime,
    error,
    
    // Methods
    initSession,
    startReading,
    pauseReading,
    resumeReading,
    finishReading,
    submitReview,
    cancelCurrentSession,
  };
} 