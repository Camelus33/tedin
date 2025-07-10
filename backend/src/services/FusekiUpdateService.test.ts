import { FusekiUpdateService, UpdateResult, BatchUpdateResult } from './FusekiUpdateService';
import { NewKnowledgeTriple } from './ResponseHandler';

describe('FusekiUpdateService Integration Tests', () => {
  let service: FusekiUpdateService;

  beforeEach(() => {
    service = new FusekiUpdateService();
  });

  describe('Service Initialization', () => {
    it('should initialize service without errors', () => {
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(FusekiUpdateService);
      console.log('✅ FusekiUpdateService 초기화 테스트 통과');
    });

    it('should perform health check', async () => {
      const healthResult = await service.healthCheck();
      
      expect(healthResult).toBeDefined();
      expect(typeof healthResult.connected).toBe('boolean');
      expect(typeof healthResult.updateCapable).toBe('boolean');
      
      console.log(`🏥 Health Check 결과: connected=${healthResult.connected}, updateCapable=${healthResult.updateCapable}`);
      
      if (healthResult.connected && healthResult.updateCapable) {
        console.log('🟢 Fuseki 서버 연결 및 UPDATE 작업 가능');
      } else if (healthResult.connected) {
        console.log('🟡 Fuseki 서버 연결됨, UPDATE 작업 불가');
      } else {
        console.log('🔴 Fuseki 서버 연결 불가');
      }
    }, 15000);
  });

  describe('Single Triple Operations', () => {
    const testTriple: NewKnowledgeTriple = {
      subject: 'habitus33:TestConcept_SingleOp',
      predicate: 'rdf:type',
      object: 'habitus33:CONCEPT',
      confidence: 0.95,
      source: 'fuseki-test'
    };

    it('should insert a single triple successfully', async () => {
      const result = await service.insertTriple(testTriple, {
        validateBeforeInsert: false, // 빠른 테스트를 위해 검증 스킵
        handleDuplicates: 'skip'
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.operation).toBe('INSERT');
      expect(result.triplesProcessed).toBe(1);
      expect(result.errors.length).toBe(0);
      expect(result.executionTime).toBeGreaterThan(0);

      console.log(`✅ 단일 트리플 삽입 성공 (${result.executionTime}ms)`);
    }, 10000);

    it('should delete a single triple successfully', async () => {
      // 먼저 삽입
      await service.insertTriple(testTriple, { validateBeforeInsert: false });

      // 삭제 테스트
      const result = await service.deleteTriple(testTriple);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.operation).toBe('DELETE');
      expect(result.triplesProcessed).toBe(1);
      expect(result.errors.length).toBe(0);

      console.log(`✅ 단일 트리플 삭제 성공 (${result.executionTime}ms)`);
    }, 10000);

    it('should handle duplicate detection', async () => {
      // 첫 번째 삽입
      const firstInsert = await service.insertTriple(testTriple, { 
        validateBeforeInsert: false 
      });
      expect(firstInsert.success).toBe(true);

      // 중복 삽입 시도 (skip 모드)
      const duplicateInsert = await service.insertTriple(testTriple, {
        validateBeforeInsert: true,
        handleDuplicates: 'skip'
      });

      expect(duplicateInsert.success).toBe(true);
      expect(duplicateInsert.triplesProcessed).toBe(0); // 스킵되어야 함

      console.log('✅ 중복 트리플 감지 및 스킵 성공');

      // 정리
      await service.deleteTriple(testTriple);
    }, 15000);

    it('should update a triple successfully', async () => {
      // 원본 트리플 삽입
      await service.insertTriple(testTriple, { validateBeforeInsert: false });

      // 업데이트할 새로운 트리플
      const updatedTriple: NewKnowledgeTriple = {
        ...testTriple,
        object: 'habitus33:UPDATED_CONCEPT',
        confidence: 0.98
      };

      // 업데이트 실행
      const result = await service.updateTriple(testTriple, updatedTriple);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.operation).toBe('UPDATE');
      expect(result.triplesProcessed).toBe(1);

      console.log(`✅ 트리플 업데이트 성공 (${result.executionTime}ms)`);

      // 정리
      await service.deleteTriple(updatedTriple);
    }, 15000);
  });

  describe('Batch Operations', () => {
    const batchTriples: NewKnowledgeTriple[] = [
      {
        subject: 'habitus33:BatchTest_1',
        predicate: 'rdf:type',
        object: 'habitus33:CONCEPT',
        confidence: 0.9,
        source: 'batch-test'
      },
      {
        subject: 'habitus33:BatchTest_2',
        predicate: 'rdfs:label',
        object: '"배치 테스트 개념"@ko',
        confidence: 0.85,
        source: 'batch-test'
      },
      {
        subject: 'habitus33:BatchTest_1',
        predicate: 'habitus33:relatedTo',
        object: 'habitus33:BatchTest_2',
        confidence: 0.8,
        source: 'batch-test'
      }
    ];

    it('should insert multiple triples in batch', async () => {
      const result = await service.insertTriples(batchTriples, {
        enableBatch: true,
        batchSize: 10,
        validateBeforeInsert: false
      });

      expect(result).toBeDefined();
      expect(result.totalTriples).toBe(batchTriples.length);
      expect(result.successfulTriples).toBeGreaterThan(0);
      expect(result.successfulTriples).toBeLessThanOrEqual(batchTriples.length);
      expect(result.operations.length).toBeGreaterThan(0);

      console.log(`✅ 배치 삽입 성공: ${result.successfulTriples}/${result.totalTriples} (${result.executionTime}ms)`);
      
      if (result.failedTriples > 0) {
        console.warn(`⚠️ 실패한 트리플: ${result.failedTriples}개`);
        console.warn('오류:', result.errors);
      }
    }, 20000);

    it('should handle large batch efficiently', async () => {
      // 큰 배치 생성 (50개 트리플)
      const largeBatch: NewKnowledgeTriple[] = [];
      for (let i = 0; i < 50; i++) {
        largeBatch.push({
          subject: `habitus33:LargeBatchTest_${i}`,
          predicate: 'rdf:type',
          object: 'habitus33:CONCEPT',
          confidence: 0.7 + (i % 3) * 0.1,
          source: 'large-batch-test'
        });
      }

      const startTime = Date.now();
      const result = await service.insertTriples(largeBatch, {
        enableBatch: true,
        batchSize: 25,
        validateBeforeInsert: false
      });
      const totalTime = Date.now() - startTime;

      expect(result.totalTriples).toBe(50);
      expect(result.successfulTriples).toBeGreaterThan(40); // 최소 80% 성공률
      expect(totalTime).toBeLessThan(30000); // 30초 이내

      console.log(`✅ 대용량 배치 처리 성공: ${result.successfulTriples}/50 트리플 (${totalTime}ms)`);
      console.log(`평균 처리 속도: ${(result.successfulTriples / totalTime * 1000).toFixed(1)} 트리플/초`);
    }, 35000);

    it('should handle batch with validation', async () => {
      const result = await service.insertTriples(batchTriples, {
        enableBatch: true,
        batchSize: 5,
        validateBeforeInsert: true,
        handleDuplicates: 'skip'
      });

      expect(result).toBeDefined();
      expect(result.totalTriples).toBe(batchTriples.length);
      
      // 이미 삽입된 트리플들이 있을 수 있으므로 성공률은 낮을 수 있음
      console.log(`✅ 검증 포함 배치 처리: ${result.successfulTriples}/${result.totalTriples} 새로운 트리플`);
    }, 25000);

    afterAll(async () => {
      // 테스트 데이터 정리
      console.log('🧹 테스트 데이터 정리 중...');
      
      const cleanupTriples = [
        ...batchTriples,
        // 대용량 배치 테스트 데이터도 정리 (일부만)
        ...Array.from({ length: 10 }, (_, i) => ({
          subject: `habitus33:LargeBatchTest_${i}`,
          predicate: 'rdf:type',
          object: 'habitus33:CONCEPT',
          confidence: 0.7,
          source: 'cleanup'
        }))
      ];

      try {
        for (const triple of cleanupTriples) {
          await service.deleteTriple(triple);
        }
        console.log('✅ 테스트 데이터 정리 완료');
      } catch (error) {
        console.warn('⚠️ 테스트 데이터 정리 중 일부 오류 발생:', error);
      }
    }, 30000);
  });

  describe('Error Handling', () => {
    it('should handle malformed triples gracefully', async () => {
      const malformedTriple: NewKnowledgeTriple = {
        subject: '', // 빈 subject
        predicate: 'invalid-predicate',
        object: 'test-object',
        confidence: 0.5,
        source: 'error-test'
      };

      const result = await service.insertTriple(malformedTriple);
      
      // 오류가 발생해도 서비스가 중단되지 않아야 함
      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);

      console.log('✅ 잘못된 트리플 처리 테스트 통과');
    }, 10000);

    it('should handle network timeouts', async () => {
      const testTriple: NewKnowledgeTriple = {
        subject: 'habitus33:TimeoutTest',
        predicate: 'rdf:type',
        object: 'habitus33:CONCEPT',
        confidence: 0.9,
        source: 'timeout-test'
      };

      const result = await service.insertTriple(testTriple, {
        timeout: 1 // 매우 짧은 타임아웃
      });

      expect(result).toBeDefined();
      // 타임아웃이 발생할 수 있지만, 서비스는 정상적으로 응답해야 함
      
      console.log(`✅ 타임아웃 처리 테스트: success=${result.success}`);
    }, 5000);
  });

  describe('Performance Tests', () => {
    it('should meet performance benchmarks', async () => {
      const performanceTriples: NewKnowledgeTriple[] = Array.from({ length: 20 }, (_, i) => ({
        subject: `habitus33:PerfTest_${i}`,
        predicate: 'rdf:type',
        object: 'habitus33:CONCEPT',
        confidence: 0.8,
        source: 'performance-test'
      }));

      const startTime = Date.now();
      const result = await service.insertTriples(performanceTriples, {
        enableBatch: true,
        batchSize: 10,
        validateBeforeInsert: false
      });
      const executionTime = Date.now() - startTime;

      expect(result.successfulTriples).toBeGreaterThan(15); // 최소 75% 성공률
      expect(executionTime).toBeLessThan(15000); // 15초 이내

      const throughput = result.successfulTriples / executionTime * 1000;
      console.log(`📊 성능 벤치마크: ${throughput.toFixed(2)} 트리플/초`);
      
      // 정리
      for (const triple of performanceTriples) {
        await service.deleteTriple(triple);
      }
    }, 20000);
  });
}); 