import { Request, Response } from 'express';
import { AIService } from '../services/aiService';
import { AIRecommendation } from '../models/AIRecommendation';
import { AuthRequest } from '../middleware/auth';

export const generateEventPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const plan = await AIService.generateEventPlan(req.body);
    res.json({ success: true, plan });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const parseNaturalPrompt = async (req: Request, res: Response): Promise<void> => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      res.status(400).json({ success: false, message: 'Natural language prompt is required.' });
      return;
    }
    const parsed = AIService.parseNaturalPrompt(prompt);
    res.json({ success: true, parsed });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const optimizeBudget = async (req: Request, res: Response): Promise<void> => {
  try {
    const { totalBudget, priorityCategory } = req.body;
    const result = AIService.optimizeBudget(Number(totalBudget), priorityCategory);
    res.json({ success: true, result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const chatAssistant = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, eventContext } = req.body;
    if (!message) {
      res.status(400).json({ success: false, message: 'Message is required.' });
      return;
    }
    const response = await AIService.answerAssistantQuery(message, eventContext);
    res.json({ success: true, reply: response });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const saveRecommendation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { eventId, prompt, category, responsePayload } = req.body;
    const rec = await AIRecommendation.create({
      eventId,
      userId: req.user?.id || 'demo_user',
      prompt,
      category,
      responsePayload,
    });
    res.status(201).json({ success: true, recommendation: rec });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
