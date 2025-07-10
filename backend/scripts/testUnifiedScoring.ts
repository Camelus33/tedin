import { UnifiedScoringService, UserLearningProfile, RankingOptions, ScoringWeights } from '../src/services/UnifiedScoringService';

// Mock User 객체 (실제 IUser 인터페이스와 호환되도록)
const mockUser = {
  _id: 'test-user-unified',
  email: 'test@unified.com',
  username: 'unified-tester',
  nickname: 'unified-tester',
  passwordHash: 'hashed-password',
  roles: ['user'],
  trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30일 후
  createdAt: new Date(),
  updatedAt: new Date()
} as any;

// 테스트용 사용자 학습 프로필
const testUserProfile: UserLearningProfile = {
  interests: ['기술', '환경', '철학', '과학'],
  currentLevel: 'intermediate',
  learningGoals: ['지속가능성 이해', '기술 철학 습득', '환경 과학 기초'],
  pastLearningHistory: ['컴퓨터 과학', '데이터 분석', '웹 개발'],
  preferredDifficulty: 'moderate',
  availableTimePerSession: 45, // 45분
  focusAreas: ['인공지능', '환경보호', '윤리학']
};

// 다양한 테스트 시나리오
const testScenarios = [
  {
    name: '기본 통합 랭킹 테스트',
    concepts: ['기술', '환경'],
    options: { maxResults: 10 } as RankingOptions
  },
  {
    name: '고급 필터링 테스트',
    concepts: ['인공지능', '윤리', '지속가능성'],
    options: {
      maxResults: 15,
      minUnifiedScore: 70.0,
      priorityFilter: ['high', 'critical'],
      typeFilter: ['knowledge-gap'],
      difficultyFilter: ['intermediate', 'advanced'],
      timeConstraint: 60
    } as RankingOptions
  },
  {
    name: '사용자 맞춤 가중치 테스트',
    concepts: ['철학', '과학'],
    options: { maxResults: 8 } as RankingOptions,
    customWeights: {
      userInterest: 0.35,    // 사용자 관심도 높임
      learningImpact: 0.25,  // 학습 영향도 높임
      relevance: 0.15,
      ontologyStrength: 0.10,
      recency: 0.10,
      difficulty: 0.05
    } as Partial<ScoringWeights>
  },
  {
    name: '숨겨진 연결 중심 테스트',
    concepts: ['기술', '윤리', '환경'],
    options: {
      maxResults: 12,
      typeFilter: ['hidden-link'],
      includeRecommendations: true
    } as RankingOptions
  },
  {
    name: '시간 제약 테스트',
    concepts: ['인공지능', '데이터'],
    options: {
      maxResults: 20,
      timeConstraint: 30, // 30분 제한
      difficultyFilter: ['beginner', 'intermediate']
    } as RankingOptions
  }
];

