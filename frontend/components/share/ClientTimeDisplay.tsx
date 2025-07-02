'use client';

import { useEffect, useState } from 'react';
import { formatUserTime } from '@/lib/timeUtils';

interface ClientTimeDisplayProps {
  createdAt?: string;
  clientCreatedAt?: string;
  fallbackText?: string;
  className?: string;
}

export default function ClientTimeDisplay({ 
  createdAt, 
  clientCreatedAt, 
  fallbackText = '정보 없음',
  className = ''
}: ClientTimeDisplayProps) {
  const [timeString, setTimeString] = useState<string>(fallbackText);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // 클라이언트에서만 실행되므로 사용자의 현지 시간대로 포맷팅됨
    const formattedTime = formatUserTime(clientCreatedAt, createdAt);
    setTimeString(formattedTime);
  }, [clientCreatedAt, createdAt]);

  // 서버 사이드 렌더링 시에는 fallback 텍스트 표시
  if (!mounted) {
    return <span className={className}>{fallbackText}</span>;
  }

  return <span className={className}>{timeString}</span>;
}

interface ClientDateDisplayProps {
  createdAt?: string;
  clientCreatedAt?: string;
  fallbackText?: string;
  className?: string;
}

export function ClientDateDisplay({ 
  createdAt, 
  clientCreatedAt, 
  fallbackText = '날짜 정보 없음',
  className = ''
}: ClientDateDisplayProps) {
  const [dateString, setDateString] = useState<string>(fallbackText);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // 클라이언트에서만 실행되므로 사용자의 현지 시간대로 포맷팅됨
    const timeToUse = clientCreatedAt || createdAt;
    if (timeToUse) {
      const date = new Date(timeToUse);
      const formattedDate = date.toLocaleDateString('ko-KR', {
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
      });
      setDateString(formattedDate);
    }
  }, [clientCreatedAt, createdAt]);

  // 서버 사이드 렌더링 시에는 fallback 텍스트 표시
  if (!mounted) {
    return <span className={className}>{fallbackText}</span>;
  }

  return <span className={className}>{dateString}</span>;
} 