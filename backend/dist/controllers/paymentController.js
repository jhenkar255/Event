"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaymentsByEvent = exports.getPaymentReceipt = exports.verifyPayment = exports.createPaymentOrder = void 0;
const paymentService_1 = require("../services/paymentService");
const Payment_1 = require("../models/Payment");
const socketService_1 = require("../services/socketService");
const createPaymentOrder = async (req, res) => {
    try {
        const { eventId, bookingId, serviceName, purpose, amount, customerName, customerEmail } = req.body;
        const orderData = await paymentService_1.PaymentService.createOrder({
            eventId,
            userId: req.user?.id,
            bookingId,
            serviceName: purpose || serviceName || 'UtsavMitra Celebration Escrow',
            amount: Number(amount),
            customerName: customerName || req.user?.name || 'Valued Guest',
            customerEmail: customerEmail || req.user?.email || 'guest@utsavmitra.in',
        });
        res.status(201).json({
            success: true,
            message: 'Razorpay payment order initialized.',
            mockSignature: `sig_mock_${orderData.orderId}_utsavmitra`,
            ...orderData,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createPaymentOrder = createPaymentOrder;
const verifyPayment = async (req, res) => {
    try {
        const { razorpayOrderId, razorpay_order_id, razorpayPaymentId, razorpay_payment_id, razorpaySignature, razorpay_signature, paymentRecordId, method, paymentMethod, bookingId, eventId, amount, purpose, serviceName, } = req.body;
        const finalOrderId = razorpayOrderId || razorpay_order_id;
        const finalPaymentId = razorpayPaymentId || razorpay_payment_id || `pay_${Date.now()}_simulated`;
        const finalSignature = razorpaySignature || razorpay_signature || 'simulated_valid_signature';
        const rawMethod = (method || paymentMethod || 'UPI').toUpperCase().replace(/[\s-]+/g, '_');
        let finalMethod = 'UPI';
        if (rawMethod === 'NETBANKING' || rawMethod === 'NET_BANKING') {
            finalMethod = 'NET_BANKING';
        }
        else if (rawMethod === 'CARD' || rawMethod === 'CARDS') {
            finalMethod = 'CARD';
        }
        else if (rawMethod === 'WALLET') {
            finalMethod = 'WALLET';
        }
        else if (rawMethod === 'DEMO_SIMULATION') {
            finalMethod = 'DEMO_SIMULATION';
        }
        const result = await paymentService_1.PaymentService.verifyPayment({
            razorpayOrderId: finalOrderId,
            razorpayPaymentId: finalPaymentId,
            razorpaySignature: finalSignature,
            paymentRecordId,
            bookingId,
            eventId,
            amount,
            serviceName: purpose || serviceName,
            userId: req.user?.id,
            method: finalMethod,
        });
        if (result.success && result.payment) {
            // Emit live budget update to event room if eventId is available
            if (result.payment.eventId) {
                socketService_1.SocketService.emitToEvent(result.payment.eventId.toString(), 'budget:payment_success', {
                    paymentId: result.payment.paymentId,
                    amount: result.payment.totalAmount || result.payment.amount || 0,
                    service: result.payment.serviceName,
                });
            }
            // Send notification to user if userId is available
            if (result.payment.userId) {
                socketService_1.SocketService.emitToUser(result.payment.userId.toString(), 'notification:new', {
                    title: 'Payment Successful',
                    message: `₹${(result.payment.totalAmount || result.payment.amount || 0).toLocaleString('en-IN')} paid for ${result.payment.serviceName}.`,
                    type: 'PAYMENT_SUCCESS',
                });
            }
        }
        res.json(result);
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.verifyPayment = verifyPayment;
const getPaymentReceipt = async (req, res) => {
    try {
        const { id } = req.params;
        const receipt = await paymentService_1.PaymentService.getReceiptData(id);
        res.json({ success: true, receipt });
    }
    catch (error) {
        res.status(404).json({ success: false, message: error.message });
    }
};
exports.getPaymentReceipt = getPaymentReceipt;
const getPaymentsByEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const payments = await Payment_1.Payment.find({ eventId }).sort({ createdAt: -1 });
        const totalPaid = payments
            .filter((p) => p.status === 'SUCCESS')
            .reduce((acc, p) => acc + (p.totalAmount || p.amount || 0), 0);
        res.json({ success: true, count: payments.length, payments, totalPaid });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getPaymentsByEvent = getPaymentsByEvent;
