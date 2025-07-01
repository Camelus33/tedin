/**
 * 안전한 클라이언트 시간 수집 유틸리티
 * Shadow Mode: 기존 로직에 영향 없이 사용자 현지 시간 정보 수집
 * 
 * @author Habitus33 Engineering Team
 * @version 1.0.0 (Shadow Mode)
 */

/**
 * 클라이언트 시간 정보 인터페이스
 */
export interface ClientTimeInfo {
  /** 클라이언트에서 생성한 ISO 8601 타임스탬프 */
  clientTimestamp: string;
  /** 클라이언트 시간대 (예: "Asia/Seoul") */
  clientTimezone: string;
  /** UTC로부터의 오프셋 (분 단위, 음수는 UTC보다 빠름) */
  clientTimezoneOffset: number;
  /** 시간 수집 성공 여부 */
  isValid: boolean;
  /** 오류 메시지 (있는 경우) */
  error?: string;
}

/**
 * 브라우저 호환성을 고려한 안전한 시간대 감지
 * 
 * @returns 시간대 문자열 또는 fallback 값
 */
function getSafeTimezone(): string {
  try {
    // 최신 브라우저: Intl.DateTimeFormat API 사용
    if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (timezone && typeof timezone === 'string') {
        return timezone;
      }
    }
    
    // Fallback 1: getTimezoneOffset을 통한 추정
    const offset = new Date().getTimezoneOffset();
    
    // 대한민국 시간대 감지 (-540분 = UTC+9)
    if (offset === -540) {
      return 'Asia/Seoul';
    }
    
    // 일본 시간대 감지 (-540분 = UTC+9)
    if (offset === -540) {
      return 'Asia/Tokyo';
    }
    
    // 중국 시간대 감지 (-480분 = UTC+8)
    if (offset === -480) {
      return 'Asia/Shanghai';
    }
    
    // Fallback 2: UTC 오프셋 기반 표기
    const hours = Math.abs(offset) / 60;
    const sign = offset > 0 ? '-' : '+';
    return `UTC${sign}${hours.toString().padStart(2, '0')}:00`;
    
  } catch (error) {
    console.warn('[TimeUtils] 시간대 감지 실패:', error);
    return 'UTC';
  }
}

/**
 * 안전한 타임스탬프 생성 (ISO 8601 형식)
 * 
 * @returns ISO 형식 타임스탬프 문자열
 */
function getSafeTimestamp(): string {
  try {
    return new Date().toISOString();
  } catch (error) {
    console.warn('[TimeUtils] 타임스탬프 생성 실패:', error);
    // Fallback: 수동으로 ISO 형식 생성
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const ms = String(now.getMilliseconds()).padStart(3, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${ms}Z`;
  }
}

/**
 * 안전한 시간대 오프셋 계산
 * 
 * @returns UTC로부터의 오프셋 (분 단위)
 */
function getSafeTimezoneOffset(): number {
  try {
    return new Date().getTimezoneOffset();
  } catch (error) {
    console.warn('[TimeUtils] 시간대 오프셋 계산 실패:', error);
    return 0; // UTC 기준으로 fallback
  }
}

/**
 * Shadow Mode: 클라이언트 시간 정보 수집
 * 기존 로직에 영향 없이 안전하게 사용자 현지 시간 정보를 수집합니다.
 * 
 * @returns 클라이언트 시간 정보 객체
 */
export function collectClientTimeInfo(): ClientTimeInfo {
  try {
    const clientTimestamp = getSafeTimestamp();
    const clientTimezone = getSafeTimezone();
    const clientTimezoneOffset = getSafeTimezoneOffset();
    
    // 기본적인 유효성 검증
    const isTimestampValid = clientTimestamp && clientTimestamp.includes('T');
    const isTimezoneValid = clientTimezone && clientTimezone.length > 0;
    const isOffsetValid = typeof clientTimezoneOffset === 'number' && !isNaN(clientTimezoneOffset);
    
    const isValid = isTimestampValid && isTimezoneValid && isOffsetValid;
    
    if (!isValid) {
      return {
        clientTimestamp: clientTimestamp || new Date().toISOString(),
        clientTimezone: clientTimezone || 'UTC',
        clientTimezoneOffset: clientTimezoneOffset || 0,
        isValid: false,
        error: '시간 정보 수집 중 일부 데이터가 유효하지 않습니다.'
      };
    }
    
    return {
      clientTimestamp,
      clientTimezone,
      clientTimezoneOffset,
      isValid: true
    };
    
  } catch (error) {
    console.error('[TimeUtils] 클라이언트 시간 정보 수집 실패:', error);
    
    // 완전 실패 시 안전한 기본값 반환
    return {
      clientTimestamp: new Date().toISOString(),
      clientTimezone: 'UTC',
      clientTimezoneOffset: 0,
      isValid: false,
      error: `시간 정보 수집 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    };
  }
}

/**
 * 디버그용: 클라이언트 시간 정보를 콘솔에 출력
 * 개발 환경에서만 사용
 */
export function debugClientTimeInfo(): void {
  if (process.env.NODE_ENV === 'development') {
    const timeInfo = collectClientTimeInfo();
    console.group('[TimeUtils] 클라이언트 시간 정보 Debug');
    console.log('📅 타임스탬프:', timeInfo.clientTimestamp);
    console.log('🌍 시간대:', timeInfo.clientTimezone);
    console.log('⏰ 오프셋:', timeInfo.clientTimezoneOffset, '분');
    console.log('✅ 유효성:', timeInfo.isValid);
    if (timeInfo.error) {
      console.warn('⚠️ 오류:', timeInfo.error);
    }
    console.groupEnd();
  }
}

/**
 * 한국 시간대 여부 확인
 * 
 * @param timeInfo 클라이언트 시간 정보
 * @returns 한국 시간대인지 여부
 */
export function isKoreanTimezone(timeInfo: ClientTimeInfo): boolean {
  return timeInfo.clientTimezone === 'Asia/Seoul' || 
         timeInfo.clientTimezoneOffset === -540; // UTC+9
}

/**
 * 사용자 친화적인 시간 표시 포맷팅
 * 클라이언트 시간을 우선 사용하고, 없으면 서버 시간을 사용합니다.
 * 
 * @param clientTimeISO - 클라이언트에서 기록된 시간 (ISO 문자열)
 * @param serverTimeISO - 서버에서 기록된 시간 (ISO 문자열)
 * @returns 포맷팅된 시간 문자열 또는 오류 메시지
 */
export function formatUserTime(clientTimeISO?: string, serverTimeISO?: string): string {
  // 클라이언트 시간을 우선 사용, 없으면 서버 시간 사용
  const timeToUse = clientTimeISO || serverTimeISO;
  if (!timeToUse) return '정보 없음';
  
  try {
    const date = new Date(timeToUse);
    
    // Invalid Date 체크
    if (isNaN(date.getTime())) {
      return '시간 오류';
    }
    
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  } catch (error) {
    console.warn('[TimeUtils] 시간 포맷팅 오류:', error);
    return '시간 오류';
  }
}

/**
 * 시간 정보 압축 (네트워크 최적화)
 * 필수 정보만 전송하여 페이로드 크기 최소화
 * 
 * @param timeInfo 전체 클라이언트 시간 정보
 * @returns 압축된 시간 정보
 */
export function compressTimeInfo(timeInfo: ClientTimeInfo): {
  ts: string;  // timestamp
  tz: string;  // timezone  
  off: number; // offset
} {
  return {
    ts: timeInfo.clientTimestamp,
    tz: timeInfo.clientTimezone,
    off: timeInfo.clientTimezoneOffset
  };
} 