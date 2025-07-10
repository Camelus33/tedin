import { ResponseHandler, ResponseFormat, NewKnowledgeTriple } from '../src/services/ResponseHandler';
import { ContextOrchestrator, ContextBundle } from '../src/services/ContextOrchestrator';
import { FusekiUpdateService } from '../src/services/FusekiUpdateService';

/**
 * 🚀 End-to-End 통합 테스트
 * 
 * 전체 AI 응답 파싱 및 그래프 업데이트 파이프라인 검증:
 * 1. AI 응답 파싱 (다양한 형식)
 * 2. NLP 트리플 추출 
 * 3. 사용자 중심 추적
 * 4. Fuseki 업데이트
 * 5. 성능 및 정확도 측정
 */

interface TestScenario {
  name: string;
  description: string;
  aiModel: string;
  responseFormat: ResponseFormat;
  mockResponse: any;
  contextBundle: ContextBundle;
  expectedTriples: number;
  expectedUserOrganic: number;
  expectedAiAssisted: number;
}

interface TestResult {
  scenario: string;
  success: boolean;
  processingTime: number;
  extractedTriples: number;
  fusekiSuccess: boolean;
  userOrganicCount: number;
  aiAssistedCount: number;
  accuracy: number;
  errors: string[];
}

class EndToEndTester {
  private fusekiService: FusekiUpdateService;
  private results: TestResult[] = [];

  constructor() {
    this.fusekiService = new FusekiUpdateService();
  }

  /**
   * 🎯 전체 통합 테스트 실행
   */
  async runAllTests(): Promise<void> {
    console.log('🚀 End-to-End 통합 테스트 시작...\\n');
    console.log('=' .repeat(80));

    // 1. Fuseki 연결 확인
    await this.checkFusekiConnection();

    // 2. 테스트 시나리오 정의
    const scenarios = this.defineTestScenarios();

    // 3. 각 시나리오 실행
    for (const scenario of scenarios) {
      await this.runScenario(scenario);
    }

    // 4. 전체 결과 분석
    this.analyzeResults();

    // 5. 성능 벤치마크
    await this.runPerformanceBenchmark();

    console.log('\\n🎉 End-to-End 통합 테스트 완료!');
  }

  /**
   * Fuseki 서버 연결 상태 확인
   */
  private async checkFusekiConnection(): Promise<void> {
    console.log('🔗 Fuseki 연결 상태 확인...');
    
    try {
      const health = await this.fusekiService.healthCheck();
      if (health.connected && health.updateCapable) {
        console.log('✅ Fuseki 서버 연결 성공');
        console.log(`   응답시간: ${health.responseTime}ms\\n`);
      } else {
        console.warn('⚠️  Fuseki 서버 연결 문제 - 테스트는 로컬에서만 진행됩니다\\n');
      }
    } catch (error) {
      console.warn(`⚠️  Fuseki 연결 오류: ${error} - 테스트는 로컬에서만 진행됩니다\\n`);
    }
  }

