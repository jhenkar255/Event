import mongoose, { Document, Schema } from 'mongoose';
import { IEventDesign } from '../../../shared/types';

export interface IEventDesignDocument extends Omit<IEventDesign, '_id'>, Document {}

const DesignElementSchema = new Schema(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      enum: ['mandap', 'stage', 'entrance', 'rangoli', 'table', 'chair', 'lighting', 'photo_booth'],
      required: true,
    },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    rotation: { type: Number, default: 0 },
    color: { type: String },
    label: { type: String },
  },
  { _id: false }
);

const EventDesignSchema = new Schema<IEventDesignDocument>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, unique: true, index: true },
    elements: [DesignElementSchema],
    canvasWidth: { type: Number, default: 1200 },
    canvasHeight: { type: Number, default: 800 },
    themeName: { type: String, default: 'Royal Cultural Elegance' },
  },
  { timestamps: true }
);

export const EventDesign = mongoose.model<IEventDesignDocument>('EventDesign', EventDesignSchema);
