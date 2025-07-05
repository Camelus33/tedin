import mongoose, { Document, Schema } from 'mongoose';

export interface INote extends Document {
  userId: mongoose.Types.ObjectId;
  bookId: mongoose.Types.ObjectId;
  type: 'quote' | 'thought' | 'question';
  content: string;
  tags: string[];
  createdAt: Date;
  clientCreatedAt?: Date;
  originSession?: mongoose.Types.ObjectId;
  importanceReason?: string;
  momentContext?: string;
  relatedKnowledge?: string;
  mentalImage?: string;
  relatedLinks?: Array<{
    type: 'book' | 'paper' | 'youtube' | 'media' | 'website';
    url: string;
    reason?: string;
  }>;
  inlineThreads?: mongoose.Types.ObjectId[];
}

const NoteSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  bookId: {
    type: Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  type: {
    type: String,
    enum: ['quote', 'thought', 'question'],
    required: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
  },
  tags: {
    type: [String],
    default: [],
  },
  originSession: {
    type: Schema.Types.ObjectId,
    ref: 'Session',
    default: null,
  },
  importanceReason: {
    type: String,
    trim: true,
    maxlength: 1000,
    default: '',
  },
  momentContext: {
    type: String,
    trim: true,
    maxlength: 1000,
    default: '',
  },
  relatedKnowledge: {
    type: String,
    trim: true,
    maxlength: 1000,
    default: '',
  },
  mentalImage: {
    type: String,
    trim: true,
    maxlength: 1000,
    default: '',
  },
  relatedLinks: {
    type: [
      {
        type: {
          type: String,
          enum: ['book', 'paper', 'youtube', 'media', 'website'],
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        reason: {
          type: String,
          trim: true,
          maxlength: 1000,
          default: '',
        },
      },
    ],
    default: [],
  },
  inlineThreads: {
    type: [{ type: Schema.Types.ObjectId, ref: 'InlineThread' }],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  clientCreatedAt: {
    type: Date,
    default: null,
  },
});

NoteSchema.index({ userId: 1, clientCreatedAt: -1 });
NoteSchema.index({ userId: 1, bookId: 1, clientCreatedAt: -1 });
NoteSchema.index({ userId: 1, bookId: 1 });
NoteSchema.index({ userId: 1, bookId: 1, originSession: 1 });
NoteSchema.index({ userId: 1, tags: 1 });
NoteSchema.index({ content: 'text' });

export default mongoose.model<INote>('Note', NoteSchema); 