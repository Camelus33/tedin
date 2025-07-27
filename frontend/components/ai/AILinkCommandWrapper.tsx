'use client';

import { usePathname } from 'next/navigation';
import { AILinkCommand } from './AILinkCommand';

export function AILinkCommandWrapper() {
  const pathname = usePathname();
  
  // 현재 경로가 AILinkCommand를 표시해야 하는지 확인
  const shouldShow = 
    pathname === '/dashboard' || // 대시보드 페이지
    pathname === '/books' || // /books 페이지
    (pathname.startsWith('/books/') && pathname !== '/books'); // 책 상세 페이지
  
  if (!shouldShow) return null;
  
  return <AILinkCommand />;
} 