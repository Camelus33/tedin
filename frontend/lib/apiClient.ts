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