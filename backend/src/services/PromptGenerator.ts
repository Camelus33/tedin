import { ContextBundle } from './ContextOrchestrator';

// AI 모델별 프롬프트 생성 전략을 정의하는 인터페이스
export interface PromptStrategy {
  createPrompt(bundle: ContextBundle, userQuery: string): any; // 반환 타입은 모델별로 다름 (string | object[])
}

// OpenAI 모델에 최적화된 프롬프트 생성 전략
class OpenAIPromptStrategy implements PromptStrategy {
  createPrompt(bundle: ContextBundle, userQuery: string) {
    const contextString = bundle.relevantNotes
      .map(note => `- ${note.content} (Tags: ${note.tags.join(', ')})`)
      .join('\n');

    const messages = [
      {
        role: 'system',
        content: `You are an expert assistant. Use the following context to answer the user's question. The context is a collection of the user's personal notes.\n\n### Context ###\n${contextString}`
      },
      {
        role: 'user',
        content: userQuery
      }
    ];
    return messages;
  }
}

// Anthropic Claude 모델에 최적화된 프롬프트 생성 전략
class ClaudePromptStrategy implements PromptStrategy {
  createPrompt(bundle: ContextBundle, userQuery: string) {
    const contextString = bundle.relevantNotes
      .map(note => `<note tags="${note.tags.join(',')}">\n${note.content}\n</note>`)
      .join('\n\n');

    // Claude 3는 XML 태그를 사용한 컨텍스트 분리를 잘 처리합니다.
    const prompt = `Here is a collection of my personal notes inside <context> tags. Please use this information to answer my question that follows.\n\n<context>\n${contextString}\n</context>\n\nHuman: ${userQuery}\n\nAssistant:`;
    return prompt;
  }
}

// Gemini Prompt Strategy (Google Gemini) – 단순 Chat 스타일
class GeminiPromptStrategy implements PromptStrategy {
  createPrompt(bundle: ContextBundle, userQuery: string) {
    const contextString = bundle.relevantNotes.map(n => `• ${n.content}`).join('\n');
    return `You are a helpful assistant. Context:\n${contextString}\n\nUser: ${userQuery}\nAssistant:`;
  }
}

// Perplexity Prompt Strategy – Q&A 스타일
class PerplexityPromptStrategy implements PromptStrategy {
  createPrompt(bundle: ContextBundle, userQuery: string) {
    const context = bundle.relevantNotes.map(n => n.content).join('\n');
    return { context, question: userQuery };
  }
}

// Midjourney Prompt Strategy – 이미지 프롬프트 구성 (텍스트 기반)
class MidjourneyPromptStrategy implements PromptStrategy {
  createPrompt(bundle: ContextBundle, userQuery: string) {
    const keywords = bundle.relevantNotes.slice(0, 5).map(n => n.tags.join(',')).join(' ');
    return `${userQuery} | ${keywords} --v 6 --stylize 60`;
  }
}

export type SupportedModels = 'openai' | 'claude' | 'gemini' | 'perplexity' | 'midjourney';

/**
 * PromptGenerator
 * ContextBundle을 받아 각 AI 모델에 최적화된 프롬프트를 생성합니다.
 */
export class PromptGenerator {
  private strategy: PromptStrategy;

  constructor(model: SupportedModels) {
    switch (model) {
      case 'openai':
        this.strategy = new OpenAIPromptStrategy();
        break;
      case 'claude':
        this.strategy = new ClaudePromptStrategy();
        break;
      case 'gemini':
        this.strategy = new GeminiPromptStrategy();
        break;
      case 'perplexity':
        this.strategy = new PerplexityPromptStrategy();
        break;
      case 'midjourney':
        this.strategy = new MidjourneyPromptStrategy();
        break;
      default:
        throw new Error(`Unsupported model type: ${model}`);
    }
  }

  /**
   * 선택된 모델 전략에 따라 프롬프트를 생성합니다.
   * @param bundle - 컨텍스트 조합 결과
   * @param userQuery - 사용자의 원본 질문
   * @returns AI API에 전송할 프롬프트
   */
  public generate(bundle: ContextBundle, userQuery: string): any {
    return this.strategy.createPrompt(bundle, userQuery);
  }
} 