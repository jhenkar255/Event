"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaymentsByEvent = exports.getPaymentReceipt = exports.verifyPayment = exports.createPaymentOrder = void 0;
const paymentService_1 = require("../services/paymentService");
const Payment_1 = require("../models/Payment");
const socketService_1 = require("../services/socketService");
const createPaymentOrder = async (req, res) => {
    try {
        const { eventId, bookingId, serviceName, amount, customerName, customerEmail } = req.body;
        const orderData = await paymentService_1.PaymentService.createOrder({
            eventId,
            userId: req.user?.id || 'demo_user',
            bookingId,
            serviceName: serviceName || 'Event Booking Service',
            amount: Number(amount),
            customerName: customerName || req.user?.name || 'Customer',
            customerEmail: customerEmail || req.user?.email || 'customer@utsavmitra.demo',
        });
        res.status(201).json({
            success: true,
            message: 'Razorpay payment order initialized.',
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
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature, paymentRecordId, method, } = req.body;
        const result = await paymentService_1.PaymentService.verifyPayment({
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
            paymentRecordId,
            method,
        });
        if (result.success) {
            // Emit live budget update to event room
            socketService_1.SocketService.emitToEvent(result.payment.eventId.toString(), 'budget:payment_success', {
                paymentId: result.payment._id,
                amount: result.payment.totalAmount,
                service: result.payment.serviceName,
            });
            // Send notification to user
            socketService_1.SocketService.emitToUser(result.payment.userId.toString(), 'notification:new', {
                title: 'Payment Successful',
                message: `₹${result.payment.totalAmount.toLocaleString('en-IN')} paid for ${result.payment.serviceName}.`,
                type: 'PAYMENT_SUCCESS',
            });
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
            .reduce((acc, p) => acc + p.totalAmount, 0);
        res.json({ success: true, count: payments.length, payments, totalPaid });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getPaymentsByEvent = getPaymentsByEvent;
