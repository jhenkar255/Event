import mongoose, { Document, Schema } from 'mongoose';
import { IPayment, PaymentStatus } from '../shared/types';

export interface IPaymentDocument extends Omit<IPayment, '_id'>, Document {}

const PaymentSchema = new Schema<IPaymentDocument>(
  {
    paymentId: {
      type: String,
      unique: true,
      index: true,
      default: () => `PAY-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
    },
    razorpayOrderId: { type: String, index: true },
    razorpayPaymentId: { type: String, index: true },
    razorpaySignature: { type: String },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: false, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: false, index: true },
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking' },
    serviceName: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    taxAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    method: {
      type: String,
      enum: ['UPI', 'CARD', 'NET_BANKING', 'WALLET', 'DEMO_SIMULATION'],
      default: 'UPI',
    },
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'REFUNDED', 'CANCELLED'] as PaymentStatus[],
      default: 'PENDING',
      index: true,
    },
    receiptNumber: {
      type: String,
      default: () => `REC-${Date.now().toString().slice(-8)}`,
    },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
  },
  { timestamps: true }
);

export const Payment = mongoose.model<IPaymentDocument>('Payment', PaymentSchema);
