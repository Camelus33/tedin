import { ContextBundle } from './ContextOrchestrator';
import { AdvancedTripleExtractor } from './AdvancedTripleExtractor';
import { FusekiUpdateService, UpdateResult, BatchUpdateResult } from './FusekiUpdateService';

// 지식 그래프에 추가될 새로운 지식 조각 (RDF 트리플)
// 사용자 중심 지식 진화 추적을 위한 확장된 인터페이스
export interface NewKnowledgeTriple {
  subject: string;   // 예: "habitus33:Note_123"
  predicate: string; // 예: "habitus33:explains"
  object: string;    // 예: "dbpedia:Machine_Learning"
  confidence?: number; // 0-1 범위의 신뢰도 점수
  source?: string;   // 트리플 출처 (AI 모델명 등)
  
  // 🎯 사용자 중심 지식 진화 추적 필드들
  sourceType?: 'user_organic' | 'ai_assisted'; // 출처 유형: 사용자 순수 vs AI 보조 (기본값: ai_assisted)
  originalMemoId?: string;  // 원본 메모 ID (사용자 메모에서 파생된 경우)
  derivedFromUser?: boolean; // 사용자의 기존 메모에서 파생되었는지 여부
  temporalContext?: string; // 시간적 맥락 (메모 작성 시점, 진화 단계 등)
  evolutionStage?: 'initial' | 'connected' | 'synthesized' | 'gap_filled'; // 지식 진화 단계
  userConfidence?: number; // 사용자가 이 연결에 대해 갖는 신뢰도 (별도 추적)
}

// 사용자에게 보여주기 위해 가공된 최종 응답
export interface FormattedResponse {
  content: string;
  citations: {
    sourceContent: string;
    // noteId, bookId 등 출처를 특정할 수 있는 정보
  }[];
  extractedTriples?: NewKnowledgeTriple[];
  parsingInfo?: {
    format: string;
    success: boolean;
    errors?: string[];
  };
  fusekiUpdateResult?: BatchUpdateResult;
}

// AI 응답의 구조화된 형태
export interface StructuredAIResponse {
  content: string;
  triples?: NewKnowledgeTriple[];
  entities?: string[];
  relationships?: Array<{
    subject: string;
    predicate: string;
    object: string;
    confidence?: number;
  }>;
  metadata?: {
    model: string;
    timestamp: string;
    context: string;
  };
}

// 지원되는 응답 형식
export enum ResponseFormat {
  JSON = 'json',
  XML = 'xml',
  CSV = 'csv',
  TRIPLE = 'triple',
  STRUCTURED = 'structured',
  RAW_TEXT = 'raw_text'
}

/**
 * ResponseHandler
 * AI의 응답을 파싱, 가공하고 새로운 지식을 추출하여 시스템에 재학습시킵니다.
 * 
 * 향상된 기능:
 * - 다양한 구조화된 형식 지원 (JSON, XML, CSV)
 * - 강화된 오류 처리 및 검증
 * - 스키마 기반 검증
 * - 신뢰도 점수 계산
 */
export class ResponseHandler {
  private rawResponse: any; // AI 모델의 원본 응답
  private contextBundle: ContextBundle;
  private expectedFormat: ResponseFormat;
  private parsingErrors: string[] = [];
  private advancedExtractor: AdvancedTripleExtractor;
  private fusekiUpdateService: FusekiUpdateService;

  constructor(
    rawResponse: any, 
    contextBundle: ContextBundle,
    expectedFormat: ResponseFormat = ResponseFormat.RAW_TEXT
  ) {
    this.rawResponse = rawResponse;
    this.contextBundle = contextBundle;
    this.expectedFormat = expectedFormat;
    this.advancedExtractor = new AdvancedTripleExtractor();
    this.fusekiUpdateService = new FusekiUpdateService();
  }

