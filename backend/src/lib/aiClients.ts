import { SupportedModels } from '../services/PromptGenerator';
import fetch from 'node-fetch';

// 모든 AI 클라이언트가 구현해야 할 기본 인터페이스
interface IAIClient {
  completion(prompt: any, modelName?: string): Promise<any>;
}

// OpenAI API를 호출하는 클라이언트
class OpenAIClient implements IAIClient {
  private apiKey: string;
  constructor(apiKey: string) {
    this.apiKey = apiKey;
    if (!this.apiKey) throw new Error('OpenAI API key is required.');
  }
  async completion(prompt: any, modelName: string = 'gpt-4o'): Promise<any> {
    console.log(`--- Calling OpenAI API with model: ${modelName} ---`);
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages: prompt,
      }),
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`OpenAI API error: ${res.status} ${txt}`);
    }
    return res.json();
  }
}

// Claude API를 호출하는 클라이언트
class ClaudeClient implements IAIClient {
    private apiKey: string;
    constructor(apiKey: string) {
      this.apiKey = apiKey;
      if (!this.apiKey) throw new Error('Anthropic API key is required.');
    }
    async completion(prompt: any, modelName: string = 'claude-3-haiku-20240307'): Promise<any> {
      console.log(`--- Calling Anthropic Claude API with model: ${modelName} ---`);
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: modelName,
          max_tokens: 4096,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Claude API error: ${res.status} ${txt}`);
      }
      return res.json();
    }
}

// Google Gemini API 클라이언트
class GeminiClient implements IAIClient {
  private apiKey: string;
  constructor(apiKey: string) {
    this.apiKey = apiKey;
    if (!this.apiKey) throw new Error('Gemini API key is required.');
  }
  async completion(prompt: any, modelName: string = 'gemini-1.5-flash-latest'): Promise<any> {
    console.log(`--- Calling Google Gemini API with model: ${modelName} ---`);
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${this.apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Gemini API error: ${res.status} ${errText}`);
      }
      const data = await res.json();
      return data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}

// Perplexity AI 클라이언트
class PerplexityClient implements IAIClient {
  private apiKey: string;
  constructor(apiKey: string) {
    this.apiKey = apiKey;
    if (!this.apiKey) throw new Error('Perplexity API key is required.');
  }
  async completion(prompt: any, modelName: string = 'llama-3-sonar-large-32k-online'): Promise<any> {
    console.log(`--- Calling Perplexity AI API with model: ${modelName} ---`);
    const res = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Perplexity API error: ${res.status} ${txt}`);
    }
    return res.json();
  }
}

// Midjourney(이미지) 클라이언트 (가상 구현 - 텍스트 프롬프트도 반환)
class MidjourneyClient implements IAIClient {
  private apiKey: string;
  constructor(apiKey: string) {
    this.apiKey = apiKey;
    if (!this.apiKey) throw new Error('Midjourney API key is required.');
  }
  async completion(prompt: any, modelName?: string): Promise<any> {
    console.log('--- Calling Midjourney API ---');
    // In a real scenario, you'd use the modelName if needed for different image models
    return Promise.resolve({ imageUrl: 'https://example.com/generated-image.jpg' });
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
    case 'gemini':
      return new GeminiClient(apiKey);
    case 'perplexity':
      return new PerplexityClient(apiKey);
    case 'midjourney':
      return new MidjourneyClient(apiKey);
    default:
      throw new Error(`Unsupported model type for client factory: ${model}`);
  }
}; 