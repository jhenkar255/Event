import mongoose, { Document, Schema } from 'mongoose';
import { IInvitation } from '../../../shared/types';

export interface IInvitationDocument extends Omit<IInvitation, '_id'>, Document {}

const InvitationSchema = new Schema<IInvitationDocument>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, unique: true, index: true },
    templateId: { type: String, default: 'royal-rajasthani' },
    title: { type: String, required: true },
    hostNames: { type: String, required: true },
    eventDate: { type: String, required: true },
    eventTime: { type: String, required: true },
    venueName: { type: String, required: true },
    venueAddress: { type: String, required: true },
    customMessage: { type: String, required: true },
    shlokaOrQuote: { type: String },
    themeColor: { type: String, default: '#7A1F2B' },
    musicUrl: { type: String },
    coverImage: { type: String },
    photos: [{ type: String }],
    shareUrlToken: {
      type: String,
      unique: true,
      index: true,
      default: () => Math.random().toString(36).substring(2, 10) + Date.now().toString(36),
    },
  },
  { timestamps: true }
);

export const Invitation = mongoose.model<IInvitationDocument>('Invitation', InvitationSchema);
