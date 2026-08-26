"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Admin only routes
router.use(auth_1.authenticateToken, (0, auth_1.authorizeRoles)('ADMIN'));
router.get('/dashboard', adminController_1.getAdminDashboardStats);
router.get('/users', adminController_1.getAdminUsers);
router.put('/users/:id/role', adminController_1.updateAdminUserRole);
router.get('/events', adminController_1.getAdminEvents);
router.get('/payments', adminController_1.getAdminPayments);
router.get('/bookings', adminController_1.getAdminBookings);
router.get('/refunds', adminController_1.getAdminRefunds);
router.get('/export/:type', adminController_1.exportReportCsv);
exports.default = router;
