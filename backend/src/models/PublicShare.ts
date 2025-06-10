import mongoose, { Document, Schema } from 'mongoose';

/**
 * @interface IPublicShare
 * @description 공개 공유 링크 정보를 담는 문서(Document)의 타입 인터페이스입니다.
 */
export interface IPublicShare extends Document {
  /**
   * @property {string} _id
   * - nanoid 등으로 생성된, 추측 불가능하고 고유한 문자열 ID입니다.
   *   URL의 일부가 되며, MongoDB의 기본 ObjectId를 사용하지 않습니다.
   */
  _id: string;
  /**
   * @property {mongoose.Types.ObjectId} summaryNoteId
   * - 공유된 원본 '단권화 노트(SummaryNote)'의 ID입니다.
   */
  summaryNoteId: mongoose.Types.ObjectId;
  /**
   * @property {mongoose.Types.ObjectId} userId
   * - 해당 공유 링크를 생성한 사용자의 ID입니다.
   */
  userId: mongoose.Types.ObjectId;
  /**
   * @property {Date} createdAt - 문서 생성 시각 (Mongoose Timestamps).
   */
  createdAt: Date;
  /**
   * @property {Date} updatedAt - 문서 마지막 수정 시각 (Mongoose Timestamps).
   */
  updatedAt: Date;
}

const publicShareSchema = new Schema<IPublicShare>({
  // Mongoose의 기본 _id 필드 대신 우리가 직접 제공하는 문자열 ID를 사용하도록 설정합니다.
  _id: { 
    type: String, 
    required: true,
  },
  summaryNoteId: { 
    type: Schema.Types.ObjectId, 
    ref: 'SummaryNote', 
    required: true,
    index: true, // summaryNoteId 기반 조회 성능 향상을 위해 인덱스 추가
  },
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true, // userId 기반 조회 성능 향상을 위해 인덱스 추가
  },
}, {
  // `createdAt`, `updatedAt` 필드를 자동으로 관리하도록 설정합니다.
  timestamps: true,
  // Mongoose가 기본적으로 `_id` 필드를 생성하는 것을 비활성화합니다.
  _id: false,
});

const PublicShare = mongoose.model<IPublicShare>('PublicShare', publicShareSchema);

export default PublicShare; 