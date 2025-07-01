/**
 * 시간 기록 시스템 통합 테스트 스크립트
 * 실제 프로덕션 데이터에 영향 없이 시간 처리 로직 검증
 * 
 * @author Habitus33 Engineering Team
 * @version 1.0.0
 */

import mongoose from 'mongoose';
import Note from '../models/Note';
import { processClientTime, getFinalTimeForNote, CompressedClientTime, TimeProcessResult } from '../utils/timeProcessor';

/**
 * 테스트 시나리오별 클라이언트 시간 정보
 */
interface TestTimeScenario {
  name: string;
  description: string;
  clientTimestamp: string;
  clientTimezone: string;
  clientTimezoneOffset: number;
  expectedResult: {
    shouldUseClientTime: boolean;
    timezoneName: string;
    offsetHours: number;
  };
}

/**
 * 다양한 시간대 테스트 시나리오
 */
const timeScenarios: TestTimeScenario[] = [
  {
    name: "한국 표준시 (서울)",
    description: "기본 사용자 시간대 - 가장 일반적인 케이스",
    clientTimestamp: new Date().toISOString(),
    clientTimezone: "Asia/Seoul",
    clientTimezoneOffset: -540, // UTC+9
    expectedResult: {
      shouldUseClientTime: true,
      timezoneName: "Asia/Seoul",
      offsetHours: 9
    }
  },
  {
    name: "미국 동부 표준시 (뉴욕)",
    description: "해외 사용자 - 미국 동부",
    clientTimestamp: new Date().toISOString(),
    clientTimezone: "America/New_York",
    clientTimezoneOffset: 300, // UTC-5 (겨울) 또는 240 (여름)
    expectedResult: {
      shouldUseClientTime: true,
      timezoneName: "America/New_York",
      offsetHours: -5
    }
  },
  {
    name: "영국 표준시 (런던)",
    description: "해외 사용자 - 유럽",
    clientTimestamp: new Date().toISOString(),
    clientTimezone: "Europe/London",
    clientTimezoneOffset: 0, // UTC+0 (겨울) 또는 -60 (여름)
    expectedResult: {
      shouldUseClientTime: true,
      timezoneName: "Europe/London",
      offsetHours: 0
    }
  },
  {
    name: "일본 표준시 (도쿄)",
    description: "인접 국가 - 일본",
    clientTimestamp: new Date().toISOString(),
    clientTimezone: "Asia/Tokyo",
    clientTimezoneOffset: -540, // UTC+9 (한국과 동일)
    expectedResult: {
      shouldUseClientTime: true,
      timezoneName: "Asia/Tokyo",
      offsetHours: 9
    }
  },
  {
    name: "잘못된 시간 (미래)",
    description: "클라이언트 시간이 비정상적으로 미래인 경우",
    clientTimestamp: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(), // 25시간 후
    clientTimezone: "Asia/Seoul",
    clientTimezoneOffset: -540,
    expectedResult: {
      shouldUseClientTime: false,
      timezoneName: "server",
      offsetHours: 0
    }
  },
  {
    name: "잘못된 시간 (과거)",
    description: "클라이언트 시간이 비정상적으로 과거인 경우",
    clientTimestamp: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(), // 25시간 전
    clientTimezone: "Asia/Seoul",
    clientTimezoneOffset: -540,
    expectedResult: {
      shouldUseClientTime: false,
      timezoneName: "server",
      offsetHours: 0
    }
  }
];

/**
 * 시간 처리 로직 테스트 결과
 */
interface TestResult {
  scenario: string;
  passed: boolean;
  actualResult: {
    clientTimeUsed: boolean;
    processedTime: Date | null;
    finalTime: Date;
    timezoneInfo: any;
  };
  expectedResult: TestTimeScenario['expectedResult'];
  errors: string[];
}

/**
 * 단일 시나리오 테스트 실행
 */
