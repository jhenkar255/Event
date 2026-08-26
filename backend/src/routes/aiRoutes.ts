import { Router } from 'express';
import {
  generateEventPlan,
  parseNaturalPrompt,
  optimizeBudget,
  chatAssistant,
  saveRecommendation,
} from '../controllers/aiController';
import { optionalAuth, authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/plan', optionalAuth, generateEventPlan);
router.post('/parse-prompt', optionalAuth, parseNaturalPrompt);
router.post('/budget-optimize', optionalAuth, optimizeBudget);
router.post('/chat', optionalAuth, chatAssistant);
router.post('/save-recommendation', authenticateToken, saveRecommendation);

export default router;
