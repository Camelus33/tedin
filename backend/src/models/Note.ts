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
  isPdfMemo?: boolean;
  pageNumber?: number;
  highlightedText?: string;
  highlightData?: {
    x: number;
    y: number;
    width: number;
    height: number;
    pageIndex: number;
  };
  selfRating?: number;
  conceptScore?: number; // AI가 계산한 개념이해도 점수 (0-100점)
  embedding?: number[]; // OpenAI 임베딩 벡터
  embeddingGeneratedAt?: Date; // 임베딩 생성 일시
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
  isPdfMemo: {
    type: Boolean,
    default: false,
  },
  pageNumber: {
    type: Number,
    default: null,
    min: 1,
  },
  highlightedText: {
    type: String,
    default: null,
    trim: true,
    maxlength: 2000,
  },
  highlightData: {
    type: {
      x: {
        type: Number,
        required: true,
        min: 0,
      },
      y: {
        type: Number,
        required: true,
        min: 0,
      },
      width: {
        type: Number,
        required: true,
        min: 0,
      },
      height: {
        type: Number,
        required: true,
        min: 0,
      },
      pageIndex: {
        type: Number,
        required: true,
        min: 0,
      },
    },
    default: null,
  },
  selfRating: {
    type: Number,
    default: null,
    min: 1,
    max: 5,
  },
  conceptScore: {
    type: Number,
    default: null,
    min: 0,
    max: 100,
  },
  embedding: {
    type: [Number],
    default: null,
  },
  embeddingGeneratedAt: {
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
NoteSchema.index({ userId: 1, bookId: 1, isPdfMemo: 1 });
NoteSchema.index({ userId: 1, bookId: 1, pageNumber: 1 });
NoteSchema.index({ isPdfMemo: 1, pageNumber: 1 });
// 개념이해도 점수 검색을 위한 인덱스 추가
NoteSchema.index({ userId: 1, conceptScore: -1 });
NoteSchema.index({ userId: 1, selfRating: -1, conceptScore: -1 });

export default mongoose.model<INote>('Note', NoteSchema); 