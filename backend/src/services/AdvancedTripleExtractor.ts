import * as natural from 'natural';
const compromise = require('compromise');
import { NewKnowledgeTriple } from './ResponseHandler';
import { ContextBundle } from './ContextOrchestrator';

// NLP 분석 결과를 담는 인터페이스
export interface NLPAnalysis {
  entities: Entity[];
  relationships: Relationship[];
  dependencies: Dependency[];
  semanticRoles: SemanticRole[];
  confidence: number;
}

export interface Entity {
  text: string;
  label: string; // PERSON, ORG, CONCEPT, etc.
  startIndex: number;
  endIndex: number;
  confidence: number;
  uri?: string; // 온톨로지 URI
}

export interface Relationship {
  subject: Entity;
  predicate: string;
  object: Entity;
  confidence: number;
  context?: string;
}

export interface Dependency {
  token: string;
  head: string;
  relation: string; // nsubj, dobj, prep, etc.
  position: number;
}

export interface SemanticRole {
  predicate: string;
  agent?: Entity;    // ARG0 - 행위자
  patient?: Entity;  // ARG1 - 대상
  instrument?: Entity; // ARG2 - 도구
  location?: Entity;   // ARGM-LOC - 장소
  time?: Entity;       // ARGM-TMP - 시간
  manner?: Entity;     // ARGM-MNR - 방식
}

/**
 * 고급 NLP 기법을 사용한 RDF 트리플 추출 서비스
 * 
 * 기능:
 * 1. Named Entity Recognition (NER)
 * 2. Dependency Parsing
 * 3. Semantic Role Labeling (SRL)
 * 4. Knowledge Graph Alignment
 */
