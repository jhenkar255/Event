import { Router } from 'express';
import { generateEventQR, verifyAndCheckInQR } from '../controllers/qrController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/event/:eventId', authenticateToken, generateEventQR);
router.post('/checkin', authenticateToken, verifyAndCheckInQR);

export default router;
