import { PrismaClient } from '@prisma/client';
import mongoose from 'mongoose';
import Note from '../models/Note';

const prisma = new PrismaClient();

export interface ConceptUnderstandingScore {
  totalScore: number; // 0-100
  breakdown: {
    thoughtExpansion: number; // 생각추가 점수 (0-20)
    memoEvolution: number; // 메모진화 점수 (0-20)
    knowledgeConnection: number; // 지식연결 점수 (0-20)
    flashcardCreation: number; // 플래시카드 점수 (0-20)
    tagUtilization: number; // 태그 활용 점수 (0-10)
    userRating: number; // 사용자 평점 점수 (0-10)
  };
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  recommendations: string[];
}

export interface ScoreCalculationResult {
  score: ConceptUnderstandingScore;
  calculationVersion: string;
  calculatedAt: Date;
  performanceMetrics: {
    calculationTime: number;
    memoryUsage: number;
  };
}

export class ConceptScoreService {
  private static instance: ConceptScoreService;
  private calculationCache: Map<string, { result: ScoreCalculationResult; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5분 캐시

  public static getInstance(): ConceptScoreService {
    if (!ConceptScoreService.instance) {
      ConceptScoreService.instance = new ConceptScoreService();
    }
    return ConceptScoreService.instance;
  }

  /**
   * 노트의 개념이해도 점수를 계산합니다.
   */
  async calculateConceptScore(noteId: string): Promise<ScoreCalculationResult> {
    const startTime = Date.now();
    const cacheKey = `concept_score_${noteId}`;
    
    // 캐시 확인
    const cached = this.calculationCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
      return cached.result;
    }

    try {
      // 노트 데이터 조회
      const note = await Note.findById(noteId);
      if (!note) {
        throw new Error('노트를 찾을 수 없습니다.');
      }

      // 점수 계산
      const score = await this.calculateDetailedScore(note);
      
      // 성능 메트릭 계산
      const calculationTime = Date.now() - startTime;
      const memoryUsage = process.memoryUsage().heapUsed;

      const result: ScoreCalculationResult = {
        score,
        calculationVersion: '1.0.0',
        calculatedAt: new Date(),
        performanceMetrics: {
          calculationTime,
          memoryUsage
        }
      };

      // 캐시 저장
      this.calculationCache.set(cacheKey, {
        result,
        timestamp: Date.now()
      });

      return result;

    } catch (error) {
      console.error('개념이해도 점수 계산 중 오류:', error);
      throw error;
    }
  }

  /**
   * 상세한 점수 계산 로직
   */
  private async calculateDetailedScore(note: any): Promise<ConceptUnderstandingScore> {
    const breakdown = {
      thoughtExpansion: this.calculateThoughtExpansionScore(note),
      memoEvolution: this.calculateMemoEvolutionScore(note),
      knowledgeConnection: this.calculateKnowledgeConnectionScore(note),
      flashcardCreation: await this.calculateFlashcardCreationScore(note),
      tagUtilization: this.calculateTagUtilizationScore(note),
      userRating: this.calculateUserRatingScore(note)
    };

    const totalScore = Object.values(breakdown).reduce((sum, score) => sum + score, 0);
    const level = this.determineLevel(totalScore);
    const recommendations = this.generateRecommendations(breakdown);

    return {
      totalScore,
      breakdown,
      level,
      recommendations
    };
  }

  /**
   * 생각추가 점수 계산 (20점 만점)
   */
  private calculateThoughtExpansionScore(note: any): number {
    let score = 0;

    // 4단계 완성도 (16점)
    if (note.importanceReason) score += 4;
    if (note.momentContext) score += 4;
    if (note.relatedKnowledge) score += 4;
    if (note.mentalImage) score += 4;

    // 텍스트 길이 보너스 (4점)
    const stages = [note.importanceReason, note.momentContext, note.relatedKnowledge, note.mentalImage];
    const longStages = stages.filter(stage => stage && stage.length >= 100).length;
    score += Math.min(longStages, 4);

    return Math.min(score, 20);
  }

  /**
   * 메모진화 점수 계산 (20점 만점)
   */
  private calculateMemoEvolutionScore(note: any): number {
    let score = 0;
    const stages = [note.importanceReason, note.momentContext, note.relatedKnowledge, note.mentalImage];
    const completedStages = stages.filter(stage => stage).length;

    // 4단계 완성 (16점)
    score = completedStages * 4;

    // 진화 속도 보너스 (4점)
    if (completedStages === 4 && note.updatedAt) {
      const timeDiff = Date.now() - new Date(note.updatedAt).getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      if (hoursDiff <= 24) {
        score += 4; // 24시간 내 완성 보너스
      }
    }

    return Math.min(score, 20);
  }