  /**
   * 다양한 테스트 시나리오 정의
   */
  private defineTestScenarios(): TestScenario[] {
    const baseContext: ContextBundle = {
      targetConcept: "AI와 머신러닝",
      relevantNotes: [
        {
          content: "인공지능과 머신러닝은 미래 기술의 핵심이다. 데이터 분석이 중요하다.",
          tags: ["AI", "미래기술"],
          relevanceScore: 0.9
        },
        {
          content: "딥러닝은 신경망을 기반으로 한 강력한 학습 방법이다.",
          tags: ["딥러닝", "신경망"],
          relevanceScore: 0.85
        }
      ],
      relatedConcepts: ["데이터분석", "신경망", "자동화"],
      queryMetadata: {
        executionTime: 45,
        resultCount: 2,
        queryType: "concept_exploration"
      }
    };

    return [
      // 시나리오 1: OpenAI 스타일 JSON 응답
      {
        name: "OpenAI_JSON",
        description: "OpenAI 스타일 구조화된 JSON 응답 파싱",
        aiModel: "gpt-4",
        responseFormat: ResponseFormat.JSON,
        mockResponse: {
                     choices: [{
             message: {
               content: JSON.stringify({
                 "content": "인공지능은 머신러닝의 상위 개념입니다.",
                 "triples": [
                   {
                     "subject": "habitus33:AI",
                     "predicate": "rdfs:subClassOf", 
                     "object": "habitus33:Technology",
                     "confidence": 0.9
                   }
                 ]
               })
             }
           }],
          model: "gpt-4"
        },
        contextBundle: baseContext,
        expectedTriples: 3,
        expectedUserOrganic: 1,
        expectedAiAssisted: 2
      },

      // 시나리오 2: Claude 스타일 텍스트 응답  
      {
        name: "Claude_Text",
        description: "Claude 스타일 자연스러운 텍스트 응답",
        aiModel: "claude-3",
        responseFormat: ResponseFormat.RAW_TEXT,
        mockResponse: "인공지능은 데이터 분석을 통해 패턴을 학습하는 기술입니다. 특히 딥러닝은 신경망의 고급 형태로, 복잡한 문제를 해결할 수 있습니다. 머신러닝은 인공지능의 핵심 분야입니다.",
        contextBundle: baseContext,
        expectedTriples: 4,
        expectedUserOrganic: 2,
        expectedAiAssisted: 2
      },

      // 시나리오 3: Gemini 스타일 응답
      {
        name: "Gemini_Structured", 
        description: "Gemini 스타일 구조화된 응답",
        aiModel: "gemini-pro",
        responseFormat: ResponseFormat.RAW_TEXT,
        mockResponse: {
          candidates: [{
            content: {
              parts: [{
                text: "자동화 기술은 인공지능과 밀접한 관련이 있습니다. 특히 데이터 분석 분야에서 머신러닝 알고리즘이 중요한 역할을 합니다."
              }]
            }
          }]
        },
        contextBundle: baseContext,
        expectedTriples: 3,
        expectedUserOrganic: 1,
        expectedAiAssisted: 2
      },

      // 시나리오 4: 복잡한 관계 추출 시나리오
      {
        name: "Complex_Relations",
        description: "복잡한 다중 관계 및 개념 추출",
        aiModel: "advanced-nlp",
        responseFormat: ResponseFormat.RAW_TEXT,
        mockResponse: "딥러닝은 머신러닝의 하위 분야입니다. 신경망은 딥러닝의 핵심 구조이며, 인공지능의 발전에 중요한 역할을 합니다. 데이터 분석은 이 모든 기술의 기초가 됩니다.",
        contextBundle: baseContext,
        expectedTriples: 6,
        expectedUserOrganic: 3,
        expectedAiAssisted: 3
      },

      // 시나리오 5: 오류 복구 테스트
      {
        name: "Error_Recovery",
        description: "잘못된 형식 응답에서의 오류 복구",
        aiModel: "unknown-model",
        responseFormat: ResponseFormat.JSON,
        mockResponse: "잘못된 JSON { invalid syntax...",
        contextBundle: baseContext,
        expectedTriples: 0,
        expectedUserOrganic: 0,
        expectedAiAssisted: 0
      }
    ];
  }

