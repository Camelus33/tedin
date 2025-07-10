import { ContextOrchestrator } from '../src/services/ContextOrchestrator';
import { KnowledgeGapDetectionService } from '../src/services/KnowledgeGapDetectionService';
import { HiddenLinkDetectionService } from '../src/services/HiddenLinkDetectionService';
import { UnifiedScoringService } from '../src/services/UnifiedScoringService';
import { ExternalOntologyService } from '../src/services/ExternalOntologyService';

// Mock User 객체
const mockUser = {
  _id: 'integration-test-user',
  email: 'integration@test.com',
  username: 'integration-tester',
  nickname: 'integration-tester',
  passwordHash: 'hashed-password',
  roles: ['user'],
  trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  createdAt: new Date(),
  updatedAt: new Date()
} as any;

// 통합 테스트 메트릭
interface IntegrationTestMetrics {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  averageResponseTime: number;
  performanceMetrics: {
    contextBundleTime: number;
    knowledgeGapTime: number;
    hiddenLinkTime: number;
    unifiedScoringTime: number;
  };
  accuracyMetrics: {
    relevantResults: number;
    totalResults: number;
    precisionScore: number;
  };
  dataQualityMetrics: {
    booksProcessed: number;
    notesProcessed: number;
    conceptsExtracted: number;
    connectionsFound: number;
  };
}

// 실제 테스트 시나리오 (실제 데이터 기반)
const realDataTestScenarios = [
  {
    name: '기술 관련 지식 격차 탐지',
    concepts: ['기술', '인공지능', '디지털'],
    expectedMinResults: 3,
    description: '기술 관련 책과 노트에서 지식 격차 탐지'
  },
  {
    name: '환경 관련 숨겨진 연결 발견',
    concepts: ['환경', '지속가능성', '기후'],
    expectedMinResults: 2,
    description: '환경 관련 개념들 간의 숨겨진 연결 탐지'
  },
  {
    name: '철학과 윤리의 연결 탐지',
    concepts: ['철학', '윤리', '도덕'],
    expectedMinResults: 2,
    description: '철학적 개념들과 윤리적 가치의 연결 분석'
  },
  {
    name: '경제와 사회의 상호작용',
    concepts: ['경제', '사회', '정치'],
    expectedMinResults: 1,
    description: '경제와 사회 개념의 상호작용 분석'
  },
  {
    name: '교육과 학습의 혁신',
    concepts: ['교육', '학습', '혁신'],
    expectedMinResults: 2,
    description: '교육 혁신과 학습 방법론의 연결 탐지'
  }
];

// 성능 측정 함수
function measureTime<T>(fn: () => Promise<T>): Promise<{ result: T; time: number }> {
  return new Promise(async (resolve) => {
    const start = Date.now();
    try {
      const result = await fn();
      const time = Date.now() - start;
      resolve({ result, time });
    } catch (error) {
      const time = Date.now() - start;
      throw { error, time };
    }
  });
}

// 정확도 평가 함수
function evaluateAccuracy(results: any[], expectedConcepts: string[]): number {
  if (!results || results.length === 0) return 0;
  
  let relevantCount = 0;
  const conceptsLower = expectedConcepts.map(c => c.toLowerCase());
  
  for (const result of results) {
    const resultText = (result.description || result.title || '').toLowerCase();
    const hasRelevantConcept = conceptsLower.some(concept => 
      resultText.includes(concept)
    );
    if (hasRelevantConcept) relevantCount++;
  }
  
  return relevantCount / results.length;
}

