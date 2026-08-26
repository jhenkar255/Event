import { Request, Response } from 'express';
import { Notification } from '../models/Notification';
import { Review } from '../models/Review';
import { AuthRequest } from '../middleware/auth';

// ==================== NOTIFICATIONS ====================
export const getUserNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(50);
    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    res.json({ success: true, count: notifications.length, unreadCount, notifications });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markNotificationAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
    res.json({ success: true, notification });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAllNotificationsAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    await Notification.updateMany({ userId, isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== REVIEWS ====================
export const getReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { targetType, targetId } = req.query;
    const filter: any = { isApproved: true };

    if (targetType) filter.targetType = targetType;
    if (targetId) filter.targetId = targetId;

    const reviews = await Review.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: reviews.length, reviews });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { targetType, targetId, targetName, rating, comment, photos } = req.body;

    const review = await Review.create({
      userId: req.user?.id,
      userName: req.user?.name || 'Verified Customer',
      userPhoto: req.body.userPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      targetType,
      targetId,
      targetName,
      rating: Number(rating),
      comment,
      photos,
      isApproved: true,
    });

    res.status(201).json({ success: true, message: 'Thank you for your valuable review!', review });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