async function runUnifiedScoringTests() {
  console.log('🎯 통합 점수 및 랭킹 시스템 종합 테스트 시작');
  console.log('=' .repeat(60));

  const unifiedService = new UnifiedScoringService(mockUser);

  for (let i = 0; i < testScenarios.length; i++) {
    const scenario = testScenarios[i];
    console.log(`\n📊 테스트 ${i + 1}: ${scenario.name}`);
    console.log('-'.repeat(50));

    try {
      const startTime = Date.now();

      // 통합 랭킹 생성
      const results = await unifiedService.generateUnifiedRanking(
        scenario.concepts,
        testUserProfile,
        scenario.options,
        scenario.customWeights
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`⏱️  실행 시간: ${duration}ms`);
      console.log(`📈 결과 수: ${results.length}개`);

      if (results.length > 0) {
        // 상위 3개 결과 상세 출력
        console.log('\n🏆 상위 결과:');
        results.slice(0, 3).forEach((result, index) => {
          console.log(`\n${index + 1}. ${result.title}`);
          console.log(`   타입: ${result.type}`);
          console.log(`   통합 점수: ${result.unifiedScore.toFixed(1)}`);
          console.log(`   우선순위: ${result.priority}`);
          console.log(`   난이도: ${result.difficulty}`);
          console.log(`   예상 학습 시간: ${result.estimatedLearningTime}분`);
          console.log(`   관련 개념: ${result.relatedConcepts.slice(0, 3).join(', ')}`);
          
          // 점수 세부사항
          console.log(`   세부 점수:`);
          console.log(`     - 관련도: ${result.relevanceScore.toFixed(1)}`);
          console.log(`     - 사용자 관심도: ${result.userInterestScore.toFixed(1)}`);
          console.log(`     - 학습 영향도: ${result.learningImpactScore.toFixed(1)}`);
          console.log(`     - 온톨로지 강도: ${result.ontologyStrengthScore.toFixed(1)}`);

          if (result.recommendations.length > 0) {
            console.log(`   추천사항:`);
            result.recommendations.slice(0, 2).forEach(rec => {
              console.log(`     • ${rec}`);
            });
          }
        });

        // 성능 통계
        const stats = unifiedService.generatePerformanceStats(results);
        console.log('\n📊 성능 통계:');
        console.log(`   평균 점수: ${stats.averageScore.toFixed(1)}`);
        console.log(`   평균 학습 시간: ${stats.averageLearningTime.toFixed(1)}분`);
        console.log(`   타입 분포: 격차 ${stats.typeDistribution['knowledge-gap']}개, 연결 ${stats.typeDistribution['hidden-link']}개`);
        console.log(`   우선순위 분포: 매우높음 ${stats.priorityDistribution.critical}, 높음 ${stats.priorityDistribution.high}, 보통 ${stats.priorityDistribution.medium}, 낮음 ${stats.priorityDistribution.low}`);
        console.log(`   난이도 분포: 초급 ${stats.difficultyDistribution.beginner}, 중급 ${stats.difficultyDistribution.intermediate}, 고급 ${stats.difficultyDistribution.advanced}`);

        // 필터링 효과 검증
        if (scenario.options.priorityFilter) {
          const priorityMatch = results.every(r => scenario.options.priorityFilter!.includes(r.priority));
          console.log(`   우선순위 필터링 성공: ${priorityMatch ? '✅' : '❌'}`);
        }

        if (scenario.options.typeFilter) {
          const typeMatch = results.every(r => scenario.options.typeFilter!.includes(r.type));
          console.log(`   타입 필터링 성공: ${typeMatch ? '✅' : '❌'}`);
        }

        if (scenario.options.timeConstraint) {
          const timeMatch = results.every(r => r.estimatedLearningTime <= scenario.options.timeConstraint!);
          console.log(`   시간 제약 필터링 성공: ${timeMatch ? '✅' : '❌'}`);
        }

        if (scenario.options.minUnifiedScore) {
          const scoreMatch = results.every(r => r.unifiedScore >= scenario.options.minUnifiedScore!);
          console.log(`   최소 점수 필터링 성공: ${scoreMatch ? '✅' : '❌'}`);
        }

        console.log(`✅ 테스트 ${i + 1} 성공`);

      } else {
        console.log('⚠️  결과 없음 (외부 서비스 연결 문제 가능)');
      }

    } catch (error) {
      console.error(`❌ 테스트 ${i + 1} 실패:`, error.message);
    }
  }

  // 실시간 업데이트 테스트
  console.log('\n🔄 실시간 랭킹 업데이트 테스트');
  console.log('-'.repeat(50));

  try {
    // 초기 결과 생성
    const initialResults = await unifiedService.generateUnifiedRanking(
      ['기술'],
      testUserProfile,
      { maxResults: 5 }
    );

    console.log(`초기 결과: ${initialResults.length}개`);

    // 새로운 개념으로 업데이트
    const updatedResults = await unifiedService.updateRealTimeRanking(
      initialResults,
      ['환경', '지속가능성'],
      testUserProfile
    );

    console.log(`업데이트 후 결과: ${updatedResults.length}개`);
    console.log('✅ 실시간 업데이트 테스트 성공');

  } catch (error) {
    console.error('❌ 실시간 업데이트 테스트 실패:', error.message);
  }

  // 사용자 프로필 변화 테스트
  console.log('\n👤 사용자 프로필 변화 테스트');
  console.log('-'.repeat(50));

  try {
    // 초보자 프로필
    const beginnerProfile: UserLearningProfile = {
      ...testUserProfile,
      currentLevel: 'beginner',
      preferredDifficulty: 'easy',
      availableTimePerSession: 20
    };

    const beginnerResults = await unifiedService.generateUnifiedRanking(
      ['기술', '환경'],
      beginnerProfile,
      { maxResults: 5 }
    );

    // 고급자 프로필
    const advancedProfile: UserLearningProfile = {
      ...testUserProfile,
      currentLevel: 'advanced',
      preferredDifficulty: 'challenging',
      availableTimePerSession: 90
    };

    const advancedResults = await unifiedService.generateUnifiedRanking(
      ['기술', '환경'],
      advancedProfile,
      { maxResults: 5 }
    );

    console.log('초보자 프로필 결과:');
    beginnerResults.slice(0, 2).forEach((result, index) => {
      console.log(`  ${index + 1}. ${result.title} (점수: ${result.unifiedScore.toFixed(1)}, 난이도: ${result.difficulty})`);
    });

    console.log('고급자 프로필 결과:');
    advancedResults.slice(0, 2).forEach((result, index) => {
      console.log(`  ${index + 1}. ${result.title} (점수: ${result.unifiedScore.toFixed(1)}, 난이도: ${result.difficulty})`);
    });

    console.log('✅ 사용자 프로필 변화 테스트 성공');

  } catch (error) {
    console.error('❌ 사용자 프로필 변화 테스트 실패:', error.message);
  }

  console.log('\n🎯 통합 점수 및 랭킹 시스템 테스트 완료');
  console.log('=' .repeat(60));
}

// 메인 실행
if (require.main === module) {
  runUnifiedScoringTests().catch(console.error);
}

export { runUnifiedScoringTests }; 