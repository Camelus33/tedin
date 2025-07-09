import { ContextBundle } from './ContextOrchestrator';

// 지식 그래프에 추가될 새로운 지식 조각 (RDF 트리플)
export interface NewKnowledgeTriple {
  subject: string;   // 예: "habitus33:Note_123"
  predicate: string; // 예: "habitus33:explains"
  object: string;    // 예: "dbpedia:Machine_Learning"
}

// 사용자에게 보여주기 위해 가공된 최종 응답
export interface FormattedResponse {
  content: string;
  citations: {
    sourceContent: string;
    // noteId, bookId 등 출처를 특정할 수 있는 정보
  }[];
}

/**
 * ResponseHandler
 * AI의 응답을 파싱, 가공하고 새로운 지식을 추출하여 시스템에 재학습시킵니다.
 */
export class ResponseHandler {
  private rawResponse: any; // AI 모델의 원본 응답
  private contextBundle: ContextBundle;

  constructor(rawResponse: any, contextBundle: ContextBundle) {
    this.rawResponse = rawResponse;
    this.contextBundle = contextBundle;
  }

  /**
   * AI 응답 텍스트를 추출합니다. (모델별로 상이)
   */
  private extractText(): string {
    // OpenAI 예시
    if (this.rawResponse?.choices?.[0]?.message?.content) {
      return this.rawResponse.choices[0].message.content;
    }
    // Claude 예시 (단순 문자열 응답)
    if (typeof this.rawResponse === 'string') {
        // "Assistant: " 이후의 텍스트만 추출
        const assistantResponse = this.rawResponse.split('Assistant:')[1];
        return assistantResponse ? assistantResponse.trim() : '';
    }
    // Gemini stub
    if (this.rawResponse?.output) {
      return this.rawResponse.output;
    }
    // Perplexity stub
    if (this.rawResponse?.answer) {
      return this.rawResponse.answer;
    }
    // Midjourney stub (image prompt) – 반환값을 텍스트로 변환
    if (this.rawResponse?.imageUrl) {
      return `이미지 생성 완료: ${this.rawResponse.imageUrl}`;
    }
    return '';
  }

  /**
   * AI 답변의 근거가 된 출처를 식별합니다. (고급 기능, 현재는 Mock)
   */
  private findCitations(responseText: string): any[] {
    // TODO: AI 응답 내용과 ContextBundle의 노트를 비교하여
    // 어떤 컨텍스트가 답변 생성에 사용되었는지 추적하는 로직 구현.
    // 여기서는 컨텍스트로 제공된 첫번째 노트를 인용했다고 가정합니다.
    const usedNote = this.contextBundle.relevantNotes[0];
    if (usedNote && responseText.includes('정의')) { // '정의'라는 단어가 있으면 인용했다고 가정
      return [{ sourceContent: usedNote.content }];
    }
    return [];
  }

  /**
   * AI 답변에서 새로운 지식 트리플을 추출합니다. (고급 기능, 현재는 Mock)
   */
  public extractNewKnowledge(): NewKnowledgeTriple[] {
    // TODO: AI 응답을 자연어 처리하여 새로운 관계나 사실을
    // 온톨로지 트리플 형태로 추출하는 로직 구현.
    const responseText = this.extractText();
    if (responseText.includes('지도학습은 대표적인 머신러닝의 종류입니다.')) {
      return [{
        subject: 'app:SupervisedLearning',
        predicate: 'rdfs:subClassOf',
        object: 'app:MachineLearning'
      }];
    }
    return [];
  }

  /**
   * 최종적으로 사용자에게 보여줄 응답을 포맷팅합니다.
   */
  public formatForDisplay(): FormattedResponse {
    const content = this.extractText();
    const citations = this.findCitations(content);

    return {
      content,
      citations,
    };
  }
} 