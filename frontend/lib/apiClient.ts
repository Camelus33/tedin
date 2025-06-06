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

    // 개발 환경에서는 디버그 래퍼 사용
    if (process.env.NODE_ENV === 'development') {
      try {
        const url = `${API_BASE_URL}/api${endpoint}`;
        return await apiDebug.logApiRequest(url, config, 'apiClient');
      } catch (error: any) {
        const errorMessage = error.message || '서버와 통신 중 오류가 발생했습니다.';
        toast.error(errorMessage);
        throw error;
      }
    } else {
      // 프로덕션 환경에서는 기존 방식 사용
      try {
        const response = await fetch(`${API_BASE_URL}/api${endpoint}`, config);
        return await this.handleResponse(response, endpoint);
      } catch (error: any) {
        const errorMessage = error.message || '서버와 통신 중 오류가 발생했습니다.';
        toast.error(errorMessage);
        throw error;
      }
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
    if (response.ok) {
      return response.json();
    }

    // 오류 응답 처리
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { message: 'Failed to parse error response' };
    }

    const error = new Error(errorData.message || `API 요청 실패: ${response.status}`);
    (error as any).status = response.status;
    (error as any).errorData = errorData;

    // 인증 오류(401) 처리
    if (response.status === 401) {
      console.error('Authentication error:', url);
      // 클라이언트 측에서 토큰 제거
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
        
        // 로그인 페이지로 리디렉션 (토스트 메시지 표시 후)
        toast.error('세션이 만료되었습니다. 다시 로그인해 주세요.');
        
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