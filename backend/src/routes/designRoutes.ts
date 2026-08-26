import { Router } from 'express';
import {
  getEventDesign,
  saveEventDesign,
  getSeatingLayout,
  saveSeatingLayout,
  assignGuestToTable,
} from '../controllers/designController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// 2D Visual Design Canvas
router.get('/events/:eventId/design', authenticateToken, getEventDesign);
router.post('/events/:eventId/design', authenticateToken, saveEventDesign);

// Seating Layout & Table Allocation
router.get('/events/:eventId/seating', authenticateToken, getSeatingLayout);
router.post('/events/:eventId/seating', authenticateToken, saveSeatingLayout);
router.post('/events/:eventId/seating/assign', authenticateToken, assignGuestToTable);

export default router;
