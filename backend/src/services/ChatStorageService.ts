import { MongoClient, ObjectId } from 'mongodb';
import { LLMResponse } from './LLMService';
import { SearchResult } from '../types/search';

export interface Message {
  _id?: ObjectId;
  conversationId: ObjectId;
  senderId: ObjectId;
  senderType: 'user' | 'ai';
  timestamp: Date;
  content: string;
  contentType: string; // text, image, video
  embedding?: number[]; // OpenAI embedding for vector search
  keywords?: string[]; // Keywords for keyword search
  metadata: {
    llmModel?: string;
    llmProvider?: string;
    searchScore?: number;
    usage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
  };
}

export interface Conversation {
  _id?: ObjectId;
  participants: ObjectId[]; // Array of user IDs
  createdAt: Date;
  updatedAt: Date;
  metadata: {
    name: string; // Conversation name
    type: string; // Conversation type (private, group)
    searchContext?: {
      query: string;
      results: ObjectId[]; // IDs of searched memos
      filters?: any;
    };
  };
}

export interface ChatSearchResult {
  conversationId: ObjectId;
  messageId: ObjectId;
  content: string;
  timestamp: Date;
  senderType: 'user' | 'ai';
  relevance: number;
}

/**
 * 채팅 저장 및 관리 서비스
 * MongoDB를 사용하여 대화와 메시지를 저장하고 검색
 */
export class ChatStorageService {
  private client: MongoClient;
  private db: any;
  private conversations: any;
  private messages: any;

  constructor() {
    this.client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
    this.initialize();
  }

  /**
   * 서비스 초기화
   */
  private async initialize(): Promise<void> {
    try {
      await this.client.connect();
      this.db = this.client.db('habitus33');
      this.conversations = this.db.collection('conversations');
      this.messages = this.db.collection('messages');

      // 인덱스 생성
      await this.createIndexes();
      console.log('ChatStorageService 초기화 완료');
    } catch (error) {
      console.error('ChatStorageService 초기화 오류:', error);
      throw error;
    }
  }

  /**
   * 인덱스 생성
   */
  private async createIndexes(): Promise<void> {
    // conversations 컬렉션 인덱스
    await this.conversations.createIndex({ participants: 1 });
    await this.conversations.createIndex({ updatedAt: -1 });

    // messages 컬렉션 인덱스
    await this.messages.createIndex({ conversationId: 1, timestamp: -1 });
    await this.messages.createIndex({ senderId: 1, timestamp: -1 });
    await this.messages.createIndex({ keywords: 'text' }); // Atlas Search text index
    // await this.messages.createIndex({ embedding: 'vector' }); // Atlas Search vector index - 로컬 개발 환경에서는 비활성화
  }

  /**
   * 새 대화 생성
   * @param userId 사용자 ID
   * @param searchContext 검색 컨텍스트
   * @returns 생성된 대화 ID
   */
  async createConversation(
    userId: string,
    searchContext?: {
      query: string;
      results: SearchResult[];
      filters?: any;
    }
  ): Promise<ObjectId> {
    const conversation: Conversation = {
      participants: [new ObjectId(userId)],
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        name: searchContext ? `"${searchContext.query}" 검색 대화` : '새 대화',
        type: 'private',
        searchContext: searchContext ? {
          query: searchContext.query,
          results: searchContext.results.map(r => new ObjectId(r._id)), // string을 ObjectId로 변환
          filters: searchContext.filters
        } : undefined
      }
    };

