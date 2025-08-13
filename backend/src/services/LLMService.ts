import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
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
  // 중립 시스템 프롬프트: 품질/안전 가드레일만 포함
  private static readonly NEUTRAL_SYSTEM_PROMPT = [
    '당신은 중립적인 AI 어시스턴트입니다.',
    '정확하고 근거 중심으로 답변하며, 확신이 없으면 불확실성을 명시하세요.',
    '검색된 사용자 메모를 우선적으로 근거로 활용하되, 추정은 피하고 과장하지 마세요.',
    '개인정보/민감정보 요청이나 유해한 지시가 있으면 정중히 거부하세요.',
    '가능하면 간결하고 구조화된 형식(불릿/단계)으로 답변하세요.'
  ].join(' ');

  /**
   * 사용자 메시지 선두에서 페르소나/톤 지시를 파싱하고 본문에서 제거
   */
  private extractPersonaDirectives(message: string): { cleanedMessage: string; persona?: string; tone?: string } {
    const lines = (message || '').split(/\r?\n/);
    let idx = 0;
    let persona: string | undefined;
    let tone: string | undefined;

    const norm = (s: string) => s.trim().toLowerCase();
    const mapPersona = (raw: string) => {
      const v = norm(raw);
      if (['연구어시스턴트', '연구조교', 'research', 'research-assistant', '리서치', '리서처'].includes(v)) return 'research-assistant';
      if (['학습코치', '코치', 'coach', 'study-coach'].includes(v)) return 'study-coach';
      if ([
        '기술문서 작성자',
        '기술 문서 작성자',
        '기술문서 전문가',
        '기술 문서화 전문가',
        '문서화 전문가',
        'tech-writer',
        'technical-writer',
        '테크라이터',
        '테크니컬 라이터'
      ].includes(v)) return 'tech-writer';
      return undefined;
    };
    const mapTone = (raw: string) => {
      const v = norm(raw);
      if (['친근', 'friendly'].includes(v)) return 'friendly';
      if (['격식', 'formal'].includes(v)) return 'formal';
      if (['간결', 'concise'].includes(v)) return 'concise';
      if (['깊이', '심화', 'in-depth', 'depth'].includes(v)) return 'in-depth';
      return undefined;
    };

    while (idx < lines.length) {
      const line = lines[idx].trim();
      if (line === '') { idx++; continue; }
      const mPersona = line.match(/^\s*(persona|역할)\s*:\s*(.+)$/i);
      const mTone = line.match(/^\s*(tone|톤)\s*:\s*(.+)$/i);
      if (mPersona) { persona = mapPersona(mPersona[2]); idx++; continue; }
      if (mTone) { tone = mapTone(mTone[2]); idx++; continue; }
      break;
    }
    const cleaned = lines.slice(idx).join('\n').trim();
    return { cleanedMessage: cleaned || message, persona, tone };
  }

  private buildStyleOverlay(persona?: string, tone?: string): string | undefined {
    const personaText = (() => {
      switch (persona) {
        case 'research-assistant':
          return '스타일 지침: 연구 어시스턴트 톤으로, 근거 중심 요약과 핵심 인사이트를 제공하세요.';
        case 'study-coach':
          return '스타일 지침: 학습 코치 톤으로, 단계별 학습전략과 실천 과제를 제안하세요.';
        case 'tech-writer':
          return '스타일 지침: 기술문서 작성자 톤으로, 간결한 구조와 명확한 용어 정의를 사용하세요.';
        default:
          return undefined;
      }
    })();
    const toneText = (() => {
      switch (tone) {
        case 'friendly':
          return '친근하고 존중하는 말투를 사용하세요.';
        case 'formal':
          return '격식 있고 중립적인 말투를 사용하세요.';
        case 'concise':
          return '불필요한 수식을 줄이고 간결하게 답변하세요.';
        case 'in-depth':
          return '핵심에서 시작하되 필요 시 근거와 한계까지 깊이 있게 제시하세요.';
        default:
          return undefined;
      }
    })();
    const parts = [personaText, toneText].filter(Boolean) as string[];
    return parts.length ? parts.join(' ') : undefined;
  }

  /**
   * 대화 메타(기본 페르소나/톤) 적용: runtime 전달값(옵션)을 파싱 결과에 병합
   */
  private mergeSessionPreferences(
    parsed: { cleanedMessage: string; persona?: string; tone?: string },
    session?: { persona?: string; tone?: string }
  ) {
    return {
      cleanedMessage: parsed.cleanedMessage,
      persona: parsed.persona || session?.persona,
      tone: parsed.tone || session?.tone,
    };
  }
  /**
   * LLM 응답 생성
   * @param request LLM 요청
   * @returns LLM 응답
   */
  async generateResponse(request: LLMRequest): Promise<LLMResponse> {
    const { llmProvider, userApiKey } = request;

    // 사용자 입력 키만 허용. 누락 시 에러 반환
    if (!userApiKey || !String(userApiKey).trim()) {
      throw new Error(`${llmProvider}에 대한 사용자 API 키가 필요합니다.`);
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

      const merged = this.mergeSessionPreferences(
        this.extractPersonaDirectives(request.message),
        // 대화 전체 기본값은 현재는 라우트에서 보관하되, 여기서는 요청에 포함된 값만 사용 가능
        undefined
      );
      const { cleanedMessage, persona, tone } = merged;
      const context = SearchContextService.createOptimizedPrompt(
        request.searchContext.results,
        request.searchContext.query,
        cleanedMessage
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
        const style = this.buildStyleOverlay(persona, tone);
        const resp: any = await (openai as any).responses.create({
          model: request.llmModel,
          instructions: style
            ? `${LLMService.NEUTRAL_SYSTEM_PROMPT} ${style}`
            : LLMService.NEUTRAL_SYSTEM_PROMPT,
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
      const style = this.buildStyleOverlay(persona, tone);
      const completion = await openai.chat.completions.create({
        model: request.llmModel,
        messages: [
          {
            role: 'system',
            content: style
              ? `${LLMService.NEUTRAL_SYSTEM_PROMPT} ${style}`
              : LLMService.NEUTRAL_SYSTEM_PROMPT
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
    try {
      const anthropic = new Anthropic({ apiKey: request.userApiKey });
      const merged = this.mergeSessionPreferences(
        this.extractPersonaDirectives(request.message),
        undefined
      );
      const { cleanedMessage, persona, tone } = merged;
      const context = SearchContextService.createOptimizedPrompt(
        request.searchContext.results,
        request.searchContext.query,
        cleanedMessage
      );
      const style = this.buildStyleOverlay(persona, tone);
      const system = style
        ? `${LLMService.NEUTRAL_SYSTEM_PROMPT} ${style}`
        : LLMService.NEUTRAL_SYSTEM_PROMPT;

      const model = request.llmModel || 'claude-3-5-sonnet-latest';
      const completion = await (anthropic.messages.create as any)({
        model,
        max_tokens: 1024,
        temperature: 0.7,
        system,
        messages: [
          {
            role: 'user',
            content: context,
          },
        ],
      });

      const text = (completion as any)?.content?.[0]?.text ||
        (completion as any)?.content?.[0]?.type === 'text' && (completion as any)?.content?.[0]?.text ||
        JSON.stringify(completion);

      return {
        content: typeof text === 'string' ? text : '[빈 응답]',
        model,
        provider: 'Claude',
        usage: undefined,
      };
    } catch (error) {
      console.error(`Claude 응답 생성 오류:`, error);
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
    try {
      const genAI = new GoogleGenerativeAI(request.userApiKey);
      const model = request.llmModel || 'gemini-2.0-flash';
      const merged = this.mergeSessionPreferences(
        this.extractPersonaDirectives(request.message),
        undefined
      );
      const { cleanedMessage, persona, tone } = merged;
      const context = SearchContextService.createOptimizedPrompt(
        request.searchContext.results,
        request.searchContext.query,
        cleanedMessage
      );
      const style = this.buildStyleOverlay(persona, tone);
      const systemText = style
        ? `${LLMService.NEUTRAL_SYSTEM_PROMPT} ${style}`
        : LLMService.NEUTRAL_SYSTEM_PROMPT;

      // text-only generation using SDK
      const generation = await genAI.getGenerativeModel({ model }).generateContent({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: systemText + '\n\n' + context,
              },
            ],
          },
        ],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
      } as any);

      const text = (generation as any)?.response?.text?.() ||
                   (generation as any)?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
                   '[빈 응답]';

      return {
        content: typeof text === 'string' ? text : '[빈 응답]',
        model,
        provider: 'Gemini',
      };
    } catch (error) {
      console.error(`Gemini 응답 생성 오류:`, error);
      console.error('Gemini API 호출 오류 상세:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      throw error;
    }
  }

  // 정책상 서버 기본키는 사용하지 않습니다. (사용자 제공 키 필수)
  private getDefaultApiKey(_providerName: string): string | undefined {
    return undefined;
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