/**
 * 백엔드 클라이언트 시간 처리 유틸리티
 * 실제 사용자 데이터 기반 안전한 시간 처리
 * 
 * @author Habitus33 Engineering Team
 * @version 1.0.0
 */

/**
 * 클라이언트 시간 정보 인터페이스 (압축된 형태)
 */
export interface CompressedClientTime {
  ts: string;  // timestamp (ISO 8601)
  tz: string;  // timezone
  off: number; // offset (minutes)
}

/**
 * 시간 처리 결과 인터페이스
 */
export interface TimeProcessResult {
  /** 처리된 클라이언트 시간 (Date 객체) */
  clientCreatedAt: Date | null;
  /** 서버 시간 (fallback용) */
  serverCreatedAt: Date;
  /** 클라이언트 시간 사용 여부 */
  useClientTime: boolean;
  /** 처리 과정 로그 */
  processingLog: string[];
  /** 시간 차이 (분 단위) */
  timeDifferenceMin?: number;
}

/**
 * ISO 8601 형식 검증
 */
function isValidISOString(dateString: string): boolean {
  if (!dateString || typeof dateString !== 'string') {
    return false;
  }
  
  // ISO 8601 기본 패턴 확인
  const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
  if (!iso8601Regex.test(dateString)) {
    return false;
  }
  
  // 실제 Date 생성 테스트
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && date.toISOString().substring(0, 19) === dateString.substring(0, 19);
}

/**
 * 시간대 오프셋 검증
 */
function isValidTimezoneOffset(offset: number): boolean {
  return typeof offset === 'number' && 
         !isNaN(offset) && 
         offset >= -12 * 60 && // UTC-12 (최서단)
         offset <= 14 * 60;   // UTC+14 (최동단)
}

/**
 * 시간대 이름 검증
 */
function isValidTimezone(timezone: string): boolean {
  if (!timezone || typeof timezone !== 'string') {
    return false;
  }
  
  // 일반적인 시간대 패턴 확인
  const validPatterns = [
    /^Asia\/.+$/,           // Asia/Seoul, Asia/Tokyo 등
    /^America\/.+$/,        // America/New_York 등
    /^Europe\/.+$/,         // Europe/London 등
    /^UTC([+-]\d{2}:\d{2})?$/, // UTC, UTC+09:00 등
    /^GMT([+-]\d{1,2})?$/   // GMT, GMT+9 등
  ];
  
  return validPatterns.some(pattern => pattern.test(timezone));
}

/**
 * 클라이언트-서버 시간 차이 검증 (과도한 차이 방지)
 */
function isReasonableTimeDifference(clientTime: Date, serverTime: Date): boolean {
  const diffMs = Math.abs(clientTime.getTime() - serverTime.getTime());
  const diffHours = diffMs / (1000 * 60 * 60);
  
  // 48시간 이상 차이나면 비정상으로 판단 (시스템 시계 오류 가능성)
  return diffHours <= 48;
}

/**
 * 클라이언트 시간 정보 안전 처리
 * 
 * @param clientTimeData 클라이언트에서 전송된 압축된 시간 정보
 * @param isValid 클라이언트에서 보고한 유효성
 * @param error 클라이언트에서 보고한 오류 메시지
 * @returns 처리 결과
 */
