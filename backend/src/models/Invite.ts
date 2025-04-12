import mongoose, { Document, Schema } from 'mongoose';
import crypto from 'crypto';

export interface IInvite extends Document {
  inviterId: mongoose.Types.ObjectId;
  inviteCode: string;
  usedBy: mongoose.Types.ObjectId | null;
  usedAt: Date | null;
  createdAt: Date;
}

const InviteSchema: Schema = new Schema({
  inviterId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  inviteCode: {
    type: String,
    unique: true,
    default: () => crypto.randomBytes(4).toString('hex'),
  },
  usedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  usedAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Adding indexes for lookups
InviteSchema.index({ inviteCode: 1 });
InviteSchema.index({ inviterId: 1 });

export default mongoose.model<IInvite>('Invite', InviteSchema); 