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
    culturalTradition: {
        type: String,
        default: 'Custom',
        index: true,
    },
    description: { type: String },
    date: { type: String, required: true, index: true },
    startTime: { type: String, default: '10:00 AM' },
    endTime: { type: String, default: '10:00 PM' },
    venue: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Venue' },
    location: { type: LocationSchema, required: true },
    guestCount: { type: Number, required: true, default: 100 },
    budget: { type: Number, required: true, default: 500000 },
    spentBudget: { type: Number, default: 0 },
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
