import mongoose, { Document, Schema, Types } from 'mongoose';

// Interface defining the structure of a Zengo session result document
export interface IZengoSessionResult extends Document {
  userId: Types.ObjectId; // Reference to the User who played
  contentId: Types.ObjectId; // Reference to the ZengoProverbContent used
  level: string; // Level identifier (e.g., "3x3-easy")
  language: string; // Language used (e.g., "ko")
  usedStonesCount: number; // Number of stones placed by the user
  correctPlacements: number; // Count of correctly placed stones
  incorrectPlacements: number; // Count of incorrectly placed stones
  timeTakenMs: number; // Time taken to complete the session in milliseconds
  completedSuccessfully: boolean; // Whether the user successfully completed the proverb
  resultType?: string; // Result type: EXCELLENT, SUCCESS, or FAIL
  score: number; // Calculated score for the session
  earnedBadgeIds?: Types.ObjectId[]; // Optional: IDs of badges earned during this session
  orderCorrect?: boolean; // Whether the placement order was correct
  placementOrder?: number[]; // The order in which stones were placed
  createdAt: Date; // Timestamp of session completion
}

// Mongoose Schema definition for ZengoSessionResult
const ZengoSessionResultSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Reference to the User model
      required: true,
      index: true,
    },
    contentId: {
      type: Schema.Types.ObjectId,
      ref: 'ZengoProverbContent', // Reference to the content model
      required: true,
      index: true,
    },
    level: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
      enum: ['ko', 'en', 'zh', 'ja'], // Ensure consistency
    },
    usedStonesCount: {
      type: Number,
      required: true,
      min: 0,
    },
    correctPlacements: {
      type: Number,
      required: true,
      min: 0,
    },
    incorrectPlacements: {
      type: Number,
      required: true,
      min: 0,
    },
    timeTakenMs: {
      type: Number,
      required: true,
      min: 0,
    },
    completedSuccessfully: {
      type: Boolean,
      required: true,
    },
    resultType: {
      type: String,
      enum: ['EXCELLENT', 'SUCCESS', 'FAIL'],
      default: 'FAIL'
    },
    score: {
      type: Number,
      required: true,
      min: 0,
    },
    earnedBadgeIds: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Badge' // Optional: Reference to a Badge model if exists
        }
    ],
    orderCorrect: {
      type: Boolean,
      default: false
    },
    placementOrder: {
      type: [Number],
      default: []
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only add createdAt automatically
    collection: 'zengoSessionResults' // Optional: Explicitly set collection name
  }
);

// Create and export the Mongoose model
const ZengoSessionResult = mongoose.model<IZengoSessionResult>(
  'ZengoSessionResult',
  ZengoSessionResultSchema
);

export default ZengoSessionResult; 