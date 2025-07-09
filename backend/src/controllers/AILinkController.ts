import { Request, Response } from 'express';
import { ContextOrchestrator } from '../services/ContextOrchestrator';
import { PromptGenerator, SupportedModels } from '../services/PromptGenerator';
import { ResponseHandler } from '../services/ResponseHandler';
import User from '../models/User';
import { getAIClient } from '../lib/aiClients';

export const executeAILink = async (req: Request, res: Response) => {
  const { userId: bodyUserId, aiLinkGoal, targetProvider, targetModel } = req.body;
  const userId = bodyUserId || (req as any).user?._id;

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }
  if (!aiLinkGoal) {
    return res.status(400).json({ error: 'AI-Link goal is required' });
  }
  if (!targetProvider || !targetModel) {
    return res.status(400).json({ error: 'targetProvider and targetModel are required' });
  }

  try {
    const userApiKey = req.headers['x-user-api-key'] as string;
    if (!userApiKey) {
      return res.status(400).json({ error: 'API key is required in x-user-api-key header' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const orchestrator = new ContextOrchestrator(user);
    const contextBundle = await orchestrator.getContextBundle(aiLinkGoal);

    const promptGenerator = new PromptGenerator(targetProvider as SupportedModels);
    const prompt = promptGenerator.generate(contextBundle, aiLinkGoal);
    
    const aiClient = getAIClient(targetProvider as SupportedModels, userApiKey);
    const aiResponse = await aiClient.completion(prompt, targetModel);

    const handler = new ResponseHandler(aiResponse, contextBundle);
    const formattedResponse = handler.formatForDisplay();

    res.status(200).json(formattedResponse);
  } catch (error: any) {
    console.error('AI-Link execution failed:', error);
    res.status(500).json({
      error: 'An unexpected error occurred during AI-Link execution.',
      details: error.message,
    });
  }
}; 