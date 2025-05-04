import mongoose, { Document, Schema } from 'mongoose';

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  bookId: mongoose.Types.ObjectId;
  mode: string;
  startPage: number;
  endPage: number;
  actualEndPage: number | null;
  durationSec: number;
  ppm: number | null;
  memo: string | null;
  summary10words: string[] | null;
  selfRating: number | null;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  createdAt: Date;
}

const SessionSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  bookId: {
    type: Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  mode: {
    type: String,
    required: true,
    default: 'TS',
  },
  startPage: {
    type: Number,
    required: true,
    min: 0,
  },
  endPage: {
    type: Number,
    required: true,
    min: 1,
  },
  actualEndPage: {
    type: Number,
    default: null,
  },
  durationSec: {
    type: Number,
    default: 0,
  },
  ppm: {
    type: Number,
    default: null,
  },
  memo: {
    type: String,
    default: null,
    maxlength: 500,
  },
  summary10words: {
    type: [String],
    default: null,
  },
  selfRating: {
    type: Number,
    min: 1,
    max: 5,
    default: null,
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'cancelled'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Add indexes for common queries
SessionSchema.index({ userId: 1, bookId: 1 });
SessionSchema.index({ userId: 1, status: 1 });
SessionSchema.index({ createdAt: -1 });
SessionSchema.index({ userId: 1, createdAt: -1 }); // Index for fetching user sessions sorted by date
// Added index for efficient querying of recent PPM for a user's TS sessions
SessionSchema.index({ userId: 1, mode: 1, status: 1, createdAt: -1, ppm: 1 });

export default mongoose.model<ISession>('Session', SessionSchema); 