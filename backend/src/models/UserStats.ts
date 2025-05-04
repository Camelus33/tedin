import mongoose, { Document, Schema, Types } from 'mongoose';

// Interface for individual ZenGo play history entries
export interface IZengoPlayHistory {
  sessionId: Types.ObjectId; // Reference to the ZengoSessionResult
  playedAt: Date;
  score: number;
  level: string;
  language: string;
}

// Interface for the UserStats document
export interface IUserStats extends Document {
  userId: Types.ObjectId; // Reference to the User
  zengoPlayCount: number; // Total number of ZenGo games played
  zengoTotalScore: number; // Sum of scores from all ZenGo games
  zengoAvgScore: number; // Average score across all ZenGo games
  zengoLevelPlays: Map<string, number>; // Number of plays per level (e.g., {'3x3-easy': 10, '5x5-medium': 5})
  zengoPlayHistory: IZengoPlayHistory[]; // History of recent plays (consider limiting size)
  totalTsDurationSec: number; // Total duration of completed TS sessions in seconds
  badges: Types.ObjectId[]; // Array of earned Badge ObjectIds
  createdAt: Date;
  updatedAt: Date;
  // Add other stats fields as needed (e.g., TS stats, reading streaks)
}

const UserStatsSchema = new Schema<IUserStats>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // Each user should have only one stats document
      index: true,
    },
    zengoPlayCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    zengoTotalScore: {
      type: Number,
      default: 0,
    },
    zengoAvgScore: {
      type: Number,
      default: 0,
    },
    totalTsDurationSec: {
      type: Number,
      default: 0,
      min: 0,
    },
    zengoLevelPlays: {
      type: Map,
      of: Number,
      default: {},
    },
    zengoPlayHistory: [
      {
        sessionId: { type: Schema.Types.ObjectId, ref: 'ZengoSessionResult' },
        playedAt: { type: Date, required: true },
        score: { type: Number, required: true },
        level: { type: String, required: true },
        language: { type: String, required: true },
        _id: false,
      },
    ],
    badges: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Badge',
      },
    ],
    // Define default values or structures for other potential stats here
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
    collection: 'userstats', // Explicitly set the collection name
  }
);

// Optional: Limit the size of the zengoPlayHistory array
// UserStatsSchema.pre('save', function(next) {
//   const historyLimit = 50; // Keep the last 50 play records
//   if (this.zengoPlayHistory.length > historyLimit) {
//     this.zengoPlayHistory = this.zengoPlayHistory.slice(-historyLimit);
//   }
//   next();
// });

const UserStats = mongoose.model<IUserStats>('UserStats', UserStatsSchema);

export default UserStats; 