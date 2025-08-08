import { toast } from 'react-hot-toast';
import { apiDebug, debugLogger } from './debug';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Base API client for making HTTP requests
 */
class ApiClient {
  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  /**
   * Makes a fetch request with authorization and JSON handling
   */
  private async fetchWithAuth(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    const token = this.getToken();
    const headers = new Headers(options.headers);
    
    headers.set('Content-Type', 'application/json');
    
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    // Prevent caching to avoid 304 Not Modified
    headers.set('Cache-Control', 'no-cache');
    headers.set('Pragma', 'no-cache');

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const url = `${API_BASE_URL}/api${endpoint}`;
      
      // 개발 환경에서도 기본 fetch 사용 (디버그 래퍼로 인한 스트림 소비 문제 해결)
      const response = await fetch(url, config);
      return await this.handleResponse(response, endpoint);
    } catch (error: any) {
      const errorMessage = error.message || '서버와 연결이 어려워요. 잠시 후 다시 시도해 주세요.';
      toast.error(errorMessage);
      throw error;
    }
  }

  /**
   * HTTP GET request
   */
  async get(endpoint: string): Promise<any> {
    try {
      const response = await this.fetchWithAuth(endpoint);
      return response;
    } catch (error) {
      debugLogger.error(`GET ${endpoint} 실패`, error);
      throw error;
    }
  }

  /**
   * HTTP POST request
   */
  async post(endpoint: string, data: any): Promise<any> {
    try {
      const response = await this.fetchWithAuth(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      debugLogger.error(`POST ${endpoint} 실패`, { error, data });
      throw error;
    }
  }

  /**
   * HTTP PUT request
   */
  async put(endpoint: string, data: any): Promise<any> {
    try {
      const response = await this.fetchWithAuth(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      debugLogger.error(`PUT ${endpoint} 실패`, { error, data });
      throw error;
    }
  }

  /**
   * HTTP DELETE request
   */
  async delete(endpoint: string): Promise<any> {
    try {
      const response = await this.fetchWithAuth(endpoint, {
        method: 'DELETE',
      });
      return response;
    } catch (error) {
      debugLogger.error(`DELETE ${endpoint} 실패`, error);
      throw error;
    }
  }

  // 인증 관련 오류 핸들링 개선
  private async handleResponse(response: Response, url: string): Promise<any> {
    console.log('🔍 handleResponse 시작:', {
      url,
      status: response.status,
      ok: response.ok,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (response.ok) {
      // 204 No Content 또는 비-JSON 응답 대비
      if (response.status === 204) {
        return { ok: true } as const;
      }
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        return { ok: true } as const;
      }
      try {
        const data = await response.json();
        console.log('✅ handleResponse 파싱 성공:', data);
        return data;
      } catch (error) {
        // 비어있는 본문 등으로 JSON 파싱 실패 시에도 성공 응답으로 처리
        console.error('❌ handleResponse JSON 파싱 실패:', error);
        return { ok: true } as const;
      }
    }

    // 오류 응답 처리
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { message: '응답을 읽기 어려워요. 페이지를 새로고침 해주실래요?' };
    }

    const error = new Error(errorData.message || `연결이 원활하지 않아요. 다시 시도해 볼까요?`);
    (error as any).status = response.status;
    (error as any).errorData = errorData;

    // 인증 오류(401) 처리
    if (response.status === 401) {
      console.error('Authentication error:', url);
      // 클라이언트 측에서 토큰 제거
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        
        // 로그인 페이지로 리디렉션 (토스트 메시지 표시 후)
        toast.error('로그인 시간이 지났어요. 다시 만나볼래요?');
        
        // 약간의 지연 후 리디렉션 (토스트 메시지를 볼 수 있도록)
        setTimeout(() => {
          window.location.href = '/auth/login';
        }, 1500);
      }
    }

    throw error;
  }
}

// Singleton instance
export const apiClient = new ApiClient();

/**
 * Payment service for handling subscription-related API calls
 */
export const paymentService = {
  /**
   * Create a checkout session for subscription
   */
  createCheckoutSession: async (planId: string): Promise<{ checkoutUrl: string }> => {
    return apiClient.post('/payments/create-checkout', { planId });
  },

  /**
   * Get user's subscription status
   */
  getSubscriptionStatus: async (): Promise<{
    isPremium: boolean;
    currentPlan?: string;
    expiresAt?: string;
  }> => {
    return apiClient.get('/user/subscription');
  },

  /**
   * Cancel a subscription
   */
  cancelSubscription: async (): Promise<{ success: boolean }> => {
    return apiClient.post('/payments/cancel-subscription', {});
  },
}; 

/**
 * TS Warmup metrics client helper
 * - Safe with 200/204 and non-JSON responses (handled by handleResponse)
 * - 1 retry via local queue (stored in localStorage) on failure
 */
export type WarmupModeId = 'guided_breathing' | 'peripheral_vision' | 'text_flow';

export interface WarmupModeResult {
  mode: WarmupModeId;
  durationSec: number;
  metrics: Record<string, any>;
}

