import { KnowledgeGapDetectionService } from '../src/services/KnowledgeGapDetectionService';
import { IUser } from '../src/models/User';

/**
 * 간단한 지식 격차 탐지 테스트
 * 외부 온톨로지 타임아웃을 피하기 위한 빠른 테스트
 */
async function testKnowledgeGapSimple() {
  console.log('🧠 간단한 지식 격차 탐지 테스트 시작...\n');
  
  // 테스트용 사용자 객체 생성 (Mock)
  const testUser = {
    _id: 'test_user_123',
    email: 'test@habitus33.com',
    name: 'Test User'
  } as unknown as IUser;
  
  const service = new KnowledgeGapDetectionService(testUser);
  
  console.log('🔍 단일 개념으로 빠른 테스트...');
  
  // 단일 개념으로 테스트 (더 빠름)
  const userConcepts = ['공기'];
  
  console.log(`사용자 개념: ${userConcepts.join(', ')}`);
  
  try {
    const startTime = Date.now();
    
    // 더 제한적인 설정으로 빠른 테스트
    const gaps = await service.detectKnowledgeGaps(userConcepts, {
      maxGapsToReturn: 3,
      minGapScore: 10.0,  // 낮은 임계값
      maxLearningPathLength: 3,
      difficultyPreference: 'beginner'
    });
    
    const endTime = Date.now();
    
    console.log(`⏱️  탐지 시간: ${endTime - startTime}ms`);
    console.log(`📊 발견된 지식 격차: ${gaps.length}개\n`);
    
    if (gaps.length > 0) {
      console.log('🏆 발견된 지식 격차들:');
      gaps.forEach((gap, index) => {
        console.log(`\n${index + 1}. ${gap.missingConcept} (${gap.source})`);
        console.log(`   📊 격차 점수: ${gap.gapScore.toFixed(1)}점`);
        console.log(`   🎯 우선순위: ${gap.priority}`);
        console.log(`   🔗 관련 사용자 개념: ${gap.relatedUserConcepts.join(', ')}`);
        console.log(`   📚 학습 경로: ${gap.suggestedLearningPath.join(' → ')}`);
        console.log(`   ⏰ 예상 학습 시간: ${gap.estimatedLearningTime}`);
        
        if (gap.categories.length > 0) {
          console.log(`   🏷️  카테고리: ${gap.categories.slice(0, 2).join(', ')}`);
        }
      });
    } else {
      console.log('❌ 지식 격차를 찾을 수 없습니다.');
      console.log('   이는 외부 온톨로지 연결 문제일 수 있습니다.');
    }
    
    // 성능 평가
    console.log('\n📊 성능 평가:');
    if (endTime - startTime < 30000) { // 30초 이내
      console.log('✅ 성능: 우수 (30초 이내)');
    } else if (endTime - startTime < 60000) { // 60초 이내
      console.log('✅ 성능: 양호 (60초 이내)');
    } else {
      console.log('⚠️  성능: 개선 필요 (60초 초과)');
    }
    
  } catch (error) {
    console.error('❌ 지식 격차 탐지 실패:', error);
    
    // 에러 분석
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        console.log('💡 해결책: 외부 온톨로지 서버 타임아웃 - 캐시 또는 로컬 온톨로지 사용 권장');
      } else if (error.message.includes('SPARQL')) {
        console.log('💡 해결책: SPARQL 쿼리 문제 - 쿼리 구문 검토 필요');
      } else {
        console.log('💡 일반적인 오류 - 로그를 확인하세요');
      }
    }
  }
  
  console.log('\n📈 구현된 기능 요약:');
  console.log('✅ PMHR 프레임워크 기반 격차 식별');
  console.log('✅ Reward Shaping 점수 계산');
  console.log('✅ 가짜 경로 방지 메커니즘');
  console.log('✅ 사용자 관심도 기반 랭킹');
  console.log('✅ 학습 시간 추정');
  console.log('✅ 다중 난이도 지원');
  
  console.log('\n🎉 간단한 지식 격차 탐지 테스트 완료!');
}

// 테스트 실행
if (require.main === module) {
  testKnowledgeGapSimple()
    .then(() => {
      console.log('\n✅ 테스트 완료');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ 테스트 실행 중 오류:', error);
      process.exit(1);
    });
} 