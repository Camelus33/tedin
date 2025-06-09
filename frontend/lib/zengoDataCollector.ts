/**
 * ZengoDataCollector - 젠고 게임에서 상세한 인지과학적 데이터를 수집하는 유틸리티
 * 
 * 수집하는 데이터:
 * - 시간 관련: 첫 클릭 지연, 클릭 간 간격, 망설임 시간
 * - 공간 관련: 클릭 위치, 공간 오차, 정답 위치
 * - 순서 관련: 클릭 순서, 순서 정확도
 */

export interface DetailedSessionData {
  // 시간 분석 변수
  firstClickLatency?: number;
  interClickIntervals: number[];
  hesitationPeriods: number[];
  
  // 공간 인지 변수
  spatialErrors: number[];
  clickPositions: { x: number; y: number; timestamp: number }[];
  correctPositions: { x: number; y: number }[];
  
  // 순서 및 패턴 변수
  sequentialAccuracy?: number;
  temporalOrderViolations?: number;
  
  // 메타 정보
  detailedDataVersion: string;
}

export class ZengoDataCollector {
  private gameStartTime: number = 0;
  private lastClickTime: number = 0;
  private lastMouseMoveTime: number = 0;
  private firstClickRecorded: boolean = false;
  
  // 수집된 데이터
  private data: DetailedSessionData = {
    interClickIntervals: [],
    hesitationPeriods: [],
    spatialErrors: [],
    clickPositions: [],
    correctPositions: [],
    detailedDataVersion: 'v2.0'
  };
  
  // 정답 위치 (게임 시작 시 설정)
  private expectedPositions: { x: number; y: number }[] = [];
  private expectedSequence: number[] = []; // 정답 순서
  private userSequence: number[] = []; // 사용자 클릭 순서

  /**
   * 게임 시작 시 호출 - 데이터 수집 초기화
   */
  startSession(correctPositions: { x: number; y: number }[], expectedSequence?: number[]): void {
    this.gameStartTime = performance.now();
    this.lastClickTime = 0;
    this.lastMouseMoveTime = this.gameStartTime;
    this.firstClickRecorded = false;
    
    // 데이터 초기화
    this.data = {
      interClickIntervals: [],
      hesitationPeriods: [],
      spatialErrors: [],
      clickPositions: [],
      correctPositions: [...correctPositions],
      detailedDataVersion: 'v2.0'
    };
    
    this.expectedPositions = [...correctPositions];
    this.expectedSequence = expectedSequence || [];
    this.userSequence = [];
    
    console.log('[ZengoDataCollector] 세션 시작 - 정답 위치:', correctPositions);
  }

  /**
   * 마우스 움직임 추적 (망설임 시간 측정용)
   */
  trackMouseMovement(x: number, y: number): void {
    const now = performance.now();
    
    // 1초 이상 마우스가 멈춰있었다면 망설임으로 기록
    if (this.lastMouseMoveTime && (now - this.lastMouseMoveTime) > 1000) {
      const hesitationTime = now - this.lastMouseMoveTime;
      this.data.hesitationPeriods.push(hesitationTime);
      console.log('[ZengoDataCollector] 망설임 감지:', hesitationTime + 'ms');
    }
    
    this.lastMouseMoveTime = now;
  }

  /**
   * 클릭 이벤트 기록
   */
  recordClick(clickX: number, clickY: number, gridX: number, gridY: number): void {
    const now = performance.now();
    
    // 첫 클릭 지연시간 기록
    if (!this.firstClickRecorded) {
      this.data.firstClickLatency = now - this.gameStartTime;
      this.firstClickRecorded = true;
      console.log('[ZengoDataCollector] 첫 클릭 지연시간:', this.data.firstClickLatency + 'ms');
    } else {
      // 클릭 간 간격 기록
      if (this.lastClickTime > 0) {
        const interval = now - this.lastClickTime;
        this.data.interClickIntervals.push(interval);
        console.log('[ZengoDataCollector] 클릭 간격:', interval + 'ms');
      }
    }
    
    // 클릭 위치와 시간 기록
    this.data.clickPositions.push({
      x: clickX,
      y: clickY,
      timestamp: now
    });
    
    // 사용자 클릭 순서 기록 (격자 좌표 기준)
    const positionIndex = this.expectedPositions.findIndex(pos => pos.x === gridX && pos.y === gridY);
    if (positionIndex !== -1) {
      this.userSequence.push(positionIndex);
    }
    
    // 공간 오차 계산
    const spatialError = this.calculateSpatialError(gridX, gridY);
    if (spatialError !== null) {
      this.data.spatialErrors.push(spatialError);
      console.log('[ZengoDataCollector] 공간 오차:', spatialError);
    }
    
    this.lastClickTime = now;
  }

  /**
   * 공간 오차 계산 (클릭한 격자 위치와 가장 가까운 정답 위치 간의 거리)
   */
  private calculateSpatialError(gridX: number, gridY: number): number | null {
    if (this.expectedPositions.length === 0) return null;
    
    let minDistance = Infinity;
    
    for (const correctPos of this.expectedPositions) {
      const distance = Math.sqrt(
        Math.pow(gridX - correctPos.x, 2) + Math.pow(gridY - correctPos.y, 2)
      );
      minDistance = Math.min(minDistance, distance);
    }
    
    return minDistance;
  }

  /**
   * 순서 정확도 계산
   */
  private calculateSequentialAccuracy(): number {
    if (this.expectedSequence.length === 0 || this.userSequence.length === 0) {
      return 0;
    }
    
    let correctSequenceCount = 0;
    const minLength = Math.min(this.expectedSequence.length, this.userSequence.length);
    
    for (let i = 0; i < minLength; i++) {
      if (this.expectedSequence[i] === this.userSequence[i]) {
        correctSequenceCount++;
      }
    }
    
    return correctSequenceCount / this.expectedSequence.length;
  }

  /**
   * 시간순서 위반 횟수 계산
   */
  private calculateTemporalOrderViolations(): number {
    let violations = 0;
    
    for (let i = 1; i < this.userSequence.length; i++) {
      // 이전 클릭보다 순서가 앞선 위치를 클릭한 경우
      if (this.userSequence[i] < this.userSequence[i - 1]) {
        violations++;
      }
    }
    
    return violations;
  }

  /**
   * 게임 종료 시 최종 데이터 반환
   */
  finishSession(): DetailedSessionData {
    // 순서 관련 지표 계산
    this.data.sequentialAccuracy = this.calculateSequentialAccuracy();
    this.data.temporalOrderViolations = this.calculateTemporalOrderViolations();
    
    console.log('[ZengoDataCollector] 세션 완료 - 수집된 데이터:', {
      firstClickLatency: this.data.firstClickLatency,
      interClickIntervals: this.data.interClickIntervals.length + '개',
      hesitationPeriods: this.data.hesitationPeriods.length + '개',
      spatialErrors: this.data.spatialErrors.length + '개',
      sequentialAccuracy: this.data.sequentialAccuracy,
      temporalOrderViolations: this.data.temporalOrderViolations
    });
    
    return { ...this.data };
  }

  /**
   * 현재까지 수집된 데이터 반환 (디버그용)
   */
  getCurrentData(): DetailedSessionData {
    return { ...this.data };
  }
}

// 싱글톤 인스턴스 생성
export const zengoDataCollector = new ZengoDataCollector(); 