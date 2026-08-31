import mongoose, { Document, Schema } from 'mongoose';
import { IEvent, EventStatus, EventType, CulturalTradition } from '../shared/types';

export interface IEventDocument extends Omit<IEvent, '_id'>, Document {}

const ChecklistItemSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    isCompleted: { type: Boolean, default: false },
    dueDate: { type: String },
    assignedTo: { type: String },
  },
  { _id: false }
);

const RiskAlertSchema = new Schema(
  {
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
  },
  { _id: false }
);

const LocationSchema = new Schema(
  {
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String },
    latitude: { type: Number, default: 26.9124 },
    longitude: { type: Number, default: 75.7873 },
  },
  { _id: false }
);

const EventSchema = new Schema<IEventDocument>(
  {
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
    venue: { type: Schema.Types.ObjectId, ref: 'Venue' },
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
    theme: { type: String, default: 'Royal Cultural Heritage' },
    status: {
      type: String,
      enum: ['DRAFT', 'PLANNING', 'CONFIRMED', 'ONGOING', 'COMPLETED', 'CANCELLED'] as EventStatus[],
      default: 'PLANNING',
      index: true,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    bannerImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    },
    checklist: [ChecklistItemSchema],
    riskAlerts: [RiskAlertSchema],
  },
  { timestamps: true }
);

export const Event = mongoose.model<IEventDocument>('Event', EventSchema);
