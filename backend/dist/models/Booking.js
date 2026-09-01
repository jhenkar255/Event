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
exports.Booking = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const BookingSchema = new mongoose_1.Schema({
    bookingNumber: {
        type: String,
        unique: true,
        index: true,
        default: () => `UTS-BOOK-${Math.floor(100000 + Math.random() * 900000)}`,
    },
    eventId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    bookingType: {
        type: String,
        enum: ['EVENT_TICKET', 'VENDOR_SERVICE'],
        default: 'EVENT_TICKET',
        index: true,
    },
    ticketTier: { type: String, default: 'General' },
    ticketTypeId: { type: String },
    quantity: { type: Number, default: 1 },
    unitPrice: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    platformFee: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    itemType: {
        type: String,
        enum: ['EVENT_TICKET', 'VENUE', 'DECORATION', 'CATERING', 'ENTERTAINMENT', 'PACKAGE'],
        default: 'EVENT_TICKET',
    },
    itemId: { type: String },
    itemName: { type: String, default: 'Event Entry Ticket' },
    amount: { type: Number, required: true },
    advancePaid: { type: Number, default: 0 },
    balanceDue: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'REFUNDED', 'EXPIRED'],
        default: 'CONFIRMED',
        index: true,
    },
    bookingStatus: {
        type: String,
        enum: ['PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED', 'REFUNDED', 'EXPIRED', 'COMPLETED'],
        default: 'CONFIRMED',
        index: true,
    },
    paymentStatus: {
        type: String,
        enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
        default: 'PAID',
        index: true,
    },
    attendeeDetails: {
        name: { type: String },
        email: { type: String },
        phone: { type: String },
    },
    qrToken: { type: String },
    qrCodeId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'EventQRCode' },
    checkedIn: { type: Boolean, default: false },
    checkedInAt: { type: String },
    cancellationPolicy: { type: String },
    refundAmount: { type: Number, default: 0 },
    eventDate: { type: String },
    bookingNotes: { type: String },
}, { timestamps: true });
exports.Booking = mongoose_1.default.model('Booking', BookingSchema);
