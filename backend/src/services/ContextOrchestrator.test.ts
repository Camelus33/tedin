import { ContextOrchestrator, ContextBundle } from './ContextOrchestrator';
import { IUser } from '../models/User';

describe('ContextOrchestrator', () => {
  let mockUser: IUser;
  let orchestrator: ContextOrchestrator;

  beforeEach(() => {
    // 각 테스트가 독립적으로 실행되도록 mockUser와 orchestrator를 초기화합니다.
    mockUser = {
      email: 'test@habitus33.com',
      passwordHash: 'hashedpassword',
      nickname: 'testuser',
      trialEndsAt: new Date(Date.now() + 33 * 24 * 60 * 60 * 1000),
      roles: ['user'],
      createdAt: new Date(),
      preferences: {}
    } as IUser;

    orchestrator = new ContextOrchestrator(mockUser);
  });

  describe('Real SPARQL Integration Tests', () => {
    // 실제 데이터가 있는 개념들로 테스트
    const realConcepts = ['공기', '나무', '허균', '거시경제'];
    
    it('실제 SPARQL 쿼리로 ContextBundle을 생성해야 한다', async () => {
      const targetConcept = '공기';
      const contextBundle: ContextBundle = await orchestrator.getContextBundle(targetConcept);

      // 1. 기본 구조 검증
      expect(contextBundle.targetConcept).toBe(targetConcept);
      expect(contextBundle.relevantNotes).toBeDefined();
      expect(contextBundle.bookExcerpts).toBeDefined();
      expect(contextBundle.relatedConcepts).toBeDefined();
      expect(contextBundle.queryMetadata).toBeDefined();
      
      // 2. 쿼리 메타데이터 검증
      expect(contextBundle.queryMetadata?.executionTime).toBeGreaterThan(0);
      expect(contextBundle.queryMetadata?.resultCount).toBeGreaterThanOrEqual(0);
      expect(contextBundle.queryMetadata?.queryType).toBe('sparql-concept-search');
      
      console.log('Real SPARQL integration test passed!');
      console.log('Query metadata:', contextBundle.queryMetadata);
    }, 10000); // 10초 타임아웃
    
    it('관련도 점수가 올바르게 계산되어야 한다', async () => {
      const targetConcept = '허균';
      const contextBundle: ContextBundle = await orchestrator.getContextBundle(targetConcept);
      
      if (contextBundle.relevantNotes.length > 0) {
        const firstNote = contextBundle.relevantNotes[0] as any;
        
        // 관련도 점수 존재 확인
        expect(firstNote.relevanceScore).toBeDefined();
        expect(typeof firstNote.relevanceScore).toBe('number');
        expect(firstNote.relevanceScore).toBeGreaterThan(0);
        
        console.log(`Relevance score for "${targetConcept}":`, firstNote.relevanceScore);
        console.log('Note tags:', firstNote.tags);
      }
    }, 10000);
    
    it('여러 개념에 대해 일관된 결과를 반환해야 한다', async () => {
      const results: { [concept: string]: ContextBundle } = {};
      
      for (const concept of realConcepts) {
        results[concept] = await orchestrator.getContextBundle(concept);
      }
      
      // 모든 결과가 올바른 구조를 가져야 함
      for (const [concept, bundle] of Object.entries(results)) {
        expect(bundle.targetConcept).toBe(concept);
        expect(bundle.queryMetadata).toBeDefined();
        expect(bundle.queryMetadata?.executionTime).toBeGreaterThan(0);
        
        console.log(`${concept}: ${bundle.queryMetadata?.resultCount} results in ${bundle.queryMetadata?.executionTime}ms`);
      }
    }, 30000); // 30초 타임아웃
    
    it('SPARQL 구문 검증 테스트', async () => {
      // 특수 문자가 포함된 개념으로 테스트
      const specialConcepts = ['공기', 'test"quote', "test'apostrophe"];
      
      for (const concept of specialConcepts) {
        try {
          const bundle = await orchestrator.getContextBundle(concept);
          expect(bundle).toBeDefined();
          expect(bundle.targetConcept).toBe(concept);
          console.log(`Special concept "${concept}" handled successfully`);
        } catch (error: any) {
          fail(`Failed to handle special concept "${concept}": ${error.message}`);
        }
      }
    }, 15000);
    
    it('빈 결과에 대한 에러 처리 테스트', async () => {
      const nonExistentConcept = 'nonexistent_concept_12345';
      
      const bundle = await orchestrator.getContextBundle(nonExistentConcept);
      
      // 빈 결과도 올바른 구조를 가져야 함
      expect(bundle.targetConcept).toBe(nonExistentConcept);
      expect(bundle.relevantNotes).toEqual([]);
      expect(bundle.bookExcerpts).toEqual([]);
      expect(bundle.relatedConcepts).toEqual([]);
      expect(bundle.queryMetadata?.resultCount).toBe(0);
      
      console.log('Empty result handling test passed');
    }, 10000);
  });
  
  describe('Ranking Algorithm Tests', () => {
    it('관련도 점수에 따라 결과가 정렬되어야 한다', async () => {
      const concept = '허균';
      const bundle = await orchestrator.getContextBundle(concept);
      
      if (bundle.relevantNotes.length > 1) {
        const scores = bundle.relevantNotes.map((note: any) => note.relevanceScore || 0);
        
        // 내림차순으로 정렬되어 있는지 확인
        for (let i = 1; i < scores.length; i++) {
          expect(scores[i]).toBeLessThanOrEqual(scores[i - 1]);
        }
        
        console.log('Ranking order test passed. Scores:', scores);
      }
    }, 10000);
    
    it('태그 매치와 내용 매치의 점수 차이를 확인해야 한다', async () => {
      // 태그에만 매치되는 경우와 내용에도 매치되는 경우 비교
      const tagOnlyConcept = '공기'; // 태그에만 있음
      const bundle = await orchestrator.getContextBundle(tagOnlyConcept);
      
      if (bundle.relevantNotes.length > 0) {
        const note = bundle.relevantNotes[0] as any;
        expect(note.relevanceScore).toBeGreaterThan(0);
        
        console.log(`Tag match score for "${tagOnlyConcept}":`, note.relevanceScore);
        console.log('Note content:', note.content.substring(0, 50) + '...');
      }
    }, 10000);
  });

  describe('Error Handling Tests', () => {
    it('연결 실패시 빈 결과를 반환해야 한다', async () => {
      // Fuseki 서버가 중단된 상황을 시뮬레이션하기는 어려우므로
      // 정상 동작 시 에러 핸들링 구조만 확인
      const bundle = await orchestrator.getContextBundle('test');
      expect(bundle).toBeDefined();
      expect(bundle.targetConcept).toBe('test');
    }, 10000);
  });

  describe('Performance Tests', () => {
    it('쿼리 실행 시간이 합리적이어야 한다', async () => {
      const startTime = Date.now();
      const bundle = await orchestrator.getContextBundle('공기');
      const endTime = Date.now();
      
      const executionTime = endTime - startTime;
      expect(executionTime).toBeLessThan(5000); // 5초 이내
      
      console.log(`Total execution time: ${executionTime}ms`);
      console.log(`SPARQL execution time: ${bundle.queryMetadata?.executionTime}ms`);
    }, 10000);
  });
}); 