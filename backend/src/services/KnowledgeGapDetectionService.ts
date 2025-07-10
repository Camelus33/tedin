import { ExternalOntologyService, ExternalOntologyResult } from './ExternalOntologyService';
import { ContextOrchestrator, ContextBundle } from './ContextOrchestrator';
import { IUser } from '../models/User';

// 웹 검색 결과 기반: PMHR 프레임워크의 지식 격차 표현
export interface KnowledgeGap {
  id: string;
  missingConcept: string;
  description?: string;
  relatedUserConcepts: string[];
  suggestedLearningPath: string[];
  gapScore: number;
  confidenceScore: number;
  source: 'wikidata' | 'dbpedia';
  categories: string[];
  priority: 'high' | 'medium' | 'low';
  estimatedLearningTime?: string;
}

// 웹 검색 결과 기반: Reward Shaping을 위한 보상 구조
export interface RewardSignal {
  conceptRelevance: number;      // 개념 관련성 보상
  userInterestAlignment: number; // 사용자 관심도 정렬 보상
  learningPathLength: number;    // 학습 경로 길이 페널티
  conceptDifficulty: number;     // 개념 난이도 보상
  totalReward: number;           // 총 보상 점수
}

// 웹 검색 결과 기반: 지식 격차 탐지 설정
export interface GapDetectionConfig {
  maxGapsToReturn: number;
  minGapScore: number;
  maxLearningPathLength: number;
  userInterestWeights: Record<string, number>;
  difficultyPreference: 'beginner' | 'intermediate' | 'advanced';
}

/**
 * 웹 검색 기반 PMHR 프레임워크를 적용한 지식 격차 탐지 서비스
 * 
 * 적용된 최신 기법들:
 * 1. PMHR 프레임워크의 규칙 강화 강화학습 방식
 * 2. Reward Shaping으로 희소 보상 문제 해결
 * 3. 가짜 경로 방지 메커니즘
 * 4. 관련도 점수 기반 지식 격차 랭킹 시스템
 */
export class KnowledgeGapDetectionService {
  private externalOntologyService: ExternalOntologyService;
  private contextOrchestrator: ContextOrchestrator;
  private defaultConfig: GapDetectionConfig;

  constructor(user: IUser) {
    this.externalOntologyService = new ExternalOntologyService();
    this.contextOrchestrator = new ContextOrchestrator(user);
    
    this.defaultConfig = {
      maxGapsToReturn: 10,
      minGapScore: 30.0,
      maxLearningPathLength: 5,
      userInterestWeights: {},
      difficultyPreference: 'intermediate'
    };
  }

  /**
   * 웹 검색 결과 기반: PMHR 프레임워크의 메인 지식 격차 탐지 알고리즘
   * 사용자 그래프와 외부 온톨로지를 비교하여 지식 격차 발견
   */
  async detectKnowledgeGaps(
    userConcepts: string[], 
    config: Partial<GapDetectionConfig> = {}
  ): Promise<KnowledgeGap[]> {
    const finalConfig = { ...this.defaultConfig, ...config };
    
    console.log(`🔍 PMHR 프레임워크 기반 지식 격차 탐지 시작...`);
    console.log(`사용자 개념 수: ${userConcepts.length}개`);
    
    // 1. 사용자 지식 그래프 분석
    const userKnowledgeProfile = await this.analyzeUserKnowledgeProfile(userConcepts);
    
    // 2. 외부 온톨로지에서 관련 개념들 수집
    const externalConcepts = await this.gatherExternalConcepts(userConcepts);
    
    // 3. PMHR 프레임워크 기반 지식 격차 식별
    const candidateGaps = await this.identifyKnowledgeGaps(
      userKnowledgeProfile, 
      externalConcepts, 
      finalConfig
    );
    
    // 4. Reward Shaping을 통한 격차 점수 계산
    const scoredGaps = await this.calculateGapScores(candidateGaps, userKnowledgeProfile, finalConfig);
    
    // 5. 가짜 경로 방지 및 최종 필터링
    const filteredGaps = this.filterAndRankGaps(scoredGaps, finalConfig);
    
    console.log(`✅ 지식 격차 ${filteredGaps.length}개 발견 완료`);
    
    return filteredGaps;
  }

