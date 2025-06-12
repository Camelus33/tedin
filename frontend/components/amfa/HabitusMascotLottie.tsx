"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { amfaTheme } from './theme';

// Lottie 컴포넌트를 동적으로 로드 (SSR 호환성)
const Lottie = dynamic(() => import('lottie-react'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="animate-pulse bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full w-full h-full" />
    </div>
  )
});

interface HabitusMascotLottieProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  autoplay?: boolean;
  loop?: boolean;
  className?: string;
}

export function HabitusMascotLottie({ 
  size = 'lg', 
  autoplay = true,
  loop = true,
  className = '' 
}: HabitusMascotLottieProps) {
  const [animationData, setAnimationData] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24', 
    lg: 'w-32 h-32',
    xl: 'w-48 h-48'
  };

  // SSR 호환성을 위한 클라이언트 사이드 체크
  useEffect(() => {
    setIsClient(true);
    
    // Lottie 애니메이션 데이터 로드
    const loadAnimation = async () => {
      try {
        const response = await fetch('/animations/habitus-mascot.json');
        const data = await response.json();
        setAnimationData(data);
      } catch (error) {
        console.error('Lottie 애니메이션 로드 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnimation();
  }, []);

  // 서버 사이드 또는 로딩 중일 때 fallback 렌더링
  if (!isClient || isLoading || !animationData) {
    return (
      <div className={`relative ${sizeClasses[size]} ${className}`}>
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 animate-pulse" />
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          <div className={`text-4xl ${amfaTheme.primary} animate-bounce`}>🐪</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {/* Lottie 애니메이션 */}
      <div className="w-full h-full">
        <Lottie
          animationData={animationData}
          autoplay={autoplay}
          loop={loop}
          style={{
            width: '100%',
            height: '100%',
            filter: 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.1))'
          }}
        />
      </div>

      {/* 추가 시각적 효과 */}
      <div className="absolute inset-0 rounded-full pointer-events-none">
        {/* 배경 글로우 효과 */}
        <div 
          className={`
            absolute inset-0 rounded-full 
            bg-gradient-to-br from-cyan-500/10 to-purple-500/10
            animate-pulse
          `}
        />
        
        {/* 반짝이는 파티클 */}
        <div 
          className={`
            absolute top-2 right-2 w-2 h-2 
            bg-gradient-to-br from-cyan-400 to-purple-400 
            rounded-full animate-ping
          `}
        />
        <div 
          className={`
            absolute bottom-3 left-3 w-1 h-1 
            bg-gradient-to-br from-purple-400 to-cyan-400 
            rounded-full animate-pulse
          `}
        />
      </div>
    </div>
  );
}

// 기본 Lottie 옵션
export const defaultLottieOptions = {
  loop: true,
  autoplay: true,
  rendererSettings: {
    preserveAspectRatio: 'xMidYMid slice'
  }
}; 