export class AdvancedTripleExtractor {
  private tokenizer: any;
  private stemmer: any;
  private posClassifier: any;

  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.stemmer = natural.PorterStemmer;
    this.posClassifier = new natural.BayesClassifier();
    this.initializeNLPModels();
  }

  /**
   * NLP 모델들을 초기화합니다.
   */
  private initializeNLPModels(): void {
    // POS 태거 초기화 (간단한 규칙 기반)
    // 실제 환경에서는 더 정교한 모델을 사용해야 합니다.
    console.log('AdvancedTripleExtractor initialized with NLP models');
  }

  /**
   * 텍스트에서 고급 NLP 분석을 수행합니다.
   */
  public async analyzeText(text: string): Promise<NLPAnalysis> {
    try {
      // 1. 토큰화 및 전처리
      const tokens = this.tokenizer.tokenize(text);
      const cleanText = this.preprocessText(text);

      // 2. Named Entity Recognition
      const entities = await this.extractEntities(cleanText);

      // 3. Dependency Parsing
      const dependencies = await this.parseDependencies(cleanText, tokens);

      // 4. Semantic Role Labeling
      const semanticRoles = await this.labelSemanticRoles(cleanText, entities);

      // 5. Relationship Extraction
      const relationships = await this.extractRelationships(entities, dependencies, semanticRoles);

      // 6. 전체 신뢰도 계산
      const confidence = this.calculateOverallConfidence(entities, relationships, dependencies);

      return {
        entities,
        relationships,
        dependencies,
        semanticRoles,
        confidence
      };
    } catch (error) {
      console.error('NLP 분석 중 오류 발생:', error);
      throw new Error(`NLP analysis failed: ${error}`);
    }
  }

  /**
   * 텍스트 전처리를 수행합니다.
   */
  private preprocessText(text: string): string {
    return text
      .trim()
      .replace(/\s+/g, ' ')                    // 중복 공백 제거
      .replace(/[""'']/g, '"')                 // 인용부호 정규화
      .replace(/[…]/g, '...')                  // 말줄임표 정규화
      .replace(/[–—]/g, '-');                  // 대시 정규화
  }

  /**
   * Named Entity Recognition을 수행합니다.
   */
  private async extractEntities(text: string): Promise<Entity[]> {
    const entities: Entity[] = [];

    try {
      // Compromise.js를 사용한 기본 NER
      const doc = compromise(text);
      
      // 사람 이름 추출
      const people = doc.people().out('array');
      people.forEach((person: string, index: number) => {
        const startIndex = text.indexOf(person);
        if (startIndex !== -1) {
          entities.push({
            text: person,
            label: 'PERSON',
            startIndex,
            endIndex: startIndex + person.length,
            confidence: 0.85,
            uri: `habitus33:Person_${this.generateEntityId(person)}`
          });
        }
      });

      // 장소 추출
      const places = doc.places().out('array');
      places.forEach((place: string) => {
        const startIndex = text.indexOf(place);
        if (startIndex !== -1) {
          entities.push({
            text: place,
            label: 'PLACE',
            startIndex,
            endIndex: startIndex + place.length,
            confidence: 0.80,
            uri: `habitus33:Place_${this.generateEntityId(place)}`
          });
        }
      });

      // 조직 추출
      const organizations = doc.organizations().out('array');
      organizations.forEach((org: string) => {
        const startIndex = text.indexOf(org);
        if (startIndex !== -1) {
          entities.push({
            text: org,
            label: 'ORGANIZATION',
            startIndex,
            endIndex: startIndex + org.length,
            confidence: 0.75,
            uri: `habitus33:Organization_${this.generateEntityId(org)}`
          });
        }
      });

      // 한국어 특화 개념 추출 (규칙 기반)
      entities.push(...this.extractKoreanConcepts(text));

      // 중복 제거 및 정렬
      return this.deduplicateEntities(entities);

    } catch (error) {
      console.error('Entity extraction 오류:', error);
      return [];
    }
  }

  /**
   * 한국어 특화 개념을 추출합니다.
   */
  private extractKoreanConcepts(text: string): Entity[] {
    const concepts: Entity[] = [];
    
    // 학술 개념 패턴
    const conceptPatterns = [
      /([가-힣]+(?:학|론|법|술|기법|방법|이론|원리|개념))/g,
      /([가-힣]+(?:시스템|모델|프레임워크|아키텍처))/g,
      /([가-힣]+(?:분석|평가|측정|검증|테스트))/g,
      /(인공지능|머신러닝|딥러닝|데이터|알고리즘)/g,
      /([가-힣]+(?:연구|개발|구현|설계|계획))/g
    ];

    conceptPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const concept = match[1] || match[0];
        concepts.push({
          text: concept,
          label: 'CONCEPT',
          startIndex: match.index,
          endIndex: match.index + concept.length,
          confidence: 0.70,
          uri: `habitus33:Concept_${this.generateEntityId(concept)}`
        });
      }
    });

    return concepts;
  }

  /**
   * Dependency Parsing을 수행합니다.
   */
  private async parseDependencies(text: string, tokens: string[]): Promise<Dependency[]> {
    const dependencies: Dependency[] = [];

    try {
      // Compromise.js를 사용한 기본 구문 분석
      const doc = compromise(text);
      const sentences = doc.sentences().out('array');

      sentences.forEach((sentence: string) => {
        const sentenceDoc = compromise(sentence);
        
        // 동사 추출
        const verbs = sentenceDoc.verbs().out('array');
        
        // 명사 추출 (주어, 목적어 역할)
        const nouns = sentenceDoc.nouns().out('array');

        // 간단한 주어-동사 관계 (첫 번째 명사가 주어)
        if (nouns.length > 0 && verbs.length > 0) {
          dependencies.push({
            token: nouns[0],
            head: verbs[0],
            relation: 'nsubj',
            position: sentence.indexOf(nouns[0])
          });
        }

        // 동사-목적어 관계 (두 번째 명사가 목적어)
        if (nouns.length > 1 && verbs.length > 0) {
          dependencies.push({
            token: nouns[1],
            head: verbs[0],
            relation: 'dobj',
            position: sentence.indexOf(nouns[1])
          });
        }

        // 한국어 특화 의존성 패턴
        dependencies.push(...this.extractKoreanDependencies(sentence));
      });

      return dependencies;

    } catch (error) {
      console.error('Dependency parsing 오류:', error);
      return [];
    }
  }

  /**
   * 한국어 특화 의존성을 추출합니다.
   */
  private extractKoreanDependencies(sentence: string): Dependency[] {
    const dependencies: Dependency[] = [];

    // 한국어 조사 패턴 분석
    const particlePatterns = [
      { pattern: /([가-힣]+)은\/는\s+([가-힣]+)/g, relation: 'topic' },
      { pattern: /([가-힣]+)이\/가\s+([가-힣]+)/g, relation: 'subject' },
      { pattern: /([가-힣]+)을\/를\s+([가-힣]+)/g, relation: 'object' },
      { pattern: /([가-힣]+)에서\s+([가-힣]+)/g, relation: 'location' },
      { pattern: /([가-힣]+)로\s+([가-힣]+)/g, relation: 'manner' }
    ];

    particlePatterns.forEach(({ pattern, relation }) => {
      let match;
      while ((match = pattern.exec(sentence)) !== null) {
        dependencies.push({
          token: match[1],
          head: match[2],
          relation,
          position: match.index
        });
      }
    });

    return dependencies;
  }

  /**
   * Semantic Role Labeling을 수행합니다.
   */
  private async labelSemanticRoles(text: string, entities: Entity[]): Promise<SemanticRole[]> {
    const semanticRoles: SemanticRole[] = [];

    try {
      const doc = compromise(text);
      const sentences = doc.sentences().out('array');

      sentences.forEach((sentence: string) => {
        const sentenceDoc = compromise(sentence);
        const verbs = sentenceDoc.verbs().out('array');
        const nouns = sentenceDoc.nouns().out('array');

        verbs.forEach((verb: string) => {
          const role: SemanticRole = {
            predicate: verb
          };

          // ARG0 (Agent) - 첫 번째 명사를 주어로 간주
          if (nouns.length > 0) {
            const agentEntity = this.findEntityByText(nouns[0], entities);
            if (agentEntity) {
              role.agent = agentEntity;
            }
          }

          // ARG1 (Patient) - 두 번째 명사를 목적어로 간주
          if (nouns.length > 1) {
            const patientEntity = this.findEntityByText(nouns[1], entities);
            if (patientEntity) {
              role.patient = patientEntity;
            }
          }

          // 위치, 시간, 방식 등의 부가 역할 추출
          this.extractAdditionalRoles(sentence, entities, role);

          if (role.agent || role.patient) {
            semanticRoles.push(role);
          }
        });
      });

      return semanticRoles;

    } catch (error) {
      console.error('Semantic role labeling 오류:', error);
      return [];
    }
  }

  /**
   * 추가적인 의미 역할을 추출합니다.
   */
  private extractAdditionalRoles(sentence: string, entities: Entity[], role: SemanticRole): void {
    // 시간 표현 추출
    const timePatterns = [
      /(\d{4}년)/g,
      /(오늘|어제|내일|지금|현재)/g,
      /([가-힣]+(?:시간|때|동안|기간))/g
    ];

    timePatterns.forEach(pattern => {
      const matches = sentence.match(pattern);
      if (matches) {
        const timeEntity = this.findEntityByText(matches[0], entities);
        if (timeEntity) {
          role.time = timeEntity;
        }
      }
    });

    // 장소 표현 추출
    const locationPatterns = [
      /([가-힣]+(?:에서|에|으로|로))/g
    ];

    locationPatterns.forEach(pattern => {
      const matches = sentence.match(pattern);
      if (matches) {
        const locationEntity = this.findEntityByText(matches[0].replace(/에서|에|으로|로/, ''), entities);
        if (locationEntity) {
          role.location = locationEntity;
        }
      }
    });
  }

  /**
   * 관계를 추출합니다.
   */
  private async extractRelationships(
    entities: Entity[], 
    dependencies: Dependency[], 
    semanticRoles: SemanticRole[]
  ): Promise<Relationship[]> {
    const relationships: Relationship[] = [];

    try {
      // 의미 역할 기반 관계 추출
      semanticRoles.forEach(role => {
        if (role.agent && role.patient) {
          relationships.push({
            subject: role.agent,
            predicate: this.normalizePredicateToURI(role.predicate),
            object: role.patient,
            confidence: 0.80,
            context: `semantic_role_${role.predicate}`
          });
        }

        // 부가 역할들도 관계로 변환
        if (role.agent && role.location) {
          relationships.push({
            subject: role.agent,
            predicate: 'habitus33:locatedAt',
            object: role.location,
            confidence: 0.70,
            context: 'location_role'
          });
        }

        if (role.agent && role.time) {
          relationships.push({
            subject: role.agent,
            predicate: 'habitus33:occurredAt',
            object: role.time,
            confidence: 0.70,
            context: 'temporal_role'
          });
        }
      });

      // 의존성 기반 관계 추출
      dependencies.forEach(dep => {
        const subjectEntity = this.findEntityByText(dep.token, entities);
        const objectEntity = this.findEntityByText(dep.head, entities);

        if (subjectEntity && objectEntity) {
          relationships.push({
            subject: subjectEntity,
            predicate: this.dependencyToURI(dep.relation),
            object: objectEntity,
            confidence: 0.65,
            context: `dependency_${dep.relation}`
          });
        }
      });

      // 중복 제거 및 신뢰도 기반 정렬
      return this.deduplicateRelationships(relationships);

    } catch (error) {
      console.error('Relationship extraction 오류:', error);
      return [];
    }
  }

  /**
   * RDF 트리플을 생성합니다.
   * 🎯 사용자 중심 지식 진화 추적을 위한 확장된 버전
   */
  public async extractTriples(
    text: string, 
    modelName: string = 'advanced-nlp',
    contextBundle?: ContextBundle
  ): Promise<NewKnowledgeTriple[]> {
    try {
      const analysis = await this.analyzeText(text);
      const triples: NewKnowledgeTriple[] = [];

      // 관계 기반 트리플 생성
      analysis.relationships.forEach(rel => {
        const baseTriple = {
          subject: rel.subject.uri || rel.subject.text,
          predicate: rel.predicate,
          object: rel.object.uri || rel.object.text,
          confidence: rel.confidence,
          source: modelName
        };
        
        triples.push(this.enrichTripleWithUserContext(baseTriple, contextBundle));
      });

      // 엔티티 타입 트리플 생성
      analysis.entities.forEach(entity => {
        if (entity.uri) {
          const typeTriple = {
            subject: entity.uri,
            predicate: 'rdf:type',
            object: `habitus33:${entity.label}`,
            confidence: entity.confidence,
            source: modelName
          };
          
          triples.push(this.enrichTripleWithUserContext(typeTriple, contextBundle));

          // 라벨 트리플 추가
          const labelTriple = {
            subject: entity.uri,
            predicate: 'rdfs:label',
            object: `"${entity.text}"@ko`,
            confidence: entity.confidence,
            source: modelName
          };
          
          triples.push(this.enrichTripleWithUserContext(labelTriple, contextBundle));
        }
      });

      return triples;

    } catch (error) {
      console.error('Triple extraction 오류:', error);
      return [];
    }
  }

  /**
   * 🎯 트리플에 사용자 맥락 정보를 추가합니다.
   * AdvancedTripleExtractor에서 추출된 트리플에 대해 사용자 중심 추적 정보를 설정합니다.
   */
  private enrichTripleWithUserContext(
    triple: Partial<NewKnowledgeTriple>, 
    contextBundle?: ContextBundle
  ): NewKnowledgeTriple {
    const enriched: NewKnowledgeTriple = {
      subject: triple.subject || '',
      predicate: triple.predicate || '',
      object: triple.object || '',
      confidence: triple.confidence || 0.7,
      source: triple.source || 'advanced-nlp',
      sourceType: 'ai_assisted', // NLP 추출은 기본적으로 AI 보조
      derivedFromUser: false,
      evolutionStage: 'initial',
      temporalContext: new Date().toISOString()
    };

    if (contextBundle) {
      const userMemos = contextBundle.relevantNotes || [];
      
      if (userMemos.length > 0) {
        // 고급 NLP로 추출된 엔티티가 사용자 메모에 있는지 확인
        const subjectInMemos = this.findTextInMemos(
          triple.subject?.replace(/^habitus33:/, '').replace(/_/g, ' ') || '', 
          userMemos
        );
        const objectInMemos = this.findTextInMemos(
          triple.object?.replace(/^habitus33:/, '').replace(/_/g, ' ') || '', 
          userMemos
        );

        if (subjectInMemos && objectInMemos) {
          // 양쪽 엔티티 모두 사용자 메모에서 발견 = 사용자 순수 연결
          enriched.sourceType = 'user_organic';
          enriched.derivedFromUser = true;
          enriched.confidence = Math.min((enriched.confidence || 0.7) + 0.25, 0.95); // 높은 신뢰도
          enriched.evolutionStage = 'synthesized'; // NLP가 사용자 메모 간 연결을 합성
          enriched.originalMemoId = `memo_${userMemos.indexOf(subjectInMemos)}`;
        } else if (subjectInMemos || objectInMemos) {
          // 한쪽만 사용자 메모에 있음 = 부분적으로 사용자 기반
          enriched.sourceType = 'ai_assisted';
          enriched.derivedFromUser = true;
          enriched.confidence = Math.min((enriched.confidence || 0.7) + 0.15, 0.85); // 중간 신뢰도
          enriched.evolutionStage = 'gap_filled'; // 지식 공백을 NLP가 채움
        }
      }
    }

    return enriched;
  }

  /**
   * 텍스트가 사용자 메모에 포함되어 있는지 확인합니다.
   */
  private findTextInMemos(searchText: string, memos: any[]): any | null {
    if (!searchText || searchText.trim().length < 2) {
      return null;
    }
    
    return memos.find(memo => 
      memo.content.toLowerCase().includes(searchText.toLowerCase()) ||
      searchText.toLowerCase().includes(memo.content.toLowerCase())
    ) || null;
  }

  // === 유틸리티 메서드들 ===

  private generateEntityId(text: string): string {
    return text.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_가-힣]/g, '');
  }

  private findEntityByText(text: string, entities: Entity[]): Entity | undefined {
    return entities.find(entity => 
      entity.text === text || 
      entity.text.includes(text) || 
      text.includes(entity.text)
    );
  }

  private normalizePredicateToURI(predicate: string): string {
    const predicateMap: { [key: string]: string } = {
      '개발': 'habitus33:develops',
      '구현': 'habitus33:implements',
      '설명': 'habitus33:explains',
      '분석': 'habitus33:analyzes',
      '연구': 'habitus33:researches',
      '학습': 'habitus33:learns',
      '사용': 'habitus33:uses',
      '적용': 'habitus33:applies',
      '생성': 'habitus33:creates',
      '제공': 'habitus33:provides'
    };

    return predicateMap[predicate] || `habitus33:${predicate}`;
  }

  private dependencyToURI(relation: string): string {
    const relationMap: { [key: string]: string } = {
      'nsubj': 'habitus33:hasSubject',
      'dobj': 'habitus33:hasObject',
      'topic': 'habitus33:hasTopic',
      'subject': 'habitus33:hasSubject',
      'object': 'habitus33:hasObject',
      'location': 'habitus33:locatedAt',
      'manner': 'habitus33:performedBy'
    };

    return relationMap[relation] || `habitus33:${relation}`;
  }

  private deduplicateEntities(entities: Entity[]): Entity[] {
    const seen = new Set<string>();
    return entities.filter(entity => {
      const key = `${entity.text}_${entity.label}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    }).sort((a, b) => a.startIndex - b.startIndex);
  }

  private deduplicateRelationships(relationships: Relationship[]): Relationship[] {
    const seen = new Set<string>();
    return relationships.filter(rel => {
      const key = `${rel.subject.text}_${rel.predicate}_${rel.object.text}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    }).sort((a, b) => b.confidence - a.confidence);
  }

  private calculateOverallConfidence(
    entities: Entity[], 
    relationships: Relationship[], 
    dependencies: Dependency[]
  ): number {
    if (entities.length === 0 && relationships.length === 0) {
      return 0.0;
    }

    const entityConfidence = entities.reduce((sum, e) => sum + e.confidence, 0) / Math.max(entities.length, 1);
    const relationshipConfidence = relationships.reduce((sum, r) => sum + r.confidence, 0) / Math.max(relationships.length, 1);
    const dependencyBonus = Math.min(dependencies.length * 0.05, 0.2); // 의존성이 많을수록 신뢰도 증가

    return Math.min((entityConfidence + relationshipConfidence) / 2 + dependencyBonus, 1.0);
  }
} 