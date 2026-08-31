"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const PaymentSchema = new mongoose_1.Schema({
    paymentId: {
        type: String,
        unique: true,
        index: true,
        default: () => `PAY-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
    },
    razorpayOrderId: { type: String, index: true },
    razorpayPaymentId: { type: String, index: true },
    razorpaySignature: { type: String },
    eventId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Event', required: false, index: true },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: false, index: true },
    bookingId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Booking' },
    serviceName: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    taxAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    method: {
        type: String,
        enum: ['UPI', 'CARD', 'NET_BANKING', 'NETBANKING', 'WALLET', 'DEMO_SIMULATION'],
        default: 'UPI',
    },
    status: {
        type: String,
        enum: ['PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'REFUNDED', 'CANCELLED'],
        default: 'PENDING',
        index: true,
    },
    receiptNumber: {
        type: String,
        default: () => `REC-${Date.now().toString().slice(-8)}`,
    },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
}, { timestamps: true });
exports.Payment = mongoose_1.default.model('Payment', PaymentSchema);
