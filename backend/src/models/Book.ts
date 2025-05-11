import mongoose, { Schema, Document } from 'mongoose';

export interface IBook extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  author: string;
  totalPages: number;
  currentPage: number;
  isbn: string;
  coverImage: string;
  category: string;
  status: 'not_started' | 'in_progress' | 'completed';
  completionPercentage: number;
  estimatedRemainingMinutes?: number | null;
  avgPpm?: number | null;
  readingPurpose?: 'exam_prep' | 'practical_knowledge' | 'humanities_self_reflection' | 'reading_pleasure' | null;
  createdAt: Date;
  updatedAt: Date;
}

const BookSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    totalPages: {
      type: Number,
      required: true,
      min: 1,
    },
    currentPage: {
      type: Number,
      default: 0,
      min: 0,
    },
    isbn: {
      type: String,
      trim: true,
    },
    coverImage: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed'],
      default: 'not_started',
    },
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    estimatedRemainingMinutes: {
      type: Number,
      default: null,
    },
    avgPpm: {
      type: Number,
      default: null,
    },
    readingPurpose: {
      type: String,
      enum: ['exam_prep', 'practical_knowledge', 'humanities_self_reflection', 'reading_pleasure'],
      default: null,
    },
  },
  { timestamps: true }
);

// Adding index for faster queries
BookSchema.index({ userId: 1, status: 1 });
BookSchema.index({ title: 'text', author: 'text' }); // Text index for search

export default mongoose.model<IBook>('Book', BookSchema); 