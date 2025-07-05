import mongoose, { Document, Schema } from 'mongoose';

export interface IInlineThread extends Document {
  content: string;
  authorId: mongoose.Types.ObjectId;
  authorName: string;
  createdAt: Date;
  clientCreatedAt?: Date;
  parentNoteId: mongoose.Types.ObjectId;
  depth?: number;
  isTemporary?: boolean;
}

const InlineThreadSchema: Schema = new Schema({
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
  },
  authorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  authorName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  clientCreatedAt: {
    type: Date,
    default: null,
  },
  parentNoteId: {
    type: Schema.Types.ObjectId,
    ref: 'Note',
    required: true,
  },
  depth: {
    type: Number,
    default: 0,
    min: 0,
    max: 10, // 최대 중첩 깊이 제한
  },
  isTemporary: {
    type: Boolean,
    default: false,
  },
});

// 인덱스 설정 - 성능 최적화
InlineThreadSchema.index({ parentNoteId: 1, createdAt: -1 });
InlineThreadSchema.index({ authorId: 1, createdAt: -1 });
InlineThreadSchema.index({ parentNoteId: 1, authorId: 1 });

export default mongoose.model<IInlineThread>('InlineThread', InlineThreadSchema); 