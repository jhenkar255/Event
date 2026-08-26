import mongoose, { Document, Schema } from 'mongoose';
import { ICateringPackage } from '../../../shared/types';

export interface ICateringDocument extends Omit<ICateringPackage, '_id'>, Document {}

const CateringSchema = new Schema<ICateringDocument>(
  {
    name: { type: String, required: true, trim: true, index: true },
    category: {
      type: String,
      enum: [
        'Veg',
        'Non-Veg',
        'Jain',
        'Vegan',
        'South Indian',
        'North Indian',
        'Continental',
        'Royal Rajasthani',
        'Gujarati Thali',
        'Bengali Feast',
      ],
      required: true,
      index: true,
    },
    description: { type: String, required: true },
    pricePerPlate: { type: Number, required: true, index: true },
    minimumGuests: { type: Number, default: 50 },
    menuItems: {
      welcomeDrinks: [{ type: String }],
      starters: [{ type: String }],
      mainCourse: [{ type: String }],
      breadsAndRice: [{ type: String }],
      desserts: [{ type: String }],
      liveCounters: [{ type: String }],
    },
    rating: { type: Number, default: 4.9 },
    vendorName: { type: String, required: true },
    photos: [{ type: String }],
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Catering = mongoose.model<ICateringDocument>('Catering', CateringSchema);
