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
exports.Event = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ChecklistItemSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    isCompleted: { type: Boolean, default: false },
    dueDate: { type: String },
    assignedTo: { type: String },
}, { _id: false });
const RiskAlertSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    type: {
        type: String,
        enum: ['BUDGET', 'VENUE', 'CATERING', 'SEATING', 'PAYMENT', 'RSVP', 'DEADLINE'],
        required: true,
    },
    severity: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
        default: 'MEDIUM',
    },
    message: { type: String, required: true },
    suggestedAction: { type: String },
    isResolved: { type: Boolean, default: false },
}, { _id: false });
const LocationSchema = new mongoose_1.Schema({
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String },
    latitude: { type: Number, default: 26.9124 },
    longitude: { type: Number, default: 75.7873 },
}, { _id: false });
const EventSchema = new mongoose_1.Schema({
    eventId: {
        type: String,
        unique: true,
        index: true,
        default: () => `EVT-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
    },
    name: { type: String, required: true, trim: true, index: true },
    type: {
        type: String,
        required: true,
        index: true,
    },
    category: {
        type: String,
        default: 'Wedding & Family',
        index: true,
    },
    subcategory: {
        type: String,
        index: true,
    },
    institutionName: { type: String, index: true },
    department: { type: String },
    academicYear: { type: String },
    organizerName: { type: String },
    culturalTradition: {
        type: String,
        default: 'Custom',
        index: true,
    },
    description: { type: String },
    date: { type: String, required: true, index: true },
    time: { type: String },
    startTime: { type: String, default: '10:00 AM' },
    endTime: { type: String, default: '10:00 PM' },
    venue: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Venue' },
    location: { type: LocationSchema, required: true },
    guestCount: { type: Number, required: true, default: 100 },
    capacity: { type: Number, default: 500 },
    availableSeats: { type: Number, default: 500 },
    registeredCount: { type: Number, default: 0 },
    budget: { type: Number, required: true, default: 500000 },
    spentBudget: { type: Number, default: 0 },
    price: { type: Number, default: 0 },
    ticketPrice: { type: Number, default: 0 },
    isFree: { type: Boolean, default: true },
    eventFormat: {
        type: String,
        enum: ['IN_PERSON', 'ONLINE', 'HYBRID'],
        default: 'IN_PERSON',
    },
    streamUrl: { type: String },
    meetingPlatform: { type: String },
    certificateProvided: { type: Boolean, default: false },
    registrationDeadline: { type: String },
    isLive: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    speakers: [
        {
            name: { type: String },
            designation: { type: String },
            organization: { type: String },
            topic: { type: String },
            photo: { type: String },
        },
    ],
    chiefGuests: [{ type: String }],
    sponsors: [
        {
            name: { type: String },
            tier: { type: String },
            logo: { type: String },
        },
    ],
    schedule: [
        {
            time: { type: String },
            title: { type: String },
            description: { type: String },
            speaker: { type: String },
        },
    ],
    visibility: {
        type: String,
        enum: ['PUBLIC', 'PRIVATE', 'INVITATION_ONLY'],
        default: 'PUBLIC',
        index: true,
    },
    ticketTiers: [
        {
            id: { type: String },
            name: { type: String, default: 'General' },
            price: { type: Number, default: 0 },
            capacity: { type: Number, default: 100 },
            availableSeats: { type: Number, default: 100 },
            description: { type: String },
        },
    ],
    bookingStartDate: { type: String },
    bookingEndDate: { type: String },
    isSoldOut: { type: Boolean, default: false },
    isRegistrationClosed: { type: Boolean, default: false },
    cancellationPolicy: {
        type: String,
        default: 'Free cancellation up to 48 hours prior to event commencement. 100% refund processed within 3-5 working days.',
    },
    refundPolicy: {
        type: String,
        default: '100% refund for cancellation 48h prior. 50% refund 24h prior. No refund on event day.',
    },
    termsAndConditions: {
        type: String,
        default: 'Please present your unique UtsavMitra QR code at entry gate. Admission is subject to security checks.',
    },
    distanceKm: { type: Number, default: 2.5 },
    theme: { type: String, default: 'Royal Cultural Heritage' },
    status: {
        type: String,
        enum: ['DRAFT', 'PLANNING', 'CONFIRMED', 'ONGOING', 'COMPLETED', 'CANCELLED'],
        default: 'PLANNING',
        index: true,
    },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    bannerImage: {
        type: String,
        default: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    },
    checklist: [ChecklistItemSchema],
    riskAlerts: [RiskAlertSchema],
}, { timestamps: true });
exports.Event = mongoose_1.default.model('Event', EventSchema);
