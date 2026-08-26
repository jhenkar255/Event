import { Router } from 'express';
import { getVenues, getVenueById, bookVenue, createVenue } from '../controllers/venueController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

router.get('/', getVenues);
router.get('/:id', getVenueById);
router.post('/:id/book', authenticateToken, bookVenue);
router.post('/', authenticateToken, authorizeRoles('ADMIN', 'ORGANIZER'), createVenue);

export default router;