export interface WarmupMetricsPayload {
  sessionId: string;
  userIdHash?: string | null;
  timestamp: string; // ISO string
  warmupVersion: string; // e.g., "v1"
  results: WarmupModeResult[];
  device?: { width: number; height: number; dpr: number; reducedMotion: boolean };
}

const WARMUP_QUEUE_KEY = 'warmupMetricsQueue';

function loadWarmupQueue(): WarmupMetricsPayload[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(WARMUP_QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveWarmupQueue(queue: WarmupMetricsPayload[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(WARMUP_QUEUE_KEY, JSON.stringify(queue));
  } catch {}
}

function enqueueWarmupMetrics(payload: WarmupMetricsPayload) {
  const q = loadWarmupQueue();
  q.push(payload);
  saveWarmupQueue(q);
}

async function postWarmupMetrics(payload: WarmupMetricsPayload) {
  return apiClient.post('/ts/warmup/metrics', payload);
}

export const warmupMetricsService = {
  /**
   * Fire-and-forget send. On failure, payload is queued for later.
   */
  async sendWarmupMetrics(payload: WarmupMetricsPayload): Promise<{ ok: boolean; queued?: boolean }> {
    try {
      await postWarmupMetrics(payload);
      return { ok: true };
    } catch (err) {
      debugLogger.warn('Warmup metrics send failed; enqueueing for retry', err);
      enqueueWarmupMetrics(payload);
      return { ok: false, queued: true };
    }
  },

  /**
   * Try to flush any queued metrics. Removes successful ones; retains failures.
   */
  async flushQueue(): Promise<{ sent: number; remaining: number }> {
    const queue = loadWarmupQueue();
    if (queue.length === 0) return { sent: 0, remaining: 0 };
    const remaining: WarmupMetricsPayload[] = [];
    let sent = 0;
    for (const item of queue) {
      try {
        await postWarmupMetrics(item);
        sent += 1;
      } catch (err) {
        remaining.push(item);
      }
    }
    saveWarmupQueue(remaining);
    return { sent, remaining: remaining.length };
  },
};

// --- New: Warmup raw events client ---
export type WarmupEventClientPayload = {
  sessionId: string;
  warmupVersion?: string;
  device?: { width?: number; height?: number; dpr?: number; reducedMotion?: boolean };
  events: Array<{
    mode: WarmupModeId;
    eventType: string;
    ts?: string; // ISO
    clientEventId: string; // uuid
    data: Record<string, any>;
  }>;
};

const EVENTS_QUEUE_KEY = 'warmupEventsQueue';

function loadEventsQueue(): WarmupEventClientPayload[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(EVENTS_QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveEventsQueue(queue: WarmupEventClientPayload[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(EVENTS_QUEUE_KEY, JSON.stringify(queue));
  } catch {}
}

function enqueueEvents(payload: WarmupEventClientPayload) {
  const q = loadEventsQueue();
  q.push(payload);
  saveEventsQueue(q);
}

async function postWarmupEvents(payload: WarmupEventClientPayload) {
  return apiClient.post('/ts/warmup/events', payload);
}

// Validate queued payloads to avoid retrying forever on bad data
function isValidModeId(mode: any): mode is WarmupModeId {
  return mode === 'guided_breathing' || mode === 'peripheral_vision' || mode === 'text_flow';
}

function isValidEventsPayload(payload: WarmupEventClientPayload): boolean {
  if (!payload || typeof payload.sessionId !== 'string' || payload.sessionId.length === 0) return false;
  if (!Array.isArray(payload.events) || payload.events.length === 0) return false;
  for (const ev of payload.events) {
    if (!ev) return false;
    if (!isValidModeId((ev as any).mode)) return false;
    if (typeof ev.eventType !== 'string' || ev.eventType.length === 0) return false;
    if (typeof ev.clientEventId !== 'string' || ev.clientEventId.length === 0) return false;
    if (typeof ev.data !== 'object' || ev.data == null) return false;
    if (ev.ts && isNaN(new Date(ev.ts).getTime())) return false;
  }
  return true;
}

export const warmupEventsService = {
  async sendEvents(payload: WarmupEventClientPayload): Promise<{ ok: boolean; queued?: boolean }> {
    try {
      await postWarmupEvents(payload);
      return { ok: true };
    } catch (err) {
      debugLogger.warn('Warmup events send failed; enqueueing for retry', err);
      enqueueEvents(payload);
      return { ok: false, queued: true };
    }
  },
  async flushQueue(): Promise<{ sent: number; remaining: number }> {
    const queue = loadEventsQueue();
    if (queue.length === 0) return { sent: 0, remaining: 0 };
    const remaining: WarmupEventClientPayload[] = [];
    let sent = 0;
    for (const item of queue) {
      // Drop invalid items to prevent infinite 400 retries
      if (!isValidEventsPayload(item)) {
        debugLogger.warn('Dropping invalid warmup events payload from queue', item);
        continue;
      }
      try {
        await postWarmupEvents(item);
        sent += 1;
      } catch (err) {
        remaining.push(item);
      }
    }
    saveEventsQueue(remaining);
    return { sent, remaining: remaining.length };
  },
};