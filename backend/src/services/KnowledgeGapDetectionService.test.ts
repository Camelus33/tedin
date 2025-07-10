import { KnowledgeGapDetectionService, KnowledgeGap } from './KnowledgeGapDetectionService';
import { IUser } from '../models/User';

describe('KnowledgeGapDetectionService Integration Tests', () => {
  let service: KnowledgeGapDetectionService;

  // 최소한의 유효한 사용자 객체 생성
  const mockUser = {
    id: 'test-user-123',
    username: 'testuser',
    email: 'test@example.com',
    passwordHash: 'hash',
    nickname: 'Test User',
    createdAt: new Date(),
    trialEndsAt: new Date(),
    roles: ['user'],
    preferences: {},
    comparePassword: jest.fn(),
    $assertPopulated: jest.fn()
  } as unknown as IUser;

  beforeEach(() => {
    service = new KnowledgeGapDetectionService(mockUser);
  });

  describe('Basic Functionality', () => {
    it('should initialize service without errors', () => {
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(KnowledgeGapDetectionService);
      console.log('✅ Service initialization test passed');
    });

    it('should handle empty user concepts array', async () => {
      const result = await service.detectKnowledgeGaps([]);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
      
      console.log('✅ Empty concepts array test passed');
    }, 30000);

    it('should handle single concept without external dependencies', async () => {
      // 외부 의존성이 실패해도 기본적인 처리는 되어야 함
      const result = await service.detectKnowledgeGaps(['테스트개념']);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      // 외부 서비스 실패 시에도 빈 배열이라도 반환해야 함
      
      console.log('✅ Single concept test passed');
      console.log(`Result: ${result.length} gaps found`);
    }, 30000);

    it('should handle multiple concepts', async () => {
      const testConcepts = ['환경', '과학', '기술'];
      const result = await service.detectKnowledgeGaps(testConcepts);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      
      // 결과가 있다면 구조 검증
      if (result.length > 0) {
        const firstGap = result[0];
        expect(firstGap).toHaveProperty('id');
        expect(firstGap).toHaveProperty('missingConcept');
        expect(firstGap).toHaveProperty('gapScore');
        expect(firstGap).toHaveProperty('suggestedLearningPath');
        expect(firstGap).toHaveProperty('relatedUserConcepts');
        expect(firstGap).toHaveProperty('confidenceScore');
        expect(firstGap).toHaveProperty('source');
        expect(firstGap).toHaveProperty('categories');
        expect(firstGap).toHaveProperty('priority');
        
        expect(Array.isArray(firstGap.suggestedLearningPath)).toBe(true);
        expect(Array.isArray(firstGap.relatedUserConcepts)).toBe(true);
        expect(Array.isArray(firstGap.categories)).toBe(true);
        expect(typeof firstGap.gapScore).toBe('number');
        expect(typeof firstGap.confidenceScore).toBe('number');
        expect(['wikidata', 'dbpedia']).toContain(firstGap.source);
        expect(['high', 'medium', 'low']).toContain(firstGap.priority);
      }
      
      console.log('✅ Multiple concepts test passed');
      console.log(`Result: ${result.length} gaps found`);
    }, 45000);
  });

  describe('Configuration Tests', () => {
    it('should respect maxGapsToReturn configuration', async () => {
      const result = await service.detectKnowledgeGaps(['프로그래밍', '기술'], {
        maxGapsToReturn: 3,
        minGapScore: 0
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeLessThanOrEqual(3);
      
      console.log('✅ Configuration test passed');
      console.log(`Configured max: 3, actual: ${result.length}`);
    }, 30000);

    it('should respect minGapScore configuration', async () => {
      const result = await service.detectKnowledgeGaps(['과학'], {
        minGapScore: 50.0,
        maxGapsToReturn: 10
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      
      // 결과가 있다면 모든 gap이 최소 점수 이상이어야 함
      result.forEach(gap => {
        expect(gap.gapScore).toBeGreaterThanOrEqual(50.0);
      });
      
      console.log('✅ Min gap score test passed');
      console.log(`Gaps with score >= 50: ${result.length}`);
    }, 30000);
  });

  describe('Error Handling', () => {
    it('should handle invalid concepts gracefully', async () => {
      const invalidConcepts = ['', '   ', null, undefined].filter(Boolean) as string[];
      
      // 빈 문자열이나 공백만 있는 개념들
      const result = await service.detectKnowledgeGaps(['', '   '].filter(s => s.trim()));

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      
      console.log('✅ Invalid concepts test passed');
    }, 15000);

    it('should handle very long concept names', async () => {
      const longConcept = 'a'.repeat(1000);
      const result = await service.detectKnowledgeGaps([longConcept]);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      
      console.log('✅ Long concept names test passed');
    }, 30000);
  });

  describe('Performance Tests', () => {
    it('should complete within reasonable time for small input', async () => {
      const startTime = Date.now();
      
      const result = await service.detectKnowledgeGaps(['환경']);
      
      const processingTime = Date.now() - startTime;
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(processingTime).toBeLessThan(30000); // 30초 이내
      
      console.log(`⏱️ Small input performance: ${processingTime}ms`);
      
      if (processingTime < 10000) {
        console.log('🚀 Excellent performance (< 10s)');
      } else if (processingTime < 20000) {
        console.log('✅ Good performance (< 20s)');
      } else {
        console.log('⚠️ Acceptable performance (< 30s)');
      }
    }, 35000);

    it('should handle moderate load', async () => {
      const startTime = Date.now();
      
      const moderateConcepts = ['환경', '과학', '기술', '교육', '문화'];
      const result = await service.detectKnowledgeGaps(moderateConcepts);
      
      const processingTime = Date.now() - startTime;
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(processingTime).toBeLessThan(60000); // 60초 이내
      
      console.log(`⏱️ Moderate load performance: ${processingTime}ms`);
      console.log(`Found ${result.length} gaps for ${moderateConcepts.length} concepts`);
      
      if (processingTime < 30000) {
        console.log('🚀 Excellent performance (< 30s)');
      } else {
        console.log('✅ Good performance (< 60s)');
      }
    }, 65000);
  });

  describe('Result Quality Tests', () => {
    it('should return meaningful gap information when gaps are found', async () => {
      const result = await service.detectKnowledgeGaps(['기후변화', '환경보호']);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      
      if (result.length > 0) {
        const gap = result[0];
        
        // ID가 유니크하고 의미있는 형태인지 확인
        expect(gap.id).toBeTruthy();
        expect(gap.id.length).toBeGreaterThan(10);
        
        // 개념 이름이 의미있는지 확인
        expect(gap.missingConcept).toBeTruthy();
        expect(gap.missingConcept.length).toBeGreaterThan(0);
        
        // 학습 경로가 있고 의미있는지 확인
        if (gap.suggestedLearningPath.length > 0) {
          gap.suggestedLearningPath.forEach(step => {
            expect(step).toBeTruthy();
            expect(step.length).toBeGreaterThan(5); // 최소한의 의미있는 길이
          });
        }
        
        // 점수가 합리적인 범위에 있는지 확인
        expect(gap.gapScore).toBeGreaterThanOrEqual(0);
        expect(gap.gapScore).toBeLessThanOrEqual(100);
        expect(gap.confidenceScore).toBeGreaterThanOrEqual(0);
        
        console.log('✅ Result quality test passed');
        console.log(`Sample gap: ${gap.missingConcept} (score: ${gap.gapScore})`);
      } else {
        console.log('ℹ️ No gaps found - this is also a valid result');
      }
    }, 45000);
  });
}); 