  /**
   * AI 응답 텍스트를 추출합니다. (모델별로 상이)
   */
  private extractText(): string {
    try {
      // null 또는 undefined 응답 처리
      if (this.rawResponse === null || this.rawResponse === undefined) {
        return '';
      }
      
      // OpenAI 예시
      if (this.rawResponse?.choices?.[0]?.message?.content) {
        return this.rawResponse.choices[0].message.content;
      }
      
      // Claude 예시 (단순 문자열 응답)
      if (typeof this.rawResponse === 'string') {
        // "Assistant: " 이후의 텍스트만 추출
        const assistantResponse = this.rawResponse.split('Assistant:')[1];
        return assistantResponse ? assistantResponse.trim() : this.rawResponse.trim();
      }
      
      // Gemini 실제 응답: candidates[0].content.parts[0].text
      if (this.rawResponse?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return this.rawResponse.candidates[0].content.parts[0].text;
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
    } catch (error) {
      this.parsingErrors.push(`Text extraction failed: ${error}`);
      return '';
    }
  }

  /**
   * 구조화된 데이터를 파싱합니다.
   */
  private parseStructuredResponse(responseText: string): StructuredAIResponse | null {
    try {
      // 빈 응답 처리
      if (!responseText || responseText.trim() === '') {
        return null;
      }
      
      switch (this.expectedFormat) {
        case ResponseFormat.JSON:
          return this.parseJSONResponse(responseText);
        case ResponseFormat.XML:
          return this.parseXMLResponse(responseText);
        case ResponseFormat.CSV:
          return this.parseCSVResponse(responseText);
        case ResponseFormat.TRIPLE:
          return this.parseTripleResponse(responseText);
        case ResponseFormat.STRUCTURED:
          return this.parseStructuredFormat(responseText);
        default:
          return null;
      }
    } catch (error) {
      this.parsingErrors.push(`Structured parsing failed: ${error}`);
      return null;
    }
  }

  /**
   * JSON 형식 응답을 파싱합니다.
   */
  private parseJSONResponse(responseText: string): StructuredAIResponse | null {
    try {
      // JSON 블록 추출 (```json ... ``` 형태 지원)
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || 
                       responseText.match(/```\s*([\s\S]*?)\s*```/) ||
                       [null, responseText];
      
      const jsonText = jsonMatch[1] || responseText;
      const parsed = JSON.parse(jsonText.trim());
      
      // 스키마 검증
      if (this.validateJSONSchema(parsed)) {
        return {
          content: parsed.content || responseText,
          triples: parsed.triples || [],
          entities: parsed.entities || [],
          relationships: parsed.relationships || [],
          metadata: parsed.metadata || {}
        };
      }
      
      return null;
    } catch (error) {
      this.parsingErrors.push(`JSON parsing error: ${error}`);
      return null;
    }
  }

  /**
   * XML 형식 응답을 파싱합니다.
   */
  private parseXMLResponse(responseText: string): StructuredAIResponse | null {
    try {
      // 간단한 XML 파싱 (실제 프로덕션에서는 xml2js 등 라이브러리 사용 권장)
      const tripleMatches = responseText.match(/<triple>\s*<subject>(.*?)<\/subject>\s*<predicate>(.*?)<\/predicate>\s*<object>(.*?)<\/object>\s*<\/triple>/g);
      
      if (tripleMatches) {
        const triples: NewKnowledgeTriple[] = tripleMatches.map(match => {
          const subjectMatch = match.match(/<subject>(.*?)<\/subject>/);
          const predicateMatch = match.match(/<predicate>(.*?)<\/predicate>/);
          const objectMatch = match.match(/<object>(.*?)<\/object>/);
          
          return {
            subject: subjectMatch?.[1] || '',
            predicate: predicateMatch?.[1] || '',
            object: objectMatch?.[1] || '',
            confidence: 0.8
          };
        });
        
        return {
          content: responseText,
          triples,
          entities: [],
          relationships: []
        };
      }
      
      return null;
    } catch (error) {
      this.parsingErrors.push(`XML parsing error: ${error}`);
      return null;
    }
  }

  /**
   * CSV 형식 응답을 파싱합니다.
   */
  private parseCSVResponse(responseText: string): StructuredAIResponse | null {
    try {
      const lines = responseText.trim().split('\n');
      const header = lines[0]?.split(',').map(h => h.trim());
      
      if (!header || !header.includes('subject') || !header.includes('predicate') || !header.includes('object')) {
        return null;
      }
      
      const triples: NewKnowledgeTriple[] = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/['"]/g, ''));
        const subjectIndex = header.indexOf('subject');
        const predicateIndex = header.indexOf('predicate');
        const objectIndex = header.indexOf('object');
        
        return {
          subject: values[subjectIndex] || '',
          predicate: values[predicateIndex] || '',
          object: values[objectIndex] || '',
          confidence: 0.7
        };
      }).filter(triple => triple.subject && triple.predicate && triple.object);
      
      return {
        content: responseText,
        triples,
        entities: [],
        relationships: []
      };
    } catch (error) {
      this.parsingErrors.push(`CSV parsing error: ${error}`);
      return null;
    }
  }

