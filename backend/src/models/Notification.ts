import mongoose, { Schema, Document, Types } from 'mongoose';

// Notification interface
export interface INotification extends Document {
  userId: Types.ObjectId;      // 수신자
  senderId: Types.ObjectId;    // 발신자
  gameId: Types.ObjectId;      // 관련 게임
  type: 'game_shared' | 'game_received';
  message: string;             // 표시할 텍스트
  isRead: boolean;             // 읽음 여부
  readAt?: Date | null;        // 읽음 시각
  createdAt: Date;             // 생성 시각
}

// Mongoose schema
const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    gameId: { type: Schema.Types.ObjectId, ref: 'MyverseGame', required: true },
    type: { type: String, enum: ['game_shared', 'game_received'], required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

// 인덱스 추가: 조회/카운트 성능 향상
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });

// Export model
const Notification = mongoose.model<INotification>('Notification', notificationSchema);
export default Notification; 