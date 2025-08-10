import mongoose, { Document, Schema, Types } from 'mongoose';

export type ThoughtEventType =
  | 'create_note'
  | 'update_note'
  | 'add_inline_thread'
  | 'add_thought'
  | 'evolve_memo'
  | 'add_connection'
  | 'create_flashcard'
  | 'add_tag'
  | 'update_rating';

export interface IThoughtEvent extends Document {
  userId: Types.ObjectId;
  noteId?: Types.ObjectId;
  sessionId?: Types.ObjectId | null;
  type: ThoughtEventType;
  textPreview?: string; // 최대 200자 미만 권장
  tokenCountApprox?: number; // 선택적: 대략적 토큰 수
  embeddingId?: string | null; // 비동기 임베딩 파이프에서 채움
  createdAt: Date;
  clientCreatedAt?: Date | null;
  meta?: Record<string, any> | null; // 간단한 부가 정보
  hourBucket?: number | null; // 0..23 (UTC)
  weekday?: number | null; // 0..6 (UTC, 0=Sun)
}

const ThoughtEventSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    noteId: { type: Schema.Types.ObjectId, ref: 'Note', default: null, index: true },
    sessionId: { type: Schema.Types.ObjectId, ref: 'Session', default: null },
    type: {
      type: String,
      required: true,
      enum: [
        'create_note',
        'update_note',
        'add_inline_thread',
        'add_thought',
        'evolve_memo',
        'add_connection',
        'create_flashcard',
        'add_tag',
        'update_rating',
      ],
      index: true,
    },
    textPreview: { type: String, default: '', maxlength: 1000 },
    tokenCountApprox: { type: Number, default: null },
    embeddingId: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
    clientCreatedAt: { type: Date, default: null },
    meta: { type: Schema.Types.Mixed, default: null },
    hourBucket: { type: Number, default: null, index: true },
    weekday: { type: Number, default: null, index: true },
  },
  { minimize: true }
);

ThoughtEventSchema.index({ userId: 1, createdAt: -1 });
ThoughtEventSchema.index({ type: 1, createdAt: -1 });
ThoughtEventSchema.index({ userId: 1, hourBucket: 1, weekday: 1 });

export default mongoose.model<IThoughtEvent>('ThoughtEvent', ThoughtEventSchema);


