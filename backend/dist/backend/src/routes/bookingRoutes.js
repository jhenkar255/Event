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
// Specific Event Bookings
router.get('/event/:eventId', auth_1.authenticateToken, bookingController_1.getEventBookings);
// Create Service Booking
router.post('/', auth_1.authenticateToken, bookingController_1.createBooking);
// Update Status (Organizer / Admin / Host)
router.patch('/:id/status', auth_1.authenticateToken, bookingController_1.updateBookingStatus);
exports.default = router;
