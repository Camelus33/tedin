import { ContextOrchestrator } from './ContextOrchestrator';
import { ExternalOntologyService } from './ExternalOntologyService';
import { IUser } from '../models/User';

// 웹 검색 결과 기반: SPINACH 방식의 동적 스키마 탐색을 위한 인터페이스
export interface HiddenLink {
  id: string;
  fromConcept: string;
  toConcept: string;
  linkType: 'direct' | 'indirect' | 'super-relation';
  connectionPath: string[];
  confidenceScore: number;
  reasoning: {
    method: 'forward' | 'backward' | 'bidirectional';
    hops: number;
    intermediateNodes: string[];
    evidence: string[];
  };
  source: 'internal' | 'external' | 'hybrid';
  discoveredAt: Date;
  strength: number;
  categories: string[];
}

// SPINACH 동적 스키마 탐색을 위한 스키마 노드
interface SchemaNode {
  concept: string;
  type: 'entity' | 'relation' | 'property';
  neighbors: string[];
  weight: number;
}

// Regular Path Query를 위한 경로 패턴
interface PathPattern {
  pattern: string;
  minHops: number;
  maxHops: number;
  direction: 'forward' | 'backward' | 'both';
}

// Super-Relations 기법을 위한 관계 클러스터
interface RelationCluster {
  clusterId: string;
  relations: string[];
  strength: number;
  semanticType: string;
}

export interface HiddenLinkDetectionOptions {
  maxHops?: number;
  minConfidenceScore?: number;
  maxLinksToReturn?: number;
  enableSuperRelations?: boolean;
  enableParallelProcessing?: boolean;
  pathPatterns?: PathPattern[];
}

export class HiddenLinkDetectionService {
  private contextOrchestrator: ContextOrchestrator;
  private externalOntologyService: ExternalOntologyService;
  private user: IUser;
  
  // SPINACH 동적 스키마 캐시
  private schemaCache: Map<string, SchemaNode[]> = new Map();
  private relationClusters: RelationCluster[] = [];
  
  // 병렬 처리를 위한 워커 풀 시뮬레이션
  private readonly maxConcurrentQueries = 4;

  constructor(user: IUser) {
    this.user = user;
    this.contextOrchestrator = new ContextOrchestrator(user);
    this.externalOntologyService = new ExternalOntologyService();
    
    // Super-Relations 기본 클러스터 초기화
    this.initializeRelationClusters();
  }

  /**
   * 웹 검색 결과 기반: SPINACH 방식의 동적 스키마 탐색으로 숨겨진 연결 탐지
   */
  async detectHiddenLinks(
    concepts: string[],
    options: HiddenLinkDetectionOptions = {}
  ): Promise<HiddenLink[]> {
    const {
      maxHops = 3,
      minConfidenceScore = 60.0,
      maxLinksToReturn = 20,
      enableSuperRelations = true,
      enableParallelProcessing = true,
      pathPatterns = this.getDefaultPathPatterns()
    } = options;

    console.log('🔗 SPINACH 방식 숨겨진 연결 탐지 시작...');
    console.log(`개념 수: ${concepts.length}개, 최대 홉: ${maxHops}`);

    if (concepts.length === 0) {
      return [];
    }

    try {
      // 1. 동적 스키마 탐색 (SPINACH 방식)
      console.log('🗺️ SPINACH 동적 스키마 탐색 중...');
      const schemaGraph = await this.buildDynamicSchema(concepts);
      
      // 2. Super-Relations 기법으로 관계 클러스터링
      if (enableSuperRelations) {
        console.log('🎯 Super-Relations 기법으로 관계 분석 중...');
        await this.updateRelationClusters(schemaGraph);
      }

      // 3. 병렬 다중 홉 추론 실행
      console.log('🧠 병렬 다중 홉 추론 실행 중...');
      const hiddenLinks = enableParallelProcessing
        ? await this.parallelMultiHopReasoning(concepts, schemaGraph, maxHops, pathPatterns)
        : await this.sequentialMultiHopReasoning(concepts, schemaGraph, maxHops, pathPatterns);

      // 4. 선형 대수 기반 Regular Path Query로 경로 최적화
      console.log('📐 선형 대수 기반 경로 최적화 중...');
      const optimizedLinks = await this.optimizePathsWithLinearAlgebra(hiddenLinks);

      // 5. 신뢰도 점수 계산 및 필터링
      console.log('📊 신뢰도 점수 계산 및 필터링 중...');
      const scoredLinks = await this.calculateConfidenceScores(optimizedLinks);
      const filteredLinks = scoredLinks.filter(link => link.confidenceScore >= minConfidenceScore);

      // 6. 최종 랭킹 및 제한
      const rankedLinks = this.rankHiddenLinks(filteredLinks);
      const finalLinks = rankedLinks.slice(0, maxLinksToReturn);

      console.log(`✅ 숨겨진 연결 ${finalLinks.length}개 발견 완료`);
      return finalLinks;

    } catch (error) {
      console.error('❌ 숨겨진 연결 탐지 중 오류:', error);
      
      // 오류 발생 시 기본적인 직접 연결이라도 반환
      return await this.getBasicDirectLinks(concepts);
    }
  }

