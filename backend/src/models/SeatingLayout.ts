import mongoose, { Document, Schema } from 'mongoose';
import { ISeatingLayout } from '../../../shared/types';

export interface ISeatingLayoutDocument extends Omit<ISeatingLayout, '_id'>, Document {}

const TableSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    shape: {
      type: String,
      enum: ['round', 'rect', 'theatre_row'],
      default: 'round',
    },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    capacity: { type: Number, required: true, default: 8 },
    assignedGuests: [{ type: String }],
  },
  { _id: false }
);

const SeatingLayoutSchema = new Schema<ISeatingLayoutDocument>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, unique: true, index: true },
    layoutType: {
      type: String,
      enum: ['Round Tables', 'Rectangle Tables', 'Theatre', 'Classroom', 'Banquet', 'Custom'],
      default: 'Round Tables',
    },
    tables: [TableSchema],
    totalSeats: { type: Number, default: 0 },
    assignedSeats: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const SeatingLayout = mongoose.model<ISeatingLayoutDocument>('SeatingLayout', SeatingLayoutSchema);
