import OpenAI from 'openai';
import { SearchContextService } from './SearchContextService';

export interface LLMProvider {
  name: string;
  model: string;
  apiKey: string;
  isConfigured: boolean;
}

export interface LLMResponse {
  content: string;
  model: string;
  provider: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface LLMRequest {
  message: string;
  searchContext: {
    query: string;
    results: any[];
  };
  llmProvider: string;
  llmModel: string;
  conversationId?: string;
  userId?: string;
}

/**
 * 다중 LLM 통합 서비스
 * ChatGPT, Claude, Gemini를 지원하는 추상화 레이어
 */
export class LLMService {
  private openai: OpenAI | null = null;
  private providers: Map<string, LLMProvider> = new Map();

  constructor() {
    this.initializeProviders();
  }

  /**
   * LLM 제공자 초기화
   */
  private initializeProviders(): void {
    this.providers.set('ChatGPT', {
      name: 'ChatGPT',
      model: 'gpt-4',
      apiKey: '',
      isConfigured: false
    });

    this.providers.set('Claude', {
      name: 'Claude',
      model: 'claude-3-sonnet-20240229',
      apiKey: '',
      isConfigured: false
    });

    this.providers.set('Gemini', {
      name: 'Gemini',
      model: 'gemini-pro',
      apiKey: '',
      isConfigured: false
    });
  }

  /**
   * LLM 제공자 설정
   * @param providerName 제공자 이름
   * @param apiKey API 키
   */
  async configureProvider(providerName: string, apiKey: string): Promise<boolean> {
    try {
      const provider = this.providers.get(providerName);
      if (!provider) {
        throw new Error(`지원하지 않는 LLM 제공자: ${providerName}`);
      }

      // API 키 유효성 검증
      const isValid = await this.validateAPIKey(providerName, apiKey);
      if (!isValid) {
        throw new Error(`유효하지 않은 API 키: ${providerName}`);
      }

      // 제공자 설정 업데이트
      provider.apiKey = apiKey;
      provider.isConfigured = true;

      // OpenAI 클라이언트 초기화 (ChatGPT용)
      if (providerName === 'ChatGPT') {
        this.openai = new OpenAI({
          apiKey: apiKey,
        });
      }

      console.log(`${providerName} 설정 완료`);
      return true;
    } catch (error) {
      console.error(`${providerName} 설정 오류:`, error);
      return false;
    }
  }

  /**
   * API 키 유효성 검증
   */
  private async validateAPIKey(providerName: string, apiKey: string): Promise<boolean> {
    try {
      switch (providerName) {
        case 'ChatGPT':
          const openai = new OpenAI({ apiKey });
          await openai.models.list();
          return true;

        case 'Claude':
          // Claude API 키 검증 (실제 구현에서는 Claude API 호출)
          return apiKey.startsWith('sk-ant-');

        case 'Gemini':
          // Gemini API 키 검증 (실제 구현에서는 Gemini API 호출)
          return apiKey.length > 0;

        default:
          return false;
      }
    } catch (error) {
      console.error(`API 키 검증 오류 (${providerName}):`, error);
      return false;
    }
  }

  /**
   * LLM 응답 생성
   * @param request LLM 요청
   * @returns LLM 응답
   */
  async generateResponse(request: LLMRequest): Promise<LLMResponse> {
    const provider = this.providers.get(request.llmProvider);
    if (!provider || !provider.isConfigured) {
      throw new Error(`설정되지 않은 LLM 제공자: ${request.llmProvider}`);
    }

    try {
      switch (request.llmProvider) {
        case 'ChatGPT':
          return await this.generateChatGPTResponse(request, provider);

        case 'Claude':
          return await this.generateClaudeResponse(request, provider);

        case 'Gemini':
          return await this.generateGeminiResponse(request, provider);

        default:
          throw new Error(`지원하지 않는 LLM 제공자: ${request.llmProvider}`);
      }
    } catch (error) {
      console.error(`LLM 응답 생성 오류 (${request.llmProvider}):`, error);
      throw error;
    }
  }