// 메인 통합 테스트 함수
async function runIntegrationTests(): Promise<IntegrationTestMetrics> {
  console.log('🚀 Habitus33 Knowledge Graph Integration Test 시작\n');
  console.log('=' .repeat(80));
  
  const metrics: IntegrationTestMetrics = {
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    averageResponseTime: 0,
    performanceMetrics: {
      contextBundleTime: 0,
      knowledgeGapTime: 0,
      hiddenLinkTime: 0,
      unifiedScoringTime: 0
    },
    accuracyMetrics: {
      relevantResults: 0,
      totalResults: 0,
      precisionScore: 0
    },
    dataQualityMetrics: {
      booksProcessed: 0,
      notesProcessed: 0,
      conceptsExtracted: 0,
      connectionsFound: 0
    }
  };

  // 서비스 초기화
  const knowledgeGapService = new KnowledgeGapDetectionService(mockUser);
  const hiddenLinkService = new HiddenLinkDetectionService(mockUser);
  const unifiedScoringService = new UnifiedScoringService(mockUser);
  const contextOrchestrator = new ContextOrchestrator(mockUser);

  let totalResponseTime = 0;
  let totalAccuracy = 0;

  console.log('\n📊 1. 기본 시스템 상태 확인');
  console.log('-'.repeat(50));

  try {
    // 데이터 카운트 확인
    const { result: contextBundle, time: contextTime } = await measureTime(() =>
      contextOrchestrator.getContextBundle('전체')
    );
    
    metrics.performanceMetrics.contextBundleTime = contextTime;
    metrics.dataQualityMetrics.booksProcessed = contextBundle.bookExcerpts?.length || 0;
    metrics.dataQualityMetrics.notesProcessed = contextBundle.relevantNotes?.length || 0;
    
    console.log(`✅ Context Bundle 생성: ${contextTime}ms`);
    console.log(`📚 처리된 책: ${metrics.dataQualityMetrics.booksProcessed}권`);
    console.log(`📝 처리된 노트: ${metrics.dataQualityMetrics.notesProcessed}개`);
    
    metrics.passedTests++;
  } catch (error) {
    console.log(`❌ Context Bundle 생성 실패:`, error);
    metrics.failedTests++;
  }
  metrics.totalTests++;

  console.log('\n🔍 2. 실제 데이터 시나리오 테스트');
  console.log('-'.repeat(50));

  for (const scenario of realDataTestScenarios) {
    console.log(`\n📋 시나리오: ${scenario.name}`);
    console.log(`🎯 개념: [${scenario.concepts.join(', ')}]`);
    
    try {
      // 지식 격차 탐지 테스트
      const { result: knowledgeGaps, time: gapTime } = await measureTime(() =>
        knowledgeGapService.detectKnowledgeGaps(scenario.concepts)
      );
      
      metrics.performanceMetrics.knowledgeGapTime += gapTime;
      totalResponseTime += gapTime;
      
      console.log(`  🔍 지식 격차 탐지: ${gapTime}ms, ${knowledgeGaps.length}개 발견`);
      
      // 숨겨진 연결 탐지 테스트
      const { result: hiddenLinks, time: linkTime } = await measureTime(() =>
        hiddenLinkService.detectHiddenLinks(scenario.concepts)
      );
      
      metrics.performanceMetrics.hiddenLinkTime += linkTime;
      totalResponseTime += linkTime;
      
      console.log(`  🔗 숨겨진 연결 탐지: ${linkTime}ms, ${hiddenLinks.length}개 발견`);
      
      // 통합 점수 계산 테스트
      const userProfile = {
        interests: scenario.concepts,
        currentLevel: 'intermediate' as const,
        learningGoals: [`${scenario.concepts[0]} 이해 향상`],
        pastLearningHistory: ['기초 지식'],
        preferredDifficulty: 'moderate' as const,
        availableTimePerSession: 30,
        focusAreas: scenario.concepts
      };
      
      const { result: unifiedResults, time: scoringTime } = await measureTime(() =>
        unifiedScoringService.generateUnifiedRanking(scenario.concepts, userProfile)
      );
      
      metrics.performanceMetrics.unifiedScoringTime += scoringTime;
      totalResponseTime += scoringTime;
      
      console.log(`  📊 통합 점수 계산: ${scoringTime}ms, ${unifiedResults.length}개 결과`);
      
      // 정확도 평가
      const accuracy = evaluateAccuracy(unifiedResults, scenario.concepts);
      totalAccuracy += accuracy;
      
      metrics.accuracyMetrics.totalResults += unifiedResults.length;
      metrics.accuracyMetrics.relevantResults += Math.round(unifiedResults.length * accuracy);
      
      console.log(`  🎯 정확도: ${(accuracy * 100).toFixed(1)}%`);
      
      // 결과 품질 검증
      const totalResults = knowledgeGaps.length + hiddenLinks.length;
      if (totalResults >= scenario.expectedMinResults) {
        console.log(`  ✅ 최소 결과 기준 충족 (${totalResults} >= ${scenario.expectedMinResults})`);
        metrics.passedTests++;
      } else {
        console.log(`  ⚠️  최소 결과 기준 미달 (${totalResults} < ${scenario.expectedMinResults})`);
        metrics.failedTests++;
      }
      
      metrics.dataQualityMetrics.conceptsExtracted += scenario.concepts.length;
      metrics.dataQualityMetrics.connectionsFound += hiddenLinks.length;
      
    } catch (error) {
      console.log(`  ❌ 시나리오 실행 실패:`, error);
      metrics.failedTests++;
    }
    
    metrics.totalTests++;
  }

  console.log('\n⚡ 3. 성능 벤치마크 테스트');
  console.log('-'.repeat(50));

  // 대용량 개념 테스트
  const largeConcepts = ['기술', '환경', '철학', '경제', '교육', '사회', '과학', '문화'];
  
  try {
    const { result: largeTestResult, time: largeTestTime } = await measureTime(() =>
      unifiedScoringService.generateUnifiedRanking(largeConcepts, {
        interests: largeConcepts,
        currentLevel: 'advanced',
        learningGoals: ['종합적 이해'],
        pastLearningHistory: ['다학제 연구'],
        preferredDifficulty: 'challenging',
        availableTimePerSession: 60,
        focusAreas: largeConcepts
      })
    );
    
    console.log(`✅ 대용량 테스트 (${largeConcepts.length}개 개념): ${largeTestTime}ms`);
    console.log(`📊 결과 수: ${largeTestResult.length}개`);
    
    if (largeTestTime < 5000) { // 5초 이내
      console.log(`⚡ 성능 목표 달성 (< 5초)`);
      metrics.passedTests++;
    } else {
      console.log(`⚠️  성능 목표 미달 (>= 5초)`);
      metrics.failedTests++;
    }
    
  } catch (error) {
    console.log(`❌ 대용량 테스트 실패:`, error);
    metrics.failedTests++;
  }
  
  metrics.totalTests++;

  // 최종 메트릭 계산
  metrics.averageResponseTime = totalResponseTime / realDataTestScenarios.length;
  metrics.accuracyMetrics.precisionScore = metrics.accuracyMetrics.totalResults > 0 
    ? metrics.accuracyMetrics.relevantResults / metrics.accuracyMetrics.totalResults 
    : 0;

  console.log('\n📈 4. 최종 결과 및 분석');
  console.log('='.repeat(80));
  
  console.log(`\n🏆 전체 테스트 결과:`);
  console.log(`   총 테스트: ${metrics.totalTests}개`);
  console.log(`   성공: ${metrics.passedTests}개 (${((metrics.passedTests/metrics.totalTests)*100).toFixed(1)}%)`);
  console.log(`   실패: ${metrics.failedTests}개 (${((metrics.failedTests/metrics.totalTests)*100).toFixed(1)}%)`);
  
  console.log(`\n⚡ 성능 메트릭:`);
  console.log(`   평균 응답 시간: ${metrics.averageResponseTime.toFixed(0)}ms`);
  console.log(`   Context Bundle: ${metrics.performanceMetrics.contextBundleTime}ms`);
  console.log(`   지식 격차 탐지: ${(metrics.performanceMetrics.knowledgeGapTime/realDataTestScenarios.length).toFixed(0)}ms (평균)`);
  console.log(`   숨겨진 연결 탐지: ${(metrics.performanceMetrics.hiddenLinkTime/realDataTestScenarios.length).toFixed(0)}ms (평균)`);
  console.log(`   통합 점수 계산: ${(metrics.performanceMetrics.unifiedScoringTime/realDataTestScenarios.length).toFixed(0)}ms (평균)`);
  
  console.log(`\n🎯 정확도 메트릭:`);
  console.log(`   전체 정밀도: ${(metrics.accuracyMetrics.precisionScore * 100).toFixed(1)}%`);
  console.log(`   관련 결과: ${metrics.accuracyMetrics.relevantResults}/${metrics.accuracyMetrics.totalResults}`);
  
  console.log(`\n📊 데이터 품질 메트릭:`);
  console.log(`   처리된 책: ${metrics.dataQualityMetrics.booksProcessed}권`);
  console.log(`   처리된 노트: ${metrics.dataQualityMetrics.notesProcessed}개`);
  console.log(`   추출된 개념: ${metrics.dataQualityMetrics.conceptsExtracted}개`);
  console.log(`   발견된 연결: ${metrics.dataQualityMetrics.connectionsFound}개`);

  // 성능 목표 달성 여부 확인
  const performanceGoalMet = metrics.averageResponseTime <= 100; // 100ms 목표
  const accuracyGoalMet = metrics.accuracyMetrics.precisionScore >= 0.7; // 70% 정확도 목표
  const successRateGoalMet = (metrics.passedTests / metrics.totalTests) >= 0.8; // 80% 성공률 목표

  console.log(`\n🎯 목표 달성 현황:`);
  console.log(`   성능 목표 (≤100ms): ${performanceGoalMet ? '✅' : '❌'} (${metrics.averageResponseTime.toFixed(0)}ms)`);
  console.log(`   정확도 목표 (≥70%): ${accuracyGoalMet ? '✅' : '❌'} (${(metrics.accuracyMetrics.precisionScore*100).toFixed(1)}%)`);
  console.log(`   성공률 목표 (≥80%): ${successRateGoalMet ? '✅' : '❌'} (${((metrics.passedTests/metrics.totalTests)*100).toFixed(1)}%)`);

  const overallSuccess = performanceGoalMet && accuracyGoalMet && successRateGoalMet;
  console.log(`\n🏁 전체 통합 테스트: ${overallSuccess ? '✅ 성공' : '❌ 개선 필요'}`);

  if (!overallSuccess) {
    console.log(`\n💡 개선 권장사항:`);
    if (!performanceGoalMet) {
      console.log(`   - 성능 최적화: 캐싱, 쿼리 최적화, 병렬 처리 개선`);
    }
    if (!accuracyGoalMet) {
      console.log(`   - 정확도 향상: 온톨로지 확장, 의미론적 매칭 개선`);
    }
    if (!successRateGoalMet) {
      console.log(`   - 안정성 향상: 에러 핸들링, 폴백 메커니즘 강화`);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('🎉 Habitus33 Knowledge Graph Integration Test 완료!');
  
  return metrics;
}

// 테스트 실행
if (require.main === module) {
  runIntegrationTests()
    .then(metrics => {
      const successRate = (metrics.passedTests / metrics.totalTests) * 100;
      console.log(`\n최종 성공률: ${successRate.toFixed(1)}%`);
      process.exit(successRate >= 80 ? 0 : 1);
    })
    .catch(error => {
      console.error('통합 테스트 실행 중 오류:', error);
      process.exit(1);
    });
}

export { runIntegrationTests };
export type { IntegrationTestMetrics }; 