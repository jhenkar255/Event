import mongoose, { Document, Schema } from 'mongoose';

export interface IAIRecommendationDocument extends Document {
  eventId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  prompt: string;
  category: 'PLAN' | 'BUDGET' | 'CATERING' | 'DECOR' | 'TIMELINE' | 'OPTIMIZATION';
  responsePayload: Record<string, any>;
  applied: boolean;
  createdAt: Date;
}

const AIRecommendationSchema = new Schema<IAIRecommendationDocument>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    prompt: { type: String, required: true },
    category: {
      type: String,
      enum: ['PLAN', 'BUDGET', 'CATERING', 'DECOR', 'TIMELINE', 'OPTIMIZATION'],
      default: 'PLAN',
    },
    responsePayload: { type: Schema.Types.Mixed, required: true },
    applied: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const AIRecommendation = mongoose.model<IAIRecommendationDocument>(
  'AIRecommendation',
  AIRecommendationSchema
);
