'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AxiosError } from 'axios';
import CognitiveProfileChart from './CognitiveProfileChart';

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

const CognitiveProfileContainer: React.FC<CognitiveProfileContainerProps> = ({ className = '' }) => {
  // State for cognitive profile data
  const [profileData, setProfileData] = useState<CognitiveProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timePeriod, setTimePeriod] = useState<'all' | 'week' | 'month' | 'year'>('month');

  // Fetch cognitive profile data from the API
  useEffect(() => {
    const controller = new AbortController();
    const fetchCognitiveProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        if (!token) {
          setError('인증이 필요합니다');
          return;
        }

        const response = await axios.get<CognitiveProfileResponse>(
          `/api/zengo/cognitive-profile?period=${timePeriod}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          }
        );

        // Log the successful response data
        console.log('Fetched Cognitive Profile Data:', response.data);
        setProfileData(response.data);
      } catch (err) {
        console.error('인지 능력 프로필 데이터 가져오기 실패:', err);
        if (axios.isAxiosError(err)) {
          if (err.code === 'ERR_CANCELED') {
            return;
          }
          if (err.response) {
            if (err.response.status === 401) {
              setError('인증이 필요합니다');
            } else if (err.response.status >= 500) {
              setError('서버 오류가 발생했습니다');
            } else {
              setError('데이터를 불러오는 중 오류가 발생했습니다');
            }
          } else {
            setError('네트워크 연결을 확인하세요');
          }
        } else {
          setError('알 수 없는 오류가 발생했습니다');
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
    <div className={`bg-white rounded-xl shadow-md overflow-hidden ${className}`}>
      <div className="p-6 md:p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">정보 처리 역량 분석</h2>
        <p className="text-sm text-gray-500 mb-6 text-center">매번 변화하는 자신을 관찰하세요</p>
        
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
                className={`px-3 py-1 text-sm font-medium border border-gray-200 
                  transition-colors duration-150 
                  ${
                    timePeriod === period.key
                      ? 'bg-indigo-600 text-white z-10 ring-1 ring-indigo-600'
                      : 'bg-white text-indigo-700 hover:bg-indigo-50'
                  }
                  ${
                    index === 0 ? 'rounded-l-md' : ''
                  }
                  ${
                    index === arr.length - 1 ? 'rounded-r-md' : ''
                  }
                `}
                onClick={() => setTimePeriod(period.key as 'all' | 'week' | 'month' | 'year')}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-60">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : (
          <div className="space-y-8">
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