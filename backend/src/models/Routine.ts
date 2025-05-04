import mongoose, { Document, Schema, Types } from 'mongoose';

// Interface for the daily status object within the routine
export interface IDailyStatus {
  day: number; // Day number within the 33-day routine (1-33)
  tsExecuted: boolean; // Whether TS mode was executed on this day
  zengoCompleted: boolean; // Whether ZenGo training was completed on this day
}

// Interface for the Routine document
export interface IRoutine extends Document {
  userId: Types.ObjectId; // Reference to the User who owns this routine
  goal: string; // The specific goal for this 33-day routine
  startDate: Date; // The start date of the routine
  endDate: Date; // The end date of the routine (calculated as startDate + 33 days)
  dailyStatus: IDailyStatus[]; // Array tracking daily progress for TS and ZenGo
  isActive: boolean; // Indicates if this is the currently active routine for the user
  createdAt: Date;
  updatedAt: Date;
}

const routineSchema = new Schema<IRoutine>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // To efficiently find routines for a specific user
    },
    goal: {
      type: String,
      required: [true, 'Routine goal is required.'],
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    dailyStatus: [
      {
        day: { type: Number, required: true },
        tsExecuted: { type: Boolean, required: true, default: false },
        zengoCompleted: { type: Boolean, required: true, default: false },
        _id: false, // Do not create an _id for subdocuments in the array
      },
    ],
    isActive: {
      type: Boolean,
      required: true,
      default: true,
      index: true, // To efficiently find the active routine for a user
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
    collection: 'routines', // Explicitly set the collection name
  }
);

// Ensure a user can only have one active routine at a time
// Consider adding this index if strictly enforcing one active routine per user
// routineSchema.index({ userId: 1, isActive: 1 }, { unique: true, partialFilterExpression: { isActive: true } });

const Routine = mongoose.model<IRoutine>('Routine', routineSchema);

export default Routine; 