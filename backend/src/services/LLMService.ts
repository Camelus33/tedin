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
      // 오류 객체를 자세히 로깅
      console.error('LLM API 호출 오류 상세:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
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

    try { // ChatGPT 응답 생성 블록에 try-catch 추가
      const openai = new OpenAI({ apiKey: request.userApiKey });

      const context = SearchContextService.createOptimizedPrompt(
        request.searchContext.results,
        request.searchContext.query,
        request.message
      );

      const modelLower = (request.llmModel || '').toLowerCase();

      // GPT-5 및 Responses API 전용 경로: max_output_tokens 사용
      if (modelLower.startsWith('gpt-5')) {
        // 모범사례: 기본 2048, 환경변수로 조정 가능
        const maxOut = Math.max(
          256,
          Math.min(
            32768,
            Number(process.env.OPENAI_RESP_MAX_OUTPUT_TOKENS || 2048)
          )
        );
        const resp: any = await (openai as any).responses.create({
          model: request.llmModel,
          instructions: '당신은 수험생의 학습을 돕는 AI 학습 진단사입니다. 검색된 메모를 바탕으로 정확하고 유용한 답변을 제공해주세요.',
          input: context,
          max_output_tokens: maxOut,
        });

        // Responses API 결과에서 텍스트 추출 (콘텐츠 블록만 엄격히 수집)
        const extractText = (node: any): string | undefined => {
          try {
            if (!node) return undefined;
            if (typeof node === 'string') return node.trim();
            // 1) 가장 신뢰도 높은 단일 필드
            if (typeof node.output_text === 'string' && node.output_text.trim()) {
              return node.output_text.trim();
            }
            if (typeof node.response?.output_text === 'string' && node.response.output_text.trim()) {
              return node.response.output_text.trim();
            }
            // 2) output[].content[]에서 type이 text/output_text 인 것만 수집
            const collected: string[] = [];
            const outputs = Array.isArray(node.output) ? node.output : Array.isArray(node.response?.output) ? node.response.output : [];
            for (const block of outputs) {
              const contents = Array.isArray(block?.content) ? block.content : [];
              for (const item of contents) {
                const type = item?.type;
                const raw = (item?.text?.value ?? item?.text ?? (typeof item === 'string' ? item : undefined));
                if ((type === 'text' || type === 'output_text') && typeof raw === 'string' && raw.trim()) {
                  collected.push(raw.trim());
                }
              }
            }
            if (collected.length > 0) return collected.join('\n\n').trim();
            // 3) Completions 호환 경로
            const compat = node?.choices?.[0]?.message?.content;
            if (typeof compat === 'string' && compat.trim()) return compat.trim();
            return undefined;
          } catch {
            return undefined;
          }
        };

        const responseText: string = extractText(resp) || '응답을 생성할 수 없습니다.';

        const usage = resp?.usage || resp?.response?.usage;
        return {
          content: responseText,
          model: request.llmModel,
          provider: 'ChatGPT',
          usage: usage ? {
            promptTokens: usage.input_tokens ?? usage.prompt_tokens,
            completionTokens: usage.output_tokens ?? usage.completion_tokens,
            totalTokens: usage.total_tokens,
          } : undefined,
        };
      }

      // 기본(gpt-4 등) 경로: 기존 Chat Completions API 유지
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
    } catch (error) {
      console.error(`ChatGPT 응답 생성 오류:`, error);
      // 오류 객체를 자세히 로깅
      console.error('ChatGPT API 호출 오류 상세:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      throw error;
    }
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

    try { // Claude 응답 생성 블록에 try-catch 추가
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
    } catch (error) {
      console.error(`Claude 응답 생성 오류:`, error);
      // 오류 객체를 자세히 로깅
      console.error('Claude API 호출 오류 상세:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      throw error;
    }
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
    
    try { // Gemini 응답 생성 블록에 try-catch 추가
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
    } catch (error) {
      console.error(`Gemini 응답 생성 오류:`, error);
      // 오류 객체를 자세히 로깅
      console.error('Gemini API 호출 오류 상세:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      throw error;
    }
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
    // 오류 객체를 자세히 로깅
    console.error('LLM API 호출 오류 상세:', JSON.stringify(error, Object.getOwnPropertyNames(error)));

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