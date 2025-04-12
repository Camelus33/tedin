import { format, formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

/**
 * Format a date to a standard format
 */
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'yyyy년 MM월 dd일', { locale: ko });
};

/**
 * Format a date to relative time (e.g., "3 days ago")
 */
export const formatRelativeTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: ko });
};

/**
 * Format seconds to mm:ss format
 */
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Calculate reading progress percentage
 */
export const calculateProgress = (currentPage: number, totalPages: number): number => {
  if (currentPage <= 0 || totalPages <= 0) return 0;
  const percentage = (currentPage / totalPages) * 100;
  return Math.min(Math.round(percentage), 100);
};

/**
 * Format PPM (Pages Per Minute) with one decimal place
 */
export const formatPPM = (ppm: number | null): string => {
  if (ppm === null) return '0.0';
  return ppm.toFixed(1);
};

/**
 * Truncate text to a specific length
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Format number with comma separators
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString('ko-KR');
};

/**
 * Calculate time remaining until a date
 */
export const calculateTimeRemaining = (endDate: Date | string): string => {
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  const now = new Date();
  
  if (now > end) return '만료됨';
  
  const diffInDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  return `${diffInDays}일 남음`;
};

 