import { Router } from 'express';
import authRoutes from './authRoutes';
import eventRoutes from './eventRoutes';
import venueRoutes from './venueRoutes';
import guestRoutes from './guestRoutes';
import marketplaceRoutes from './marketplaceRoutes';
import designRoutes from './designRoutes';
import invitationRoutes from './invitationRoutes';
import paymentRoutes from './paymentRoutes';
import qrRoutes from './qrRoutes';
import liveStreamRoutes from './liveStreamRoutes';
import aiRoutes from './aiRoutes';
import notificationReviewRoutes from './notificationReviewRoutes';
import adminRoutes from './adminRoutes';
import bookingRoutes from './bookingRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/events', eventRoutes);
router.use('/venues', venueRoutes);
router.use('/guests', guestRoutes);
router.use('/marketplace', marketplaceRoutes);
router.use('/', designRoutes);
router.use('/invitations', invitationRoutes);
router.use('/payments', paymentRoutes);
router.use('/bookings', bookingRoutes);
router.use('/qr', qrRoutes);
router.use('/', liveStreamRoutes);
router.use('/ai', aiRoutes);
router.use('/', notificationReviewRoutes);
router.use('/admin', adminRoutes);

// API Root Info endpoint
router.get('/', (req, res) => {
  res.json({
    name: 'UtsavMitra API',
    tagline: 'Plan. Celebrate. Remember.',
    version: '1.0.0',
    status: 'online',
    health: '/api/health',
    endpoints: {
      auth: '/api/auth',
      events: '/api/events',
      venues: '/api/venues',
      guests: '/api/guests',
      marketplace: '/api/marketplace',
      invitations: '/api/invitations',
      payments: '/api/payments',
      qr: '/api/qr',
      ai: '/api/ai',
      admin: '/api/admin',
    },
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'UtsavMitra – AI-Powered Indian Event Management & Planning Platform',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: 'connected',
  });
});

export default router;