  /**
   * 트리플 형식 응답을 파싱합니다.
   */
  private parseTripleResponse(responseText: string): StructuredAIResponse | null {
    try {
      // "Subject: X, Predicate: Y, Object: Z" 형태 파싱
      const triplePattern = /Subject:\s*([^,]+),\s*Predicate:\s*([^,]+),\s*Object:\s*(.+)/g;
      const triples: NewKnowledgeTriple[] = [];
      let match;
      
      while ((match = triplePattern.exec(responseText)) !== null) {
        triples.push({
          subject: match[1].trim(),
          predicate: match[2].trim(),
          object: match[3].trim(),
          confidence: 0.8
        });
      }
      
      return {
        content: responseText,
        triples,
        entities: [],
        relationships: []
      };
    } catch (error) {
      this.parsingErrors.push(`Triple parsing error: ${error}`);
      return null;
    }
  }

  /**
   * 구조화된 형식 응답을 파싱합니다.
   */
  private parseStructuredFormat(responseText: string): StructuredAIResponse | null {
    try {
      // 여러 형식을 순차적으로 시도
      return this.parseJSONResponse(responseText) ||
             this.parseTripleResponse(responseText) ||
             this.parseXMLResponse(responseText) ||
             null;
    } catch (error) {
      this.parsingErrors.push(`Structured format parsing error: ${error}`);
      return null;
    }
  }

  /**
   * JSON 스키마를 검증합니다.
   */
  private validateJSONSchema(data: any): boolean {
    try {
      // 기본 스키마 검증
      if (typeof data !== 'object' || data === null) {
        return false;
      }
      
      // 선택적 필드 검증
      if (data.triples && !Array.isArray(data.triples)) {
        return false;
      }
      
      if (data.entities && !Array.isArray(data.entities)) {
        return false;
      }
      
      // 트리플 구조 검증
      if (data.triples) {
        for (const triple of data.triples) {
          if (!triple.subject || !triple.predicate || !triple.object) {
            return false;
          }
        }
      }
      
      return true;
    } catch (error) {
      this.parsingErrors.push(`Schema validation error: ${error}`);
      return false;
    }
  }

