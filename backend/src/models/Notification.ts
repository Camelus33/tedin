import mongoose, { Schema, Document, Types } from 'mongoose';

// Notification interface
export interface INotification extends Document {
  userId: Types.ObjectId;      // 수신자
  senderId: Types.ObjectId;    // 발신자
  gameId: Types.ObjectId;      // 관련 게임
  type: 'game_shared' | 'game_received';
  message: string;             // 표시할 텍스트
  isRead: boolean;             // 읽음 여부
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
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

// Export model
const Notification = mongoose.model<INotification>('Notification', notificationSchema);
export default Notification; 