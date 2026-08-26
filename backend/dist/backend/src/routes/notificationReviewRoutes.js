"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notificationReviewController_1 = require("../controllers/notificationReviewController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Notifications
router.get('/notifications', auth_1.authenticateToken, notificationReviewController_1.getUserNotifications);
router.put('/notifications/:id/read', auth_1.authenticateToken, notificationReviewController_1.markNotificationAsRead);
router.put('/notifications/read-all', auth_1.authenticateToken, notificationReviewController_1.markAllNotificationsAsRead);
// Reviews
router.get('/reviews', notificationReviewController_1.getReviews);
router.post('/reviews', auth_1.authenticateToken, notificationReviewController_1.createReview);
exports.default = router;
