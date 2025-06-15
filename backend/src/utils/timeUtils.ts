/**
 * 시간 데이터 타입 일관성을 위한 유틸리티 클래스
 * Date 객체와 ISO 문자열 간의 변환을 표준화하여 AI 에이전트 호환성 확보
 */
export class TimeUtils {
  /**
   * Date 객체나 문자열을 ISO 8601 문자열로 변환
   * @param date Date 객체, 문자열, 또는 undefined
   * @returns ISO 8601 형식 문자열 또는 undefined
   */
  static toISOString(date: Date | string | undefined | null): string | undefined {
    if (!date) return undefined;
    
    try {
      if (date instanceof Date) {
        return date.toISOString();
      }
      
      if (typeof date === 'string') {
        // 이미 ISO 형식인지 확인
        if (date.includes('T') && date.includes('Z')) {
          return date;
        }
        // 문자열을 Date로 변환 후 ISO 형식으로 변환
        return new Date(date).toISOString();
      }
      
      return undefined;
    } catch (error) {
      console.warn('TimeUtils.toISOString: Invalid date format', date);
      return undefined;
    }
  }

  /**
   * 다양한 형태의 입력을 Date 객체로 변환
   * @param dateInput Date 객체, 문자열, 또는 undefined
   * @returns Date 객체 (실패 시 현재 시간)
   */
  static ensureDate(dateInput: any): Date {
    if (!dateInput) return new Date();
    
    try {
      if (dateInput instanceof Date) {
        return dateInput;
      }
      
      if (typeof dateInput === 'string' || typeof dateInput === 'number') {
        const date = new Date(dateInput);
        // 유효한 날짜인지 확인
        if (isNaN(date.getTime())) {
          console.warn('TimeUtils.ensureDate: Invalid date, using current time', dateInput);
          return new Date();
        }
        return date;
      }
      
      return new Date();
    } catch (error) {
      console.warn('TimeUtils.ensureDate: Error parsing date, using current time', dateInput);
      return new Date();
    }
  }

  /**
   * 초를 ISO 8601 기간 형식으로 변환 (예: PT1H30M5S)
   * @param seconds 초 단위 시간
   * @returns ISO 8601 기간 형식 문자열
   */
  static formatDurationISO8601(seconds: number): string {
    if (!seconds || seconds <= 0) return "PT0S";
    
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    let duration = "PT";
    if (h > 0) duration += `${h}H`;
    if (m > 0) duration += `${m}M`;
    if (s > 0 || (h === 0 && m === 0)) duration += `${s}S`;
    
    return duration;
  }

  /**
   * 두 날짜 간의 차이를 초 단위로 계산
   * @param startDate 시작 날짜
   * @param endDate 종료 날짜
   * @returns 초 단위 차이
   */
  static getDifferenceInSeconds(startDate: Date | string, endDate: Date | string): number {
    const start = this.ensureDate(startDate);
    const end = this.ensureDate(endDate);
    
    return Math.abs(end.getTime() - start.getTime()) / 1000;
  }

  /**
   * 날짜가 유효한지 확인
   * @param date 확인할 날짜
   * @returns 유효성 여부
   */
  static isValidDate(date: any): boolean {
    if (!date) return false;
    
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      return !isNaN(dateObj.getTime());
    } catch {
      return false;
    }
  }

  /**
   * 현재 시간을 ISO 8601 형식으로 반환
   * @returns 현재 시간의 ISO 8601 문자열
   */
  static nowISO(): string {
    return new Date().toISOString();
  }

  /**
   * 날짜 배열을 시간순으로 정렬
   * @param dates 날짜 배열
   * @param ascending 오름차순 여부 (기본값: true)
   * @returns 정렬된 날짜 배열
   */
  static sortDates(dates: (Date | string)[], ascending: boolean = true): Date[] {
    const validDates = dates
      .map(date => this.ensureDate(date))
      .filter(date => this.isValidDate(date));
    
    return validDates.sort((a, b) => {
      const diff = a.getTime() - b.getTime();
      return ascending ? diff : -diff;
    });
  }
} 