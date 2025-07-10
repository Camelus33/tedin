import { KnowledgeGapDetectionService, KnowledgeGap } from './KnowledgeGapDetectionService';
import { HiddenLinkDetectionService, HiddenLink } from './HiddenLinkDetectionService';
import { ContextOrchestrator } from './ContextOrchestrator';
import { IUser } from '../models/User';

// 통합 결과 인터페이스
export interface UnifiedResult {
  id: string;
  type: 'knowledge-gap' | 'hidden-link';
  title: string;
  description: string;
  unifiedScore: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  relevanceScore: number;
  userInterestScore: number;
  learningImpactScore: number;
  ontologyStrengthScore: number;
  originalData: KnowledgeGap | HiddenLink;
  recommendations: string[];
  estimatedLearningTime: number; // 분 단위
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  categories: string[];
  relatedConcepts: string[];
  learningPath: string[];
  discoveredAt: Date;
}

// 사용자 학습 프로필 인터페이스
export interface UserLearningProfile {
  interests: string[];
  currentLevel: 'beginner' | 'intermediate' | 'advanced';
  learningGoals: string[];
  pastLearningHistory: string[];
  preferredDifficulty: 'easy' | 'moderate' | 'challenging';
  availableTimePerSession: number; // 분 단위
  focusAreas: string[];
}

// 점수 가중치 설정
export interface ScoringWeights {
  relevance: number;
  userInterest: number;
  learningImpact: number;
  ontologyStrength: number;
  recency: number;
  difficulty: number;
}

// 랭킹 옵션
export interface RankingOptions {
  maxResults?: number;
  minUnifiedScore?: number;
  priorityFilter?: ('critical' | 'high' | 'medium' | 'low')[];
  typeFilter?: ('knowledge-gap' | 'hidden-link')[];
  difficultyFilter?: ('beginner' | 'intermediate' | 'advanced')[];
  categoryFilter?: string[];
  timeConstraint?: number; // 분 단위
  includeRecommendations?: boolean;
}

export class UnifiedScoringService {
  private knowledgeGapService: KnowledgeGapDetectionService;
  private hiddenLinkService: HiddenLinkDetectionService;
  private contextOrchestrator: ContextOrchestrator;
  private user: IUser;

  // 기본 점수 가중치
  private defaultWeights: ScoringWeights = {
    relevance: 0.25,      // 25% - 관련도
    userInterest: 0.20,   // 20% - 사용자 관심도
    learningImpact: 0.20, // 20% - 학습 영향도
    ontologyStrength: 0.15, // 15% - 온톨로지 관계 강도
    recency: 0.10,        // 10% - 최신성
    difficulty: 0.10      // 10% - 난이도 적합성
  };

  constructor(user: IUser) {
    this.user = user;
    this.knowledgeGapService = new KnowledgeGapDetectionService(user);
    this.hiddenLinkService = new HiddenLinkDetectionService(user);
    this.contextOrchestrator = new ContextOrchestrator(user);
  }

