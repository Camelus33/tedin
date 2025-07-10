import { FusekiUpdateService } from '../src/services/FusekiUpdateService';
import { NewKnowledgeTriple } from '../src/services/ResponseHandler';

/**
 * Fuseki 통합 테스트 스크립트
 * Jest 환경에서 sparql-http-client 호환성 문제가 있어서 별도 스크립트로 테스트
 */
async function testFusekiIntegration() {
  console.log('🚀 Fuseki 통합 테스트 시작...\n');

  try {
    const service = new FusekiUpdateService();

    // 1. Health Check
    console.log('1️⃣ Health Check 수행...');
    const health = await service.healthCheck();
    console.log(`   연결 상태: ${health.connected ? '✅ 연결됨' : '❌ 연결 실패'}`);
    console.log(`   UPDATE 가능: ${health.updateCapable ? '✅ 가능' : '❌ 불가능'}`);
    console.log(`   응답 시간: ${health.responseTime}ms`);
    
    if (health.error) {
      console.log(`   오류: ${health.error}`);
    }
    console.log();

    if (!health.connected) {
      console.log('❌ Fuseki 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인하세요.');
      return;
    }

    // 2. 단일 트리플 삽입 테스트
    console.log('2️⃣ 단일 트리플 삽입 테스트...');
    const testTriple: NewKnowledgeTriple = {
      subject: 'habitus33:TestConcept_Integration',
      predicate: 'rdf:type',
      object: 'habitus33:CONCEPT',
      confidence: 0.95,
      source: 'integration-test'
    };

    const insertResult = await service.insertTriple(testTriple, {
      validateBeforeInsert: false,
      handleDuplicates: 'skip'
    });

    console.log(`   삽입 결과: ${insertResult.success ? '✅ 성공' : '❌ 실패'}`);
    console.log(`   처리된 트리플: ${insertResult.triplesProcessed}개`);
    console.log(`   실행 시간: ${insertResult.executionTime}ms`);
    
    if (insertResult.errors.length > 0) {
      console.log(`   오류: ${insertResult.errors.join(', ')}`);
    }
    console.log();

    // 3. 배치 트리플 삽입 테스트
    console.log('3️⃣ 배치 트리플 삽입 테스트...');
    const batchTriples: NewKnowledgeTriple[] = [
      {
        subject: 'habitus33:BatchTest_A',
        predicate: 'rdf:type',
        object: 'habitus33:CONCEPT',
        confidence: 0.9,
        source: 'batch-integration-test'
      },
      {
        subject: 'habitus33:BatchTest_B',
        predicate: 'rdfs:label',
        object: '"배치 테스트 개념"@ko',
        confidence: 0.85,
        source: 'batch-integration-test'
      },
      {
        subject: 'habitus33:BatchTest_A',
        predicate: 'habitus33:relatedTo',
        object: 'habitus33:BatchTest_B',
        confidence: 0.8,
        source: 'batch-integration-test'
      }
    ];

    const batchResult = await service.insertTriples(batchTriples, {
      enableBatch: true,
      batchSize: 10,
      validateBeforeInsert: false
    });

    console.log(`   배치 결과: ${batchResult.successfulTriples}/${batchResult.totalTriples} 성공`);
    console.log(`   실행 시간: ${batchResult.executionTime}ms`);
    console.log(`   평균 속도: ${(batchResult.successfulTriples / batchResult.executionTime * 1000).toFixed(1)} 트리플/초`);
    
    if (batchResult.errors.length > 0) {
      console.log(`   오류 개수: ${batchResult.errors.length}개`);
      batchResult.errors.forEach((error, index) => {
        console.log(`     ${index + 1}. ${error}`);
      });
    }
    console.log();

    // 4. 중복 처리 테스트
    console.log('4️⃣ 중복 처리 테스트...');
    const duplicateResult = await service.insertTriple(testTriple, {
      validateBeforeInsert: true,
      handleDuplicates: 'skip'
    });

    console.log(`   중복 처리 결과: ${duplicateResult.success ? '✅ 성공' : '❌ 실패'}`);
    console.log(`   처리된 트리플: ${duplicateResult.triplesProcessed}개 (스킵된 경우 0개여야 함)`);
    console.log(`   실행 시간: ${duplicateResult.executionTime}ms`);
    console.log();

    // 5. 정리 (삭제) 테스트
    console.log('5️⃣ 정리 작업 (트리플 삭제)...');
    
    // 단일 트리플 삭제
    const deleteResult = await service.deleteTriple(testTriple);
    console.log(`   단일 삭제: ${deleteResult.success ? '✅ 성공' : '❌ 실패'} (${deleteResult.executionTime}ms)`);

    // 배치 트리플 삭제
    for (const triple of batchTriples) {
      const result = await service.deleteTriple(triple);
      console.log(`   배치 삭제 ${triple.subject}: ${result.success ? '✅' : '❌'}`);
    }

    console.log('\n🎉 Fuseki 통합 테스트 완료!');
    
  } catch (error) {
    console.error('❌ 통합 테스트 중 오류 발생:', error);
    throw error;
  }
}

// 스크립트가 직접 실행된 경우에만 테스트 실행
if (require.main === module) {
  testFusekiIntegration()
    .then(() => {
      console.log('\n✅ 모든 테스트 완료');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ 테스트 실패:', error);
      process.exit(1);
    });
}

export { testFusekiIntegration }; 