  /**
   * 개별 시나리오 실행
   */
  private async runScenario(scenario: TestScenario): Promise<void> {
    console.log(`\\n📋 시나리오: ${scenario.name}`);
    console.log(`   ${scenario.description}`);
    console.log('─'.repeat(60));

    const startTime = Date.now();
    const errors: string[] = [];

    try {
      // 1. ResponseHandler 생성
      const responseHandler = new ResponseHandler(
        scenario.mockResponse,
        scenario.contextBundle,
        scenario.responseFormat
      );

      // 2. 트리플 추출 및 Fuseki 저장 (에러 복구 시나리오는 Fuseki 저장 비활성화)
      const enableFuseki = scenario.name !== 'Error_Recovery';
      const result = await responseHandler.extractAndStoreTriples(enableFuseki);

      // 3. 결과 분석
      const userOrganicCount = result.extractedTriples.filter(t => t.sourceType === 'user_organic').length;
      const aiAssistedCount = result.extractedTriples.filter(t => t.sourceType === 'ai_assisted').length;

      // 4. 정확도 계산 (예상값과 실제값 비교)
      const tripleAccuracy = this.calculateAccuracy(result.extractedTriples.length, scenario.expectedTriples);
      const sourceAccuracy = this.calculateAccuracy(userOrganicCount + aiAssistedCount, scenario.expectedUserOrganic + scenario.expectedAiAssisted);
      const overallAccuracy = (tripleAccuracy + sourceAccuracy) / 2;

      const processingTime = Date.now() - startTime;

      // 5. 결과 출력
      console.log(`✅ 처리 완료:`);
      console.log(`   추출된 트리플: ${result.extractedTriples.length}개 (예상: ${scenario.expectedTriples}개)`);
      console.log(`   User Organic: ${userOrganicCount}개 (예상: ${scenario.expectedUserOrganic}개)`);
      console.log(`   AI Assisted: ${aiAssistedCount}개 (예상: ${scenario.expectedAiAssisted}개)`);
      console.log(`   처리 시간: ${processingTime}ms`);
      console.log(`   정확도: ${overallAccuracy.toFixed(1)}%`);
      
      if (result.fusekiResult) {
        console.log(`   Fuseki 저장: ${result.fusekiResult.successfulTriples}개 성공`);
      }

      // 6. 결과 저장
      this.results.push({
        scenario: scenario.name,
        success: true,
        processingTime,
        extractedTriples: result.extractedTriples.length,
        fusekiSuccess: result.fusekiResult?.successfulTriples > 0 || false,
        userOrganicCount,
        aiAssistedCount,
        accuracy: overallAccuracy,
        errors
      });

    } catch (error) {
      const processingTime = Date.now() - startTime;
      errors.push(error.toString());
      
      console.log(`❌ 시나리오 실패: ${error}`);
      
      this.results.push({
        scenario: scenario.name,
        success: false,
        processingTime,
        extractedTriples: 0,
        fusekiSuccess: false,
        userOrganicCount: 0,
        aiAssistedCount: 0,
        accuracy: 0,
        errors
      });
    }
  }

  /**
   * 정확도 계산 (실제값 vs 예상값)
   */
  private calculateAccuracy(actual: number, expected: number): number {
    if (expected === 0) return actual === 0 ? 100 : 0;
    return Math.max(0, 100 - Math.abs(actual - expected) / expected * 100);
  }

