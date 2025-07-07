import mongoose, { Schema, Document } from 'mongoose';

export interface IBook extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  author: string;
  bookType: 'BOOK' | 'NOTEBOOK';
  totalPages: number;
  currentPage: number;
  isbn: string;
  coverImage: string;
  category: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'to_read' | 'reading' | 'on_hold' | 'dropped';
  completionPercentage: number;
  estimatedRemainingMinutes?: number | null;
  avgPpm?: number | null;
  readingPurpose?: 'exam_prep' | 'practical_knowledge' | 'humanities_self_reflection' | 'reading_pleasure' | null;
  purchaseLink?: string;
  pdfUrl?: string;
  pdfFileSize?: number;
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
    bookType: {
      type: String,
      enum: ['BOOK', 'NOTEBOOK'],
      default: 'BOOK',
    },
    totalPages: {
      type: Number,
      required: function() {
        return this.bookType === 'BOOK';
      },
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
      enum: ['not_started', 'in_progress', 'completed', 'to_read', 'reading', 'on_hold', 'dropped'],
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
    purchaseLink: {
      type: String,
      trim: true,
      default: ''
    },
    pdfUrl: {
      type: String,
      trim: true,
      default: null,
    },
    pdfFileSize: {
      type: Number,
      default: null,
      min: 0,
    }
  },
  { timestamps: true }
);

// Adding index for faster queries
BookSchema.index({ userId: 1, status: 1 });
BookSchema.index({ userId: 1, bookType: 1 }); // Index for filtering by book type
BookSchema.index({ title: 'text', author: 'text' }); // Text index for search

export default mongoose.model<IBook>('Book', BookSchema); 