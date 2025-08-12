import mongoose, { Document, Schema } from 'mongoose';

export interface IJobLock extends Document {
  key: string;
  lockedUntil: Date;
  updatedAt: Date;
}

const JobLockSchema = new Schema<IJobLock>({
  key: { type: String, required: true, unique: true, index: true },
  lockedUntil: { type: Date, required: true },
  updatedAt: { type: Date, required: true, default: () => new Date() },
});

export default mongoose.models.JobLock || mongoose.model<IJobLock>('JobLock', JobLockSchema);


