import { Router } from 'express';
import {
  getLiveStream,
  updateLiveStream,
  postAnnouncement,
} from '../controllers/liveStreamController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/events/:eventId/live', getLiveStream);
router.put('/events/:eventId/live', authenticateToken, updateLiveStream);
router.post('/events/:eventId/live/announcements', authenticateToken, postAnnouncement);

export default router;