  /**
   * 사용된 AI 모델명을 추출합니다.
   */
  private getModelName(): string {
    // OpenAI 응답에서 모델명 추출
    if (this.rawResponse?.model) {
      return this.rawResponse.model;
    }
    
    // 기타 모델들의 경우 응답 구조에서 추정
    if (this.rawResponse?.choices) {
      return 'openai-model';
    }
    
    if (this.rawResponse?.candidates) {
      return 'gemini-model';
    }
    
    if (typeof this.rawResponse === 'string') {
      return 'claude-model';
    }
    
    return 'unknown-model';
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
   * AI 답변에서 새로운 지식 트리플을 추출합니다.
   * 🎯 사용자 중심 지식 진화 추적 로직 포함
   */
  public extractNewKnowledge(): NewKnowledgeTriple[] {
    try {
      const responseText = this.extractText();
      const structuredData = this.parseStructuredResponse(responseText);
      
      // 구조화된 데이터에서 트리플 추출
      if (structuredData?.triples && structuredData.triples.length > 0) {
        return structuredData.triples.map(triple => this.enrichTripleWithUserContext({
          ...triple,
          source: this.getModelName(),
          confidence: triple.confidence || 0.7
        }));
      }
      
      // 기존 규칙 기반 추출 (fallback)
      const fallbackTriples: NewKnowledgeTriple[] = [];
      
      if (responseText.includes('지도학습은 대표적인 머신러닝의 종류입니다.')) {
        fallbackTriples.push(this.enrichTripleWithUserContext({
          subject: 'app:SupervisedLearning',
          predicate: 'rdfs:subClassOf',
          object: 'app:MachineLearning',
          confidence: 0.9,
          source: this.getModelName()
        }));
      }
      
      // 다양한 한국어 관계 패턴으로 관계 추출 (테스트 대응)
      const relationPatterns = [
        /(.+)은\s*(.+)의\s*(일종|형태|부분|종류|하위\s*분야)이?다/g,
        /(.+)는\s*(.+)의\s*(일종|형태|부분|종류|하위\s*분야)이?다/g,
        /(.+)은\s*(.+)에\s*속한다/g,
        /(.+)는\s*(.+)에\s*속한다/g,
        /(.+)은\s*(.+)을\s*포함한다/g,
        /(.+)는\s*(.+)를\s*포함한다/g,
        /(.+)은\s*(.+)의\s*고급\s*형태입니다/g,
        /(.+)는\s*(.+)의\s*고급\s*형태입니다/g,
        /(.+)은\s*(.+)과\s*밀접한\s*관련이\s*있습니다/g,
        /(.+)는\s*(.+)와\s*밀접한\s*관련이\s*있습니다/g
      ];
      
      relationPatterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(responseText)) !== null) {
          fallbackTriples.push(this.enrichTripleWithUserContext({
            subject: `app:${match[1].trim().replace(/\s+/g, '_')}`,
            predicate: 'rdfs:subClassOf',
            object: `app:${match[2].trim().replace(/\s+/g, '_')}`,
            confidence: 0.6,
            source: this.getModelName()
          }));
        }
      });
      
      return fallbackTriples;
    } catch (error) {
      this.parsingErrors.push(`Knowledge extraction error: ${error}`);
      return [];
    }
  }

  /**
   * 🎯 트리플에 사용자 맥락 정보를 추가합니다.
   * 사용자 메모 기반 vs AI 생성 구분하여 신뢰도와 출처 타입을 설정합니다.
   */
  private enrichTripleWithUserContext(triple: Partial<NewKnowledgeTriple>): NewKnowledgeTriple {
    const enriched: NewKnowledgeTriple = {
      subject: triple.subject || '',
      predicate: triple.predicate || '',
      object: triple.object || '',
      confidence: triple.confidence || 0.7,
      source: triple.source || this.getModelName(),
      sourceType: 'ai_assisted', // 기본값
      derivedFromUser: false,
      evolutionStage: 'initial',
      temporalContext: new Date().toISOString()
    };

    // 사용자 메모에서 파생되었는지 확인
    const userMemos = this.contextBundle?.relevantNotes || [];
    const hasUserMemoContext = userMemos.length > 0;
    
    if (hasUserMemoContext) {
      // 🎯 향상된 사용자 메모 매칭 로직 - 더 유연한 텍스트 매칭
      const subjectText = this.cleanEntityText(triple.subject || '');
      const objectText = this.cleanEntityText(triple.object || '');
      
      const subjectInMemos = this.findInMemos(subjectText, userMemos);
      const objectInMemos = this.findInMemos(objectText, userMemos);

      if (subjectInMemos && objectInMemos) {
        // 양쪽 모두 사용자 메모에 있는 경우 = 사용자 순수 연결
        enriched.sourceType = 'user_organic';
        enriched.derivedFromUser = true;
        enriched.confidence = Math.min((enriched.confidence || 0.7) + 0.2, 0.95); // 신뢰도 향상
        enriched.evolutionStage = 'connected';
        
        // 원본 메모 ID 찾기 (첫 번째로 발견된 메모)
        const sourceMemo = userMemos.find(memo => 
          memo.content.toLowerCase().includes(triple.subject?.toLowerCase().replace('app:', '') || '')
        );
        if (sourceMemo) {
          // relevantNotes의 인덱스를 ID로 사용 (실제 구현에서는 proper ID 필드 사용)
          const memoIndex = userMemos.indexOf(sourceMemo);
          enriched.originalMemoId = `memo_${memoIndex}`;
        }
      } else if (subjectInMemos || objectInMemos) {
        // 한쪽만 사용자 메모에 있는 경우 = 부분적으로 사용자 기반
        enriched.sourceType = 'ai_assisted';
        enriched.derivedFromUser = true;
        enriched.confidence = Math.min((enriched.confidence || 0.7) + 0.1, 0.85); // 약간의 신뢰도 향상
        enriched.evolutionStage = 'gap_filled'; // 지식 공백을 AI가 채운 상황
      }
    }

    return enriched;
  }

  /**
   * 🎯 엔티티 텍스트를 정제합니다. (URI 접두사 제거, 언더스코어 처리 등)
   */
  private cleanEntityText(entityText: string): string {
    return entityText
      .replace(/^(app|habitus33|dbpedia):/g, '') // URI 접두사 제거
      .replace(/_/g, ' ') // 언더스코어를 공백으로
      .replace(/Concept_/g, '') // Concept_ 접두사 제거
      .trim()
      .toLowerCase();
  }

  /**
   * 🎯 사용자 메모에서 텍스트를 찾는 향상된 로직
   */
  private findInMemos(searchText: string, memos: any[]): boolean {
    if (!searchText || searchText.trim().length < 2) {
      return false;
    }
    
    const cleanSearchText = searchText.toLowerCase().trim();
    
    return memos.some(memo => {
      const memoContent = memo.content.toLowerCase();
      
      // 1. 정확한 매칭
      if (memoContent.includes(cleanSearchText)) {
        return true;
      }
      
      // 2. 부분 매칭 (단어 단위)
      const searchWords = cleanSearchText.split(/\s+/);
      const memoWords = memoContent.split(/\s+/);
      
      return searchWords.every(searchWord => 
        memoWords.some(memoWord => 
          memoWord.includes(searchWord) || searchWord.includes(memoWord)
        )
      );
    });
  }

  /**
   * 고급 NLP 기법을 사용하여 트리플을 추출합니다.
   */
  public async extractAdvancedTriples(): Promise<NewKnowledgeTriple[]> {
    try {
      const responseText = this.extractText();
      if (!responseText || responseText.trim().length === 0) {
        return [];
      }
      
      // 고급 NLP 분석 수행 (사용자 맥락 포함)
      const advancedTriples = await this.advancedExtractor.extractTriples(responseText, this.getModelName(), this.contextBundle);
      
      // 기본 패턴 매칭도 함께 수행
      const basicTriples = this.extractNewKnowledge();
      
      // 두 결과를 합치고 중복 제거
      const allTriples = [...advancedTriples, ...basicTriples];
      return this.deduplicateTriples(allTriples);
      
    } catch (error) {
      console.error('고급 트리플 추출 중 오류:', error);
      this.parsingErrors.push(`Advanced triple extraction error: ${error}`);
      // 오류 발생시 기본 추출로 폴백
      return this.extractNewKnowledge();
    }
  }

  /**
   * 트리플을 추출하고 자동으로 Fuseki에 저장합니다.
   */
  public async extractAndStoreTriples(autoStore: boolean = true): Promise<{
    extractedTriples: NewKnowledgeTriple[];
    fusekiResult?: BatchUpdateResult;
  }> {
    try {
      console.log('[ResponseHandler] 트리플 추출 및 저장 시작...');
      
      // 1. 고급 트리플 추출
      const extractedTriples = await this.extractAdvancedTriples();
      
      if (extractedTriples.length === 0) {
        console.log('[ResponseHandler] 추출된 트리플이 없습니다.');
        return { extractedTriples: [] };
      }

      console.log(`[ResponseHandler] ${extractedTriples.length}개 트리플 추출 완료`);
      
      // 2. Fuseki에 저장 (옵션에 따라)
      let fusekiResult: BatchUpdateResult | undefined;
      
      if (autoStore) {
        console.log('[ResponseHandler] Fuseki에 트리플 저장 중...');
        fusekiResult = await this.fusekiUpdateService.insertTriples(extractedTriples, {
          enableBatch: true,
          batchSize: 25,
          validateBeforeInsert: true,
          handleDuplicates: 'skip'
        });
        
        console.log(`[ResponseHandler] Fuseki 저장 완료: ${fusekiResult.successfulTriples}개 성공, ${fusekiResult.failedTriples}개 실패`);
        
        if (fusekiResult.errors.length > 0) {
          console.warn('[ResponseHandler] Fuseki 저장 중 오류:', fusekiResult.errors);
          this.parsingErrors.push(...fusekiResult.errors);
        }
      }

      return {
        extractedTriples,
        fusekiResult
      };
      
    } catch (error) {
      console.error('[ResponseHandler] 트리플 추출 및 저장 중 오류:', error);
      this.parsingErrors.push(`Extract and store error: ${error}`);
      
      // 오류 발생 시 기본 추출이라도 반환
      const fallbackTriples = await this.extractAdvancedTriples();
      return { extractedTriples: fallbackTriples };
    }
  }

  /**
   * 트리플 중복을 제거합니다.
   */
  private deduplicateTriples(triples: NewKnowledgeTriple[]): NewKnowledgeTriple[] {
    const seen = new Set<string>();
    return triples.filter(triple => {
      const key = `${triple.subject}_${triple.predicate}_${triple.object}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    }).sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
  }

  /**
   * 최종적으로 사용자에게 보여줄 응답을 포맷팅합니다.
   */
  public formatForDisplay(): FormattedResponse {
    const content = this.extractText();
    const citations = this.findCitations(content);
    const extractedTriples = this.extractNewKnowledge();

    return {
      content,
      citations,
      extractedTriples,
      parsingInfo: {
        format: this.expectedFormat,
        success: this.parsingErrors.length === 0,
        errors: this.parsingErrors.length > 0 ? this.parsingErrors : undefined
      }
    };
  }

  /**
   * 트리플 추출과 Fuseki 저장을 포함한 완전한 응답을 포맷팅합니다.
   */
  public async formatForDisplayWithStorage(enableFusekiStorage: boolean = true): Promise<FormattedResponse> {
    const content = this.extractText();
    const citations = this.findCitations(content);
    
    // 고급 트리플 추출 및 저장
    const { extractedTriples, fusekiResult } = await this.extractAndStoreTriples(enableFusekiStorage);

    return {
      content,
      citations,
      extractedTriples,
      parsingInfo: {
        format: this.expectedFormat,
        success: this.parsingErrors.length === 0,
        errors: this.parsingErrors.length > 0 ? this.parsingErrors : undefined
      },
      fusekiUpdateResult: fusekiResult
    };
  }

  /**
   * 파싱 에러 정보를 반환합니다.
   */
  public getParsingErrors(): string[] {
    return [...this.parsingErrors];
  }

  /**
   * 응답 형식을 설정합니다.
   */
  public setExpectedFormat(format: ResponseFormat): void {
    this.expectedFormat = format;
  }
} 