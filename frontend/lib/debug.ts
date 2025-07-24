/**
 * debug.ts - habitus33 개발 환경 디버깅 유틸리티
 * 
 * 이 파일은 개발 과정에서 API 요청 및 인증 관련 문제를 디버깅하기 위한
 * 도구를 제공합니다.
 */

const isDev = process.env.NODE_ENV === 'development';

export type LogLevel = 'info' | 'warn' | 'error' | 'http';
export type LogEntry = {
  level: LogLevel;
  message: string;
  details?: any;
  timestamp: Date;
};

// 디버깅 로그 저장소
class DebugLogger {
  private logs: LogEntry[] = [];
  private maxLogs: number = 100;
  private listeners: Array<(logs: LogEntry[]) => void> = [];

  constructor() {
    if (typeof window !== 'undefined' && isDev) {
      // 콘솔 에러 캡처
      const originalConsoleError = console.error;
      console.error = (...args) => {
        this.error(typeof args[0] === 'string' ? args[0] : 'Console Error', args.slice(1));
        originalConsoleError.apply(console, args);
      };

      // 글로벌 에러 핸들러
      window.addEventListener('error', (event) => {
        this.error(`Uncaught Error: ${event.message}`, {
          source: event.filename,
          line: event.lineno,
          column: event.colno
        });
      });

      // 캐치되지 않은 프로미스 에러
      window.addEventListener('unhandledrejection', (event) => {
        this.error(`Unhandled Promise Rejection: ${event.reason}`, event.reason);
      });
    }
  }

  public info(message: string, details?: any) {
    this.addLog('info', message, details);
  }

  public warn(message: string, details?: any) {
    this.addLog('warn', message, details);
  }

  public error(message: string, details?: any) {
    this.addLog('error', message, details);
  }

  public http(message: string, details?: any) {
    this.addLog('http', message, details);
  }

  private addLog(level: LogLevel, message: string, details?: any) {
    if (!isDev) return;

    const newLog: LogEntry = {
      level,
      message,
      details,
      timestamp: new Date()
    };

    this.logs.unshift(newLog);
    
    // 로그 최대 개수 제한
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }

    // 리스너에게 알림
    this.listeners.forEach(listener => listener(this.logs));
  }

  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  public clearLogs() {
    this.logs = [];
    this.listeners.forEach(listener => listener(this.logs));
  }

  public subscribe(listener: (logs: LogEntry[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
}

// 싱글톤 인스턴스
export const debugLogger = new DebugLogger();

// API 디버깅 유틸리티
export const apiDebug = {
  /**
   * API 요청을 로깅하기 위한 래퍼 함수
   */
  logApiRequest: async (url: string, options: RequestInit, apiName: string = 'API') => {
    if (!isDev) {
      // 프로덕션 환경에서는 원래 fetch만 실행
      return fetch(url, options);
    }

    const isSensitive = url.includes('/auth/login') || url.includes('/auth/register');

    // 요청 정보 로깅
    const method = options.method || 'GET';
    debugLogger.http(`${apiName} 요청: ${method} ${url}`, {
      headers: options.headers,
      body: isSensitive ? '[SENSITIVE DATA REDACTED]' : options.body,
    });

    try {
      const startTime = Date.now();
      const response = await fetch(url, options);
      const endTime = Date.now();
      
      // 응답 복제 (스트림은 한 번만 읽을 수 있으므로)
      const responseClone = response.clone();
      
      // 응답 내용 가져오기 (JSON만 지원)
      let responseBody;
      try {
        responseBody = await responseClone.json();
      } catch (error: any) {
        responseBody = { 
          _debugInfo: '응답이 JSON 형식이 아닙니다', 
          _debugError: error.message 
        };
      }

      // 응답 로깅
      debugLogger.http(`${apiName} 응답: ${response.status} (${endTime - startTime}ms)`, {
        status: response.status,
        headers: Object.fromEntries(Array.from(response.headers)),
        body: responseBody
      });

      // 원본 response 객체 반환 (handleResponse에서 다시 파싱할 수 있도록)
      return response;
    } catch (error: any) {
      // 오류 로깅
      debugLogger.error(`${apiName} 오류`, error);
      throw error;
    }
  },

  /**
   * 로컬스토리지 디버깅 유틸
   */
  trackLocalStorage: (key: string) => {
    if (!isDev || typeof window === 'undefined') return;

    const originalSetItem = localStorage.setItem;
    const originalRemoveItem = localStorage.removeItem;

    localStorage.setItem = function(k, value) {
      if (k === key) {
        debugLogger.info(`LocalStorage 업데이트: ${key}`, {
          newValue: value,
          oldValue: localStorage.getItem(key)
        });
      }
      originalSetItem.call(localStorage, k, value);
    };

    localStorage.removeItem = function(k) {
      if (k === key) {
        debugLogger.info(`LocalStorage 삭제: ${key}`, {
          oldValue: localStorage.getItem(key)
        });
      }
      originalRemoveItem.call(localStorage, k);
    };
  }
};

/**
 * 환경 변수 검증 유틸리티
 */
export const validateEnvironment = () => {
  if (!isDev) return true;

  const requiredVars = ['NEXT_PUBLIC_API_URL'];
  const missing = requiredVars.filter(
    key => !process.env[key] || process.env[key] === ''
  );

  if (missing.length > 0) {
    debugLogger.error('필수 환경 변수 누락', { missing });
    console.error(`[환경변수 오류] 다음 변수가 설정되지 않았습니다: ${missing.join(', ')}`);
    return false;
  }

  return true;
}; 