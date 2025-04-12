import mongoose, { Document, Schema } from 'mongoose';

export interface IBadge extends Document {
  userId: mongoose.Types.ObjectId;
  type: string;
  context: 'TS' | 'Zengo';
  relatedSessionId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const BadgeSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    required: true,
    trim: true,
  },
  context: {
    type: String,
    enum: ['TS', 'Zengo'],
    required: true,
  },
  relatedSessionId: {
    type: Schema.Types.ObjectId,
    refPath: 'context',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Adding index for user queries
BadgeSchema.index({ userId: 1, createdAt: -1 });
BadgeSchema.index({ userId: 1, type: 1 });

export default mongoose.model<IBadge>('Badge', BadgeSchema); 