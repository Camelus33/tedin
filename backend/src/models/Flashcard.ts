import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IFlashcard extends Document {
  userId: Types.ObjectId;
  bookId: Types.ObjectId;
  tsSessionId?: Types.ObjectId;
  memoId?: Types.ObjectId;
  sourceText: string;
  question: string;
  answer: string;
  pageStart?: number;
  pageEnd?: number;
  tags?: string[];
  srsState: {
    nextReview: Date;
    interval: number;
    ease: number;
    repetitions: number;
    lastResult: 'easy' | 'hard' | 'fail' | null;
  };
  createdAt: Date;
  updatedAt: Date;
}

const SRSStateSchema = new Schema({
  nextReview: { type: Date, default: Date.now },
  interval: { type: Number, default: 1 }, // days
  ease: { type: Number, default: 2.5 },
  repetitions: { type: Number, default: 0 },
  lastResult: { type: String, enum: ['easy', 'hard', 'fail', null], default: null },
}, { _id: false });

const FlashcardSchema = new Schema<IFlashcard>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true, index: true },
  tsSessionId: { type: Schema.Types.ObjectId, ref: 'Session' },
  memoId: { type: Schema.Types.ObjectId, ref: 'Note' },
  sourceText: { type: String, required: true },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  pageStart: { type: Number },
  pageEnd: { type: Number },
  tags: [{ type: String }],
  srsState: { type: SRSStateSchema, required: true, default: () => ({}) },
}, {
  timestamps: true,
  collection: 'flashcards',
});

const Flashcard = mongoose.model<IFlashcard>('Flashcard', FlashcardSchema);

// 인덱스 최적화
// - 사용자/메모 단위로 nextReview 조회 및 무효화 가속
FlashcardSchema.index({ userId: 1, memoId: 1, 'srsState.nextReview': 1 });
FlashcardSchema.index({ userId: 1, memoId: 1, updatedAt: -1 });
export default Flashcard; 