import { Router } from 'express';
import {
  getMyBookings,
  getOrganizerBookings,
  getEventBookings,
  createBooking,
  updateBookingStatus,
} from '../controllers/bookingController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

// User & Host Bookings
router.get('/my-bookings', authenticateToken, getMyBookings);

// Organizer Bookings & Managed Services
router.get('/organizer', authenticateToken, authorizeRoles('ORGANIZER', 'ADMIN'), getOrganizerBookings);

// Specific Event Bookings
router.get('/event/:eventId', authenticateToken, getEventBookings);

// Create Service Booking
router.post('/', authenticateToken, createBooking);

// Update Status (Organizer / Admin / Host)
router.patch('/:id/status', authenticateToken, updateBookingStatus);

export default router;
