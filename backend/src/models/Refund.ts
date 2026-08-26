import mongoose, { Document, Schema } from 'mongoose';

export interface IRefundDocument extends Document {
  refundNumber: string;
  paymentId: mongoose.Types.ObjectId;
  bookingId?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  amount: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'PROCESSED' | 'REJECTED';
  processedAt?: Date;
  notes?: string;
  createdAt: Date;
}

const RefundSchema = new Schema<IRefundDocument>(
  {
    refundNumber: {
      type: String,
      unique: true,
      index: true,
      default: () => `REF-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
    },
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment', required: true },
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking' },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    amount: { type: Number, required: true },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'PROCESSED', 'REJECTED'],
      default: 'PENDING',
      index: true,
    },
    processedAt: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

export const Refund = mongoose.model<IRefundDocument>('Refund', RefundSchema);
