'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CognitiveProfileChart from './CognitiveProfileChart';
import CognitiveTimeSeriesChart from './CognitiveTimeSeriesChart';

// API response interface
interface CognitiveProfileResponse {
  currentProfile: {
    hippocampusActivation: number;
    workingMemory: number;
    spatialCognition: number;
    attention: number;
    patternRecognition: number;
    cognitiveFlexibility: number;
  };
  historicalData: Array<{
    date: string;
    metrics: {
      hippocampusActivation: number;
      workingMemory: number;
      spatialCognition: number;
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
    const fetchCognitiveProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        if (!token) {
          setError('인증이 필요합니다');
          setIsLoading(false);
          return;
        }

        const response = await axios.get<CognitiveProfileResponse>(
          `/api/zengo/cognitive-profile?period=${timePeriod}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setProfileData(response.data);
      } catch (err) {
        console.error('인지 능력 프로필 데이터 가져오기 실패:', err);
        setError('데이터를 불러오는 중 오류가 발생했습니다');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCognitiveProfile();
  }, [timePeriod]);

  // Placeholder empty data for when no data is available
  const emptyProfileData = {
    currentProfile: {
      hippocampusActivation: 0,
      workingMemory: 0,
      spatialCognition: 0,
      attention: 0,
      patternRecognition: 0,
      cognitiveFlexibility: 0,
    },
    historicalData: [],
  };

  return (
    <div className={`bg-white rounded-xl shadow-md overflow-hidden ${className}`}>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">인지 능력 측정</h2>
        
        {/* Time period selector */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex rounded-md shadow-sm">
            {['week', 'month', 'year', 'all'].map((period) => (
              <button
                key={period}
                type="button"
                className={`px-4 py-2 text-sm font-medium ${
                  timePeriod === period
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } ${
                  period === 'week'
                    ? 'rounded-l-lg'
                    : period === 'all'
                    ? 'rounded-r-lg'
                    : ''
                } border border-gray-300`}
                onClick={() => setTimePeriod(period as 'all' | 'week' | 'month' | 'year')}
              >
                {period === 'week' ? '1주' : 
                 period === 'month' ? '1개월' : 
                 period === 'year' ? '1년' : '전체'}
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
              <h3 className="text-lg font-semibold mb-3 text-center">인지 능력 프로필</h3>
              <CognitiveProfileChart 
                data={profileData?.currentProfile || emptyProfileData.currentProfile} 
              />
            </div>
            
            {/* Cognitive Metrics Time Series */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-center">인지 능력 변화 추이</h3>
              {profileData?.historicalData?.length ? (
                <CognitiveTimeSeriesChart 
                  data={profileData.historicalData} 
                />
              ) : (
                <div className="text-center text-gray-500 py-8">
                  데이터가 충분하지 않습니다. 제고(Zengo) 게임을 더 플레이하여 데이터를 쌓아보세요.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CognitiveProfileContainer; 