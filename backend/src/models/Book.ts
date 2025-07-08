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
  // 마지막으로 읽은 시각
  lastReadAt?: Date;
  readingPurpose?: 'exam_prep' | 'practical_knowledge' | 'humanities_self_reflection' | 'reading_pleasure' | null;
  purchaseLink?: string;
  // PDF 관련 필드 - 로컬 저장용
  hasLocalPdf?: boolean; // 로컬에 PDF가 저장되어 있는지 여부
  pdfFileName?: string; // 원본 파일명
  pdfFileSize?: number; // 파일 크기
  pdfFingerprint?: string; // 파일 무결성 체크용
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
    // 마지막 읽은 시각 (책을 읽을 때마다 갱신)
    lastReadAt: {
      type: Date,
    },
    readingPurpose: {
      type: String,
      enum: ['exam_prep', 'practical_knowledge', 'humanities_self_reflection', 'reading_pleasure'],
      default: null,
      required: false,
      validate: {
        validator: function(value: any) {
          // null이나 undefined는 허용
          if (value === null || value === undefined) {
            return true;
          }
          // 값이 있으면 enum 값 중 하나여야 함
          return ['exam_prep', 'practical_knowledge', 'humanities_self_reflection', 'reading_pleasure'].includes(value);
        },
        message: '{VALUE} is not a valid reading purpose'
      }
    },
    purchaseLink: {
      type: String,
      trim: true,
      default: ''
    },
    // PDF 관련 필드 - 로컬 저장용
    hasLocalPdf: {
      type: Boolean,
      default: false,
    },
    pdfFileName: {
      type: String,
      trim: true,
    },
    pdfFileSize: {
      type: Number,
      default: null,
      min: 0,
    },
    pdfFingerprint: {
      type: String,
      trim: true,
    }
  },
  { timestamps: true }
);

// Adding index for faster queries
BookSchema.index({ userId: 1, status: 1 });
BookSchema.index({ userId: 1, bookType: 1 }); // Index for filtering by book type
BookSchema.index({ title: 'text', author: 'text' }); // Text index for search
// 최근 읽은 시각으로 정렬할 때를 대비한 인덱스 (옵션)
BookSchema.index({ userId: 1, lastReadAt: -1 });

export default mongoose.model<IBook>('Book', BookSchema); 