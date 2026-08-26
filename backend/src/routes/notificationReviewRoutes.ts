import { Router } from 'express';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getReviews,
  createReview,
} from '../controllers/notificationReviewController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Notifications
router.get('/notifications', authenticateToken, getUserNotifications);
router.put('/notifications/:id/read', authenticateToken, markNotificationAsRead);
router.put('/notifications/read-all', authenticateToken, markAllNotificationsAsRead);

// Reviews
router.get('/reviews', getReviews);
router.post('/reviews', authenticateToken, createReview);

export default router;
