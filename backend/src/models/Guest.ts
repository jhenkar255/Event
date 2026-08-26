import mongoose, { Document, Schema } from 'mongoose';
import { IGuest } from '../shared/types';

export interface IGuestDocument extends Omit<IGuest, '_id'>, Document {}

const GuestSchema = new Schema<IGuestDocument>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    relationship: {
      type: String,
      enum: ['Family', 'Friend', 'Colleague', 'VIP', 'Relative', 'Other'],
      default: 'Relative',
    },
    group: { type: String, default: 'General' },
    invitationStatus: {
      type: String,
      enum: ['NOT_SENT', 'SENT', 'OPENED', 'FAILED'],
      default: 'NOT_SENT',
    },
    rsvpStatus: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'DECLINED', 'TENTATIVE'],
      default: 'PENDING',
      index: true,
    },
    mealPreference: {
      type: String,
      enum: ['Veg', 'Non-Veg', 'Jain', 'Vegan'],
      default: 'Veg',
    },
    plusGuests: { type: Number, default: 0 },
    assignedTable: { type: String },
    assignedSeat: { type: String },
    checkInStatus: { type: Boolean, default: false, index: true },
    checkInTime: { type: String },
    qrToken: { type: String, index: true },
  },
  { timestamps: true }
);

GuestSchema.index({ eventId: 1, checkInStatus: 1 });

export const Guest = mongoose.model<IGuestDocument>('Guest', GuestSchema);