    const result = await this.conversations.insertOne(conversation);
    return result.insertedId;
  }

  /**
   * 메시지 저장
   * @param conversationId 대화 ID
   * @param senderId 발신자 ID
   * @param senderType 발신자 타입 (user/ai)
   * @param content 메시지 내용
   * @param metadata 추가 메타데이터
   * @returns 저장된 메시지 ID
   */
  async saveMessage(
    conversationId: ObjectId,
    senderId: ObjectId,
    senderType: 'user' | 'ai',
    content: string,
    metadata: {
      llmModel?: string;
      llmProvider?: string;
      searchScore?: number;
      usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
      };
    } = {}
  ): Promise<ObjectId> {
    const message: Message = {
      conversationId,
      senderId,
      senderType,
      timestamp: new Date(),
      content,
      contentType: 'text',
      keywords: this.extractKeywords(content),
      metadata
    };

    const result = await this.messages.insertOne(message);

    // 대화 업데이트 시간 갱신
    await this.conversations.updateOne(
      { _id: conversationId },
      { $set: { updatedAt: new Date() } }
    );

    return result.insertedId;
  }

  /**
   * 사용자의 대화 목록 조회
   * @param userId 사용자 ID
   * @param limit 조회할 대화 수
   * @returns 대화 목록
   */
  async getConversations(userId: string, limit: number = 20): Promise<Conversation[]> {
    return await this.conversations
      .find({ participants: new ObjectId(userId) })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .toArray();
  }

  /**
   * 대화의 메시지 목록 조회
   * @param conversationId 대화 ID
   * @param limit 조회할 메시지 수
   * @returns 메시지 목록
   */
  async getMessages(conversationId: ObjectId, limit: number = 50): Promise<Message[]> {
    return await this.messages
      .find({ conversationId })
      .sort({ timestamp: 1 })
      .limit(limit)
      .toArray();
  }

  /**
   * 단일 대화 조회
   */
  async getConversation(conversationId: ObjectId): Promise<Conversation | null> {
    return await this.conversations.findOne({ _id: conversationId });
  }

  /**
   * 대화 메타데이터 갱신(부분 업데이트)
   */
  async updateConversationMetadata(
    conversationId: ObjectId,
    metadata: Partial<Conversation['metadata']>
  ): Promise<void> {
    await this.conversations.updateOne(
      { _id: conversationId },
      {
        $set: Object.fromEntries(
          Object.entries(metadata).map(([k, v]) => [`metadata.${k}`, v])
        ),
        $currentDate: { updatedAt: true }
      }
    );
  }

  /**
   * 채팅 히스토리 검색 (하이브리드 검색)
   * @param userId 사용자 ID
   * @param query 검색 쿼리
   * @param limit 조회할 결과 수
   * @returns 검색 결과
   */
  async searchChatHistory(
    userId: string,
    query: string,
    limit: number = 20
  ): Promise<ChatSearchResult[]> {
    try {
      // Atlas Search를 사용한 하이브리드 검색
      const searchResults = await this.messages.aggregate([
        {
          $match: {
            senderId: new ObjectId(userId)
          }
        },
        {
          $search: {
            index: 'default',
            compound: {
              should: [
                {
                  text: {
                    query: query,
                    path: 'content',
                    fuzzy: {
                      maxEdits: 1
                    }
                  }
                },
                {
                  text: {
                    query: query,
                    path: 'keywords'
                  }
                }
              ]
            }
          }
        },
        {
          $addFields: {
            relevance: { $meta: 'searchScore' }
          }
        },
        {
          $sort: { relevance: -1 }
        },
        {
          $limit: limit
        },
        {
          $project: {
            conversationId: 1,
            messageId: '$_id',
            content: 1,
            timestamp: 1,
            senderType: 1,
            relevance: 1
          }
        }
      ]).toArray();

      return searchResults;
    } catch (error) {
      console.error('채팅 히스토리 검색 오류:', error);
      // 폴백: 키워드 기반 검색
      return await this.fallbackSearch(userId, query, limit);
    }
  }

  /**
   * 폴백 검색 (Atlas Search가 실패할 경우)
   */
  private async fallbackSearch(
    userId: string,
    query: string,
    limit: number
  ): Promise<ChatSearchResult[]> {
    const keywords = this.extractKeywords(query);
    
    const results = await this.messages
      .find({
        senderId: new ObjectId(userId),
        $or: [
          { content: { $regex: query, $options: 'i' } },
          { keywords: { $in: keywords } }
        ]
      })
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();

    return results.map(msg => ({
      conversationId: msg.conversationId,
      messageId: msg._id,
      content: msg.content,
      timestamp: msg.timestamp,
      senderType: msg.senderType,
      relevance: 0.5 // 기본 관련성 점수
    }));
  }

  /**
   * 대화 삭제
   * @param conversationId 대화 ID
   * @param userId 사용자 ID (권한 확인용)
   * @returns 삭제 성공 여부
   */
  async deleteConversation(conversationId: ObjectId, userId: string): Promise<boolean> {
    try {
      // 권한 확인
      const conversation = await this.conversations.findOne({
        _id: conversationId,
        participants: new ObjectId(userId)
      });

      if (!conversation) {
        throw new Error('대화를 찾을 수 없거나 권한이 없습니다.');
      }

      // 메시지 삭제
      await this.messages.deleteMany({ conversationId });

      // 대화 삭제
      await this.conversations.deleteOne({ _id: conversationId });

      return true;
    } catch (error) {
      console.error('대화 삭제 오류:', error);
      return false;
    }
  }

  /**
   * 메시지 삭제
   * @param messageId 메시지 ID
   * @param userId 사용자 ID (권한 확인용)
   * @returns 삭제 성공 여부
   */
  async deleteMessage(messageId: ObjectId, userId: string): Promise<boolean> {
    try {
      const message = await this.messages.findOne({
        _id: messageId,
        senderId: new ObjectId(userId)
      });

      if (!message) {
        throw new Error('메시지를 찾을 수 없거나 권한이 없습니다.');
      }

      await this.messages.deleteOne({ _id: messageId });
      return true;
    } catch (error) {
      console.error('메시지 삭제 오류:', error);
      return false;
    }
  }

  /**
   * 대화 통계 조회
   * @param userId 사용자 ID
   * @returns 통계 정보
   */
  async getConversationStats(userId: string): Promise<{
    totalConversations: number;
    totalMessages: number;
    averageMessagesPerConversation: number;
    mostActiveDay: string;
    llmUsage: Record<string, number>;
  }> {
    const stats = {
      totalConversations: 0,
      totalMessages: 0,
      averageMessagesPerConversation: 0,
      mostActiveDay: '',
      llmUsage: {} as Record<string, number>
    };

    try {
      // 총 대화 수
      stats.totalConversations = await this.conversations.countDocuments({
        participants: new ObjectId(userId)
      });

      // 총 메시지 수
      stats.totalMessages = await this.messages.countDocuments({
        senderId: new ObjectId(userId)
      });

      // 대화당 평균 메시지 수
      if (stats.totalConversations > 0) {
        stats.averageMessagesPerConversation = Math.round(
          stats.totalMessages / stats.totalConversations
        );
      }

      // 가장 활발한 날
      const mostActiveDayResult = await this.messages.aggregate([
        {
          $match: { senderId: new ObjectId(userId) }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        },
        {
          $limit: 1
        }
      ]).toArray();

      if (mostActiveDayResult.length > 0) {
        stats.mostActiveDay = mostActiveDayResult[0]._id;
      }

      // LLM 사용 통계
      const llmUsageResult = await this.messages.aggregate([
        {
          $match: {
            senderId: new ObjectId(userId),
            senderType: 'ai',
            'metadata.llmProvider': { $exists: true }
          }
        },
        {
          $group: {
            _id: '$metadata.llmProvider',
            count: { $sum: 1 }
          }
        }
      ]).toArray();

      llmUsageResult.forEach(result => {
        stats.llmUsage[result._id] = result.count;
      });

    } catch (error) {
      console.error('통계 조회 오류:', error);
    }

    return stats;
  }

  /**
   * 내용에서 키워드 추출
   */
  private extractKeywords(content: string): string[] {
    // 간단한 키워드 추출 로직
    const words = content
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2 && /^[가-힣a-zA-Z]+$/.test(word))
      .slice(0, 10); // 상위 10개만

    return [...new Set(words)]; // 중복 제거
  }

  /**
   * 오래된 메시지 아카이브
   * @param days 보관할 일수
   */
  async archiveOldMessages(days: number = 90): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const oldMessages = await this.messages
        .find({ timestamp: { $lt: cutoffDate } })
        .toArray();

      if (oldMessages.length > 0) {
        // 아카이브 컬렉션에 저장
        await this.db.collection('messages_archive').insertMany(oldMessages);

        // 원본 메시지 삭제
        await this.messages.deleteMany({ timestamp: { $lt: cutoffDate } });

        console.log(`${oldMessages.length}개의 오래된 메시지를 아카이브했습니다.`);
      }
    } catch (error) {
      console.error('메시지 아카이브 오류:', error);
    }
  }

  /**
   * 연결 종료
   */
  async disconnect(): Promise<void> {
    await this.client.close();
  }
} 