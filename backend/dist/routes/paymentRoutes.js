"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const paymentController_1 = require("../controllers/paymentController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Order creation endpoints (support both /order and /create-order)
router.post('/order', auth_1.optionalAuth, paymentController_1.createPaymentOrder);
router.post('/create-order', auth_1.optionalAuth, paymentController_1.createPaymentOrder);
// Payment verification endpoint
router.post('/verify', auth_1.optionalAuth, paymentController_1.verifyPayment);
// Receipt and logs
router.get('/receipt/:id', paymentController_1.getPaymentReceipt);
router.get('/event/:eventId', auth_1.optionalAuth, paymentController_1.getPaymentsByEvent);
exports.default = router;
