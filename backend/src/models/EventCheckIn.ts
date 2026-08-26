import mongoose, { Document, Schema } from 'mongoose';
import { IEventCheckIn, CheckInResultType } from '../../../shared/types';

export interface IEventCheckInDocument extends Omit<IEventCheckIn, '_id'>, Document {}

const EventCheckInSchema = new Schema<IEventCheckInDocument>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    guestId: { type: Schema.Types.ObjectId, ref: 'Guest', index: true },
    qrCodeId: { type: Schema.Types.ObjectId, ref: 'EventQRCode', index: true },
    checkedIn: { type: Boolean, required: true, default: false, index: true },
    checkedInAt: { type: Date, default: Date.now, index: true },
    checkedInBy: { type: Schema.Types.ObjectId, ref: 'User' },
    gateName: { type: String, default: 'Main Gate', trim: true },
    result: {
      type: String,
      enum: [
        'VALID_CHECKIN',
        'ALREADY_CHECKED_IN',
        'INVALID_QR',
        'WRONG_EVENT',
        'EXPIRED_QR',
        'CANCELLED_INVITATION',
      ],
      required: true,
      index: true,
    },
    errorMessage: { type: String },
  },
  { timestamps: true }
);

EventCheckInSchema.index({ eventId: 1, checkedInAt: -1 });

export const EventCheckIn = mongoose.model<IEventCheckInDocument>('EventCheckIn', EventCheckInSchema);
