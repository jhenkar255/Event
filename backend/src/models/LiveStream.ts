import mongoose, { Document, Schema } from 'mongoose';
import { ILiveStream } from '../shared/types';

export interface ILiveStreamDocument extends Omit<ILiveStream, '_id'>, Document {}

const AnnouncementSchema = new Schema(
  {
    id: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: String, default: () => new Date().toLocaleTimeString() },
    sender: { type: String, default: 'Organizer' },
  },
  { _id: false }
);

const LiveStreamSchema = new Schema<ILiveStreamDocument>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, unique: true, index: true },
    streamUrl: { type: String, default: 'https://www.youtube.com/embed/live_stream?channel=DEMO' },
    provider: {
      type: String,
      enum: ['YOUTUBE_LIVE', 'EMBEDDED', 'CUSTOM'],
      default: 'YOUTUBE_LIVE',
    },
    status: {
      type: String,
      enum: ['NOT_STARTED', 'LIVE', 'ENDED'],
      default: 'NOT_STARTED',
      index: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    scheduledStartTime: { type: String },
    viewerCount: { type: Number, default: 0 },
    isPrivate: { type: Boolean, default: false },
    accessCode: { type: String },
    announcements: [AnnouncementSchema],
  },
  { timestamps: true }
);

export const LiveStream = mongoose.model<ILiveStreamDocument>('LiveStream', LiveStreamSchema);
