import { Request, Response } from 'express';
import { ContextOrchestrator } from '../services/ContextOrchestrator';
import { PromptGenerator, SupportedModels } from '../services/PromptGenerator';
import { ResponseHandler } from '../services/ResponseHandler';
import User from '../models/User'; // 실제 사용자 모델
import { getAIClient } from '../lib/aiClients'; // AI 클라이언트 팩토리 (가상)

export const executeAILink = async (req: Request, res: Response) => {
  const { userId, aiLinkGoal, targetModel } = req.body;

  if (!userId || !aiLinkGoal || !targetModel) {
    return res.status(400).json({ error: 'userId, aiLinkGoal, targetModel are required.' });
  }

  try {
    // 1. 사용자 정보 조회
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // 2. 컨텍스트 조합
    const orchestrator = new ContextOrchestrator(user);
    const contextBundle = await orchestrator.getContextBundle(aiLinkGoal);

    // 3. 프롬프트 생성
    const promptGenerator = new PromptGenerator(targetModel as SupportedModels);
    const prompt = promptGenerator.generate(contextBundle, aiLinkGoal);

    // 4. 외부 AI API 호출
    // 사용자의 API 키는 요청 헤더나 세션에서 안전하게 받아와야 함 (여기서는 임시)
    const userApiKey = req.headers['x-user-api-key'] as string; 
    const aiClient = getAIClient(targetModel as SupportedModels, userApiKey);
    const aiResponse = await aiClient.completion(prompt);

    // 5. 응답 처리 및 가공
    const handler = new ResponseHandler(aiResponse, contextBundle);
    const formattedResponse = handler.formatForDisplay();
    
    // (선택) 새로운 지식 비동기 저장
    const newKnowledge = handler.extractNewKnowledge();
    if (newKnowledge.length > 0) {
      // TODO: GraphDB에 새로운 트리플 저장
      console.log('New knowledge to be saved:', newKnowledge);
    }
    
    res.status(200).json(formattedResponse);

  } catch (error) {
    console.error('AI-Link execution failed:', error);
    res.status(500).json({ error: 'An unexpected error occurred during AI-Link execution.' });
  }
}; 