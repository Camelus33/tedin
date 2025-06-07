'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/navigation';
import { useRouter } from 'next/navigation';
import CognitiveProfileChart from './CognitiveProfileChart';
import { apiClient } from '@/lib/apiClient';
import { toast } from 'react-hot-toast';

// API response interface
interface CognitiveProfileResponse {
  currentProfile: {
    hippocampusActivation: number;
    workingMemory: number;
    processingSpeed: number;
    attention: number;
    patternRecognition: number;
    cognitiveFlexibility: number;
  };
  historicalData: Array<{
    date: string;
    metrics: {
      hippocampusActivation: number;
      workingMemory: number;
      processingSpeed: number;
      attention: number;
      patternRecognition: number;
      cognitiveFlexibility: number;
    };
  }>;
}

// Component props
interface CognitiveProfileContainerProps {
  className?: string;
}

// [인지능력 프로필 데이터 집계/연계 가이드]
// - 본 컴포넌트는 /api/zengo/cognitive-profile API를 통해 젠고 기본(오리지널) 모드의 결과만을 집계/시각화합니다.
// - Myverse/오리지널/마이버스 등 모드별 데이터는 절대 혼용되지 않으며, 오직 젠고 기본 결과만 인지능력 프로필에 반영됩니다.
// - 프로필은 최근 N회(기본 3회) 결과의 평균값(hippocampusActivation, workingMemory, processingSpeed, attention, patternRecognition, cognitiveFlexibility 등)으로 산출됩니다.
// - calculateCognitiveMetrics 유틸에서 각 세션 결과를 기반으로 주요 인지 지표를 산출합니다.
// - 유지보수 시 결과 저장, 프로필 집계, 시각화(대시보드/통계) 연계 구조를 반드시 함께 점검하세요.

const CognitiveProfileContainer: React.FC<CognitiveProfileContainerProps> = ({ className = '' }) => {
  const router = useRouter();
  // State for cognitive profile data
  const [profileData, setProfileData] = useState<CognitiveProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timePeriod, setTimePeriod] = useState<'all' | 'week' | 'month' | 'year'>('month');
  const [isTransitioning, setIsTransitioning] = useState(false);

  // 인지 프로필 클릭 핸들러 추가
  const handleCognitiveProfileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // 로그인 상태 확인 (localStorage에서 토큰 체크)
    const token = localStorage.getItem('token');
    
    if (!token) {
      toast.error('로그인이 필요합니다.');
      router.push('/auth/login');
      return;
    }
    
    // 토큰이 있으면 브레인 역량 분석 페이지로 이동
    router.push('/analytics');
  };

  // 기간 변경 핸들러 개선
  const handlePeriodChange = (newPeriod: 'all' | 'week' | 'month' | 'year') => {
    setIsTransitioning(true);
    setTimeout(() => {
      setTimePeriod(newPeriod);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 800);
    }, 300);
  };

  // Fetch cognitive profile data from the API
  useEffect(() => {
    const controller = new AbortController();
    const fetchCognitiveProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const responseData: CognitiveProfileResponse = await apiClient.get(
          `/zengo/cognitive-profile?period=${timePeriod}`,
        );

        // Log the successful response data
        console.log('Fetched Cognitive Profile Data:', responseData);
        setProfileData(responseData);
      } catch (err: any) {
        console.error('인지 능력 프로필 데이터 가져오기 실패:', err);
        if (err.name === 'AbortError') {
          console.log('Cognitive profile fetch aborted');
          return;
        }
        if (err.message && err.message.includes('인증')) {
          setError('인증이 필요합니다');
        } else if (err.message && err.message.includes('서버 오류')) {
          setError('서버 오류가 발생했습니다');
        } else if (err.message && err.message.includes('404')) {
          setError('프로필 데이터를 찾을 수 없습니다.');
        } else {
          setError('데이터를 불러오는 중 오류가 발생했습니다: ' + (err.message || '알 수 없는 오류'));
        }
      } finally {
        setIsLoading(false);
      }
    };

    const handler = setTimeout(fetchCognitiveProfile, 200);
    return () => {
      clearTimeout(handler);
      controller.abort();
    };
  }, [timePeriod]);

  // Placeholder empty data for when no data is available
  const emptyProfileData = {
    currentProfile: {
      hippocampusActivation: 0,
      workingMemory: 0,
      processingSpeed: 0,
      attention: 0,
      patternRecognition: 0,
      cognitiveFlexibility: 0,
    },
    historicalData: [],
  };

  return (
    <div className={`bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-indigo-100 shadow-sm overflow-hidden ${className}`}>
      <div className="p-6 md:p-8">
        <a href="#" onClick={handleCognitiveProfileClick} className="group inline-block">
          <h2 className="text-2xl font-medium text-indigo-900 mb-2 text-center group-hover:text-indigo-600 transition-colors">
            나의 인지 여정
            <span className="inline-block ml-1 text-indigo-500 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-700">→</span>
          </h2>
          <p className="text-sm text-indigo-700 mb-6 text-center group-hover:text-indigo-500 transition-colors">
            당신만의 고유한 인지 리듬을 발견하세요
          </p>
        </a>
        
        {/* 자연 메타포 추가 */}
        <div className="text-center mb-6 text-indigo-800">
          <p className="text-sm italic">
            "물이 흐르듯 자연스러운 당신의 인지 흐름을 관찰하세요"
          </p>
        </div>
        
        {/* Time period selector */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex rounded-md shadow-sm">
            {[
              { key: 'week', label: '1주' },
              { key: 'month', label: '1개월' },
              { key: 'year', label: '1년' },
              { key: 'all', label: '전체' },
            ].map((period, index, arr) => (
              <button
                key={period.key}
                type="button"
                className={`px-3 py-1 text-sm font-medium border 
                  transition-colors duration-500 
                  ${
                    timePeriod === period.key
                      ? 'bg-indigo-100 text-indigo-900 z-10 border-indigo-200'
                      : 'bg-white text-indigo-800 hover:bg-blue-50 border-gray-100'
                  }
                  ${index === 0 ? 'rounded-l-md' : ''}
                  ${index === arr.length - 1 ? 'rounded-r-md' : ''}
                `}
                onClick={() => handlePeriodChange(period.key as 'all' | 'week' | 'month' | 'year')}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-60">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <div className="text-center text-indigo-500 py-8 bg-indigo-50 rounded-lg">{error}</div>
        ) : (
          <div className={`space-y-8 transition-opacity duration-700 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}>
            {/* Cognitive Profile Radar Chart */}
            <div>
              <CognitiveProfileChart 
                data={profileData?.currentProfile || emptyProfileData.currentProfile} 
                previousData={profileData?.historicalData && profileData.historicalData.length > 1 ? profileData.historicalData[profileData.historicalData.length - 2]?.metrics : undefined}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CognitiveProfileContainer; 