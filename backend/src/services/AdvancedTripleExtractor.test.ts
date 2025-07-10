import { AdvancedTripleExtractor, NLPAnalysis, Entity, Relationship } from './AdvancedTripleExtractor';

describe('AdvancedTripleExtractor', () => {
  let extractor: AdvancedTripleExtractor;

  beforeEach(() => {
    extractor = new AdvancedTripleExtractor();
  });

  describe('Named Entity Recognition (NER)', () => {
    it('한국어 개념을 정확히 추출해야 한다', async () => {
      const text = '머신러닝은 인공지능의 하위 분야로, 데이터로부터 패턴을 학습하는 알고리즘이다.';
      const analysis = await extractor.analyzeText(text);

      expect(analysis.entities.length).toBeGreaterThan(0);
      
      const concepts = analysis.entities.filter(e => e.label === 'CONCEPT');
      expect(concepts.length).toBeGreaterThan(0);
      
      // 머신러닝, 인공지능, 알고리즘 등이 추출되어야 함
      const conceptTexts = concepts.map(c => c.text);
      expect(conceptTexts).toContain('머신러닝');
      expect(conceptTexts).toContain('인공지능');
      expect(conceptTexts).toContain('알고리즘');
    });

    it('학술 용어를 정확히 식별해야 한다', async () => {
      const text = '딥러닝 이론은 신경망 아키텍처를 기반으로 한 학습 방법론이다.';
      const analysis = await extractor.analyzeText(text);

      const concepts = analysis.entities.filter(e => e.label === 'CONCEPT');
      const conceptTexts = concepts.map(c => c.text);
      
      expect(conceptTexts).toContain('딥러닝');
      expect(conceptTexts).toContain('이론');
      expect(conceptTexts).toContain('아키텍처');
      expect(conceptTexts).toContain('방법론');
    });

    it('엔티티에 올바른 URI를 할당해야 한다', async () => {
      const text = '자연어처리는 컴퓨터과학의 분야이다.';
      const analysis = await extractor.analyzeText(text);

      const concepts = analysis.entities.filter(e => e.label === 'CONCEPT');
      expect(concepts.length).toBeGreaterThan(0);
      
      concepts.forEach(concept => {
        expect(concept.uri).toBeDefined();
        expect(concept.uri).toMatch(/^habitus33:Concept_/);
      });
    });
  });

  describe('Dependency Parsing', () => {
    it('주어-동사-목적어 관계를 추출해야 한다', async () => {
      const text = '연구자가 데이터를 분석한다.';
      const analysis = await extractor.analyzeText(text);

      expect(analysis.dependencies.length).toBeGreaterThan(0);
      
      const subjectRels = analysis.dependencies.filter(d => d.relation === 'nsubj');
      const objectRels = analysis.dependencies.filter(d => d.relation === 'dobj');
      
      expect(subjectRels.length).toBeGreaterThan(0);
      expect(objectRels.length).toBeGreaterThan(0);
    });

    it('한국어 조사 패턴을 인식해야 한다', async () => {
      const text = '머신러닝은 데이터에서 패턴을 찾는다.';
      const analysis = await extractor.analyzeText(text);

      const dependencies = analysis.dependencies;
      expect(dependencies.length).toBeGreaterThan(0);
      
      // 토픽, 주어, 목적어 관계가 있어야 함
      const relations = dependencies.map(d => d.relation);
      expect(relations.some(r => ['topic', 'subject', 'object'].includes(r))).toBe(true);
    });
  });

  describe('Semantic Role Labeling (SRL)', () => {
    it('동사와 그 인수들을 식별해야 한다', async () => {
      const text = '개발자가 서울에서 시스템을 구현한다.';
      const analysis = await extractor.analyzeText(text);

      expect(analysis.semanticRoles.length).toBeGreaterThan(0);
      
      const role = analysis.semanticRoles[0];
      expect(role.predicate).toBeDefined();
      expect(role.agent || role.patient).toBeDefined();
    });

    it('시간과 장소 역할을 추출해야 한다', async () => {
      const text = '2024년에 연구팀이 실험실에서 실험을 진행했다.';
      const analysis = await extractor.analyzeText(text);

      const roles = analysis.semanticRoles;
      expect(roles.length).toBeGreaterThan(0);
      
      // 시간이나 장소 역할이 있는지 확인
      const hasTemporalOrLocation = roles.some(role => role.time || role.location);
      expect(hasTemporalOrLocation).toBe(true);
    });
  });

  describe('Relationship Extraction', () => {
    it('의미 역할 기반 관계를 추출해야 한다', async () => {
      const text = '프로그래머가 코드를 작성한다.';
      const analysis = await extractor.analyzeText(text);

      expect(analysis.relationships.length).toBeGreaterThan(0);
      
      const relationship = analysis.relationships[0];
      expect(relationship.subject).toBeDefined();
      expect(relationship.predicate).toBeDefined();
      expect(relationship.object).toBeDefined();
      expect(relationship.confidence).toBeGreaterThan(0);
    });

    it('관계에 적절한 신뢰도를 할당해야 한다', async () => {
      const text = '딥러닝은 머신러닝의 하위 분야이다.';
      const analysis = await extractor.analyzeText(text);

      analysis.relationships.forEach(rel => {
        expect(rel.confidence).toBeGreaterThan(0);
        expect(rel.confidence).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('RDF Triple Generation', () => {
    it('텍스트에서 유효한 RDF 트리플을 생성해야 한다', async () => {
      const text = '머신러닝은 인공지능의 하위 분야이며, 데이터 분석에 사용된다.';
      const triples = await extractor.extractTriples(text, 'test-model');

      expect(triples.length).toBeGreaterThan(0);
      
      triples.forEach(triple => {
        expect(triple.subject).toBeDefined();
        expect(triple.predicate).toBeDefined();
        expect(triple.object).toBeDefined();
        expect(triple.source).toBe('test-model');
        expect(triple.confidence).toBeGreaterThan(0);
      });
    });

    it('엔티티 타입 트리플을 생성해야 한다', async () => {
      const text = '자연어처리는 컴퓨터과학 분야이다.';
      const triples = await extractor.extractTriples(text, 'test-model');

      // rdf:type 트리플이 있어야 함
      const typeTriples = triples.filter(t => t.predicate === 'rdf:type');
      expect(typeTriples.length).toBeGreaterThan(0);
      
      // 라벨 트리플이 있어야 함
      const labelTriples = triples.filter(t => t.predicate === 'rdfs:label');
      expect(labelTriples.length).toBeGreaterThan(0);
    });

    it('한국어 라벨을 올바르게 생성해야 한다', async () => {
      const text = '기계학습은 데이터 기반 학습 방법이다.';
      const triples = await extractor.extractTriples(text, 'test-model');

      const labelTriples = triples.filter(t => t.predicate === 'rdfs:label');
      expect(labelTriples.length).toBeGreaterThan(0);
      
      // 한국어 언어 태그가 있어야 함
      labelTriples.forEach(triple => {
        expect(triple.object).toMatch(/@ko$/);
      });
    });

    it('중복 트리플을 제거해야 한다', async () => {
      const text = '머신러닝은 인공지능이다. 머신러닝은 인공지능이다.'; // 중복 문장
      const triples = await extractor.extractTriples(text, 'test-model');

      // 중복이 제거되었는지 확인
      const tripleStrings = triples.map(t => `${t.subject}_${t.predicate}_${t.object}`);
      const uniqueTriples = new Set(tripleStrings);
      expect(tripleStrings.length).toBe(uniqueTriples.size);
    });
  });

  describe('NLP Analysis Integration', () => {
    it('전체 NLP 분석이 일관된 결과를 제공해야 한다', async () => {
      const text = '연구자가 2024년에 서울에서 딥러닝 모델을 개발했다.';
      const analysis = await extractor.analyzeText(text);

      // 모든 구성 요소가 있어야 함
      expect(analysis.entities.length).toBeGreaterThan(0);
      expect(analysis.dependencies.length).toBeGreaterThan(0);
      expect(analysis.semanticRoles.length).toBeGreaterThan(0);
      expect(analysis.relationships.length).toBeGreaterThan(0);
      
      // 전체 신뢰도가 합리적이어야 함
      expect(analysis.confidence).toBeGreaterThan(0);
      expect(analysis.confidence).toBeLessThanOrEqual(1);
    });

    it('복잡한 문장을 처리할 수 있어야 한다', async () => {
      const text = `
        자연어처리는 컴퓨터과학과 언어학의 교차점에 있는 분야로,
        기계가 인간의 언어를 이해하고 생성할 수 있도록 하는 기술이다.
        딥러닝의 발전으로 자연어처리 성능이 크게 향상되었으며,
        특히 트랜스포머 아키텍처의 등장이 혁신적인 변화를 가져왔다.
      `;
      
      const analysis = await extractor.analyzeText(text);
      
      // 복잡한 텍스트에서도 의미있는 결과를 얻어야 함
      expect(analysis.entities.length).toBeGreaterThan(5);
      expect(analysis.relationships.length).toBeGreaterThan(0);
      expect(analysis.confidence).toBeGreaterThan(0.3);
    });

    it('빈 텍스트나 무의미한 텍스트를 적절히 처리해야 한다', async () => {
      const emptyText = '';
      const meaninglessText = '아아아 으으으 음음음';
      
      const emptyAnalysis = await extractor.analyzeText(emptyText);
      const meaninglessAnalysis = await extractor.analyzeText(meaninglessText);
      
      // 빈 텍스트는 빈 결과를 반환해야 함
      expect(emptyAnalysis.entities.length).toBe(0);
      expect(emptyAnalysis.relationships.length).toBe(0);
      
      // 무의미한 텍스트는 낮은 신뢰도를 가져야 함
      expect(meaninglessAnalysis.confidence).toBeLessThan(0.5);
    });
  });
}); 