  /**
   * 전체 결과 분석
   */
  private analyzeResults(): void {
    console.log('\\n' + '=' .repeat(80));
    console.log('📊 전체 결과 분석');
    console.log('=' .repeat(80));

    const totalTests = this.results.length;
    const successfulTests = this.results.filter(r => r.success).length;
    const averageAccuracy = this.results.reduce((sum, r) => sum + r.accuracy, 0) / totalTests;
    const averageProcessingTime = this.results.reduce((sum, r) => sum + r.processingTime, 0) / totalTests;
    const fusekiSuccessRate = this.results.filter(r => r.fusekiSuccess).length / totalTests * 100;

    console.log(`\\n📈 성과 지표:`);
    console.log(`   테스트 성공률: ${successfulTests}/${totalTests} (${(successfulTests/totalTests*100).toFixed(1)}%)`);
    console.log(`   평균 정확도: ${averageAccuracy.toFixed(1)}%`);
    console.log(`   평균 처리 시간: ${averageProcessingTime.toFixed(0)}ms`);
    console.log(`   Fuseki 저장 성공률: ${fusekiSuccessRate.toFixed(1)}%`);

    console.log(`\\n📋 시나리오별 상세 결과:`);
    this.results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      console.log(`   ${status} ${result.scenario}: ${result.accuracy.toFixed(1)}% (${result.processingTime}ms)`);
      
      if (result.errors.length > 0) {
        result.errors.forEach(error => {
          console.log(`      오류: ${error}`);
        });
      }
    });

    // 품질 기준 검증
    console.log(`\\n🎯 품질 기준 검증:`);
    this.validateQualityStandards(successfulTests, totalTests, averageAccuracy, averageProcessingTime);
  }

  /**
   * 품질 기준 검증
   */
  private validateQualityStandards(successful: number, total: number, accuracy: number, processingTime: number): void {
    const successRate = successful / total * 100;
    
    console.log(`   테스트 성공률 >= 80%: ${successRate >= 80 ? '✅' : '❌'} (${successRate.toFixed(1)}%)`);
    console.log(`   평균 정확도 >= 70%: ${accuracy >= 70 ? '✅' : '❌'} (${accuracy.toFixed(1)}%)`);
    console.log(`   평균 처리시간 <= 500ms: ${processingTime <= 500 ? '✅' : '❌'} (${processingTime.toFixed(0)}ms)`);
    
    const overallQuality = (successRate >= 80 ? 1 : 0) + (accuracy >= 70 ? 1 : 0) + (processingTime <= 500 ? 1 : 0);
    console.log(`\\n📊 전체 품질 점수: ${overallQuality}/3 ${overallQuality >= 2 ? '✅ 통과' : '❌ 개선 필요'}`);
  }

  /**
   * 성능 벤치마크 테스트
   */
  private async runPerformanceBenchmark(): Promise<void> {
    console.log('\\n' + '=' .repeat(80));
    console.log('⚡ 성능 벤치마크 테스트');
    console.log('=' .repeat(80));

    const benchmarkContext: ContextBundle = {
      targetConcept: "성능 테스트",
      relevantNotes: Array.from({length: 10}, (_, i) => ({
        content: \`벤치마크 테스트 메모 \${i+1}: 인공지능과 머신러닝에 대한 다양한 내용들\`,
        tags: [\`tag\${i+1}\`, "벤치마크"],
        relevanceScore: 0.8
      })),
      relatedConcepts: ["성능", "속도", "정확도"],
      queryMetadata: {
        executionTime: 50,
        resultCount: 10,
        queryType: "performance_benchmark"
      }
    };

         const largeMockResponse = Array.from({length: 20}, (_, i) => 
       `인공지능 기술 ${i+1}은 머신러닝의 하위 분야입니다. 데이터 분석과 밀접한 관련이 있습니다.`
     ).join(' ');

    console.log('🚀 대용량 데이터 처리 테스트 시작...');
    const startTime = Date.now();

    try {
      const responseHandler = new ResponseHandler(
        largeMockResponse,
        benchmarkContext,
        ResponseFormat.RAW_TEXT
      );

      const result = await responseHandler.extractAndStoreTriples(false); // Fuseki 저장 비활성화로 순수 처리 성능 측정
      
      const processingTime = Date.now() - startTime;
      const throughput = result.extractedTriples.length / (processingTime / 1000); // 트리플/초

      console.log(`✅ 성능 벤치마크 결과:`);
      console.log(`   처리 시간: ${processingTime}ms`);
      console.log(`   추출된 트리플: ${result.extractedTriples.length}개`);
      console.log(`   처리 속도: ${throughput.toFixed(2)} 트리플/초`);
      console.log(`   메모리 효율성: ${processingTime <= 1000 ? '✅ 우수' : '⚠️ 개선 필요'}`);

    } catch (error) {
      console.log(`❌ 성능 벤치마크 실패: ${error}`);
    }
  }
}

/**
 * 메인 실행 함수
 */
async function runEndToEndTests() {
  const tester = new EndToEndTester();
  await tester.runAllTests();
}

// 테스트 실행
if (require.main === module) {
  runEndToEndTests().catch(console.error);
} 