import mongoose, { Document, Schema } from 'mongoose';
import { IDecoration } from '../../../shared/types';

export interface IDecorationDocument extends Omit<IDecoration, '_id'>, Document {}

const DecorationSchema = new Schema<IDecorationDocument>(
  {
    name: { type: String, required: true, trim: true, index: true },
    category: {
      type: String,
      enum: [
        'Stage',
        'Backdrop',
        'Entrance',
        'Flowers',
        'Balloons',
        'Lighting',
        'Ceiling',
        'Rangoli',
        'Mandap',
        'Tables',
        'Chairs',
        'Traditional Decor',
        'Modern Decor',
      ],
      required: true,
      index: true,
    },
    culturalStyle: { type: String, default: 'Custom' },
    description: { type: String, required: true },
    price: { type: Number, required: true, index: true },
    rating: { type: Number, default: 4.8 },
    photos: [{ type: String }],
    vendorName: { type: String, required: true },
    isAvailable: { type: Boolean, default: true },
    isDemo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Decoration = mongoose.model<IDecorationDocument>('Decoration', DecorationSchema);