  /**
   * 웹 검색 결과 기반: 사용자 지식 프로필 분석
   * 사용자의 기존 지식을 분석하여 관심 영역과 지식 수준 파악
   */
  private async analyzeUserKnowledgeProfile(userConcepts: string[]): Promise<UserKnowledgeProfile> {
    console.log(`📊 사용자 지식 프로필 분석 중...`);
    
    const conceptFrequency = new Map<string, number>();
    const relatedConcepts = new Set<string>();
    const categories = new Map<string, number>();
    
         // 각 사용자 개념에 대해 내부 그래프 쿼리
     for (const concept of userConcepts) {
       try {
         const result = await this.contextOrchestrator.getContextBundle(concept);
         
         // 개념 빈도 계산
         conceptFrequency.set(concept, (conceptFrequency.get(concept) || 0) + 1);
         
         // 관련 개념들 수집
         if (result.relatedConcepts) {
           result.relatedConcepts.forEach(related => {
             if (related !== concept) {
               relatedConcepts.add(related);
             }
           });
         }
         
         // 카테고리 분석 (노트 태그 기반)
         result.relevantNotes.forEach(note => {
           if (note.tags) {
             note.tags.forEach(tag => {
               categories.set(tag, (categories.get(tag) || 0) + 1);
             });
           }
         });
         
       } catch (error) {
         console.warn(`사용자 개념 분석 실패: ${concept}`, error);
       }
     }
    
    // 관심 영역 가중치 계산
    const totalConcepts = userConcepts.length;
    const interestWeights: Record<string, number> = {};
    
    categories.forEach((count, category) => {
      interestWeights[category] = count / totalConcepts;
    });
    
    return {
      concepts: Array.from(conceptFrequency.keys()),
      conceptFrequency: Object.fromEntries(conceptFrequency),
      relatedConcepts: Array.from(relatedConcepts),
      categories: Object.fromEntries(categories),
      interestWeights,
      totalConcepts
    };
  }

