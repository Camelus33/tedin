import mongoose, { Document, Schema } from 'mongoose';

// Interface for a user collection (folder) for Myverse games
type Visibility = 'private' | 'public' | 'group';
type CollectionType = '시험' | '학습' | '업무' | '일상' | 'custom';

export interface ICollection extends Document {
  name: string;
  owner: mongoose.Types.ObjectId;
  type: CollectionType;
  visibility: Visibility;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const CollectionSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['시험', '학습', '업무', '일상', 'custom'],
      default: 'custom'
    },
    visibility: {
      type: String,
      enum: ['private', 'public', 'group'],
      default: 'private'
    },
    description: { type: String, required: true, default: '' },
  },
  {
    timestamps: true,
    collection: 'collections'
  }
);

// === 인덱스 추가 ===
// getGamesByType 컨트롤러에서 사용되는 쿼리 최적화를 위해 복합 인덱스 추가
CollectionSchema.index({ owner: 1, type: 1 });

// Export model
const Collection = mongoose.model<ICollection>('Collection', CollectionSchema);
export default Collection; 