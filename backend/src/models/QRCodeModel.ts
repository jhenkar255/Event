import mongoose, { Document, Schema } from 'mongoose';

export interface IQRCodeDocument extends Document {
  eventId: mongoose.Types.ObjectId;
  guestId?: mongoose.Types.ObjectId;
  qrToken: string;
  qrDataUrl: string;
  invitationUrl: string;
  isUsed: boolean;
  usedAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const QRCodeSchema = new Schema<IQRCodeDocument>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    guestId: { type: Schema.Types.ObjectId, ref: 'Guest', index: true },
    qrToken: { type: String, required: true, unique: true, index: true },
    qrDataUrl: { type: String, required: true },
    invitationUrl: { type: String, required: true },
    isUsed: { type: Boolean, default: false, index: true },
    usedAt: { type: Date },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const QRCodeModel = mongoose.model<IQRCodeDocument>('QRCode', QRCodeSchema);
