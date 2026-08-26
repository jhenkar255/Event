import { Router } from 'express';
import {
  createPaymentOrder,
  verifyPayment,
  getPaymentReceipt,
  getPaymentsByEvent,
} from '../controllers/paymentController';
import { optionalAuth } from '../middleware/auth';

const router = Router();

// Order creation endpoints (support both /order and /create-order)
router.post('/order', optionalAuth, createPaymentOrder);
router.post('/create-order', optionalAuth, createPaymentOrder);

// Payment verification endpoint
router.post('/verify', optionalAuth, verifyPayment);

// Receipt and logs
router.get('/receipt/:id', getPaymentReceipt);
router.get('/event/:eventId', optionalAuth, getPaymentsByEvent);

export default router;