  /**
   * 통합 점수 및 랭킹 시스템의 메인 메서드
   */
  async generateUnifiedRanking(
    concepts: string[],
    userProfile: UserLearningProfile,
    options: RankingOptions = {},
    customWeights?: Partial<ScoringWeights>
  ): Promise<UnifiedResult[]> {
    const {
      maxResults = 20,
      minUnifiedScore = 60.0,
      includeRecommendations = true
    } = options;

    console.log('🎯 통합 점수 및 랭킹 시스템 시작...');
    console.log(`개념 수: ${concepts.length}개, 최대 결과: ${maxResults}개`);

    // 점수 가중치 설정
    const weights = { ...this.defaultWeights, ...customWeights };

    try {
      // 1. 지식 격차 및 숨겨진 연결 병렬 탐지
      console.log('🔍 지식 격차 및 숨겨진 연결 병렬 탐지 중...');
      const [knowledgeGaps, hiddenLinks] = await Promise.allSettled([
        this.knowledgeGapService.detectKnowledgeGaps(concepts),
        this.hiddenLinkService.detectHiddenLinks(concepts)
      ]);

      const gaps = knowledgeGaps.status === 'fulfilled' ? knowledgeGaps.value : [];
      const links = hiddenLinks.status === 'fulfilled' ? hiddenLinks.value : [];

      console.log(`발견된 지식 격차: ${gaps.length}개, 숨겨진 연결: ${links.length}개`);

      // 2. 통합 결과 생성
      console.log('🔄 통합 결과 생성 중...');
      const unifiedResults: UnifiedResult[] = [];

      // 지식 격차를 통합 결과로 변환
      for (const gap of gaps) {
        const unifiedResult = await this.convertKnowledgeGapToUnified(gap, userProfile, weights);
        unifiedResults.push(unifiedResult);
      }

      // 숨겨진 연결을 통합 결과로 변환
      for (const link of links) {
        const unifiedResult = await this.convertHiddenLinkToUnified(link, userProfile, weights);
        unifiedResults.push(unifiedResult);
      }

      // 3. 필터링 적용
      console.log('🔍 결과 필터링 중...');
      const filteredResults = this.applyFilters(unifiedResults, options);

      // 4. 통합 점수 계산 및 랭킹
      console.log('📊 통합 점수 계산 및 랭킹 중...');
      const rankedResults = this.rankResults(filteredResults, weights);

      // 5. 최종 결과 제한 및 추천사항 생성
      const finalResults = rankedResults
        .filter(result => result.unifiedScore >= minUnifiedScore)
        .slice(0, maxResults);

      if (includeRecommendations) {
        console.log('💡 개인화된 추천사항 생성 중...');
        await this.generateRecommendations(finalResults, userProfile);
      }

      console.log(`✅ 통합 랭킹 ${finalResults.length}개 생성 완료`);
      return finalResults;

    } catch (error) {
      console.error('❌ 통합 점수 시스템 오류:', error);
      return [];
    }
  }

  /**
   * 지식 격차를 통합 결과로 변환
   */
  private async convertKnowledgeGapToUnified(
    gap: KnowledgeGap,
    userProfile: UserLearningProfile,
    weights: ScoringWeights
  ): Promise<UnifiedResult> {
    const baseScore = gap.gapScore;
    const relevanceScore = gap.confidenceScore;
    const userInterestScore = this.calculateUserInterestScore(gap.missingConcept, userProfile);
    const learningImpactScore = this.calculateLearningImpactScore(gap, userProfile);
    const ontologyStrengthScore = baseScore * 0.8; // 지식 격차의 온톨로지 강도
    const recencyScore = this.calculateRecencyScore(new Date()); // 현재 시간으로 설정
    const difficultyScore = this.calculateDifficultyScore(gap.priority, userProfile);

    const unifiedScore = this.calculateWeightedScore({
      relevance: relevanceScore,
      userInterest: userInterestScore,
      learningImpact: learningImpactScore,
      ontologyStrength: ontologyStrengthScore,
      recency: recencyScore,
      difficulty: difficultyScore
    }, weights);

    return {
      id: `unified_gap_${gap.missingConcept}_${Date.now()}`,
      type: 'knowledge-gap',
      title: `지식 격차: ${gap.missingConcept}`,
      description: `"${gap.missingConcept}" 개념에 대한 학습이 필요합니다.`,
      unifiedScore,
      priority: this.determinePriority(unifiedScore),
      relevanceScore,
      userInterestScore,
      learningImpactScore,
      ontologyStrengthScore,
      originalData: gap,
      recommendations: [],
      estimatedLearningTime: this.estimateLearningTime(gap),
      difficulty: this.determineDifficulty(gap),
      categories: [gap.source, gap.priority],
      relatedConcepts: gap.relatedUserConcepts,
      learningPath: gap.suggestedLearningPath,
      discoveredAt: new Date() // 현재 시간으로 설정
    };
  }

