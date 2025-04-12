'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Spinner from '@/components/ui/Spinner';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

export default function JourneyPage() {
  const router = useRouter();
  const [userType, setUserType] = useState<'new' | 'irregular' | 'habitual'>('new');

  // Redux 스토어 구조에 맞게 수정 (auth 대신 user 슬라이스 사용)
  const user = useSelector((state: RootState) => state.user);

  useEffect(() => {
    // Check if user is authenticated
    if (!user || !user.isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    // 자동으로 대시보드로 리다이렉트
    router.push('/dashboard');
  }, [router]);

  // 리다이렉트 중 로딩 표시
  return (
    <div className="flex justify-center items-center min-h-screen">
      <Spinner size="lg" />
    </div>
  );
} 