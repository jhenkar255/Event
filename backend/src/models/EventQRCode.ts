import mongoose, { Document, Schema } from 'mongoose';
import { IEventQRCode, QRCodeStatus } from '../shared/types';

export interface IEventQRCodeDocument extends Omit<IEventQRCode, '_id'>, Document {}

const EventQRCodeSchema = new Schema<IEventQRCodeDocument>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    guestId: { type: Schema.Types.ObjectId, ref: 'Guest', index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    token: { type: String, required: true, unique: true, index: true },
    tokenHash: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ['ACTIVE', 'USED', 'EXPIRED', 'CANCELLED'],
      default: 'ACTIVE',
      index: true,
    },
    expiresAt: { type: Date },
    lastUsedAt: { type: Date },
  },
  { timestamps: true }
);

EventQRCodeSchema.index({ eventId: 1, guestId: 1 });
EventQRCodeSchema.index({ eventId: 1, userId: 1 });

export const EventQRCode = mongoose.model<IEventQRCodeDocument>('EventQRCode', EventQRCodeSchema);