  /**
   * 숨겨진 연결을 통합 결과로 변환
   */
  private async convertHiddenLinkToUnified(
    link: HiddenLink,
    userProfile: UserLearningProfile,
    weights: ScoringWeights
  ): Promise<UnifiedResult> {
    const baseScore = link.confidenceScore;
    const relevanceScore = link.confidenceScore;
    const userInterestScore = Math.max(
      this.calculateUserInterestScore(link.fromConcept, userProfile),
      this.calculateUserInterestScore(link.toConcept, userProfile)
    );
    const learningImpactScore = this.calculateLinkLearningImpact(link, userProfile);
    const ontologyStrengthScore = link.strength * 100;
    const recencyScore = this.calculateRecencyScore(link.discoveredAt);
    const difficultyScore = this.calculateLinkDifficultyScore(link, userProfile);

    const unifiedScore = this.calculateWeightedScore({
      relevance: relevanceScore,
      userInterest: userInterestScore,
      learningImpact: learningImpactScore,
      ontologyStrength: ontologyStrengthScore,
      recency: recencyScore,
      difficulty: difficultyScore
    }, weights);

    return {
      id: `unified_link_${link.fromConcept}_${link.toConcept}_${Date.now()}`,
      type: 'hidden-link',
      title: `숨겨진 연결: ${link.fromConcept} ↔ ${link.toConcept}`,
      description: `"${link.fromConcept}"와 "${link.toConcept}" 사이의 ${link.linkType} 연결을 발견했습니다.`,
      unifiedScore,
      priority: this.determinePriority(unifiedScore),
      relevanceScore,
      userInterestScore,
      learningImpactScore,
      ontologyStrengthScore,
      originalData: link,
      recommendations: [],
      estimatedLearningTime: this.estimateLinkLearningTime(link),
      difficulty: this.determineLinkDifficulty(link),
      categories: [link.source, link.linkType, ...link.categories],
      relatedConcepts: [link.fromConcept, link.toConcept, ...link.reasoning.intermediateNodes],
      learningPath: link.connectionPath,
      discoveredAt: link.discoveredAt
    };
  }

  /**
   * 사용자 관심도 점수 계산
   */
  private calculateUserInterestScore(concept: string, userProfile: UserLearningProfile): number {
    let score = 50; // 기본 점수

    // 직접적인 관심사 매칭
    const directMatch = userProfile.interests.some(interest => 
      concept.toLowerCase().includes(interest.toLowerCase()) ||
      interest.toLowerCase().includes(concept.toLowerCase())
    );
    if (directMatch) score += 30;

    // 학습 목표와의 관련성
    const goalMatch = userProfile.learningGoals.some(goal =>
      concept.toLowerCase().includes(goal.toLowerCase()) ||
      goal.toLowerCase().includes(concept.toLowerCase())
    );
    if (goalMatch) score += 20;

    // 집중 영역과의 관련성
    const focusMatch = userProfile.focusAreas.some(area =>
      concept.toLowerCase().includes(area.toLowerCase()) ||
      area.toLowerCase().includes(concept.toLowerCase())
    );
    if (focusMatch) score += 15;

    // 과거 학습 이력과의 관련성
    const historyMatch = userProfile.pastLearningHistory.some(item =>
      concept.toLowerCase().includes(item.toLowerCase()) ||
      item.toLowerCase().includes(concept.toLowerCase())
    );
    if (historyMatch) score += 10;

    return Math.min(100, Math.max(0, score));
  }

  /**
   * 학습 영향도 점수 계산
   */
  private calculateLearningImpactScore(gap: KnowledgeGap, userProfile: UserLearningProfile): number {
    let score = gap.gapScore;

    // 우선순위에 따른 가중치
    switch (gap.priority) {
      case 'high':
        score += 20;
        break;
      case 'medium':
        score += 10;
        break;
      case 'low':
        score += 5;
        break;
    }

    // 학습 경로 길이에 따른 조정 (짧을수록 높은 영향도)
    const pathLength = gap.suggestedLearningPath.length;
    if (pathLength <= 3) score += 10;
    else if (pathLength <= 5) score += 5;

    // 관련 개념 수에 따른 조정 (많을수록 높은 영향도)
    const relatedCount = gap.relatedUserConcepts.length;
    score += Math.min(15, relatedCount * 2);

    return Math.min(100, Math.max(0, score));
  }

