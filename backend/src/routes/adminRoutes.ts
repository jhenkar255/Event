import { Router } from 'express';
import {
  adminLogin,
  adminLogout,
  adminRefreshToken,
  adminForgotPassword,
  adminResetPassword,
  adminGetMe,
} from '../controllers/adminAuthController';
import {
  getAdminDashboardStats,
  getAdminUsers,
  getAdminOrganizers,
  updateAdminUserRole,
  updateOrganizerStatus,
  getAuditLogs,
  createAdminByAdmin,
  getAdminEvents,
  getAdminPayments,
  getAdminBookings,
  getAdminRefunds,
  exportReportCsv,
} from '../controllers/adminController';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import {
  validateRequest,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../middleware/validation';

const router = Router();

// ==========================================
// 1. PUBLIC ADMIN AUTHENTICATION
// ==========================================
router.post('/auth/login', validateRequest(loginSchema), adminLogin);
router.post('/auth/logout', authenticateToken, requireAdmin, adminLogout);
router.post('/auth/refresh', adminRefreshToken);
router.post('/auth/forgot-password', validateRequest(forgotPasswordSchema), adminForgotPassword);
router.post('/auth/reset-password', validateRequest(resetPasswordSchema), adminResetPassword);

// ==========================================
// 2. PROTECTED ADMIN OPERATIONS
// ==========================================
router.get('/auth/me', authenticateToken, requireAdmin, adminGetMe);
router.get('/dashboard', authenticateToken, requireAdmin, getAdminDashboardStats);
router.get('/audit-logs', authenticateToken, requireAdmin, getAuditLogs);
router.get('/users', authenticateToken, requireAdmin, getAdminUsers);
router.patch('/users/:id/role', authenticateToken, requireAdmin, updateAdminUserRole);
router.get('/organizers', authenticateToken, requireAdmin, getAdminOrganizers);
router.patch('/organizers/:id/status', authenticateToken, requireAdmin, updateOrganizerStatus);
router.post('/create-admin', authenticateToken, requireAdmin, createAdminByAdmin);
router.get('/events', authenticateToken, requireAdmin, getAdminEvents);
router.get('/payments', authenticateToken, requireAdmin, getAdminPayments);
router.get('/bookings', authenticateToken, requireAdmin, getAdminBookings);
router.get('/refunds', authenticateToken, requireAdmin, getAdminRefunds);
router.get('/export/:type', authenticateToken, requireAdmin, exportReportCsv);

export default router;
