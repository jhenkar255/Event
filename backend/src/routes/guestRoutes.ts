import { Router } from 'express';
import {
  getGuestsByEvent,
  addGuest,
  updateGuest,
  deleteGuest,
  importGuestsCsv,
  updateRSVP,
} from '../controllers/guestController';
import { authenticateToken } from '../middleware/auth';
import { validateRequest, guestSchema } from '../middleware/validation';

const router = Router();

router.get('/event/:eventId', authenticateToken, getGuestsByEvent);
router.post('/event/:eventId', authenticateToken, validateRequest(guestSchema), addGuest);
router.post('/event/:eventId/import', authenticateToken, importGuestsCsv);
router.put('/:id', authenticateToken, updateGuest);
router.delete('/:id', authenticateToken, deleteGuest);
router.put('/:id/rsvp', updateRSVP); // Open for guest response

export default router;
