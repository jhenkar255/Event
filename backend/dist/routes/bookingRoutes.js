"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bookingController_1 = require("../controllers/bookingController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// User & Host Bookings
router.get('/my-bookings', auth_1.authenticateToken, bookingController_1.getMyBookings);
// Organizer Bookings & Managed Services
router.get('/organizer', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('ORGANIZER', 'ADMIN'), bookingController_1.getOrganizerBookings);
// Admin Platform Bookings
router.get('/admin/all', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('ADMIN'), bookingController_1.getAdminBookings);
// Reserve / Book Event Tickets (Free & Paid)
router.post('/reserve', auth_1.authenticateToken, bookingController_1.reserveEventTicket);
// Create Legacy Service Booking
router.post('/', auth_1.authenticateToken, bookingController_1.createBooking);
// Single Booking Details
router.get('/:id', auth_1.authenticateToken, bookingController_1.getBookingDetails);
// Cancel Booking
router.post('/:id/cancel', auth_1.authenticateToken, bookingController_1.cancelBooking);
// Update Status (Organizer / Admin / Host)
router.patch('/:id/status', auth_1.authenticateToken, bookingController_1.updateBookingStatus);
exports.default = router;
