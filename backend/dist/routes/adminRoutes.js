"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminAuthController_1 = require("../controllers/adminAuthController");
const adminController_1 = require("../controllers/adminController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
// ==========================================
// 1. PUBLIC ADMIN AUTHENTICATION
// ==========================================
router.post('/auth/login', (0, validation_1.validateRequest)(validation_1.loginSchema), adminAuthController_1.adminLogin);
router.post('/auth/logout', auth_1.authenticateToken, auth_1.requireAdmin, adminAuthController_1.adminLogout);
router.post('/auth/refresh', adminAuthController_1.adminRefreshToken);
router.post('/auth/forgot-password', (0, validation_1.validateRequest)(validation_1.forgotPasswordSchema), adminAuthController_1.adminForgotPassword);
router.post('/auth/reset-password', (0, validation_1.validateRequest)(validation_1.resetPasswordSchema), adminAuthController_1.adminResetPassword);
// ==========================================
// 2. PROTECTED ADMIN OPERATIONS
// ==========================================
router.get('/auth/me', auth_1.authenticateToken, auth_1.requireAdmin, adminAuthController_1.adminGetMe);
router.get('/dashboard', auth_1.authenticateToken, auth_1.requireAdmin, adminController_1.getAdminDashboardStats);
router.get('/audit-logs', auth_1.authenticateToken, auth_1.requireAdmin, adminController_1.getAuditLogs);
router.get('/users', auth_1.authenticateToken, auth_1.requireAdmin, adminController_1.getAdminUsers);
router.patch('/users/:id/role', auth_1.authenticateToken, auth_1.requireAdmin, adminController_1.updateAdminUserRole);
router.get('/organizers', auth_1.authenticateToken, auth_1.requireAdmin, adminController_1.getAdminOrganizers);
router.patch('/organizers/:id/status', auth_1.authenticateToken, auth_1.requireAdmin, adminController_1.updateOrganizerStatus);
router.post('/create-admin', auth_1.authenticateToken, auth_1.requireAdmin, adminController_1.createAdminByAdmin);
router.get('/events', auth_1.authenticateToken, auth_1.requireAdmin, adminController_1.getAdminEvents);
router.get('/payments', auth_1.authenticateToken, auth_1.requireAdmin, adminController_1.getAdminPayments);
router.get('/bookings', auth_1.authenticateToken, auth_1.requireAdmin, adminController_1.getAdminBookings);
router.get('/refunds', auth_1.authenticateToken, auth_1.requireAdmin, adminController_1.getAdminRefunds);
router.get('/export/:type', auth_1.authenticateToken, auth_1.requireAdmin, adminController_1.exportReportCsv);
exports.default = router;
