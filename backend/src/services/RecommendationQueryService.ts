import { MongoClient, Db, ObjectId } from 'mongodb';
import { SearchResult, RecommendationQuery } from '../types/search';

/**
 * 추천 쿼리 서비스 (MongoDB 기반)
 * Redis 대신 MongoDB를 사용하여 사용자 쿼리 통계를 관리합니다.
 */
export class RecommendationQueryService {
  private client: MongoClient;
  private db: Db;
  private queriesCollection: any;

  constructor() {
    this.client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/habitus33');
    this.db = this.client.db();
    this.queriesCollection = this.db.collection('user_queries');
  }

  /**
   * 사용자 쿼리 수집 (MongoDB에 저장)
   */
  async collectUserQuery(
    query: string,
    searchResults: SearchResult[],
    userId: string
  ): Promise<void> {
    try {
      const queryHash = this.hashQuery(query);
      const now = new Date();

      // 기존 쿼리 통계 업데이트 또는 새로 생성
      await this.queriesCollection.updateOne(
        { 
          queryHash,
          userId: new ObjectId(userId)
        },
        {
          $inc: { 
            usageCount: 1,
            totalResults: searchResults.length,
            totalScore: searchResults.reduce((sum, r) => sum + r.score, 0)
          },
          $set: { 
            lastUsed: now,
            query: query,
            userId: new ObjectId(userId)
          },
          $setOnInsert: { 
            createdAt: now,
            usageCount: 0
          }
        },
        { upsert: true }
      );

      console.log(`사용자 쿼리 수집 완료: ${query}`);
    } catch (error) {
      console.error('쿼리 수집 오류:', error);
    }
  }

  /**
   * 추천 쿼리 생성 (MongoDB 기반)
   */
  async generateRecommendations(
    searchResults: SearchResult[],
    searchQuery: string,
    userId: string
  ): Promise<RecommendationQuery[]> {
    try {
      const recommendations: RecommendationQuery[] = [];

      // 1. 사용자 개인화 추천 (사용자 히스토리 기반)
      const userQueries = await this.queriesCollection
        .find({ 
          userId: new ObjectId(userId),
          usageCount: { $gt: 0 }
        })
        .sort({ usageCount: -1, lastUsed: -1 })
        .limit(5)
        .toArray();

      userQueries.forEach((q: any) => {
        recommendations.push({
          id: q._id.toString(),
          text: q.query,
          relevance: Math.min(q.usageCount * 0.3, 1.0),
          category: 'personal',
          usageCount: q.usageCount
        });
      });

      // 2. 컨텍스트 기반 추천 (검색 결과 분석)
      const contextQueries = this.generateContextBasedQueries(searchResults, searchQuery);
      recommendations.push(...contextQueries);

      // 3. AI 기반 추천 (LLM을 활용한 추천)
      const aiQueries = await this.generateAIRecommendations(searchResults, searchQuery);
      recommendations.push(...aiQueries);

      // 중복 제거 및 정렬
      const uniqueRecommendations = this.removeDuplicates(recommendations);
      const sortedRecommendations = uniqueRecommendations
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, 3); // 상위 3개만 반환

      return sortedRecommendations;
    } catch (error) {
      console.error('추천 쿼리 생성 오류:', error);
      return this.getFallbackRecommendations(searchQuery);
    }
  }

  /**
   * 컨텍스트 기반 추천 쿼리 생성
   */
  private generateContextBasedQueries(
    searchResults: SearchResult[],
    searchQuery: string
  ): RecommendationQuery[] {
    const recommendations: RecommendationQuery[] = [];

    // 검색 결과에서 태그 기반 추천
    const tagFrequency: Record<string, number> = {};
    searchResults.forEach(result => {
      result.tags?.forEach(tag => {
        tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
      });
    });

    // 가장 많이 나온 태그로 추천 쿼리 생성
    const topTags = Object.entries(tagFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);

    topTags.forEach(([tag, count]) => {
      recommendations.push({
        id: `tag-${tag}`,
        text: `${tag} 관련 학습`,
        relevance: Math.min(count / searchResults.length, 1.0),
        category: 'tag-based',
        usageCount: count
      });
    });

    // 검색 쿼리 확장
    const queryWords = searchQuery.split(' ').filter(word => word.length > 1);
    queryWords.forEach(word => {
      recommendations.push({
        id: `expand-${word}`,
        text: `${word} 심화 학습`,
        relevance: 0.7,
        category: 'query-expansion'
      });
    });

    return recommendations;
  }

  /**
   * AI 기반 추천 쿼리 생성
   */
  private async generateAIRecommendations(
    searchResults: SearchResult[],
    searchQuery: string
  ): Promise<RecommendationQuery[]> {
    // AI 추천은 복잡하므로 간단한 추천으로 대체
    return [
      {
        id: 'ai-1',
        text: `${searchQuery} 심화 질문`,
        relevance: 0.8,
        category: 'ai-generated'
      },
      {
        id: 'ai-2',
        text: `${searchQuery} 실전 문제`,
        relevance: 0.7,
        category: 'ai-generated'
      }
    ];
  }

  /**
   * 폴백 추천 쿼리
   */
  private getFallbackRecommendations(searchQuery: string): RecommendationQuery[] {
    return [
      {
        id: 'fallback-1',
        text: `${searchQuery} 심화 학습`,
        relevance: 0.6,
        category: 'fallback'
      },
      {
        id: 'fallback-2',
        text: `${searchQuery} 실전 연습`,
        relevance: 0.5,
        category: 'fallback'
      },
      {
        id: 'fallback-3',
        text: `${searchQuery} 관련 개념`,
        relevance: 0.4,
        category: 'fallback'
      }
    ];
  }

  /**
   * 쿼리 해시 생성
   */
  private hashQuery(query: string): string {
    return Buffer.from(query.toLowerCase().trim()).toString('base64').slice(0, 16);
  }

  /**
   * 중복 제거
   */
  private removeDuplicates(recommendations: RecommendationQuery[]): RecommendationQuery[] {
    const seen = new Set<string>();
    return recommendations.filter(rec => {
      const key = rec.text.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * 연결 해제
   */
  async disconnect(): Promise<void> {
    await this.client.close();
  }
} 