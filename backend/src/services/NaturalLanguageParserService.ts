/**
 * Natural Language Parser Service
 * Parses natural language expressions including date, time, and comprehension scores
 */
export class NaturalLanguageParserService {
  /**
   * Parse natural language expressions (date, time, comprehension score)
   */
  static parseNaturalLanguageExpression(expression: string): {
    type: 'date' | 'time' | 'datetime' | 'range' | 'comprehension';
    start?: Date;
    end?: Date;
    timeRange?: { start: string; end: string };
    comprehensionScore?: { min: number; max?: number; operator: 'gte' | 'lte' | 'eq' | 'range' };
    originalExpression: string;
  } {
    const normalized = expression.toLowerCase().trim();
    
    // 이해도점수 패턴들
    const comprehensionPatterns = [
      // 특정 점수 이상/이하 (더 구체적인 패턴을 먼저)
      { regex: /이해도점수\s*(\d+)점\s*이상/g, type: 'comprehension', operator: 'gte' },
      { regex: /이해도점수\s*(\d+)점\s*이하/g, type: 'comprehension', operator: 'lte' },
      { regex: /이해도점수\s*(\d+)점(?!\s*[월일시])/g, type: 'comprehension', operator: 'eq' },
      { regex: /이해도\s*(\d+)점\s*이상/g, type: 'comprehension', operator: 'gte' },
      { regex: /이해도\s*(\d+)점\s*이하/g, type: 'comprehension', operator: 'lte' },
      { regex: /이해도\s*(\d+)점(?!\s*[월일시])/g, type: 'comprehension', operator: 'eq' },
      { regex: /(\d+)점\s*이상/g, type: 'comprehension', operator: 'gte' },
      { regex: /(\d+)점\s*이하/g, type: 'comprehension', operator: 'lte' },
      // 더 엄격한 점수 패턴 (날짜/시간 키워드 뒤에 오지 않는 경우만)
      { regex: /(?<![\d월일시])\s*(\d+)점(?!\s*[월일시])/g, type: 'comprehension', operator: 'eq' },
      
      // 범위 표현
      { regex: /이해도점수\s*(\d+)점\s*~?\s*(\d+)점/g, type: 'comprehension', operator: 'range' },
      { regex: /이해도\s*(\d+)점\s*~?\s*(\d+)점/g, type: 'comprehension', operator: 'range' },
      { regex: /(\d+)점\s*~?\s*(\d+)점/g, type: 'comprehension', operator: 'range' },
    ];

    // 날짜 패턴들
    const datePatterns = [
      // 특정 날짜
      { regex: /(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/, type: 'date' },
      { regex: /(\d{1,2})월\s*(\d{1,2})일/, type: 'date' },
      { regex: /(\d{1,2})일/, type: 'date' },
      { regex: /오늘/, type: 'date' },
      { regex: /어제/, type: 'date' },
      { regex: /내일/, type: 'date' },
      { regex: /이번\s*주/, type: 'date' },
      { regex: /지난\s*주/, type: 'date' },
      { regex: /다음\s*주/, type: 'date' },
      { regex: /이번\s*달/, type: 'date' },
      { regex: /지난\s*달/, type: 'date' },
      { regex: /다음\s*달/, type: 'date' },
      
      // 날짜 범위
      { regex: /(\d{4})년\s*(\d{1,2})월/, type: 'range' },
      { regex: /(\d{1,2})월/, type: 'range' },
      { regex: /이번\s*주/, type: 'range' },
      { regex: /지난\s*주/, type: 'range' },
      { regex: /다음\s*주/, type: 'range' },
    ];

    // 시간 패턴들
    const timePatterns = [
      // 특정 시간
      { regex: /(\d{1,2})시/, type: 'time' },
      { regex: /(\d{1,2}):(\d{2})/, type: 'time' },
      { regex: /오전\s*(\d{1,2})시/, type: 'time' },
      { regex: /오후\s*(\d{1,2})시/, type: 'time' },
      { regex: /새벽/, type: 'time' },
      { regex: /아침/, type: 'time' },
      { regex: /점심/, type: 'time' },
      { regex: /저녁/, type: 'time' },
      { regex: /밤/, type: 'time' },
      
      // 시간 범위
      { regex: /오전/, type: 'range' },
      { regex: /오후/, type: 'range' },
      { regex: /새벽/, type: 'range' },
      { regex: /아침/, type: 'range' },
      { regex: /점심/, type: 'range' },
      { regex: /저녁/, type: 'range' },
      { regex: /밤/, type: 'range' },
    ];

    // 이해도점수 패턴 매칭 (가장 먼저)
    for (const pattern of comprehensionPatterns) {
      const match = normalized.match(pattern.regex);
      if (match) {
        return this.parseComprehensionMatch(match, pattern.operator, expression);
      }
    }
    
    // 날짜 패턴 매칭
    for (const pattern of datePatterns) {
      const match = normalized.match(pattern.regex);
      if (match) {
        return this.parseDateMatch(match, pattern.type, expression);
      }
    }

    // 시간 패턴 매칭
    for (const pattern of timePatterns) {
      const match = normalized.match(pattern.regex);
      if (match) {
        return this.parseTimeMatch(match, pattern.type, expression);
      }
    }

    // 매칭되지 않으면 기본 반환
    return {
      type: 'datetime',
      originalExpression: expression,
    };
  }

  /**
   * Parse comprehension score match
   */
  private static parseComprehensionMatch(match: RegExpMatchArray, operator: string, original: string): any {
    if (operator === 'range' && match[1] && match[2]) {
      const min = parseInt(match[1]);
      const max = parseInt(match[2]);
      return {
        type: 'comprehension',
        comprehensionScore: { min, max, operator: 'range' },
        originalExpression: original,
      };
    }
    
    if (match[1]) {
      const score = parseInt(match[1]);
      return {
        type: 'comprehension',
        comprehensionScore: { 
          min: score, 
          operator: operator as 'gte' | 'lte' | 'eq' 
        },
        originalExpression: original,
      };
    }

    return { type: 'comprehension', originalExpression: original };
  }

  /**
   * Parse date match
   */
  private static parseDateMatch(match: RegExpMatchArray, type: string, original: string): any {
    const now = new Date();
    
    if (match[0].includes('오늘')) {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
      return { type: 'date', start, end, originalExpression: original };
    }
    
    if (match[0].includes('어제')) {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      const end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
      return { type: 'date', start, end, originalExpression: original };
    }
    
    if (match[0].includes('내일')) {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
      return { type: 'date', start, end, originalExpression: original };
    }
    
    if (match[0].includes('이번 주')) {
      const start = new Date(now.getTime() - now.getDay() * 24 * 60 * 60 * 1000);
      const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);
      return { type: 'range', start, end, originalExpression: original };
    }
    
    if (match[0].includes('지난 주')) {
      const start = new Date(now.getTime() - (now.getDay() + 7) * 24 * 60 * 60 * 1000);
      const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);
      return { type: 'range', start, end, originalExpression: original };
    }
    