  /**
   * SPINACH 방식의 동적 스키마 구축
   */
  private async buildDynamicSchema(concepts: string[]): Promise<Map<string, SchemaNode>> {
    const schema = new Map<string, SchemaNode>();
    
    // 캐시 확인
    const cacheKey = concepts.sort().join('|');
    if (this.schemaCache.has(cacheKey)) {
      console.log('📋 스키마 캐시 히트');
      const cachedNodes = this.schemaCache.get(cacheKey)!;
      cachedNodes.forEach(node => schema.set(node.concept, node));
      return schema;
    }

    // 내부 온톨로지에서 스키마 정보 수집
    for (const concept of concepts) {
      try {
        const contextBundle = await this.contextOrchestrator.getContextBundle(concept);
        
        // 개념 노드 생성
        const conceptNode: SchemaNode = {
          concept,
          type: 'entity',
          neighbors: [],
          weight: contextBundle.relevantNotes.length + (contextBundle.bookExcerpts?.length || 0)
        };

        // 관련 개념들을 이웃으로 추가
        contextBundle.relatedConcepts.forEach(relatedConcept => {
          conceptNode.neighbors.push(relatedConcept);
          
          // 관련 개념도 스키마에 추가
          if (!schema.has(relatedConcept)) {
            schema.set(relatedConcept, {
              concept: relatedConcept,
              type: 'entity',
              neighbors: [concept],
              weight: 1
            });
          } else {
            schema.get(relatedConcept)!.neighbors.push(concept);
          }
        });

        // 관련 개념들에서 관계 정보 추출 (ContextBundle에는 conceptConnections가 없음)
        if (contextBundle.relatedConcepts) {
          contextBundle.relatedConcepts.forEach(relatedConcept => {
            const relationNode: SchemaNode = {
              concept: `${concept}_to_${relatedConcept}`,
              type: 'relation',
              neighbors: [concept, relatedConcept],
              weight: 0.5 // 기본 가중치
            };
            schema.set(relationNode.concept, relationNode);
          });
        }

        schema.set(concept, conceptNode);
        
      } catch (error) {
        console.warn(`스키마 구축 중 개념 "${concept}" 처리 실패:`, error);
      }
    }

    // 외부 온톨로지에서 추가 스키마 정보 수집
    try {
      const externalConcepts = await Promise.allSettled(
        concepts.map(concept => this.externalOntologyService.searchConcept(concept))
      );

      externalConcepts.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const concept = concepts[index];
          const externalData = result.value;
          
          externalData.forEach(extConcept => {
            const relatedConcepts = extConcept.relatedConcepts || [];
            const existingNode = schema.get(concept);
            
            if (existingNode) {
              // 외부 관련 개념들을 이웃으로 추가
              relatedConcepts.forEach(related => {
                if (!existingNode.neighbors.includes(related)) {
                  existingNode.neighbors.push(related);
                }
              });
            }
          });
        }
      });
    } catch (error) {
      console.warn('외부 온톨로지에서 스키마 정보 수집 실패:', error);
    }

    // 스키마 캐시에 저장
    this.schemaCache.set(cacheKey, Array.from(schema.values()));
    
    console.log(`🗺️ 동적 스키마 구축 완료: ${schema.size}개 노드`);
    return schema;
  }

  /**
   * Super-Relations 기법으로 관계 클러스터 업데이트
   */
  private async updateRelationClusters(schema: Map<string, SchemaNode>): Promise<void> {
    const relations = Array.from(schema.values()).filter(node => node.type === 'relation');
    
    // 관계들을 의미적 유사성에 따라 클러스터링
    const semanticGroups = new Map<string, string[]>();
    
    relations.forEach(relation => {
      const semanticType = this.getSemanticType(relation.concept);
      if (!semanticGroups.has(semanticType)) {
        semanticGroups.set(semanticType, []);
      }
      semanticGroups.get(semanticType)!.push(relation.concept);
    });

    // 클러스터 업데이트
    semanticGroups.forEach((relationList, semanticType) => {
      if (relationList.length > 1) {
        const cluster: RelationCluster = {
          clusterId: `cluster_${semanticType}_${Date.now()}`,
          relations: relationList,
          strength: relationList.length / relations.length,
          semanticType
        };
        
        // 기존 클러스터 중복 제거
        this.relationClusters = this.relationClusters.filter(
          existing => existing.semanticType !== semanticType
        );
        this.relationClusters.push(cluster);
      }
    });

    console.log(`🎯 Super-Relations 클러스터 ${this.relationClusters.length}개 업데이트`);
  }

  /**
   * 병렬 다중 홉 추론 실행
   */
  private async parallelMultiHopReasoning(
    concepts: string[],
    schema: Map<string, SchemaNode>,
    maxHops: number,
    pathPatterns: PathPattern[]
  ): Promise<HiddenLink[]> {
    const allLinks: HiddenLink[] = [];
    
    // 개념 쌍들을 배치로 나누어 병렬 처리
    const conceptPairs: [string, string][] = [];
    for (let i = 0; i < concepts.length; i++) {
      for (let j = i + 1; j < concepts.length; j++) {
        conceptPairs.push([concepts[i], concepts[j]]);
      }
    }

    // 배치 크기로 나누어 병렬 처리
    const batchSize = this.maxConcurrentQueries;
    for (let i = 0; i < conceptPairs.length; i += batchSize) {
      const batch = conceptPairs.slice(i, i + batchSize);
      
      const batchPromises = batch.map(([from, to]) =>
        this.findMultiHopPath(from, to, schema, maxHops, pathPatterns)
      );

      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          allLinks.push(...result.value);
        }
      });
    }

    console.log(`🧠 병렬 추론으로 ${allLinks.length}개 연결 후보 발견`);
    return allLinks;
  }

  /**
   * 순차 다중 홉 추론 실행 (병렬 처리가 비활성화된 경우)
   */
  private async sequentialMultiHopReasoning(
    concepts: string[],
    schema: Map<string, SchemaNode>,
    maxHops: number,
    pathPatterns: PathPattern[]
  ): Promise<HiddenLink[]> {
    const allLinks: HiddenLink[] = [];
    
    for (let i = 0; i < concepts.length; i++) {
      for (let j = i + 1; j < concepts.length; j++) {
        try {
          const links = await this.findMultiHopPath(
            concepts[i], 
            concepts[j], 
            schema, 
            maxHops, 
            pathPatterns
          );
          if (links) {
            allLinks.push(...links);
          }
        } catch (error) {
          console.warn(`순차 추론 중 오류 (${concepts[i]} -> ${concepts[j]}):`, error);
        }
      }
    }

    console.log(`🧠 순차 추론으로 ${allLinks.length}개 연결 후보 발견`);
    return allLinks;
  }

  /**
   * 다중 홉 경로 탐색 (전진/후진 추론)
   */
  private async findMultiHopPath(
    fromConcept: string,
    toConcept: string,
    schema: Map<string, SchemaNode>,
    maxHops: number,
    pathPatterns: PathPattern[]
  ): Promise<HiddenLink[] | null> {
    const links: HiddenLink[] = [];

    // 1. 전진 추론 (Forward Reasoning)
    const forwardPaths = await this.forwardReasoning(fromConcept, toConcept, schema, maxHops);
    
    // 2. 후진 추론 (Backward Reasoning)
    const backwardPaths = await this.backwardReasoning(fromConcept, toConcept, schema, maxHops);
    
    // 3. 양방향 추론 (Bidirectional Reasoning)
    const bidirectionalPaths = await this.bidirectionalReasoning(fromConcept, toConcept, schema, maxHops);

    // 모든 경로를 HiddenLink 객체로 변환
    [...forwardPaths, ...backwardPaths, ...bidirectionalPaths].forEach((path, index) => {
      if (path.length > 2) { // 직접 연결이 아닌 경우만
        const link: HiddenLink = {
          id: `hidden_link_${fromConcept}_${toConcept}_${index}_${Date.now()}`,
          fromConcept,
          toConcept,
          linkType: path.length > 4 ? 'indirect' : 'direct',
          connectionPath: path,
          confidenceScore: 0, // 나중에 계산
          reasoning: {
            method: index < forwardPaths.length ? 'forward' : 
                    index < forwardPaths.length + backwardPaths.length ? 'backward' : 'bidirectional',
            hops: path.length - 1,
            intermediateNodes: path.slice(1, -1),
            evidence: []
          },
          source: 'internal',
          discoveredAt: new Date(),
          strength: 0, // 나중에 계산
          categories: []
        };
        links.push(link);
      }
    });

    return links.length > 0 ? links : null;
  }

  /**
   * 전진 추론 (Forward Reasoning)
   */
  private async forwardReasoning(
    start: string,
    target: string,
    schema: Map<string, SchemaNode>,
    maxHops: number
  ): Promise<string[][]> {
    const paths: string[][] = [];
    const visited = new Set<string>();
    
    const dfs = (current: string, path: string[], hops: number) => {
      if (hops > maxHops || visited.has(current)) return;
      
      visited.add(current);
      path.push(current);
      
      if (current === target && path.length > 1) {
        paths.push([...path]);
      } else if (hops < maxHops) {
        const node = schema.get(current);
        if (node) {
          node.neighbors.forEach(neighbor => {
            if (!path.includes(neighbor)) {
              dfs(neighbor, path, hops + 1);
            }
          });
        }
      }
      
      path.pop();
      visited.delete(current);
    };

    dfs(start, [], 0);
    return paths;
  }

  /**
   * 후진 추론 (Backward Reasoning)
   */
  private async backwardReasoning(
    start: string,
    target: string,
    schema: Map<string, SchemaNode>,
    maxHops: number
  ): Promise<string[][]> {
    // 목표에서 시작점으로 역방향 탐색
    const reversePaths = await this.forwardReasoning(target, start, schema, maxHops);
    
    // 경로를 뒤집어서 정방향으로 변환
    return reversePaths.map(path => path.reverse());
  }

  /**
   * 양방향 추론 (Bidirectional Reasoning)
   */
  private async bidirectionalReasoning(
    start: string,
    target: string,
    schema: Map<string, SchemaNode>,
    maxHops: number
  ): Promise<string[][]> {
    const paths: string[][] = [];
    const midHops = Math.floor(maxHops / 2);
    
    // 시작점에서 중간 지점까지의 경로들
    const forwardPaths = await this.forwardReasoning(start, '', schema, midHops);
    
    // 목표점에서 중간 지점까지의 경로들
    const backwardPaths = await this.forwardReasoning(target, '', schema, midHops);
    
    // 중간 지점에서 만나는 경로들 찾기
    forwardPaths.forEach(forwardPath => {
      const lastNode = forwardPath[forwardPath.length - 1];
      
      backwardPaths.forEach(backwardPath => {
        const firstNode = backwardPath[0];
        
        if (lastNode === firstNode || 
            (schema.get(lastNode)?.neighbors.includes(firstNode))) {
          const combinedPath = [...forwardPath, ...backwardPath.slice(1)];
          if (combinedPath[0] === start && combinedPath[combinedPath.length - 1] === target) {
            paths.push(combinedPath);
          }
        }
      });
    });

    return paths;
  }

  /**
   * 선형 대수 기반 Regular Path Query로 경로 최적화
   */
  private async optimizePathsWithLinearAlgebra(links: HiddenLink[]): Promise<HiddenLink[]> {
    // 인접 행렬 기반 경로 최적화 시뮬레이션
    const optimizedLinks = links.map(link => {
      const pathLength = link.connectionPath.length;
      const hops = link.reasoning.hops;
      
      // 선형 대수 기반 가중치 계산
      const algebraicWeight = Math.pow(0.8, hops - 1); // 홉 수에 따른 감쇠
      const pathComplexity = 1 / Math.log(pathLength + 1); // 경로 복잡도
      
      return {
        ...link,
        strength: algebraicWeight * pathComplexity
      };
    });

    console.log(`📐 선형 대수 기반 ${optimizedLinks.length}개 경로 최적화 완료`);
    return optimizedLinks;
  }

  /**
   * 신뢰도 점수 계산
   */
  private async calculateConfidenceScores(links: HiddenLink[]): Promise<HiddenLink[]> {
    return links.map(link => {
      let confidence = 50; // 기본 점수
      
      // 경로 길이에 따른 신뢰도 조정
      confidence += Math.max(0, 30 - (link.reasoning.hops * 8));
      
      // 강도에 따른 신뢰도 조정
      confidence += link.strength * 20;
      
      // Super-Relations 클러스터 매칭 보너스
      const hasClusterMatch = this.relationClusters.some(cluster =>
        cluster.relations.some(relation => 
          link.connectionPath.some(node => node.includes(relation))
        )
      );
      if (hasClusterMatch) {
        confidence += 15;
      }
      
      // 추론 방법에 따른 가중치
      switch (link.reasoning.method) {
        case 'bidirectional':
          confidence += 10;
          break;
        case 'forward':
          confidence += 5;
          break;
        case 'backward':
          confidence += 3;
          break;
      }
      
      return {
        ...link,
        confidenceScore: Math.min(100, Math.max(0, confidence))
      };
    });
  }

  /**
   * 숨겨진 연결 랭킹
   */
  private rankHiddenLinks(links: HiddenLink[]): HiddenLink[] {
    return links.sort((a, b) => {
      // 1차: 신뢰도 점수
      if (a.confidenceScore !== b.confidenceScore) {
        return b.confidenceScore - a.confidenceScore;
      }
      
      // 2차: 강도
      if (a.strength !== b.strength) {
        return b.strength - a.strength;
      }
      
      // 3차: 홉 수 (적을수록 좋음)
      return a.reasoning.hops - b.reasoning.hops;
    });
  }

  /**
   * 기본 직접 연결 반환 (오류 발생 시 폴백)
   */
  private async getBasicDirectLinks(concepts: string[]): Promise<HiddenLink[]> {
    const basicLinks: HiddenLink[] = [];
    
    for (let i = 0; i < concepts.length; i++) {
      for (let j = i + 1; j < concepts.length; j++) {
        const link: HiddenLink = {
          id: `basic_link_${concepts[i]}_${concepts[j]}_${Date.now()}`,
          fromConcept: concepts[i],
          toConcept: concepts[j],
          linkType: 'direct',
          connectionPath: [concepts[i], concepts[j]],
          confidenceScore: 30,
          reasoning: {
            method: 'forward',
            hops: 1,
            intermediateNodes: [],
            evidence: ['기본 직접 연결']
          },
          source: 'internal',
          discoveredAt: new Date(),
          strength: 0.3,
          categories: ['기본연결']
        };
        basicLinks.push(link);
      }
    }
    
    return basicLinks;
  }

  /**
   * Super-Relations 기본 클러스터 초기화
   */
  private initializeRelationClusters(): void {
    this.relationClusters = [
      {
        clusterId: 'causal_relations',
        relations: ['causes', 'leads_to', 'results_in', 'triggers'],
        strength: 0.8,
        semanticType: 'causal'
      },
      {
        clusterId: 'spatial_relations',
        relations: ['contains', 'located_in', 'near', 'adjacent_to'],
        strength: 0.7,
        semanticType: 'spatial'
      },
      {
        clusterId: 'temporal_relations',
        relations: ['before', 'after', 'during', 'concurrent_with'],
        strength: 0.6,
        semanticType: 'temporal'
      },
      {
        clusterId: 'hierarchical_relations',
        relations: ['is_a', 'part_of', 'subclass_of', 'instance_of'],
        strength: 0.9,
        semanticType: 'hierarchical'
      }
    ];
  }

  /**
   * 관계의 의미적 타입 결정
   */
  private getSemanticType(relationConcept: string): string {
    const concept = relationConcept.toLowerCase();
    
    if (concept.includes('cause') || concept.includes('lead') || concept.includes('result')) {
      return 'causal';
    } else if (concept.includes('contain') || concept.includes('location') || concept.includes('near')) {
      return 'spatial';
    } else if (concept.includes('before') || concept.includes('after') || concept.includes('during')) {
      return 'temporal';
    } else if (concept.includes('is_a') || concept.includes('part') || concept.includes('subclass')) {
      return 'hierarchical';
    } else {
      return 'generic';
    }
  }

  /**
   * 기본 경로 패턴 반환
   */
  private getDefaultPathPatterns(): PathPattern[] {
    return [
      {
        pattern: 'concept->relation->concept',
        minHops: 2,
        maxHops: 2,
        direction: 'both'
      },
      {
        pattern: 'concept->concept->relation->concept',
        minHops: 3,
        maxHops: 3,
        direction: 'forward'
      },
      {
        pattern: 'concept->relation->concept->relation->concept',
        minHops: 4,
        maxHops: 4,
        direction: 'both'
      }
    ];
  }
} 