import mongoose, { Document, Schema } from 'mongoose';
import { IVenue } from '../shared/types';

export interface IVenueDocument extends Omit<IVenue, '_id'>, Document {}

const VenueSchema = new Schema<IVenueDocument>(
  {
    name: { type: String, required: true, trim: true, index: true },
    description: { type: String, required: true },
    city: { type: String, required: true, index: true },
    state: { type: String, required: true },
    address: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    capacity: {
      min: { type: Number, default: 50 },
      max: { type: Number, required: true },
    },
    pricePerDay: { type: Number, required: true, index: true },
    rating: { type: Number, default: 4.8, index: true },
    reviewCount: { type: Number, default: 0 },
    photos: [{ type: String }],
    features: {
      indoor: { type: Boolean, default: true },
      outdoor: { type: Boolean, default: true },
      parking: { type: Boolean, default: true },
      parkingCapacity: { type: Number, default: 100 },
      ac: { type: Boolean, default: true },
      cateringAvailable: { type: Boolean, default: true },
      roomsAvailable: { type: Number, default: 20 },
      alcoholAllowed: { type: Boolean, default: false },
      powerBackup: { type: Boolean, default: true },
    },
    vendorName: { type: String, required: true },
    vendorPhone: { type: String },
    vendorEmail: { type: String },
    isAvailable: { type: Boolean, default: true },
    isDemo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

VenueSchema.index({ city: 1, pricePerDay: 1, rating: -1 });

export const Venue = mongoose.model<IVenueDocument>('Venue', VenueSchema);
