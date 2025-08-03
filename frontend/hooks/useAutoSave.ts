import { useState, useEffect, useCallback, useRef } from 'react';
import { showSuccess, showError } from '@/lib/toast';

interface UseAutoSaveOptions {
  delay?: number; // 디바운싱 지연시간 (ms)
  onSave?: (data: any) => Promise<void>;
  onError?: (error: any) => void;
}

export function useAutoSave<T>(
  data: T,
  options: UseAutoSaveOptions = {}
) {
  const { delay = 1000, onSave, onError } = options;
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastDataRef = useRef<T>(data);

  const saveData = useCallback(async (dataToSave: T) => {
    if (!onSave) return;
    
    try {
      setIsSaving(true);
      await onSave(dataToSave);
      setLastSaved(new Date());
      lastDataRef.current = dataToSave;
    } catch (error) {
      console.error('Auto save failed:', error);
      onError?.(error);
      showError('자동 저장에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  }, [onSave, onError]);

  useEffect(() => {
    // 데이터가 변경되었는지 확인
    if (JSON.stringify(data) === JSON.stringify(lastDataRef.current)) {
      return;
    }

    // 이전 타이머 클리어
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // 새로운 타이머 설정
    timeoutRef.current = setTimeout(() => {
      saveData(data);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, delay, saveData]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isSaving,
    lastSaved,
    saveNow: () => saveData(data)
  };
} 