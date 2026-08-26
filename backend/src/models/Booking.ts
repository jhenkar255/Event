import mongoose, { Document, Schema } from 'mongoose';
import { IBooking } from '../shared/types';

export interface IBookingDocument extends Omit<IBooking, '_id'>, Document {}

const BookingSchema = new Schema<IBookingDocument>(
  {
    bookingNumber: {
      type: String,
      unique: true,
      index: true,
      default: () => `BKG-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
    },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    itemType: {
      type: String,
      enum: ['VENUE', 'DECORATION', 'CATERING', 'ENTERTAINMENT', 'PACKAGE'],
      required: true,
    },
    itemId: { type: String, required: true },
    itemName: { type: String, required: true },
    amount: { type: Number, required: true },
    advancePaid: { type: Number, default: 0 },
    balanceDue: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'],
      default: 'PENDING',
      index: true,
    },
    eventDate: { type: String, required: true },
    bookingNotes: { type: String },
  },
  { timestamps: true }
);

export const Booking = mongoose.model<IBookingDocument>('Booking', BookingSchema);
