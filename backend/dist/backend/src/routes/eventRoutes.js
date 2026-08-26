"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const eventController_1 = require("../controllers/eventController");
const guestController_1 = require("../controllers/guestController");
const paymentController_1 = require("../controllers/paymentController");
const eventCheckInController_1 = require("../controllers/eventCheckInController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
router.get('/', auth_1.optionalAuth, eventController_1.getEvents);
router.post('/', auth_1.authenticateToken, (0, validation_1.validateRequest)(validation_1.createEventSchema), eventController_1.createEvent);
// QR Ticket & Gate Check-In Endpoints
router.post('/:eventId/qr', auth_1.authenticateToken, eventCheckInController_1.generateEventQR);
router.get('/:eventId/my-qr', auth_1.authenticateToken, eventCheckInController_1.getMyQRTicket);
router.post('/:eventId/check-in', auth_1.authenticateToken, auth_1.requireEventStaff, eventCheckInController_1.processEventCheckIn);
router.get('/:eventId/check-ins', auth_1.authenticateToken, eventCheckInController_1.getEventCheckIns);
router.get('/:eventId/attendance', auth_1.authenticateToken, eventCheckInController_1.getEventAttendance);
router.get('/:eventId/attendance/export', auth_1.authenticateToken, eventCheckInController_1.exportEventAttendanceCSV);
router.get('/:id', auth_1.optionalAuth, eventController_1.getEventById);
router.put('/:id', auth_1.optionalAuth, eventController_1.updateEvent);
router.delete('/:id', auth_1.optionalAuth, eventController_1.deleteEvent);
router.put('/:id/checklist', auth_1.optionalAuth, eventController_1.updateChecklist);
// Convenient sub-routes for event-specific resources
router.get('/:eventId/guests', auth_1.optionalAuth, guestController_1.getGuestsByEvent);
router.post('/:eventId/guests', auth_1.optionalAuth, guestController_1.addGuest);
router.get('/:eventId/payments', auth_1.optionalAuth, paymentController_1.getPaymentsByEvent);
exports.default = router;
