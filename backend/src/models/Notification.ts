import mongoose, { Document, Schema } from 'mongoose';
import { INotification } from '../shared/types';

export interface INotificationDocument extends Omit<INotification, '_id'>, Document {}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: [
        'EVENT_CREATED',
        'VENUE_BOOKED',
        'PAYMENT_SUCCESS',
        'PAYMENT_FAILED',
        'EVENT_REMINDER',
        'GUEST_RSVP',
        'GUEST_CHECKIN',
        'LIVE_STARTED',
        'BOOKING_CANCELLED',
        'AI_ALERT',
      ],
      required: true,
    },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export const Notification = mongoose.model<INotificationDocument>('Notification', NotificationSchema);
