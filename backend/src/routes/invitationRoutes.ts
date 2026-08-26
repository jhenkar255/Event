import { Router } from 'express';
import {
  getInvitationByEvent,
  updateInvitation,
  getPublicInvitationByToken,
  submitPublicRSVP,
} from '../controllers/invitationController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/event/:eventId', authenticateToken, getInvitationByEvent);
router.put('/event/:eventId', authenticateToken, updateInvitation);

// Public invitation viewer & RSVP endpoints
router.get('/public/:token', getPublicInvitationByToken);
router.post('/public/:token/rsvp', submitPublicRSVP);

export default router;
