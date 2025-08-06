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
  userApiKey?: string;
}

/**
 * 다중 LLM 통합 서비스
 * ChatGPT, Claude, Gemini를 지원하는 추상화 레이어
 */
export class LLMService {
  /**
   * LLM 응답 생성
   * @param request LLM 요청
   * @returns LLM 응답
   */
  async generateResponse(request: LLMRequest): Promise<LLMResponse> {
    const { llmProvider, userApiKey } = request;

    if (!userApiKey) {
      // 환경 변수에서 해당 provider의 기본 키를 찾습니다.
      const defaultApiKey = this.getDefaultApiKey(llmProvider);
      if (!defaultApiKey) {
        throw new Error(`${llmProvider}에 대한 API 키가 제공되지 않았습니다.`);
      }
      request.userApiKey = defaultApiKey;
    }

    try {
      switch (llmProvider) {
        case 'ChatGPT':
          return await this.generateChatGPTResponse(request);

        case 'Claude':
          return await this.generateClaudeResponse(request);

        case 'Gemini':
          return await this.generateGeminiResponse(request);

        default:
          throw new Error(`지원하지 않는 LLM 제공자: ${llmProvider}`);
      }
    } catch (error) {
      console.error(`LLM 응답 생성 오류 (${llmProvider}):`, error);
      throw error;
    }
  }

  /**
   * ChatGPT 응답 생성
   */
  private async generateChatGPTResponse(
    request: LLMRequest
  ): Promise<LLMResponse> {
    if (!request.userApiKey) {
      throw new Error('OpenAI API 키가 제공되지 않았습니다.');
    }

    const openai = new OpenAI({ apiKey: request.userApiKey });

    const context = SearchContextService.createOptimizedPrompt(
      request.searchContext.results,
      request.searchContext.query,
      request.message
    );

    const completion = await openai.chat.completions.create({
      model: request.llmModel,
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
      model: request.llmModel,
      provider: 'ChatGPT',
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
    request: LLMRequest
  ): Promise<LLMResponse> {
    if (!request.userApiKey) {
      throw new Error('Claude API 키가 제공되지 않았습니다.');
    }
    // const claude = new Anthropic({ apiKey: request.userApiKey });

    const context = SearchContextService.createOptimizedPrompt(
      request.searchContext.results,
      request.searchContext.query,
      request.message
    );

    // 임시 구현 - 실제로는 Anthropic API 호출
    const response = `[Claude 응답] ${request.message}에 대한 답변입니다. 검색된 ${request.searchContext.results.length}개의 메모를 참고하여 답변을 생성했습니다.`;

    return {
      content: response,
      model: request.llmModel,
      provider: 'Claude'
    };
  }

  /**
   * Gemini 응답 생성
   */
  private async generateGeminiResponse(
    request: LLMRequest
  ): Promise<LLMResponse> {
    if (!request.userApiKey) {
      throw new Error('Gemini API 키가 제공되지 않았습니다.');
    }
    // const gemini = new GoogleAI({ apiKey: request.userApiKey });
    
    const context = SearchContextService.createOptimizedPrompt(
      request.searchContext.results,
      request.searchContext.query,
      request.message
    );

    // 임시 구현 - 실제로는 Google AI API 호출
    const response = `[Gemini 응답] ${request.message}에 대한 답변입니다. 검색된 ${request.searchContext.results.length}개의 메모를 참고하여 답변을 생성했습니다.`;

    return {
      content: response,
      model: request.llmModel,
      provider: 'Gemini'
    };
  }

  private getDefaultApiKey(providerName: string): string | undefined {
    const upperCaseProvider = providerName.toUpperCase();
    if (upperCaseProvider === 'CHATGPT') {
        return process.env.OPENAI_API_KEY;
    }
    return process.env[`${upperCaseProvider}_API_KEY`];
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