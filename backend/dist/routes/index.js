"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authRoutes_1 = __importDefault(require("./authRoutes"));
const eventRoutes_1 = __importDefault(require("./eventRoutes"));
const venueRoutes_1 = __importDefault(require("./venueRoutes"));
const guestRoutes_1 = __importDefault(require("./guestRoutes"));
const marketplaceRoutes_1 = __importDefault(require("./marketplaceRoutes"));
const designRoutes_1 = __importDefault(require("./designRoutes"));
const invitationRoutes_1 = __importDefault(require("./invitationRoutes"));
const paymentRoutes_1 = __importDefault(require("./paymentRoutes"));
const qrRoutes_1 = __importDefault(require("./qrRoutes"));
const liveStreamRoutes_1 = __importDefault(require("./liveStreamRoutes"));
const aiRoutes_1 = __importDefault(require("./aiRoutes"));
const notificationReviewRoutes_1 = __importDefault(require("./notificationReviewRoutes"));
const adminRoutes_1 = __importDefault(require("./adminRoutes"));
const router = (0, express_1.Router)();
router.use('/auth', authRoutes_1.default);
router.use('/events', eventRoutes_1.default);
router.use('/venues', venueRoutes_1.default);
router.use('/guests', guestRoutes_1.default);
router.use('/marketplace', marketplaceRoutes_1.default);
router.use('/', designRoutes_1.default);
router.use('/invitations', invitationRoutes_1.default);
router.use('/payments', paymentRoutes_1.default);
router.use('/qr', qrRoutes_1.default);
router.use('/', liveStreamRoutes_1.default);
router.use('/ai', aiRoutes_1.default);
router.use('/', notificationReviewRoutes_1.default);
router.use('/admin', adminRoutes_1.default);
// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        status: 'online',
        platform: 'UtsavMitra – AI-Powered Indian Event Management & Planning Platform',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
    });
});
exports.default = router;
