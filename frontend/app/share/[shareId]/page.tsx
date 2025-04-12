'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/common/Button';

type ShareData = {
  _id: string;
  userId: {
    nickname: string;
  };
  bookId: {
    title: string;
    author: string;
    coverImage?: string;
  };
  startPage: number;
  actualEndPage: number;
  durationSec: number;
  memo?: string;
  summary10words?: string;
  ppm: number;
  createdAt: string;
  badges: {
    _id: string;
    type: string;
    title: string;
  }[];
};

export default function SharePage() {
  const router = useRouter();
  const params = useParams();
  const shareId = params.shareId as string;
  
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchShareData = async () => {
      if (!shareId) return;

      try {
        const response = await fetch(`/api/share/${shareId}`);

        if (!response.ok) {
          throw new Error('공유 정보를 불러오는 데 실패했습니다.');
        }

        const data = await response.json();
        setShareData(data.share);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShareData();
  }, [shareId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get a performance message based on PPM
  const getPerformanceMessage = (ppm: number) => {
    if (ppm > 2) return '놀라운 집중력을 보여주셨어요!';
    if (ppm > 1.5) return '평균 이상의 좋은 성과예요!';
    if (ppm > 1) return '꾸준한 리듬을 유지하셨어요!';
    return '첫 시작을 축하드려요!';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 flex items-center justify-center">
        <p>로딩 중...</p>
      </div>
    );
  }

  if (error || !shareData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
          <h1 className="text-xl font-bold text-red-600 mb-4">오류 발생</h1>
          <p className="mb-6">{error || '공유 정보를 찾을 수 없습니다.'}</p>
          <Link href="/" className="inline-block text-indigo-600 font-medium">
            홈으로 가기
          </Link>
        </div>
      </div>
    );
  }

  // Calculate various metrics
  const totalPagesRead = shareData.actualEndPage - shareData.startPage;
  const readingTimeMinutes = Math.round(shareData.durationSec / 60);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto max-w-md">
        {/* Share Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="bg-indigo-600 text-white p-4 text-center">
            <h1 className="text-xl font-bold">독서 상장</h1>
            <p className="text-indigo-100">
              {formatDate(shareData.createdAt)}
            </p>
          </div>
          
          <div className="p-6">
            <div className="text-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">{shareData.bookId.title}</h2>
              <p className="text-gray-600">{shareData.bookId.author}</p>
              <p className="text-gray-500 text-sm mt-1">
                <span className="font-medium">{shareData.userId.nickname}</span>님의 독서 성과
              </p>
            </div>
            
            <div className="flex justify-between mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600">{totalPagesRead}</div>
                <div className="text-xs text-gray-500">페이지</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600">{readingTimeMinutes}</div>
                <div className="text-xs text-gray-500">분</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600">{shareData.ppm.toFixed(1)}</div>
                <div className="text-xs text-gray-500">PPM</div>
              </div>
            </div>
            
            {shareData.memo && (
              <div className="bg-indigo-50 p-4 rounded-lg mb-4">
                <h3 className="font-bold text-indigo-700 mb-2">메모</h3>
                <p className="text-gray-700">{shareData.memo}</p>
              </div>
            )}
            
            {shareData.summary10words && (
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h3 className="font-bold text-blue-700 mb-2">10단어 요약</h3>
                <p className="text-gray-700">{shareData.summary10words}</p>
              </div>
            )}
            
            <div className="mb-4">
              <h3 className="font-bold text-gray-700 mb-2">성과</h3>
              <p className="text-gray-700">{getPerformanceMessage(shareData.ppm)}</p>
            </div>
            
            {shareData.badges && shareData.badges.length > 0 && (
              <div className="mb-4">
                <h3 className="font-bold text-gray-700 mb-2">획득 뱃지</h3>
                <div className="flex flex-wrap gap-2">
                  {shareData.badges.map((badge) => (
                    <div 
                      key={badge._id} 
                      className="bg-yellow-50 border border-yellow-200 rounded-full px-3 py-1 text-sm text-yellow-700"
                    >
                      {badge.title}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Call to Action */}
        <div className="text-center mb-8">
          <h3 className="text-xl font-medium text-gray-800 mb-4">
            나도 도전해보고 싶다면?
          </h3>
          <div className="flex space-x-3">
            <Button 
              href="/auth/register" 
              variant="default" 
              fullWidth
            >
              지금 시작하기
            </Button>
            <Button 
              href="/" 
              variant="outline" 
              fullWidth
            >
              더 알아보기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 