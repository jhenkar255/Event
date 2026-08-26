import mongoose, { Document, Schema } from 'mongoose';
import { IReview } from '../../../shared/types';

export interface IReviewDocument extends Omit<IReview, '_id'>, Document {}

const ReviewSchema = new Schema<IReviewDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    userName: { type: String, required: true },
    userPhoto: { type: String },
    targetType: {
      type: String,
      enum: ['VENUE', 'CATERING', 'DECORATION', 'ENTERTAINMENT', 'ORGANIZER', 'PLATFORM'],
      required: true,
      index: true,
    },
    targetId: { type: String, required: true, index: true },
    targetName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    photos: [{ type: String }],
    reply: { type: String },
    isApproved: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Review = mongoose.model<IReviewDocument>('Review', ReviewSchema);
