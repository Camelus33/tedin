import { SupportedModels } from '../services/PromptGenerator';

// 모든 AI 클라이언트가 구현해야 할 기본 인터페이스
interface IAIClient {
  completion(prompt: any): Promise<any>;
}

// OpenAI API를 호출하는 클라이언트 (가상 구현)
class OpenAIClient implements IAIClient {
  private apiKey: string;
  constructor(apiKey: string) {
    this.apiKey = apiKey;
    if (!this.apiKey) throw new Error('OpenAI API key is required.');
  }
  async completion(prompt: any): Promise<any> {
    console.log('--- Calling OpenAI API ---');
    // 실제로는 fetch나 axios를 사용하여 API를 호출합니다.
    // const response = await fetch('https://api.openai.com/v1/chat/completions', ...)
    return Promise.resolve({
      choices: [{ message: { content: '이것은 OpenAI의 응답입니다.' } }],
    });
  }
}

// Claude API를 호출하는 클라이언트 (가상 구현)
class ClaudeClient implements IAIClient {
    private apiKey: string;
    constructor(apiKey: string) {
      this.apiKey = apiKey;
      if (!this.apiKey) throw new Error('Anthropic API key is required.');
    }
    async completion(prompt: any): Promise<any> {
      console.log('--- Calling Anthropic Claude API ---');
      return Promise.resolve("Assistant: 이것은 Claude의 응답입니다.");
    }
}

/**
 * AI 모델 타입에 맞는 클라이언트 인스턴스를 생성하는 팩토리 함수
 * @param model - 'openai' | 'claude'
 * @param apiKey - 사용자가 제공한 API 키
 * @returns IAIClient 인스턴스
 */
export const getAIClient = (model: SupportedModels, apiKey: string): IAIClient => {
  switch (model) {
    case 'openai':
      return new OpenAIClient(apiKey);
    case 'claude':
      return new ClaudeClient(apiKey);
    default:
      throw new Error(`Unsupported model type for client factory: ${model}`);
  }
}; 