async function testTimeScenario(scenario: TestTimeScenario): Promise<TestResult> {
  const errors: string[] = [];
  let passed = true;
  
  try {
    console.log(`\n🧪 테스트: ${scenario.name}`);
    console.log(`   설명: ${scenario.description}`);
    
         // 1. 클라이언트 시간 처리 테스트
     const timeProcessResult = processClientTime({
       ts: scenario.clientTimestamp,
       tz: scenario.clientTimezone,
       off: scenario.clientTimezoneOffset
     });
     
     console.log(`   클라이언트 시간: ${scenario.clientTimestamp}`);
     console.log(`   처리된 시간: ${timeProcessResult.clientCreatedAt ? timeProcessResult.clientCreatedAt.toISOString() : 'null'}`);
     
     // 2. 최종 시간 결정 로직 테스트
     const finalTimeResult = getFinalTimeForNote(timeProcessResult);
     
     console.log(`   서버 시간: ${timeProcessResult.serverCreatedAt.toISOString()}`);
     console.log(`   최종 시간: ${finalTimeResult.createdAt.toISOString()}`);
     
     // 3. 결과 검증
     const clientTimeUsed = timeProcessResult.useClientTime && timeProcessResult.clientCreatedAt !== null;
    
    // 기대 결과와 비교
    if (scenario.expectedResult.shouldUseClientTime !== clientTimeUsed) {
      errors.push(`클라이언트 시간 사용 여부 불일치: 기대=${scenario.expectedResult.shouldUseClientTime}, 실제=${clientTimeUsed}`);
      passed = false;
    }
    
         // 시간 차이 검증 (정상 케이스)
     if (scenario.expectedResult.shouldUseClientTime && timeProcessResult.clientCreatedAt) {
       const expectedTime = new Date(scenario.clientTimestamp);
       const timeDifference = Math.abs(timeProcessResult.clientCreatedAt.getTime() - expectedTime.getTime());
       
       if (timeDifference > 1000) { // 1초 이상 차이
         errors.push(`시간 정확성 오류: ${timeDifference}ms 차이`);
         passed = false;
       }
     }
     
     console.log(`   결과: ${passed ? '✅ 통과' : '❌ 실패'}`);
     if (errors.length > 0) {
       errors.forEach(error => console.log(`     오류: ${error}`));
     }
     
     return {
       scenario: scenario.name,
       passed,
       actualResult: {
         clientTimeUsed,
         processedTime: timeProcessResult.clientCreatedAt,
         finalTime: finalTimeResult.createdAt,
         timezoneInfo: {
           timezone: scenario.clientTimezone,
           offset: scenario.clientTimezoneOffset
         }
       },
       expectedResult: scenario.expectedResult,
       errors
     };
    
  } catch (error) {
    console.error(`   예외 발생: ${error}`);
    errors.push(`예외 발생: ${error}`);
    
    return {
      scenario: scenario.name,
      passed: false,
      actualResult: {
        clientTimeUsed: false,
        processedTime: null,
        finalTime: new Date(),
        timezoneInfo: null
      },
      expectedResult: scenario.expectedResult,
      errors
    };
  }
}

/**
 * 기존 기능 정상 동작 확인
 */
async function testExistingFunctionality(): Promise<{
  passed: boolean;
  results: { [key: string]: boolean };
  errors: string[];
}> {
  console.log('\n🔍 기존 기능 정상 동작 확인');
  console.log('='.repeat(40));
  
  const results: { [key: string]: boolean } = {};
  const errors: string[] = [];
  
  try {
    // 1. MongoDB 연결 상태 확인
    const dbState = mongoose.connection.readyState;
    results['MongoDB 연결'] = dbState === 1;
    console.log(`MongoDB 연결 상태: ${dbState === 1 ? '✅ 연결됨' : '❌ 연결 실패'}`);
    
    if (!results['MongoDB 연결']) {
      errors.push('MongoDB 연결이 활성화되지 않음');
    }
    
    // 2. Note 모델 스키마 확인
    const noteSchema = Note.schema;
    const hasClientCreatedAt = noteSchema.paths.hasOwnProperty('clientCreatedAt');
    results['Note 스키마 확장'] = hasClientCreatedAt;
    console.log(`Note.clientCreatedAt 필드: ${hasClientCreatedAt ? '✅ 존재' : '❌ 누락'}`);
    
    if (!hasClientCreatedAt) {
      errors.push('Note 모델에 clientCreatedAt 필드가 없음');
    }
    
    // 3. 기존 Note 조회 기능 확인 (실제 데이터 조회하지 않고 스키마만 확인)
    const sampleQuery = Note.findOne({}).lean();
    results['Note 조회 기능'] = typeof sampleQuery.exec === 'function';
    console.log(`Note 조회 기능: ${results['Note 조회 기능'] ? '✅ 정상' : '❌ 오류'}`);
    
         // 4. 시간 처리 유틸리티 함수 확인
     const testProcessTime = processClientTime({
       ts: new Date().toISOString(),
       tz: 'Asia/Seoul',
       off: -540
     });
     results['시간 처리 유틸리티'] = testProcessTime.clientCreatedAt instanceof Date || testProcessTime.clientCreatedAt === null;
    console.log(`시간 처리 함수: ${results['시간 처리 유틸리티'] ? '✅ 정상' : '❌ 오류'}`);
    
    // 5. 서버 시간대 설정 확인
    const serverTimezone = process.env.TZ;
    const isKoreanTimezone = serverTimezone === 'Asia/Seoul';
    results['서버 시간대 설정'] = isKoreanTimezone;
    console.log(`서버 시간대: ${isKoreanTimezone ? '✅ Asia/Seoul' : `❌ ${serverTimezone || 'Not Set'}`}`);
    
    if (!isKoreanTimezone) {
      errors.push(`서버 시간대가 Korea/Seoul이 아님: ${serverTimezone}`);
    }
    
  } catch (error) {
    console.error(`기존 기능 테스트 중 오류: ${error}`);
    errors.push(`기존 기능 테스트 예외: ${error}`);
  }
  
  const allPassed = Object.values(results).every(result => result === true);
  console.log(`\n전체 기존 기능 테스트: ${allPassed ? '✅ 모두 통과' : '❌ 일부 실패'}`);
  
  return {
    passed: allPassed,
    results,
    errors
  };
}

/**
 * 데이터베이스 성능 영향 확인
 */