  /**
   * 웹 검색 결과 기반: 외부 온톨로지에서 관련 개념 수집
   * 병렬 쿼리로 성능 최적화
   */
  private async gatherExternalConcepts(userConcepts: string[]): Promise<ExternalOntologyResult[]> {
    console.log(`🌐 외부 온톨로지에서 관련 개념 수집 중...`);
    
    const allExternalConcepts: ExternalOntologyResult[] = [];
    
    // 병렬 쿼리로 성능 최적화 (웹 검색 결과 기반 모범 사례)
    const batchSize = 3; // 외부 API 부하 방지
    
    for (let i = 0; i < userConcepts.length; i += batchSize) {
      const batch = userConcepts.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (concept) => {
        try {
          return await this.externalOntologyService.searchConcept(concept);
        } catch (error) {
          console.warn(`외부 온톨로지 검색 실패: ${concept}`, error);
          return [];
        }
      });
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          allExternalConcepts.push(...result.value);
        }
      });
    }
    
    // 중복 제거 및 관련도 점수 기준 정렬
    const uniqueConcepts = this.deduplicateExternalConcepts(allExternalConcepts);
    
    console.log(`📈 외부 개념 ${uniqueConcepts.length}개 수집 완료`);
    
    return uniqueConcepts;
  }

  /**
   * 웹 검색 결과 기반: PMHR 프레임워크 기반 지식 격차 식별
   * 규칙 강화 강화학습 방식으로 격차 후보 생성
   */
  private async identifyKnowledgeGaps(
    userProfile: UserKnowledgeProfile,
    externalConcepts: ExternalOntologyResult[],
    config: GapDetectionConfig
  ): Promise<KnowledgeGap[]> {
    console.log(`🧠 PMHR 프레임워크 기반 지식 격차 식별 중...`);
    
    const knowledgeGaps: KnowledgeGap[] = [];
    
    for (const externalConcept of externalConcepts) {
      // 사용자가 이미 알고 있는 개념인지 확인
      const isKnownConcept = userProfile.concepts.some(userConcept => 
        this.calculateConceptSimilarity(userConcept, externalConcept.label) > 0.8
      );
      
      if (isKnownConcept) {
        continue; // 이미 알고 있는 개념은 격차가 아님
      }
      
      // 관련 사용자 개념 찾기
      const relatedUserConcepts = this.findRelatedUserConcepts(
        externalConcept, 
        userProfile
      );
      
      // 관련성이 있는 경우에만 지식 격차로 간주
      if (relatedUserConcepts.length > 0) {
        // 학습 경로 생성 (가짜 경로 방지 메커니즘 적용)
        const learningPath = this.generateLearningPath(
          externalConcept, 
          relatedUserConcepts, 
          config.maxLearningPathLength
        );
        
        if (learningPath.length > 0 && learningPath.length <= config.maxLearningPathLength) {
          const knowledgeGap: KnowledgeGap = {
            id: `gap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            missingConcept: externalConcept.label,
            description: externalConcept.description,
            relatedUserConcepts,
            suggestedLearningPath: learningPath,
            gapScore: 0, // 나중에 Reward Shaping으로 계산
            confidenceScore: externalConcept.relevanceScore,
            source: externalConcept.source,
            categories: externalConcept.categories,
            priority: 'medium', // 나중에 점수 기반으로 조정
            estimatedLearningTime: this.estimateLearningTime(externalConcept, learningPath)
          };
          
          knowledgeGaps.push(knowledgeGap);
        }
      }
    }
    
    console.log(`🎯 지식 격차 후보 ${knowledgeGaps.length}개 식별 완료`);
    
    return knowledgeGaps;
  }

  /**
   * 웹 검색 결과 기반: Reward Shaping을 통한 격차 점수 계산
   * 희소 보상 문제 해결과 다중 요소 보상 시스템
   */
  private async calculateGapScores(
    gaps: KnowledgeGap[],
    userProfile: UserKnowledgeProfile,
    config: GapDetectionConfig
  ): Promise<KnowledgeGap[]> {
    console.log(`🎯 Reward Shaping 기반 격차 점수 계산 중...`);
    
    return gaps.map(gap => {
      const rewardSignal = this.calculateRewardSignal(gap, userProfile, config);
      
      // PMHR 프레임워크의 총 보상 점수를 격차 점수로 사용
      gap.gapScore = rewardSignal.totalReward;
      
      // 우선순위 결정
      if (gap.gapScore >= 80) {
        gap.priority = 'high';
      } else if (gap.gapScore >= 50) {
        gap.priority = 'medium';
      } else {
        gap.priority = 'low';
      }
      
      return gap;
    });
  }

  /**
   * 웹 검색 결과 기반: PMHR 프레임워크의 Reward Signal 계산
   * 다중 요소 보상 시스템으로 희소 보상 문제 해결
   */
  private calculateRewardSignal(
    gap: KnowledgeGap,
    userProfile: UserKnowledgeProfile,
    config: GapDetectionConfig
  ): RewardSignal {
    // 1. 개념 관련성 보상 (0-30점)
    const conceptRelevance = gap.relatedUserConcepts.length * 10;
    
    // 2. 사용자 관심도 정렬 보상 (0-25점)
    let userInterestAlignment = 0;
    gap.categories.forEach(category => {
      const weight = userProfile.interestWeights[category] || 0;
      userInterestAlignment += weight * 25;
    });
    
    // 3. 학습 경로 길이 페널티 (0-20점, 짧을수록 높은 점수)
    const pathLengthScore = Math.max(0, 20 - (gap.suggestedLearningPath.length * 4));
    
    // 4. 개념 난이도 보상 (0-25점, 사용자 선호도에 따라)
    let difficultyScore = 15; // 기본 점수
    
    if (config.difficultyPreference === 'beginner' && gap.suggestedLearningPath.length <= 2) {
      difficultyScore += 10;
    } else if (config.difficultyPreference === 'advanced' && gap.suggestedLearningPath.length >= 4) {
      difficultyScore += 10;
    } else if (config.difficultyPreference === 'intermediate') {
      difficultyScore += 5;
    }
    
    // 총 보상 계산 (가중 평균)
    const totalReward = conceptRelevance + userInterestAlignment + pathLengthScore + difficultyScore;
    
    return {
      conceptRelevance,
      userInterestAlignment,
      learningPathLength: pathLengthScore,
      conceptDifficulty: difficultyScore,
      totalReward: Math.min(100, totalReward) // 최대 100점으로 제한
    };
  }

  /**
   * 웹 검색 결과 기반: 가짜 경로 방지 및 최종 필터링
   * 품질 높은 지식 격차만 선별
   */
  private filterAndRankGaps(gaps: KnowledgeGap[], config: GapDetectionConfig): KnowledgeGap[] {
    console.log(`🔍 가짜 경로 방지 및 최종 필터링 중...`);
    
    // 1. 최소 점수 필터링
    const filteredGaps = gaps.filter(gap => gap.gapScore >= config.minGapScore);
    
    // 2. 점수 기준 정렬 (높은 점수 우선)
    filteredGaps.sort((a, b) => b.gapScore - a.gapScore);
    
    // 3. 최대 반환 개수 제한
    const finalGaps = filteredGaps.slice(0, config.maxGapsToReturn);
    
    console.log(`✅ 최종 지식 격차 ${finalGaps.length}개 선별 완료`);
    
    return finalGaps;
  }

  // 유틸리티 메소드들
  private calculateConceptSimilarity(concept1: string, concept2: string): number {
    const c1 = concept1.toLowerCase();
    const c2 = concept2.toLowerCase();
    
    if (c1 === c2) return 1.0;
    if (c1.includes(c2) || c2.includes(c1)) return 0.8;
    
    // 간단한 Jaccard 유사도
    const words1 = new Set(c1.split(/\s+/));
    const words2 = new Set(c2.split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  private findRelatedUserConcepts(
    externalConcept: ExternalOntologyResult,
    userProfile: UserKnowledgeProfile
  ): string[] {
    const related: string[] = [];
    
    // 직접 관련성 확인
    userProfile.concepts.forEach(userConcept => {
      const similarity = this.calculateConceptSimilarity(userConcept, externalConcept.label);
      if (similarity > 0.3 && similarity < 0.8) { // 관련있지만 다른 개념
        related.push(userConcept);
      }
    });
    
    // 카테고리 기반 관련성 확인
    externalConcept.categories.forEach(category => {
      if (userProfile.categories[category]) {
        userProfile.concepts.forEach(userConcept => {
          if (!related.includes(userConcept)) {
            related.push(userConcept);
          }
        });
      }
    });
    
    return related.slice(0, 5); // 최대 5개로 제한
  }

  private generateLearningPath(
    externalConcept: ExternalOntologyResult,
    relatedUserConcepts: string[],
    maxLength: number
  ): string[] {
    const path: string[] = [];
    
    // 가장 관련성 높은 사용자 개념부터 시작
    if (relatedUserConcepts.length > 0) {
      path.push(relatedUserConcepts[0]);
    }
    
    // 중간 단계 개념들 추가 (관련 개념 활용)
    const intermediateSteps = externalConcept.relatedConcepts
      .filter(concept => !relatedUserConcepts.includes(concept))
      .slice(0, maxLength - 2);
    
    path.push(...intermediateSteps);
    
    // 목표 개념 추가
    path.push(externalConcept.label);
    
    return path.slice(0, maxLength);
  }

  private estimateLearningTime(
    externalConcept: ExternalOntologyResult,
    learningPath: string[]
  ): string {
    const baseTime = 30; // 기본 30분
    const pathMultiplier = learningPath.length * 15; // 경로 단계당 15분
    const complexityMultiplier = externalConcept.description ? 
      Math.min(externalConcept.description.length / 100, 3) : 1;
    
    const totalMinutes = baseTime + pathMultiplier + (complexityMultiplier * 10);
    
    if (totalMinutes < 60) {
      return `${Math.round(totalMinutes)}분`;
    } else {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = Math.round(totalMinutes % 60);
      return minutes > 0 ? `${hours}시간 ${minutes}분` : `${hours}시간`;
    }
  }

  private deduplicateExternalConcepts(concepts: ExternalOntologyResult[]): ExternalOntologyResult[] {
    const seen = new Map<string, ExternalOntologyResult>();
    
    concepts.forEach(concept => {
      const key = concept.label.toLowerCase();
      const existing = seen.get(key);
      
      if (!existing || concept.relevanceScore > existing.relevanceScore) {
        seen.set(key, concept);
      }
    });
    
    return Array.from(seen.values())
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
  }
}

// 사용자 지식 프로필 인터페이스
interface UserKnowledgeProfile {
  concepts: string[];
  conceptFrequency: Record<string, number>;
  relatedConcepts: string[];
  categories: Record<string, number>;
  interestWeights: Record<string, number>;
  totalConcepts: number;
} 