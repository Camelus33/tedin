import mongoose, { Document, Schema, Types } from 'mongoose';

// Interface defining the structure of a MyVerse session result
export interface IMyVerseSessionResult extends Document {
  userId: Types.ObjectId;
  myVerseGameId: Types.ObjectId; // Reference to the specific MyVerse game played
  collectionId: Types.ObjectId; // Reference to the collection the game belongs to
  level: string; // Could be derived from boardSize, e.g., "5x5-myverse"
  language: string; // Language of the game (e.g., 'ko')
  usedStonesCount: number;
  correctPlacements: number;
  incorrectPlacements: number;
  timeTakenMs: number;
  completedSuccessfully: boolean;
  resultType: 'EXCELLENT' | 'SUCCESS' | 'FAIL'; // Result category
  score: number;
  // optional, for deeper analytics
  orderCorrect?: boolean;
  placementOrder?: number[];
  boardSize?: number;
  detailedMetrics?: any;
  createdAt: Date;
  updatedAt: Date;
}

// Define the schema for MyVerseSessionResult
const MyVerseSessionResultSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    myVerseGameId: { type: Schema.Types.ObjectId, ref: 'MyverseGame', required: true, index: true },
    collectionId: { type: Schema.Types.ObjectId, ref: 'Collection', required: true, index: true },
    level: { type: String, required: true },
    language: { type: String, required: true, default: 'ko' },
    usedStonesCount: { type: Number, required: true },
    correctPlacements: { type: Number, required: true },
    incorrectPlacements: { type: Number, required: true },
    timeTakenMs: { type: Number, required: true },
    completedSuccessfully: { type: Boolean, required: true },
    resultType: { type: String, enum: ['EXCELLENT', 'SUCCESS', 'FAIL'], required: true },
    score: { type: Number, required: true, index: true },
    orderCorrect: { type: Boolean, required: false },
    placementOrder: { type: [Number], required: false, default: undefined },
    boardSize: { type: Number, enum: [3,5,7], required: false },
    detailedMetrics: { type: Schema.Types.Mixed, required: false },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Create and export the MyVerseSessionResult model
const MyVerseSessionResult = mongoose.model<IMyVerseSessionResult>(
  'MyVerseSessionResult',
  MyVerseSessionResultSchema
);

export default MyVerseSessionResult; 