  /**
   * 지식연결 점수 계산 (20점 만점)
   */
  private calculateKnowledgeConnectionScore(note: any): number {
    let score = 0;

    if (note.relatedLinks && note.relatedLinks.length > 0) {
      // 연결 개수 (12점)
      score += Math.min(note.relatedLinks.length * 4, 12);

      // 연결 다양성 (4점)
      const linkTypes = new Set(note.relatedLinks.map((link: any) => link.type));
      if (linkTypes.size >= 3) {
        score += 4;
      }

      // 연결 이유 품질 (4점)
      const reasons = note.relatedLinks
        .map((link: any) => link.reason)
        .filter(reason => reason && reason.length >= 50);
      
      if (reasons.length > 0) {
        const avgLength = reasons.reduce((sum, reason) => sum + reason.length, 0) / reasons.length;
        if (avgLength >= 50) {
          score += 4;
        }
      }
    }

    return Math.min(score, 20);
  }

  /**
   * 플래시카드 점수 계산 (20점 만점)
   */
  private async calculateFlashcardCreationScore(note: any): Promise<number> {
    let score = 0;

    try {
      // Flashcard 컬렉션에서 해당 노트의 플래시카드 조회
      const Flashcard = mongoose.model('Flashcard');
      const flashcards = await Flashcard.find({ memoId: note._id });

      if (flashcards && flashcards.length > 0) {
        // 플래시카드 생성 (8점)
        score += 8;

        // 복습 횟수 (8점) - repetitions 필드 사용
        const totalReviews = flashcards.reduce((sum: number, card: any) => 
          sum + (card.srsState?.repetitions || 0), 0);
        score += Math.min(totalReviews * 2, 8);

        // 난이도 조정 (4점) - ease 필드 사용
        if (flashcards.some((card: any) => card.srsState?.ease)) {
          score += 4;
        }
      }
    } catch (error) {
      console.error('플래시카드 점수 계산 중 오류:', error);
    }

    return Math.min(score, 20);
  }

  /**
   * 태그 활용 점수 계산 (10점 만점)
   */
  private calculateTagUtilizationScore(note: any): number {
    let score = 0;

    if (note.tags && note.tags.length > 0) {
      // 태그 개수 (6점)
      score += Math.min(note.tags.length * 2, 6);

      // 태그 품질 (2점)
      const meaningfulTags = note.tags.filter((tag: string) => tag.length >= 3);
      if (meaningfulTags.length > 0) {
        score += 2;
      }

      // 태그 다양성 (2점)
      const tagCategories = this.categorizeTags(note.tags);
      if (tagCategories.length >= 3) {
        score += 2;
      }
    }

    return Math.min(score, 10);
  }

  /**
   * 사용자 평점 점수 계산 (10점 만점)
   */
  private calculateUserRatingScore(note: any): number {
    let score = 0;

    // selfRating 필드 사용 (Mongoose 모델과 일치)
    if (note.selfRating) {
      // 평점 존재 (5점)
      score += 5;

      // 평점 높음 (3점)
      if (note.selfRating >= 4) {
        score += 3;
      }

      // 평점 업데이트 (2점) - updatedAt 필드 사용
      if (note.updatedAt) {
        score += 2;
      }
    }

    return Math.min(score, 10);
  }

  /**
   * 점수 레벨 결정
   */
  private determineLevel(totalScore: number): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
    if (totalScore >= 80) return 'expert';
    if (totalScore >= 60) return 'advanced';
    if (totalScore >= 40) return 'intermediate';
    return 'beginner';
  }

  /**
   * 개선 제안 생성
   */
  private generateRecommendations(breakdown: any): string[] {
    const recommendations = [];

    if (breakdown.thoughtExpansion < 15) {
      recommendations.push('더 많은 생각을 추가해보세요');
    }
    if (breakdown.memoEvolution < 15) {
      recommendations.push('메모를 4단계까지 발전시켜보세요');
    }
    if (breakdown.knowledgeConnection < 15) {
      recommendations.push('다른 지식과 연결해보세요');
    }
    if (breakdown.flashcardCreation < 15) {
      recommendations.push('플래시카드를 만들어보세요');
    }
    if (breakdown.tagUtilization < 7) {
      recommendations.push('의미있는 태그를 추가해보세요');
    }
    if (breakdown.userRating < 7) {
      recommendations.push('자신의 이해도를 평가해보세요');
    }

    return recommendations.length > 0 ? recommendations : ['잘하고 있습니다! 계속 발전해보세요'];
  }

  /**
   * 태그 카테고리 분류
   */
  private categorizeTags(tags: string[]): string[] {
    const categories = new Set<string>();
    
    tags.forEach(tag => {
      if (tag.includes('개념') || tag.includes('이론')) categories.add('concept');
      if (tag.includes('예시') || tag.includes('사례')) categories.add('example');
      if (tag.includes('문제') || tag.includes('질문')) categories.add('question');
      if (tag.includes('방법') || tag.includes('기법')) categories.add('method');
      if (tag.includes('결과') || tag.includes('효과')) categories.add('result');
    });

    return Array.from(categories);
  }

  /**
   * 캐시 무효화
   */
  invalidateCache(noteId: string): void {
    const cacheKey = `concept_score_${noteId}`;
    this.calculationCache.delete(cacheKey);
  }

  /**
   * 캐시 통계 조회
   */
  getCacheStats(): { size: number; hitRate: number } {
    return {
      size: this.calculationCache.size,
      hitRate: 0.8 // 실제로는 히트율 계산 로직 필요
    };
  }
}

export default ConceptScoreService; 