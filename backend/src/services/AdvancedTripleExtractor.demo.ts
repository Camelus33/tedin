import { AdvancedTripleExtractor } from './AdvancedTripleExtractor';

async function demonstrateAdvancedTripleExtraction() {
  console.log('=== Advanced Triple Extractor 데모 ===\n');

  const extractor = new AdvancedTripleExtractor();

  // 테스트 텍스트들
  const testTexts = [
    '머신러닝은 인공지능의 하위 분야이다.',
    '딥러닝 알고리즘은 데이터를 분석한다.',
    '연구자가 서울에서 자연어처리 시스템을 개발했다.',
    '2024년에 개발팀이 새로운 프레임워크를 구현했다.',
    'AI 기술은 다양한 분야에서 활용되고 있다.'
  ];

  for (const text of testTexts) {
    console.log(`\n📝 분석 텍스트: "${text}"`);
    console.log('─'.repeat(60));

    try {
      // NLP 분석 수행
      const analysis = await extractor.analyzeText(text);
      
      console.log('🔍 엔티티 추출:');
      analysis.entities.forEach((entity, index) => {
        console.log(`  ${index + 1}. ${entity.text} (${entity.label}) - 신뢰도: ${entity.confidence.toFixed(2)}`);
      });

      console.log('\n🔗 의존성 관계:');
      analysis.dependencies.forEach((dep, index) => {
        console.log(`  ${index + 1}. ${dep.token} --[${dep.relation}]--> ${dep.head}`);
      });

      console.log('\n🎭 의미 역할:');
      analysis.semanticRoles.forEach((role, index) => {
        console.log(`  ${index + 1}. 동사: ${role.predicate}`);
        if (role.agent) console.log(`      행위자: ${role.agent.text}`);
        if (role.patient) console.log(`      대상: ${role.patient.text}`);
        if (role.location) console.log(`      장소: ${role.location.text}`);
        if (role.time) console.log(`      시간: ${role.time.text}`);
      });

      console.log('\n🌐 관계 추출:');
      analysis.relationships.forEach((rel, index) => {
        console.log(`  ${index + 1}. ${rel.subject.text} --[${rel.predicate}]--> ${rel.object.text} (신뢰도: ${rel.confidence.toFixed(2)})`);
      });

      // RDF 트리플 생성
      const triples = await extractor.extractTriples(text, 'demo-model');
      console.log('\n🔺 RDF 트리플:');
      triples.forEach((triple, index) => {
        console.log(`  ${index + 1}. <${triple.subject}> <${triple.predicate}> <${triple.object}> (${triple.confidence?.toFixed(2)})`);
      });

      console.log(`\n📊 전체 분석 신뢰도: ${analysis.confidence.toFixed(2)}`);

    } catch (error) {
      console.error('❌ 분석 오류:', error);
    }
  }

  console.log('\n=== 데모 완료 ===');
}

// 데모 실행
if (require.main === module) {
  demonstrateAdvancedTripleExtraction()
    .then(() => {
      console.log('\n✅ 데모가 성공적으로 완료되었습니다.');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ 데모 실행 중 오류:', error);
      process.exit(1);
    });
}

export { demonstrateAdvancedTripleExtraction }; 