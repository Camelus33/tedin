import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IWarmupBatch extends Document {
  userId: Types.ObjectId;
  sessionId: Types.ObjectId;
  warmupVersion: string;
  device?: {
    width?: number;
    height?: number;
    dpr?: number;
    reducedMotion?: boolean;
  };
  createdAt: Date;
}

const WarmupBatchSchema = new Schema<IWarmupBatch>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  sessionId: { type: Schema.Types.ObjectId, ref: 'Session', required: true, index: true },
  warmupVersion: { type: String, required: true },
  device: {
    width: { type: Number },
    height: { type: Number },
    dpr: { type: Number },
    reducedMotion: { type: Boolean },
  },
  createdAt: { type: Date, default: Date.now },
});

WarmupBatchSchema.index({ sessionId: 1 }, { name: 'idx_session' });
WarmupBatchSchema.index({ userId: 1, createdAt: -1 }, { name: 'idx_user_createdAt' });

const WarmupBatch = mongoose.model<IWarmupBatch>('WarmupBatch', WarmupBatchSchema);
export default WarmupBatch;


