import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  nickname: string;
  invitedBy?: string;
  trialEndsAt: Date;
  roles: string[];
  createdAt: Date;
  preferences: {
    goals?: Array<'focus'|'memory'|'exam'>;
    memorySpanScore?: number;
    attentionScore?: number;
    recommendedZenGoLevels?: string[];
    recommendedTsDuration?: number;
    notificationTime?: string;
    communityInterest?: boolean;
  };
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  nickname: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 20,
  },
  invitedBy: {
    type: String,
    ref: 'User',
    default: null,
  },
  trialEndsAt: {
    type: Date,
    default: () => new Date(Date.now() + 33 * 24 * 60 * 60 * 1000), // 33 days from now
  },
  roles: {
    type: [String],
    default: ['user'],
    enum: ['user', 'admin'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  preferences: {
    type: Schema.Types.Mixed,
    default: {}
  },
});

// Pre-save hook to hash the password
UserSchema.pre<IUser>('save', async function (next) {
  if (this.isModified('passwordHash')) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
      next();
    } catch (error: any) {
      next(error);
    }
  } else {
    next();
  }
});

// Method to compare the given password with the stored hash
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export default mongoose.model<IUser>('User', UserSchema); 