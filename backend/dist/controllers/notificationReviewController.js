"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReview = exports.getReviews = exports.markAllNotificationsAsRead = exports.markNotificationAsRead = exports.getUserNotifications = void 0;
const Notification_1 = require("../models/Notification");
const Review_1 = require("../models/Review");
// ==================== NOTIFICATIONS ====================
const getUserNotifications = async (req, res) => {
    try {
        const userId = req.user?.id;
        const notifications = await Notification_1.Notification.find({ userId }).sort({ createdAt: -1 }).limit(50);
        const unreadCount = await Notification_1.Notification.countDocuments({ userId, isRead: false });
        res.json({ success: true, count: notifications.length, unreadCount, notifications });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getUserNotifications = getUserNotifications;
const markNotificationAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification_1.Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
        res.json({ success: true, notification });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.markNotificationAsRead = markNotificationAsRead;
const markAllNotificationsAsRead = async (req, res) => {
    try {
        const userId = req.user?.id;
        await Notification_1.Notification.updateMany({ userId, isRead: false }, { isRead: true });
        res.json({ success: true, message: 'All notifications marked as read.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.markAllNotificationsAsRead = markAllNotificationsAsRead;
// ==================== REVIEWS ====================
const getReviews = async (req, res) => {
    try {
        const { targetType, targetId } = req.query;
        const filter = { isApproved: true };
        if (targetType)
            filter.targetType = targetType;
        if (targetId)
            filter.targetId = targetId;
        const reviews = await Review_1.Review.find(filter).sort({ createdAt: -1 });
        res.json({ success: true, count: reviews.length, reviews });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getReviews = getReviews;
const createReview = async (req, res) => {
    try {
        const { targetType, targetId, targetName, rating, comment, photos } = req.body;
        const review = await Review_1.Review.create({
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createReview = createReview;
