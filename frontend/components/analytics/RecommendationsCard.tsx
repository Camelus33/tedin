'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import Button from '@/components/common/Button';

// page.tsx의 personalizedRecommendations 배열의 요소 타입과 일치
interface RecommendationItem {
  title: string;
  description: string;
  action: string; 
  link?: string; 
}

interface RecommendationsCardProps {
  recommendationsData: RecommendationItem[] | undefined | null;
}

const RecommendationsCard: React.FC<RecommendationsCardProps> = ({ recommendationsData }) => {
  const router = useRouter();
  const [appear, setAppear] = useState(false);
  
  useEffect(() => {
    // 고요한 승리를 위한 부드러운 등장 효과
    const timer = setTimeout(() => setAppear(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!recommendationsData || recommendationsData.length === 0) {
    return (
      <Card className="mb-6 md:mb-8 habitus-transition">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl sm:text-2xl">당신만의 성장 여정</CardTitle>
          <CardDescription className="text-sm sm:text-md">
            아직 개인화된 성장 제안을 생성할 충분한 데이터가 없습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-center text-gray-500 py-6">
            더 많은 활동을 통해 당신에게 맞는 여정을 함께 발견해보세요.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`mb-6 md:mb-8 quiet-victory ${appear ? 'appear' : ''}`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl sm:text-2xl">당신만의 성장 여정</CardTitle>
        <CardDescription className="text-sm sm:text-md">
          당신의 고유한 리듬에 맞는 다음 단계를 제안합니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendationsData.map((rec, index) => (
            <div 
              key={index} 
              className="p-4 rounded-lg border habitus-transition flex flex-col justify-between h-full"
              style={{ 
                borderColor: 'rgba(var(--primary-indigo), 0.2)',
                backgroundColor: 'rgba(var(--primary-indigo), 0.02)'
              }}
            >
              <div>
                <h4 className="font-medium mb-2 text-base sm:text-lg" style={{ color: 'rgb(var(--primary-indigo))' }}>
                  {rec.title}
                </h4>
                <p className="text-xs sm:text-sm text-gray-600 mb-4">{rec.description}</p>
              </div>
              {rec.link ? (
                <Button 
                  onClick={() => router.push(rec.link!)}
                  className="mt-auto self-start text-xs sm:text-sm px-4 py-2 rounded-full"
                  style={{
                    backgroundColor: 'rgb(var(--primary-turquoise))',
                    color: 'white',
                    transition: 'all 0.5s ease-in-out'
                  }}
                >
                  {rec.action || '여정 시작하기'}
                </Button>
              ) : rec.action && (
                <p className="text-sm font-medium mt-auto self-start pt-2" 
                  style={{ color: 'rgb(var(--secondary-green))' }}>
                  {rec.action}
                </p>
              )}
            </div>
          ))}
        </div>
        <div className="text-center mt-6 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-500 italic">
            "모든 식물은 자신만의 해와 비를 필요로 한다."
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecommendationsCard; 