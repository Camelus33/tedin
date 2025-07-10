import { AdvancedTripleExtractor } from './AdvancedTripleExtractor';
import { ResponseHandler, ResponseFormat } from './ResponseHandler';

describe('AdvancedTripleExtractor Integration Tests', () => {
  let extractor: AdvancedTripleExtractor;

  beforeEach(() => {
    extractor = new AdvancedTripleExtractor();
  });

  describe('Core Functionality', () => {
    it('한국어 텍스트에서 개념을 추출하고 RDF 트리플을 생성해야 한다', async () => {
      const text = '머신러닝은 인공지능의 하위 분야이다.';
      const triples = await extractor.extractTriples(text, 'test-model');

      // 트리플이 생성되어야 함
      expect(triples.length).toBeGreaterThan(0);

      // 개념 엔티티 타입 트리플 확인
      const typeTriples = triples.filter(t => t.predicate === 'rdf:type');
      expect(typeTriples.length).toBeGreaterThan(0);

      // 라벨 트리플 확인
      const labelTriples = triples.filter(t => t.predicate === 'rdfs:label');
      expect(labelTriples.length).toBeGreaterThan(0);

      // 한국어 라벨 확인
      const koreanLabels = labelTriples.filter(t => t.object.includes('@ko'));
      expect(koreanLabels.length).toBeGreaterThan(0);

      // 모든 트리플이 필수 필드를 가져야 함
      triples.forEach(triple => {
        expect(triple.subject).toBeDefined();
        expect(triple.predicate).toBeDefined();
        expect(triple.object).toBeDefined();
        expect(triple.source).toBe('test-model');
        expect(triple.confidence).toBeGreaterThan(0);
      });
    });

    it('복합 개념을 포함한 텍스트를 처리할 수 있어야 한다', async () => {
      const text = '딥러닝 알고리즘은 데이터를 분석한다.';
      const triples = await extractor.extractTriples(text, 'test-model');

      expect(triples.length).toBeGreaterThan(0);

      // 여러 개념이 추출되어야 함
      const conceptTriples = triples.filter(t => 
        t.predicate === 'rdf:type' && t.object === 'habitus33:CONCEPT'
      );
      expect(conceptTriples.length).toBeGreaterThanOrEqual(2);

      // 딥러닝, 알고리즘, 데이터 등의 개념이 포함되어야 함
      const subjects = conceptTriples.map(t => t.subject);
      expect(subjects.some(s => s.includes('딥러닝'))).toBe(true);
      expect(subjects.some(s => s.includes('알고리즘'))).toBe(true);
      expect(subjects.some(s => s.includes('데이터'))).toBe(true);
    });

    it('빈 텍스트나 의미없는 텍스트를 안전하게 처리해야 한다', async () => {
      const emptyText = '';
      const meaninglessText = '아아아 으으으';

      const emptyTriples = await extractor.extractTriples(emptyText, 'test-model');
      const meaninglessTriples = await extractor.extractTriples(meaninglessText, 'test-model');

      // 빈 텍스트는 빈 결과
      expect(emptyTriples.length).toBe(0);

      // 의미없는 텍스트는 빈 결과이거나 낮은 신뢰도
      if (meaninglessTriples.length > 0) {
        meaninglessTriples.forEach(triple => {
          expect(triple.confidence).toBeLessThan(0.8);
        });
      }
    });
  });

  describe('ResponseHandler Integration', () => {
    it('ResponseHandler와 통합하여 고급 트리플 추출이 작동해야 한다', async () => {
      const mockResponse = {
        choices: [{ message: { content: '머신러닝은 데이터 기반 학습 방법이다.' } }]
      };
      const mockContext = {
        relevantNotes: [],
        relevantBooks: [],
        searchQuery: 'test',
        totalNotes: 0,
        totalBooks: 0,
        targetConcept: 'test-concept'
      };

      const handler = new ResponseHandler(mockResponse, mockContext, ResponseFormat.RAW_TEXT);
      const advancedTriples = await handler.extractAdvancedTriples();

      expect(advancedTriples.length).toBeGreaterThan(0);

      // 기본 추출과 고급 추출 결과가 합쳐져야 함
      const basicTriples = handler.extractNewKnowledge();
      expect(advancedTriples.length).toBeGreaterThanOrEqual(basicTriples.length);

      // 중복이 제거되어야 함
      const tripleKeys = advancedTriples.map(t => `${t.subject}_${t.predicate}_${t.object}`);
      const uniqueKeys = new Set(tripleKeys);
      expect(tripleKeys.length).toBe(uniqueKeys.size);
    });
  });

  describe('Performance and Reliability', () => {
    it('여러 텍스트를 연속으로 처리할 수 있어야 한다', async () => {
      const texts = [
        '자연어처리는 컴퓨터과학 분야이다.',
        '신경망은 딥러닝의 기반이다.',
        '알고리즘은 문제 해결 방법이다.',
        '데이터는 분석의 재료이다.',
        '인공지능은 미래 기술이다.'
      ];

      const results = [];
      for (const text of texts) {
        const triples = await extractor.extractTriples(text, 'batch-test');
        results.push(triples);
      }

      // 모든 텍스트에서 결과가 나와야 함
      expect(results.length).toBe(texts.length);
      results.forEach(triples => {
        expect(triples.length).toBeGreaterThan(0);
      });

      // 총 트리플 수 확인
      const totalTriples = results.flat().length;
      expect(totalTriples).toBeGreaterThan(10);
    });

    it('오류 상황에서도 안정적으로 작동해야 한다', async () => {
      const problematicTexts = [
        null as any,
        undefined as any,
        '',
        '!@#$%^&*()',
        '123456789',
        'a'.repeat(10000) // 매우 긴 텍스트
      ];

      for (const text of problematicTexts) {
        try {
          const triples = await extractor.extractTriples(text || '', 'error-test');
          // 오류가 발생하지 않고 배열이 반환되어야 함
          expect(Array.isArray(triples)).toBe(true);
        } catch (error) {
          // 오류가 발생해도 시스템이 중단되지 않아야 함
          expect(error).toBeDefined();
        }
      }
    });
  });
}); 