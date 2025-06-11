// cognitiveMetricsV2.test.ts

// 이 파일의 다른 함수들은 복잡한 의존성을 가지므로,
// 독립적인 applyDifficultyBonus 함수만 먼저 테스트합니다.
// TODO: 향후 전체 calculateCognitiveMetricsV2 함수에 대한 통합 테스트 추가 필요

// 테스트 대상 함수가 private 함수이므로, 테스트를 위해 export 해야 합니다.
// cognitiveMetricsV2.ts 파일의 마지막에 다음을 추가하세요:
// export { applyDifficultyBonus }; 
// 위 변경이 어렵다면, 여기서는 임시로 함수를 복제하여 테스트합니다.

import { applyDifficultyBonus, calculateCognitiveMetricsV2 } from './cognitiveMetricsV2';

// statistics 모듈의 normInv 함수를 모의(mock) 처리합니다.
// 이 함수는 정규 분포의 역함수를 계산하는데, 테스트에서는 예측 가능한 값을 반환하도록 설정하여
// 외부 요인에 의한 테스트 실패를 방지합니다.
jest.mock('./statistics', () => ({
  normInv: jest.fn((p) => {
    if (p <= 0.01) return -2.326;
    if (p >= 0.99) return 2.326;
    if (p > 0.45 && p < 0.55) return 0;
    // 테스트의 일관성을 위한 단순화된 가짜 값
    return p * 2 - 1;
  }),
}));

describe('applyDifficultyBonus', () => {

  // 1. 기본 시나리오: 일반적인 값이 주어졌을 때
  test('should apply a standard difficulty bonus correctly', () => {
    // 80점에 1.1배 보너스를 주면 88점이 되어야 함
    expect(applyDifficultyBonus(80, 1.1)).toBe(88);
  });

  // 2. 상한선(캡) 테스트: 보너스 적용 후 100점을 초과하는 경우
  test('should cap the score at 100 if the bonus pushes it over', () => {
    // 95점에 1.1배 보너스를 주면 104.5점이 되지만, 100점으로 제한되어야 함
    expect(applyDifficultyBonus(95, 1.1)).toBe(100);
    // 100점에 보너스를 줘도 100점이어야 함
    expect(applyDifficultyBonus(100, 1.2)).toBe(100);
  });

  // 3. 하한선(플로어) 테스트: 음수 값이 계산되는 경우
  test('should keep the score at 0 if the value is negative', () => {
    // -10점에 보너스를 줘도 0점이어야 함
    expect(applyDifficultyBonus(-10, 1.5)).toBe(0);
    // 50점에 음수 배율을 곱해도 0점이어야 함 (논리적으로는 없지만 엣지 케이스)
    expect(applyDifficultyBonus(50, -1)).toBe(0);
  });
  
  // 4. 경계값 테스트: 0점일 때
  test('should return 0 when the base value is 0', () => {
    // 0점은 어떤 보너스를 받아도 0점이어야 함
    expect(applyDifficultyBonus(0, 1.5)).toBe(0);
  });

  // 5. 반올림 테스트
  test('should round the result to the nearest integer', () => {
    // 80.4는 80으로 반올림되어야 함
    expect(applyDifficultyBonus(40.2, 2)).toBe(80);
    // 80.5는 81로 반올림되어야 함
    expect(applyDifficultyBonus(40.25, 2)).toBe(81);
  });

  // 6. 보너스가 없는 경우 (배율이 1인 경우)
  test('should not change the value when multiplier is 1', () => {
    expect(applyDifficultyBonus(75, 1)).toBe(75);
  });

  // 7. 보너스가 1보다 작은 경우 (패널티)
  test('should reduce the value when multiplier is less than 1', () => {
    expect(applyDifficultyBonus(80, 0.9)).toBe(72);
  });
});

describe('calculateCognitiveMetricsV2', () => {
  
  // 테스트 케이스 1: 상세 데이터가 없는 기본 계산 경로
  test('should calculate metrics using the basic path when detailedData is not provided', () => {
    const basicResult = {
      correctPlacements: 8,
      incorrectPlacements: 2,
      timeTakenMs: 30000, // 30초
      completedSuccessfully: true,
      orderCorrect: true,
    };
    const boardSize = 5;

    const metrics = calculateCognitiveMetricsV2(basicResult, undefined, boardSize);

    // 복잡한 결과 객체를 스냅샷으로 저장하여 일관성을 검증합니다.
    expect(metrics).toMatchSnapshot();
  });

  // 테스트 케이스 2: 상세 데이터가 있는 고급 계산 경로
  test('should calculate metrics using the advanced path when detailedData is provided', () => {
    const basicResult = {
      correctPlacements: 9,
      incorrectPlacements: 1,
      timeTakenMs: 25000, // 25초
      completedSuccessfully: true,
      orderCorrect: true,
    };
    const detailedData = {
      firstClickLatency: 1500,
      interClickIntervals: [1000, 1200, 900, 1100, 1300, 950, 1050, 1150],
      hesitationPeriods: [2500],
      spatialErrors: [5], // 5px 오차
      clickPositions: [], // 테스트에서는 사용되지 않으므로 생략
      correctPositions: [], // 테스트에서는 사용되지 않으므로 생략
      sequentialAccuracy: 1, // 100%
      temporalOrderViolations: 0,
      detailedDataVersion: 'v2.0',
    };
    const boardSize = 3;

    const metrics = calculateCognitiveMetricsV2(basicResult, detailedData, boardSize);
    
    // 고급 경로의 결과도 스냅샷으로 검증합니다.
    expect(metrics).toMatchSnapshot();
  });
}); 