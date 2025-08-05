import { Router, Request, Response } from 'express';
import { LLMService } from '../services/LLMService';
import { RecommendationQueryService } from '../services/RecommendationQueryService';
import { ChatStorageService } from '../services/ChatStorageService';
import { SearchContextService } from '../services/SearchContextService';
import { ObjectId } from 'mongodb';
import User from '../models/User';

const router = Router();

// 서비스 인스턴스 생성
const llmService = new LLMService();
const recommendationService = new RecommendationQueryService();
const chatStorageService = new ChatStorageService();

/**
 * 이메일로 사용자 ID 조회
 */
async function getUserIdFromEmail(email: string): Promise<string | null> {
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    return user?._id.toString() || null;
  } catch (error) {
    console.error('사용자 조회 오류:', error);
    return null;
  }
}

/**
 * AI 채팅 메시지 전송
 * POST /api/ai-chat/send
 */
router.post('/send', async (req: Request, res: Response) => {
  try {
    const {
      message,
      searchContext,
      llmProvider,
      llmModel,
      conversationId,
      userId
    } = req.body;

    console.log('🔍 send 요청 데이터:', {
      message: message?.substring(0, 50) + '...',
      searchContextQuery: searchContext?.query,
      llmProvider,
      llmModel,
      userId,
      userIdType: typeof userId
    });

    // 필수 필드 검증
    if (!message || !searchContext || !llmProvider || !userId) {
      console.log('❌ 필수 필드 누락:', { 
        message: !!message, 
        searchContext: !!searchContext, 
        llmProvider: !!llmProvider, 
        userId: !!userId 
      });
      return res.status(400).json({
        success: false,
        error: '필수 필드가 누락되었습니다.'
      });
    }

    // 이메일로 사용자 ID 조회
    const actualUserId = await getUserIdFromEmail(userId);
    console.log('🔍 사용자 조회 결과:', { inputUserId: userId, actualUserId });
    
    if (!actualUserId) {
      console.log('❌ 사용자를 찾을 수 없음:', userId);
      return res.status(400).json({
        success: false,
        error: '사용자를 찾을 수 없습니다.'
      });
    }

    // LLM 응답 생성
    const llmResponse = await llmService.generateResponse({
      message,
      searchContext,
      llmProvider,
      llmModel,
      conversationId,
      userId: actualUserId
    });

    // 대화 저장
    let currentConversationId = conversationId;
    if (!currentConversationId) {
      // 새 대화 생성
      currentConversationId = await chatStorageService.createConversation(
        actualUserId,
        searchContext
      );
    }

    // 사용자 메시지 저장
    await chatStorageService.saveMessage(
      new ObjectId(currentConversationId),
      new ObjectId(actualUserId),
      'user',
      message
    );

    // AI 응답 저장
    await chatStorageService.saveMessage(
      new ObjectId(currentConversationId),
      new ObjectId(actualUserId), // AI 메시지도 사용자 ID로 저장 (시스템 메시지 구분)
      'ai',
      llmResponse.content,
      {
        llmModel: llmResponse.model,
        llmProvider: llmResponse.provider,
        usage: llmResponse.usage
      }
    );

    // 사용자 쿼리 수집 (추천 시스템용)
    await recommendationService.collectUserQuery(
      message,
      searchContext.results,
      actualUserId
    );

    res.json({
      success: true,
      response: llmResponse.content,
      conversationId: currentConversationId,
      model: llmResponse.model,
      provider: llmResponse.provider,
      usage: llmResponse.usage
    });

  } catch (error) {
    console.error('AI 채팅 오류:', error);
    res.status(500).json({
      success: false,
      error: 'AI 응답 생성 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

/**
 * 추천 쿼리 생성
 * POST /api/ai-chat/recommendations
 */
router.post('/recommendations', async (req: Request, res: Response) => {
  try {
    const { searchQuery, searchResults, userId } = req.body;

    console.log('🔍 recommendations 요청 데이터:', {
      searchQuery,
      searchResultsCount: searchResults?.length,
      userId,
      userIdType: typeof userId
    });

    if (!searchQuery || !searchResults || !userId) {
      console.log('❌ 필수 필드 누락:', { searchQuery: !!searchQuery, searchResults: !!searchResults, userId: !!userId });
      return res.status(400).json({
        success: false,
        error: '필수 필드가 누락되었습니다.'
      });
    }

    // 이메일로 사용자 ID 조회
    const actualUserId = await getUserIdFromEmail(userId);
    console.log('🔍 사용자 조회 결과:', { inputUserId: userId, actualUserId });
    
    if (!actualUserId) {
      console.log('❌ 사용자를 찾을 수 없음:', userId);
      return res.status(400).json({
        success: false,
        error: '사용자를 찾을 수 없습니다.'
      });
    }

    const recommendations = await recommendationService.generateRecommendations(
      searchResults,
      searchQuery,
      actualUserId
    );

    res.json({
      success: true,
      recommendations
    });

  } catch (error) {
    console.error('추천 쿼리 생성 오류:', error);
    res.status(500).json({
      success: false,
      error: '추천 쿼리 생성 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

/**
 * 채팅 저장
 * POST /api/ai-chat/save
 */
router.post('/save', async (req: Request, res: Response) => {
  try {
    const { messages, searchContext, userId } = req.body;

    if (!messages || !userId) {
      return res.status(400).json({
        success: false,
        error: '필수 필드가 누락되었습니다.'
      });
    }

    // 이메일로 사용자 ID 조회
    const actualUserId = await getUserIdFromEmail(userId);
    if (!actualUserId) {
      return res.status(400).json({
        success: false,
        error: '사용자를 찾을 수 없습니다.'
      });
    }

    // 새 대화 생성
    const conversationId = await chatStorageService.createConversation(
      actualUserId,
      searchContext
    );

    // 메시지들 저장
    for (const message of messages) {
      await chatStorageService.saveMessage(
        conversationId,
        new ObjectId(actualUserId),
        message.sender,
        message.content,
        {
          llmModel: message.llmModel,
          llmProvider: message.llmProvider
        }
      );
    }

    res.json({
      success: true,
      conversationId: conversationId.toString(),
      message: '채팅이 성공적으로 저장되었습니다.'
    });

  } catch (error) {
    console.error('채팅 저장 오류:', error);
    res.status(500).json({
      success: false,
      error: '채팅 저장 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

/**
 * 대화 목록 조회
 * GET /api/ai-chat/conversations
 */
router.get('/conversations', async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    const limit = parseInt(req.query.limit as string) || 20;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: '사용자 ID가 필요합니다.'
      });
    }

    const conversations = await chatStorageService.getConversations(
      userId as string,
      limit
    );

    res.json({
      success: true,
      conversations
    });

  } catch (error) {
    console.error('대화 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '대화 목록 조회 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

/**
 * 대화 메시지 조회
 * GET /api/ai-chat/conversations/:conversationId/messages
 */
router.get('/conversations/:conversationId/messages', async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;

    if (!ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        success: false,
        error: '유효하지 않은 대화 ID입니다.'
      });
    }

    const messages = await chatStorageService.getMessages(
      new ObjectId(conversationId),
      limit
    );

    res.json({
      success: true,
      messages
    });

  } catch (error) {
    console.error('메시지 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '메시지 조회 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

/**
 * 채팅 히스토리 검색
 * GET /api/ai-chat/search
 */
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { userId, query } = req.query;
    const limit = parseInt(req.query.limit as string) || 20;

    if (!userId || !query) {
      return res.status(400).json({
        success: false,
        error: '사용자 ID와 검색 쿼리가 필요합니다.'
      });
    }

    const searchResults = await chatStorageService.searchChatHistory(
      userId as string,
      query as string,
      limit
    );

    res.json({
      success: true,
      results: searchResults
    });

  } catch (error) {
    console.error('채팅 검색 오류:', error);
    res.status(500).json({
      success: false,
      error: '채팅 검색 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

/**
 * 대화 삭제
 * DELETE /api/ai-chat/conversations/:conversationId
 */
router.delete('/conversations/:conversationId', async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.body;

    if (!ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        success: false,
        error: '유효하지 않은 대화 ID입니다.'
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: '사용자 ID가 필요합니다.'
      });
    }

    const success = await chatStorageService.deleteConversation(
      new ObjectId(conversationId),
      userId
    );

    if (success) {
      res.json({
        success: true,
        message: '대화가 성공적으로 삭제되었습니다.'
      });
    } else {
      res.status(404).json({
        success: false,
        error: '대화를 찾을 수 없거나 권한이 없습니다.'
      });
    }

  } catch (error) {
    console.error('대화 삭제 오류:', error);
    res.status(500).json({
      success: false,
      error: '대화 삭제 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

/**
 * 대화 통계 조회
 * GET /api/ai-chat/stats
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: '사용자 ID가 필요합니다.'
      });
    }

    const stats = await chatStorageService.getConversationStats(userId as string);

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('통계 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '통계 조회 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

/**
 * LLM 제공자 설정
 * POST /api/ai-chat/configure-llm
 */
router.post('/configure-llm', async (req: Request, res: Response) => {
  try {
    const { providerName, apiKey } = req.body;

    if (!providerName || !apiKey) {
      return res.status(400).json({
        success: false,
        error: '제공자 이름과 API 키가 필요합니다.'
      });
    }

    const success = await llmService.configureProvider(providerName, apiKey);

    if (success) {
      res.json({
        success: true,
        message: `${providerName} 설정이 완료되었습니다.`
      });
    } else {
      res.status(400).json({
        success: false,
        error: `${providerName} 설정에 실패했습니다. API 키를 확인해주세요.`
      });
    }

  } catch (error) {
    console.error('LLM 설정 오류:', error);
    res.status(500).json({
      success: false,
      error: 'LLM 설정 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

/**
 * 사용 가능한 LLM 제공자 목록 조회
 * GET /api/ai-chat/providers
 */
router.get('/providers', async (req: Request, res: Response) => {
  try {
    const providers = llmService.getAvailableProviders();

    res.json({
      success: true,
      providers
    });

  } catch (error) {
    console.error('제공자 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '제공자 목록 조회 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

export default router; 