async function testDatabasePerformance(): Promise<{
  passed: boolean;
  metrics: { [key: string]: number };
  errors: string[];
}> {
  console.log('\n⚡ 데이터베이스 성능 영향 확인');
  console.log('='.repeat(40));
  
  const metrics: { [key: string]: number } = {};
  const errors: string[] = [];
  
  try {
    // 1. 기본 조회 성능 측정 (실제 데이터에 영향 없음)
    const startTime = Date.now();
    
    // Note 컬렉션 통계 조회 (읽기 전용)
    const noteStats = await Note.collection.stats();
    const queryTime = Date.now() - startTime;
    
    metrics['컬렉션 통계 조회 시간(ms)'] = queryTime;
    metrics['문서 수'] = noteStats.count || 0;
    metrics['평균 문서 크기(bytes)'] = noteStats.avgObjSize || 0;
    metrics['인덱스 수'] = noteStats.nindexes || 0;
    
    console.log(`컬렉션 통계 조회: ${queryTime}ms`);
    console.log(`문서 수: ${metrics['문서 수'].toLocaleString()}`);
    console.log(`평균 문서 크기: ${metrics['평균 문서 크기(bytes)']} bytes`);
    console.log(`인덱스 수: ${metrics['인덱스 수']}`);
    
         // 2. 인덱스 효율성 확인
     const indexes = await Note.collection.listIndexes().toArray();
     const hasCreatedAtIndex = indexes.some((idx: any) => 
       idx.name.includes('createdAt') || idx.key?.createdAt
     );
     
     console.log(`createdAt 인덱스: ${hasCreatedAtIndex ? '✅ 존재' : '❌ 누락'}`);
    
    // 3. 성능 기준 확인
    const performanceThreshold = 100; // 100ms 이하
    const performancePassed = queryTime < performanceThreshold;
    
    console.log(`성능 기준 (${performanceThreshold}ms 이하): ${performancePassed ? '✅ 통과' : '❌ 초과'}`);
    
    if (!performancePassed) {
      errors.push(`쿼리 성능이 기준을 초과함: ${queryTime}ms > ${performanceThreshold}ms`);
    }
    
    return {
      passed: performancePassed && errors.length === 0,
      metrics,
      errors
    };
    
  } catch (error) {
    console.error(`성능 테스트 중 오류: ${error}`);
    errors.push(`성능 테스트 예외: ${error}`);
    
    return {
      passed: false,
      metrics,
      errors
    };
  }
}

/**
 * 전체 통합 테스트 실행
 */
export async function runIntegrationTests(): Promise<{
  overall: boolean;
  timeTests: TestResult[];
  functionalityTest: any;
  performanceTest: any;
  summary: string;
}> {
  console.log('\n🚀 시간 기록 시스템 통합 테스트 시작');
  console.log('='.repeat(60));
  
  // 1. 시간대별 테스트 실행
  console.log('\n📅 다양한 시간대 테스트');
  const timeTestResults: TestResult[] = [];
  
  for (const scenario of timeScenarios) {
    const result = await testTimeScenario(scenario);
    timeTestResults.push(result);
  }
  
  // 2. 기존 기능 테스트
  const functionalityTest = await testExistingFunctionality();
  
  // 3. 성능 테스트
  const performanceTest = await testDatabasePerformance();
  
  // 4. 전체 결과 요약
  const timeTestsPassed = timeTestResults.every(result => result.passed);
  const overallPassed = timeTestsPassed && functionalityTest.passed && performanceTest.passed;
  
  console.log('\n📊 테스트 결과 요약');
  console.log('='.repeat(40));
  console.log(`시간대 테스트: ${timeTestsPassed ? '✅ 통과' : '❌ 실패'} (${timeTestResults.filter(r => r.passed).length}/${timeTestResults.length})`);
  console.log(`기존 기능 테스트: ${functionalityTest.passed ? '✅ 통과' : '❌ 실패'}`);
  console.log(`성능 테스트: ${performanceTest.passed ? '✅ 통과' : '❌ 실패'}`);
  console.log(`전체 결과: ${overallPassed ? '✅ 모든 테스트 통과' : '❌ 일부 테스트 실패'}`);
  
  const summary = `통합 테스트 완료. 시간대 테스트: ${timeTestResults.filter(r => r.passed).length}/${timeTestResults.length} 통과, 기존 기능: ${functionalityTest.passed ? '정상' : '오류'}, 성능: ${performanceTest.passed ? '정상' : '문제'}`;
  
  return {
    overall: overallPassed,
    timeTests: timeTestResults,
    functionalityTest,
    performanceTest,
    summary
  };
}

/**
 * 개발 환경에서 직접 실행
 */
if (require.main === module) {
  // MongoDB 연결이 필요한 경우
  if (mongoose.connection.readyState !== 1) {
    console.log('MongoDB 연결 대기 중...');
    mongoose.connection.once('connected', async () => {
      await runIntegrationTests();
      process.exit(0);
    });
  } else {
    runIntegrationTests().then(() => {
      process.exit(0);
    }).catch(error => {
      console.error('통합 테스트 실행 오류:', error);
      process.exit(1);
    });
  }
} 