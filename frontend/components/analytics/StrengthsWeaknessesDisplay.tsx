'use client';

import React from 'react';

// page.tsx에 정의된 CognitiveMetrics와 동일한 구조를 가정합니다.
// 실제 애플리케이션에서는 공유 타입 파일을 통해 import하는 것이 좋습니다.
interface CognitiveMetricsStubForSW {
  workingMemoryCapacity: number;
  visuospatialPrecision: number;
  processingSpeed: number;
  sustainedAttention: number;
  patternRecognition: number;
  cognitiveFlexibility: number;
  hippocampusActivation: number;
  executiveFunction: number;
}

interface StrengthsWeaknessesDisplayProps {
  strengthsData: (keyof CognitiveMetricsStubForSW)[] | undefined | null;
  improvementAreasData: (keyof CognitiveMetricsStubForSW)[] | undefined | null;
  metricDisplayNames: Record<keyof CognitiveMetricsStubForSW, string>;
}

const StrengthsWeaknessesDisplay: React.FC<StrengthsWeaknessesDisplayProps> = ({
  strengthsData,
  improvementAreasData,
  metricDisplayNames,
}) => {
  const hasStrengths = strengthsData && strengthsData.length > 0;
  const hasImprovementAreas = improvementAreasData && improvementAreasData.length > 0;

  return (
    // lg:col-span-1 implicitly handled by the grid in page.tsx
    <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 h-full">
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-4">강점 및 개선 영역</h2>
      <div className="space-y-4">
        {hasStrengths && (
          <div>
            <h3 className="font-semibold text-green-700 mb-2 text-md sm:text-lg">나의 강점</h3>
            {strengthsData!.map((key) => (
              <div key={`strength-${key}`} className="p-3 bg-green-50 rounded-lg mb-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-green-800 text-sm sm:text-base">
                    {metricDisplayNames[key] || key}
                  </h4>
                  {/* Optional: Add a small icon or visual cue for strength */}
                </div>
              </div>
            ))}
          </div>
        )}

        {hasImprovementAreas && (
          <div>
            <h3 className="font-semibold text-yellow-700 mb-2 text-md sm:text-lg">개선하면 좋은 영역</h3>
            {improvementAreasData!.map((key) => (
              <div key={`improvement-${key}`} className="p-3 bg-yellow-50 rounded-lg mb-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-yellow-800 text-sm sm:text-base">
                    {metricDisplayNames[key] || key}
                  </h4>
                  {/* Optional: Add a small icon or visual cue for improvement area */}
                </div>
              </div>
            ))}
          </div>
        )}

        {!hasStrengths && !hasImprovementAreas && (
          <p className="text-sm text-gray-500 text-center py-4">
            데이터를 분석 중입니다. 몇 개의 게임을 더 플레이해 보세요.
          </p>
        )}
      </div>
    </div>
  );
};

export default StrengthsWeaknessesDisplay; 