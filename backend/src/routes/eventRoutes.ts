import { Router } from 'express';
import {
  getEvents,
  createEvent,
  getEventById,
  updateEvent,
  deleteEvent,
  updateChecklist,
} from '../controllers/eventController';
import { getGuestsByEvent, addGuest } from '../controllers/guestController';
import { getPaymentsByEvent } from '../controllers/paymentController';
import {
  generateEventQR,
  getMyQRTicket,
  processEventCheckIn,
  getEventCheckIns,
  getEventAttendance,
  exportEventAttendanceCSV,
} from '../controllers/eventCheckInController';
import { authenticateToken, optionalAuth, requireEventStaff } from '../middleware/auth';
import { validateRequest, createEventSchema } from '../middleware/validation';

const router = Router();

router.get('/', optionalAuth, getEvents);
router.post('/', authenticateToken, validateRequest(createEventSchema), createEvent);

// QR Ticket & Gate Check-In Endpoints
router.post('/:eventId/qr', authenticateToken, generateEventQR);
router.get('/:eventId/my-qr', authenticateToken, getMyQRTicket);
router.post('/:eventId/check-in', authenticateToken, requireEventStaff, processEventCheckIn);
router.get('/:eventId/check-ins', authenticateToken, getEventCheckIns);
router.get('/:eventId/attendance', authenticateToken, getEventAttendance);
router.get('/:eventId/attendance/export', authenticateToken, exportEventAttendanceCSV);

router.get('/:id', optionalAuth, getEventById);
router.put('/:id', optionalAuth, updateEvent);
router.delete('/:id', optionalAuth, deleteEvent);
router.put('/:id/checklist', optionalAuth, updateChecklist);

// Convenient sub-routes for event-specific resources
router.get('/:eventId/guests', optionalAuth, getGuestsByEvent);
router.post('/:eventId/guests', optionalAuth, addGuest);
router.get('/:eventId/payments', optionalAuth, getPaymentsByEvent);

export default router;
