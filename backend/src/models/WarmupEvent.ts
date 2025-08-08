import mongoose, { Document, Schema, Types } from 'mongoose';

export type WarmupModeId = 'guided_breathing' | 'peripheral_vision' | 'text_flow';

export interface IWarmupEvent extends Document {
  userId: Types.ObjectId;
  sessionId: Types.ObjectId;
  mode: WarmupModeId;
  eventType: string;
  ts: Date;
  clientEventId: string; // idempotency key from client
  data: Record<string, any>;
  deviceSnapshotId?: Types.ObjectId; // optional ref to WarmupBatch _id
}

const WarmupEventSchema = new Schema<IWarmupEvent>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  sessionId: { type: Schema.Types.ObjectId, ref: 'Session', required: true, index: true },
  mode: { type: String, enum: ['guided_breathing', 'peripheral_vision', 'text_flow'], required: true },
  eventType: { type: String, required: true },
  ts: { type: Date, required: true, index: true },
  clientEventId: { type: String, required: true, unique: true },
  data: { type: Schema.Types.Mixed, required: true },
  deviceSnapshotId: { type: Schema.Types.ObjectId, ref: 'WarmupBatch' },
});

WarmupEventSchema.index({ sessionId: 1, eventType: 1, ts: 1 }, { name: 'idx_session_event_ts' });
WarmupEventSchema.index({ userId: 1, ts: -1 }, { name: 'idx_user_ts' });

const WarmupEvent = mongoose.model<IWarmupEvent>('WarmupEvent', WarmupEventSchema);
export default WarmupEvent;


