import mongoose, { Document, Schema } from 'mongoose';
import { IEventSchedule } from '../shared/types';

export interface IEventScheduleDocument extends Omit<IEventSchedule, '_id'>, Document {}

const ActivitySchema = new Schema(
  {
    id: { type: String, required: true },
    time: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    location: { type: String },
    isCompleted: { type: Boolean, default: false },
  },
  { _id: false }
);

const EventScheduleSchema = new Schema<IEventScheduleDocument>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, unique: true, index: true },
    activities: [ActivitySchema],
  },
  { timestamps: true }
);

export const EventSchedule = mongoose.model<IEventScheduleDocument>('EventSchedule', EventScheduleSchema);