  /**
   * ChatGPT 응답 생성
   */
  private async generateChatGPTResponse(
    request: LLMRequest,
    provider: LLMProvider
  ): Promise<LLMResponse> {
    if (!this.openai) {
      throw new Error('OpenAI 클라이언트가 초기화되지 않았습니다.');
    }

    const context = SearchContextService.createOptimizedPrompt(
      request.searchContext.results,
      request.searchContext.query,
      request.message
    );

    const completion = await this.openai.chat.completions.create({
      model: provider.model,
      messages: [
        {
          role: 'system',
          content: '당신은 수험생의 학습을 돕는 AI 학습 진단사입니다. 검색된 메모를 바탕으로 정확하고 유용한 답변을 제공해주세요.'
        },
        {
          role: 'user',
          content: context
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || '응답을 생성할 수 없습니다.';

    return {
      content: response,
      model: provider.model,
      provider: provider.name,
      usage: completion.usage ? {
        promptTokens: completion.usage.prompt_tokens,
        completionTokens: completion.usage.completion_tokens,
        totalTokens: completion.usage.total_tokens,
      } : undefined
    };
  }

  /**
   * Claude 응답 생성
   */
  private async generateClaudeResponse(
    request: LLMRequest,
    provider: LLMProvider
  ): Promise<LLMResponse> {
    // Claude API 구현 (실제로는 Anthropic API 사용)
    const context = SearchContextService.createOptimizedPrompt(
      request.searchContext.results,
      request.searchContext.query,
      request.message
    );

    // 임시 구현 - 실제로는 Anthropic API 호출
    const response = `[Claude 응답] ${request.message}에 대한 답변입니다. 검색된 ${request.searchContext.results.length}개의 메모를 참고하여 답변을 생성했습니다.`;

    return {
      content: response,
      model: provider.model,
      provider: provider.name
    };
  }

  /**
   * Gemini 응답 생성
   */
  private async generateGeminiResponse(
    request: LLMRequest,
    provider: LLMProvider
  ): Promise<LLMResponse> {
    // Gemini API 구현 (실제로는 Google AI API 사용)
    const context = SearchContextService.createOptimizedPrompt(
      request.searchContext.results,
      request.searchContext.query,
      request.message
    );

    // 임시 구현 - 실제로는 Google AI API 호출
    const response = `[Gemini 응답] ${request.message}에 대한 답변입니다. 검색된 ${request.searchContext.results.length}개의 메모를 참고하여 답변을 생성했습니다.`;

    return {
      content: response,
      model: provider.model,
      provider: provider.name
    };
  }

  /**
   * 사용 가능한 LLM 제공자 목록 반환
   */
  getAvailableProviders(): LLMProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * 특정 제공자 정보 반환
   */
  getProvider(providerName: string): LLMProvider | undefined {
    return this.providers.get(providerName);
  }

  /**
   * 제공자 설정 상태 확인
   */
  isProviderConfigured(providerName: string): boolean {
    const provider = this.providers.get(providerName);
    return provider?.isConfigured || false;
  }

  /**
   * 제공자 설정 해제
   */
  unconfigureProvider(providerName: string): void {
    const provider = this.providers.get(providerName);
    if (provider) {
      provider.apiKey = '';
      provider.isConfigured = false;
    }
  }

  /**
   * 모든 제공자 설정 해제
   */
  unconfigureAllProviders(): void {
    this.providers.forEach(provider => {
      provider.apiKey = '';
      provider.isConfigured = false;
    });
  }

  /**
   * 사용자 API 키로 제공자 설정
   */
  async configureProviderWithUserKey(
    providerName: string,
    userApiKey: string
  ): Promise<boolean> {
    return await this.configureProvider(providerName, userApiKey);
  }

  /**
   * 환경 변수에서 기본 API 키 설정
   */
  async configureDefaultProviders(): Promise<void> {
    const defaultKeys = {
      ChatGPT: process.env.OPENAI_API_KEY,
      Claude: process.env.ANTHROPIC_API_KEY,
      Gemini: process.env.GOOGLE_API_KEY
    };

    for (const [providerName, apiKey] of Object.entries(defaultKeys)) {
      if (apiKey) {
        await this.configureProvider(providerName, apiKey);
      }
    }
  }

  /**
   * LLM 응답 품질 평가
   */
  async evaluateResponseQuality(
    response: LLMResponse,
    userQuestion: string,
    searchResults: any[]
  ): Promise<number> {
    // 간단한 품질 평가 로직
    let score = 0.5; // 기본 점수

    // 응답 길이 평가
    if (response.content.length > 50) score += 0.1;
    if (response.content.length > 200) score += 0.1;

    // 검색 결과 참조 평가
    if (response.content.includes('검색') || response.content.includes('메모')) {
      score += 0.2;
    }

    // 질문과의 관련성 평가
    const questionWords = userQuestion.toLowerCase().split(/\s+/);
    const responseWords = response.content.toLowerCase().split(/\s+/);
    const commonWords = questionWords.filter(word => 
      responseWords.includes(word) && word.length > 2
    );
    
    if (commonWords.length > 0) {
      score += Math.min(0.2, commonWords.length * 0.1);
    }

    return Math.min(1.0, score);
  }

  /**
   * 에러 처리 및 폴백
   */
  async handleLLMError(
    error: any,
    request: LLMRequest
  ): Promise<LLMResponse> {
    console.error(`LLM 오류 (${request.llmProvider}):`, error);

    // 폴백 응답 생성
    const fallbackResponse = `죄송합니다. ${request.llmProvider}에서 응답을 생성하는 중 오류가 발생했습니다. 
    
검색된 ${request.searchContext.results.length}개의 메모를 바탕으로 간단한 답변을 드리겠습니다:

"${request.message}"에 대한 답변을 찾기 어렵습니다. 더 구체적인 질문을 해주시거나 다른 키워드로 검색해보시는 것을 추천드립니다.`;

    return {
      content: fallbackResponse,
      model: request.llmModel,
      provider: request.llmProvider
    };
  }
} 