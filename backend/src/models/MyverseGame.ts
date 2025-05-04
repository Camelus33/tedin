import mongoose, { Document, Schema } from 'mongoose';

// Interface defining a user-created Myverse game
export interface IMyverseGame extends Document {
  collectionId: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
  title: string;
  description: string;
  inputText: string;
  wordMappings: { word: string; coords: { x: number; y: number } }[];
  boardSize: 3 | 5 | 7;
  visibility: 'private' | 'public' | 'group';
  sharedWith: mongoose.Types.ObjectId[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Define the schema for MyverseGame
const MyverseGameSchema: Schema = new Schema(
  {
    collectionId: { type: Schema.Types.ObjectId, ref: 'Collection', required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, minlength: 10, maxlength: 300 },
    inputText: { type: String, required: true },
    tags: {
      type: [String],
      validate: [
        (arr: any[]) => !arr || arr.length <= 20,
        '태그는 최대 20개까지 입력할 수 있습니다.'
      ]
    },
    wordMappings: [
      {
        word: { type: String, required: true },
        coords: {
          x: { type: Number, required: true },
          y: { type: Number, required: true }
        },
        _id: false
      }
    ],
    boardSize: { type: Number, enum: [3, 5, 7], required: true },
    visibility: { type: String, enum: ['private', 'public', 'group'], default: 'private' },
    sharedWith: [{ type: Schema.Types.ObjectId, ref: 'User' }]
  },
  {
    timestamps: true
  }
);

// === 인덱스 추가 ===
MyverseGameSchema.index({ owner: 1 });
MyverseGameSchema.index({ sharedWith: 1 });
MyverseGameSchema.index({ collectionId: 1 });
// timestamps: true 옵션으로 createdAt, updatedAt 필드에 대한 인덱스는 자동으로 생성될 수 있으나,
// 명시적으로 정렬 성능을 위해 updatedAt 인덱스를 추가하는 것이 좋습니다.
MyverseGameSchema.index({ updatedAt: -1 }); // 기본 정렬 방향 고려하여 내림차순 인덱스 추가

// Create and export the model
const MyverseGame = mongoose.model<IMyverseGame>(
  'MyverseGame',
  MyverseGameSchema
);

export default MyverseGame; 