    if (match[0].includes('다음 주')) {
      const start = new Date(now.getTime() + (7 - now.getDay()) * 24 * 60 * 60 * 1000);
      const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);
      return { type: 'range', start, end, originalExpression: original };
    }
    
    if (match[0].includes('이번 달')) {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      return { type: 'range', start, end, originalExpression: original };
    }
    
    if (match[0].includes('지난 달')) {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      return { type: 'range', start, end, originalExpression: original };
    }
    
    if (match[0].includes('다음 달')) {
      const start = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 2, 0, 23, 59, 59);
      return { type: 'range', start, end, originalExpression: original };
    }

    // 월별 범위 패턴 처리 (예: "6월", "12월")
    if (type === 'range' && match[1] && !match[2] && !match[3]) { // (\d{1,2})월 패턴
      const month = parseInt(match[1]) - 1; // 0-based month
      const currentYear = now.getFullYear();
      
      // 현재 년도의 해당 월 전체 범위
      const start = new Date(currentYear, month, 1);
      const end = new Date(currentYear, month + 1, 0, 23, 59, 59); // 해당 월의 마지막 날
      
      return { type: 'range', start, end, originalExpression: original };
    }

    // 년월 범위 패턴 처리 (예: "2024년 6월")
    if (type === 'range' && match[1] && match[2] && !match[3]) { // (\d{4})년\s*(\d{1,2})월 패턴
      const year = parseInt(match[1]);
      const month = parseInt(match[2]) - 1; // 0-based month
      
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0, 23, 59, 59); // 해당 월의 마지막 날
      
      return { type: 'range', start, end, originalExpression: original };
    }

    // 특정 날짜 패턴
    if (match[1] && match[2] && match[3]) { // YYYY년 MM월 DD일
      const year = parseInt(match[1]);
      const month = parseInt(match[2]) - 1;
      const day = parseInt(match[3]);
      const start = new Date(year, month, day);
      const end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
      return { type: 'date', start, end, originalExpression: original };
    }
    
    if (match[1] && match[2]) { // MM월 DD일
      const month = parseInt(match[1]) - 1;
      const day = parseInt(match[2]);
      const start = new Date(now.getFullYear(), month, day);
      const end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
      return { type: 'date', start, end, originalExpression: original };
    }
    
    if (match[1]) { // DD일
      const day = parseInt(match[1]);
      const start = new Date(now.getFullYear(), now.getMonth(), day);
      const end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
      return { type: 'date', start, end, originalExpression: original };
    }

    return { type: 'date', originalExpression: original };
  }

  /**
   * Parse time match
   */
  private static parseTimeMatch(match: RegExpMatchArray, type: string, original: string): any {
    if (match[0].includes('새벽')) {
      return { 
        type: 'time', 
        timeRange: { start: '00:00', end: '06:00' },
        originalExpression: original 
      };
    }
    
    if (match[0].includes('아침')) {
      return { 
        type: 'time', 
        timeRange: { start: '06:00', end: '12:00' },
        originalExpression: original 
      };
    }
    
    if (match[0].includes('점심')) {
      return { 
        type: 'time', 
        timeRange: { start: '12:00', end: '14:00' },
        originalExpression: original 
      };
    }
    
    if (match[0].includes('오후')) {
      return { 
        type: 'time', 
        timeRange: { start: '12:00', end: '18:00' },
        originalExpression: original 
      };
    }
    
    if (match[0].includes('저녁')) {
      return { 
        type: 'time', 
        timeRange: { start: '18:00', end: '22:00' },
        originalExpression: original 
      };
    }
    
    if (match[0].includes('밤')) {
      return { 
        type: 'time', 
        timeRange: { start: '22:00', end: '24:00' },
        originalExpression: original 
      };
    }
    
    if (match[0].includes('오전')) {
      return { 
        type: 'time', 
        timeRange: { start: '00:00', end: '12:00' },
        originalExpression: original 
      };
    }

    // 특정 시간 패턴
    if (match[1] && match[2]) { // HH:MM
      const hour = parseInt(match[1]);
      const minute = parseInt(match[2]);
      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      return { 
        type: 'time', 
        timeRange: { start: timeStr, end: timeStr },
        originalExpression: original 
      };
    }
    
    if (match[1]) { // HH시
      const hour = parseInt(match[1]);
      const timeStr = `${hour.toString().padStart(2, '0')}:00`;
      return { 
        type: 'time', 
        timeRange: { start: timeStr, end: timeStr },
        originalExpression: original 
      };
    }

    return { type: 'time', originalExpression: original };
  }

  /**
   * Extract natural language information from search query
   */
  static extractNaturalLanguageInfo(query: string): {
    cleanQuery: string;
    naturalLanguageInfo?: any;
  } {
    const naturalLanguagePatterns = [
      // 이해도점수 패턴들
      /이해도점수\s*\d+점\s*이상/,
      /이해도점수\s*\d+점\s*이하/,
      /이해도점수\s*\d+점/,
      /이해도\s*\d+점\s*이상/,
      /이해도\s*\d+점\s*이하/,
      /이해도\s*\d+점/,
      /\d+점\s*이상/,
      /\d+점\s*이하/,
      /\d+점/,
      /이해도점수\s*\d+점\s*~?\s*\d+점/,
      /이해도\s*\d+점\s*~?\s*\d+점/,
      /\d+점\s*~?\s*\d+점/,
      
      // 날짜 패턴들
      /\d{4}년\s*\d{1,2}월\s*\d{1,2}일/,
      /\d{4}년\s*\d{1,2}월/,
      /\d{1,2}월\s*\d{1,2}일/,
      /\d{1,2}월/,
      /\d{1,2}일/,
      /오늘/,
      /어제/,
      /내일/,
      /이번\s*주/,
      /지난\s*주/,
      /다음\s*주/,
      /이번\s*달/,
      /지난\s*달/,
      /다음\s*달/,
      
      // 시간 패턴들
      /\d{1,2}시/,
      /\d{1,2}:\d{2}/,
      /오전\s*\d{1,2}시/,
      /오후\s*\d{1,2}시/,
      /새벽/,
      /아침/,
      /점심/,
      /저녁/,
      /밤/,
      /오전/,
      /오후/,
    ];

    let cleanQuery = query;
    let naturalLanguageInfo: any = null;

    // 자연어 표현 찾기 (날짜/시간/이해도점수)
    for (const pattern of naturalLanguagePatterns) {
      const match = query.match(pattern);
      if (match) {
        naturalLanguageInfo = this.parseNaturalLanguageExpression(match[0]);
        cleanQuery = query.replace(pattern, '').trim();
        break;
      }
    }

    return { cleanQuery, naturalLanguageInfo };
  }
} 