  /**
   * 숨겨진 연결의 학습 영향도 계산
   */
  private calculateLinkLearningImpact(link: HiddenLink, userProfile: UserLearningProfile): number {
    let score = link.confidenceScore;

    // 연결 타입에 따른 가중치
    switch (link.linkType) {
      case 'super-relation':
        score += 20;
        break;
      case 'indirect':
        score += 15;
        break;
      case 'direct':
        score += 10;
        break;
    }

    // 추론 방법에 따른 가중치
    switch (link.reasoning.method) {
      case 'bidirectional':
        score += 15;
        break;
      case 'forward':
        score += 10;
        break;
      case 'backward':
        score += 8;
        break;
    }

    // 홉 수에 따른 조정 (적절한 복잡도가 높은 영향도)
    const hops = link.reasoning.hops;
    if (hops >= 2 && hops <= 4) score += 10;
    else if (hops > 4) score -= 5;

    return Math.min(100, Math.max(0, score));
  }

  /**
   * 최신성 점수 계산
   */
  private calculateRecencyScore(discoveredAt: Date): number {
    const now = new Date();
    const ageInHours = (now.getTime() - discoveredAt.getTime()) / (1000 * 60 * 60);
    
    if (ageInHours <= 1) return 100;
    if (ageInHours <= 6) return 90;
    if (ageInHours <= 24) return 80;
    if (ageInHours <= 72) return 70;
    if (ageInHours <= 168) return 60; // 1주일
    
    return 50;
  }

  /**
   * 난이도 적합성 점수 계산
   */
  private calculateDifficultyScore(priority: string, userProfile: UserLearningProfile): number {
    const difficultyMapping = {
      'critical': 'advanced',
      'high': 'intermediate',
      'medium': 'intermediate',
      'low': 'beginner'
    };

    const contentDifficulty = difficultyMapping[priority] || 'intermediate';
    const userLevel = userProfile.currentLevel;
    const userPreference = userProfile.preferredDifficulty;

    let score = 50;

    // 사용자 레벨과 콘텐츠 난이도 매칭
    if (contentDifficulty === userLevel) score += 30;
    else if (
      (contentDifficulty === 'beginner' && userLevel === 'intermediate') ||
      (contentDifficulty === 'intermediate' && userLevel === 'advanced')
    ) score += 20;
    else if (
      (contentDifficulty === 'advanced' && userLevel === 'beginner')
    ) score -= 20;

    // 사용자 선호도 반영
    if (userPreference === 'challenging' && contentDifficulty === 'advanced') score += 15;
    else if (userPreference === 'easy' && contentDifficulty === 'beginner') score += 15;
    else if (userPreference === 'moderate' && contentDifficulty === 'intermediate') score += 15;

    return Math.min(100, Math.max(0, score));
  }

  /**
   * 숨겨진 연결의 난이도 점수 계산
   */
  private calculateLinkDifficultyScore(link: HiddenLink, userProfile: UserLearningProfile): number {
    let score = 50;

    // 홉 수에 따른 난이도
    const hops = link.reasoning.hops;
    let linkDifficulty: 'beginner' | 'intermediate' | 'advanced';
    
    if (hops <= 2) linkDifficulty = 'beginner';
    else if (hops <= 4) linkDifficulty = 'intermediate';
    else linkDifficulty = 'advanced';

    // 사용자 레벨과 매칭
    if (linkDifficulty === userProfile.currentLevel) score += 30;
    else if (
      (linkDifficulty === 'beginner' && userProfile.currentLevel === 'intermediate') ||
      (linkDifficulty === 'intermediate' && userProfile.currentLevel === 'advanced')
    ) score += 20;

    // 연결 타입에 따른 추가 조정
    if (link.linkType === 'super-relation') score += 10;

    return Math.min(100, Math.max(0, score));
  }

  /**
   * 가중치 기반 통합 점수 계산
   */
  private calculateWeightedScore(
    scores: {
      relevance: number;
      userInterest: number;
      learningImpact: number;
      ontologyStrength: number;
      recency: number;
      difficulty: number;
    },
    weights: ScoringWeights
  ): number {
    const weightedScore = 
      scores.relevance * weights.relevance +
      scores.userInterest * weights.userInterest +
      scores.learningImpact * weights.learningImpact +
      scores.ontologyStrength * weights.ontologyStrength +
      scores.recency * weights.recency +
      scores.difficulty * weights.difficulty;

    return Math.min(100, Math.max(0, weightedScore));
  }