export function processClientTime(
  clientTimeData?: CompressedClientTime,
  isValid?: boolean,
  error?: string | null
): TimeProcessResult {
  const serverTime = new Date();
  const log: string[] = [];
  
  log.push(`[TimeProcessor] 클라이언트 시간 처리 시작: ${serverTime.toISOString()}`);
  
  // 1. 기본 데이터 존재 여부 확인
  if (!clientTimeData) {
    log.push('[TimeProcessor] 클라이언트 시간 데이터 없음 - 서버 시간 사용');
    return {
      clientCreatedAt: null,
      serverCreatedAt: serverTime,
      useClientTime: false,
      processingLog: log
    };
  }
  
  // 2. 클라이언트 보고 유효성 확인
  if (isValid === false) {
    log.push(`[TimeProcessor] 클라이언트 보고 무효: ${error || '알 수 없는 오류'}`);
    return {
      clientCreatedAt: null,
      serverCreatedAt: serverTime,
      useClientTime: false,
      processingLog: log
    };
  }
  
  try {
    // 3. 타임스탬프 검증
    if (!isValidISOString(clientTimeData.ts)) {
      log.push(`[TimeProcessor] 무효한 타임스탬프 형식: ${clientTimeData.ts}`);
      return {
        clientCreatedAt: null,
        serverCreatedAt: serverTime,
        useClientTime: false,
        processingLog: log
      };
    }
    
    // 4. 시간대 정보 검증
    if (!isValidTimezone(clientTimeData.tz) || !isValidTimezoneOffset(clientTimeData.off)) {
      log.push(`[TimeProcessor] 무효한 시간대 정보: ${clientTimeData.tz}, offset: ${clientTimeData.off}`);
      return {
        clientCreatedAt: null,
        serverCreatedAt: serverTime,
        useClientTime: false,
        processingLog: log
      };
    }
    
    // 5. 클라이언트 시간 생성
    const clientTime = new Date(clientTimeData.ts);
    
    // 6. 시간 차이 합리성 검증
    if (!isReasonableTimeDifference(clientTime, serverTime)) {
      const diffHours = Math.abs(clientTime.getTime() - serverTime.getTime()) / (1000 * 60 * 60);
      log.push(`[TimeProcessor] 과도한 시간 차이 감지: ${diffHours.toFixed(1)}시간`);
      return {
        clientCreatedAt: null,
        serverCreatedAt: serverTime,
        useClientTime: false,
        processingLog: log
      };
    }
    
    // 7. 성공적인 처리
    const timeDiffMs = clientTime.getTime() - serverTime.getTime();
    const timeDiffMin = timeDiffMs / (1000 * 60);
    
    log.push(`[TimeProcessor] 클라이언트 시간 처리 성공`);
    log.push(`[TimeProcessor] 클라이언트: ${clientTime.toISOString()}`);
    log.push(`[TimeProcessor] 서버: ${serverTime.toISOString()}`);
    log.push(`[TimeProcessor] 시간대: ${clientTimeData.tz} (${clientTimeData.off}분)`);
    log.push(`[TimeProcessor] 시간 차이: ${timeDiffMin.toFixed(2)}분`);
    
    return {
      clientCreatedAt: clientTime,
      serverCreatedAt: serverTime,
      useClientTime: true,
      processingLog: log,
      timeDifferenceMin: timeDiffMin
    };
    
  } catch (error) {
    log.push(`[TimeProcessor] 처리 중 오류 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    return {
      clientCreatedAt: null,
      serverCreatedAt: serverTime,
      useClientTime: false,
      processingLog: log
    };
  }
}

/**
 * Note 생성 시 사용할 최종 시간 결정
 * 
 * @param timeResult 시간 처리 결과
 * @returns Note 저장에 사용할 시간 객체
 */
export function getFinalTimeForNote(timeResult: TimeProcessResult): {
  createdAt: Date;
  clientCreatedAt: Date | null;
} {
  return {
    createdAt: timeResult.serverCreatedAt, // 서버 시간은 항상 기록 (기존 로직 유지)
    clientCreatedAt: timeResult.clientCreatedAt // 클라이언트 시간은 유효할 때만 기록
  };
}

/**
 * 시간 처리 로그를 개발 환경에서 출력
 */
export function logTimeProcessing(timeResult: TimeProcessResult, context: string = ''): void {
  if (process.env.NODE_ENV === 'development') {
    console.group(`[TimeProcessor] ${context}`);
    timeResult.processingLog.forEach(log => console.log(log));
    console.log(`사용된 시간: ${timeResult.useClientTime ? '클라이언트' : '서버'} 시간`);
    if (timeResult.timeDifferenceMin !== undefined) {
      console.log(`시간 차이: ${timeResult.timeDifferenceMin.toFixed(2)}분`);
    }
    console.groupEnd();
  }
}

/**
 * 한국 시간대 여부 확인
 */
export function isKoreanTimezone(timezone: string, offset: number): boolean {
  return timezone === 'Asia/Seoul' || offset === -540; // UTC+9
} 