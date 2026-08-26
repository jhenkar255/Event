import { Router } from 'express';
import {
  getDecorations,
  createDecoration,
  getCateringPackages,
  createCateringPackage,
  getEntertainment,
  createEntertainment,
} from '../controllers/marketplaceController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

// Decorations
router.get('/decorations', getDecorations);
router.post('/decorations', authenticateToken, authorizeRoles('ADMIN', 'ORGANIZER'), createDecoration);

// Catering
router.get('/catering', getCateringPackages);
router.post('/catering', authenticateToken, authorizeRoles('ADMIN', 'ORGANIZER'), createCateringPackage);

// Entertainment
router.get('/entertainment', getEntertainment);
router.post('/entertainment', authenticateToken, authorizeRoles('ADMIN', 'ORGANIZER'), createEntertainment);

export default router;
