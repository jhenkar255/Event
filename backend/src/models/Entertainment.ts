import mongoose, { Document, Schema } from 'mongoose';
import { IEntertainment } from '../../../shared/types';

export interface IEntertainmentDocument extends Omit<IEntertainment, '_id'>, Document {}

const EntertainmentSchema = new Schema<IEntertainmentDocument>(
  {
    name: { type: String, required: true, trim: true, index: true },
    category: {
      type: String,
      enum: [
        'DJ',
        'Live Band',
        'Classical Music',
        'Dhol',
        'Dance Performance',
        'Anchor',
        'Photography',
        'Videography',
        'Drone Photography',
        'Lighting & SFX',
        'Sound System',
        'Shehnai Troupe',
      ],
      required: true,
      index: true,
    },
    description: { type: String, required: true },
    price: { type: Number, required: true, index: true },
    durationHours: { type: Number, default: 4 },
    rating: { type: Number, default: 4.9 },
    vendorName: { type: String, required: true },
    photos: [{ type: String }],
    sampleAudioVideoUrl: { type: String },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Entertainment = mongoose.model<IEntertainmentDocument>('Entertainment', EntertainmentSchema);
