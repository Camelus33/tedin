/**
 * FusekiUpdateService 기본 기능 데모
 * 
 * 이 파일은 Fuseki 서버와의 연결 및 기본 SPARQL UPDATE 작업을 테스트합니다.
 * 실제 Fuseki 서버가 실행 중일 때만 정상 동작합니다.
 */

import { FusekiUpdateService } from './FusekiUpdateService';
import { NewKnowledgeTriple } from './ResponseHandler';

async function runFusekiUpdateDemo() {
  console.log('🚀 FusekiUpdateService 데모 시작...\n');

  const service = new FusekiUpdateService();

  try {
    // 1. 헬스 체크
    console.log('1️⃣ Fuseki 서버 연결 상태 확인...');
    const healthResult = await service.healthCheck();
    
    console.log(`   연결 상태: ${healthResult.connected ? '✅ 연결됨' : '❌ 연결 실패'}`);
    console.log(`   UPDATE 가능: ${healthResult.updateCapable ? '✅ 가능' : '❌ 불가능'}`);
    console.log(`   응답 시간: ${healthResult.responseTime}ms`);
    
    if (healthResult.error) {
      console.log(`   오류: ${healthResult.error}`);
    }

    if (!healthResult.connected) {
      console.log('\n❌ Fuseki 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인하세요.');
      console.log('   포트 3030에서 Fuseki가 실행되어야 합니다.');
      return;
    }

    // 2. 단일 트리플 삽입 테스트
    console.log('\n2️⃣ 단일 트리플 삽입 테스트...');
    
    const testTriple: NewKnowledgeTriple = {
      subject: 'habitus33:DemoTest_SingleTriple',
      predicate: 'rdf:type',
      object: 'habitus33:CONCEPT',
      confidence: 0.95,
      source: 'fuseki-demo'
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

    // 3. 배치 삽입 테스트
    console.log('\n3️⃣ 배치 트리플 삽입 테스트...');
    
    const batchTriples: NewKnowledgeTriple[] = [
      {
        subject: 'habitus33:DemoTest_BatchTriple1',
        predicate: 'rdf:type',
        object: 'habitus33:CONCEPT',
        confidence: 0.9,
        source: 'fuseki-demo'
      },
      {
        subject: 'habitus33:DemoTest_BatchTriple2',
        predicate: 'rdfs:label',
        object: '"배치 테스트 개념"@ko',
        confidence: 0.85,
        source: 'fuseki-demo'
      },
      {
        subject: 'habitus33:DemoTest_BatchTriple1',
        predicate: 'habitus33:relatedTo',
        object: 'habitus33:DemoTest_BatchTriple2',
        confidence: 0.8,
        source: 'fuseki-demo'
      }
    ];

    const batchResult = await service.insertTriples(batchTriples, {
      enableBatch: true,
      batchSize: 10,
      validateBeforeInsert: false
    });

    console.log(`   배치 결과: ${batchResult.successfulTriples}/${batchResult.totalTriples} 성공`);
    console.log(`   실패한 트리플: ${batchResult.failedTriples}개`);
    console.log(`   실행 시간: ${batchResult.executionTime}ms`);
    
    if (batchResult.errors.length > 0) {
      console.log(`   오류: ${batchResult.errors.slice(0, 3).join(', ')}${batchResult.errors.length > 3 ? '...' : ''}`);
    }

    // 4. 트리플 삭제 테스트 (정리)
    console.log('\n4️⃣ 테스트 데이터 정리...');
    
    const cleanupTriples = [testTriple, ...batchTriples];
    let cleanupSuccess = 0;
    
    for (const triple of cleanupTriples) {
      try {
        const deleteResult = await service.deleteTriple(triple);
        if (deleteResult.success) {
          cleanupSuccess++;
        }
      } catch (error) {
        // 정리 중 오류는 무시 (이미 삭제되었을 수 있음)
      }
    }

    console.log(`   정리 완료: ${cleanupSuccess}/${cleanupTriples.length}개 트리플 삭제`);

    // 5. 성능 요약
    console.log('\n📊 성능 요약:');
    console.log(`   단일 트리플 처리 시간: ${insertResult.executionTime}ms`);
    console.log(`   배치 처리 시간: ${batchResult.executionTime}ms`);
    
    if (batchResult.successfulTriples > 0 && batchResult.executionTime > 0) {
      const throughput = batchResult.successfulTriples / batchResult.executionTime * 1000;
      console.log(`   처리량: ${throughput.toFixed(2)} 트리플/초`);
    }

    console.log('\n✅ FusekiUpdateService 데모 완료!');

  } catch (error) {
    console.error('\n❌ 데모 실행 중 오류 발생:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        console.log('\n💡 해결 방법:');
        console.log('   1. Fuseki 서버가 실행 중인지 확인하세요');
        console.log('   2. 포트 3030이 열려있는지 확인하세요');
        console.log('   3. 네트워크 연결을 확인하세요');
      }
    }
  }
}

// 직접 실행될 때만 데모 실행
if (require.main === module) {
  runFusekiUpdateDemo()
    .then(() => {
      console.log('\n🎯 데모 종료');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 데모 실행 실패:', error);
      process.exit(1);
    });
}

export { runFusekiUpdateDemo }; 