  /**
   * 필터링 적용
   */
  private applyFilters(results: UnifiedResult[], options: RankingOptions): UnifiedResult[] {
    let filtered = results;

    if (options.priorityFilter) {
      filtered = filtered.filter(result => options.priorityFilter!.includes(result.priority));
    }

    if (options.typeFilter) {
      filtered = filtered.filter(result => options.typeFilter!.includes(result.type));
    }

    if (options.difficultyFilter) {
      filtered = filtered.filter(result => options.difficultyFilter!.includes(result.difficulty));
    }

    if (options.categoryFilter && options.categoryFilter.length > 0) {
      filtered = filtered.filter(result => 
        result.categories.some(category => 
          options.categoryFilter!.some(filter => 
            category.toLowerCase().includes(filter.toLowerCase())
          )
        )
      );
    }

    if (options.timeConstraint) {
      filtered = filtered.filter(result => result.estimatedLearningTime <= options.timeConstraint!);
    }

    return filtered;
  }

  /**
   * 결과 랭킹
   */
  private rankResults(results: UnifiedResult[], weights: ScoringWeights): UnifiedResult[] {
    return results.sort((a, b) => {
      // 1차: 통합 점수
      if (a.unifiedScore !== b.unifiedScore) {
        return b.unifiedScore - a.unifiedScore;
      }

      // 2차: 우선순위
      const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
      const aPriorityScore = priorityOrder[a.priority];
      const bPriorityScore = priorityOrder[b.priority];
      if (aPriorityScore !== bPriorityScore) {
        return bPriorityScore - aPriorityScore;
      }

      // 3차: 사용자 관심도
      if (a.userInterestScore !== b.userInterestScore) {
        return b.userInterestScore - a.userInterestScore;
      }

      // 4차: 학습 영향도
      if (a.learningImpactScore !== b.learningImpactScore) {
        return b.learningImpactScore - a.learningImpactScore;
      }

      // 5차: 최신성 (발견 시간)
      return b.discoveredAt.getTime() - a.discoveredAt.getTime();
    });
  }

  /**
   * 개인화된 추천사항 생성
   */
  private async generateRecommendations(
    results: UnifiedResult[],
    userProfile: UserLearningProfile
  ): Promise<void> {
    for (const result of results) {
      const recommendations: string[] = [];

      // 시간 제약 기반 추천
      if (result.estimatedLearningTime > userProfile.availableTimePerSession) {
        recommendations.push(`이 주제는 ${result.estimatedLearningTime}분이 소요됩니다. 여러 세션으로 나누어 학습하는 것을 권장합니다.`);
      }

      // 난이도 기반 추천
      if (result.difficulty !== userProfile.currentLevel) {
        if (result.difficulty === 'advanced' && userProfile.currentLevel === 'beginner') {
          recommendations.push('이 주제는 고급 수준입니다. 기초 개념을 먼저 학습하시기 바랍니다.');
        } else if (result.difficulty === 'beginner' && userProfile.currentLevel === 'advanced') {
          recommendations.push('이 주제는 기초 수준입니다. 빠르게 복습하고 응용 개념으로 넘어가세요.');
        }
      }

      // 학습 경로 기반 추천
      if (result.learningPath.length > 1) {
        recommendations.push(`권장 학습 순서: ${result.learningPath.join(' → ')}`);
      }

      // 관련 개념 기반 추천
      if (result.relatedConcepts.length > 0) {
        const topRelated = result.relatedConcepts.slice(0, 3);
        recommendations.push(`관련 개념: ${topRelated.join(', ')}`);
      }

      // 타입별 특화 추천
      if (result.type === 'knowledge-gap') {
        recommendations.push('이 지식 격차를 해결하면 전체적인 이해도가 크게 향상됩니다.');
      } else if (result.type === 'hidden-link') {
        recommendations.push('이 연결을 이해하면 개념 간의 관계를 더 깊이 파악할 수 있습니다.');
      }

      result.recommendations = recommendations;
    }
  }

  /**
   * 우선순위 결정
   */
  private determinePriority(score: number): 'critical' | 'high' | 'medium' | 'low' {
    if (score >= 90) return 'critical';
    if (score >= 75) return 'high';
    if (score >= 60) return 'medium';
    return 'low';
  }

