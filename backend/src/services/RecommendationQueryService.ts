import { MongoClient, Db, ObjectId } from 'mongodb';
import { SearchResult, RecommendationQuery } from '../types/search';
import { LLMService } from './LLMService';

/**
 * 추천 쿼리 서비스 (MongoDB 기반)
 * Redis 대신 MongoDB를 사용하여 사용자 쿼리 통계를 관리합니다.
 */
export class RecommendationQueryService {
  private client: MongoClient;
  private db: Db;
  private queriesCollection: any;
  private llmService: LLMService;

  constructor() {
    this.client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/habitus33');
    this.db = this.client.db();
    this.queriesCollection = this.db.collection('user_queries');
    this.llmService = new LLMService();
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
      const aiQueries = await this.generateAIRecommendations(searchResults, searchQuery, userId);
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
    searchQuery: string,
    userId: string
  ): Promise<RecommendationQuery[]> {
    try {
      // 검색 결과 컨텍스트 준비
      const contextSummary = searchResults.slice(0, 3).map((result, index) => 
        `${index + 1}. ${result.content?.substring(0, 150) || '내용 없음'}...`
      ).join('\n');

      // AI 추천 생성 프롬프트
      const prompt = `사용자가 "${searchQuery}"로 검색했고, 다음과 같은 메모들을 찾았습니다:

${contextSummary}

위 검색 결과를 각 메모내용 중 빈번하게 등장하는 어휘를 바탕으로 맥락을 이해하고 최대한 추론하여 사용자가 가장 궁금해할 만한 3개의 구체적이고 실용적인 질문을 생성해주세요. 
각 질문은 검색된 내용과 연관성이 높고, 학습이나 이해를 깊게 할 수 있는 질문이어야 합니다. 질문은 최대 100자 이내로 작성해 주세요. 생각의 사슬을 이용하세요. 당신은 사용자의 생각을 이끌어 내는 레벨 7수준의 조력자입니다.

다음 JSON 형태로만 응답해주세요:
[
  {"text": "구체적인 질문 1", "relevance": 0.9},
  {"text": "구체적인 질문 2", "relevance": 0.8}, 
  {"text": "구체적인 질문 3", "relevance": 0.7}
]`;

      // LLM 호출
      const llmResponse = await this.llmService.generateResponse({
        message: prompt,
        searchContext: { query: searchQuery, results: searchResults },
        llmProvider: 'ChatGPT',
        llmModel: 'gpt-4',
        userId
      });

      // AI 응답 파싱
      return this.parseAIRecommendations(llmResponse.content, searchQuery);
      
    } catch (error) {
      console.error('AI 추천 생성 오류:', error);
      return this.getFallbackAIRecommendations(searchQuery);
    }
  }

  /**
   * AI 응답 파싱 (JSON 파싱 + 폴백)
   */
  private parseAIRecommendations(aiResponse: string, searchQuery: string): RecommendationQuery[] {
    try {
      // JSON 추출 시도 (AI가 추가 텍스트와 함께 응답할 수 있음)
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('JSON 형태를 찾을 수 없음');
      }

      const parsedRecommendations = JSON.parse(jsonMatch[0]);
      
      if (!Array.isArray(parsedRecommendations)) {
        throw new Error('배열 형태가 아님');
      }

      // AI 응답을 RecommendationQuery 형태로 변환
      return parsedRecommendations
        .filter(rec => rec.text && typeof rec.text === 'string')
        .slice(0, 3) // 최대 3개만
        .map((rec, index) => ({
          id: `ai-${Date.now()}-${index}`,
          text: rec.text.trim(),
          relevance: typeof rec.relevance === 'number' ? rec.relevance : 0.8 - (index * 0.1),
          category: 'ai-generated'
        }));

    } catch (error) {
      console.error('AI 응답 파싱 실패:', error, '원본 응답:', aiResponse);
      return this.getFallbackAIRecommendations(searchQuery);
    }
  }

  /**
   * AI 전용 폴백 추천 쿼리
   */
  private getFallbackAIRecommendations(searchQuery: string): RecommendationQuery[] {
    return [
      {
        id: `fallback-ai-${Date.now()}-1`,
        text: `${searchQuery}에 대해 더 자세히 알고 싶어요`,
        relevance: 0.6,
        category: 'ai-fallback'
      },
      {
        id: `fallback-ai-${Date.now()}-2`,
        text: `${searchQuery} 관련 실제 사례를 알려주세요`,
        relevance: 0.5,
        category: 'ai-fallback'
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