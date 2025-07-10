import { ResponseHandler, ResponseFormat, NewKnowledgeTriple } from '../src/services/ResponseHandler';
import { ContextOrchestrator, ContextBundle } from '../src/services/ContextOrchestrator';

/**
 * 🎯 사용자 중심 지식 진화 추적 테스트
 * 
 * 테스트 시나리오:
 * 1. 사용자 메모만 있는 경우 (user_organic)
 * 2. AI가 외부 지식 제공하는 경우 (ai_assisted)
 * 3. 사용자 메모 + AI 보조 혼합 (gap_filled)
 */
async function testUserCentricTracking() {
  console.log('🎯 사용자 중심 지식 진화 추적 테스트 시작...\\n');

  try {
    // 1. 테스트 시나리오: 사용자가 "머신러닝"과 "데이터분석"에 대해 메모를 작성했다고 가정
    const mockContextBundle: ContextBundle = {
      targetConcept: "머신러닝",
      relevantNotes: [
        {
          content: "머신러닝은 정말 흥미로운 분야다. 데이터에서 패턴을 찾는 것이 핵심이다.",
          tags: ["AI", "학습"],
          relevanceScore: 0.9
        },
        {
          content: "데이터분석을 할 때는 항상 가설을 세우고 검증하는 과정이 중요하다.",
          tags: ["데이터", "분석"],
          relevanceScore: 0.85
        },
        {
          content: "딥러닝은 신경망을 기반으로 한 머신러닝의 한 분야이다.",
          tags: ["딥러닝", "신경망"],
          relevanceScore: 0.8
        }
      ],
      bookExcerpts: ["머신러닝 관련 서적에서 발췌한 내용"],
      relatedConcepts: ["데이터분석", "인공지능", "딥러닝"],
      queryMetadata: {
        executionTime: 45,
        resultCount: 3,
        queryType: "concept_relationship"
      }
    };

    // 2. AI 응답 시뮬레이션
    const aiResponses = [
      {
        description: "🧩 시나리오 1: 사용자 메모 기반 연결 (user_organic 기대)",
        response: "머신러닝은 데이터분석의 고급 형태입니다. 사용자의 메모에서 언급한 것처럼, 머신러닝은 데이터에서 패턴을 찾는 것이 핵심이며, 이는 데이터분석의 가설 검증 과정과 밀접한 관련이 있습니다."
      },
      {
        description: "🤖 시나리오 2: AI 외부 지식 (ai_assisted 기대)",
        response: "자연어처리는 머신러닝의 한 분야로, 텍스트 데이터를 분석합니다. 이는 BERT, GPT와 같은 트랜스포머 모델을 사용하여 구현됩니다."
      },
      {
        description: "⚡ 시나리오 3: 혼합 케이스 (gap_filled 기대)", 
        response: "딥러닝은 머신러닝의 하위 분야이며, 컴퓨터비전 영역에서 특히 강력합니다. 사용자가 언급한 신경망 기반의 딥러닝이 바로 이것입니다."
      }
    ];

    // 3. 각 시나리오 테스트
    for (let i = 0; i < aiResponses.length; i++) {
      const scenario = aiResponses[i];
      console.log(`\\n${scenario.description}`);
      console.log('─'.repeat(60));

      const responseHandler = new ResponseHandler(
        scenario.response,
        mockContextBundle,
        ResponseFormat.RAW_TEXT
      );

      // 트리플 추출 및 저장 (Fuseki 저장은 비활성화)
      const result = await responseHandler.extractAndStoreTriples(false);
      
      console.log(`📊 추출된 트리플 수: ${result.extractedTriples.length}`);
      
      // 추출된 트리플들의 출처 타입 분석
      const sourceTypeAnalysis = {
        user_organic: 0,
        ai_assisted: 0,
        unknown: 0
      };
      
      const evolutionStageAnalysis = {
        initial: 0,
        connected: 0,
        synthesized: 0,
        gap_filled: 0
      };

      result.extractedTriples.forEach((triple: NewKnowledgeTriple, index: number) => {
        console.log(`\\n  트리플 ${index + 1}:`);
        console.log(`    Subject: ${triple.subject}`);
        console.log(`    Predicate: ${triple.predicate}`);
        console.log(`    Object: ${triple.object}`);
        console.log(`    🎯 Source Type: ${triple.sourceType || 'undefined'}`);
        console.log(`    📈 Evolution Stage: ${triple.evolutionStage || 'undefined'}`);
        console.log(`    ⭐ Confidence: ${triple.confidence?.toFixed(3)}`);
        console.log(`    📝 Derived From User: ${triple.derivedFromUser}`);
        console.log(`    🕒 Temporal Context: ${triple.temporalContext}`);
        
        if (triple.originalMemoId) {
          console.log(`    📎 Original Memo ID: ${triple.originalMemoId}`);
        }

        // 통계 집계
        if (triple.sourceType) {
          sourceTypeAnalysis[triple.sourceType]++;
        } else {
          sourceTypeAnalysis.unknown++;
        }
        
        if (triple.evolutionStage) {
          evolutionStageAnalysis[triple.evolutionStage]++;
        }
      });

      // 시나리오별 분석 결과
      console.log(`\\n📈 출처 타입 분석:`);
      console.log(`   User Organic: ${sourceTypeAnalysis.user_organic}개`);
      console.log(`   AI Assisted: ${sourceTypeAnalysis.ai_assisted}개`);
      console.log(`   Unknown: ${sourceTypeAnalysis.unknown}개`);
      
      console.log(`\\n🧬 진화 단계 분석:`);
      console.log(`   Initial: ${evolutionStageAnalysis.initial}개`);
      console.log(`   Connected: ${evolutionStageAnalysis.connected}개`);
      console.log(`   Synthesized: ${evolutionStageAnalysis.synthesized}개`);
      console.log(`   Gap Filled: ${evolutionStageAnalysis.gap_filled}개`);
    }

    console.log('\\n🎉 사용자 중심 지식 진화 추적 테스트 완료!');
    console.log('\\n💡 결과 해석:');
    console.log('   - user_organic: 사용자 메모에서 자연스럽게 나온 연결');
    console.log('   - ai_assisted: AI가 외부 지식으로 도움을 준 연결');
    console.log('   - gap_filled: 사용자 지식 공백을 AI가 채운 경우');
    console.log('   - synthesized: NLP가 사용자 메모 간 숨은 연결을 발견');

  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
  }
}

// 테스트 실행
if (require.main === module) {
  testUserCentricTracking();
} 