  /**
   * 지식 격차의 난이도 결정
   */
  private determineDifficulty(gap: KnowledgeGap): 'beginner' | 'intermediate' | 'advanced' {
    if (gap.priority === 'high') return 'advanced';
    if (gap.priority === 'medium') return 'intermediate';
    return 'beginner';
  }

  /**
   * 숨겨진 연결의 난이도 결정
   */
  private determineLinkDifficulty(link: HiddenLink): 'beginner' | 'intermediate' | 'advanced' {
    const hops = link.reasoning.hops;
    if (hops <= 2) return 'beginner';
    if (hops <= 4) return 'intermediate';
    return 'advanced';
  }

  /**
   * 지식 격차의 학습 시간 추정
   */
  private estimateLearningTime(gap: KnowledgeGap): number {
    let baseTime = 30; // 기본 30분

    // 우선순위에 따른 조정
    switch (gap.priority) {
      case 'high':
        baseTime += 60;
        break;
      case 'medium':
        baseTime += 30;
        break;
      case 'low':
        baseTime += 15;
        break;
    }

    // 학습 경로 길이에 따른 조정
    baseTime += gap.suggestedLearningPath.length * 10;

    // 관련 개념 수에 따른 조정
    baseTime += gap.relatedUserConcepts.length * 5;

    return Math.min(180, Math.max(15, baseTime)); // 15분~3시간 범위
  }

  /**
   * 숨겨진 연결의 학습 시간 추정
   */
  private estimateLinkLearningTime(link: HiddenLink): number {
    let baseTime = 20; // 기본 20분

    // 연결 타입에 따른 조정
    switch (link.linkType) {
      case 'super-relation':
        baseTime += 40;
        break;
      case 'indirect':
        baseTime += 30;
        break;
      case 'direct':
        baseTime += 20;
        break;
    }

    // 홉 수에 따른 조정
    baseTime += link.reasoning.hops * 10;

    // 중간 노드 수에 따른 조정
    baseTime += link.reasoning.intermediateNodes.length * 5;

    return Math.min(120, Math.max(10, baseTime)); // 10분~2시간 범위
  }

  /**
   * 실시간 랭킹 업데이트
   */
  async updateRealTimeRanking(
    existingResults: UnifiedResult[],
    newConcepts: string[],
    userProfile: UserLearningProfile
  ): Promise<UnifiedResult[]> {
    console.log('🔄 실시간 랭킹 업데이트 중...');

    // 새로운 개념에 대한 결과 생성
    const newResults = await this.generateUnifiedRanking(newConcepts, userProfile, { maxResults: 10 });

    // 기존 결과와 병합
    const allResults = [...existingResults, ...newResults];

    // 중복 제거 (ID 기준)
    const uniqueResults = allResults.filter((result, index, array) => 
      array.findIndex(r => r.id === result.id) === index
    );

    // 재랭킹
    const rerankedResults = this.rankResults(uniqueResults, this.defaultWeights);

    console.log(`✅ 실시간 랭킹 업데이트 완료: ${rerankedResults.length}개 결과`);
    return rerankedResults;
  }

  /**
   * 성능 통계 생성
   */
  generatePerformanceStats(results: UnifiedResult[]): {
    totalResults: number;
    averageScore: number;
    typeDistribution: Record<string, number>;
    priorityDistribution: Record<string, number>;
    difficultyDistribution: Record<string, number>;
    averageLearningTime: number;
  } {
    const stats = {
      totalResults: results.length,
      averageScore: 0,
      typeDistribution: { 'knowledge-gap': 0, 'hidden-link': 0 },
      priorityDistribution: { 'critical': 0, 'high': 0, 'medium': 0, 'low': 0 },
      difficultyDistribution: { 'beginner': 0, 'intermediate': 0, 'advanced': 0 },
      averageLearningTime: 0
    };

    if (results.length === 0) return stats;

    // 평균 점수
    stats.averageScore = results.reduce((sum, r) => sum + r.unifiedScore, 0) / results.length;

    // 평균 학습 시간
    stats.averageLearningTime = results.reduce((sum, r) => sum + r.estimatedLearningTime, 0) / results.length;

    // 분포 계산
    results.forEach(result => {
      stats.typeDistribution[result.type]++;
      stats.priorityDistribution[result.priority]++;
      stats.difficultyDistribution[result.difficulty]++;
    });

    return stats;
  }
} 