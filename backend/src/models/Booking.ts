import mongoose, { Document, Schema } from 'mongoose';
import { IBooking } from '../shared/types';

export interface IBookingDocument extends Omit<IBooking, '_id'>, Document {}

const BookingSchema = new Schema<IBookingDocument>(
  {
    bookingNumber: {
      type: String,
      unique: true,
      index: true,
      default: () => `UTS-BOOK-${Math.floor(100000 + Math.random() * 900000)}`,
    },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
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
    qrCodeId: { type: Schema.Types.ObjectId, ref: 'EventQRCode' },
    checkedIn: { type: Boolean, default: false },
    checkedInAt: { type: String },
    cancellationPolicy: { type: String },
    refundAmount: { type: Number, default: 0 },
    eventDate: { type: String },
    bookingNotes: { type: String },
  },
  { timestamps: true }
);

export const Booking = mongoose.model<IBookingDocument>('Booking', BookingSchema);

