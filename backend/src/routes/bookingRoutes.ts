import { Router } from 'express';
import {
  getMyBookings,
  getOrganizerBookings,
  getAdminBookings,
  getBookingDetails,
  reserveEventTicket,
  cancelBooking,
  createBooking,
  updateBookingStatus,
} from '../controllers/bookingController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

// User & Host Bookings
router.get('/my-bookings', authenticateToken, getMyBookings);

// Organizer Bookings & Managed Services
router.get('/organizer', authenticateToken, authorizeRoles('ORGANIZER', 'ADMIN'), getOrganizerBookings);

// Admin Platform Bookings
router.get('/admin/all', authenticateToken, authorizeRoles('ADMIN'), getAdminBookings);

// Reserve / Book Event Tickets (Free & Paid)
router.post('/reserve', authenticateToken, reserveEventTicket);

// Create Legacy Service Booking
router.post('/', authenticateToken, createBooking);

// Single Booking Details
router.get('/:id', authenticateToken, getBookingDetails);

// Cancel Booking
router.post('/:id/cancel', authenticateToken, cancelBooking);

// Update Status (Organizer / Admin / Host)
router.patch('/:id/status', authenticateToken, updateBookingStatus);

export default router;

